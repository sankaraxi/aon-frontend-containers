import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faPlus,
  faPlay,
  faTrash,
  faChevronDown,
  faChevronUp,
  faServer,
  faCheckCircle,
  faCircle,
  faSpinner,
  faTimes,
  faSave,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Sidebarcomp from "../sidenav";

const API = import.meta.env.VITE_BACKEND_API_URL;

const STATUS_BADGE = {
  draft: "bg-secondary",
  active: "bg-success",
  completed: "bg-primary",
  deprovisioned: "bg-warning text-dark",
};

function AssessmentBatches() {
  const [batches, setBatches] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [batchDetail, setBatchDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    batch_name: "",
    client_id: "",
    estimated_users: "",
    containers_per_server: "3",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Provisioning state per batch
  const [provisioning, setProvisioning] = useState({});
  const [provisionResult, setProvisionResult] = useState({});

  // Deprovisioning state
  const [deprovisioning, setDeprovisioning] = useState({});

  const estimatedUsers = Number(form.estimated_users);
  const containersPerServer = Number(form.containers_per_server);
  const requiredServers =
    estimatedUsers > 0 && containersPerServer > 0
      ? Math.ceil(estimatedUsers / containersPerServer)
      : 0;

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API}/assessment-batches`);
      setBatches(res.data);
    } catch (err) {
      console.error("Error fetching batches:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API}/businesses`);
      // Flatten clients from all businesses
      const allClients = [];
      for (const biz of res.data) {
        try {
          const detail = await axios.get(`${API}/businesses/${biz.business_id}`);
          (detail.data.clients || []).forEach((c) =>
            allClients.push({ ...c, business_name: biz.business_name })
          );
        } catch {
          // ignore
        }
      }
      setClients(allClients);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchClients();
  }, []);

  const toggleExpand = async (batchId) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
      setBatchDetail(null);
      return;
    }
    setExpandedBatch(batchId);
    setBatchDetail(null);
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API}/assessment-batches/${batchId}`);
      setBatchDetail(res.data);
    } catch (err) {
      console.error("Error loading batch detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateBatch = async () => {
    setFormError(null);
    if (!form.batch_name.trim() || !form.client_id || !form.estimated_users || !form.containers_per_server) {
      setFormError("All fields are required.");
      return;
    }
    if (Number(form.estimated_users) < 1) {
      setFormError("Estimated users must be at least 1.");
      return;
    }
    if (Number(form.containers_per_server) < 1) {
      setFormError("Containers per server must be at least 1.");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/assessment-batches`, {
        batch_name: form.batch_name.trim(),
        client_id: Number(form.client_id),
        estimated_users: Number(form.estimated_users),
        containers_per_server: Number(form.containers_per_server),
      });
      setShowForm(false);
      setForm({ batch_name: "", client_id: "", estimated_users: "", containers_per_server: "3" });
      fetchBatches();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create batch.");
    } finally {
      setSaving(false);
    }
  };

  const handleProvision = async (batchId) => {
    if (
      !window.confirm(
        "Provision containers for this batch?\n\nThis will reserve port slots in order and assign questions from the client's question pool."
      )
    )
      return;

    setProvisioning((p) => ({ ...p, [batchId]: true }));
    setProvisionResult((r) => ({ ...r, [batchId]: null }));

    try {
      const res = await axios.post(`${API}/assessment-batches/${batchId}/provision`);
      setProvisionResult((r) => ({
        ...r,
        [batchId]: { type: "success", msg: `✅ ${res.data.containers_created} containers provisioned for test "${res.data.test_name}"` },
      }));
      fetchBatches();
      // Refresh detail if open
      if (expandedBatch === batchId) {
        const detail = await axios.get(`${API}/assessment-batches/${batchId}`);
        setBatchDetail(detail.data);
      }
    } catch (err) {
      setProvisionResult((r) => ({
        ...r,
        [batchId]: {
          type: "danger",
          msg: err.response?.data?.message || err.response?.data?.error || "Failed to provision containers.",
        },
      }));
    } finally {
      setProvisioning((p) => ({ ...p, [batchId]: false }));
    }
  };

  const handleDeprovision = async (batchId, batchName) => {
    if (
      !window.confirm(
        `Deprovision ALL containers for "${batchName}"?\n\nThis will release ALL port slots (including assigned ones) and stop all Docker containers on their assigned servers. The batch will be marked as Deprovisioned. This cannot be undone.`
      )
    )
      return;

    setDeprovisioning((d) => ({ ...d, [batchId]: true }));
    try {
      const res = await axios.delete(`${API}/assessment-batches/${batchId}/containers`);
      fetchBatches();
      // Refresh container detail if expanded — keep rows visible with updated status
      if (expandedBatch === batchId) {
        const detail = await axios.get(`${API}/assessment-batches/${batchId}`);
        setBatchDetail(detail.data);
      }
      setProvisionResult((r) => ({
        ...r,
        [batchId]: { type: "warning", msg: `⚠️ ${res.data.deprovisioned_count} containers deprovisioned — port slots released and Docker containers stopped.` },
      }));
    } catch (err) {
      setProvisionResult((r) => ({
        ...r,
        [batchId]: {
          type: "danger",
          msg: err.response?.data?.error || "Failed to deprovision.",
        },
      }));
    } finally {
      setDeprovisioning((d) => ({ ...d, [batchId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebarcomp />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      <Sidebarcomp />
      <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="mb-0 fw-bold">
            <FontAwesomeIcon icon={faLayerGroup} className="me-2" style={{ color: "#6366f1" }} />
            Assessment Batches
          </h3>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setFormError(null);
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            New Batch
          </button>
        </div>

        {/* Create Batch Form */}
        {showForm && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderLeft: "4px solid #6366f1" }}>
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">
                <FontAwesomeIcon icon={faPlus} className="me-2 text-primary" />
                Create New Assessment Batch
              </h6>
              <button
                className="btn btn-sm btn-link text-muted"
                onClick={() => setShowForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="card-body">
              {formError && (
                <div className="alert alert-danger py-2 px-3 small mb-3">{formError}</div>
              )}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Batch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. April 2026 Batch"
                    value={form.batch_name}
                    onChange={(e) => setForm((f) => ({ ...f, batch_name: e.target.value }))}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Client</label>
                  <select
                    className="form-select"
                    value={form.client_id}
                    onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                  >
                    <option value="">— Select Client —</option>
                    {clients.map((c) => (
                      <option key={c.client_id} value={c.client_id}>
                        {c.client_name} ({c.business_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Estimated Users</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    placeholder="50"
                    value={form.estimated_users}
                    onChange={(e) => setForm((f) => ({ ...f, estimated_users: e.target.value }))}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">Containers / Server</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    placeholder="3"
                    value={form.containers_per_server}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, containers_per_server: e.target.value }))
                    }
                  />
                  <div className="form-text small">
                    {requiredServers > 0
                      ? `${requiredServers} server${requiredServers > 1 ? "s" : ""} required for ${estimatedUsers} users.`
                      : "Enter users and capacity to calculate required servers."}
                  </div>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleCreateBatch}
                    disabled={saving}
                  >
                    {saving ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                    ) : (
                      <FontAwesomeIcon icon={faSave} className="me-1" />
                    )}
                    {saving ? "Saving..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batches Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {batches.length === 0 ? (
              <div className="text-center text-muted py-5">
                <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: 40, opacity: 0.3 }} />
                <p className="mt-3 mb-0">No assessment batches yet. Click "New Batch" to get started.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 40 }}></th>
                      <th>Batch Name</th>
                      <th>Client</th>
                      <th>Business</th>
                      <th className="text-center">Est. Users</th>
                      <th className="text-center">Containers</th>
                      <th className="text-center">Assigned</th>
                      <th className="text-center">Available</th>
                      <th className="text-center">Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <React.Fragment key={batch.id}>
                        <tr>
                          <td>
                            <button
                              className="btn btn-sm btn-link p-0 text-muted"
                              onClick={() => toggleExpand(batch.id)}
                              title="View containers"
                            >
                              <FontAwesomeIcon
                                icon={expandedBatch === batch.id ? faChevronUp : faChevronDown}
                              />
                            </button>
                          </td>
                          <td className="fw-semibold">{batch.batch_name}</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {batch.client_name || `Client #${batch.client_id}`}
                            </span>
                            {batch.client_code && (
                              <small className="text-muted ms-1">({batch.client_code})</small>
                            )}
                          </td>
                          <td className="text-muted small">{batch.business_name || "—"}</td>
                          <td className="text-center">{batch.estimated_users}</td>
                          <td className="text-center fw-semibold">{batch.total_containers || 0}</td>
                          <td className="text-center">
                            <span className="text-danger fw-semibold">
                              {batch.assigned_containers || 0}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="text-success fw-semibold">
                              {batch.available_containers || 0}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${STATUS_BADGE[batch.status] || "bg-secondary"}`}>
                              {batch.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              {/* Provision */}
                              {batch.status === "draft" && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleProvision(batch.id)}
                                  disabled={!!provisioning[batch.id]}
                                  title="Provision containers"
                                >
                                  {provisioning[batch.id] ? (
                                    <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                                  ) : (
                                    <FontAwesomeIcon icon={faPlay} className="me-1" />
                                  )}
                                  {provisioning[batch.id] ? "Provisioning..." : "Provision"}
                                </button>
                              )}

                              {/* Re-provision if active */}
                              {batch.status === "active" && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleProvision(batch.id)}
                                  disabled={!!provisioning[batch.id]}
                                  title="Already provisioned — this will fail unless containers are cleared first"
                                >
                                  {provisioning[batch.id] ? (
                                    <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                                  ) : (
                                    <FontAwesomeIcon icon={faPlay} className="me-1" />
                                  )}
                                  Re-Provision
                                </button>
                              )}

                              {/* Deprovision */}
                              {(batch.total_containers || 0) > 0 && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeprovision(batch.id, batch.batch_name)}
                                  disabled={!!deprovisioning[batch.id]}
                                  title="Release unassigned containers"
                                >
                                  {deprovisioning[batch.id] ? (
                                    <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                                  ) : (
                                    <FontAwesomeIcon icon={faTrash} className="me-1" />
                                  )}
                                  {deprovisioning[batch.id] ? "Clearing..." : "Deprovision"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Provision result message */}
                        {provisionResult[batch.id] && (
                          <tr>
                            <td colSpan="10" className="p-0">
                              <div
                                className={`alert alert-${provisionResult[batch.id].type} mb-0 py-2 px-3 small rounded-0`}
                                style={{ borderRadius: 0 }}
                              >
                                {provisionResult[batch.id].msg}
                                <button
                                  type="button"
                                  className="btn-close btn-sm float-end"
                                  style={{ fontSize: 10 }}
                                  onClick={() =>
                                    setProvisionResult((r) => ({ ...r, [batch.id]: null }))
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Expanded container detail */}
                        {expandedBatch === batch.id && (
                          <tr>
                            <td colSpan="10" className="p-0">
                              <div
                                style={{
                                  background: "#f0f4ff",
                                  borderTop: "2px solid #6366f1",
                                  padding: "16px 24px",
                                }}
                              >
                                <h6 className="fw-semibold mb-3">
                                  <FontAwesomeIcon icon={faServer} className="me-2 text-primary" />
                                  Containers — {batch.batch_name}
                                </h6>

                                {detailLoading ? (
                                  <div className="text-center py-3">
                                    <FontAwesomeIcon icon={faSpinner} spin className="text-primary" />
                                    <span className="ms-2 text-muted small">Loading containers...</span>
                                  </div>
                                ) : batchDetail && batchDetail.containers?.length > 0 ? (
                                  <div className="table-responsive">
                                    <table className="table table-sm table-bordered bg-white mb-0">
                                      <thead className="table-light">
                                        <tr>
                                          <th>#</th>
                                          <th>Question</th>
                                          <th>Server</th>
                                          <th>Docker Port</th>
                                          <th>Output Port</th>
                                          <th>Port Slot ID</th>
                                          <th>Test ID</th>
                                          <th>Container ID</th>
                                          <th className="text-center">Status</th>
                                          <th>Assigned To</th>
                                          <th>Assigned At</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {batchDetail.containers.map((c, idx) => (
                                          <tr key={c.id}>
                                            <td className="text-muted small">{idx + 1}</td>
                                            <td>
                                              <span className="badge bg-info text-dark">
                                                {c.question_id}
                                              </span>
                                            </td>
                                            <td className="text-muted small">Server {c.container_server_number || 1}</td>
                                            <td className="font-monospace small">{c.docker_port}</td>
                                            <td className="font-monospace small">{c.output_port}</td>
                                            <td className="text-muted small">{c.port_slot_id}</td>
                                            <td className="text-muted small">{c.test_id}</td>
                                            <td className="font-monospace small text-info">{c.container_identifier || "—"}</td>
                                            <td className="text-center">
                                              {c.is_deprovisioned ? (
                                                <span className="badge bg-secondary">Deprovisioned</span>
                                              ) : c.is_assigned ? (
                                                <span className="badge bg-danger">
                                                  <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                                  Assigned
                                                </span>
                                              ) : (
                                                <span className="badge bg-success">
                                                  <FontAwesomeIcon icon={faCircle} className="me-1" />
                                                  Free
                                                </span>
                                              )}
                                            </td>
                                            <td className="small text-muted">
                                              {c.aon_id || "—"}
                                            </td>
                                            <td className="small text-muted">
                                              {c.assigned_at
                                                ? new Date(c.assigned_at).toLocaleString()
                                                : "—"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : batchDetail ? (
                                  <div className="text-center text-muted py-3 small">
                                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                                    No containers yet. Click "Provision" to pre-allocate containers.
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Info box */}
        <div className="alert alert-info mt-4 small">
          <strong>How it works:</strong> Create a batch for a client, then click <strong>Provision</strong> to
          pre-allocate port slots and questions for <em>N</em> users in order. When a candidate from that
          client calls <code>/v2/external/assign</code>, they are automatically assigned the next free
          pre-allocated container instead of a random one.
        </div>
      </div>
    </div>
  );
}

export default AssessmentBatches;

import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faPlus,
  faPen,
  faTrash,
  faUsers,
  faChevronDown,
  faChevronUp,
  faClipboardList,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Sidebarcomp from "../sidenav";

const API = import.meta.env.VITE_BACKEND_API_URL;

function BusinessManagement() {
  const [businesses, setBusinesses] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [expandedBiz, setExpandedBiz] = useState(null);
  const [bizDetail, setBizDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add/Edit business form
  const [showForm, setShowForm] = useState(false);
  const [editingBiz, setEditingBiz] = useState(null);
  const [form, setForm] = useState({ business_name: "", business_code: "", description: "", subscription_limit: 0 });

  // Add client form
  const [showClientForm, setShowClientForm] = useState(null); // business_id
  const [clientForm, setClientForm] = useState({ client_name: "", client_code: "", description: "" });

  // Question assignment modal
  const [assignQuestionClient, setAssignQuestionClient] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(`${API}/businesses`);
      setBusinesses(res.data);
    } catch (err) {
      console.error("Error fetching businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API}/assessment-questions`);
      setAllQuestions(res.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchQuestions();
  }, []);

  const expandBusiness = async (bizId) => {
    if (expandedBiz === bizId) {
      setExpandedBiz(null);
      setBizDetail(null);
      return;
    }
    try {
      const res = await axios.get(`${API}/businesses/${bizId}`);
      setBizDetail(res.data);
      setExpandedBiz(bizId);
    } catch (err) {
      console.error("Error fetching business detail:", err);
    }
  };

  const handleSaveBusiness = async () => {
    try {
      if (editingBiz) {
        await axios.put(`${API}/businesses/${editingBiz.business_id}`, form);
      } else {
        await axios.post(`${API}/businesses`, form);
      }
      setShowForm(false);
      setEditingBiz(null);
      setForm({ business_name: "", business_code: "", description: "", subscription_limit: 0 });
      fetchBusinesses();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save business");
    }
  };

  const handleDeleteBusiness = async (bizId) => {
    if (!window.confirm("Delete this business? Clients will be unlinked.")) return;
    try {
      await axios.delete(`${API}/businesses/${bizId}`);
      fetchBusinesses();
      if (expandedBiz === bizId) {
        setExpandedBiz(null);
        setBizDetail(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete business");
    }
  };

  const handleAddClient = async (bizId) => {
    try {
      await axios.post(`${API}/clients-v2`, { ...clientForm, business_id: bizId });
      setShowClientForm(null);
      setClientForm({ client_name: "", client_code: "", description: "" });
      expandBusiness(bizId);
      fetchBusinesses();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create client");
    }
  };

  const handleDeleteClient = async (clientId, bizId) => {
    if (!window.confirm("Delete this client?")) return;
    try {
      await axios.delete(`${API}/clients/${clientId}`);
      expandBusiness(bizId);
      fetchBusinesses();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete client");
    }
  };

  const openQuestionAssignment = async (client) => {
    setAssignQuestionClient(client);
    try {
      const res = await axios.get(`${API}/client-questions/${client.client_id}`);
      setSelectedQuestions(res.data.map((q) => q.question_id));
    } catch {
      setSelectedQuestions([]);
    }
  };

  const handleSaveQuestions = async () => {
    try {
      await axios.post(`${API}/client-questions`, {
        client_id: assignQuestionClient.client_id,
        question_ids: selectedQuestions,
      });
      setAssignQuestionClient(null);
      if (expandedBiz) expandBusiness(expandedBiz);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to assign questions");
    }
  };

  const toggleQuestion = (qid) => {
    setSelectedQuestions((prev) =>
      prev.includes(qid) ? prev.filter((q) => q !== qid) : [...prev, qid]
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebarcomp />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      <Sidebarcomp />
      <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">
            <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
            Business Management
          </h3>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingBiz(null);
              setForm({ business_name: "", business_code: "", description: "", subscription_limit: 0 });
              setShowForm(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            Add Business
          </button>
        </div>

        {/* Add/Edit Business Form */}
        {showForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="mb-3">{editingBiz ? "Edit Business" : "New Business"}</h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Business Name *</label>
                  <input
                    className="form-control"
                    value={form.business_name}
                    onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Code *</label>
                  <input
                    className="form-control"
                    value={form.business_code}
                    onChange={(e) => setForm({ ...form, business_code: e.target.value })}
                    disabled={!!editingBiz}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Description</label>
                  <input
                    className="form-control"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Subscription Limit</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.subscription_limit}
                    onChange={(e) => setForm({ ...form, subscription_limit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-md-1 d-flex align-items-end gap-1">
                  <button className="btn btn-success btn-sm" onClick={handleSaveBusiness}>
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business List */}
        {businesses.map((biz) => (
          <div key={biz.business_id} className="card border-0 shadow-sm mb-3">
            <div
              className="card-header bg-white d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => expandBusiness(biz.business_id)}
            >
              <div>
                <h5 className="mb-0 d-inline">
                  <FontAwesomeIcon
                    icon={expandedBiz === biz.business_id ? faChevronUp : faChevronDown}
                    className="me-2 text-muted"
                    style={{ fontSize: 14 }}
                  />
                  {biz.business_name}
                </h5>
                <span className="badge bg-secondary ms-2">{biz.business_code}</span>
                <span className="badge bg-info ms-2">{biz.client_count || 0} clients</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <small className="text-muted">
                  Subscription: {biz.subscription_used || 0} / {biz.subscription_limit || "∞"}
                </small>
                <div onClick={(e) => e.stopPropagation()} className="d-flex gap-1">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      setEditingBiz(biz);
                      setForm({
                        business_name: biz.business_name,
                        business_code: biz.business_code,
                        description: biz.description || "",
                        subscription_limit: biz.subscription_limit || 0,
                      });
                      setShowForm(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteBusiness(biz.business_id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>

            {expandedBiz === biz.business_id && bizDetail && (
              <div className="card-body">
                {biz.description && <p className="text-muted mb-3">{biz.description}</p>}

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <FontAwesomeIcon icon={faUsers} className="me-2 text-info" />
                    Clients
                  </h6>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setShowClientForm(biz.business_id);
                      setClientForm({ client_name: "", client_code: "", description: "" });
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Add Client
                  </button>
                </div>

                {showClientForm === biz.business_id && (
                  <div className="border rounded p-3 mb-3 bg-light">
                    <div className="row g-2">
                      <div className="col-md-3">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Client Name *"
                          value={clientForm.client_name}
                          onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-2">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Code *"
                          value={clientForm.client_code}
                          onChange={(e) => setClientForm({ ...clientForm, client_code: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Description"
                          value={clientForm.description}
                          onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3 d-flex gap-1">
                        <button className="btn btn-success btn-sm" onClick={() => handleAddClient(biz.business_id)}>
                          <FontAwesomeIcon icon={faSave} className="me-1" />
                          Save
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowClientForm(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {bizDetail.clients && bizDetail.clients.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Client Name</th>
                          <th>Code</th>
                          <th>Questions Assigned</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bizDetail.clients.map((client) => (
                          <tr key={client.client_id}>
                            <td className="fw-semibold">{client.client_name}</td>
                            <td>
                              <span className="badge bg-secondary">{client.client_code}</span>
                            </td>
                            <td>
                              <span className="badge bg-primary">{client.question_count || 0}</span>
                            </td>
                            <td>
                              <button
                                className="btn btn-outline-info btn-sm me-1"
                                onClick={() => openQuestionAssignment(client)}
                                title="Assign Questions"
                              >
                                <FontAwesomeIcon icon={faClipboardList} />
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteClient(client.client_id, biz.business_id)}
                                title="Delete Client"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted text-center py-3">No clients yet for this business.</p>
                )}
              </div>
            )}
          </div>
        ))}

        {businesses.length === 0 && (
          <div className="text-center text-muted py-5">
            <FontAwesomeIcon icon={faBuilding} style={{ fontSize: 48 }} className="mb-3 text-secondary" />
            <p>No businesses created yet. Click "Add Business" to get started.</p>
          </div>
        )}

        {/* Question Assignment Modal */}
        {assignQuestionClient && (
          <div
            className="modal d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setAssignQuestionClient(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    Assign Questions to {assignQuestionClient.client_name}
                  </h5>
                  <button className="btn-close" onClick={() => setAssignQuestionClient(null)} />
                </div>
                <div className="modal-body">
                  {allQuestions.length === 0 ? (
                    <p className="text-muted">No assessment questions available.</p>
                  ) : (
                    allQuestions.map((q) => (
                      <div
                        key={q.question_id}
                        className={`d-flex align-items-center p-2 mb-2 rounded border ${
                          selectedQuestions.includes(q.question_id) ? "border-primary bg-primary bg-opacity-10" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleQuestion(q.question_id)}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={selectedQuestions.includes(q.question_id)}
                          onChange={() => toggleQuestion(q.question_id)}
                        />
                        <div>
                          <div className="fw-semibold">{q.question_id}</div>
                          <small className="text-muted">{q.question_name || q.description || ""}</small>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setAssignQuestionClient(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveQuestions}>
                    <FontAwesomeIcon icon={faSave} className="me-1" />
                    Save ({selectedQuestions.length} selected)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessManagement;

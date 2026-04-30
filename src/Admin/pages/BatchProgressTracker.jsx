import React, { useEffect, useState, useRef, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faArrowsRotate,
  faSearch,
  faCircle,
  faCheckCircle,
  faChartBar,
  faPlay,
  faMouse,
  faPaperPlane,
  faServer,
  faStop,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Sidebarcomp from "../sidenav";

const API = import.meta.env.VITE_BACKEND_API_URL;
const REFRESH_INTERVAL_MS = 15000;

// Stage metadata: icon, colour class, short label
const STAGE_META = {
  0: { label: "Not Started",                      color: "#9ca3af", bg: "#f3f4f6", icon: faCircle },
  1: { label: "Created Test Link",                color: "#6366f1", bg: "#eef2ff", icon: faLink },
  2: { label: "Assigned Docker Container",        color: "#0891b2", bg: "#ecfeff", icon: faServer },
  3: { label: "Read Guidelines",                  color: "#d97706", bg: "#fffbeb", icon: faPlay },
  4: { label: "Started Assessment",               color: "#ea580c", bg: "#fff7ed", icon: faPlay },
  5: { label: "Run Assessment Clicked",           color: "#7c3aed", bg: "#f5f3ff", icon: faMouse },
  6: { label: "Submitted",                        color: "#16a34a", bg: "#f0fdf4", icon: faCheckCircle },
  7: { label: "Results Sent to Webhook",          color: "#0369a1", bg: "#f0f9ff", icon: faPaperPlane },
  8: { label: "Docker Container Killed",          color: "#374151", bg: "#f9fafb", icon: faStop },
};

const TOTAL_STAGES = 8;

function StageBadge({ stage }) {
  const meta = STAGE_META[stage] || STAGE_META[0];
  return (
    <span
      className="badge rounded-pill px-2 py-1 small"
      style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}
    >
      <FontAwesomeIcon icon={meta.icon} className="me-1" style={{ fontSize: "0.65rem" }} />
      {stage > 0 ? `${stage}. ` : ""}{meta.label}
    </span>
  );
}

function ProgressBar({ stages }) {
  const maxStage = stages.length ? Math.max(...stages) : 0;
  const pct = Math.round((maxStage / TOTAL_STAGES) * 100);
  const meta = STAGE_META[maxStage] || STAGE_META[0];
  return (
    <div className="d-flex align-items-center gap-2" style={{ minWidth: 160 }}>
      <div className="progress flex-grow-1" style={{ height: 8, borderRadius: 4, minWidth: 100 }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${pct}%`, backgroundColor: meta.color, transition: "width 0.4s ease" }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="text-muted small" style={{ whiteSpace: "nowrap" }}>{pct}%</span>
    </div>
  );
}

function StagePip({ stageNum, achieved }) {
  const meta = STAGE_META[stageNum] || STAGE_META[0];
  return (
    <span
      title={`${stageNum}. ${meta.label}`}
      className="d-inline-block rounded-circle me-1"
      style={{
        width: 10,
        height: 10,
        backgroundColor: achieved ? meta.color : "#e5e7eb",
        border: achieved ? `2px solid ${meta.color}` : "2px solid #d1d5db",
        flexShrink: 0,
        cursor: "default",
      }}
    />
  );
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3 p-3">
        <div
          className="d-flex align-items-center justify-content-center rounded-3"
          style={{ width: 46, height: 46, backgroundColor: `${color}18`, flexShrink: 0 }}
        >
          <FontAwesomeIcon icon={icon} style={{ color, fontSize: "1.15rem" }} />
        </div>
        <div>
          <div className="fw-semibold fs-5 lh-1 mb-1">{value}</div>
          <div className="text-muted small">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function BatchProgressTracker() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [stageFilter, setStageFilter] = useState(0); // 0 = all
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Load batch list
  useEffect(() => {
    axios
      .get(`${API}/assessment-batches`)
      .then((res) => setBatches(res.data || []))
      .catch((err) => console.error("Error loading batches:", err))
      .finally(() => setBatchesLoading(false));
  }, []);

  const fetchProgress = useCallback(
    async (batchId, silent = false) => {
      if (!batchId) return;
      if (!silent) setLoading(true);
      try {
        const res = await axios.get(`${API}/superadmin/batch-progress/${batchId}`);
        setData(res.data);
        setLastRefreshed(new Date());
        setCountdown(REFRESH_INTERVAL_MS / 1000);
      } catch (err) {
        console.error("Error fetching progress:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  // When batch selection changes
  useEffect(() => {
    setData(null);
    setSearch("");
    setStageFilter(0);
    if (selectedBatchId) fetchProgress(selectedBatchId);
  }, [selectedBatchId, fetchProgress]);

  // Auto-refresh timer
  useEffect(() => {
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
    if (!selectedBatchId || !autoRefresh) return;

    intervalRef.current = setInterval(() => {
      fetchProgress(selectedBatchId, true);
    }, REFRESH_INTERVAL_MS);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL_MS / 1000 : c - 1));
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [selectedBatchId, autoRefresh, fetchProgress]);

  const filteredUsers = (data?.users || []).filter((u) => {
    const matchSearch =
      !search ||
      (u.aon_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.container_identifier || "").toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 0 || u.current_stage === stageFilter;
    return matchSearch && matchStage;
  });

  const { batch, summary, log_stage_labels } = data || {};

  const STATUS_COLOR = {
    draft: "#6b7280",
    active: "#16a34a",
    completed: "#2563eb",
    deprovisioned: "#d97706",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebarcomp />

      <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faChartBar} style={{ color: "#6366f1", fontSize: "1.4rem" }} />
            <div>
              <h4 className="mb-0 fw-bold">Batch Progress Tracker</h4>
              <p className="text-muted mb-0 small">Real-time candidate activity log per assessment batch</p>
            </div>
          </div>

          {/* Batch selector */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <select
              className="form-select form-select-sm"
              style={{ minWidth: 220 }}
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              disabled={batchesLoading}
            >
              <option value="">
                {batchesLoading ? "Loading batches..." : "-- Select a Batch --"}
              </option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_name} ({b.status})
                </option>
              ))}
            </select>

            {selectedBatchId && (
              <>
                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  onClick={() => fetchProgress(selectedBatchId)}
                  disabled={loading}
                  title="Refresh now"
                >
                  <FontAwesomeIcon icon={faArrowsRotate} spin={loading} />
                  Refresh
                </button>

                <button
                  className={`btn btn-sm ${autoRefresh ? "btn-success" : "btn-outline-secondary"} d-flex align-items-center gap-1`}
                  onClick={() => setAutoRefresh((v) => !v)}
                  title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
                >
                  <FontAwesomeIcon icon={faCircle} style={{ fontSize: "0.5rem" }} />
                  Auto {autoRefresh ? `(${countdown}s)` : "OFF"}
                </button>
              </>
            )}
          </div>
        </div>

        {!selectedBatchId && (
          <div className="card border-0 shadow-sm p-5 text-center text-muted">
            <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: "2.5rem", marginBottom: 12, color: "#d1d5db" }} />
            <p className="mb-0">Select a batch above to view real-time candidate progress.</p>
          </div>
        )}

        {selectedBatchId && loading && !data && (
          <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Batch info bar */}
            <div
              className="card border-0 shadow-sm mb-4 p-3 d-flex flex-row align-items-center gap-4 flex-wrap"
              style={{ background: "#fff" }}
            >
              <div>
                <span className="text-muted small d-block">Batch</span>
                <span className="fw-semibold">{batch?.batch_name}</span>
              </div>
              <div>
                <span className="text-muted small d-block">Client</span>
                <span className="fw-semibold">{batch?.client_name || "—"}</span>
              </div>
              <div>
                <span className="text-muted small d-block">Business</span>
                <span className="fw-semibold">{batch?.business_name || "—"}</span>
              </div>
              <div>
                <span className="text-muted small d-block">Status</span>
                <span
                  className="badge rounded-pill px-2"
                  style={{
                    backgroundColor: `${STATUS_COLOR[batch?.status] || "#6b7280"}18`,
                    color: STATUS_COLOR[batch?.status] || "#6b7280",
                    border: `1px solid ${STATUS_COLOR[batch?.status] || "#6b7280"}30`,
                  }}
                >
                  {batch?.status}
                </span>
              </div>
              {lastRefreshed && (
                <div className="ms-auto text-muted small">
                  Last updated: {lastRefreshed.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Summary cards */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <SummaryCard
                  icon={faLayerGroup}
                  label="Total Assigned"
                  value={summary?.total_assigned ?? 0}
                  color="#6366f1"
                />
              </div>
              <div className="col-6 col-md-3">
                <SummaryCard
                  icon={faMouse}
                  label="Run Assessment Clicks"
                  value={summary?.total_run_assessment_clicks ?? 0}
                  color="#7c3aed"
                />
              </div>
              <div className="col-6 col-md-3">
                <SummaryCard
                  icon={faCheckCircle}
                  label="Submitted"
                  value={summary?.stage_counts?.[6] ?? 0}
                  color="#16a34a"
                />
              </div>
              <div className="col-6 col-md-3">
                <SummaryCard
                  icon={faPaperPlane}
                  label="Webhook Delivered"
                  value={summary?.stage_counts?.[7] ?? 0}
                  color="#0369a1"
                />
              </div>
            </div>

            {/* Stage distribution mini-bar */}
            <div className="card border-0 shadow-sm mb-4 p-3">
              <div className="fw-semibold mb-3 small text-uppercase text-muted" style={{ letterSpacing: "0.05em" }}>
                Stage Distribution
              </div>
              <div className="d-flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
                  const count = summary?.stage_counts?.[s] ?? 0;
                  const meta = STAGE_META[s];
                  const total = summary?.total_assigned || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div
                      key={s}
                      className="d-flex flex-column align-items-center gap-1"
                      style={{ minWidth: 72, cursor: "pointer" }}
                      onClick={() => setStageFilter((f) => (f === s ? 0 : s))}
                      title={`Filter by stage ${s}`}
                    >
                      <div
                        className="rounded-3 d-flex flex-column align-items-center justify-content-end p-2"
                        style={{
                          width: 72,
                          height: 64,
                          backgroundColor: stageFilter === s ? meta.color : meta.bg,
                          border: `2px solid ${stageFilter === s ? meta.color : meta.color + "30"}`,
                          transition: "all 0.2s",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={meta.icon}
                          style={{ color: stageFilter === s ? "#fff" : meta.color, marginBottom: 2 }}
                        />
                        <div
                          className="fw-bold"
                          style={{ color: stageFilter === s ? "#fff" : meta.color, fontSize: "1rem" }}
                        >
                          {count}
                        </div>
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.65rem", textAlign: "center", maxWidth: 72 }}>
                        {s}. {meta.label.split(" ").slice(0, 2).join(" ")}
                      </div>
                      <div
                        className="rounded-pill"
                        style={{ height: 4, width: 72, backgroundColor: "#e5e7eb" }}
                      >
                        <div
                          className="rounded-pill"
                          style={{
                            height: 4,
                            width: `${pct}%`,
                            backgroundColor: meta.color,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {stageFilter > 0 && (
                  <button
                    className="btn btn-sm btn-link align-self-center text-muted"
                    onClick={() => setStageFilter(0)}
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>

            {/* Search + table */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom d-flex align-items-center gap-3 flex-wrap py-3">
                <div className="position-relative" style={{ flex: "1 1 220px", maxWidth: 320 }}>
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="position-absolute text-muted"
                    style={{ top: "50%", left: 10, transform: "translateY(-50%)", fontSize: "0.8rem" }}
                  />
                  <input
                    type="text"
                    className="form-control form-control-sm ps-4"
                    placeholder="Search by AON ID or container..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <span className="text-muted small ms-auto">
                  {filteredUsers.length} of {data.users.length} candidates
                  {stageFilter > 0 && (
                    <span className="ms-1 badge bg-secondary">Stage {stageFilter}</span>
                  )}
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover mb-0 small align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: 160 }}>AON ID</th>
                      <th style={{ minWidth: 100 }}>Container</th>
                      <th style={{ minWidth: 90 }}>Question</th>
                      <th style={{ minWidth: 180 }}>Current Stage</th>
                      <th style={{ minWidth: 180 }}>Progress</th>
                      <th style={{ minWidth: 100 }}>Stage Trail</th>
                      <th className="text-center" style={{ minWidth: 80 }}>Run Count</th>
                      <th style={{ minWidth: 140 }}>Assigned At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-4">
                          {data.users.length === 0
                            ? "No candidates assigned to this batch yet."
                            : "No results match your search or filter."}
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.aon_id}
                        style={{ opacity: user.is_deprovisioned ? 0.55 : 1 }}
                      >
                        <td className="fw-semibold" style={{ fontFamily: "monospace" }}>
                          {user.aon_id}
                          {user.is_deprovisioned === 1 && (
                            <span className="badge bg-warning text-dark ms-1 small">deprovisioned</span>
                          )}
                        </td>
                        <td style={{ fontFamily: "monospace", color: "#6b7280" }}>
                          {user.container_identifier || "—"}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {user.question_id || "—"}
                          </span>
                        </td>
                        <td>
                          <StageBadge stage={user.current_stage} />
                        </td>
                        <td>
                          <ProgressBar stages={user.stages} />
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <StagePip
                                key={s}
                                stageNum={s}
                                achieved={user.stages.includes(s)}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="text-center">
                          {user.run_assessment_count > 0 ? (
                            <span
                              className="badge rounded-pill"
                              style={{ backgroundColor: "#f5f3ff", color: "#7c3aed", border: "1px solid #7c3aed30" }}
                            >
                              {user.run_assessment_count}x
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="text-muted">
                          {user.assigned_at
                            ? new Date(user.assigned_at).toLocaleString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

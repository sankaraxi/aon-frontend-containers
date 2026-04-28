import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faUsers,
  faServer,
  faClipboardList,
  faChartBar,
  faPlus,
  faPen,
  faTrash,
  faEye,
  faCircle,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Sidebarcomp from "../sidenav";

const API = import.meta.env.VITE_BACKEND_API_URL;

function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API}/superadmin/dashboard`);
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error fetching superadmin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPortSlots = async () => {
    if (!window.confirm("Reset all port utilization? This will mark all ports as free.")) return;
    setResetting(true);
    setResetMsg(null);
    try {
      await axios.post(`${API}/port-slots/reset`);
      setResetMsg({ type: "success", text: "Port utilization reset successfully." });
      fetchDashboard();
    } catch {
      try {
        await axios.post(`${API}/slots/reset`);
        setResetMsg({ type: "success", text: "Port utilization reset successfully." });
        fetchDashboard();
      } catch {
        setResetMsg({ type: "danger", text: "Failed to reset port utilization." });
      }
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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

  const { businesses = [], port_slots = {}, questions = [], recent_assignments = [] } =
    dashboardData || {};

  const totalSubscriptionLimit = businesses.reduce((sum, b) => sum + (b.subscription_limit || 0), 0);
  const totalSubscriptionUsed = businesses.reduce((sum, b) => sum + (b.subscription_used || 0), 0);

  const summaryCards = [
    {
      title: "Total Businesses",
      value: businesses.length,
      icon: faBuilding,
      color: "#6366f1",
    },
    {
      title: "Total Clients",
      value: businesses.reduce((sum, b) => sum + (b.client_count || 0), 0),
      icon: faUsers,
      color: "#06b6d4",
    },
    {
      title: "Port Slots (Free / Total)",
      value: `${port_slots.free_slots || 0} / ${port_slots.total_slots || 0}`,
      icon: faServer,
      color: "#10b981",
    },
    {
      title: "Subscription (Used / Limit)",
      value: `${totalSubscriptionUsed} / ${totalSubscriptionLimit}`,
      icon: faChartBar,
      color: "#f59e0b",
    },
    {
      title: "Assessment Questions",
      value: questions.length,
      icon: faClipboardList,
      color: "#ef4444",
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      <Sidebarcomp />
      <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>
        <h3 className="mb-4 fw-bold">
          <FontAwesomeIcon icon={faChartBar} className="me-2" style={{ color: "#6366f1" }} />
          KG Genius Labs — SuperAdmin Dashboard
        </h3>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          {summaryCards.map((card, idx) => (
            <div key={idx} className="col-md-4 col-lg">
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderLeft: `4px solid ${card.color}` }}
              >
                <div className="card-body d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: card.color + "20",
                    }}
                  >
                    <FontAwesomeIcon icon={card.icon} style={{ color: card.color, fontSize: 20 }} />
                  </div>
                  <div>
                    <div className="text-muted small">{card.title}</div>
                    <div className="fw-bold fs-5">{card.value}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Businesses Overview */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
              Businesses & Subscriptions
            </h5>
            <a href="/admin/businesses" className="btn btn-sm btn-primary">
              <FontAwesomeIcon icon={faEye} className="me-1" />
              Manage
            </a>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Business</th>
                    <th>Code</th>
                    <th>Clients</th>
                    <th>Subscription Limit</th>
                    <th>Used</th>
                    <th>Remaining</th>
                    <th>Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((biz) => {
                    const remaining = (biz.subscription_limit || 0) - (biz.subscription_used || 0);
                    const pct =
                      biz.subscription_limit > 0
                        ? Math.round((biz.subscription_used / biz.subscription_limit) * 100)
                        : 0;
                    return (
                      <tr key={biz.business_id}>
                        <td className="fw-semibold">{biz.business_name}</td>
                        <td>
                          <span className="badge bg-secondary">{biz.business_code}</span>
                        </td>
                        <td>{biz.client_count || 0}</td>
                        <td>{biz.subscription_limit || "Unlimited"}</td>
                        <td>{biz.subscription_used || 0}</td>
                        <td>
                          <span className={remaining <= 0 && biz.subscription_limit > 0 ? "text-danger fw-bold" : ""}>
                            {biz.subscription_limit > 0 ? remaining : "∞"}
                          </span>
                        </td>
                        <td style={{ width: 160 }}>
                          <div className="progress" style={{ height: 8 }}>
                            <div
                              className={`progress-bar ${pct > 80 ? "bg-danger" : pct > 50 ? "bg-warning" : "bg-success"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <small className="text-muted">{pct}%</small>
                        </td>
                      </tr>
                    );
                  })}
                  {businesses.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No businesses yet. Click "Manage" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Port Slots Status */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faServer} className="me-2 text-success" />
                  Port Slots Status
                </h5>
                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={handleResetPortSlots}
                  disabled={resetting}
                  title="Reset all port utilization to free"
                >
                  <FontAwesomeIcon icon={faArrowsRotate} className={`me-1 ${resetting ? "fa-spin" : ""}`} />
                  {resetting ? "Resetting..." : "Reset Port Utilization"}
                </button>
              </div>
              <div className="card-body">
                {resetMsg && (
                  <div className={`alert alert-${resetMsg.type} py-1 px-2 mb-3 small`} role="alert">
                    {resetMsg.text}
                  </div>
                )}
                <div className="row text-center">
                  <div className="col-4">
                    <div className="fs-3 fw-bold text-primary">{port_slots.total_slots || 0}</div>
                    <div className="text-muted small">Total</div>
                  </div>
                  <div className="col-4">
                    <div className="fs-3 fw-bold text-success">{port_slots.free_slots || 0}</div>
                    <div className="text-muted small">Free</div>
                  </div>
                  <div className="col-4">
                    <div className="fs-3 fw-bold text-danger">{port_slots.utilized_slots || 0}</div>
                    <div className="text-muted small">In Use</div>
                  </div>
                </div>
                <div className="progress mt-3" style={{ height: 12 }}>
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: `${port_slots.total_slots > 0 ? (port_slots.utilized_slots / port_slots.total_slots) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faClipboardList} className="me-2 text-warning" />
                  Assessment Questions
                </h5>
              </div>
              <div className="card-body">
                {questions.map((q) => (
                  <div
                    key={q.question_id}
                    className="d-flex align-items-center mb-2 p-2 rounded"
                    style={{ backgroundColor: "#f1f5f9" }}
                  >
                    <FontAwesomeIcon icon={faCircle} className="me-2 text-success" style={{ fontSize: 8 }} />
                    <span className="fw-semibold me-2">{q.question_id}</span>
                    <span className="text-muted small">{q.question_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faClipboardList} className="me-2 text-info" />
              Recent Test Assignments
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>AON ID</th>
                    <th>Session</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Test Link</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="fw-semibold">{a.aon_id}</td>
                      <td>
                        <small className="text-muted">{a.session_id}</small>
                      </td>
                      <td>{a.client_name || a.client_id || "—"}</td>
                      <td>
                        <span
                          className={`badge ${
                            a.status === "Assigned"
                              ? "bg-info"
                              : a.status === "Completed"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <small className="text-truncate d-inline-block" style={{ maxWidth: 200 }}>
                          {a.test_link || "—"}
                        </small>
                      </td>
                    </tr>
                  ))}
                  {recent_assignments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-3">
                        No recent assignments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;

import React, { useEffect, useState } from "react";
import Sidebarcomp from "../sidenav";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBuilding, 
  faPlus, 
  faTrash, 
  faEdit, 
  faServer,
  faCheckCircle,
  faTimesCircle,
  faLink,
  faClipboardList,
  faSave
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL;

function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [portSlotStats, setPortSlotStats] = useState({ total: 0, utilized: 0, free: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState({
    client_name: "",
    client_code: "",
    description: "",
    business_id: ""
  });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [resettingSlots, setResettingSlots] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, bizRes, questionsRes, portStatsRes] = await Promise.all([
        axios.get(`${API}/clients`),
        axios.get(`${API}/businesses`),
        axios.get(`${API}/assessment-questions`),
        axios.get(`${API}/port-slots/stats`)
      ]);
      setClients(clientsRes.data);
      setBusinesses(bizRes.data);
      setAllQuestions(questionsRes.data);
      setPortSlotStats(portStatsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClient = async () => {
    if (!newClient.client_name || !newClient.client_code) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await axios.post(`${API}/clients-v2`, {
        ...newClient,
        business_id: newClient.business_id || null
      });
      setShowAddModal(false);
      setNewClient({ client_name: "", client_code: "", description: "", business_id: "" });
      fetchData();
      alert("Client added successfully!");
    } catch (error) {
      console.error("Error adding client:", error);
      alert(error.response?.data?.error || "Failed to add client");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm("Are you sure you want to delete this client? This will also remove all question assignments.")) {
      return;
    }
    try {
      await axios.delete(`${API}/clients/${clientId}`);
      fetchData();
      alert("Client deleted successfully!");
    } catch (error) {
      console.error("Error deleting client:", error);
      alert(error.response?.data?.error || "Failed to delete client");
    }
  };

  const handleOpenAssignModal = async (client) => {
    setSelectedClient(client);
    try {
      const res = await axios.get(`${API}/client-questions/${client.client_id}`);
      setSelectedQuestions(res.data.map(q => q.question_id));
    } catch {
      setSelectedQuestions([]);
    }
    setShowAssignModal(true);
  };

  const toggleQuestionSelection = (qid) => {
    setSelectedQuestions(prev => 
      prev.includes(qid) 
        ? prev.filter(id => id !== qid)
        : [...prev, qid]
    );
  };

  const handleSaveAssignments = async () => {
    try {
      await axios.post(`${API}/client-questions`, {
        client_id: selectedClient.client_id,
        question_ids: selectedQuestions
      });
      setShowAssignModal(false);
      setSelectedClient(null);
      setSelectedQuestions([]);
      fetchData();
      alert("Questions assigned successfully!");
    } catch (error) {
      console.error("Error assigning questions:", error);
      alert(error.response?.data?.error || "Failed to assign questions");
    }
  };

  const getBusinessName = (bizId) => {
    const biz = businesses.find(b => b.business_id === bizId);
    return biz ? biz.business_name : "—";
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebarcomp />

      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Client Management
          </h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add New Client
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Clients Table */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Registered Clients</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>S.No</th>
                        <th>Client Name</th>
                        <th>Client Code</th>
                        {/* <th>Business</th> */}
                        <th>Description</th>
                        <th>Questions Assigned</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.length > 0 ? (
                        clients.map((client, idx) => (
                          <tr key={client.client_id}>
                            <td>{idx + 1}</td>
                            <td>{client.client_name}</td>
                            <td>
                              <code className="bg-light px-2 py-1 rounded">
                                {client.client_code}
                              </code>
                            </td>
                            {/* <td>{getBusinessName(client.business_id)}</td> */}
                            <td>{client.description || "-"}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => handleOpenAssignModal(client)}
                                title="Assign Questions"
                              >
                                <FontAwesomeIcon icon={faClipboardList} className="me-1" />
                                Manage
                              </button>
                            </td>
                            <td>
                              {client.is_active ? (
                                <span className="badge bg-success">
                                  <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="badge bg-secondary">
                                  <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteClient(client.client_id)}
                                title="Delete Client"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">
                            No clients registered yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Port Slots Overview */}
            {/* <div className="card shadow-sm">
              <div className="card-header bg-secondary text-white d-flex align-items-center justify-content-between">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faServer} className="me-2" />
                  Port Slots Overview
                </h5>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={async () => {
                    if (!confirm("Reset all port slots to unused?")) return;
                    try {
                      setResettingSlots(true);
                      await axios.post(`${API}/port-slots/reset`);
                      alert("Reset all port slot utilizations.");
                      fetchData();
                    } catch (error) {
                      console.error("Error resetting slots:", error);
                      alert(error.response?.data?.error || "Failed to reset slots");
                    } finally {
                      setResettingSlots(false);
                    }
                  }}
                  disabled={resettingSlots}
                >
                  {resettingSlots ? "Resetting..." : "Reset Utilization"}
                </button>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-4">
                    <div className="fs-3 fw-bold text-primary">{portSlotStats.total || 0}</div>
                    <div className="text-muted">Total Port Slots</div>
                  </div>
                  <div className="col-md-4">
                    <div className="fs-3 fw-bold text-success">{portSlotStats.free || 0}</div>
                    <div className="text-muted">Free</div>
                  </div>
                  <div className="col-md-4">
                    <div className="fs-3 fw-bold text-danger">{portSlotStats.utilized || 0}</div>
                    <div className="text-muted">In Use</div>
                  </div>
                </div>
                <div className="progress mt-3" style={{ height: 10 }}>
                  <div 
                    className="progress-bar bg-danger" 
                    style={{ width: `${portSlotStats.total > 0 ? (portSlotStats.utilized / portSlotStats.total) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div> */}
          </>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Client</h5>
                  <button   
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Client Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClient.client_name}
                      onChange={(e) => setNewClient({...newClient, client_name: e.target.value})}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Client Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClient.client_code}
                      onChange={(e) => setNewClient({...newClient, client_code: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                      placeholder="e.g., ABC_CORP"
                    />
                    <small className="text-muted">
                      This code will be used in API calls to identify the client
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Business</label>
                    <select
                      className="form-select"
                      value={newClient.business_id}
                      onChange={(e) => setNewClient({...newClient, business_id: e.target.value})}
                    >
                      <option value="">-- No Business --</option>
                      {businesses.map(b => (
                        <option key={b.business_id} value={b.business_id}>{b.business_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={newClient.description}
                      onChange={(e) => setNewClient({...newClient, description: e.target.value})}
                      placeholder="Optional description"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleAddClient}
                  >
                    Add Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Questions Modal */}
        {showAssignModal && selectedClient && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    Assign Questions to: {selectedClient.client_name}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedClient(null);
                      setSelectedQuestions([]);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Select the assessment questions to assign to this client. 
                    During test assignment, a random question from these will be picked.
                  </p>                  {allQuestions.length === 0 ? (
                    <p className="text-muted">No assessment questions available.</p>
                  ) : (
                    allQuestions.map((q) => (
                      <div
                        key={q.question_id}
                        className={`d-flex align-items-center p-3 mb-2 rounded border ${
                          selectedQuestions.includes(q.question_id) ? "border-primary bg-primary bg-opacity-10" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleQuestionSelection(q.question_id)}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={selectedQuestions.includes(q.question_id)}
                          onChange={() => toggleQuestionSelection(q.question_id)}
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
                  <span className="me-auto text-muted">
                    {selectedQuestions.length} question(s) selected
                  </span>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedClient(null);
                      setSelectedQuestions([]);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleSaveAssignments}
                  >
                    <FontAwesomeIcon icon={faSave} className="me-1" />
                    Save Assignments
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

export default ClientManagement;

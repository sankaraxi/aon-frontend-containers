import React, { useState } from "react";
import Sidebarcomp from "../sidenav";
import axios from "axios";
function CreateTest() {
    const [formData, setFormData] = useState({
    test_name: "",
    description: "",
    duration: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/tests`, formData);
      alert("✅ Test created successfully!");
      setFormData({ test_name: "", description: "", duration: "", date: "", start_time: "", end_time: "" });
    } catch (error) {
      console.error(error);
      alert("❌ Error creating test");
    }
  };
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebarcomp />

      {/* Page Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2e2b5f, #312e81 45%, #0f172a)",
          color: "#f9fafb",
          fontSize: "1.25rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          margin: "0 24px",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.4)",
          padding: "64px 32px",
        }}
      >
        Access Restricted
      </div>
    </div>
    
  );
}

export default CreateTest;

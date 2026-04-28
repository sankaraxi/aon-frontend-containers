// src/Admin/AdminLayout.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebarcomp from "./sidenav";
import Dashboard from "./pages/Dashboard";
import CreateTest from "./pages/CreateTest";
import ViewTest from "./pages/ViewTest";

function AdminLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebarcomp />

      {/* Page Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        
      </div>
    </div>
  );
}

export default AdminLayout;

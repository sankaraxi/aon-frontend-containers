import React from "react";
import Sidebarcomp from "../sidenav";
function ViewTest() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebarcomp />

      {/* Page Content */}
      
      <div className="page-container">
      <h1>Create Test</h1>
      <p>Here you can create a new test.</p>
    </div>
    </div>
  );
}

export default ViewTest;

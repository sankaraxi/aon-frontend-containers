import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

const AssignUser = ({ testId, onSuccess }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("testId", testId);
    console.log(testId)

    const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/assign-users`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(data.message);
    const jsonString = JSON.stringify(data, null, 2); // formatted JSON
      const newWindow = window.open();
      newWindow.document.write(`<pre>${jsonString}</pre>`);
      newWindow.document.close();
    window.location.reload();
    // 🔹 refresh test details after success
    if (data.success && onSuccess) {
      onSuccess();
    }

    setFile(null); // reset file input
  };

  return (
    <div className="d-flex flex-column gap-2">
      <Form.Control
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <div className="d-flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          href="/excel-template/aon_template.xlsx"
          download
        >
          Download Template
        </Button>

        <Button variant="primary" size="sm" onClick={handleUpload}>
          Upload & Assign
        </Button>
      </div>
    </div>
  );
};

export default AssignUser;

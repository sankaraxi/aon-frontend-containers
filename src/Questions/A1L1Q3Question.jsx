import React from "react";

export default function A1L1Q03Question() {
  return (
     <div className="container mx-auto p-6 text-gray-900 font-sans leading-relaxed">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">QP Code: A1L1Q03</h1>

      <h2 className="text-xl font-semibold mb-2">Objective:</h2>
      <p className="mb-4">
        Design and implement a visually engaging <strong>Student Portfolio Card</strong> using <strong>HTML</strong>, <strong>CSS</strong>, and <strong>JavaScript</strong>.
        <br />
        The card should showcase a student's skillset with a clean layout. Users must be able to <strong>add/remove skills in real time</strong>.
        <br />
        Two buttons should be included:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Print Data:</strong> Displays all entered info on the right-side container.</li>
        <li><strong>Save Data:</strong> Stores the portfolio data in JSON format (download/log).</li>
      </ul>
      <p className="mb-4">
        A <strong>light/dark theme toggle</strong> must be provided in the top navigation for enhanced UX.
      </p>

      <img src="/level-three.png" />

      <h2 className="text-xl font-semibold mb-2">Expected Output:</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>A centered, responsive card on full-screen background</li>
        <li>Real-time skill management (add/remove)</li>
        <li><strong>Print Data</strong> and <strong>Save Data</strong> button functionality</li>
        <li>Light/Dark theme toggle with immediate update</li>
        <li>Semantic HTML, clean CSS, and optimized JS</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Layout and Style Requirements:</h2>
      <table className="w-full text-sm border border-gray-300 mb-6">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Area</th>
            <th className="border p-2">Selector</th>
            <th className="border p-2">CSS Property</th>
            <th className="border p-2">Expected Value</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Light Theme", ".light-theme", "color", "#000000"],
            ["Light Theme", ".light-theme", "background-color", "#ffffff"],
            ["Dark Theme", ".dark-theme", "color", "#f1f1f1"],
            ["Dark Theme", ".dark-theme", "background-color", "#1e1e1e"],
            ["Profile Card Width", ".flexarea", "Max-width", "400px"],
            ["Card Preview", ".preview-card", "opacity", "0.9"],
            ["Profile Card", ".profile-card", "border", "1px solid #ddd"],
            ["Header Section", ".header-section", "Background-color", "#6c3483"]
          ].map(([area, selector, property, value], idx) => (
            <tr key={idx}>
              <td className="border p-2">{area}</td>
              <td className="border p-2">{selector}</td>
              <td className="border p-2">{property}</td>
              <td className="border p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-2">JavaScript Functionality:</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li><strong>Print Data:</strong> Show data on right-side container</li>
        <li><strong>Save Data:</strong> Convert and download or log JSON</li>
        <li><strong>Theme Toggle:</strong> Light/dark switch with localStorage persistence</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">JavaScript Testing Checklist:</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>Print button displays current data correctly</li>
        <li>Save button outputs valid JSON</li>
        <li>Theme switch works and persists after refresh</li>
        <li>All UI updates happen in real time</li>
        <li>Responsive and handles edge cases well</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Responsiveness Criteria:</h2>
      <p className="mb-4">
        Tested on: <code>1920×1080</code>, <code>1366×768</code>, <code>768×1024</code>, <code>425×800</code>, <code>375×667</code>
      </p>

      <h2 className="text-xl font-semibold mb-2">Performance Expectation:</h2>
      <p>
        Page should load within <code>1500ms</code> with 2 users. All components should be smooth and optimized.
      </p>
    </div>
  );
}

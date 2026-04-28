
import React from "react";

export default function A1L1Q02Question() {
  return (
    <div className="container mx-auto p-6 text-gray-900 font-sans leading-relaxed">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">QP Code: A1L1Q02</h1>

      <h2 className="text-xl font-semibold mb-2">Objective:</h2>
      <p className="mb-4">
        Design and implement a visually engaging <strong>Student Portfolio Card</strong> using <strong>HTML</strong>, <strong>CSS</strong>, and <strong>JavaScript</strong>.
        <br />
        The card should dynamically display a student's skillset and maintain a clean, centered layout with a focus on performance and semantic best practices.
        <br />
        Users should be able to <strong>add</strong> and <strong>remove skills dynamically</strong>, which will be reflected immediately within the portfolio card.
      </p>

      <img src="/level-two.png" />

      <h2 className="text-xl font-semibold mb-2">Expected Output:</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>A centered card layout over a full-screen, responsive background</li>
        <li>Skillsets entered by the user must be dynamically displayed within the portfolio card</li>
        <li>Users should be able to remove individual skills interactively</li>
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
            ["Profile Image", ".profile-img", "border-radius", "50%"],
            ["Profile Image", ".profile-img", "border", "4px solid #8e44ad"],
            ["Profile Card", ".profile-card", "max-width", "600px"],
            ["Profile Card", ".profile-card", "color", "#5b2c6f"],
            ["Body", "body", "background-color", "#f4ecf7"],
            ["Profile Name", ".profile-name", "font-size", "2rem"],
            ["Card Container", ".flexarea", "display", "flex"],
            ["Card Container", ".flexarea", "text-align", "center"],
            ["Skill Tags", ".skill-tags-container", "display", "flex"],
            ["Header", ".header-section", "margin-bottom", "2rem"],
            ["Skill Heading", ".skills-heading", "color", "#8e44ad"],
            ["Skill Heading", ".skills-heading", "text-align", "center"],
            ["Flex Alignment", ".flexarea", "justify-content", "Center"]
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
        <li>Clicking the "Add Skill" button should reveal an input field for entering a skill</li>
        <li>On submission, the skill appears inside the portfolio card</li>
        <li>Each skill has a cross icon for dynamic removal</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">JavaScript Testing Checklist:</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>Verify the "Add Skill" button reveals an input box (onclick event handler implemented)</li>
        <li>Confirm entered skills are displayed in the portfolio card</li>
        <li>Ensure skills can be removed dynamically with the cross icon</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Responsiveness Criteria:</h2>
      <p className="mb-4">
        Viewport sizes: <code>1920×1080</code>, <code>1366×768</code>, <code>768×1024</code>, <code>425×800</code>, <code>375×667</code>
      </p>

      <h2 className="text-xl font-semibold mb-2">Performance Expectation:</h2>
      <p>
        Page load time should be under <code>1500ms</code> for 2 concurrent users. Optimize images and interactions for smooth rendering.
      </p>
    </div>
  );
}

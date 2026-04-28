import React from "react";
import q1i1 from "/q1i1.png"
import q1i3 from "/q1i3.png"

export default function A1L1Q01Question() {
  return (
    <div className="container mx-auto p-6 text-gray-900 font-sans leading-relaxed">
          <h1 className="text-2xl font-bold mb-4 text-blue-800">QP Code: A1L1Q01</h1>
    
          <h2 className="text-xl font-semibold mb-2">Objective:</h2>
          <p className="mb-4">
            Design and build a visually compelling <strong>Student Portfolio Card</strong> using <strong>HTML</strong>, <strong>CSS</strong>, and <strong>JavaScript</strong>.
            <br />
            The card should present a student's portfolio details and follow a clean, centered layout with performance and semantic considerations.
            <br />
            Show the data submitted through the modal form dynamically in the portfolio card after form submission.
          </p>
            <img src={q1i1} />
            <img src={q1i3}/>
    
          <h2 className="text-xl font-semibold mb-2">Expected Output:</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>A circular profile image (100x100px)</li>
            <li>The student’s name as a styled hyperlink</li>
            <li>An optional domain badge/logo</li>
            <li>Centered card layout over a full-screen background, fully responsive</li>
            <li>Display dynamic data in the portfolio card after form submission</li>
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
                ["Card Background", ".backgroundpart", "padding", "20px"],
                ["Card Layout", ".backgroundpart", "display", "flex"],
                ["Card Alignment (Horizontal)", ".backgroundpart", "justify-content", "center"],
                ["Card Alignment (Vertical)", ".backgroundpart", "align-items", "center"],
                ["Card Rounded Corners", ".contentcard", "border-radius", "15px"],
                ["Card Padding", ".contentcard", "padding", "30px 20px"],
                ["Card Max Width", ".contentcard", "max-width", "400px"],
                ["Card Text Alignment", ".contentcard", "text-align", "center"],
                ["Card Background Color", ".contentcard", "background-color", "#e6f9fc"],
                ["Profile Picture Width", ".profile-pic", "width", "100px"],
                ["Profile Picture Height", ".profile-pic", "height", "100px"],
                ["Profile Picture Style", ".profile-pic", "border-radius", "50%"],
                ["Domain Badge Size", ".gift-img", "width", "80px"],
                ["Page Background Image", ".backgroundpart", "background-size", "cover"],
                ["Button Alignment", ".buttonpart", "justify-content", "end"]
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
            <li>Clicking the "Add Personal Info" button should open a modal.</li>
            <li>After filling out all the fields and submitting the form, the entered data must be displayed in the portfolio card.</li>
          </ul>
    
          <h2 className="text-xl font-semibold mb-2">JavaScript Testing:</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Clicking the "Add Personal Info" button should trigger a modal popup — ensure an <code>onclick</code> event handler is implemented.</li>
            <li>Validate that the input fields accept data in the correct format (e.g., name, URL, domain).</li>
            <li>Ensure all required fields are filled before allowing form submission.</li>
            <li>Upon successful submission, the entered data should dynamically update and display on the portfolio card.</li>
          </ul>
    
          <h2 className="text-xl font-semibold mb-2">Responsiveness Criteria:</h2>
          <p className="mb-4">
            Tested across: <code>1920×1080</code>, <code>1366×768</code>, <code>768×1024</code>, <code>425×800</code>, <code>375×667</code>
            <br />
            Ensure consistent card layout and appearance.
          </p>
    
          <h2 className="text-xl font-semibold mb-2">Performance Expectation:</h2>
          <p>
            The page must load within <code>1500ms</code> under 2 concurrent users.
            <br />
            Ensure optimized images and smooth rendering.
          </p>
        </div>
  );
}

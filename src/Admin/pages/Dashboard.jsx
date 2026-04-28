// import React, { useEffect, useState } from "react";
// import Sidebarcomp from "../sidenav";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faIdCard, faUserCheck, faUsers } from "@fortawesome/free-solid-svg-icons";
// import axios from "axios";

// function Dashboard() {
//   const [data, setData] = useState({
//     totalLicense: 0,
//     consumedLogin: 0,
//     availableLogin: 0,
//   });

//   const [testDetails, setTestDetails] = useState([]);

//   useEffect(() => {
//     // Call your backend API for license info
//     axios
//       .get("http://localhost:5000/api/dashboard")
//       .then((res) => {
//         setData(res.data); // { totalLicense, consumedLogin, availableLogin }
//       })
//       .catch((err) => {
//         console.error("Error fetching dashboard data:", err);
//       });

//     // Call your backend API for test details
//     axios
//       .get(`${import.meta.env.VITE_BACKEND_API_URL}/test-details`)
//       .then((res) => {
//         setTestDetails(res.data); 
//         console.log(testDetails)
//         // Assuming backend returns:
//         // [{ testName: "Math Test", assigned: 20, used: 15, unused: 5, status: "Active" }, ...]
//       })
//       .catch((err) => {
//         console.error("Error fetching test details:", err);
//       });
//   }, []);

//   const cards = [
//     {
//       title: "Total License",
//       value: data.totalLicense,
//       icon: faIdCard,
//       iconBg: "bg-danger",
//     },
//     {
//       title: "Test Login Consumed",
//       value: data.consumedLogin,
//       icon: faUsers,
//       iconBg: "bg-primary",
//     },
//     {
//       title: "Available Login",
//       value: data.availableLogin,
//       icon: faUserCheck,
//       iconBg: "bg-success",
//     },
//   ];

//   return (
//     <>
//       <div style={{ display: "flex", height: "100vh" }}>
//         {/* Sidebar */}
//         <Sidebarcomp />

//         {/* Page Content */}
//         <div style={{ flex: 1, padding: "20px" }}>
//           {/* Cards */}
//           <div className="row g-4">
//             {cards.map((card, index) => (
//                 <div className="col-12 col-sm-6 col-md-4" key={index}>
//                 <div className="card shadow-lg border-0 rounded-4 h-100">
//                     <div className="card-body text-center">
//                     <div
//                         className={`d-inline-flex align-items-center justify-content-center rounded-circle ${card.iconBg} text-white mb-3`}
//                         style={{ width: "60px", height: "60px", fontSize: "24px" }}
//                     >
//                         <FontAwesomeIcon icon={card.icon} />
//                     </div>
//                     <h6 className="text-muted">{card.title}</h6>
//                     <h2 className="fw-bold">{card.value}</h2>
//                     </div>
//                 </div>
//                 </div>
//             ))}
//             </div>

//             {/* Test Details Section */}
//             <div className="mt-5">
//               <h4 className="fw-bold mb-3">Test Details</h4>
//               <div className="table-responsive">
//                 <table className="table table-bordered table-hover">
//                   <thead className="table-light">
//                     <tr>
//                       <th>S.No</th>
//                       <th>Test Name</th>
//                       <th>No. of Students Assigned</th>
//                       <th>No. of Students Used</th>
//                       <th>No. of Students Unused</th>
//                       <th>Action</th>
//                       <th>Test Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {testDetails.length > 0 ? (
//                       testDetails.map((test, idx) => (
//                         <tr key={idx}>
//                           <td>{idx + 1}</td>
//                           <td>{test.testName}</td>
//                           <td>{test.assigned}</td>
//                           <td>{test.used}</td>
//                           <td>{test.unused}</td>
//                           <td></td>
//                           <td>
//                             <span
//                               className={`badge ${
//                                 test.status === "Active"
//                                   ? "bg-success"
//                                   : test.status === "Completed"
//                                   ? "bg-primary"
//                                   : "bg-secondary"
//                               }`}
//                             >
//                               {test.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="6" className="text-center text-muted">
//                           No test details available
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
     

//     </>
//   );
// }

// export default Dashboard;



import React, { useEffect, useState } from "react";
import Sidebarcomp from "../sidenav";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard, faUserCheck, faUsers } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState({
    totalLicense: 0,
    consumedLogin: 0,
    availableLogin: 0,
  });

  const [testDetails, setTestDetails] = useState([]);

  // 🔹 reusable function
  const fetchTestDetails = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_API_URL}/test-details`)
      .then((res) => {
        setTestDetails(res.data);
      })
      .catch((err) => {
        console.error("Error fetching test details:", err);
      });
  };
 console.log(testDetails)
  useEffect(() => {
    // Fetch license info
    axios
      .get(`${import.meta.env.VITE_BACKEND_API_URL}/dashboard`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching dashboard data:", err));

    fetchTestDetails(); // initial load
  }, []);

  const cards = [
    {
      title: "Total License",
      value: data.totalLicense,
      icon: faIdCard,
      iconBg: "bg-danger",
    },
    {
      title: "Test Login Consumed",
      value: data.consumedLogin,
      icon: faUsers,
      iconBg: "bg-primary",
    },
    {
      title: "Available Login",
      value: data.availableLogin,
      icon: faUserCheck,
      iconBg: "bg-success",
    },
  ];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebarcomp />

      <div style={{ flex: 1, padding: "20px" }}>
        {/* Cards */}
        <div className="row g-4">
          {cards.map((card, index) => (
            <div className="col-12 col-sm-6 col-md-4" key={index}>
              <div className="card shadow-lg border-0 rounded-4 h-100">
                <div className="card-body text-center">
                  <div
                    className={`d-inline-flex align-items-center justify-content-center rounded-circle ${card.iconBg} text-white mb-3`}
                    style={{ width: "60px", height: "60px", fontSize: "24px" }}
                  >
                    <FontAwesomeIcon icon={card.icon} />
                  </div>
                  <h6 className="text-muted">{card.title}</h6>
                  <h2 className="fw-bold">{card.value}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Test Details Section */}
        {/* <div className="mt-5">
          <h4 className="fw-bold mb-3">Test Details</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>S.No</th>
                  <th>Test Name</th>
                  
                  <th>No. of Students Assigned</th>
                  <th>No. of Students Used</th>
                  <th>No. of Students Unused</th>
                  <th>Test Status</th>
                </tr>
              </thead>
              <tbody>
                {testDetails.length > 0 ? (
                  testDetails.map((test, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>

                      <td>{test.testName}</td>
                      
                      <td>{test.assigned}</td>
                      <td>{test.used}</td>
                      <td>{test.unused}</td>
                      <td>
                        <span
                          className={`badge ${
                            test.status === "Active"
                              ? "bg-success"
                              : test.status === "Completed"
                              ? "bg-primary"
                              : "bg-secondary"
                          }`}
                        >
                          {test.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No test details available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Dashboard;


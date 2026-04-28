import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import A1L1Q03Question from "./A1L1Q3Question";
import A1L1Q02Question from "./A1L1Q2Question";
import A1L1Q01Question from "./A1L1Q1Question";

export default function QuestionsMain() {
    const { encrypted } = useParams();
    const {id, empNo, dockerPort, outputPort} = JSON.parse(atob(encrypted));
    const [testdata, setTestdata] = useState([]);
    const [htmlContent, setHtmlContent] = useState('');
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [timeLeft, setTimeLeft] = useState(6);
    const [showTable, setShowTable] = useState(false);
    const [question, setQuestion] = useState("");
    const [redirectCountdown, setRedirectCountdown] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [reactOrVue, setReactOrVue] = useState('react');
    sessionStorage.setItem("framework", reactOrVue);

    const userRole = sessionStorage.getItem("userRole");
    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName");
    const userQuestion = sessionStorage.getItem("userQues");
    const navigate = useNavigate();

    const dPort = (reactOrVue === "react" ? + dockerPort : +dockerPort + 1).toString()
    const oPort = (reactOrVue === "react" ? + outputPort : +outputPort + 1).toString()

    console.log(reactOrVue)
    useEffect(() => {
        window.scrollTo(0, 0);
    },[])

    useEffect(() => {
        const userRole = sessionStorage.getItem("userRole");

        // console.log("User role:", userRole);

        if (["4", "3", "5"].includes(userRole)) {
        setIsAuthorized(true); // Let them through
        } else {
        navigate("/"); // Kick 'em out
        }

        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);

            return () => clearTimeout(timer);
        } else {
            setIsButtonEnabled(true);
        }
    }, [timeLeft, navigate]);

    const toggleTable = () => {
        setShowTable(!showTable);
    };

    // const runScript = async () => {
    //     try {
    //         const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-script`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });
    //         const data = await response.json();
    //         console.log('Script output:', data);
    //         window.location.href = `/workspace/${id}`;
    //     } catch (error) {
    //         console.error('Error running script:', error);
    //     }
    // };

    const handleReactOrVue = (e) => {
        setReactOrVue(e.target.value);
        sessionStorage.setItem("framework", e.target.value)
    };

    // const handleStartAssessment = async () => {
    //     try {
    //       const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-script`, { method: 'POST' });
    //       const data = await res.json();
    //       console.log('Script output:', data.stdout);
    //       alert('Assessment started!');
    //     } catch (err) {
    //       console.error(err);
    //       alert('Something went wrong xstarting the assessment.');
    //     }
    //   };
    
      const handleStartAssessmentII = async (selectedFramework) => {
        let countdown = 20;
        setRedirectCountdown(countdown); // Show "Redirecting in 10 seconds..."
    
        const interval = setInterval(() => {
            countdown -= 1;
            setRedirectCountdown(countdown);
    
            if (countdown === 0) {
                clearInterval(interval);
                window.location.href = `/workspace/${id}/${selectedFramework}/${userQuestion}/${dPort}/${oPort}`;
            }
        }, 1000);

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-script`, 
                {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId: userId,
                      empNo: empNo,
                      userName: userName,
                      question: userQuestion,
                    framework: selectedFramework,
                    dockerPort: dPort,
                    outputPort: oPort,
                    }),
                  }
            );
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                console.log('Script output:', data.output);  // Use `data.output` based on backend structure
                // window.location.href = `/workspace/${id}/${selectedFramework}`;
              } else {
                console.warn('Backend responded with error:', data);
                alert('Script failed to start the assessment.');
              }
          } catch (err) {
            console.error(err);
            alert('Something went wrong xstarting the assessment.');
          }
    };
    


    return (
        <>
            <div className="w-full py-3 px-5">
                <div className="px-5 mb-2">
                    {/* <div className="w-full" dangerouslySetInnerHTML={{__html: question}}></div> */}

                    <div className="w-full" >
                        {/* <div className="shadow-md p-7 md:mx-20 my-2">
                            <h1 className="text-center text-2xl font-bold">CRM Application Project Description</h1>

                            <section className="mt-4">
                                <h2 className="text-xl font-semibold">Objective</h2>
                                <p>Develop a CRM application using the MERN stack. The application will include role-based login functionality for Admin, Manager, BDM (Business Development Manager), and BDE (Business Development Executive). Each user will register with a company domain email, and reporting persons will be dynamically loaded from the database.</p>
                            </section>

                            <section className="mt-4">
                                <h2 className="text-xl font-semibold">Requirements</h2>
                                <h3 className="text-lg font-medium">User Roles:</h3>
                                <ul className="list-disc pl-5">
                                    <li><strong>Admin:</strong>
                                        <ul className="list-disc pl-5">
                                            <li>Can add users belonging to the Manager, BDM, and BDE roles.</li>
                                            <li>Cannot add other Admins.</li>
                                        </ul>
                                    </li>
                                    <li><strong>Manager, BDM, BDE:</strong>
                                        <ul className="list-disc pl-5">
                                            <li>Can register with a company domain email (e.g., manager@abccollege.com).</li>
                                            <li>Cannot register with generic email providers (e.g., manager@gmail.com).</li>
                                        </ul>
                                    </li>
                                </ul>
                            </section>

                            <section className="mt-4">
                                <h2 className="text-xl font-semibold">Functional Requirements</h2>
                                <h3 className="text-lg font-medium">User Registration:</h3>
                                <ul className="list-disc pl-5">
                                    <li>Users must register with a company domain email address.</li>
                                    <li>Validation to ensure the email is not from a generic email provider.</li>
                                    <li>Form submission should save user details to the MySQL database.</li>
                                </ul>

                                <h3 className="text-lg font-medium">Login Functionality:</h3>
                                <ul className="list-disc pl-5">
                                    <li>Users can log in with their email and password.</li>
                                    <li>Access should be restricted based on roles (e.g., only Admin can add users).</li>
                                </ul>

                                <h3 className="text-lg font-medium">Dynamic Dropdown Data:</h3>
                                <ul className="list-disc pl-5">
                                    <li>The Reporting Person and Role dropdowns should load data dynamically from the database.</li>
                                </ul>
                            </section>

                            <section className="mt-4">
                                <h2 className="text-xl font-semibold">Technical Specifications</h2>
                                <h3 className="text-lg font-medium">Frontend:</h3>
                                <ul className="list-disc pl-5">
                                    <li><strong>React.js:</strong> For building the user interface.</li>
                                    <li><strong>React Router:</strong> For handling routing between different pages (e.g., login, registration, dashboard).</li>
                                    <li><strong>Form Validation:</strong> Implement form validation to ensure correct data input.</li>
                                </ul>

                                <h3 className="text-lg font-medium">Backend:</h3>
                                <ul className="list-disc pl-5">
                                    <li><strong>Node.js:</strong> For server-side operations.</li>
                                    <li><strong>Express.js:</strong> For building the REST API.</li>
                                    <li><strong>MySQL:</strong> For the database to store user details and roles.</li>
                                    <li><strong>JWT (JSON Web Tokens):</strong> For handling authentication and authorization.</li>
                                </ul>
                            </section>

                            <section className="mt-4">
                                <h2 className="text-xl font-semibold">Evaluation Criteria</h2>
                                <ul className="list-disc pl-5">
                                    <li>Performance Testing</li>
                                    <li>Page Load Time</li>
                                    <li>Page Responsiveness</li>
                                    <li>Registration with Gmail ID</li>
                                    <li>Admin Registration within Admin Login</li>
                                    <li>Registration with Company ID</li>
                                </ul>
                            </section>
                        </div> */}
                        {

                        
                            userRole === "3" || userRole === "4" ? (
                                <div className="shadow-md p-7 md:mx-20 my-2">
                                    {/* <A1L1Question /> */}
                                    <>
                                        {userQuestion === "a1l1q3" && <A1L1Q03Question />}
                                        {userQuestion === "a1l1q2" && <A1L1Q02Question />}
                                        {userQuestion === "a1l1q1" && <A1L1Q01Question />}
                                        </>
                                    
                                </div>
                            ) : (
                                <div className="shadow-md p-7 md:mx-20 my-2" dangerouslySetInnerHTML={{__html: question}}></div>
                            )
                        }

                        {/* <div className="md:mx-20 flex items-center gap-3 justify-start mt-4">
                            <h6>Select preferred Framework</h6>
                            <select onChange={handleReactOrVue}  className="border-2 border-blue-300 flex items-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select</option>
                                <option value="react">React</option>
                                <option value="vue">Vue</option>    
                            </select>
                        </div> */}
                        
                        <div className="md:mx-20 md:flex justify-center md:justify-between items-center">    
                            {/* <Link to={`/workspace/${id}`}> */}
                            {/* <button onClick={handleStartAssessmentII}  className={`bg-blue-500 text-white px-4 py-2 rounded-md lg:float-right mt-4 ${isButtonEnabled ? "cursor-pointer" : "cursor-not-allowed"}`} disabled={!isButtonEnabled}>Start Assessment</button> */}
                            {/* </Link> */}
                            {/* <button onClick={handleStartAssessment} className="">Start Assessment</button> */}

                                <button 
                                    onClick={()=>handleStartAssessmentII(reactOrVue)}
                                    className={`bg-blue-500  px-4 py-2 rounded-md lg:float-right mt-4 ${isButtonEnabled && reactOrVue ? "cursor-pointer text-white" : "cursor-not-allowed bg-gray-200 text-black"}`} 
                                    disabled={!isButtonEnabled || !reactOrVue}>
                                    Start Assessment
                                </button>

                                {/* {redirectCountdown !== null && redirectCountdown > 0 && (
                                <div className="text-sm text-gray-700 mt-2">
                                    Redirecting in {redirectCountdown} second{redirectCountdown > 1 ? 's' : ''}…
                                </div>
                                )} */}

                            {redirectCountdown !== null && redirectCountdown > 0 && (
                            <div className="fixed inset-0 z-50 flex items-center  justify-center bg-black bg-opacity-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-pulse w-[450px]">
                                <h2 className="text-2xl font-semibold text-blue-600 mb-2">Creating Workspace</h2>
                                <p className="text-gray-700">Please wait while we set things up for you…</p>
                                <div className="mt-4">
                                    <svg className="mx-auto h-8 w-8 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                </div>
                                </div>
                            </div>
                            )}

                        </div>
                       
                    </div>
                </div>
            </div>
        </>
    );
}
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import A1L1Q03Question from "./A1L1Q3Question";
import A1L1Q02Question from "./A1L1Q2Question";
import A1L1Q01Question from "./A1L1Q1Question";
import { useAssessmentProtection, enterFullscreen } from '../utils/useAssessmentProtection';
import { useTabClaim } from '../utils/useTabClaim';

export default function QuestionsMain() {
    const { encrypted } = useParams();
    const {id, session_id, aon_id, question_id, dockerPort, outputPort, test_id, test_name} = JSON.parse(atob(encrypted));
    const [testdata, setTestdata] = useState([]);
    const [htmlContent, setHtmlContent] = useState('');
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showTable, setShowTable] = useState(false);
    const [question, setQuestion] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [reactOrVue, setReactOrVue] = useState('react');
    sessionStorage.setItem("framework", reactOrVue);

    const userRole = sessionStorage.getItem("userRole");
    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName");
    const userQuestion = sessionStorage.getItem("userQues");
    const navigate = useNavigate();

    // Assessment protection: fullscreen + tab switch detection
    useAssessmentProtection({
      enabled: sessionStorage.getItem('assessmentFullscreen') === 'true',
      isCodeEditorPage: false,
      redirectUrl: sessionStorage.getItem('redirectUrl'),
    });

    // Continue single-tab heartbeat lock while the candidate is on this page
    useTabClaim({
      launchTokenId: sessionStorage.getItem('launchTokenId'),
      tabId: sessionStorage.getItem('assessmentTabId'),
      enabled: Boolean(
        sessionStorage.getItem('launchTokenId') &&
        sessionStorage.getItem('assessmentTabId')
      ),
      onEvicted: () => navigate('/'),
    });

    const dPort = (reactOrVue === "react" ? + dockerPort : +dockerPort + 1).toString()
    const oPort = (reactOrVue === "react" ? + outputPort : +outputPort + 1).toString()

    // console.log(reactOrVue)
    useEffect(() => {
        window.scrollTo(0, 0);
        // Enter fullscreen on the questions page
        sessionStorage.setItem('assessmentFullscreen', 'true');
        enterFullscreen().catch(err => console.error('Failed to enter fullscreen:', err));
    },[])

    useEffect(() => {
        const userRole = sessionStorage.getItem("userRole");
        const launchToken = sessionStorage.getItem("launchToken");

        // console.log("User role:", userRole);

        if (["4", "3", "5"].includes(userRole)) {
        setIsAuthorized(true); // Let them through
        } else if (launchToken) {
        // Session lost but we have the token - redirect to restore session
        navigate(`/aon/start?t=${launchToken}`, { replace: true });
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

    
    
      const handleStartAssessmentII = (selectedFramework) => {
        // Reset the tab-switch counter before entering the workspace so that any
        // false positives accumulated during QuestionsMain (e.g. from the fullscreen
        // transition) do not carry over and cause an immediate auto-submit.
        sessionStorage.setItem('tabSwitchCount', '0');
        const workspaceUrl = `/workspace/${id}/${selectedFramework}/${userQuestion}/${dPort}/${oPort}`;
        navigate(workspaceUrl, { replace: true });
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

                        <div className="mt-4 flex justify-center">
                                <button 
                                    onClick={()=>handleStartAssessmentII(reactOrVue)}
                                    className={`w-1/2 !font-semibold py-3 px-6 !rounded-md shadow transition duration-200 ${isButtonEnabled && reactOrVue ? "bg-green-500 hover:bg-green-700 text-white cursor-pointer" : " cursor-not-allowed bg-gray-200 text-black"}`} 
                                    disabled={!isButtonEnabled || !reactOrVue}>
                                    {isButtonEnabled ? 'Start Assessment' : `Start Assessment (${timeLeft}s)`}
                                </button>
                            </div>
                        
                        <div className="md:mx-20 md:flex justify-center md:justify-between items-center">    
                            {/* <Link to={`/workspace/${id}`}> */}
                            {/* <button onClick={handleStartAssessmentII}  className={`bg-blue-500 text-white px-4 py-2 rounded-md lg:float-right mt-4 ${isButtonEnabled ? "cursor-pointer" : "cursor-not-allowed"}`} disabled={!isButtonEnabled}>Start Assessment</button> */}
                            {/* </Link> */}
                            {/* <button onClick={handleStartAssessment} className="">Start Assessment</button> */}

                                

                        </div>
                       
                    </div>
                </div>
            </div>
        </>
    );
}
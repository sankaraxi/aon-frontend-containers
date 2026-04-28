import React, {useState} from "react";
import { Link, useParams } from "react-router-dom";
import './systemcheck.css';
import EnvironmentSetup from './EnvironmentSetup.png';
import configuration from './configuration.png';
import ribbon from './ribbon.png';
import guide from './guide_18823709.png';
import { use } from "react";
import { useEffect } from "react";
import axios from "axios";


export default function GuidelinesPage() {

  const location = useLocation();
  const navigate = useNavigate();


  const { id,empNo } = useParams();
  const dockerPort = sessionStorage.getItem("dockerPort");
  const outputPort = sessionStorage.getItem("outputPort");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeNo, setEmployeeNo] = useState('');
  const [logData, setLogData ] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeNo: ''
  });

  const [error, setError] = useState('');  

    useEffect(() => {
        const fetchUserLog = async () => {
            try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/time-left/${id}`);
            console.log('response', response);
            setLogData(response.data);

            } catch (err) {
            setLogData(null);
            console.log('User not found or server error');
            console.error(err);
            }
        };
        fetchUserLog();

    }, [id]);

    console.log('logData', logData);

    useEffect(() => {
      if(logData?.log_status === 0){
        setIsModalOpen(true);
      }
    }, [logData]);
  


    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.name || !formData.employeeNo) {
        setError('Please fill in all fields');
        return;
      }
      if(formData.employeeNo){
        setEmployeeNo(formData.employeeNo);
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/candidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: id,
            ...formData
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsModalOpen(false);
          setError('');
        } else {
          setError(data.error || 'Failed to submit data. Please try again.');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      }

    };

    const paramData = {
      id: id,
      empNo: empNo,
      dockerPort: dockerPort,
      outputPort: outputPort
    }
  
    const base64 = btoa(JSON.stringify(paramData)); 

  return (
    <>
      {/* {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Candidate Information</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="employeeNo" className="block text-gray-700 mb-2">Roll/Employee No</label>
                <input
                  type="text"
                  id="employeeNo"
                  name="employeeNo"
                  value={formData.employeeNo}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6 headingcolor">
          Candidate Instructions – Front-End Assessment (Pre-Test Notes)
        </h1>

        <p className="text-gray-700 mb-6">
          Welcome! Before you begin your front-end assessment, please take a moment to read these instructions carefully. This will help you make the best use of your time and the embedded coding environment.
        </p>

        <section className="mb-6">
          <div className="shadow-md p-4 mb-4 animation">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 headingcolor">
              <img src={EnvironmentSetup} alt="Environment Icon" className="w-8 h-8 inline-block" /> Environment Setup
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>You will be working in a browser-based VS Code environment (codeserver).</li>
              <li>The project is preconfigured with two frameworks: React and Vue.js.</li>
              <li>You may choose either React or Vue.js for this task — select the one you are most comfortable with.</li>
              <li>For styling, use the shared stylesheet: <code>App.css</code>.</li>
            </ul>
          </div>
          <div className="shadow-md p-4 animation">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 headingcolor">
              <img src={configuration} alt="configuration Icon" className="w-8 h-8 inline-block" /> Configuration Setup
            </h2>
            <p className="text-gray-700 mb-2">Before starting the development:</p>
            <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
              <li><strong>Step 1:</strong> Open the terminal and install the required npm modules.</li>
              <div>
                <img src="/npminstall.png" className="animation" alt="npm install" />
              </div>
              <li><strong>Step 2:</strong> Type the Command to run the react/vue application</li>
              <div>
                <img src="/npmrundev.png" className="animation" alt="npm run dev" />
              </div>
              <li><strong>Step 3:</strong> Check the App.js (for React) or App.vue (for Vue) file to understand the structure and the class names used.</li>
              <li>Based on those class names, create appropriate styles in the <code>App.css</code></li>
              <li>Also, review the <code>index.html</code> file located in the project folder to ensure that your layout aligns with any HTML structure-related test cases. This helps you meet all DOM and layout requirements during validation.</li>
              <li><strong>Step 4:</strong> Click the <code>Output</code> button to view your output.</li>
              <strong>You click on the <code>Guidelines</code> button in the assessment page if you have any queries.</strong>
            </ul>
          </div>
        </section>

        <section className="mb-6 shadow-md p-4 animation">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 headingcolor">
            <img src={ribbon} alt="ribbon Icon" className="w-8 h-8 inline-block" /> Submission Guidelines
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Once you complete the task, save all changes.</li>
            <li>Press the "Submit Assessment" button to run validation.</li>
            <li>You can submit the code multiple times within the 30-minute time limit to check your results.</li>
            <li>Your final submission before the deadline will be considered for evaluation.</li>
          </ul>
        </section>

        <section className="mb-8 shadow-md p-4 animation">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 headingcolor">
            <img src={guide} alt="Enviroguidenment Icon" className="w-8 h-8 inline-block" /> General Guidelines
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Use only the provided libraries (React or Vue). Do not install third-party libraries like Bootstrap or Tailwind.</li>
            <li>Follow clean coding practices — use meaningful class names, maintain indentation, and add comments where needed.</li>
            <li>Ensure your layout is responsive and follows the grid structure as specified in the task.</li>
          </ul>
          <p className="mt-4 text-center text-gray-700 text-success text-bold">
            All the best — build something neat and clean.
          </p>
        </section>

        <div className="mt-4">
        <Link to={`/question/${base64}`}>
            <button className="w-full bg-green-600 text-white py-3 px-6 rounded-md shadow hover:bg-green-700 transition duration-200">
              Start Assessment
            </button>
          </Link>
        </div>
      </div>

    </>
    
  );
  
}
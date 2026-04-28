import React, { useState, useEffect, use } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import GuidelinesSideBar from "../Guidelines/GuidelinesSideBar";

export default function CodeMenu() {
    const { id } = useParams();
    const [timeLeft, setTimeLeft] = useState(null);
    const [logoutClick, setLogoutClick] = useState(false);  
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [isModalClosing, setIsModalClosing] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [detailedResults, setDetailedResults] = useState([]);
    const [detailedResultsII, setDetailedResultsII] = useState({});
    const [isGradeModalOpenII, setIsGradeModalOpenII] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [notRunning, setNotRunning] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const userId = sessionStorage.getItem("userId");
    const userRole = sessionStorage.getItem("userRole");
    const userQuestion = sessionStorage.getItem("userQues");
    const framework = sessionStorage.getItem("framework");
    const [logData, setLogData] = useState(null);


    console.log(notRunning);

    // useEffect(() => {
    //     if (logData?.log_status === 2) {
    //         const newTimeLeft = Math.floor(logData.closing_time_ms / 1000);
    //         setTimeLeft(newTimeLeft);
    //         console.log("Time left from logData:", newTimeLeft);
    //     }   
    // }, [logData]);

    
    // useEffect(() => {
    //     if (logData?.log_status === 2) {
    //         const newTimeLeft = Math.floor(logData.closing_time_ms / 1000);
    //         setTimeLeft(newTimeLeft);
    //         console.log("Time left from logData:", newTimeLeft);
    //     }  
    //     else{
    //         setTimeLeft(1800)
    //     }

    // },[logData]);
    

    useEffect(() => {
        const fetchUserLog = async () => {
            try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/time-left/${userId}`);
            setLogData(response.data);

            } catch (err) {
            setLogData(null);
            console.log('User not found or server error');
            console.error(err);
            }
        };
        fetchUserLog();

    }, [userId]);

     useEffect(() => {
    if (logData?.log_status === 2) {
      const newTimeLeft = Math.floor((logData.closing_time_ms || 2100 * 1000) / 1000);
      setTimeLeft(newTimeLeft);
      console.log("Time left from logData:", newTimeLeft);
    } else {
      setTimeLeft(1800); // Default to 30 minutes
    }
  }, [logData]);

    useEffect(() => {
        if (detailedResults?.EvaluationDetails?.length > 0) {
            setIsGradeModalOpen(true);
            console.log("detailedResults1:", detailedResults);
        }else if (detailedResultsII?.functional?.length > 0) {
            setIsGradeModalOpenII(true);
            console.log("detailedResults2:", detailedResultsII);
        }

    }, [detailedResults, detailedResultsII]);

    useEffect(() => {
        if (isModalClosing) {
            const timer = setTimeout(() => {
                setNotRunning(false);     // Remove modal from DOM
                setIsModalClosing(false); // Reset for next time
            }, 400); // Match your animation duration
    
            return () => clearTimeout(timer); // Just in case
        }
    }, [isModalClosing]);
    
useEffect(() => {
    // Generate sessionId if not present
    if (!sessionStorage.getItem("sessionId")) {
      const uuid = 'session-' + Math.random().toString(36);
      sessionStorage.setItem("sessionId", uuid);
    }

    const initializeTimer = () => {
      const savedEndTime = sessionStorage.getItem("examEndTime");
      const defaultDuration = 1800; // 30 minutes in seconds

      if (!savedEndTime) {
        // Use logData.closing_time_ms if available and valid, else default
        const durationInSeconds = logData?.closing_time_ms
          ? Math.floor(logData.closing_time_ms / 1000)
          : defaultDuration;

        if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
          console.warn("Invalid closing_time_ms, using default duration");
          setTimeLeft(defaultDuration);
          const endTime = new Date(Date.now() + defaultDuration * 1000);
          sessionStorage.setItem("examEndTime", endTime.toISOString());
        } else {
          setTimeLeft(durationInSeconds);
          const endTime = new Date(Date.now() + durationInSeconds * 1000);
          sessionStorage.setItem("examEndTime", endTime.toISOString());
        }
      } else {
        const diff = Math.floor((new Date(savedEndTime) - new Date()) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);
      }
    };

    const autoStartTimer = async () => {
      const sessionId = sessionStorage.getItem("sessionId");
      if (!sessionId) {
        console.error("No sessionId found");
        return;
      }
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });
        console.log("Timer started successfully");
      } catch (err) {
        console.error("❌ Failed to auto-start session timer:", err);
      }
    };

    // Initialize timer only if logData is available
    if (logData) {
      initializeTimer();
      if (logData?.log_status === 2) {
        autoStartTimer();
      }
    }

    // Update timer every second
    const updateTimer = () => {
      const endTime = sessionStorage.getItem("examEndTime");
      if (!endTime) {
        setTimeLeft(0);
        return;
      }
      const diff = Math.floor((new Date(endTime) - new Date()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    };

    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [logData]);


  useEffect(() => {
    const handleUnload = () => {
      const sessionId = sessionStorage.getItem('sessionId');
      const userId = sessionStorage.getItem('userId'); // Make sure this is stored earlier
  
      if (sessionId && userId) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_BACKEND_API_URL}/pause/${userId}/${sessionId}/${timeLeft}`
        );
      }
    };
  
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [timeLeft]);

      
      useEffect(() => {
        if (timeLeft === 0 || logoutClick === true) {
            const handleTimeoutSubmit = async () => {
              if(userRole === '3' || userRole === '4'){
                  if(userQuestion === 'a1l1q3'){
                      try {
                          const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-Assesment`, {
                              method: 'POST',
                              headers: {
                              'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                  userId:userId, framework:framework
                              }),
                          });
                          const data = await response.json();
                          // console.log('Script output:', data);
                          if (
                              data.error &&
                              data.error.includes("Frontend application is not running on port")
                            ) {
                              console.log("Error running script:", data.error);
                              setNotRunning(!notRunning);
                            }
                            
                  
                      setDetailedResults(data.detailedResults)
                      } catch (err) {
                          console.error('Error running script:', err);
                          setNotRunning(!notRunning);
                          if (err.response && err.response.data?.error) {
                          //   setError(err.response.data.error);
                          console.error('Error running script:', err.response.data.error);
                          } else {
                              console.error('Error running script:', err);
                          //   setError('Something went wrong.');
                          }
                        }
                  }else if(userQuestion === 'a1l1q2'){
                      try {
                          const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-Assesment-2`, {
                              method: 'POST',
                              headers: {
                              'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                  userId:userId, framework:framework
                              }),
                          });
                          const data = await response.json();
                          // console.log('Script output:', data);
                          if (
                              data.error &&
                              data.error.includes("Frontend application is not running on port")
                            ) {
                              console.log("Error running script:", data.error);
                              setNotRunning(!notRunning);
                            }
                            
                  
                      setDetailedResults(data.detailedResults)
                      } catch (err) {
                          console.error('Error running script:', err);
                          setNotRunning(!notRunning);
                          if (err.response && err.response.data?.error) {
                          //   setError(err.response.data.error);
                          console.error('Error running script:', err.response.data.error);
                          } else {
                              console.error('Error running script:', err);
                          //   setError('Something went wrong.');
                          }
                        }
                  }else if(userQuestion === 'a1l1q1'){
                      try {
                          const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-Assesment-1`, {
                              method: 'POST',
                              headers: {
                              'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                  userId:userId, framework:framework
                              }),
                          });
                          const data = await response.json();
                          // console.log('Script output:', data);
                          if (
                              data.error &&
                              data.error.includes("Frontend application is not running on port")
                            ) {
                              console.log("Error running script:", data.error);
                              setNotRunning(!notRunning);
                            }
                            
                  
                      setDetailedResults(data.detailedResults)
                      } catch (err) {
                          console.error('Error running script:', err);
                          setNotRunning(!notRunning);
                          if (err.response && err.response.data?.error) {
                          //   setError(err.response.data.error);
                          console.error('Error running script:', err.response.data.error);
                          } else {
                              console.error('Error running script:', err);
                          //   setError('Something went wrong.');
                          }
                        }
                  }
              }
            };
        
            const handleTimeoutCleanup = async () => {
              try {
                  const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/cleanup-docker-2`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId: userId, // Ensure userId is defined in the scope
                    }),
                  });
              
                  // Check if the response is successful
                  if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                  }
              
                  // Parse the response
                  const data = await response.json();
                  if (data.status !== 'success') {
                    throw new Error(data.error || 'Docker cleanup failed');
                  }
              
                  // Clear sessionStorage and redirect
                  sessionStorage.removeItem('userRole');
                  sessionStorage.removeItem('examEndTime');
                  window.location.href = '/'; // Redirect to login page
                } catch (error) {
                  console.error('Failed to clean up Docker:', error);
                  // Proceed with logout even if the server request fails
                  sessionStorage.removeItem('userRole');
                  sessionStorage.removeItem('examEndTime');
                  window.location.href = '/'; // Redirect to login page
                }
            };
        
            handleTimeoutSubmit();
            handleTimeoutCleanup();
          }
      }, [timeLeft, logoutClick]);
    

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;


    const openGradeModal = () => {
        setIsModalClosing(false);
        setIsGradeModalOpen(true);
    };

const handleLogout = async () => {
try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/cleanup-docker-2`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        userId: userId, // Ensure userId is defined in the scope
    }),
    });

    // Check if the response is successful
    if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    if (data.status !== 'success') {
    throw new Error(data.error || 'Docker cleanup failed');
    }

    // Clear sessionStorage and redirect
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('examEndTime');
    window.location.href = '/'; // Redirect to login page
} catch (error) {
    console.error('Failed to clean up Docker:', error);
    // Proceed with logout even if the server request fails
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('examEndTime');
    window.location.href = '/'; // Redirect to login page
}
};

    const closeGradeModal = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setIsGradeModalOpen(false);
            setIsGradeModalOpenII(false);
            setIsModalClosing(false);
        }, 400);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const runScript = async () => {

        if(userRole === '3' || userRole === '4'){
            setIsSubmitting(true)   
            if(userQuestion === 'a1l1q3'){
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-Assesment`, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId:userId, framework:framework
                        }),
                    });
                    const data = await response.json();
                    // console.log('Script output:', data);
                    if (
                        data.error &&
                        data.error.includes("Failed to run assessment")
                      ) {
                        console.log("Error running script:", data.error);
                        setIsSubmitting(false)
                        setNotRunning(!notRunning);
                      }
                      
                      if(data.detailedResults){
                        setIsSubmitting(false)
                        setDetailedResults(data.detailedResults)
                      }
                
                } catch (err) {
                    console.error('Error running script:', err);
                    setNotRunning(!notRunning);
                    if (err.response && err.response.data?.error) {
                    //   setError(err.response.data.error);
                    console.error('Error running script:', err.response.data.error);
                    } else {
                        console.error('Error running script:', err);
                    //   setError('Something went wrong.');
                    }
                  }
            } else if(userQuestion === 'a1l1q2'){
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-Assesment-2`, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId:userId, framework:framework
                        }),
                    });
                    const data = await response.json();
                    // console.log('Script output:', data);
                    console.log('Script output:', data);
                    if (
                        data.error &&
                        data.error.includes("Failed to run assessment")
                      ) {
                        console.log("Error running script:", data.error);
                        setIsSubmitting(false)
                        setNotRunning(!notRunning);
                      }
                      
                      if(data.detailedResults){
                        setIsSubmitting(false)
                        setDetailedResults(data.detailedResults)
                      }
                
                } catch (err) {
                    console.error('Error running script:', err);
                    setNotRunning(!notRunning);
                    if (err.response && err.response.data?.error) {
                    //   setError(err.response.data.error);
                    console.error('Error running script:', err.response.data.error);
                    } else {
                        console.error('Error running script:', err);
                    //   setError('Something went wrong.');
                    }
                  }
            } else if(userQuestion === 'a1l1q1'){
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-Assesment-1`, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId:userId, framework:framework
                        }),
                    });
                    const data = await response.json();
                    // console.log('Script output:', data);

                    if (
                        data.error &&
                        data.error.includes("Failed to run assessment")
                      ) {
                        console.log("Error running script:", data.error);
                        setIsSubmitting(false)
                        setNotRunning(!notRunning);
                      }
                      
                      if(data.detailedResults){
                        setIsSubmitting(false)
                        setDetailedResults(data.detailedResults)
                        console.log('detailedResults:', data.detailedResults);
                      }
                      
            
                setDetailedResults(data.detailedResults)
                } catch (err) {
                    console.error('Error running script:', err);
                    setNotRunning(!notRunning);
                    if (err.response && err.response.data?.error) {
                    //   setError(err.response.data.error);
                    console.error('Error running script:', err.response.data.error);
                    } else {
                        console.error('Error running script:', err);
                    //   setError('Something went wrong.');
                    }
                  }
            }
            
        } else if (userRole === '5'){
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-a10l10-Assesment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setDetailedResultsII(data.detailedResults)
        
            
            alert("Assesment submitted successfully");
            } catch (err) {
                console.error(err);
                if (err.response && err.response.data?.error) {
                  setError(err.response.data.error);
                } else {
                  setError('Something went wrong.');
                }
              }
        }
        
    };

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = today.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const handleLogoutClick = () => {
        setLogoutClick(true);
    }

    return (
        <>
            <nav className="bg-[#291571] px-20 sticky top-0 z-10 flex justify-between items-center">
                <div className="w-20  md:w-24 md:h-20" />
                
                {/* Hamburger menu for mobile */}
                <div className="block lg:hidden">
                    <button 
                        onClick={toggleMobileMenu}
                        className="text-white focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                
                {/* Desktop menu */}
                <div className="hidden lg:flex items-center gap-6">
                    <button onClick={() => setShowGuidelines(!showGuidelines)} className="bg-white hover:bg-blue-200 text-black px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md">
                        Guidelines
                    </button>
                    
                    
                    
                        <button onClick={runScript} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md">Run Test</button>
                   
                    
                    {/* Timer with fixed widths for all elements */}
                    <div className="flex items-center border-2 border-white/30 rounded-lg py-1 px-3 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex items-center">
                            <div className="w-8 text-center">
                                <span className="text-xl font-medium">{minutes < 10 ? `0${minutes}` : minutes}</span>
                            </div>
                            <div className="w-4 text-center">
                                <span className="text-xl font-medium inline-block animate-pulse">:</span>
                            </div>
                            <div className="w-8 text-center">
                                <span className="text-xl font-medium">{seconds < 10 ? `0${seconds}` : seconds}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md"
                        onClick={handleLogoutClick}
                    >
                        Submit and Logout
                    </button>
                </div>
            </nav>

            {/* Mobile menu dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-[#291571] px-4 py-4 flex flex-col gap-4 shadow-md animate-fadeIn">
                    <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md w-full"
                        onClick={() => {
                            openGradeModal();
                            setIsMobileMenuOpen(false);
                        }}
                    >
                        Grade
                    </button>
                    
                    {/* <Link to={`/report/${id}`} className="w-full"> */}
                        <button onClick={runScript} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md w-full">Submit Assessment</button>
                    {/* </Link> */}
                    
                    {/* Timer for mobile */}
                    <div className="flex items-center justify-center border-2 border-white/30 rounded-lg py-2 px-3 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex items-center">
                            <div className="w-8 text-center">
                                <span className="text-xl font-medium">{hours}</span>
                            </div>
                            <div className="w-4 text-center">
                                <span className="text-xl font-medium inline-block animate-pulse">:</span>
                            </div>
                            <div className="w-8 text-center">
                                <span className="text-xl font-medium">{minutes < 10 ? `0${minutes}` : minutes}</span>
                            </div>
                            <div className="w-4 text-center">
                                <span className="text-xl font-medium inline-block animate-pulse">:</span>
                            </div>
                            <div className="w-8 text-center">
                                <span className="text-xl font-medium">{seconds < 10 ? `0${seconds}` : seconds}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Side (Guidelines Panel) */}
{showGuidelines && (
  <div className="fixed right-0 h-full w-[55%] bg-white shadow-lg z-50 overflow-y-auto p-6">
    
    {/* Close Button */}
    <div className="flex bg-amber-50 rounded-full justify-end">
      <button
        onClick={() => setShowGuidelines(false)}
        className="fixed text-gray-500  p-2  hover:text-black transition duration-200 text-2xl font-semibold focus:outline-none"
        aria-label="Close Guidelines Panel"
      >
        <p className="text-xl font-extrabold">✕</p>
      </button>
    </div>

    <GuidelinesSideBar />
  </div>
)}



{isGradeModalOpen && (
    <div 
        className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-400 p-4 ${
            isModalClosing ? 'opacity-0' : 'opacity-100'
        }`}
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
        <div 
            className={`bg-white w-full max-w-2xl rounded-lg shadow-xl transform transition-all duration-400 ${
                isModalClosing 
                    ? 'opacity-0 scale-90 -translate-y-4' 
                    : 'opacity-100 scale-100 translate-y-0'
            } max-h-[90vh] overflow-auto`}
        >
            <div className="p-4 md:p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-lg sticky top-0 z-10">
                <h5 className="text-lg md:text-xl font-bold text-gray-800">Assessment Grade Report</h5>
                <button 
                    className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200 hover:scale-110" 
                    onClick={closeGradeModal}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-4 md:p-6">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    <div>
                        <span className="text-sm text-gray-600">Test Date:</span>
                        <span className="ml-2 font-medium">{getFormattedDate()}</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-4">
                        <div className="flex items-center">
                            <span className="mr-2 text-sm text-gray-600">Average Load Time:</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{detailedResults.AvgLoadTime} ms</span>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {(() => {
                            // Group results by category
                            const categories = {};
                            detailedResults.EvaluationDetails.forEach(result => {
                                if (!categories[result.category]) {
                                    categories[result.category] = { total: 0, passed: 0 };
                                }
                                categories[result.category].total++;
                                if (result.score > 0) {
                                    categories[result.category].passed++;
                                }
                            });
                            
                            return Object.keys(categories).map(category => {
                                const { total, passed } = categories[category];
                                const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
                                const colorClass = 
                                    passRate >= 70 ? 'bg-green-100 text-green-800 border-green-200' :
                                    passRate >= 40 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-red-100 text-red-800 border-red-200';
                                
                                return (
                                    <div key={category} className={`p-3 rounded-lg border ${colorClass}`}>
                                        <h6 className="font-semibold mb-1">{category}</h6>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Pass Rate:</span>
                                            <span className="font-bold">{passRate}%</span>
                                        </div>
                                        <div className="mt-2 w-full bg-white rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${
                                                    passRate >= 70 ? 'bg-green-500' :
                                                    passRate >= 40 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${passRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* Accordion Categories */}
                <div className="space-y-4">
                    {(() => {
                        // Group results by category
                        const groupedResults = {};
                        detailedResults.EvaluationDetails.forEach(result => {
                            if (!groupedResults[result.category]) {
                                groupedResults[result.category] = [];
                            }
                            groupedResults[result.category].push(result);
                        });
                        
                        // Category background colors
                        const categoryColors = {
                            "Essential": "bg-purple-50 border-purple-200",
                            "Efficiency": "bg-blue-50 border-blue-200",
                            "Required": "bg-indigo-50 border-indigo-200"
                        };
                        
                        // Category icon classes
                        const categoryIcons = {
                            "Essential": "text-purple-500",
                            "Efficiency": "text-blue-500",
                            "Required": "text-indigo-500"
                        };
                        
                        return Object.keys(groupedResults).map((category, index) => (
                            <div key={index} className={`border rounded-lg overflow-hidden ${categoryColors[category] || 'border-gray-200'}`}>
                                <div 
                                    className="flex items-center justify-between p-4 cursor-pointer"
                                    onClick={() => {
                                        document.getElementById(`accordion-${index}`).classList.toggle('hidden');
                                        document.getElementById(`chevron-${index}`).classList.toggle('rotate-180');
                                    }}
                                >
                                    <div className="flex items-center">
                                        {category === "Essential" && (
                                            <svg className={`h-5 w-5 mr-2 ${categoryIcons[category]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        )}
                                        {category === "Efficiency" && (
                                            <svg className={`h-5 w-5 mr-2 ${categoryIcons[category]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        )}
                                        {category === "Required" && (
                                            <svg className={`h-5 w-5 mr-2 ${categoryIcons[category]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        )}
                                        <h6 className="font-semibold text-gray-800">{category}</h6>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <span className="mr-3 text-sm font-medium">
                                            {groupedResults[category].filter(item => item.score > 0).length} / {groupedResults[category].length} passed
                                        </span>
                                        <svg 
                                            id={`chevron-${index}`}
                                            className="h-5 w-5 transition-transform duration-300" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <div id={`accordion-${index}`} className="hidden">
                                    <div className="px-4 pb-4">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Test Case</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Selector</th>
                                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Property</th>
                                                    <th className="py-3 px-4 text-center font-semibold text-gray-700 w-24">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {groupedResults[category].map((result, resultIndex) => (
                                                    <tr key={resultIndex} className="hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-sm">{result.name}</td>
                                                        <td className="py-3 px-4 text-sm font-mono text-blue-600">
                                                            {result.ReviewDetails?.selector || '-'}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm font-mono text-green-600">
                                                            {result.ReviewDetails?.property || '-'}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {result.score > 0 ? (
                                                                <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                                    <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    Pass
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                                                    <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                    Fail
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ));
                    })()}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
                    <button 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-5 py-2 rounded-lg transition duration-200 hover:shadow-md w-full sm:w-auto flex items-center justify-center"
                        onClick={closeGradeModal}
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

{isGradeModalOpenII && (
    <div 
        className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-400 p-4 ${
            isModalClosing ? 'opacity-0' : 'opacity-100'
        }`}
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
        <div 
            className={`bg-white w-full max-w-2xl rounded-lg shadow-xl transform transition-all duration-400 ${
                isModalClosing 
                    ? 'opacity-0 scale-90 -translate-y-4' 
                    : 'opacity-100 scale-100 translate-y-0'
            } max-h-[90vh] overflow-auto`}
        >
            <div className="p-4 md:p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-lg sticky top-0 z-10">
                <h5 className="text-lg md:text-xl font-bold text-gray-800">Assessment Grade Report</h5>
                <button 
                    className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200 hover:scale-110" 
                    onClick={closeGradeModal}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-4 md:p-6">
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    <div>
                        <span className="text-sm text-gray-600">Test Date:</span>
                        <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    {/* {detailedResultsII && (
                        <div className="flex items-center flex-wrap gap-4">
                            <div className="flex items-center">
                                <span className="mr-2 text-sm text-gray-600">Overall:</span>
                                {(detailedResultsII.functional?.every(test => test.passed) && 
                                 detailedResultsII.performance?.every(test => test.isResponsive !== false)) ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Pass</span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Fail</span>
                                )}
                            </div>
                        </div>
                    )} */}
                </div>

                {/* Functional Tests Section */}
                {detailedResultsII?.functional && detailedResultsII.functional.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-md font-semibold text-gray-700 mb-3">Functional Tests</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">#</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Test Name</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                                        {/* <th className="py-3 px-4 text-left font-semibold text-gray-700">Timestamp</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {detailedResultsII.functional.map((test, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm">{index + 1}.</td>
                                            <td className="py-3 px-4 text-sm">{test.testName}</td>
                                            <td className="py-3 px-4">
                                                {test.passed ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Pass</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Fail</span>
                                                )}
                                            </td>
                                            {/* <td className="py-3 px-4 text-sm">
                                                {test.timestamp ? new Date(test.timestamp).toLocaleTimeString() : 'N/A'}
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Performance Tests Section */}
                {detailedResultsII?.performance && detailedResultsII.performance.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-md font-semibold text-gray-700 mb-3">Performance Tests</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">#</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Test Name</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Details</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {detailedResultsII.performance.map((test, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm">{index + 1}.</td>
                                            <td className="py-3 px-4 text-sm">{test.testName}</td>
                                            <td className="py-3 px-4 text-sm">
                                                {test.testName === "Concurrent Load Time" ? (
                                                    <span>Avg: {test.averageLoadTime?.toFixed(1) || 'N/A'}ms ({test.concurrentUsers || 'N/A'} users)</span>
                                                ) : test.viewport ? (
                                                    <span>Viewport: {test.viewport.width}x{test.viewport.height}</span>
                                                ) : (
                                                    <span>N/A</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {test.isResponsive !== undefined ? (
                                                    test.isResponsive ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Pass</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Fail</span>
                                                    )
                                                ) : (
                                                    test.averageLoadTime && test.averageLoadTime < 2000 ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Pass</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Fail</span>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Error Details Section - Only shown if there are failures */}
                {detailedResultsII?.functional && detailedResultsII.functional.some(test => !test.passed) && (
                    <div className="mb-6">
                        <h3 className="text-md font-semibold text-gray-700 mb-3">Error Details</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {detailedResultsII.functional
                                .filter(test => !test.passed)
                                .map((test, index) => (
                                    <div key={index} className="mb-3 last:mb-0">
                                        <h4 className="font-medium text-red-700">{test.testName}</h4>
                                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">{test.error || 'Unknown error'}</pre>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
                    <button 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition duration-200 hover:shadow-md w-full sm:w-auto"
                        onClick={closeGradeModal}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

{notRunning && (
    <div 
        className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-400 p-4 ${
            isModalClosing ? 'opacity-0' : 'opacity-100'
        }`}
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
        <div 
            className={`relative bg-white w-full max-w-2xl rounded-lg shadow-xl transform transition-all duration-400 ${
                isModalClosing 
                    ? 'opacity-0 scale-90 -translate-y-4' 
                    : 'opacity-100 scale-100 translate-y-0'
            } max-h-[90vh] overflow-auto`}
        >
            {/* ❌ Close Button */}
            <button 
                onClick={() => setIsModalClosing(true)} 
                className="absolute top-3 right-3 z-50 text-gray-600 hover:text-black text-2xl font-bold focus:outline-none"
            >
                &times;
            </button>

            <div className="shadow-md p-4 animation">
            
                      <h2 className="text-xl font-semibold text-gray-800 mb-2 headingcolor"> Configuration Setup</h2>
                      <p className="text-gray-700 mb-2">Before starting the development:</p>
                      <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                        <li><strong>Step 1:</strong> Open the terminal and install the required npm modules.</li>
                        <div>
            
                          <img src="/npminstall.png" className="animation"/>
                        </div>
                        <li><strong>Step 2:</strong>Type the Command to run the react/vue application</li>
                        <div>
                          <img src="/npmrundev.png" className="animation"/>
                        </div>
                        <li><strong>Step 3:</strong> Check the App.js (for React) or App.vue (for Vue) file to understand the structure and the class names used.</li>
                        <li>Based on those class names, create appropriate styles in the <code>App.css</code></li>
                        <li>Also, review the <code>index.html</code> file located in the project folder to ensure that your layout aligns with any HTML structure-related test cases. This helps you meet all DOM and layout requirements during validation. </li>
                        <li><strong>Step 4:</strong> Click the <code>Output</code> button to view your output.</li>
                        <strong>You click on the <code>Guidelines</code> button in the assessment page if you have any queries. </strong>
                      </ul>
                    </div>
        </div>
    </div>
)}

{isSubmitting && (
   <div className="fixed inset-0 z-50 flex items-center  justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[450px]">
    <h2 className="text-2xl font-semibold text-blue-600 mb-2">Executing Your Assessment</h2>
    <p className="text-gray-700">Hold on while we validate your code...</p>
        <div className="mt-4">
            <svg className="mx-auto h-8 w-8 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    </div>
    </div>
)}

        </>
    );
}


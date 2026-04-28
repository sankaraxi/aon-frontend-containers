import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import GuidelinesSideBar from "../Guidelines/GuidelinesSideBar";
import A1L1Q01Question from "../Questions/A1L1Q1Question";
import A1L1Q02Question from "../Questions/A1L1Q2Question";
import A1L1Q03Question from "../Questions/A1L1Q3Question";
import { useAssessmentProtection } from '../utils/useAssessmentProtection';

export default function CodeMenu() {
    const { id, question } = useParams();
    const [timeLeft, setTimeLeft] = useState(null);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [isModalClosing, setIsModalClosing] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [detailedResults, setDetailedResults] = useState([]);
    const [detailedResultsII, setDetailedResultsII] = useState({});
    const [isGradeModalOpenII, setIsGradeModalOpenII] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const [notRunning, setNotRunning] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const submittingRef = useRef(false);  
    const startWorkspaceTrackedRef = useRef(false);
    const timerExpiredRef = useRef(false);
    const isOnlineRef = useRef(navigator.onLine);
    const pausedTimeLeftRef = useRef(null);
    const userId = sessionStorage.getItem("userId");
    const launchTokenId = sessionStorage.getItem("launchTokenId") || sessionStorage.getItem("userId");
    const aonId = sessionStorage.getItem("aonId");
    const userRole = sessionStorage.getItem("userRole");
    const userQuestion = sessionStorage.getItem("userQues");
    const framework = sessionStorage.getItem("framework");
    const dockerPort = sessionStorage.getItem("dockerPort");
    
    const outputPort = sessionStorage.getItem("outputPort");
    // console.log('dockerPort in CodeMenu:', outputPort);

    const [logData, setLogData] = useState(null);

    // Auto-submit callback for tab switch protection
    // reason: 'timer_expired_with_dev_server' | 'timer_expired_no_dev_server' | 'tab_switch' (resolved inside)
    const handleAutoSubmit = useCallback(async (reason = 'timer_expired') => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setIsSubmitting(true);
        setIsSubmittingFinal(true);
        let redirectUrl = null;

        if (userRole === '3' || userRole === '4') {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/submit-final`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        aonId: aonId,
                        framework: framework,
                        outputPort: outputPort,
                        userQuestion: userQuestion,
                        autoSubmit: true,
                        reason: reason,
                    }),
                });
                const data = await response.json();

                if (data.devServerNotRunning) {
                    // Dev server not running — determine the right message based on trigger
                    const noDevReason = reason === 'tab_switch'
                        ? 'The candidate was auto-submitted due to repeated tab switching and the development server was not running at the time of submission.'
                        : 'The timer has expired and the candidate did not start the development server. No assessment was evaluated.';
                    console.log('Dev server not running during auto-submit, submitting without assessment...');
                    const noAssessResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/submit-no-assessment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            aonId: aonId,
                            message: noDevReason,
                        }),
                    });
                    const noAssessData = await noAssessResponse.json();
                    if (noAssessData.redirect_url) {
                        redirectUrl = noAssessData.redirect_url;
                    }
                } else {
                    if (data.redirect_url) {
                        redirectUrl = data.redirect_url;
                    }
                }
            } catch (err) {
                console.error('Error in auto-submission:', err);
            }
        }

        try {
            await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/cleanup-docker-2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: aonId, question: userQuestion, framework: framework }),
            });
        } catch (error) {
            console.error('Failed to clean up Docker:', error);
        }

        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('examEndTime');
        sessionStorage.removeItem('launchToken');
        sessionStorage.removeItem('tabSwitchCount');
        sessionStorage.removeItem('assessmentFullscreen');

        window.location.replace(redirectUrl || sessionStorage.getItem('redirectUrl') || '/');
    }, [aonId, framework, outputPort, userQuestion, userRole]);

    // Assessment protection: fullscreen + tab switch detection with auto-submit
    useAssessmentProtection({
        enabled: sessionStorage.getItem('assessmentFullscreen') === 'true',
        isCodeEditorPage: true,
        onAutoSubmit: handleAutoSubmit,
        redirectUrl: sessionStorage.getItem('redirectUrl'),
    });


    console.log(notRunning);

    // Close question/guidelines panels when the user clicks inside the editor iframe.
    // Clicking inside an iframe moves focus there, firing window.blur on the parent.
    useEffect(() => {
        const handleWindowBlur = () => {
            // setTimeout 0 lets the browser update document.activeElement first
            setTimeout(() => {
                if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
                    setShowGuidelines(false);
                    setShowQuestion(false);
                }
            }, 0);
        };
        window.addEventListener('blur', handleWindowBlur);
        return () => window.removeEventListener('blur', handleWindowBlur);
    }, []);
    
    useEffect(() => {
        const fetchUserLog = async () => {
            try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/time-left/${launchTokenId}`);
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
            if (startWorkspaceTrackedRef.current) return;

            const launchToken = sessionStorage.getItem("launchToken");
            const currentLaunchTokenId = sessionStorage.getItem("launchTokenId") || sessionStorage.getItem("userId");

            if (!launchToken || !currentLaunchTokenId || !(userRole === '3' || userRole === '4')) {
                return;
            }

            const trackWorkspaceStart = async () => {
                try {
                    startWorkspaceTrackedRef.current = true;
                    const workspaceUrl = window.location.pathname;

                    await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/aon/start-workspace`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            launchTokenId: currentLaunchTokenId,
                            workspaceUrl,
                            framework,
                        }),
                    });
                    console.log("Workspace start tracked on timer screen visibility");
                } catch (err) {
                    startWorkspaceTrackedRef.current = false;
                    console.error("Failed to track workspace start:", err);
                }
            };

            trackWorkspaceStart();
        }, [framework, userRole]);

    // NOTE: We do NOT set timeLeft directly from logData here.
    // The timer-logic useEffect below handles initialisation using the
    // server's absolute deadline (timer_end_ms) so the timer survives
    // close / reopen without restarting.

    // Auto-submit when timer reaches 0
    useEffect(() => {
        if (timeLeft === 0 && !timerExpiredRef.current && !submittingRef.current) {
            timerExpiredRef.current = true;
            Swal.fire({
                icon: 'warning',
                title: 'Time\'s Up!',
                text: 'Your assessment time has expired. Auto-submitting now...',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33',
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: 4000,
                timerProgressBar: true,
            }).then(() => {
                handleAutoSubmit('timer_expired');
            });
        }
    }, [timeLeft, handleAutoSubmit]);

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
    
    // Track online/offline status
useEffect(() => {
  const goOffline = () => {
    if (!isOnlineRef.current) return; // Already offline, don't overwrite paused value
    console.log("Network lost — pausing timer");
    isOnlineRef.current = false;

    // Snapshot the current timeLeft so we can restore it exactly on reconnect
    const endTime = sessionStorage.getItem("examEndTime");
    if (endTime) {
      const diff = Math.floor((new Date(endTime) - new Date()) / 1000);
      pausedTimeLeftRef.current = diff > 0 ? diff : 0;
    }
    setIsOnline(false);
  };

  const goOnline = () => {
    if (isOnlineRef.current) return; // Already online
    console.log("Network restored — resuming timer");
    isOnlineRef.current = true;

    // Recompute examEndTime from the frozen value so no time is lost
    if (pausedTimeLeftRef.current !== null && pausedTimeLeftRef.current > 0) {
      const newEndTime = new Date(Date.now() + pausedTimeLeftRef.current * 1000);
      sessionStorage.setItem("examEndTime", newEndTime.toISOString());
      console.log(`Timer resumed at ${pausedTimeLeftRef.current}s remaining`);
    }
    pausedTimeLeftRef.current = null;
    setIsOnline(true);
  };

  // Heartbeat with a short timeout so we detect offline quickly
  const checkServerHeartbeat = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/heartbeat`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Server error");

      // Heartbeat succeeded → we're online
      goOnline();
    } catch {
      clearTimeout(timeoutId);
      // Heartbeat failed → we're offline
      goOffline();
    }
  };

  const intervalId = setInterval(checkServerHeartbeat, 1000);

  const handleOffline = () => { goOffline(); };

  window.addEventListener("online", goOnline);
  window.addEventListener("offline", handleOffline);

  // Run one heartbeat immediately on mount so we don't wait for the first interval
  checkServerHeartbeat();

  return () => {
    clearInterval(intervalId);
    window.removeEventListener("online", goOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);

// Timer logic
useEffect(() => {
  // Generate sessionId if not present
  if (!sessionStorage.getItem("sessionId")) {
    const uuid = "session-" + Math.random().toString(36);
    sessionStorage.setItem("sessionId", uuid);
  }

  const initializeTimer = () => {
    const defaultDuration = 1800; // 30 minutes in seconds

    // ── Always prefer the server's absolute deadline ───────────────────
    // logData.timer_end_ms is an epoch timestamp the backend computed.
    // Using it directly means close → reopen keeps the same deadline.
    const serverDeadlineMs = logData?.timer_end_ms;
    const serverRemainingMs = logData?.closing_time_ms;

    // Compute the authoritative deadline from server data.
    // DEADLINE_EPOCH_THRESHOLD: values above this are absolute epoch timestamps,
    // values below are remaining-ms durations (mirrors the backend constant).
    const DEADLINE_EPOCH_THRESHOLD = 1_000_000_000_000;

    let deadlineMs = null;

    if (serverDeadlineMs && Number.isFinite(serverDeadlineMs) && serverDeadlineMs > DEADLINE_EPOCH_THRESHOLD) {
      // Server has a recorded epoch deadline.
      if (serverDeadlineMs > Date.now()) {
        // Still in the future — use it.
        deadlineMs = serverDeadlineMs;
      } else {
        // Deadline has already passed — timer expired while user was away.
        // Do NOT reset to 30 mins; treat as expired immediately.
        console.warn("Server deadline has passed — timer expired, triggering expiry");
        setTimeLeft(0);
        return;
      }
    } else if (serverRemainingMs && Number.isFinite(serverRemainingMs) && serverRemainingMs > 1000) {
      deadlineMs = Date.now() + serverRemainingMs;
    }

    const savedEndTime = sessionStorage.getItem("examEndTime");

    if (deadlineMs) {
      // Server has a valid deadline — always use it (it survives close/reopen).
      const serverEndIso = new Date(deadlineMs).toISOString();

      // Only overwrite sessionStorage if it differs significantly (>2 s drift)
      // to avoid needlessly resetting a perfectly valid local value.
      if (savedEndTime) {
        const localDeadline = new Date(savedEndTime).getTime();
        if (Math.abs(localDeadline - deadlineMs) > 2000) {
          console.log("Syncing examEndTime with server deadline");
          sessionStorage.setItem("examEndTime", serverEndIso);
        }
      } else {
        sessionStorage.setItem("examEndTime", serverEndIso);
      }

      const diff = Math.floor((deadlineMs - Date.now()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
      return;
    }

    // ── Fallback: no valid server deadline ─────────────────────────────
    if (savedEndTime) {
      const endTimeDate = new Date(savedEndTime);
      if (!isNaN(endTimeDate.getTime())) {
        const diff = Math.floor((endTimeDate - new Date()) / 1000);
        if (diff > 0) {
          setTimeLeft(diff);
          return;
        }
        // savedEndTime exists but has passed — treat as expired, not a fresh start.
        console.warn("examEndTime has passed and no server deadline — timer expired");
        sessionStorage.removeItem("examEndTime");
        setTimeLeft(0);
        return;
      }
      // Unparseable value — clear it and fall through to default.
      console.warn("Invalid examEndTime format — clearing and using default");
      sessionStorage.removeItem("examEndTime");
    }

    // No server deadline and no prior session — fresh 30-min default.
    setTimeLeft(defaultDuration);
    const endTime = new Date(Date.now() + defaultDuration * 1000);
    sessionStorage.setItem("examEndTime", endTime.toISOString());
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
      console.error("Failed to auto-start session timer:", err);
    }
  };

  // Initialize timer only if logData is available
  if (logData && logData.status !== null) {
    initializeTimer();
    if (logData?.log_status === 2) {
      autoStartTimer();
    }
  }

  // Update timer every second — reads ref so it reacts instantly to offline
  const updateTimer = () => {
    if (!isOnlineRef.current) return; // Freeze display while offline
    const endTime = sessionStorage.getItem("examEndTime");
    if (!endTime) {
      // examEndTime not yet initialised (API still loading) — wait, never force to 0
      return;
    }
    const endTimeDate = new Date(endTime);
    if (isNaN(endTimeDate.getTime())) {
      console.warn("Invalid examEndTime, stopping timer");
      setTimeLeft(0);
      return;
    }
    const diff = Math.floor((endTimeDate - new Date()) / 1000);
    setTimeLeft(diff > 0 ? diff : 0);
  };

  const intervalId = setInterval(updateTimer, 1000);
  return () => clearInterval(intervalId);
}, [logData]);

      
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;


    const openGradeModal = () => {
        setIsModalClosing(false);
        setIsGradeModalOpen(true);
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
            // Pre-check: ensure the dev server is running before executing the test
            try {
                const checkRes = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/check-dev-server`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ outputPort }),
                });
                const checkData = await checkRes.json();
                if (!checkData.running) {
                    setShowGuidelines(true);
                    setShowQuestion(false);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Application Not Running',
                        text: 'Your development server is not running. Please follow the guidelines to start your application before running the test.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3085d6',
                    });
                    return;
                }
            } catch {
                // If the pre-check itself fails, fall through and let the assessment handle it
            }

            setIsSubmitting(true)   
            if(userQuestion === 'a1l1q3'){
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/run-Assesment`, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId:aonId, framework:framework, outputPort: outputPort
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
                            userId:aonId, framework:framework, outputPort: outputPort
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
                            userId:aonId, framework:framework, outputPort: outputPort
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
        setShowConfirmModal(true);
    }

    const handleConfirmSubmit = async () => {
        // Guard: skip if already submitting via timer
        if (submittingRef.current) return;
        submittingRef.current = true;

        setShowConfirmModal(false);
        setIsSubmitting(true);
        setIsSubmittingFinal(true);
        let redirectUrl = null;

        // Step 1: Submit final assessment (runs test + sends webhook from backend)
        if (userRole === '3' || userRole === '4') {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/submit-final`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        aonId: aonId,
                        framework: framework,
                        outputPort: outputPort,
                        userQuestion: userQuestion
                    }),
                });
                const data = await response.json();
                console.log('Final submission response:', data);

                // If dev server is not running, show guidelines instead of submitting
                if (data.devServerNotRunning) {
                    setIsSubmitting(false);
                    submittingRef.current = false;
                    setShowGuidelines(true);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Application Not Running',
                        text: 'Your development server is not running. Please follow the guidelines to start your application before submitting.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3085d6',
                    });
                    return;
                }

                console.log('redirect_url from response:', data.redirect_url);
                if (data.redirect_url) {
                    redirectUrl = data.redirect_url;
                }
            } catch (err) {
                console.error('Error in final submission:', err);
            }
        }

        // Step 2: Cleanup docker
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/cleanup-docker-2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: aonId, question: userQuestion, framework: framework }),
            });
        } catch (error) {
            console.error('Failed to clean up Docker:', error);
        }

        // Step 3: Clear session and redirect
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('examEndTime');
        sessionStorage.removeItem('launchToken');
        sessionStorage.removeItem('tabSwitchCount');
        sessionStorage.removeItem('assessmentFullscreen');

        window.location.replace(redirectUrl || sessionStorage.getItem('redirectUrl') || '/');
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
                    <button onClick={() => { setShowQuestion(!showQuestion); setShowGuidelines(false); }} className="bg-white hover:bg-blue-200 text-black px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md">
                        Question
                    </button>
                    <button onClick={() => { setShowGuidelines(!showGuidelines); setShowQuestion(false); }} className="bg-white hover:bg-blue-200 text-black px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md">
                        Guidelines
                    </button>
                    
                    
                    
                        <button onClick={runScript} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md">Run Test</button>
                    
                    
                        <button onClick={handleLogoutClick} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md">Submit Assessment</button>
                   
                    
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
                    
                    {/* Network status indicator */}
                    {!isOnline && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-lg animate-pulse">
                            Offline
                        </div>
                    )}


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
                        <button onClick={runScript} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md w-full">Run Test</button>
                    {/* </Link> */}
                    
                        <button onClick={handleLogoutClick} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium shadow-md w-full">Submit Assessment</button>
                    
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
                    
                    {/* Network status indicator for mobile */}
                    {!isOnline && (
                        <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-center animate-pulse">
                            Offline
                        </div>
                    )}
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

{showQuestion &&(
    <div className="fixed right-0 h-full w-[55%] bg-white shadow-lg z-50 overflow-y-auto p-6">
    
    {/* Close Button */}
    <div className="flex bg-amber-50 rounded-full justify-end">
      <button
        onClick={() => setShowQuestion(false)}
        className="fixed text-gray-500  p-2  hover:text-black transition duration-200 text-2xl font-semibold focus:outline-none"
        aria-label="Close Guidelines Panel"
      >
        <p className="text-xl font-extrabold">✕</p>
      </button>
    </div>

    <div className="pb-4">
    {/* <A1L1Question /> */}
    <>
        {question === "a1l1q3" && <A1L1Q03Question />}
        {question === "a1l1q2" && <A1L1Q02Question />}
        {question === "a1l1q1" && <A1L1Q01Question />}
        </>
    
</div>
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
                    <div className="grid grid-cols-1 justify-center sm:grid-cols-2 gap-4">
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
                                        <h6 className="font-semibold mb-1 h-7">{category}</h6>
                                        <div className="flex pt-2 justify-between items-center">
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
        onClick={() => setIsModalClosing(true)}
        className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-400 p-4 ${
            isModalClosing ? 'opacity-0' : 'opacity-100'
        }`}
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
        <div 
            onClick={(e) => e.stopPropagation()}
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
                <GuidelinesSideBar />
            </div>
        </div>
    </div>
)}

{showConfirmModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center w-[450px] max-w-[90vw]">
            <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Are you sure you want to submit?</h2>
            <p className="text-gray-600 mb-6">Once submitted, you will not be able to make any further changes to your assessment. Your code will be evaluated and you will be logged out.</p>
            <div className="flex gap-3 justify-center">
                <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirmSubmit}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition duration-200 shadow-md"
                >
                    Yes, Submit
                </button>
            </div>
        </div>
    </div>
)}

{isSubmitting && (
   <div className="fixed inset-0 z-50 flex items-center  justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[450px]">
    <h2 className="text-2xl font-semibold text-blue-600 mb-2">
        {isSubmittingFinal ? 'Submitting Your Assessment' : 'Executing Your Assessment'}
    </h2>
    <p className="text-gray-700">
        {isSubmittingFinal ? 'Please wait while we submit and evaluate your code…' : 'Hold on while we validate your code...'}
    </p>
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

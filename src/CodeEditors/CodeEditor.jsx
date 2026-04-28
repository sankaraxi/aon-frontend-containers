import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTabClaim } from '../utils/useTabClaim';

function WorkspaceLoader() {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#291571]">
      <div className="flex flex-col items-center gap-6">
        {/* Spinning ring */}
        <svg className="h-16 w-16 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <div className="text-center">
          <p className="text-white text-2xl font-semibold tracking-wide">Loading Workspace</p>
          <p className="text-white/60 text-sm mt-1">Setting up your coding environment…</p>
        </div>
        {/* Animated dots bar */}
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-white/70"
              style={{ animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out` }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function CodeEditor() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [outputLoaded, setOutputLoaded] = useState(false);
    const [devServerStatus, setDevServerStatus] = useState('idle'); // 'idle' | 'checking' | 'running' | 'not-running'
    const userRole = sessionStorage.getItem("userRole");

    const {id , framework,dPort, oPort} = useParams();

    console.log("ID:", id);
    console.log("Framework:", framework);

    // const userId = sessionStorage.getItem("userId");


    // const dockerPort = sessionStorage.getItem("dockerPort");
    // var outputPort = sessionStorage.getItem("outputPort");

    // const dockerVuePort = Number(sessionStorage.getItem("dockerPort")) + 1;

    // if (framework === "vue"){
    //    outputPort = Number(sessionStorage.getItem("outputPort")) + 1;
    // }

    // console.log(dockerPort,dockerVuePort, outputPort, framework);

    const navigate = useNavigate();
    const iframeRef = useRef(null);

    // Maintain single-tab lock on the code editor page
    useTabClaim({
      launchTokenId: sessionStorage.getItem('launchTokenId'),
      tabId: sessionStorage.getItem('assessmentTabId'),
      enabled: Boolean(
        sessionStorage.getItem('launchTokenId') &&
        sessionStorage.getItem('assessmentTabId')
      ),
      onEvicted: () => {
        const dest = sessionStorage.getItem('redirectUrl');
        if (dest) {
          window.location.replace(dest);
        } else {
          navigate('/');
        }
      },
    });

  // console.log(userRole);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const injectScript = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const script = iframeDoc.createElement('script');
          script.textContent = `
            document.addEventListener('paste', (e) => {
              e.preventDefault();
              alert('Pasting is disabled for this assessment.');
            });
            document.addEventListener('copy', (e) => {
              e.preventDefault();
              alert('Copying is disabled for this assessment.');
            });
          `;
          iframeDoc.head.appendChild(script);
        } catch (e) {
          console.error('Failed to inject script into iframe:', e);
        }
      };
      iframe.addEventListener('load', injectScript);
      return () => iframe.removeEventListener('load', injectScript);
    }
  }, []);

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
  }, [navigate]);

  // Lock body scroll so there is no white space below the editor in fullscreen
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

function renderContent() {
  const outputSrc = framework === "react"
    ? `${import.meta.env.VITE_DOCKER_OUTPUT_PORT}${oPort}`
    : framework === "vue"
    ? 'http://13.201.235.2:5244'
    : null;

  return (
        <div className="relative" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Loading overlay — shown until the editor iframe fires onLoad */}
          {!editorLoaded && <WorkspaceLoader />}

          {framework === "react" ? (
              <iframe
              ref={iframeRef}
              src={`${import.meta.env.VITE_DOCKER_PORT}${dPort}/?folder=/home/coder/project`}
              width="100%"
              height="100%"
              style={{ border: "none", display: "block", visibility: editorLoaded ? "visible" : "hidden" }}
              title="CodeSandbox IDE"
              onLoad={() => setEditorLoaded(true)}
              />
          ) : framework === "vue" ? (
              <iframe
              ref={iframeRef}
              src='http://13.201.235.2:8151/?folder=/home/coder/project'
              width="100%"
              height="100%"
              style={{ border: "none", display: "block", visibility: editorLoaded ? "visible" : "hidden" }}
              title="CodeSandbox IDE"
              onLoad={() => setEditorLoaded(true)}
              />
          ) : (
              <p style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
              🚫 Unauthorized access. You do not have permission to view this editor.
              </p>
          )}

          {outputSrc && (
            <div className="absolute bottom-6 right-6 z-50">
              <button
                onClick={async () => {
                  setShowOutput(true);
                  setOutputLoaded(false);
                  setDevServerStatus('checking');
                  try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/check-dev-server`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ outputPort: oPort }),
                    });
                    const data = await res.json();
                    setDevServerStatus(data.running ? 'running' : 'not-running');
                  } catch {
                    setDevServerStatus('not-running');
                  }
                }}
                className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-lg
                            hover:bg-blue-700 hover:shadow-xl
                            transition duration-300 ease-in-out
                            focus:outline-none focus:ring-4 focus:ring-blue-300
                            ring-1 ring-blue-500/50 backdrop-blur-sm"
              >
                Output
              </button>
            </div>
          )}

          {/* Output overlay modal */}
          {showOutput && outputSrc && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
              <div className="relative w-[90vw] h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-3 bg-[#291571] text-white shrink-0">
                  <span className="font-semibold text-base tracking-wide">Output Preview</span>
                  <button
                    onClick={() => { setShowOutput(false); setDevServerStatus('idle'); }}
                    className="text-white hover:text-red-300 text-2xl font-bold leading-none focus:outline-none"
                    aria-label="Close output"
                  >
                    &times;
                  </button>
                </div>

                {/* Checking state */}
                {devServerStatus === 'checking' && (
                  <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 gap-4">
                    <svg className="h-10 w-10 text-[#291571] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-gray-600 text-sm font-medium">Checking development server…</p>
                  </div>
                )}

                {/* Dev server not running */}
                {devServerStatus === 'not-running' && (
                  <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-6 py-12">
                    <svg className="h-20 w-20 text-yellow-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">Development Server Not Running</h3>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-md text-center mb-2">
                      Please start your development server in the terminal before viewing the output.
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed max-w-md text-center mb-8">
                      Follow the Project Setup Guidelines to run <span className="font-mono bg-white px-2 py-1 rounded">npm run dev</span>
                    </p>
                    <button
                      onClick={async () => {
                        setDevServerStatus('checking');
                        try {
                          const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/check-dev-server`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ outputPort: oPort }),
                          });
                          const data = await res.json();
                          setDevServerStatus(data.running ? 'running' : 'not-running');
                          if (data.running) setOutputLoaded(false);
                        } catch {
                          setDevServerStatus('not-running');
                        }
                      }}
                      className="px-8 py-3 bg-[#291571] text-white rounded-lg font-semibold hover:bg-[#3d1f9e] active:scale-95 transition duration-200 shadow-md hover:shadow-lg"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Running — show iframe */}
                {devServerStatus === 'running' && (
                  <>
                    {!outputLoaded && (
                      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 gap-4">
                        <svg className="h-10 w-10 text-[#291571] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p className="text-gray-600 text-sm font-medium">Loading your output…</p>
                      </div>
                    )}
                    <iframe
                      src={outputSrc}
                      width="100%"
                      className="flex-1"
                      style={{ border: "none", display: outputLoaded ? "block" : "none" }}
                      title="Output Preview"
                      onLoad={() => setOutputLoaded(true)}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      );
}
  
    return (
        <div
          className="overflow-hidden"
          style={{ height: 'calc(100vh - 80px)' }}
        >
        {
         renderContent()
        }
        </div>
    );
}

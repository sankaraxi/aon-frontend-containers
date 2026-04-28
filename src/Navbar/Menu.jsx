import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

export default function Menu() {
  const { id } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const userId = sessionStorage.getItem("userId");

  function handleInvite(event) {
    event.preventDefault();
    var emails = document.getElementById("emailids").value;
    var emailSplit = emails.split(",");
    var key = {
      emails: emails,
    };

    if (emails === "") {
      alert("Please provide an email ID");
    } else {
      axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/text-mail`, key).then((res) => {
        if (res.data.message === "Mail send") {
          alert("Mail sent successfully");
          window.location.reload();
        } else {
          alert("Mail was not sent");
        }
      });
    }
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleInviteModal = () => {
    setInviteModalOpen(!inviteModalOpen);
  };



  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/logout`, {
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
      sessionStorage.removeItem('launchToken');
      window.location.href = '/'; // Redirect to login page
    } catch (error) {
      console.error('Failed to clean up Docker:', error);
      // Proceed with logout even if the server request fails
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('examEndTime');
      sessionStorage.removeItem('launchToken');
      window.location.href = '/'; // Redirect to login page
    }
  };
  return (
    <>
      <nav className="bg-[#291571] sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between">
          {/* Invisible spacer to preserve logo space and alignment */}
          <div className="w-20  md:w-24 md:h-20" />
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <span className="text-2xl">☰</span>
          </button>
          
          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Additional navigation links can go here */}
            
            
              {/* <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 shadow-md flex items-center font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button> */}
           
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#3a1e94] px-4 py-3 animate-fadeIn">
            <div className="flex flex-col space-y-3">
              {/* Additional mobile navigation links can go here */}
              
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 shadow-md flex items-center justify-center font-medium w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
            </div>
          </div>
        )}
      </nav>

      {/* Invite User Modal - Make it controlled by state
      {inviteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl transform transition-all duration-300 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3 px-6 pt-4">
              <h5 className="text-lg font-semibold text-gray-800">Invite User</h5>
              <button 
                className="text-gray-500 hover:text-gray-700 transition duration-200"
                onClick={toggleInviteModal}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleInvite}>
                <textarea
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  id="emailids"
                  rows="4"
                  placeholder="Enter email addresses..."
                ></textarea>
                <p className="text-sm text-gray-500 mt-2">
                  You may specify multiple email addresses by separating them with commas
                </p>
                <div className="flex justify-end mt-6 space-x-2">
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition duration-200"
                    onClick={toggleInviteModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 shadow-md"
                  >
                    Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )} */}

      {/* Optional: Button to open the invite modal */}
      {/* <div className="fixed bottom-6 right-6">
        <button 
          onClick={toggleInviteModal}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div> */}
    </>
  );
}
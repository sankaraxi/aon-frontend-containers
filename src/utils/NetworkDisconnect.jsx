import React, { useEffect } from 'react';

const NetworkAutoCloser = () => {
  useEffect(() => {
    const handleOffline = () => {
      window.location.reload()
      alert('Network disconnected. The app will now close.');
      
      window.close();
 // ✅ Only works for popup windows opened via JavaScript
    };

    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
};

export default NetworkAutoCloser;

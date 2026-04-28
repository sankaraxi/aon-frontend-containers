import React, { useState } from 'react';

const PortfolioCard = () => {
  const [showModal, setShowModal] = useState(false);
  const [studentData, setStudentData] = useState({
    name: '',
    profileUrl: '',
    domainImgUrl: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const profileUrl = form.profileUrl.value;
    const domainImgUrl = form.domainImgUrl.value;
    if (!name || !profileUrl) return alert('Please fill all required fields');
    setStudentData({ name, profileUrl, domainImgUrl });
    setShowModal(false);
    form.reset();
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      background: 'url("https://images.unsplash.com/photo-1503264116251-35a269479413") no-repeat center center fixed',
      backgroundSize: 'cover'
    }}>
      <div style={{
        backgroundColor: '#e6f9fc',
        padding: '30px 20px',
        maxWidth: '400px',
        textAlign: 'center',
        borderRadius: '15px',
      }}>
        {studentData.profileUrl && (
          <img
            src={studentData.profileUrl}
            alt="Profile"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
            }}
          />
        )}
        {studentData.name && (
          <h2>
            <a href="#" style={{ color: 'blue', textDecoration: 'none' }}>{studentData.name}</a>
          </h2>
        )}
        {studentData.domainImgUrl && (
          <img
            src={studentData.domainImgUrl}
            alt="Domain Badge"
            style={{
              width: '80px',
              marginTop: '10px',
            }}
          />
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'end',
          marginTop: '10px',
        }}>
          <button onClick={() => setShowModal(true)}>Add Personal Info</button>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            minWidth: '300px'
          }}>
            <form onSubmit={handleSubmit}>
              <label>
                Name:<br />
                <input type="text" name="name" required />
              </label>
              <br /><br />
              <label>
                Profile Image URL:<br />
                <input type="url" name="profileUrl" required />
              </label>
              <br /><br />
              <label>
                Domain Badge Image URL (Optional):<br />
                <input type="url" name="domainImgUrl" />
              </label>
              <br /><br />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCard;
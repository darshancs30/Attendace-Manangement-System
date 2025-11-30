import React from 'react';
import { useSelector } from 'react-redux';
import './Profile.css';

const EmployeeProfile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="container">
      <h1>My Profile</h1>
      <div className="card profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2>{user?.name}</h2>
        </div>
        <div className="profile-details">
          <div className="profile-item">
            <label>Employee ID:</label>
            <span>{user?.employeeId}</span>
          </div>
          <div className="profile-item">
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
          <div className="profile-item">
            <label>Department:</label>
            <span>{user?.department}</span>
          </div>
          <div className="profile-item">
            <label>Role:</label>
            <span className="badge badge-info">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;


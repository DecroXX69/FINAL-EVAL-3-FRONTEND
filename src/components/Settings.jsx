import React, { useState, useEffect } from 'react'; 
import { Eye, EyeOff, LogOut } from 'lucide-react';
import styles from './Settings.module.css';
import { updateUserDetails, updatePassword } from '../services/api';
const Settings = () => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      oldPassword: '',
      newPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
  
   
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
  
      try {
        const userId = localStorage.getItem('UserId');
        
        // Update user details if name or email changed
        if (formData.name || formData.email) {
          const updates = {};
          if (formData.name) updates.username = formData.name;
          if (formData.email) updates.email = formData.email;
          
          await updateUserDetails(userId, updates);
          
          // Update localStorage with new values
          if (formData.name) localStorage.setItem('username', formData.name);
          if (formData.email) localStorage.setItem('email', formData.email);
        }
  
        // Update password if both old and new passwords are provided
        if (formData.oldPassword && formData.newPassword) {
          await updatePassword(userId, formData.oldPassword, formData.newPassword);
          
          setFormData({
            name: '',
            email: '',
            oldPassword: '',
            newPassword: ''
          });
      
         
        }
  
        setSuccess('Settings updated successfully');
      } catch (err) {
        setError(err.message || 'Failed to update settings');
      }
    };
  
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };
  
    const handleLogout = () => {
      localStorage.clear();
      window.location.href = '/auth';
    };
  
  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Settings</h1>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="name"
            placeholder="Name"
           
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.inputWithIcon}>
            <input
              type="email"
              name="email"
              placeholder="Update Email"
             
              onChange={handleChange}
              className={styles.input}
            />
            <Eye size={20} className={styles.icon} />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.inputWithIcon}>
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              placeholder="Old Password"
              
              onChange={handleChange}
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className={styles.eyeButton}
            >
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.inputWithIcon}>
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
             
              onChange={handleChange}
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className={styles.eyeButton}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.updateButton}>
          Update
        </button>
      </form>

      <button onClick={handleLogout} className={styles.logoutButton}>
        <LogOut size={20} />
        <span>Log out</span>
      </button>
    </div>
  );
};
export default Settings;
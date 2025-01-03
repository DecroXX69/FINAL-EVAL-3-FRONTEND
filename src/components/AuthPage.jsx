import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/api';
import styles from './AuthPage.module.css';
import triangleImg from '../assets/Triangle.png';
import semicircleRight from '../assets/Semicircle1.png';
import semicircleBottom from '../assets/Semicircle2.png';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const data = await login({ email: formData.email, password: formData.password });
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('workspaceId', data.workspaceId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('UserId', data.userId);
        
        const pendingShare = localStorage.getItem('pendingShare');
        const originalShareUrl = localStorage.getItem('originalShareUrl');
       
        if (pendingShare && originalShareUrl) {
          window.location.href = originalShareUrl;
        } else {
          navigate('/workspace');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const data = await signup({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });

        // Store user data consistently with login flow
        localStorage.setItem('token', data.token);
        localStorage.setItem('workspaceId', data.workspaceId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('UserId', data.userId || data._id); // Try userId first, fallback to _id
        
        // Force a page reload after signup to ensure workspace state is fresh
        window.location.href = '/workspace';
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className={styles.container}>
      <img src={triangleImg} alt="Triangle" className={styles.triangle} />
      <img src={semicircleRight} alt="Semicircle" className={styles.semicircleRight} />
      <img src={semicircleBottom} alt="Semicircle" className={styles.semicircleBottom} />

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter a username"
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••"
            />
          </div>

          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••"
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <button type="button" className={styles.googleButton}>
            <img src="https://www.google.com/favicon.ico" alt="Google" />
            Sign {isLogin ? 'in' : 'up'} with Google
          </button>

          <p className={styles.toggleText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className={styles.toggleButton}
            >
              {isLogin ? 'Register now' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingNavbar.module.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <img 
          src={logo}
          alt="FormBot Logo" 
          className={styles.logo}
        />
      </div>
      
      <div className={styles.buttonContainer}>
        <button 
          className={styles.signInButton}
          onClick={() => navigate('/auth')} // Redirect to AuthPage
        >
          Sign in
        </button>
        <button 
          className={styles.createButton}
          onClick={() => navigate('/auth')} // Redirect to AuthPage
        >
          Create a FormBot
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

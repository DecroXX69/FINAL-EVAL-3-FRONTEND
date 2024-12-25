// LandingPage.jsx
import React from 'react';
import Navbar from './LandingNavbar';
import Footer from './Footer';  // You'll need to create this
import styles from './LandingPage.module.css';
import hero from '../assets/container.png';
const LandingPage = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.heroSection}>
          <img 
            src={hero}
            alt="Hero" 
            className={styles.heroImage}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
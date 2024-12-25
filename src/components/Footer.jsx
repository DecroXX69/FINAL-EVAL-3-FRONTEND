// Footer.jsx
import React from 'react';
import styles from './Footer.module.css';
import logo from '../assets/logo.png';
import icon from '../assets/SVG.png';
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Logo and Made with love section */}
          <div className={styles.logoSection}>
            <img 
              src={logo}
              alt="FormBot Logo" 
              className={styles.logo}
            />
            <p className={styles.madeWith}>
              Made with ❤️ by <br />
              <a href="https://twitter.com/cuvette">@cuvette</a>
            </p>
          </div>

          {/* Product Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Product</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Status
                  <img src={    icon} alt="" className={styles.externalIcon} />
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Documentation
                  <img src={icon} alt="" className={styles.externalIcon} />
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Roadmap
                  <img src={icon} alt="" className={styles.externalIcon} />
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>Pricing</a>
              </li>
            </ul>
          </div>

          {/* Community Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Community</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Discord
                  <img src={icon} alt="" className={styles.externalIcon} />
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  GitHub repository
                  <img src={icon} alt="" className={styles.externalIcon} />
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Twitter
                  <img src={icon} alt="" className={styles.externalIcon} />
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  LinkedIn
                  <img src={icon} alt="" className={styles.externalIcon} />
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>OSS Friends</a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Company</h3>
            <ul className={styles.linkList}>
              <li><a href="#" className={styles.link}>About</a></li>
              <li><a href="#" className={styles.link}>Contact</a></li>
              <li><a href="#" className={styles.link}>Terms of Service</a></li>
              <li><a href="#" className={styles.link}>Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
/**
 * Footer Component with Developer Credits
 */

import React from 'react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.developer}>
          <p className={styles.madeBy}>Developed with ♥ by</p>
          <h3 className={styles.name}>Kyros Koh</h3>
          <div className={styles.links}>
            <a 
              href="mailto:me@kyroskoh.com" 
              className={styles.link}
              aria-label="Email Kyros Koh"
            >
              📧 me@kyroskoh.com
            </a>
            <a 
              href="https://github.com/kyroskoh" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
              aria-label="GitHub Profile"
            >
              🐙 github.com/kyroskoh
            </a>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} Sudoku Mastery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};


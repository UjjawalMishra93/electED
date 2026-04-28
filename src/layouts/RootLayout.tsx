import React from 'react';
import Navbar from '@/components/organisms/Navbar';
import Footer from '@/components/organisms/Footer';
import FloatingChat from '@/components/organisms/FloatingChat';
import styles from './RootLayout.module.css';

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout wrapping all pages with Navbar, skip-to-content, and Footer.
 * Provides the page-level structure required by WCAG 2.1 AA.
 */
const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      {/* Skip to content — WCAG 2.1 AA requirement */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <Navbar />

      <main
        id="main-content"
        className={styles.main}
        tabIndex={-1}
        aria-label="Main content"
      >
        <div className="page-enter">
          {children}
        </div>
      </main>

      <FloatingChat />
      <Footer />
    </div>
  );
};

export default RootLayout;

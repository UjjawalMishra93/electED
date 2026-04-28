import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageCircle, Clock } from 'lucide-react';
import styles from './NotFoundPage.module.css';

const NotFoundPage: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.inner}>
      <div className={styles.code} aria-hidden="true">404</div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist. Let us help you find what you need.</p>
      <div className={styles.links}>
        <Link to="/" className="btn btn-primary" id="not-found-home"><Home size={16} aria-hidden="true" /> Go Home</Link>
        <Link to="/chat" className="btn btn-secondary" id="not-found-chat"><MessageCircle size={16} aria-hidden="true" /> Ask AI</Link>
        <Link to="/timeline" className="btn btn-ghost" id="not-found-timeline"><Clock size={16} aria-hidden="true" /> View Timeline</Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;

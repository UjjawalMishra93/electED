import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Vote, Shield, ExternalLink } from 'lucide-react';
import styles from './Footer.module.css';

/**
 * Site footer with non-partisan disclaimer, source attribution, and navigation links.
 */
const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`${styles.inner} section-container`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <div className={styles.logoIcon} aria-hidden="true">
              <Vote size={18} />
            </div>
            <span className={styles.logoText}>
              Elect<span className={styles.logoAccent}>Ed</span>
            </span>
          </div>
          <p className={styles.tagline}>{t('footer.tagline')}</p>
          <div className={styles.nonPartisan}>
            <Shield size={14} aria-hidden="true" />
            <span>{t('footer.nonPartisan')}</span>
          </div>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation">
          <div className={styles.linksGrid}>
            <div>
              <h3 className={styles.linkHeading}>Features</h3>
              <ul role="list">
                <li><Link to="/chat">AI Assistant</Link></li>
                <li><Link to="/timeline">Election Timeline</Link></li>
                <li><Link to="/register">Register to Vote</Link></li>
                <li><Link to="/quiz">Civic Quiz</Link></li>
                <li><Link to="/explore">Explore Ballot</Link></li>
              </ul>
            </div>
            <div>
              <h3 className={styles.linkHeading}>Resources</h3>
              <ul role="list">
                <li>
                  <a href="https://vote.gov" target="_blank" rel="noopener noreferrer">
                    Vote.gov <ExternalLink size={11} aria-label="(opens in new tab)" />
                  </a>
                </li>
                <li>
                  <a href="https://usa.gov/absentee-voting" target="_blank" rel="noopener noreferrer">
                    USA.gov <ExternalLink size={11} aria-label="(opens in new tab)" />
                  </a>
                </li>
                <li>
                  <a href="https://ballotpedia.org" target="_blank" rel="noopener noreferrer">
                    Ballotpedia <ExternalLink size={11} aria-label="(opens in new tab)" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className="section-container">
          <p>{t('footer.copyright')}</p>
          <p className={styles.sources}>{t('footer.sources')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

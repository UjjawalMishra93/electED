import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Clock,
  UserCheck,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {

  return (
    <div className={styles.page}>
      {/* Dynamic Background Glows */}
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={`section-container ${styles.heroInner}`}>
          <div className={styles.heroBadge} aria-label="Powered by Google Gemini AI">
            <Sparkles size={14} className={styles.badgeIcon} aria-hidden="true" />
            <span>AI-Powered Civic Intelligence</span>
          </div>

          <h1 id="hero-heading" className={styles.heroTitle}>
            Demystify the <br/>
            <span className={styles.heroTitleHighlight}>Election Process</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Unbiased, factual, and verified answers about voting, candidates, and democracy — instantly provided by Google Gemini AI.
          </p>

          <div className={styles.heroCtas}>
            <Link to="/chat" className={`btn btn-primary ${styles.ctaPrimary}`}>
              <MessageSquare size={18} aria-hidden="true" />
              Chat with ElectEd
            </Link>
            <Link to="/timeline" className={`btn btn-secondary ${styles.ctaSecondary}`}>
              <Clock size={18} aria-hidden="true" />
              View Timeline
            </Link>
          </div>

          <div className={styles.trustLine}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Grounded in verified government data (USA.gov, Vote.gov)</span>
          </div>
        </div>
      </section>

      {/* ── Bento Box Features ─────────────────────────────────────── */}
      <section className={`section-padding ${styles.bentoSection}`} aria-label="Features">
        <div className="section-container">
          <div className={styles.bentoGrid}>
            
            {/* Bento Card: AI Chat (Large) */}
            <div className={`card ${styles.bentoCard} ${styles.bentoLarge}`}>
              <div className={styles.bentoBgEffect} />
              <div className={styles.bentoContent}>
                <div className={styles.bentoIconWrapper}>
                  <MessageSquare size={28} />
                </div>
                <h2>Conversational Intelligence</h2>
                <p>Ask complex questions about the Electoral College, ballot measures, and state-specific voting laws. Get plain-language, non-partisan answers.</p>
                <Link to="/chat" className={styles.bentoLink}>
                  Start asking <ArrowRight size={16} />
                </Link>
              </div>
              <div className={styles.bentoVisual} aria-hidden="true">
                <div className={styles.mockChat}>
                  <div className={styles.mockMsgUser}>How does the Electoral College work?</div>
                  <div className={styles.mockMsgAi}>The Electoral College consists of 538 electors. A majority of 270 electoral votes is required...</div>
                </div>
              </div>
            </div>

            {/* Bento Card: Timeline */}
            <div className={`card ${styles.bentoCard}`}>
              <div className={styles.bentoContent}>
                <div className={styles.bentoIconWrapper} style={{ color: '#A78BFA' }}>
                  <Clock size={28} />
                </div>
                <h2>Interactive Timeline</h2>
                <p>Track every critical stage of the election cycle, from primaries to inauguration.</p>
                <Link to="/timeline" className={styles.bentoLink}>
                  Explore stages <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Bento Card: Registration */}
            <div className={`card ${styles.bentoCard}`}>
              <div className={styles.bentoContent}>
                <div className={styles.bentoIconWrapper} style={{ color: '#34D399' }}>
                  <UserCheck size={28} />
                </div>
                <h2>Voter Registration</h2>
                <p>Check deadlines, ID requirements, and official portals for all 50 states.</p>
                <Link to="/register" className={styles.bentoLink}>
                  Check status <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Bento Card: Quiz (Wide) */}
            <div className={`card ${styles.bentoCard} ${styles.bentoWide}`}>
              <div className={styles.bentoContent}>
                <div className={styles.bentoIconWrapper} style={{ color: '#FBBF24' }}>
                  <BrainCircuit size={28} />
                </div>
                <h2>Civics Gamified</h2>
                <p>Test your knowledge with 50+ questions across 5 categories. Earn badges and prove your civic readiness.</p>
                <Link to="/quiz" className={styles.bentoLink}>
                  Take the quiz <ArrowRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

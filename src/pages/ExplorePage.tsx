import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import styles from './ExplorePage.module.css';

const DISCLAIMER = 'ElectEd presents candidate information neutrally from official sources only. No editorial judgment, endorsement, or AI-generated opinion is expressed. All information is time-stamped and sourced.';

const MEASURES = [
  { id: 'm1', name: 'Proposition 1 — Water Infrastructure Bond', plain: 'A $10 billion bond measure to fund water infrastructure repairs and drought resilience projects across the state.', proArgs: ['Addresses critical aging infrastructure', 'Creates construction jobs', 'Improves drought preparedness'], conArgs: ['Adds to state debt', 'Long repayment timeline', 'Some projects may not be shovel-ready'], source: 'Official Voter Guide 2024', sourceUrl: 'https://ballotpedia.org' },
  { id: 'm2', name: 'Amendment 2 — Minimum Wage Increase', plain: 'Increases the state minimum wage from $10 to $15/hour over 3 years.', proArgs: ['Raises living standards for low-wage workers', 'Reduces reliance on public assistance', 'Bipartisan support in similar states'], conArgs: ['Small businesses may reduce hours', 'Potential for price increases', 'Rural areas may be disproportionately affected'], source: 'State Legislative Analyst', sourceUrl: 'https://ballotpedia.org' },
];

const ExplorePage: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.header}>
      <div className="section-container">
        <h1>Ballot & Candidate Explorer</h1>
        <p>Neutral, factual information from official sources only</p>
      </div>
    </div>

    <div className="section-container section-padding">
      <div className={`card ${styles.disclaimer}`} role="note">
        <AlertCircle size={16} aria-hidden="true" />
        <p>{DISCLAIMER}</p>
      </div>

      <h2 className={styles.sectionTitle}>Sample Ballot Measures</h2>
      <p className={styles.sectionSub}>The following are example measures to demonstrate the explorer format.</p>

      <div className={styles.measuresList}>
        {MEASURES.map(m => (
          <div key={m.id} className={`card ${styles.measureCard}`}>
            <h3>{m.name}</h3>
            <p className={styles.plainSummary}><strong>Plain Language Summary:</strong> {m.plain}</p>
            <div className={styles.argsGrid}>
              <div className={styles.proCol}>
                <h4><ThumbsUp size={16} aria-hidden="true" /> Arguments In Favor</h4>
                <ul>{m.proArgs.map(a => <li key={a}>{a}</li>)}</ul>
              </div>
              <div className={styles.conCol}>
                <h4><ThumbsDown size={16} aria-hidden="true" /> Arguments Against</h4>
                <ul>{m.conArgs.map(a => <li key={a}>{a}</li>)}</ul>
              </div>
            </div>
            <div className={styles.sourceRow}>
              <span>Source: {m.source}</span>
              <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`View source on Ballotpedia (opens in new tab)`}>
                Ballotpedia <ExternalLink size={12} aria-hidden="true" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className={`card ${styles.aiPrompt}`}>
        <h3>Have Questions About Your Ballot?</h3>
        <p>Ask ElectEd AI for plain-language explanations of ballot measures, constitutional amendments, or voting procedures.</p>
        <Link to="/chat?q=Explain how to read my ballot" className="btn btn-primary" id="explore-chat-btn">Ask ElectEd AI →</Link>
      </div>
    </div>
  </div>
);

export default ExplorePage;

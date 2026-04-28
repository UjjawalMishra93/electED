import React from 'react';
import { useAuthStore } from '@/store';
import styles from './AdminPage.module.css';

const MOCK_STATS = [
  { label:'Daily Active Users', value:'1,248', change:'+12%' },
  { label:'Total Questions Asked', value:'8,432', change:'+23%' },
  { label:'Quiz Completions', value:'3,109', change:'+8%' },
  { label:'Avg. Session Length', value:'4m 32s', change:'+5%' },
];

const TOP_QUESTIONS = [
  'How do I register to vote?', 'What is the Electoral College?', 'When is Election Day?',
  'Can I vote by mail?', 'What ID do I need to vote?',
];

const AdminPage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user?.isAdmin) {
    return (
      <div className={styles.restricted}>
        <h1>🔒 Admin Access Required</h1>
        <p>This page is restricted to administrators. Please sign in with an admin account.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="section-container">
          <h1>Admin Analytics Dashboard</h1>
          <p>Anonymized usage data — no PII stored</p>
        </div>
      </div>
      <div className="section-container section-padding">
        <div className={styles.statsGrid}>
          {MOCK_STATS.map(s => (
            <div key={s.label} className={`card ${styles.statCard}`}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statChange}>{s.change} vs last week</div>
            </div>
          ))}
        </div>
        <div className={`card ${styles.topQCard}`}>
          <h2>Top Questions Asked</h2>
          <ol className={styles.topQList}>
            {TOP_QUESTIONS.map((q, i) => <li key={q}><span className={styles.rank}>{i+1}</span>{q}</li>)}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

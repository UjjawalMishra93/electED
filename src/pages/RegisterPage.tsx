import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, CheckCircle, Calendar, MapPin, AlertCircle } from 'lucide-react';
import styles from './RegisterPage.module.css';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming'
];

interface StateInfo {
  deadline: string;
  onlineReg: boolean;
  sameDay: boolean;
  idReq: string;
  regUrl: string;
  earlyVoting: string;
}

const STATE_DATA: Record<string, StateInfo> = {
  California: {
    deadline: '15 days before election (online); 1 day before election (conditional)',
    onlineReg: true, sameDay: true,
    idReq: 'No photo ID required; last 4 digits of SSN or CA ID number',
    regUrl: 'https://registertovote.ca.gov',
    earlyVoting: 'Opens 28 days before Election Day',
  },
  Texas: {
    deadline: '30 days before election',
    onlineReg: false, sameDay: false,
    idReq: 'Photo ID required (driver\'s license, passport, or other approved ID)',
    regUrl: 'https://www.sos.state.tx.us/elections/voter/index.shtml',
    earlyVoting: 'Opens 17 days before Election Day (some counties)',
  },
  'New York': {
    deadline: '25 days before election (mail); 10 days before (in-person)',
    onlineReg: true, sameDay: false,
    idReq: 'NY driver\'s license/ID or last 4 digits of SSN',
    regUrl: 'https://vote.nyc/pages/register-to-vote',
    earlyVoting: '10 days before Election Day through day before',
  },
};

const DEFAULT_STATE: StateInfo = {
  deadline: 'Varies — typically 15–30 days before election',
  onlineReg: true, sameDay: false,
  idReq: 'Varies by state — check your state\'s official website',
  regUrl: 'https://vote.gov',
  earlyVoting: 'Varies by state and county',
};

/**
 * Voter registration guide with state selector and state-specific information.
 */
const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState('');

  const info = STATE_DATA[selectedState] ?? (selectedState ? DEFAULT_STATE : null);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="section-container">
          <h1>{t('register.title')}</h1>
          <p>{t('register.subtitle')}</p>
        </div>
      </div>

      <div className={`section-container section-padding ${styles.content}`}>
        {/* State Selector */}
        <div className={`card ${styles.selectorCard}`}>
          <h2>
            <MapPin size={20} aria-hidden="true" />
            {t('register.selectState')}
          </h2>
          <div className={styles.selectorWrapper}>
            <label htmlFor="state-select" className="sr-only">
              Select your state to see registration requirements
            </label>
            <select
              id="state-select"
              className={`input ${styles.stateSelect}`}
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              aria-label="Select your state"
            >
              <option value="">-- Select your state --</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {!selectedState && (
            <div className={styles.hint}>
              <AlertCircle size={14} aria-hidden="true" />
              Select your state to see specific registration requirements and deadlines.
            </div>
          )}
        </div>

        {/* State Info */}
        {info && (
          <div className={styles.infoGrid} aria-live="polite" aria-label={`Registration information for ${selectedState}`}>
            {/* Deadline */}
            <div className={`card ${styles.infoCard}`}>
              <div className={styles.infoCardIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
                <Calendar size={22} aria-hidden="true" />
              </div>
              <h3>{t('register.deadline')}</h3>
              <p>{info.deadline}</p>
            </div>

            {/* Online Registration */}
            <div className={`card ${styles.infoCard}`}>
              <div className={styles.infoCardIcon} style={{ background: '#DCFCE7', color: '#166534' }}>
                <CheckCircle size={22} aria-hidden="true" />
              </div>
              <h3>Online Registration</h3>
              <p>{info.onlineReg ? '✅ Available online' : '❌ Not available online — must register by mail or in person'}</p>
            </div>

            {/* Same-day Registration */}
            <div className={`card ${styles.infoCard}`}>
              <div className={styles.infoCardIcon} style={{ background: '#EEF2FF', color: 'var(--primary)' }}>
                <CheckCircle size={22} aria-hidden="true" />
              </div>
              <h3>Same-Day Registration</h3>
              <p>{info.sameDay ? '✅ Same-day registration available' : '❌ Must register before Election Day'}</p>
            </div>

            {/* ID Requirements */}
            <div className={`card ${styles.infoCard}`}>
              <div className={styles.infoCardIcon} style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                <span style={{ fontSize: '1.1rem' }} aria-hidden="true">🪪</span>
              </div>
              <h3>{t('register.idRequired')}</h3>
              <p>{info.idReq}</p>
            </div>

            {/* Early Voting */}
            <div className={`card ${styles.infoCard}`}>
              <div className={styles.infoCardIcon} style={{ background: '#FEE2E2', color: '#991B1B' }}>
                <Calendar size={22} aria-hidden="true" />
              </div>
              <h3>{t('register.earlyVoting')}</h3>
              <p>{info.earlyVoting}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {info && (
          <div className={`card ${styles.actionCard}`} aria-label="Registration actions">
            <h2>Ready to Register?</h2>
            <p>Register on the official {selectedState} state website or use the federal Vote.gov portal.</p>
            <div className={styles.actionBtns}>
              <a
                href={info.regUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                id="register-official-btn"
                aria-label={`Register to vote in ${selectedState} (opens official website in new tab)`}
              >
                <ExternalLink size={16} aria-hidden="true" />
                {t('register.registerNow')}
              </a>
              <a
                href="https://vote.gov/register"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                id="register-vote-gov-btn"
                aria-label="Register via Vote.gov (opens in new tab)"
              >
                <ExternalLink size={16} aria-hidden="true" />
                Use Vote.gov
              </a>
              <a
                href="https://vote.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                id="check-registration-btn"
                aria-label={`${t('register.checkRegistration')} (opens in new tab)`}
              >
                {t('register.checkRegistration')} →
              </a>
            </div>
            <p className={styles.disclaimer}>
              <AlertCircle size={13} aria-hidden="true" />
              ElectEd does not collect your registration data. All registration is handled directly by official state and federal portals.
            </p>
          </div>
        )}

        {/* Steps (shown always) */}
        <div className={`card ${styles.stepsCard}`}>
          <h2>How to Register — Step by Step</h2>
          <ol className={styles.steps} aria-label="Voter registration steps">
            {[
              { step: '1', title: 'Check Eligibility', desc: 'Confirm you\'re a US citizen, at least 18, and a state resident.' },
              { step: '2', title: 'Select Your State', desc: 'Choose your state above to see specific requirements and deadlines.' },
              { step: '3', title: 'Register', desc: 'Complete registration online, by mail, or in person at a registration office.' },
              { step: '4', title: 'Verify Registration', desc: 'Check your registration status at Vote.gov before Election Day.' },
              { step: '5', title: 'Vote!', desc: 'Bring required ID to your polling place on Election Day or during early voting.' },
            ].map((item) => (
              <li key={item.step} className={styles.step}>
                <div className={styles.stepNum} aria-hidden="true">{item.step}</div>
                <div className={styles.stepContent}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

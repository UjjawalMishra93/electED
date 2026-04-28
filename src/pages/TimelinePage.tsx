import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, ArrowRight, Share2, ChevronDown, ChevronUp, Users, Star } from 'lucide-react';
import styles from './TimelinePage.module.css';

interface Stage {
  id: string;
  name: string;
  slug: string;
  dateRange: string;
  description: string;
  keyActors: string[];
  citizenActions: string[];
  icon: string;
  status: 'completed' | 'active' | 'upcoming';
}

const STAGES: Stage[] = [
  {
    id: '1', name: 'Primary Season', slug: 'primary-season',
    dateRange: 'January – June 2024',
    description: 'State-level elections where political parties select their candidates for the general election. Voters choose among candidates within their party.',
    keyActors: ['Political Parties', 'State Election Boards', 'Voters', 'Candidates'],
    citizenActions: ['Register to vote in your state', 'Research candidates', 'Vote in your state\'s primary', 'Attend candidate events'],
    icon: '🗳️', status: 'completed',
  },
  {
    id: '2', name: 'Party Conventions', slug: 'party-conventions',
    dateRange: 'July – August 2024',
    description: 'National gatherings where political parties formally nominate their presidential and vice-presidential candidates and adopt their party platform.',
    keyActors: ['Delegates', 'Party Leaders', 'Presidential Nominees'],
    citizenActions: ['Watch convention coverage', 'Learn about party platforms', 'Engage with your local party organization'],
    icon: '🏛️', status: 'completed',
  },
  {
    id: '3', name: 'General Campaign', slug: 'general-campaign',
    dateRange: 'September – October 2024',
    description: 'Candidates campaign nationally for votes. Presidential debates occur, and intensive voter outreach takes place across all states.',
    keyActors: ['Presidential Candidates', 'Campaign Teams', 'Debate Commission', 'Media'],
    citizenActions: ['Watch presidential debates', 'Verify your voter registration', 'Help register others to vote', 'Research all ballot measures'],
    icon: '📣', status: 'completed',
  },
  {
    id: '4', name: 'Early Voting Period', slug: 'early-voting',
    dateRange: 'October 2024',
    description: 'Many states allow voters to cast ballots before Election Day at designated polling locations. Availability varies by state.',
    keyActors: ['Registered Voters', 'State Election Offices', 'Polling Stations'],
    citizenActions: ['Check if your state offers early voting', 'Find your early voting location', 'Bring required ID', 'Cast your ballot early'],
    icon: '📬', status: 'completed',
  },
  {
    id: '5', name: 'Election Day', slug: 'election-day',
    dateRange: 'November 5, 2024',
    description: 'The official day when registered voters cast their ballots for President, Congressional representatives, and other offices. Polls are open from morning to evening.',
    keyActors: ['All Registered Voters', 'Poll Workers', 'Election Officials'],
    citizenActions: ['Go to your polling place', 'Bring required ID', 'Cast your ballot', 'Help others get to the polls'],
    icon: '⭐', status: 'active',
  },
  {
    id: '6', name: 'Vote Counting & Canvassing', slug: 'vote-counting',
    dateRange: 'November 5–20, 2024',
    description: 'Election officials count all ballots including mail-in and provisional ballots. Results are reported progressively as counting continues.',
    keyActors: ['Election Officials', 'Bipartisan Observers', 'State Canvassing Boards'],
    citizenActions: ['Follow reliable news sources', 'Be patient — complete counts take time', 'Report election issues to your state board'],
    icon: '🔢', status: 'upcoming',
  },
  {
    id: '7', name: 'Certification', slug: 'certification',
    dateRange: 'November–December 2024',
    description: 'State officials certify their election results. Governors submit Certificates of Ascertainment of electors to the National Archives.',
    keyActors: ['State Governors', 'State Secretaries of State', 'National Archives'],
    citizenActions: ['Stay informed about results', 'Contact elected officials with concerns'],
    icon: '📜', status: 'upcoming',
  },
  {
    id: '8', name: 'Electoral College Vote', slug: 'electoral-college',
    dateRange: 'December 17, 2024',
    description: 'Presidential electors meet in their state capitals to cast their official electoral votes for President and Vice President.',
    keyActors: ['Presidential Electors', 'State Officials', 'National Archives'],
    citizenActions: ['Learn how the Electoral College works', 'Watch coverage of electoral vote proceedings'],
    icon: '🏛️', status: 'upcoming',
  },
  {
    id: '9', name: 'Congressional Certification', slug: 'congressional-certification',
    dateRange: 'January 6, 2025',
    description: 'Congress meets in a joint session to count and certify the Electoral College votes, officially declaring the next President-elect.',
    keyActors: ['Vice President', 'Congress (House & Senate)', 'Electoral Vote Counters'],
    citizenActions: ['Watch the joint session of Congress', 'Understand the constitutional process'],
    icon: '🏛️', status: 'upcoming',
  },
  {
    id: '10', name: 'Inauguration', slug: 'inauguration',
    dateRange: 'January 20, 2025',
    description: 'The President-elect is sworn into office in a ceremony at the US Capitol. The peaceful transfer of power is a cornerstone of American democracy.',
    keyActors: ['Incoming President', 'Chief Justice', 'Congress', 'Outgoing President'],
    citizenActions: ['Watch the inauguration ceremony', 'Celebrate democracy', 'Engage with your new government'],
    icon: '🇺🇸', status: 'upcoming',
  },
];

/**
 * Interactive election timeline page with expand/collapse stages and share functionality.
 */
const TimelinePage: React.FC = () => {
  const { t } = useTranslation();
  const { stageSlug } = useParams<{ stageSlug?: string }>();
  const [expandedStage, setExpandedStage] = useState<string | null>(stageSlug ?? '5');

  const handleShare = (stage: Stage) => {
    const url = `${window.location.origin}/timeline/${stage.slug}`;
    if (navigator.share) {
      void navigator.share({ title: `ElectEd: ${stage.name}`, url });
    } else {
      void navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className="section-container">
          <h1>{t('timeline.title')}</h1>
          <p>{t('timeline.subtitle')}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar} aria-label="Election progress">
        <div className="section-container">
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${(STAGES.filter(s => s.status === 'completed').length / STAGES.length) * 100}%` }}
              role="progressbar"
              aria-valuenow={STAGES.filter(s => s.status === 'completed').length}
              aria-valuemin={0}
              aria-valuemax={STAGES.length}
              aria-label="Election cycle progress"
            />
          </div>
          <div className={styles.progressLabels}>
            <span>{STAGES.filter(s => s.status === 'completed').length} of {STAGES.length} stages complete</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="section-container">
        <div className={styles.legend} role="list" aria-label="Stage status legend">
          {[
            { status: 'completed', label: 'Completed', color: 'var(--secondary)' },
            { status: 'active', label: 'Current Stage', color: '#FBBF24' },
            { status: 'upcoming', label: 'Upcoming', color: 'var(--text-muted)' },
          ].map((item) => (
            <div key={item.status} className={styles.legendItem} role="listitem">
              <span className={styles.legendDot} style={{ background: item.color }} aria-hidden="true" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Stages */}
      <div className={`section-container ${styles.timelineContainer}`}>
        <ol className={styles.timeline} aria-label="Election timeline stages">
          {STAGES.map((stage, index) => {
            const isExpanded = expandedStage === stage.id;
            return (
              <li key={stage.id} className={styles.stageItem} id={`stage-${stage.slug}`}>
                {/* Connector */}
                {index < STAGES.length - 1 && (
                  <div
                    className={`${styles.connector} ${stage.status === 'completed' ? styles.connectorDone : ''}`}
                    aria-hidden="true"
                  />
                )}

                {/* Stage Icon */}
                <div
                  className={`${styles.stageIcon} ${styles[`icon_${stage.status}`]}`}
                  aria-hidden="true"
                >
                  {stage.status === 'completed' ? (
                    <CheckCircle size={18} />
                  ) : stage.status === 'active' ? (
                    <Star size={18} />
                  ) : (
                    <Clock size={16} />
                  )}
                </div>

                {/* Stage Card */}
                <div className={`card ${styles.stageCard} ${stage.status === 'active' ? styles.stageCardActive : ''}`}>
                  <button
                    className={styles.stageHeader}
                    onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`stage-content-${stage.id}`}
                    id={`stage-btn-${stage.id}`}
                  >
                    <div className={styles.stageHeaderLeft}>
                      <span className={styles.stageEmoji} aria-hidden="true">{stage.icon}</span>
                      <div>
                        <div className={styles.stageMeta}>
                          <span className={`badge ${
                            stage.status === 'completed' ? 'badge-success' :
                            stage.status === 'active' ? 'badge-warning' : 'badge-primary'
                          }`}>
                            {stage.status === 'completed' ? t('timeline.completed') :
                             stage.status === 'active' ? t('timeline.currentStage') : t('timeline.upcoming')}
                          </span>
                          <span className={styles.stageDate}>{stage.dateRange}</span>
                        </div>
                        <h2 className={styles.stageName}>{stage.name}</h2>
                      </div>
                    </div>
                    <span aria-hidden="true">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div
                      id={`stage-content-${stage.id}`}
                      className={styles.stageContent}
                      role="region"
                      aria-labelledby={`stage-btn-${stage.id}`}
                    >
                      <p className={styles.stageDescription}>{stage.description}</p>

                      <div className={styles.stageDetails}>
                        <div className={styles.detailSection}>
                          <h3>
                            <Users size={14} aria-hidden="true" />
                            {t('timeline.keyActors')}
                          </h3>
                          <ul>
                            {stage.keyActors.map((actor) => (
                              <li key={actor}>{actor}</li>
                            ))}
                          </ul>
                        </div>

                        <div className={styles.detailSection}>
                          <h3>
                            <ArrowRight size={14} aria-hidden="true" />
                            {t('timeline.citizenActions')}
                          </h3>
                          <ul>
                            {stage.citizenActions.map((action) => (
                              <li key={action}>
                                <CheckCircle size={12} aria-hidden="true" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className={styles.stageFooter}>
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleShare(stage)}
                          aria-label={`${t('timeline.shareStage')}: ${stage.name}`}
                        >
                          <Share2 size={14} aria-hidden="true" />
                          {t('timeline.shareStage')}
                        </button>
                        <Link
                          to={`/chat?q=${encodeURIComponent(`Tell me about the ${stage.name} stage`)}`}
                          className="btn btn-primary"
                          aria-label={`Ask AI about ${stage.name}`}
                        >
                          <span aria-hidden="true">🤖</span>
                          Ask AI About This
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default TimelinePage;

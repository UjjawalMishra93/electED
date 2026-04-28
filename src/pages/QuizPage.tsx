import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, ChevronRight, Star } from 'lucide-react';
import { useQuizStore } from '@/store';
import type { QuizCategory } from '@/types';
import styles from './QuizPage.module.css';

const CATEGORIES: { id: QuizCategory; emoji: string; color: string; bg: string; questions: number }[] = [
  { id: 'voting-process', emoji: '🗳️', color: '#1B4FD8', bg: '#EEF2FF', questions: 10 },
  { id: 'electoral-system', emoji: '🏛️', color: '#7C3AED', bg: '#F3E8FF', questions: 10 },
  { id: 'rights-responsibilities', emoji: '⚖️', color: '#059669', bg: '#DCFCE7', questions: 10 },
  { id: 'election-history', emoji: '📜', color: '#D97706', bg: '#FEF3C7', questions: 10 },
  { id: 'how-government-works', emoji: '🏛️', color: '#DC2626', bg: '#FEE2E2', questions: 10 },
];

const QuizPage: React.FC = () => {
  const { t } = useTranslation();
  const { badges, results } = useQuizStore();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="section-container">
          <h1>{t('quiz.title')}</h1>
          <p>{t('quiz.subtitle')}</p>
        </div>
      </div>

      <div className="section-container section-padding">
        {badges.length > 0 && (
          <div className={`card ${styles.badgesCard}`}>
            <h2><Trophy size={18} aria-hidden="true" /> {t('quiz.badges')}</h2>
            <div className={styles.badgesList}>
              {badges.map(b => (
                <div key={b.id} className={styles.badge}>
                  <span aria-hidden="true">{b.icon}</span>
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.grid}>
          {CATEGORIES.map(cat => {
            const result = results.find(r => r.category === cat.id);
            return (
              <Link
                key={cat.id}
                to={`/quiz/${cat.id}`}
                className={`card ${styles.catCard}`}
                id={`quiz-cat-${cat.id}`}
                aria-label={`Start ${t(`quiz.categories.${cat.id}`)} quiz`}
              >
                <div className={styles.catIcon} style={{ background: cat.bg, color: cat.color }}>
                  <span aria-hidden="true">{cat.emoji}</span>
                </div>
                <div className={styles.catInfo}>
                  <h2>{t(`quiz.categories.${cat.id}`)}</h2>
                  <p>{cat.questions} questions</p>
                  {result && (
                    <div className={styles.prevScore}>
                      <Star size={12} aria-hidden="true" />
                      Best: {result.score}/{result.totalQuestions}
                    </div>
                  )}
                </div>
                <ChevronRight size={20} className={styles.arrow} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

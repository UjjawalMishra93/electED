import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/store';
import { Monitor, Type, Globe, Bell } from 'lucide-react';
import type { Theme, FontSize, Language } from '@/types';
import styles from './SettingsPage.module.css';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme, fontSize, language, setTheme, setFontSize, setLanguage } = useAppSettings();

  const applyTheme = (t: Theme) => {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t === 'default' ? '' : t);
  };

  const applyFontSize = (s: FontSize) => {
    setFontSize(s);
    document.documentElement.setAttribute('data-font-size', s === 'normal' ? '' : s);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="section-container">
          <h1>{t('settings.title')}</h1>
        </div>
      </div>

      <div className="section-container section-padding">
        <div className={styles.settingsGrid}>
          {/* Font Size */}
          <div className={`card ${styles.settingCard}`}>
            <div className={styles.settingHeader}>
              <Type size={20} aria-hidden="true" />
              <h2>{t('settings.fontSize')}</h2>
            </div>
            <div className={styles.options} role="radiogroup" aria-label="Text size">
              {(['normal','large','xl'] as FontSize[]).map(s => (
                <button key={s} className={`${styles.option} ${fontSize === s ? styles.optionActive : ''}`}
                  onClick={() => applyFontSize(s)} role="radio" aria-checked={fontSize === s}
                  id={`font-size-${s}`}>
                  {s === 'normal' ? t('settings.fontSizeNormal') : s === 'large' ? t('settings.fontSizeLarge') : t('settings.fontSizeXL')}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className={`card ${styles.settingCard}`}>
            <div className={styles.settingHeader}>
              <Monitor size={20} aria-hidden="true" />
              <h2>Display Mode</h2>
            </div>
            <div className={styles.options} role="radiogroup" aria-label="Display theme">
              {(['default','high-contrast'] as Theme[]).map(th => (
                <button key={th} className={`${styles.option} ${theme === th ? styles.optionActive : ''}`}
                  onClick={() => applyTheme(th)} role="radio" aria-checked={theme === th}
                  id={`theme-${th}`}>
                  {th === 'default' ? 'Standard' : t('settings.highContrast')}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className={`card ${styles.settingCard}`}>
            <div className={styles.settingHeader}>
              <Globe size={20} aria-hidden="true" />
              <h2>{t('settings.language')}</h2>
            </div>
            <div className={styles.options} role="radiogroup" aria-label="Language">
              {(['en','es'] as Language[]).map(lang => (
                <button key={lang} className={`${styles.option} ${language === lang ? styles.optionActive : ''}`}
                  onClick={() => { setLanguage(lang); }} role="radio" aria-checked={language === lang}
                  id={`lang-${lang}`}>
                  {lang === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className={`card ${styles.settingCard}`}>
            <div className={styles.settingHeader}>
              <Bell size={20} aria-hidden="true" />
              <h2>{t('settings.notifications')}</h2>
            </div>
            <p className={styles.settingDesc}>{t('settings.notificationsDesc')}</p>
            <button className="btn btn-secondary" id="enable-notifications-btn"
              onClick={() => { void Notification.requestPermission(); }}>
              Enable Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

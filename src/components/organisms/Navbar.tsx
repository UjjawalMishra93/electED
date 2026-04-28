import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Clock,
  UserCheck,
  Brain,
  Search,
  Settings,
  Menu,
  X,
  Vote,
} from 'lucide-react';
import { useAppSettings } from '@/store';
import styles from './Navbar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

/**
 * Main navigation bar component.
 * Fully accessible: keyboard navigable, ARIA labeled, mobile responsive.
 */
const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme } = useAppSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems: NavItem[] = [
    { to: '/', label: t('nav.home'), icon: <Home size={16} />, ariaLabel: 'Go to home page' },
    { to: '/chat', label: t('nav.chat'), icon: <Vote size={16} />, ariaLabel: 'Open AI chat assistant' },
    { to: '/timeline', label: t('nav.timeline'), icon: <Clock size={16} />, ariaLabel: 'View election timeline' },
    { to: '/register', label: t('nav.register'), icon: <UserCheck size={16} />, ariaLabel: 'View voter registration guide' },
    { to: '/quiz', label: t('nav.quiz'), icon: <Brain size={16} />, ariaLabel: 'Take civic knowledge quiz' },
    { to: '/explore', label: t('nav.explore'), icon: <Search size={16} />, ariaLabel: 'Explore ballot and candidates' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <header
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
      data-theme={theme}
      role="banner"
    >
      <nav
        className={`${styles.navInner} section-container`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <NavLink
          to="/"
          className={styles.logo}
          aria-label="ElectEd — Go to homepage"
        >
          <div className={styles.logoIcon} aria-hidden="true">
            <Vote size={20} />
          </div>
          <span className={styles.logoText}>
            Elect<span className={styles.logoAccent}>Ed</span>
          </span>
          <span className={styles.logoBadge} aria-hidden="true">AI</span>
        </NavLink>

        {/* Desktop Nav */}
        <ul className={styles.desktopNav} role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
                aria-label={item.ariaLabel}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Controls */}
        <div className={styles.controls}>
          <NavLink
            to="/settings"
            className={styles.settingsBtn}
            aria-label="Open settings"
          >
            <Settings size={18} aria-hidden="true" />
          </NavLink>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.menuToggle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className={styles.mobileMenu}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <ul role="list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                  }
                  aria-label={item.ariaLabel}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/settings"
                className={styles.mobileNavLink}
                aria-label="Open settings page"
              >
                <Settings size={16} aria-hidden="true" />
                {t('nav.settings')}
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;

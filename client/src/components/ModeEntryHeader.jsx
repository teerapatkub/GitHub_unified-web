import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { BookOpen, CircleHelp, Coins, Gamepad2, Globe, Lock, LogOut, Medal, MoreHorizontal, Store, Terminal, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { assetUrl } from '../config/api.js';
import { canEnterGameModes, GAME_MODE_MIN_LEVEL, levelOf } from '../utils/gameModeAccess.js';
import { requestTour } from '../utils/tourEvents.js';
import './mode-entry.css';

const modes = [
  { id: 'learn', path: '/learn', label: 'Learning', thaiLabel: 'บทเรียน', icon: BookOpen },
  { id: 'competitive', path: '/online', label: 'Competitive', thaiLabel: 'Competitive', icon: Trophy },
  { id: 'arcade', path: '/matchmaking', label: 'Arcade', thaiLabel: 'Arcade', icon: Gamepad2 },
];

const pageLabels = {
  '/shop': ['ร้านค้าของตกแต่ง', 'Cosmetic shop'],
  '/leaderboard': ['ตารางอันดับ', 'Leaderboard'],
  '/profile': ['โปรไฟล์', 'Profile'],
  '/achievements': ['ความสำเร็จ', 'Achievements'],
};

export default function ModeEntryHeader({ mode, user, children, onNavigate, onLogout }) {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const isThai = i18n.language.startsWith('th');
  const headerRef = useRef(null);
  const [height, setHeight] = useState(132);
  // Phones get one row: language, shop, leaderboard and help fold into this
  // menu (Spec 0005 #19). On wider screens the toggle is hidden by CSS and the
  // same buttons sit in the row as before, so there is one copy of each.
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const moreId = useId();
  const unlocked = canEnterGameModes(user);
  const currentMode = modes.find((item) => item.id === mode);
  const pageLabel = pageLabels['/' + pathname.split('/')[1]];
  const label = currentMode
    ? (isThai ? currentMode.thaiLabel : currentMode.label)
    : (pageLabel?.[isThai ? 0 : 1] || 'PyArena');
  const avatar = assetUrl(user?.avatar?.url);
  const frame = assetUrl(user?.profile_asset_url);
  const profileLabel = isThai ? 'โปรไฟล์' : 'Profile';
  const shopLabel = isThai ? 'ร้านค้าของตกแต่ง' : 'Cosmetic shop';
  const leaderboardLabel = isThai ? 'ตารางอันดับ' : 'Leaderboard';
  const helpLabel = isThai ? 'วิธีใช้งานหน้านี้' : 'How this page works';
  const lockMessage = isThai
    ? `โหมดแข่งขันปลดล็อกที่เลเวล ${GAME_MODE_MIN_LEVEL} · ตอนนี้คุณเลเวล ${levelOf(user)}`
    : `Competitive modes unlock at level ${GAME_MODE_MIN_LEVEL} · Your level: ${levelOf(user)}`;

  // A fixed navbar stays above the document scroll. Its measured spacer also
  // reserves the correct height when mobile actions or locked-mode hints wrap.
  useLayoutEffect(() => {
    const updateHeight = () => {
      const nextHeight = Math.ceil(headerRef.current.getBoundingClientRect().height);
      setHeight(nextHeight);
      document.documentElement.style.setProperty('--app-navbar-height', `${nextHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const closeOutside = (event) => {
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [moreOpen]);

  const handleLink = (event, path) => {
    const menu = event.currentTarget.closest('details');
    if (menu) menu.open = false;
    setMoreOpen(false);
    if (onNavigate) {
      event.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <div className="app-navbar-spacer" style={{ height, flexShrink: 0 }}>
      <header ref={headerRef} className={`mode-entry-header mode-entry--${mode || 'learn'} pysim-theme-navbar`}>
        <div className="mode-entry-header__inner">
          <div className="mode-entry-header__row">
            <Link to="/learn" onClick={(event) => handleLink(event, '/learn')} className="mode-entry-brand" data-tour="nav-brand" aria-label={isThai ? 'PyArena — กลับไปหน้าบทเรียน' : 'PyArena — back to learning'}>
              <span className="mode-entry-brand__mark"><Terminal aria-hidden="true" /></span>
              <span>
                <span className="mode-entry-brand__name">PyArena</span>
                <span className="mode-entry-brand__mode">{label}</span>
              </span>
            </Link>
            <div className="mode-entry-header__actions">
              <details className="app-profile-menu" data-tour="profile" onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector('summary').focus();
                }
              }}>
                <summary className="mode-entry-button app-profile-trigger" aria-label={profileLabel} title={profileLabel}>
                  <span className="app-profile-avatar">
                    {avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" className="app-profile-picture" /> : <span className="app-profile-initial">{String(user?.username || '?').trim().charAt(0).toUpperCase()}</span>}
                    {frame && <img src={frame} alt="" className="app-profile-frame" />}
                  </span>
                  <span className="app-profile-name">{user?.username}<small>LV. {levelOf(user)}</small></span>
                </summary>
                <div className="app-profile-dropdown">
                  <Link to="/profile" onClick={(event) => handleLink(event, '/profile')}>{isThai ? 'ดูโปรไฟล์' : 'View profile'}</Link>
                  <Link to="/achievements" onClick={(event) => handleLink(event, '/achievements')}><Medal aria-hidden="true" />{isThai ? 'ความสำเร็จ' : 'Achievements'}</Link>
                  {onLogout && <button type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; onLogout(); }}><LogOut aria-hidden="true" />{isThai ? 'ออกจากระบบ' : 'Log out'}</button>}
                </div>
              </details>
              <div className="mode-entry-balance" data-tour="coins" aria-label={isThai ? 'เหรียญ' : 'Coins'} title={isThai ? 'เหรียญ' : 'Coins'}>
                <Coins aria-hidden="true" /><span>{Number(user?.virtual_currency ?? user?.coins ?? 0).toLocaleString()}</span>
              </div>
              {children}
              <div
                ref={moreRef}
                className="mode-entry-more-wrap"
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && moreOpen) {
                    setMoreOpen(false);
                    moreRef.current.querySelector('.mode-entry-more-toggle')?.focus();
                  }
                }}
              >
              <button
                type="button"
                className="mode-entry-button mode-entry-more-toggle"
                data-tour="more-menu"
                aria-expanded={moreOpen}
                aria-controls={moreId}
                aria-label={isThai ? 'เมนูเพิ่มเติม' : 'More'}
                title={isThai ? 'เมนูเพิ่มเติม' : 'More'}
                onClick={() => setMoreOpen((open) => !open)}
              >
                <MoreHorizontal aria-hidden="true" />
              </button>
              <div id={moreId} className={`mode-entry-more${moreOpen ? ' is-open' : ''}`}>
              <button type="button" className="mode-entry-button" data-tour="language" onClick={() => i18n.changeLanguage(isThai ? 'en' : 'th')} aria-label={isThai ? 'เปลี่ยนภาษาเป็นอังกฤษ' : 'Switch language to Thai'} title={isThai ? 'เปลี่ยนภาษา' : 'Change language'}>
                <Globe aria-hidden="true" /><span className="app-language-code">{isThai ? 'TH' : 'EN'}</span><span className="app-menu-label">{isThai ? 'English' : 'ภาษาไทย'}</span>
              </button>
              <Link to="/shop" onClick={(event) => handleLink(event, '/shop')} className="mode-entry-button" data-tour="shop" aria-label={shopLabel} title={shopLabel} aria-current={pathname === '/shop' ? 'page' : undefined}>
                <Store aria-hidden="true" /><span className="app-action-label">{shopLabel}</span>
              </Link>
              <Link to="/leaderboard" onClick={(event) => handleLink(event, '/leaderboard')} className="mode-entry-button" data-tour="leaderboard" aria-label={leaderboardLabel} title={leaderboardLabel} aria-current={pathname === '/leaderboard' ? 'page' : undefined}>
                <Trophy aria-hidden="true" /><span className="app-action-label">{leaderboardLabel}</span>
              </Link>
              <button type="button" className="mode-entry-button" data-tour="tour-help" onClick={() => { setMoreOpen(false); requestTour(); }} aria-label={helpLabel} title={helpLabel}>
                <CircleHelp aria-hidden="true" /><span className="app-menu-label">{helpLabel}</span>
              </button>
              </div>
              </div>
            </div>
          </div>
          <nav className="mode-entry-nav pysim-theme-nav" aria-label={isThai ? 'โหมดของ PyArena' : 'PyArena modes'}>
            {modes.map((item) => {
              const text = isThai ? item.thaiLabel : item.label;
              const locked = item.id !== 'learn' && !unlocked;
              return locked ? (
                <button key={item.id} type="button" data-tour={`nav-${item.id}`} className="mode-entry-nav__link mode-entry-nav__link--locked" disabled aria-describedby="mode-unlock-hint" title={lockMessage}>
                  <Lock aria-hidden="true" /><span>{text}</span><span className="mode-entry-lock-level">LV. {GAME_MODE_MIN_LEVEL}</span>
                </button>
              ) : (
                <Link key={item.id} to={item.path} data-tour={`nav-${item.id}`} onClick={(event) => handleLink(event, item.path)} className="mode-entry-nav__link" aria-current={mode === item.id ? 'page' : undefined}>
                  <item.icon aria-hidden="true" /><span>{text}</span>
                  {mode === item.id && <span className="mode-entry-nav__indicator" aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>
          {!unlocked && <p id="mode-unlock-hint" className="mode-entry-lock-hint"><Lock aria-hidden="true" />{lockMessage}</p>}
        </div>
      </header>
    </div>
  );
}

import { useLayoutEffect, useRef, useState } from 'react';
import { BookOpen, Coins, Gamepad2, Globe, Lock, LogOut, Medal, Store, Terminal, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { assetUrl } from '../config/api.js';
import { canEnterGameModes, GAME_MODE_MIN_LEVEL, levelOf } from '../utils/gameModeAccess.js';
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

  const handleLink = (event, path) => {
    const menu = event.currentTarget.closest('details');
    if (menu) menu.open = false;
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
            <Link to="/learn" onClick={(event) => handleLink(event, '/learn')} className="mode-entry-brand" aria-label={isThai ? 'PyArena — กลับไปหน้าบทเรียน' : 'PyArena — back to learning'}>
              <span className="mode-entry-brand__mark"><Terminal aria-hidden="true" /></span>
              <span>
                <span className="mode-entry-brand__name">PyArena</span>
                <span className="mode-entry-brand__mode">{label}</span>
              </span>
            </Link>
            <div className="mode-entry-header__actions">
              <details className="app-profile-menu" onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector('summary').focus();
                }
              }}>
                <summary className="mode-entry-button app-profile-trigger" aria-label={profileLabel} title={profileLabel}>
                  <span className="app-profile-avatar">
                    {avatar ? <img src={avatar} alt="" className="app-profile-picture" /> : <span className="app-profile-initial">{String(user?.username || '?').trim().charAt(0).toUpperCase()}</span>}
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
              <div className="mode-entry-balance" aria-label={isThai ? 'เหรียญ' : 'Coins'} title={isThai ? 'เหรียญ' : 'Coins'}>
                <Coins aria-hidden="true" /><span>{Number(user?.virtual_currency ?? user?.coins ?? 0).toLocaleString()}</span>
              </div>
              <button type="button" className="mode-entry-button" onClick={() => i18n.changeLanguage(isThai ? 'en' : 'th')} aria-label={isThai ? 'เปลี่ยนภาษาเป็นอังกฤษ' : 'Switch language to Thai'} title={isThai ? 'เปลี่ยนภาษา' : 'Change language'}>
                <Globe aria-hidden="true" /><span className="app-language-code">{isThai ? 'TH' : 'EN'}</span>
              </button>
              <Link to="/shop" onClick={(event) => handleLink(event, '/shop')} className="mode-entry-button" aria-label={shopLabel} title={shopLabel} aria-current={pathname === '/shop' ? 'page' : undefined}>
                <Store aria-hidden="true" /><span className="app-action-label">{shopLabel}</span>
              </Link>
              <Link to="/leaderboard" onClick={(event) => handleLink(event, '/leaderboard')} className="mode-entry-button" aria-label={leaderboardLabel} title={leaderboardLabel} aria-current={pathname === '/leaderboard' ? 'page' : undefined}>
                <Trophy aria-hidden="true" /><span className="app-action-label">{leaderboardLabel}</span>
              </Link>
              {children}
            </div>
          </div>
          <nav className="mode-entry-nav pysim-theme-nav" aria-label={isThai ? 'โหมดของ PyArena' : 'PyArena modes'}>
            {modes.map((item) => {
              const text = isThai ? item.thaiLabel : item.label;
              const locked = item.id !== 'learn' && !unlocked;
              return locked ? (
                <button key={item.id} type="button" className="mode-entry-nav__link mode-entry-nav__link--locked" disabled aria-describedby="mode-unlock-hint" title={lockMessage}>
                  <Lock aria-hidden="true" /><span>{text}</span><span className="mode-entry-lock-level">LV. {GAME_MODE_MIN_LEVEL}</span>
                </button>
              ) : (
                <Link key={item.id} to={item.path} onClick={(event) => handleLink(event, item.path)} className="mode-entry-nav__link" aria-current={mode === item.id ? 'page' : undefined}>
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

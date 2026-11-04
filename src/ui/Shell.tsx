import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { SettingsDialog } from './Settings';

export function Mark({ size = 28 }: { size?: number }) {
  // Asa de três penas sobre um escudo: o "Attack Wing" do nome.
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M16 2 28 6v9c0 7.5-5 12.5-12 15C9 27.5 4 22.5 4 15V6Z" fill="var(--accent)" />
      <path d="M9 19c4-1 7-4 9-9 1 4 0 8-3 11 2.5 0 5-1 7-3-1 4-4 6.5-8 7-2 .3-4-.5-5-2 1-.5 1.5-1.5 1.5-2.5-.5.5-1 .5-1.5-1.5Z" fill="#fff" />
    </svg>
  );
}

export function Shell({ children, topbar }: { children: ReactNode; topbar?: ReactNode }) {
  const { saved, flash } = useStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setMenuOpen(false), [loc.pathname]);

  const nav = (
    <>
      <div className="brand">
        <Mark />
        <div>
          <span className="brand-name">Attack Wing</span>
          <span className="brand-sub">Construtor de legião</span>
        </div>
      </div>
      <nav className="nav" aria-label="Principal">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <NavIcon d="M4 6h16M4 12h16M4 18h10" /> Construtor
        </NavLink>
        <NavLink to="/legioes" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <NavIcon d="M5 4h14v16l-7-4-7 4Z" /> Legiões salvas
          {saved.length > 0 && <span className="nav-count num">{saved.length}</span>}
        </NavLink>
        <button className="nav-item" onClick={() => setSettingsOpen(true)}>
          <NavIcon d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" /> Coleções e ordem
        </button>
      </nav>
      <p className="nav-note">
        Ferramenta de fã sem fins comerciais. D&D Attack Wing é da WizKids e da Wizards of the Coast. Textos e ícones das cartas pertencem aos seus donos.
      </p>
    </>
  );

  return (
    <div className="frame">
      <aside className="sidebar">{nav}</aside>
      <header className="topbar">
        <button className="menu-btn" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
          <NavIcon d="M4 7h16M4 12h16M4 17h16" />
        </button>
        <span className="topbar-brand"><Mark size={22} /> Attack Wing</span>
        <div className="topbar-slot">{topbar}</div>
      </header>
      <main className="sheet">{children}</main>

      {menuOpen && (
        <div className="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="icon-btn menu-close" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>×</button>
          {nav}
        </div>
      )}
      {settingsOpen && <SettingsDialog onClose={() => setSettingsOpen(false)} />}
      <div className="toast-zone" aria-live="polite">
        {flash && (
          <div key={flash.id} className={`toast toast-${flash.kind}`}>
            {flash.text}
          </div>
        )}
      </div>
    </div>
  );
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

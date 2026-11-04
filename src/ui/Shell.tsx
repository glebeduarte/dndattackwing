import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { SettingsDialog } from './Settings';

export function Mark({ size = 28, light = false }: { size?: number; light?: boolean }) {
  // O ícone dos upgrades de dragão do jogo, recortado do fundo de pergaminho.
  return <img className="mark" src={light ? '/brand-dragon-light.png' : '/brand-dragon-dark.png'} width={size} height={size} alt="" aria-hidden />;
}

export function Shell({ children, topbar }: { children: ReactNode; topbar?: ReactNode }) {
  const { saved, flash } = useStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setMenuOpen(false), [loc.pathname]);

  const nav = (
    <>
      <Link to="/" className="brand" aria-label="Início">
        <Mark light />
        <div>
          <span className="brand-name">Attack Wing</span>
          <span className="brand-sub">Construtor de legião</span>
        </div>
      </Link>
      <nav className="nav" aria-label="Principal">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <NavIcon d="M4 11 12 4l8 7v9h-5v-6H9v6H4Z" /> Início
        </NavLink>
        <NavLink to="/construtor" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <NavIcon d="M4 6h16M4 12h16M4 18h10" /> Construtor
        </NavLink>
        <NavLink to="/gerador" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <NavIcon d="M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2M6 18l2-2m8-8 2-2" /> Gerador de legião
        </NavLink>
        <NavLink to="/aventuras" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <NavIcon d="M4 5l5-2 6 2 5-2v16l-5 2-6-2-5 2Zm5-2v16m6-14v16" /> Aventuras
        </NavLink>
        <NavLink to="/regras" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <NavIcon d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4Zm4 4h6M9 12h6" /> Regras do jogo
        </NavLink>
        <a className="nav-item" href="/manual/attack-wing-livro-de-regras.pdf" download>
          <NavIcon d="M6 3h9l4 4v14H6Zm9 0v4h4M12 10v7m-3-3 3 3 3-3" /> Livro de regras (PDF)
        </a>
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
        <Link to="/" className="topbar-brand"><Mark size={22} light /> Attack Wing</Link>
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

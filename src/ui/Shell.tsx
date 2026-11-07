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
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('aw:nav') === 'min'; } catch { return false; } });
  const toggleNav = () => setCollapsed((v) => { try { localStorage.setItem('aw:nav', v ? 'full' : 'min'); } catch { /* */ } return !v; });
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
          <span className="nav-ic" title="Início"><NavIcon d="M4 11 12 4l8 7v9h-5v-6H9v6H4Z" /></span> <span className="nav-label">Início</span>
        </NavLink>
        <NavLink to="/construtor" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <span className="nav-ic" title="Construtor"><NavIcon d="M4 6h16M4 12h16M4 18h10" /></span> <span className="nav-label">Construtor</span>
        </NavLink>
        <NavLink to="/gerador" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <span className="nav-ic" title="Gerador de legião"><NavIcon d="M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2M6 18l2-2m8-8 2-2" /></span> <span className="nav-label">Gerador de legião</span>
        </NavLink>
        <NavLink to="/aventuras" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <span className="nav-ic" title="Aventuras"><NavIcon d="M4 5l5-2 6 2 5-2v16l-5 2-6-2-5 2Zm5-2v16m6-14v16" /></span> <span className="nav-label">Aventuras</span>
        </NavLink>
        <NavLink to="/colecoes" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <span className="nav-ic" title="Coleções"><NavIcon d="M4 7h16v13H4Zm2-3h12M8 11h8M8 15h5" /></span> <span className="nav-label">Coleções</span>
        </NavLink>
        <NavLink to="/jogar" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <span className="nav-ic" title="Jogar contra a IA"><NavIcon d="M7 4h10l3 6-8 10-8-10Zm-3 6h16M9 4l3 16 3-16" /></span> <span className="nav-label">Jogar contra a IA</span>
        </NavLink>
        <NavLink to="/regras" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <span className="nav-ic" title="Regras do jogo"><NavIcon d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4Zm4 4h6M9 12h6" /></span> <span className="nav-label">Regras do jogo</span>
        </NavLink>
        <a className="nav-item" href="/manual/attack-wing-livro-de-regras.pdf" download title="Livro de regras (PDF)">
          <span className="nav-ic" title="Livro de regras (PDF)"><NavIcon d="M6 3h9l4 4v14H6Zm9 0v4h4M12 10v7m-3-3 3 3 3-3" /></span> <span className="nav-label">Livro de regras (PDF)</span>
        </a>
        <NavLink to="/leitor" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <span className="nav-ic" title="Leitor de cartas"><NavIcon d="M4 8h3l2-3h6l2 3h3v11H4Zm8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></span> <span className="nav-label">Leitor de cartas</span>
        </NavLink>
        <NavLink to="/legioes" className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}>
          <span className="nav-ic" title="Legiões salvas"><NavIcon d="M5 4h14v16l-7-4-7 4Z" /></span> <span className="nav-label">Legiões salvas</span>
          {saved.length > 0 && <span className="nav-count num">{saved.length}</span>}
        </NavLink>
        <button className="nav-item" onClick={() => setSettingsOpen(true)}>
          <span className="nav-ic" title="Configurações"><NavIcon d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" /></span> <span className="nav-label">Configurações</span>
        </button>
      </nav>
      <p className="nav-note">
        Ferramenta de fã sem fins comerciais. D&D Attack Wing é da WizKids e da Wizards of the Coast. Textos e ícones das cartas pertencem aos seus donos.
      </p>
    </>
  );

  return (
    <div className={`frame${collapsed ? ' is-collapsed' : ''}`}>
      <aside className="sidebar">
        {nav}
        <button className="nav-toggle" onClick={toggleNav} aria-label={collapsed ? 'Abrir o menu' : 'Recolher o menu'} title={collapsed ? 'Abrir o menu' : 'Recolher o menu'}>
          <NavIcon d={collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} /> <span className="nav-label">Recolher</span>
        </button>
      </aside>
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

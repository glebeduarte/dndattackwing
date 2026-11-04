import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './store';
import { Builder } from './pages/Builder';
import { Home } from './pages/Home';
import { CardReaderPage } from './pages/CardReader';
import { RulesPage } from './pages/rules/Rules';
import { Generator } from './pages/Generator';
import { AdventurePage, AdventuresPage } from './pages/Adventures';
import { CardPage, LinkRoute, SavedPage } from './pages/Other';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/construtor" element={<Builder />} />
          <Route path="/creatures" element={<Builder />} />
          <Route path="/upgrades" element={<Builder />} />
          <Route path="/gerador" element={<Generator />} />
          <Route path="/leitor" element={<CardReaderPage />} />
          <Route path="/regras" element={<RulesPage />} />
          <Route path="/aventuras" element={<AdventuresPage />} />
          <Route path="/aventuras/:slug" element={<AdventurePage />} />
          <Route path="/legioes" element={<SavedPage />} />
          <Route path="/link/:code" element={<LinkRoute />} />
          <Route path="/card/creature/:id" element={<CardPage kind="creature" />} />
          <Route path="/card/upgrade/:id" element={<CardPage kind="upgrade" />} />
          <Route path="/creature/:id" element={<CardPage kind="creature" />} />
          <Route path="/upgrade/:id" element={<CardPage kind="upgrade" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);

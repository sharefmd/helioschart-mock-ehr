import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DemoBanner from './DemoBanner';
import TopAppBar from './TopAppBar';
import MenuBar from './MenuBar';
import LeftNavRail from './LeftNavRail';
import ToastHost from '../components/ToastHost';
import Modal from '../components/Modal';
import DemoGuide from '../demo/DemoGuide';

export default function AppShell() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="app">
      <DemoBanner />
      <TopAppBar />
      <MenuBar />
      <div className="shell-body">
        <LeftNavRail />
        <main className="content"><Outlet /></main>
      </div>
      <div className="footer">
        <span>HeliosChart™ Mock EHR — Conventional Mode</span>
        <span>·</span>
        <span className="link" onClick={() => setAboutOpen(true)}>About / Disclaimer</span>
        <span className="grow" />
        <span>Provider: Okafor, James MD</span>
        <span>·</span>
        <span>Clinic A</span>
        <span>·</span>
        <span>2026-06-23</span>
      </div>

      <ToastHost />
      <DemoGuide />

      {aboutOpen && (
        <Modal title="About HeliosChart (Mock EHR)" onClose={() => setAboutOpen(false)}
          footer={<button className="btn-primary" onClick={() => setAboutOpen(false)}>Close</button>}>
          <p className="small">
            This is a <b>front-end-only demonstration</b> built to illustrate why conventional EHRs
            feel fragmented: information is stored but not connected to action.
          </p>
          <p className="small mt8">
            All patients, medications, results, and orders are <b>fictional</b>. No real PHI is present.
          </p>
          <p className="small mt8 bold" style={{ color: 'var(--danger)' }}>
            For demonstration only. Not for clinical use.
          </p>
        </Modal>
      )}
    </div>
  );
}

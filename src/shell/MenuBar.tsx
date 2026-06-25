import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Wifi, Printer } from 'lucide-react';
import { useEhr } from '../store/EhrStore';

interface Item { label: string; kbd?: string; sep?: boolean; run: () => void; }

export default function MenuBar() {
  const { toast, activePatientId } = useEhr();
  const nav = useNavigate();
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const chart = (t: string) => () => nav(`/chart/${activePatientId}/${t}`);
  const t = (m: string) => () => toast(m, 'info');

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const MENUS: { name: string; items: Item[] }[] = [
    { name: 'File', items: [
      { label: 'New Encounter', kbd: 'Ctrl+N', run: t('New encounter requires an open schedule slot.') },
      { label: 'Open Patient…', kbd: 'Ctrl+O', run: () => nav('/patients') },
      { label: 'Print Chart…', kbd: 'Ctrl+P', run: t('Sending chart to default printer…') },
      { label: 'Export to PDF', sep: true, run: t('Export queued.') },
      { label: 'Sign Out', sep: true, run: t('Sign-out disabled in demo.') },
    ]},
    { name: 'Edit', items: [
      { label: 'Undo', kbd: 'Ctrl+Z', run: t('Nothing to undo.') },
      { label: 'Cut', kbd: 'Ctrl+X', run: t('Clipboard not available in demo.') },
      { label: 'Copy', kbd: 'Ctrl+C', run: t('Copied.') },
      { label: 'Paste', kbd: 'Ctrl+V', run: t('Clipboard empty.') },
      { label: 'Find in Chart…', kbd: 'Ctrl+F', sep: true, run: t('Chart search not indexed in demo.') },
    ]},
    { name: 'Patient', items: [
      { label: 'Patient Summary', run: chart('summary') },
      { label: 'Demographics', run: chart('demographics') },
      { label: 'Coverage / Insurance', run: chart('coverage') },
      { label: 'Care Team', run: t('Care team panel not built.') },
      { label: 'Break-the-Glass…', sep: true, run: t('Access already granted for this chart.') },
    ]},
    { name: 'Chart', items: [
      { label: 'Chart Review', run: chart('chart-review') },
      { label: 'Snapshot', run: chart('snapshot') },
      { label: 'Flowsheets', run: chart('flowsheets') },
      { label: 'History', run: chart('history') },
      { label: 'Health Maintenance', sep: true, run: chart('health-maintenance') },
    ]},
    { name: 'Orders', items: [
      { label: 'Order Entry', run: chart('orders') },
      { label: 'Order Sets…', run: t('No order sets configured.') },
      { label: 'Pended Orders', run: chart('orders') },
      { label: 'Cosign Orders', sep: true, run: () => nav('/inbox') },
    ]},
    { name: 'Tools', items: [
      { label: 'Calculators', run: t('MDCalc integration not enabled.') },
      { label: 'Drug Reference', run: t('Opening drug reference…') },
      { label: 'SmartPhrase Manager', run: t('SmartPhrase manager not available.') },
      { label: 'Preferences…', sep: true, run: t('Preferences locked by administrator.') },
    ]},
    { name: 'Reports', items: [
      { label: 'My Productivity', run: t('Generating productivity report…') },
      { label: 'Open Encounters', run: t('7 open encounters.') },
      { label: 'Patient Panel', run: t('Panel report queued.') },
      { label: 'Quality Measures', sep: true, run: chart('health-maintenance') },
    ]},
    { name: 'Help', items: [
      { label: 'Help Topics', kbd: 'F1', run: t('Help center unavailable in demo.') },
      { label: 'Keyboard Shortcuts', run: t('Shortcuts are not active in demo.') },
      { label: 'Contact Support', run: t('Support: 1-800-XXX-XXXX (demo).') },
      { label: 'About HeliosChart', sep: true, run: t('HeliosChart v9.4.2 (build 20260601) — demo.') },
    ]},
  ];

  return (
    <div className="menubar" ref={ref}>
      {MENUS.map((m) => (
        <div
          key={m.name}
          className={`mb-item ${open === m.name ? 'open' : ''}`}
          onClick={() => setOpen((o) => (o === m.name ? null : m.name))}
          onMouseEnter={() => open && setOpen(m.name)}
        >
          {m.name}
          {open === m.name && (
            <div className="menu" style={{ left: 0, top: '100%', minWidth: 200 }}>
              {m.items.map((it, i) => (
                <div key={i}>
                  {it.sep && <div className="menu-sep" />}
                  <div className="menu-item row" onClick={(e) => { e.stopPropagation(); setOpen(null); it.run(); }}>
                    <span className="grow">{it.label}</span>
                    {it.kbd && <span className="muted xsmall" style={{ marginLeft: 16 }}>{it.kbd}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <span className="spacer" />
      <span className="mb-status">
        <span className="row gap4" title="Connection"><Wifi size={11} /> Connected</span>
        <span className="row gap4" title="Encryption"><Lock size={11} /> Secure</span>
        <span className="row gap4" title="Default printer"><Printer size={11} /> HP-LJ-4F</span>
        <span>Server: HELIOS-PRD-07</span>
      </span>
    </div>
  );
}

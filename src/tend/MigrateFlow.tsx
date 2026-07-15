import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Download, Check, Users, FileText, Pill, ListChecks,
  ShieldAlert, FlaskConical, FolderClosed, Activity,
} from 'lucide-react';
import './tend.css';

const EHRS = [
  'Epic', 'athenahealth', 'eClinicalWorks', 'Tebra', 'Practice Fusion',
  'SimplePractice', 'NextGen', 'Cerner', 'No EHR / paper charts',
];

type Cat = { key: string; label: string; icon: typeof Users; target: number };
const CATEGORIES: Cat[] = [
  { key: 'patients', label: 'Patients', icon: Users, target: 1248 },
  { key: 'encounters', label: 'Encounters & notes', icon: FileText, target: 18934 },
  { key: 'meds', label: 'Medications', icon: Pill, target: 6512 },
  { key: 'problems', label: 'Problem lists', icon: ListChecks, target: 9204 },
  { key: 'allergies', label: 'Allergies', icon: ShieldAlert, target: 2110 },
  { key: 'labs', label: 'Lab results', icon: FlaskConical, target: 41320 },
  { key: 'docs', label: 'Documents & faxes', icon: FolderClosed, target: 12867 },
];

const NAMES = [
  'Maria Thompson', 'Robert Alvarez', 'Linh Nguyen', 'Devang Patel', 'Eleanor Walsh',
  'Terrence Brooks', 'Gabriela Romero', 'Karl Fischer', 'Ama Osei', 'Hector Delgado',
  'Renata Cole', 'Priya Nair', 'James Okonkwo', 'Sofia Marquez', 'Daniel Kim',
];

const fmt = (n: number) => n.toLocaleString('en-US');

export default function MigrateFlow() {
  const nav = useNavigate();
  const [step, setStep] = useState<'connect' | 'importing' | 'done'>('connect');
  const [sourceEhr, setSourceEhr] = useState('Practice Fusion');
  const [pct, setPct] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (step !== 'importing') return;
    setPct(0);
    timer.current = window.setInterval(() => {
      setPct((p) => {
        const next = p + 1.4;
        if (next >= 100) {
          if (timer.current) window.clearInterval(timer.current);
          window.setTimeout(() => setStep('done'), 650);
          return 100;
        }
        return next;
      });
    }, 80);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [step]);

  const slice = 100 / CATEGORIES.length;
  const catProgress = (i: number) => Math.min(1, Math.max(0, (pct - i * slice) / slice));
  const activeName = NAMES[Math.min(NAMES.length - 1, Math.floor((pct / 100) * NAMES.length))];

  return (
    <div className="tend-app mig-root">
      <span className="t-demo">Demo — fictional data</span>

      <div className="mig-card">
        {step === 'connect' && (
          <>
            <span className="mig-kicker"><Sparkles size={13} /> Switch to Freed</span>
            <h1 className="mig-title">Bring your practice over in minutes</h1>
            <p className="mig-sub">
              Freed securely pulls your records from your current system and organizes them into your new chart —
              read-only, and nothing changes in your old EHR.
            </p>

            <div className="mig-flow">
              <div className="mig-node">
                <div className="tile" style={{ background: '#eceaf0', color: '#555b63' }}><Activity size={18} /></div>
                <div className="nl">Current EHR</div>
                <div className="nn">{sourceEhr.split(' /')[0]}</div>
              </div>
              <div className="mig-pipe"><div className="flow" /></div>
              <div className="mig-node freed">
                <div className="tile" style={{ background: 'var(--violet)', color: '#fff' }}>T</div>
                <div className="nl">New EHR</div>
                <div className="nn">Freed</div>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <label className="nl" style={{ display: 'block', fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>Which system are you coming from?</label>
              <select className="mig-select" value={sourceEhr} onChange={(e) => setSourceEhr(e.target.value)}>
                {EHRS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>

            <div className="mig-actions">
              <button className="tb-btn primary" onClick={() => setStep('importing')}>
                <Download size={15} /> Connect &amp; import
              </button>
              <button className="mig-link" onClick={() => nav('/tend')}>Skip — I'll set up later</button>
            </div>
          </>
        )}

        {step === 'importing' && (
          <>
            <span className="mig-kicker"><Download size={13} /> Importing</span>
            <h1 className="mig-title">Pulling your data into Freed…</h1>

            <div className="mig-flow">
              <div className="mig-node">
                <div className="tile" style={{ background: '#eceaf0', color: '#555b63' }}><Activity size={18} /></div>
                <div className="nl">Exporting from</div>
                <div className="nn">{sourceEhr.split(' /')[0]}</div>
              </div>
              <div className="mig-pipe"><div className="flow" /></div>
              <div className="mig-node freed">
                <div className="tile" style={{ background: 'var(--violet)', color: '#fff' }}>T</div>
                <div className="nl">Loading into</div>
                <div className="nn">Freed</div>
              </div>
            </div>
            <div className="mig-streaming">{pct < 100 ? <>Importing <b>{activeName}</b> and {fmt(CATEGORIES[0].target)} others…</> : 'Finalizing…'}</div>

            <div className="mig-overall">
              <div className="bar"><div className="fill" style={{ width: `${pct}%` }} /></div>
              <span className="pct">{Math.round(pct)}%</span>
            </div>

            <div className="mig-cats">
              {CATEGORIES.map((c, i) => {
                const prog = catProgress(i);
                const done = prog >= 1;
                const active = prog > 0 && prog < 1;
                const Icon = c.icon;
                return (
                  <div key={c.key} className={`mig-cat ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                    <span className="ic"><Icon size={17} /></span>
                    <span className="lbl">{c.label}</span>
                    <span className="cbar"><span className="fill" style={{ width: `${prog * 100}%` }} /></span>
                    <span className="cnt">{fmt(Math.round(c.target * prog))}</span>
                    <span className="chk">{done && <Check size={16} />}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {step === 'done' && (
          <>
            <div className="mig-done-badge"><Check size={30} /></div>
            <h1 className="mig-title">Your Freed EHR is ready 🎉</h1>
            <p className="mig-sub">
              Everything from {sourceEhr.split(' /')[0]} has been pulled in and organized. Your charts, meds, labs,
              and documents are all here — open a patient and you're ready to go.
            </p>

            <div className="mig-tiles">
              {CATEGORIES.map((c) => (
                <div key={c.key} className="mig-tile">
                  <div className="n">{fmt(c.target)}</div>
                  <div className="l">{c.label}</div>
                </div>
              ))}
            </div>

            <div className="mig-actions">
              <button className="tb-btn primary" onClick={() => nav('/tend')}>
                Enter Freed <ArrowRight size={15} />
              </button>
              <button className="mig-link" onClick={() => setStep('connect')}>Run migration again</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

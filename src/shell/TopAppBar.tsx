import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Search, HelpCircle, Bell, UserCircle2 } from 'lucide-react';
import { useEhr } from '../store/EhrStore';
import { PATIENTS } from '../data/patient';

export default function TopAppBar() {
  const { toast, unreviewedInboxCount, dispatch } = useEhr();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const ql = q.trim().toLowerCase();
  const matches = ql
    ? PATIENTS.filter((p) => p.name.toLowerCase().includes(ql) || p.mrn.toLowerCase().includes(ql)).slice(0, 6)
    : [];

  const goTo = (id: string) => {
    dispatch({ t: 'selectPatient', id });
    nav(`/chart/${id}/summary`);
    setQ(''); setOpen(false);
  };

  return (
    <div className="topbar">
      <span className="logo"><Activity size={18} /> Helios<span style={{ fontWeight: 400, opacity: 0.85 }}>Chart</span></span>
      <span className="env">TEST</span>

      <div ref={ref} style={{ position: 'relative', marginLeft: 6 }}>
        <form className="row" onSubmit={(e) => { e.preventDefault(); if (matches[0]) goTo(matches[0].id); }}>
          <input
            type="search"
            placeholder="Search patients by name or MRN…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          <button className="btn-xs" title="Search"><Search size={12} /></button>
        </form>
        {open && ql && (
          <div className="menu" style={{ left: 0, top: '100%', minWidth: 280 }}>
            {matches.length === 0
              ? <div className="menu-item muted">No patients match "{q}".</div>
              : matches.map((p) => (
                <div key={p.id} className="menu-item" onClick={() => goTo(p.id)}>
                  <span className="bold">{p.name}</span>
                  <span className="muted xsmall"> · {p.mrn} · {p.age}{p.sex[0]}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      <span className="grow" />

      <span className="mode-toggle" title="Switch EHR mode">
        <span className="seg on" onClick={() => nav('/schedule')}>Conventional EHR</span>
        <span className="seg" onClick={() => { toast('Switching to Intelligent HxR…', 'info'); nav('/tend'); }}>Intelligent HxR</span>
      </span>

      <span className="ico" title="Help" onClick={() => toast('Help center is not available in this demo.', 'info')}>
        <HelpCircle size={17} />
      </span>
      <span className="ico" title="Notifications" onClick={() => { toast(`${unreviewedInboxCount} unread inbox items.`, 'info'); nav('/inbox'); }}>
        <Bell size={17} />
        {unreviewedInboxCount > 0 && (
          <span className="badge" style={{ position: 'absolute', top: -6, right: -8 }}>{unreviewedInboxCount}</span>
        )}
      </span>
      <span className="ico row" title="User profile" onClick={() => toast('Signed in as Okafor, James MD.', 'info')} style={{ gap: 4 }}>
        <UserCircle2 size={18} />
        <span style={{ fontSize: 11 }}>J. Okafor, MD</span>
      </span>
    </div>
  );
}

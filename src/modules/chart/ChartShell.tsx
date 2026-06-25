import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Outlet, useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Activity, FileSearch, FileText, ListChecks, Pill, ClipboardList,
  FlaskRound, Image, FolderOpen, MessageSquare, Share2, ShieldAlert, HeartPulse,
  Syringe, History, ScrollText, IdCard, ShieldCheck, Mail, Camera, DollarSign,
  Eye, ChevronDown,
} from 'lucide-react';
import { getPatient } from '../../data/patient';
import { useEhr } from '../../store/EhrStore';
import PatientBanner from '../../shell/PatientBanner';
import ActivityRibbon from '../../shell/ActivityRibbon';

type IconT = typeof LayoutGrid;
interface Tab { to: string; label: string; icon: IconT; }

// Primary tabs shown inline (strip scrolls horizontally).
const PRIMARY: Tab[] = [
  { to: 'snapshot', label: 'Snapshot', icon: LayoutGrid },
  { to: 'summary', label: 'Summary', icon: Activity },
  { to: 'chart-review', label: 'Chart Review', icon: FileSearch },
  { to: 'notes', label: 'Notes', icon: FileText },
  { to: 'problems', label: 'Problems', icon: ListChecks },
  { to: 'meds', label: 'Meds', icon: Pill },
  { to: 'orders', label: 'Orders', icon: ClipboardList },
  { to: 'results', label: 'Results', icon: FlaskRound },
  { to: 'flowsheets', label: 'Flowsheets', icon: HeartPulse },
  { to: 'allergies', label: 'Allergies', icon: ShieldAlert },
  { to: 'imaging', label: 'Imaging', icon: Image },
];

// Overflow tabs under "More ▾".
const MORE: Tab[] = [
  { to: 'history', label: 'History', icon: History },
  { to: 'immunizations', label: 'Immunizations', icon: Syringe },
  { to: 'health-maintenance', label: 'Health Maintenance', icon: ScrollText },
  { to: 'care-gaps', label: 'Care Gaps', icon: ScrollText },
  { to: 'documents', label: 'Documents', icon: FolderOpen },
  { to: 'messages', label: 'Messages', icon: MessageSquare },
  { to: 'referrals', label: 'Referrals', icon: Share2 },
  { to: 'letters', label: 'Letters', icon: Mail },
  { to: 'media', label: 'Media', icon: Camera },
  { to: 'demographics', label: 'Demographics', icon: IdCard },
  { to: 'coverage', label: 'Coverage', icon: ShieldCheck },
  { to: 'billing', label: 'Billing', icon: DollarSign },
  { to: 'audit', label: 'Audit Trail', icon: Eye },
];

export default function ChartShell() {
  const { patientId } = useParams();
  const { dispatch, orders, unsignedOrderCount } = useEhr();
  const nav = useNavigate();
  const loc = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreRect, setMoreRect] = useState<{ top: number; right: number } | null>(null);
  const moreBtnRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const patient = patientId ? getPatient(patientId) : undefined;

  useEffect(() => {
    if (patientId) dispatch({ t: 'selectPatient', id: patientId });
  }, [patientId, dispatch]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const tgt = e.target as Node;
      if (moreBtnRef.current?.contains(tgt) || moreMenuRef.current?.contains(tgt)) return;
      setMoreOpen(false);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('resize', () => setMoreOpen(false));
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggleMore = () => {
    const r = moreBtnRef.current?.getBoundingClientRect();
    if (r) setMoreRect({ top: r.bottom, right: Math.max(4, window.innerWidth - r.right) });
    setMoreOpen((o) => !o);
  };

  if (!patient) return <Navigate to="/schedule" replace />;

  const orderCount = orders.length;
  const moreActive = MORE.some((m) => loc.pathname.endsWith(`/${m.to}`));

  return (
    <>
      <PatientBanner patient={patient} />
      <ActivityRibbon />
      <div className="tabstrip">
        {PRIMARY.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink key={tab.to} to={tab.to} className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
              <Icon size={11} style={{ verticalAlign: -1, marginRight: 3 }} />{tab.label}
              {tab.to === 'orders' && orderCount > 0 && <span className={unsignedOrderCount ? 'badge' : 'badge badge-mute'}>{orderCount}</span>}
            </NavLink>
          );
        })}
        <div ref={moreBtnRef} className={moreActive ? 'tab active' : 'tab'} onClick={toggleMore}>
          More <ChevronDown size={11} style={{ verticalAlign: -1 }} />
        </div>
      </div>

      {moreOpen && moreRect && createPortal(
        <div ref={moreMenuRef} className="menu" style={{ position: 'fixed', top: moreRect.top, right: moreRect.right, minWidth: 190, zIndex: 1500 }}>
          {MORE.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.to} className="menu-item row gap4" onClick={() => { setMoreOpen(false); nav(m.to); }}>
                <Icon size={12} /> {m.label}
              </div>
            );
          })}
        </div>,
        document.body,
      )}
      <div className="content-scroll">
        <Outlet />
      </div>
    </>
  );
}

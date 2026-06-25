import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Calendar, Inbox, Users, FolderOpen, FlaskRound, Pill, ClipboardList, FileText,
  DollarSign, Settings, Stethoscope, LayoutGrid, FileSearch, Activity,
  MessageSquare, PhoneCall, Mail, UserPlus, ChevronDown, ChevronRight, ShieldCheck,
  ReceiptText, BadgeCheck, BarChart3, Gauge, ScrollText, ListChecks, Pin,
} from 'lucide-react';
import { useEhr } from '../store/EhrStore';

type IconType = typeof Calendar;
interface NavItem { label: string; icon: IconType; to?: string; chart?: string; badge?: number; toastMsg?: string; }
interface Group { key: string; label: string; items: NavItem[] }

export default function LeftNavRail() {
  const { activePatientId, unreviewedInboxCount, openTaskCount, toast } = useEhr();
  const nav = useNavigate();
  const [open, setOpen] = useState<Record<string, boolean>>({
    clinical: true, communication: true, practice: true, financial: false, reports: false, admin: false,
  });
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const groups: Group[] = [
    { key: 'clinical', label: 'Clinical', items: [
      { label: 'Chart', icon: Stethoscope, chart: 'summary' },
      { label: 'Snapshot', icon: LayoutGrid, chart: 'snapshot' },
      { label: 'Chart Review', icon: FileSearch, chart: 'chart-review' },
      { label: 'Orders', icon: ClipboardList, chart: 'orders' },
      { label: 'Results', icon: FlaskRound, chart: 'results' },
      { label: 'Medications', icon: Pill, chart: 'meds' },
      { label: 'Flowsheets', icon: Activity, chart: 'flowsheets' },
    ]},
    { key: 'communication', label: 'Communication', items: [
      { label: 'In Basket', icon: Inbox, to: '/inbox', badge: unreviewedInboxCount },
      { label: 'Messages', icon: MessageSquare, chart: 'messages' },
      { label: 'Telephone', icon: PhoneCall, toastMsg: 'Telephony module not connected.' },
      { label: 'Letters', icon: Mail, chart: 'letters' },
    ]},
    { key: 'practice', label: 'Practice', items: [
      { label: 'Schedule', icon: Calendar, to: '/schedule' },
      { label: 'Patients', icon: Users, to: '/patients' },
      { label: 'Registration', icon: UserPlus, toastMsg: 'Registration requires front-desk role.' },
      { label: 'Documents', icon: FolderOpen, to: '/documents' },
      { label: 'My Tasks', icon: ListChecks, chart: 'summary', badge: openTaskCount },
    ]},
    { key: 'financial', label: 'Financial', items: [
      { label: 'Billing', icon: DollarSign, chart: 'billing' },
      { label: 'Claims', icon: ReceiptText, toastMsg: 'Claims module not enabled in demo.' },
      { label: 'Eligibility', icon: BadgeCheck, toastMsg: 'Eligibility check not available.' },
      { label: 'Coverage', icon: ShieldCheck, chart: 'coverage' },
    ]},
    { key: 'reports', label: 'Reports', items: [
      { label: 'Dashboards', icon: Gauge, toastMsg: 'Dashboards not configured.' },
      { label: 'Productivity', icon: BarChart3, toastMsg: 'Generating productivity report…' },
      { label: 'Quality', icon: ScrollText, chart: 'health-maintenance' },
    ]},
    { key: 'admin', label: 'Admin', items: [
      { label: 'Settings', icon: Settings, toastMsg: 'Settings locked by administrator.' },
      { label: 'User Mgmt', icon: Users, toastMsg: 'User management requires admin role.' },
      { label: 'Audit Log', icon: FileText, chart: 'audit' },
    ]},
  ];

  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? 'active sub' : 'sub');

  const renderItem = (it: NavItem) => {
    const Icon = it.icon;
    const inner = <>
      <Icon size={13} /> {it.label}
      {it.badge ? <span className="badge">{it.badge}</span> : null}
    </>;
    if (it.to) return <NavLink key={it.label} to={it.to} className={cls}>{inner}</NavLink>;
    if (it.chart) return <NavLink key={it.label} to={`/chart/${activePatientId}/${it.chart}`} className={cls}>{inner}</NavLink>;
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a key={it.label} className="sub" onClick={() => toast(it.toastMsg ?? 'Not available in demo.', 'info')}>{inner}</a>
    );
  };

  return (
    <nav className="rail">
      {groups.map((g) => (
        <div key={g.key}>
          <div className="grp-head" onClick={() => toggle(g.key)}>
            {g.label}
            {open[g.key] ? <ChevronDown className="chev" size={12} /> : <ChevronRight className="chev" size={12} />}
          </div>
          {open[g.key] && g.items.map(renderItem)}
        </div>
      ))}
      <div className="grp-head" onClick={() => { toast('Admin module is not available in this demo.', 'info'); nav('/schedule'); }}>
        <Pin size={10} /> Quick Links
      </div>
    </nav>
  );
}

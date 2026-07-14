import { useNavigate } from 'react-router-dom';
import { Search, Home, Inbox, Sparkles, ChevronsUpDown, LayoutTemplate } from 'lucide-react';
import { TEND_PROVIDER } from './tendData';

export default function TendRail({ active, onToast }: { active: 'home' | 'templates'; onToast: (m: string) => void }) {
  const nav = useNavigate();
  return (
    <aside className="t-rail">
      <div className="t-logo"><span className="tile">T</span> Tend</div>
      <div className="t-search"><Search size={16} /><input placeholder="Search patients" /></div>
      <nav className="t-nav">
        <button className={`t-nav-item ${active === 'home' ? 'active' : ''}`} onClick={() => nav('/tend')}><Home size={17} /> Home</button>
        <button className="t-nav-item" onClick={() => onToast('Inbox — not built in this demo.')}><Inbox size={17} /> Inbox</button>
        <button className={`t-nav-item ${active === 'templates' ? 'active' : ''}`} onClick={() => nav('/tend/templates')}><LayoutTemplate size={17} /> Templates</button>
      </nav>
      <div className="t-rail-spacer" />
      <button className="t-show-around" onClick={() => onToast('“Show me around” — guided tour coming soon.')}>
        <Sparkles size={16} /> Show me around
      </button>
      <button className="t-user" onClick={() => nav('/schedule')} title="Back to HeliosChart demo">
        <span className="t-avatar" style={{ background: '#cfe0f5', color: '#2a5b8a' }}>{TEND_PROVIDER.initials}</span>
        <span style={{ textAlign: 'left' }}>
          <span className="name" style={{ display: 'block' }}>{TEND_PROVIDER.name}</span>
          <span className="role">{TEND_PROVIDER.role} <ChevronsUpDown size={12} /></span>
        </span>
      </button>
    </aside>
  );
}

import { Link, NavLink } from 'react-router-dom';
import { api } from '../lib/api.js';
import { FaBookOpen, FaChevronRight, FaCircleQuestion, FaFileLines, FaGaugeHigh, FaRightFromBracket, FaPlus, FaShieldHalved, FaTicket, FaXmark } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/index.js';

export function Brand({ compact = false }) {
  return <Link to="/" className="flex items-center gap-3 no-underline">
    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><FaBookOpen size={21}/></span>
    {!compact && <span><span className="block text-base font-extrabold tracking-tight text-slate-900">bookleaf</span><span className="block text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">author care</span></span>}
  </Link>;
}
export function Badge({ children, tone = 'slate' }) {
  const tones = { slate: 'bg-slate-100 text-slate-600', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', red: 'bg-rose-50 text-rose-700', blue: 'bg-blue-50 text-blue-700', purple: 'bg-violet-50 text-violet-700' };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>;
}
export function StatusBadge({ status }) { const tone = status === 'Resolved' || status === 'Published & Live' ? 'green' : status === 'In Progress' ? 'blue' : status === 'Closed' ? 'slate' : 'amber'; return <Badge tone={tone}>{status}</Badge>; }
export function PriorityBadge({ priority }) { const tone = priority === 'Critical' || priority === 'High' ? 'red' : priority === 'Medium' ? 'amber' : 'green'; return <Badge tone={tone}>{priority}</Badge>; }
export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = { primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700', secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50', ghost: 'text-slate-600 hover:bg-slate-100', danger: 'bg-rose-600 text-white hover:bg-rose-700' };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
export function Field({ label, error, className = '', ...props }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" {...props}/>{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</label>;
}
export function Textarea({ label, className = '', ...props }) { return <label className={`block ${className}`}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><textarea className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" {...props}/></label>; }
export function SelectField({ label, children, className = '', ...props }) { return <label className={`block ${className}`}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" {...props}>{children}</select></label>; }
export function PageHeader({ eyebrow, title, description, action }) { return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-indigo-600">{eyebrow}</p>}<h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>{action}</div>; }
export function EmptyState({ icon: Icon = FaCircleQuestion, title, description, action }) { return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"><span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon size={22}/></span><h3 className="font-bold text-slate-800">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div>; }
export function Alert({ children, onClose }) { if (!children) return null; return <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{children}</span>{onClose && <button onClick={onClose}><FaXmark size={16}/></button>}</div>; }

export function AppShell({ children, admin = false }) {
  const { user } = useSelector(s => s.auth); const dispatch = useDispatch();
  const links = admin ? [
    { to: '/admin', label: 'Overview', icon: FaGaugeHigh, end: true },
    { to: '/admin/tickets', label: 'Ticket queue', icon: FaTicket }
  ] : [
    { to: '/author', label: 'Overview', icon: FaGaugeHigh, end: true },
    { to: '/author/books', label: 'My books', icon: FaBookOpen },
    { to: '/author/tickets', label: 'My tickets', icon: FaTicket },
    { to: '/author/tickets/new', label: 'New support query', icon: FaPlus }
  ];
  return <div className="min-h-screen bg-[#f7f8fc] md:flex">
    <aside className="z-10 flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-5 md:px-6"><Brand/><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{admin ? 'Operations' : 'Author portal'}</span></div>
      <div className="hidden px-6 pb-3 pt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400 md:block">Workspace</div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
        {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><Icon size={18}/>{label}{label === 'Ticket queue' && <FaChevronRight className="ml-auto hidden md:block" size={15}/>}</NavLink>)}
      </nav>
      <div className="mt-auto hidden p-4 md:block"><div className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><FaShieldHalved size={17} className="text-indigo-600"/> Need a hand?</div><p className="text-xs leading-5 text-slate-500">Our support team is here to help with your publishing journey.</p><div className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-600"><FaFileLines size={14}/> Support resources</div></div></div>
      <div className="flex items-center gap-3 border-t border-slate-100 p-4 md:p-5"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{user?.name?.slice(0,1)?.toUpperCase() || 'U'}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{user?.name || 'Account'}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div><button title="Sign out" onClick={async () => { try { await api('/auth/logout', { method: 'POST' }); } finally { dispatch(logout()); window.location.href = '/login'; } }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><FaRightFromBracket size={17}/></button></div>
    </aside>
    <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 md:ml-64 md:px-9 md:py-9"><div className="mx-auto max-w-7xl">{children}</div></main>
  </div>;
}

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowRight, FaBookOpen, FaWandMagicSparkles } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { api } from '../lib/api.js';
import { setCredentials } from '../store/index.js';
import { Alert, Brand, Button, Field } from '../components/UI.jsx';

export default function Auth({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const dispatch = useDispatch(); const navigate = useNavigate(); const location = useLocation();
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const data = await api(`/auth/${isRegister ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify({ ...(isRegister ? { name } : {}), email }) });
      dispatch(setCredentials({ user: data.user }));
      if (!isRegister) window.alert("Password wasn't included in the sample data. Password authentication can be implemented using bcrypt and password hashing.");
      navigate(location.state?.from || (data.user.role === 'admin' ? '/admin' : '/author'), { replace: true });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1fr]">
    <section className="relative hidden overflow-hidden bg-[#151d42] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"/><div className="absolute -bottom-20 -left-24 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl"/>
      <Brand/><div className="relative max-w-lg"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100"><FaWandMagicSparkles/> Your publishing journey, in one place</div><h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight xl:text-6xl">Your words.<br/><span className="text-indigo-300">Your world.</span></h1><p className="mt-6 max-w-md text-base leading-7 text-indigo-100/75">A clearer view of your books, royalties and conversations with the BookLeaf team.</p><div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><FaBookOpen size={22}/></div><div><p className="text-sm font-bold">Every book, every update</p><p className="mt-1 text-xs text-indigo-100/60">Publishing support that keeps you in the loop.</p></div></div></div><p className="relative text-xs text-indigo-100/50">© {new Date().getFullYear()} BookLeaf Publishing</p>
    </section>
    <section className="flex items-center justify-center px-5 py-12 sm:px-10"><div className="w-full max-w-md"><div className="mb-10 lg:hidden"><Brand/></div><p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-indigo-600">{isRegister ? 'Get started' : 'Welcome back'}</p><h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{isRegister ? 'Create your account' : 'Sign in to BookLeaf'}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{isRegister ? 'Set up your author portal to track your books and support requests.' : 'Continue with your email address.'}</p>
      <div className="mt-8"><Alert onClose={() => setError('')}>{error}</Alert><form onSubmit={submit} className="space-y-5">{isRegister && <Field label="Full name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" required minLength={2}/>}<Field label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/><Button type="submit" disabled={busy} className="mt-2 w-full py-3">{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Continue with email'}<FaArrowRight/></Button></form></div>
      <p className="mt-7 text-center text-sm text-slate-500">{isRegister ? 'Already have an account?' : 'New to BookLeaf?'} <Link className="font-bold text-indigo-600 hover:text-indigo-700" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
      <p className="mt-10 text-center text-xs leading-5 text-slate-400">Sample mode: email-only sign-in. Password authentication is not enabled.</p>
    </div></section>
  </div>;
}

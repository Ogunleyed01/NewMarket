import React, { useState } from 'react';
import { ArrowLeft, LockKeyhole, Store, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CAMPUSES = [
  'Obafemi Awolowo University (OAU)',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Federal University of Technology Akure (FUTA)',
  'University of Nigeria Nsukka (UNN)',
];

export const AuthPage = ({ mode, onNavigate }) => {
  const isSignup = mode === 'signup';
  const { login, register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campus, setCampus] = useState('');
  const [hostel, setHostel] = useState('');
  const [role, setRole] = useState(
    new URLSearchParams(window.location.search).get('role') === 'VENDOR' ? 'VENDOR' : 'BUYER',
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isSignup) {
        await register({ fullName, email, password, campus, hostel, role });
      } else {
        await login(email, password);
      }
      onNavigate('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">
        <button onClick={() => onNavigate('/')} className="mb-7 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to NewMarket
        </button>
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#395082]">
            {isSignup ? <Store className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
            <p className="mt-1 text-xs text-slate-500">
              {isSignup ? 'Join your campus marketplace.' : 'Sign in to continue to your marketplace.'}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {isSignup && (
            <>
              <label className="block text-xs font-bold text-slate-700">
                Full name
                <input
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 font-medium outline-none focus:border-[#395082]"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Account type
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 font-medium outline-none focus:border-[#395082]"
                >
                  <option value="BUYER">Student buyer</option>
                  <option value="VENDOR">Student vendor</option>
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Campus
                <div className="relative mt-1.5">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={campus}
                    onChange={(event) => setCampus(event.target.value)}
                    required
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 font-medium outline-none focus:border-[#395082]"
                  >
                    <option value="">Select your campus</option>
                    {CAMPUSES.map((campusOption) => (
                      <option key={campusOption} value={campusOption}>{campusOption}</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Hostel / delivery point
                <input
                  type="text"
                  value={hostel}
                  onChange={(event) => setHostel(event.target.value)}
                  placeholder="e.g. Moremi Hall, Block B, Room 11"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 font-medium outline-none focus:border-[#395082]"
                />
              </label>
            </>
          )}
          <label className="block text-xs font-bold text-slate-700">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 font-medium outline-none focus:border-[#395082]"
            />
          </label>
          <label className="block text-xs font-bold text-slate-700">
            Password {isSignup && <span className="font-normal text-slate-500">(at least 8 characters)</span>}
            <input
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={8}
              placeholder={isSignup ? 'At least 8 characters' : ''}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 font-medium outline-none focus:border-[#395082]"
            />
          </label>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#395082] px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#2c3f68] disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          {isSignup ? 'Already have an account?' : 'New to NewMarket?'}{' '}
          <button
            type="button"
            onClick={() => onNavigate(isSignup ? '/login' : '/signup')}
            className="font-extrabold text-[#395082] hover:underline"
          >
            {isSignup ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </section>
    </main>
  );
};

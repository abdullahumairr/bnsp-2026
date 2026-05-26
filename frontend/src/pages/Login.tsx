import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('bv_token', res.data.token);
      localStorage.setItem('bv_user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#fbfbfa]">
      <div className="relative p-12 flex flex-col justify-between bg-neutral-900 text-white bg-[url('https://images.unsplash.com/photo-1512820790803-83ca734da794')] bg-cover bg-center">
        <div className="absolute inset-0 bg-emerald-950/80 mix-blend-multiply"></div>
        <div className="relative z-10 font-serif text-2xl font-semibold">BookVerse</div>
        <div className="relative z-10 max-w-md">
          <h1 className="font-serif text-5xl leading-tight mb-4">The Quiet Pursuit of Wisdom.</h1>
          <p className="text-neutral-300 font-light">Join our community of curated readers and explorers.</p>
        </div>
        <div className="relative z-10 text-xs text-neutral-400">© 2026 BookVerse Editorial House.</div>
      </div>
      <div className="flex items-center justify-center p-12">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <h2 className="font-serif text-4xl text-neutral-900">Welcome back</h2>
          <p className="text-sm text-neutral-500 font-light">Please enter your credentials to access your library.</p>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Email address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border-b border-neutral-300 py-2 focus:border-neutral-950 outline-none bg-transparent" placeholder="name@example.com" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border-b border-neutral-300 py-2 focus:border-neutral-950 outline-none bg-transparent" placeholder="••••••••" required />
          </div>
          <button type="submit" className="w-full bg-[#2c3e35] hover:bg-emerald-950 text-white py-3 uppercase tracking-widest text-xs font-semibold transition">Sign In</button>
          <p className="text-sm text-center text-neutral-600 font-light">Did't have account? <Link to="/register" className="underline font-normal">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
};

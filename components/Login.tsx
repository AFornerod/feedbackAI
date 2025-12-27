
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { User, UserRole, Language, PlanType } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  lang: Language;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, lang }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEs = lang === 'es';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        throw new Error(isEs ? 'Credenciales inválidas' : 'Invalid credentials');
      }

      const user: User = {
        id: data.id,
        email: data.email,
        role: data.role as UserRole,
        planType: (data.plan_type as PlanType) || 'FREE',
        firstName: data.first_name,
        lastName: data.last_name,
        age: data.age,
        gender: data.gender,
        dob: data.dob,
        team: data.team,
        position: data.position,
        companyId: data.company_id,
        companyName: data.company_name
      };

      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-inter">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="text-3xl font-black text-slate-900 mb-2">
            Feedback<span className="text-indigo-600">AI</span>
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
            {isEs ? 'Acceso a la Plataforma' : 'Platform Access'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold mb-6 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Email</label>
            <input 
              required 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors"
              placeholder="admin@empresa.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">
              {isEs ? 'Contraseña' : 'Password'}
            </label>
            <input 
              required 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (isEs ? 'Iniciar Sesión' : 'Sign In')}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            {isEs 
              ? '¿No tienes cuenta? Contacta al administrador de tu empresa.' 
              : 'Don\'t have an account? Contact your company admin.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

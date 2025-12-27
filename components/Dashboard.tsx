
import React, { useEffect, useState } from 'react';
import { SCENARIOS, UI_STRINGS } from '../constants';
import { Scenario, Language, User, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface DashboardProps {
  onSelectScenario: (scenario: Scenario) => void;
  onViewHistory: (scenario: Scenario) => void;
  lang: Language;
  user: User;
}

interface GlobalStats {
  totalSessions: number;
  avgMaturity: number;
  avgSmart: number;
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectScenario, onViewHistory, lang, user }) => {
  const strings = UI_STRINGS[lang];
  const [stats, setStats] = useState<GlobalStats>({
    totalSessions: 0,
    avgMaturity: 0,
    avgSmart: 0,
    loading: true
  });

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        let query = supabase.from('feedback_sessions').select('score, smart_score, user_id, company_id');

        // Filtrar según rol
        if (user.role === UserRole.LIDER) {
          query = query.eq('user_id', user.id);
        } else if (user.role === UserRole.COMPANY_ADMIN) {
          query = query.eq('company_id', user.companyId);
        }

        const { data, error } = await query;

        if (error) {
          // Log specific error message to help identify if table or columns are missing
          console.error("Supabase error (Global Stats):", error.message, error.details, error.hint);
          throw error;
        }

        if (data && data.length > 0) {
          const total = data.length;
          const sumScore = data.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
          const sumSmart = data.reduce((acc, curr) => acc + (Number(curr.smart_score) || 0), 0);

          setStats({
            totalSessions: total,
            avgMaturity: Math.round(sumScore / total),
            avgSmart: Math.round(sumSmart / total),
            loading: false
          });
        } else {
          setStats({
            totalSessions: 0,
            avgMaturity: 0,
            avgSmart: 0,
            loading: false
          });
        }
      } catch (err: any) {
        console.error("Error fetching global stats:", err?.message || err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchGlobalStats();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-inter">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
            {lang === 'es' ? `Bienvenido, ${user.role === UserRole.LIDER ? 'Líder' : user.role === UserRole.COMPANY_ADMIN ? 'Admin de Compañía' : 'Super Admin'}` : strings.dashboardTitle}
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            {user.role === UserRole.LIDER 
              ? strings.dashboardDesc 
              : lang === 'es' ? `Resumen de desempeño para ${user.companyName || 'toda la red'}.` : `Performance summary for ${user.companyName || 'the entire network'}.`}
          </p>
        </div>
      </div>

      <div className="flex justify-center md:justify-start">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="flex flex-col text-left p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all group min-h-[300px]"
            >
              <div className="flex justify-between items-start mb-8">
                <span className="text-5xl group-hover:scale-110 transition-transform block drop-shadow-sm">
                  {scenario.icon}
                </span>
                <button 
                  onClick={() => onViewHistory(scenario)}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 hover:border-indigo-100"
                >
                  {lang === 'es' ? 'Ver Historial' : 'View History'}
                </button>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{scenario.title[lang]}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium opacity-80">{scenario.description[lang]}</p>
              
              <button 
                onClick={() => onSelectScenario(scenario)}
                className="mt-auto flex items-center justify-center w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
              >
                {strings.sessionStart}
                <svg className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas Globales Calculadas */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-indigo-50/50 p-10 rounded-[3rem] border border-indigo-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-4xl opacity-5 group-hover:scale-125 transition-transform">📊</div>
          <div className={`text-indigo-600 font-black text-5xl mb-4 tracking-tighter ${stats.loading ? 'animate-pulse opacity-50' : ''}`}>
            {stats.loading ? '--' : stats.totalSessions}
          </div>
          <div className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{strings.statSessions}</div>
        </div>
        
        <div className="bg-emerald-50/50 p-10 rounded-[3rem] border border-emerald-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-4xl opacity-5 group-hover:scale-125 transition-transform">🧠</div>
          <div className={`text-emerald-600 font-black text-5xl mb-4 tracking-tighter ${stats.loading ? 'animate-pulse opacity-50' : ''}`}>
            {stats.loading ? '--' : `${stats.avgMaturity}%`}
          </div>
          <div className="text-slate-500 font-black text-[10px] uppercase tracking-widest">
            {user.role === UserRole.LIDER ? strings.statConfidence : (lang === 'es' ? 'Madurez del Equipo' : 'Team Maturity')}
          </div>
        </div>
        
        <div className="bg-amber-50/50 p-10 rounded-[3rem] border border-amber-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-4xl opacity-5 group-hover:scale-125 transition-transform">🎯</div>
          <div className={`text-amber-600 font-black text-5xl mb-4 tracking-tighter ${stats.loading ? 'animate-pulse opacity-50' : ''}`}>
            {stats.loading ? '--' : `${stats.avgSmart}%`}
          </div>
          <div className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{strings.statReduction}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

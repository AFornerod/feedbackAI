
import React, { useEffect, useState } from 'react';
import { Scenario, Language, SessionFeedback, User, UserRole } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabase';

interface HistoryViewProps {
  scenario: Scenario;
  lang: Language;
  onBack: () => void;
  user: User;
}

interface SessionRecord {
  id: string;
  score: number;
  created_at: string;
  methodology: string;
  full_feedback: SessionFeedback;
  user_name?: string;
}

const HistoryView: React.FC<HistoryViewProps> = ({ scenario, lang, onBack, user }) => {
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [selectedRecord, setSelectedRecord] = useState<SessionRecord | null>(null);

  const isEs = lang === 'es';

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('feedback_sessions')
          .select('id, score, created_at, methodology, full_feedback, user_name, company_id, user_id')
          .eq('scenario_id', scenario.id);

        // Filtrar según rol
        if (user.role === UserRole.LIDER) {
          query = query.eq('user_id', user.id);
        } else if (user.role === UserRole.COMPANY_ADMIN) {
          query = query.eq('company_id', user.companyId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase error (History):", error.message, error.details);
          throw error;
        }
        
        const validRecords = data || [];
        setRecords(validRecords);
        
        if (validRecords.length > 0) {
          const sum = validRecords.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
          setAverageScore(sum / validRecords.length);
        } else {
          setAverageScore(0);
        }
      } catch (err: any) {
        console.error("Error fetching history:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [scenario.id, user]);

  if (selectedRecord) {
    const fb = selectedRecord.full_feedback;
    const radarData = [
      { subject: isEs ? 'Claridad' : 'Clarity', A: fb.clarity ?? 50 },
      { subject: isEs ? 'Empatía' : 'Empathy', A: fb.empathy ?? 50 },
      { subject: isEs ? 'Asertividad' : 'Assertiveness', A: fb.assertiveness ?? 50 },
      { subject: isEs ? 'Ética' : 'Ethos', A: fb.languageAppropriateness ?? 50 },
      { subject: isEs ? 'SMART' : 'SMART', A: fb.smartScore ?? 50 },
      { subject: isEs ? 'EQ' : 'EQ', A: fb.emotionalIntelligence ?? 50 },
    ];

    return (
      <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-right-4 duration-500 font-inter">
        <button 
          onClick={() => setSelectedRecord(null)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold uppercase text-[10px] tracking-widest transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          {isEs ? 'Volver al Listado' : 'Back to List'}
        </button>

        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden p-14 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
            <div>
              <div className="inline-block px-4 py-1.5 mb-6 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">
                {new Date(selectedRecord.created_at).toLocaleString(lang)} • {selectedRecord.user_name}
              </div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                {isEs ? 'Detalle de Sesión' : 'Session Detail'}
              </h2>
              <p className="text-slate-400 font-bold text-lg">{selectedRecord.methodology}</p>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-[3rem] text-white min-w-[180px]">
              <span className="text-6xl font-black">{Math.round(selectedRecord.score)}</span>
              <span className="text-[10px] font-black text-indigo-400 tracking-widest mt-2 uppercase">Score Global</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-slate-50 p-10 rounded-[3rem] min-h-[400px]">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Madurez Dimensional</h3>
               <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Leader" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-indigo-600 text-white p-10 rounded-[3rem]">
                <h4 className="text-sm font-black uppercase tracking-widest mb-6">{isEs ? 'Fortalezas Clave' : 'Key Strengths'}</h4>
                <ul className="space-y-4">
                  {fb.keyTakeaways.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                      <span className="text-sm font-bold opacity-90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-slate-100 p-10 rounded-[3rem]">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">{isEs ? 'Oportunidades' : 'Opportunities'}</h4>
                <ul className="space-y-4">
                  {fb.improvementAreas.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
                      <span className="text-sm font-bold text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-inter">
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200"
        >
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{scenario.title[lang]}</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
            {isEs ? 'HISTORIAL FILTRADO' : 'FILTERED HISTORY'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            {isEs ? 'Cargando registros...' : 'Loading records...'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 group-hover:scale-110 transition-transform">{scenario.icon}</div>
              <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-8">
                {isEs ? 'PUNTAJE PROMEDIO' : 'AVERAGE SCORE'}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-white tracking-tighter">{Math.round(averageScore)}</span>
                <span className="text-indigo-400 font-black text-xl">pts</span>
              </div>
              <p className="mt-8 text-slate-500 text-xs font-medium leading-relaxed max-w-[200px]">
                {isEs ? `Basado en ${records.length} sesiones analizadas bajo este perfil.` : `Based on ${records.length} sessions analyzed under this profile.`}
              </p>
            </div>
            
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
              <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-8">
                {isEs ? 'ESTADO DE MADUREZ' : 'MATURITY STATUS'}
              </h3>
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner ${averageScore > 80 ? 'bg-emerald-50 text-emerald-500' : averageScore > 60 ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                  {averageScore > 80 ? '🏆' : averageScore > 60 ? '📈' : '⚠️'}
                </div>
                <div>
                   <p className="text-slate-900 font-black text-2xl tracking-tight leading-none">
                     {averageScore > 80 ? (isEs ? 'Nivel Elite' : 'Elite Level') :
                      averageScore > 60 ? (isEs ? 'En Desarrollo' : 'In Development') :
                      (isEs ? 'Crítico' : 'Critical')}
                   </p>
                   <p className="text-slate-400 text-sm font-medium mt-2">
                     {isEs ? 'Cálculo basado en los roles visibles.' : 'Calculation based on visible roles.'}
                   </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-50">
               <h3 className="text-slate-900 font-black uppercase text-[11px] tracking-widest">
                 {isEs ? 'SESIONES RECIENTES' : 'RECENT SESSIONS'}
               </h3>
            </div>
            
            {records.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-slate-400 font-medium italic">
                  {isEs ? 'No hay registros visibles para este perfil.' : 'No visible records for this profile.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {records.map((record) => (
                  <div 
                    key={record.id} 
                    onClick={() => setSelectedRecord(record)}
                    className="p-10 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-8 w-full md:w-auto">
                      <div className="text-center min-w-[60px]">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                          {new Date(record.created_at).toLocaleDateString(lang, { month: 'short' })}
                        </p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                          {new Date(record.created_at).getDate()}
                        </p>
                      </div>
                      <div className="h-10 w-[1px] bg-slate-100 hidden md:block" />
                      <div>
                        <p className="text-slate-900 font-black text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{record.methodology}</p>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                          {new Date(record.created_at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                          {user.role !== UserRole.LIDER && ` • ${record.user_name}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex flex-col items-end">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${record.score > 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : record.score > 60 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {Math.round(record.score)} PTS
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryView;

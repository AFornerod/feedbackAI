
import React, { useEffect, useState } from 'react';
import { SCENARIOS, UI_STRINGS } from '../constants';
import { Scenario, Language, User, UserRole, PlanType } from '../types';
import { supabase } from '../services/supabase';

interface DashboardProps {
  onSelectScenario: (scenario: Scenario) => void;
  onViewHistory: (scenario: Scenario) => void;
  onUpgrade: () => void;
  lang: Language;
  user: User;
}

const PLAN_LIMITS: Record<PlanType, number> = {
  'FREE': 0,
  'BASIC': 3,
  'PRO': 10,
  'UNLIMITED': 9999
};

const Dashboard: React.FC<DashboardProps> = ({ onSelectScenario, onViewHistory, onUpgrade, lang, user }) => {
  const strings = UI_STRINGS[lang];
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const { data, error } = await supabase
          .from('feedback_sessions')
          .select('scenario_id')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        if (error) throw error;

        const counts: Record<string, number> = {};
        data?.forEach(session => {
          counts[session.scenario_id] = (counts[session.scenario_id] || 0) + 1;
        });
        setUsage(counts);
      } catch (err) {
        console.error("Error fetching usage:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  const getLimit = () => PLAN_LIMITS[user.planType || 'FREE'];
  const isUnlimited = user.planType === 'UNLIMITED';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-inter">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
            {lang === 'es' ? `Bienvenido, ${user.firstName}` : strings.dashboardTitle}
          </h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
              PLAN {user.planType || 'FREE'}
            </span>
            <p className="text-sm text-slate-500 font-medium">
              {lang === 'es' ? 'Tu suscripción está activa.' : 'Your subscription is active.'}
            </p>
          </div>
        </div>
        <button 
          onClick={onUpgrade}
          className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
        >
          {lang === 'es' ? 'Mejorar Plan' : 'Upgrade Plan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SCENARIOS.map((scenario) => {
          const currentUsage = usage[scenario.id] || 0;
          const limit = getLimit();
          const hasReachedLimit = !isUnlimited && currentUsage >= limit;

          return (
            <div
              key={scenario.id}
              className="flex flex-col text-left p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group min-h-[320px] relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-5xl group-hover:scale-110 transition-transform block drop-shadow-sm">
                  {scenario.icon}
                </span>
                <button 
                  onClick={() => onViewHistory(scenario)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  {lang === 'es' ? 'Historial' : 'History'}
                </button>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{scenario.title[lang]}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium opacity-80">{scenario.description[lang]}</p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {lang === 'es' ? 'Uso del Mes' : 'Monthly Usage'}
                    </span>
                    <span className={`text-sm font-black ${hasReachedLimit ? 'text-red-500' : 'text-indigo-600'}`}>
                      {isUnlimited ? '∞' : `${currentUsage} / ${limit}`}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${hasReachedLimit ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, (currentUsage / limit) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {hasReachedLimit ? (
                  <button 
                    onClick={onUpgrade}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
                  >
                    {lang === 'es' ? 'Límite alcanzado - Actualizar' : 'Limit Reached - Upgrade'}
                  </button>
                ) : (
                  <button 
                    onClick={() => onSelectScenario(scenario)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    {strings.sessionStart}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;

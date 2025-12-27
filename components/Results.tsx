
import React, { useState } from 'react';
import { SessionFeedback, Language, Scenario, User } from '../types';
import { UI_STRINGS } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabase';

interface ResultsProps {
  feedback: SessionFeedback;
  scenario: Scenario;
  lang: Language;
  onClose: () => void;
  user: User;
}

const Results: React.FC<ResultsProps> = ({ feedback, scenario, lang, onClose, user }) => {
  const strings = UI_STRINGS[lang];
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const handleSave = async () => {
    if (saveStatus === 'saving' || saveStatus === 'saved') return;
    setSaveStatus('saving');
    try {
      const { error } = await supabase
        .from('feedback_sessions')
        .insert([{ 
          score: Math.round(feedback.score || 0),
          lang: lang,
          scenario_id: scenario.id,
          scenario_title: scenario.title[lang],
          methodology: feedback.marketMethodology || "SBI & SMART",
          smart_score: feedback.smartScore || 0,
          full_feedback: feedback,
          user_id: user.id,
          user_name: `${user.firstName} ${user.lastName}`,
          company_id: user.companyId,
          company_name: user.companyName,
          created_at: new Date().toISOString()
        }]);
      if (error) throw error;
      setSaveStatus('saved');
    } catch (err: any) {
      console.error("Error al guardar:", err?.message || err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const radarData = [
    { subject: lang === 'es' ? 'Claridad' : 'Clarity', A: feedback.clarity ?? 50 },
    { subject: lang === 'es' ? 'Empatía' : 'Empathy', A: feedback.empathy ?? 50 },
    { subject: lang === 'es' ? 'Asertividad' : 'Assertiveness', A: feedback.assertiveness ?? 50 },
    { subject: lang === 'es' ? 'Ética' : 'Ethos', A: feedback.languageAppropriateness ?? 50 },
    { subject: lang === 'es' ? 'SMART' : 'SMART', A: feedback.smartScore ?? 50 },
    { subject: lang === 'es' ? 'EQ' : 'EQ', A: feedback.emotionalIntelligence ?? 50 },
  ];

  const getValidationSection = () => {
    const isEs = lang === 'es';
    if (scenario.id === 'recognition') {
      const items = [
        { label: 'SBI', val: feedback.score > 60 }, 
        { label: isEs ? 'RESULTADOS' : 'RESULTS', val: feedback.smartScore > 70 },
        { label: isEs ? 'VALORES' : 'VALUES', val: feedback.empathy > 70 },
        { label: isEs ? 'IMPACTO' : 'IMPACT', val: feedback.clarity > 70 },
        { label: isEs ? 'ESPECIFICIDAD' : 'SPECIFICITY', val: (feedback.smartCriteria?.specific ?? false) }
      ];
      return { title: isEs ? 'Validación de Reconocimiento' : 'Recognition Validation', icon: '🌟', items };
    } else if (scenario.id === 'one-on-one') {
      const items = [
        { label: 'GROW', val: feedback.assertiveness > 65 },
        { label: isEs ? 'SEGURIDAD' : 'SAFETY', val: feedback.empathy > 75 },
        { label: isEs ? 'ESCUCHA' : 'LISTENING', val: feedback.emotionalIntelligence > 70 },
        { label: isEs ? 'PREGUNTAS' : 'QUESTIONS', val: feedback.clarity > 60 },
        { label: isEs ? 'COMPROMISO' : 'COMMITMENT', val: (feedback.smartCriteria?.timeBound ?? false) }
      ];
      return { title: isEs ? 'Validación 1 a 1' : '1-on-1 Validation', icon: '💬', items };
    }
    const smartCriteria = feedback.smartCriteria || { specific: false, measurable: false, achievable: false, relevant: false, timeBound: false };
    const items = [
      { label: isEs ? 'ESPECÍFICO' : 'SPECIFIC', val: !!smartCriteria.specific },
      { label: isEs ? 'MEDIBLE' : 'MEASURABLE', val: !!smartCriteria.measurable },
      { label: isEs ? 'ALCANZABLE' : 'ACHIEVABLE', val: !!smartCriteria.achievable },
      { label: isEs ? 'RELEVANTE' : 'RELEVANT', val: !!smartCriteria.relevant },
      { label: isEs ? 'A TIEMPO' : 'TIME-BOUND', val: !!smartCriteria.timeBound },
    ];
    return { title: strings.smartTitle, icon: '🎯', items };
  };

  const validation = getValidationSection();
  const radius = 90;
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const scoreValue = Math.max(0, Math.min(100, feedback.score ?? 0));
  const strokeDashoffset = circumference - (scoreValue / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 font-inter">
      <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 border-b border-slate-200 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            {scenario.title[lang]} • {feedback.marketMethodology}
          </div>
          <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">{strings.resultsTitle}</h1>
          <p className="text-xl text-slate-400 font-semibold max-w-lg">{strings.resultsDesc}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            className={`px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3 ${
              saveStatus === 'saved' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
              saveStatus === 'error' ? 'bg-red-500 text-white shadow-red-500/20 animate-shake' :
              saveStatus === 'saving' ? 'bg-slate-100 text-slate-400 cursor-wait' :
              'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:scale-105'
            }`}
          >
            {saveStatus === 'saving' ? strings.saving : 
             saveStatus === 'saved' ? `✓ ${strings.saved}` : 
             saveStatus === 'error' ? strings.saveError : 
             strings.saveReport}
          </button>
          <button onClick={onClose} className="bg-indigo-600 text-white px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 transition-all active:scale-95">
            {strings.resultsReturn}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
        <div className="lg:col-span-5 bg-white p-14 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-16">{strings.resultsGlobal}</h3>
          <div className="relative flex items-center justify-center mb-16">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 filter drop-shadow-2xl">
              <circle stroke="#f8fafc" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
              <circle stroke={scoreValue < 60 ? "#ef4444" : "#4f46e5"} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} className="transition-all duration-1500 ease-in-out" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-8xl font-black text-slate-900 tracking-tighter leading-none">{Math.round(scoreValue)}</span>
              <span className="text-[9px] font-black text-indigo-400 mt-4 tracking-[0.1em]">INDEX SCORE</span>
            </div>
          </div>
          <div className={`w-full p-8 rounded-[3rem] border transition-all duration-500 ${feedback.obsceneLanguageDetected ? 'bg-red-50 border-red-200 text-red-900 shadow-xl shadow-red-500/10' : 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xl shadow-emerald-500/10'}`}>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-3xl">{feedback.obsceneLanguageDetected ? '🚫' : '💎'}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{strings.languageSafety}</span>
            </div>
            <p className="text-xs font-bold leading-relaxed opacity-80">
              {feedback.obsceneLanguageDetected ? "¡ALERTA DE ÉTICA! El uso de lenguaje vulgar ha degradado tu madurez de liderazgo." : "Profesionalismo excepcional. Mantuviste un registro ejecutivo impecable."}
            </p>
          </div>
        </div>
        <div className="lg:col-span-7 bg-white p-14 rounded-[4rem] shadow-sm border border-slate-100 min-h-[550px] relative overflow-hidden">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-16">{strings.resultsCompetencies}</h3>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Leader" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;

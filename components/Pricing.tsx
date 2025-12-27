
import React from 'react';
import { Language, PlanType, User } from '../types';
import { supabase } from '../services/supabase';

interface PricingProps {
  user: User | null;
  lang: Language;
  onBack: () => void;
  onPlanSelected: (plan: PlanType) => void;
}

const Pricing: React.FC<PricingProps> = ({ user, lang, onBack, onPlanSelected }) => {
  const isEs = lang === 'es';

  const plans = [
    {
      id: 'BASIC' as PlanType,
      name: isEs ? 'Básico' : 'Basic',
      price: '9.99',
      limit: '3',
      features: isEs ? [
        '3 análisis por categoría / mes',
        'Feedback SBI & SMART',
        'Reporte de madurez emocional',
        'Historial de sesiones'
      ] : [
        '3 analysis per category / month',
        'SBI & SMART feedback',
        'Emotional maturity report',
        'Session history'
      ],
      color: 'indigo'
    },
    {
      id: 'PRO' as PlanType,
      name: 'Professional',
      price: '14.99',
      limit: '10',
      popular: true,
      features: isEs ? [
        '10 análisis por categoría / mes',
        'Todo lo del Plan Básico',
        'Análisis gestual avanzado',
        'Prioridad en procesamiento'
      ] : [
        '10 analysis per category / month',
        'Everything in Basic Plan',
        'Advanced gesture analysis',
        'Priority processing'
      ],
      color: 'emerald'
    },
    {
      id: 'UNLIMITED' as PlanType,
      name: 'Unlimited',
      price: '49.99',
      limit: '∞',
      features: isEs ? [
        'Análisis ilimitados / mes',
        'Todo lo del Plan Pro',
        'Soporte ejecutivo 24/7',
        'Exportación de datos RAW'
      ] : [
        'Unlimited analysis / month',
        'Everything in Pro Plan',
        '24/7 Executive support',
        'RAW data export'
      ],
      color: 'slate'
    }
  ];

  const handleSelect = async (plan: PlanType) => {
    if (!user) {
      onPlanSelected(plan);
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ plan_type: plan })
        .eq('id', user.id);
      
      if (error) throw error;
      onPlanSelected(plan);
    } catch (err) {
      alert("Error actualizando plan");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 font-inter">
      <div className="text-center mb-20">
        <button 
          onClick={onBack}
          className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-600 transition-colors"
        >
          {isEs ? '← Volver' : '← Back'}
        </button>
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
          {isEs ? 'Eleva tu Liderazgo' : 'Elevate Your Leadership'}
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          {isEs ? 'Selecciona el plan que mejor se adapte a tu ritmo de entrenamiento y objetivos ejecutivos.' : 'Select the plan that best fits your training pace and executive goals.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative flex flex-col p-12 rounded-[4rem] border transition-all duration-500 hover:-translate-y-2 ${
              plan.popular ? 'bg-slate-900 text-white shadow-2xl scale-105 border-slate-800' : 'bg-white border-slate-100 shadow-sm text-slate-900'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                {isEs ? 'Más Popular' : 'Most Popular'}
              </div>
            )}
            
            <div className="mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-4">{plan.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                <span className="text-sm font-bold opacity-40">/ {isEs ? 'mes' : 'month'}</span>
              </div>
              <p className="text-xs font-bold mt-4 opacity-60">
                {isEs ? `${plan.limit} análisis por categoría` : `${plan.limit} analysis per category`}
              </p>
            </div>

            <div className="flex-1 space-y-5 mb-12">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${plan.popular ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}>✓</div>
                  <span className="text-sm font-medium opacity-80">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleSelect(plan.id)}
              disabled={user?.planType === plan.id}
              className={`w-full py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                user?.planType === plan.id 
                  ? 'bg-emerald-500/20 text-emerald-500 cursor-default' :
                plan.popular 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20' 
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              {user?.planType === plan.id ? (isEs ? 'Plan Actual' : 'Current Plan') : (isEs ? 'Seleccionar Plan' : 'Select Plan')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;

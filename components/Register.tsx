
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { User, UserRole, Language, PlanType } from '../types';

interface RegisterProps {
  onRegisterSuccess: (user: User) => void;
  lang: Language;
  selectedPlan: PlanType;
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, lang, selectedPlan, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    dob: '',
    team: '',
    position: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEs = lang === 'es';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([{
          email: formData.email,
          password: formData.password,
          role: UserRole.LIDER,
          plan_type: selectedPlan,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: parseInt(formData.age),
          gender: formData.gender,
          dob: formData.dob,
          team: formData.team,
          position: formData.position
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const user: User = {
        id: data.id,
        email: data.email,
        role: data.role as UserRole,
        planType: data.plan_type as PlanType,
        firstName: data.first_name,
        lastName: data.last_name,
        age: data.age,
        gender: data.gender,
        dob: data.dob,
        team: data.team,
        position: data.position
      };

      onRegisterSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter py-20">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        <button onClick={onBack} className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2">
          ← {isEs ? 'Cambiar Plan' : 'Change Plan'}
        </button>
        
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
            {isEs ? 'Registro de Líder' : 'Leader Registration'} • Plan {selectedPlan}
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            {isEs ? 'Crea tu Perfil' : 'Create Your Profile'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold mb-8 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Email</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{isEs ? 'Contraseña' : 'Password'}</label>
            <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{isEs ? 'Nombre' : 'First Name'}</label>
            <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{isEs ? 'Apellido' : 'Last Name'}</label>
            <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{isEs ? 'Edad' : 'Age'}</label>
            <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{isEs ? 'Género' : 'Gender'}</label>
            <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors">
              <option value="">{isEs ? 'Seleccionar...' : 'Select...'}</option>
              <option value="Masculino">{isEs ? 'Masculino' : 'Male'}</option>
              <option value="Femenino">{isEs ? 'Femenino' : 'Female'}</option>
              <option value="Otro">{isEs ? 'Otro' : 'Other'}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{isEs ? 'Fecha Nacimiento' : 'DOB'}</label>
            <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{isEs ? 'Equipo' : 'Team'}</label>
            <input required value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" placeholder="e.g. Ventas" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">{isEs ? 'Cargo' : 'Position'}</label>
            <input required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" placeholder="e.g. Gerente Regional" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2"
          >
            {loading ? '...' : (isEs ? 'Completar Suscripción' : 'Complete Subscription')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

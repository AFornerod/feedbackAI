
import React, { useEffect, useState } from 'react';
import { User, UserRole, Language, Company } from '../types';
import { supabase } from '../services/supabase';

interface AdminPanelProps {
  user: User;
  lang: Language;
}

type AdminView = 'USERS' | 'COMPANIES';

const AdminPanel: React.FC<AdminPanelProps> = ({ user, lang }) => {
  const [activeView, setActiveView] = useState<AdminView>('USERS');
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string } | null>(null);
  const [editingCompany, setEditingCompany] = useState<Partial<Company> | null>(null);

  const isEs = lang === 'es';

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeView === 'USERS') {
        let query = supabase.from('users').select('*');
        if (user.role === UserRole.COMPANY_ADMIN) {
          query = query.eq('company_id', user.companyId).eq('role', UserRole.LIDER);
        }
        const { data, error } = await query;
        if (error) throw error;
        
        const mappedUsers: User[] = (data || []).map(d => ({
          id: d.id,
          email: d.email,
          role: d.role as UserRole,
          firstName: d.first_name,
          lastName: d.last_name,
          age: d.age,
          gender: d.gender,
          dob: d.dob,
          team: d.team,
          position: d.position,
          companyId: d.company_id,
          companyName: d.company_name
        }));
        setUsers(mappedUsers);
      } else {
        const { data, error } = await supabase.from('companies').select('*');
        if (error) throw error;
        setCompanies(data || []);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeView, user]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const dbPayload = {
        email: editingUser.email,
        password: editingUser.password || '123456', // Password por defecto
        role: user.role === UserRole.COMPANY_ADMIN ? UserRole.LIDER : editingUser.role || UserRole.COMPANY_ADMIN,
        first_name: editingUser.firstName,
        last_name: editingUser.lastName,
        age: editingUser.age,
        gender: editingUser.gender,
        dob: editingUser.dob,
        team: editingUser.team,
        position: editingUser.position,
        company_id: user.role === UserRole.COMPANY_ADMIN ? user.companyId : editingUser.companyId,
        company_name: user.role === UserRole.COMPANY_ADMIN ? user.companyName : editingUser.companyName,
      };

      if (editingUser.id) {
        const { error } = await supabase.from('users').update(dbPayload).eq('id', editingUser.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('users').insert([dbPayload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    try {
      if (editingCompany.id) {
        const { error } = await supabase.from('companies').update({ name: editingCompany.name }).eq('id', editingCompany.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('companies').insert([{ name: editingCompany.name }]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isEs ? "¿Estás seguro?" : "Are you sure?")) return;
    try {
      const table = activeView === 'USERS' ? 'users' : 'companies';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 font-inter">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {isEs ? 'Panel de Gestión' : 'Management Panel'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {user.role === UserRole.SUPER_ADMIN ? (isEs ? 'Control Total de la Plataforma' : 'Full Platform Control') : (isEs ? `Gestión de Líderes - ${user.companyName}` : `Leader Management - ${user.companyName}`)}
          </p>
        </div>
        
        <div className="flex gap-4">
          {user.role === UserRole.SUPER_ADMIN && (
            <div className="bg-slate-100 p-1 rounded-2xl flex">
              <button 
                onClick={() => setActiveView('USERS')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'USERS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {isEs ? 'Usuarios' : 'Users'}
              </button>
              <button 
                onClick={() => setActiveView('COMPANIES')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'COMPANIES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {isEs ? 'Empresas' : 'Companies'}
              </button>
            </div>
          )}
          <button 
            onClick={() => {
              if (activeView === 'USERS') {
                setEditingUser({ role: user.role === UserRole.COMPANY_ADMIN ? UserRole.LIDER : UserRole.COMPANY_ADMIN });
              } else {
                setEditingCompany({});
              }
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            {isEs ? 'Añadir Nuevo' : 'Add New'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{isEs ? 'Cargando...' : 'Loading...'}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  {activeView === 'USERS' ? (
                    <>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{isEs ? 'Usuario' : 'User'}</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{isEs ? 'Edad/Género' : 'Age/Gender'}</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{isEs ? 'Equipo/Puesto' : 'Team/Position'}</th>
                      {user.role === UserRole.SUPER_ADMIN && (
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{isEs ? 'Empresa' : 'Company'}</th>
                      )}
                    </>
                  ) : (
                    <>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{isEs ? 'Nombre' : 'Name'}</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{isEs ? 'Fecha Registro' : 'Reg. Date'}</th>
                    </>
                  )}
                  <th className="px-10 py-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeView === 'USERS' ? (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs uppercase">
                            {u.firstName?.[0] || '?'}{u.lastName?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none">{u.firstName} {u.lastName}</p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase mt-1.5 tracking-wider">{u.role}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-sm font-bold text-slate-500">
                        {u.age} {isEs ? 'años' : 'years'} • {u.gender}
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-slate-900 font-bold text-sm leading-none">{u.position}</p>
                        <p className="text-slate-400 text-xs mt-1">{u.team}</p>
                      </td>
                      {user.role === UserRole.SUPER_ADMIN && (
                        <td className="px-10 py-8 text-sm font-bold text-slate-500">{u.companyName}</td>
                      )}
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  companies.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8 font-bold text-slate-900">{c.name}</td>
                      <td className="px-10 py-8 text-sm font-bold text-slate-400">{new Date(c.created_at || '').toLocaleDateString(lang)}</td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingCompany(c); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-8">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {activeView === 'USERS' ? (editingUser?.id ? (isEs ? 'Editar Usuario' : 'Edit User') : (isEs ? 'Nuevo Usuario' : 'New User')) : (editingCompany?.id ? (isEs ? 'Editar Empresa' : 'Edit Company') : (isEs ? 'Nueva Empresa' : 'New Company'))}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={activeView === 'USERS' ? handleSaveUser : handleSaveCompany} className="p-10 max-h-[70vh] overflow-y-auto">
              {activeView === 'USERS' ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                    <input required type="email" value={editingUser?.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                  </div>
                  {!editingUser?.id && (
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Contraseña' : 'Password'}</label>
                      <input type="password" value={editingUser?.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" placeholder="123456" />
                    </div>
                  )}
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Nombre' : 'First Name'}</label>
                    <input required value={editingUser?.firstName || ''} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Apellido' : 'Last Name'}</label>
                    <input required value={editingUser?.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Edad' : 'Age'}</label>
                    <input required type="number" value={editingUser?.age || ''} onChange={e => setEditingUser({...editingUser, age: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Género' : 'Gender'}</label>
                    <select value={editingUser?.gender || ''} onChange={e => setEditingUser({...editingUser, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors">
                      <option value="">{isEs ? 'Seleccionar...' : 'Select...'}</option>
                      <option value="Masculino">{isEs ? 'Masculino' : 'Male'}</option>
                      <option value="Femenino">{isEs ? 'Femenino' : 'Female'}</option>
                      <option value="Otro">{isEs ? 'Otro' : 'Other'}</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Fecha Nacimiento' : 'DOB'}</label>
                    <input required type="date" value={editingUser?.dob || ''} onChange={e => setEditingUser({...editingUser, dob: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Equipo' : 'Team'}</label>
                    <input required value={editingUser?.team || ''} onChange={e => setEditingUser({...editingUser, team: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Puesto' : 'Position'}</label>
                    <input required value={editingUser?.position || ''} onChange={e => setEditingUser({...editingUser, position: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                  </div>
                  {user.role === UserRole.SUPER_ADMIN && (
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Empresa' : 'Company'}</label>
                      <select required value={editingUser?.companyId || ''} onChange={e => {
                        const comp = companies.find(c => c.id === e.target.value);
                        setEditingUser({...editingUser, companyId: e.target.value, companyName: comp?.name});
                      }} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors">
                        <option value="">{isEs ? 'Seleccionar Empresa' : 'Select Company'}</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}
                  {user.role === UserRole.SUPER_ADMIN && (
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rol</label>
                      <select required value={editingUser?.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors">
                        <option value={UserRole.LIDER}>Líder</option>
                        <option value={UserRole.COMPANY_ADMIN}>Company Admin</option>
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isEs ? 'Nombre Empresa' : 'Company Name'}</label>
                    <input required value={editingCompany?.name || ''} onChange={e => setEditingCompany({...editingCompany, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                  </div>
                </div>
              )}
              
              <div className="mt-12 flex gap-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all">
                  {isEs ? 'Guardar Cambios' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

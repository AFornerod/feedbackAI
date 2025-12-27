
import React, { useState, useEffect, useRef } from 'react';
import { AppState, Scenario, SessionFeedback, Language, User, UserRole, PlanType } from './types';
import { UI_STRINGS } from './constants';
import Dashboard from './components/Dashboard';
import CoachSession from './components/CoachSession';
import Results from './components/Results';
import HistoryView from './components/HistoryView';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Pricing from './components/Pricing';
import Register from './components/Register';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [lang, setLang] = useState<Language>('es');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [feedback, setFeedback] = useState<SessionFeedback | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tempPlan, setTempPlan] = useState<PlanType | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const strings = UI_STRINGS[lang];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAppState(AppState.DASHBOARD);
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    setAppState(AppState.DASHBOARD);
  };

  const logout = () => {
    setCurrentUser(null);
    setAppState(AppState.LANDING);
    setIsProfileMenuOpen(false);
  };

  const startTraining = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setAppState(AppState.PRACTICE);
  };

  const viewHistory = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setAppState(AppState.HISTORY);
  };

  const finishTraining = (data: SessionFeedback) => {
    setFeedback(data);
    setAppState(AppState.RESULTS);
  };

  const handlePlanSelected = (newPlan: PlanType) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, planType: newPlan });
      setAppState(AppState.DASHBOARD);
    } else {
      setTempPlan(newPlan);
      setAppState(AppState.REGISTER);
    }
  };

  const LanguageSelector = () => (
    <div className="flex bg-slate-800/50 rounded-full p-1 border border-white/10">
      <button 
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
      >
        EN
      </button>
      <button 
        onClick={() => setLang('es')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'es' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
      >
        ES
      </button>
    </div>
  );

  const Header = () => {
    if (!currentUser) return null;
    return (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[50]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div 
              className="text-xl font-bold text-slate-900 cursor-pointer hover:opacity-70 transition-opacity" 
              onClick={logout}
              title={lang === 'es' ? 'Volver al Inicio (Cerrar Sesión)' : 'Back to Home (Logout)'}
            >
              Feedback<span className="text-indigo-600">AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setAppState(AppState.DASHBOARD)}
                className={`text-sm font-bold ${appState === AppState.DASHBOARD ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {lang === 'es' ? 'Entrenamiento' : 'Training'}
              </button>
              <button 
                onClick={() => setAppState(AppState.PRICING)}
                className={`text-sm font-bold ${appState === AppState.PRICING ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {lang === 'es' ? 'Planes' : 'Pricing'}
              </button>
              {(currentUser.role === UserRole.COMPANY_ADMIN || currentUser.role === UserRole.SUPER_ADMIN) && (
                <button 
                  onClick={() => setAppState(AppState.ADMIN_PANEL)}
                  className={`text-sm font-bold ${appState === AppState.ADMIN_PANEL ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {lang === 'es' ? 'Gestión' : 'Management'}
                </button>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSelector />
            
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
              >
                <div className="text-right hidden sm:block mr-1">
                  <p className="text-[11px] font-black text-slate-900 leading-none mb-1">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.15em] leading-none">
                    {currentUser.planType || 'FREE'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600 uppercase group-hover:bg-slate-300 transition-colors overflow-hidden">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-6 py-4 border-b border-slate-50 mb-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      {lang === 'es' ? 'Sesión Iniciada' : 'Logged in as'}
                    </p>
                    <p className="text-sm font-black text-slate-900 truncate">{currentUser.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => { setAppState(AppState.DASHBOARD); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {lang === 'es' ? 'Dashboard' : 'Dashboard'}
                  </button>

                  <button 
                    onClick={() => { setAppState(AppState.PRICING); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {lang === 'es' ? 'Mi Suscripción' : 'My Subscription'}
                  </button>

                  <div className="h-[1px] bg-slate-50 my-2" />

                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-black text-red-500 hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {lang === 'es' ? 'Cerrar Sesión' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };

  return (
    <div className="min-h-screen">
      {appState === AppState.LANDING && (
        <div className="bg-slate-900 min-h-screen text-white flex flex-col">
          <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
            <div className="text-2xl font-bold tracking-tight">Feedback<span className="text-indigo-500">AI</span></div>
            <div className="flex items-center gap-8">
              <LanguageSelector />
              <button 
                onClick={() => setAppState(AppState.LOGIN)}
                className="text-slate-400 hover:text-white font-bold transition-all px-4"
              >
                {lang === 'es' ? 'Ingresar' : 'Sign In'}
              </button>
              <button 
                onClick={() => setAppState(AppState.PRICING)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-full font-bold transition-all shadow-xl shadow-indigo-600/20"
              >
                {lang === 'es' ? 'Suscribirse' : 'Subscribe'}
              </button>
            </div>
          </nav>

          <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-20">
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-widest">
              {strings.landingTag}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              {strings.landingTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">{strings.landingTitleSpan}</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              {strings.landingDesc}
            </p>
            <div className="flex flex-col md:flex-row gap-6">
              <button 
                onClick={() => setAppState(AppState.PRICING)}
                className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10"
              >
                {lang === 'es' ? 'Ver Planes' : 'View Plans'}
              </button>
              <button 
                onClick={() => setAppState(AppState.LOGIN)}
                className="bg-slate-800 text-white border border-white/10 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-700 transition-all"
              >
                {lang === 'es' ? 'Acceso Líderes' : 'Leader Access'}
              </button>
            </div>
          </main>
        </div>
      )}

      {appState === AppState.LOGIN && (
        <Login lang={lang} onLoginSuccess={handleLoginSuccess} />
      )}

      {appState === AppState.REGISTER && tempPlan && (
        <Register 
          lang={lang} 
          selectedPlan={tempPlan} 
          onRegisterSuccess={handleRegisterSuccess} 
          onBack={() => setAppState(AppState.PRICING)}
        />
      )}

      {(appState === AppState.DASHBOARD || appState === AppState.PRICING || appState === AppState.ADMIN_PANEL || appState === AppState.HISTORY || appState === AppState.RESULTS) && currentUser && <Header />}

      {appState === AppState.DASHBOARD && currentUser && (
        <div className="min-h-screen bg-slate-50">
          <Dashboard 
            lang={lang} 
            user={currentUser}
            onSelectScenario={startTraining} 
            onViewHistory={viewHistory} 
            onUpgrade={() => setAppState(AppState.PRICING)}
          />
        </div>
      )}

      {appState === AppState.PRICING && (
        <div className="min-h-screen bg-slate-50">
          <Pricing 
            user={currentUser}
            lang={lang}
            onBack={() => currentUser ? setAppState(AppState.DASHBOARD) : setAppState(AppState.LANDING)}
            onPlanSelected={handlePlanSelected}
          />
        </div>
      )}

      {appState === AppState.ADMIN_PANEL && currentUser && (
        <div className="min-h-screen bg-slate-50">
          <AdminPanel 
            user={currentUser} 
            lang={lang} 
          />
        </div>
      )}

      {appState === AppState.HISTORY && selectedScenario && currentUser && (
        <div className="min-h-screen bg-slate-50">
          <HistoryView 
            scenario={selectedScenario} 
            lang={lang} 
            user={currentUser}
            onBack={() => setAppState(AppState.DASHBOARD)} 
          />
        </div>
      )}

      {appState === AppState.PRACTICE && selectedScenario && currentUser && (
        <CoachSession 
          scenario={selectedScenario} 
          lang={lang}
          onFinish={finishTraining} 
          onExit={() => setAppState(AppState.DASHBOARD)}
        />
      )}

      {appState === AppState.RESULTS && feedback && selectedScenario && currentUser && (
        <div className="min-h-screen bg-slate-50">
          <Results 
            feedback={feedback}
            scenario={selectedScenario}
            lang={lang}
            user={currentUser}
            onClose={() => setAppState(AppState.DASHBOARD)} 
          />
        </div>
      )}
    </div>
  );
};

export default App;

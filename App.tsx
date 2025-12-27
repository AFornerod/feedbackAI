
import React, { useState, useEffect } from 'react';
import { AppState, Scenario, SessionFeedback, Language, User, UserRole } from './types';
import { UI_STRINGS } from './constants';
import Dashboard from './components/Dashboard';
import CoachSession from './components/CoachSession';
import Results from './components/Results';
import HistoryView from './components/HistoryView';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [lang, setLang] = useState<Language>('es');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [feedback, setFeedback] = useState<SessionFeedback | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const strings = UI_STRINGS[lang];

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAppState(AppState.DASHBOARD);
  };

  const logout = () => {
    setCurrentUser(null);
    setAppState(AppState.LANDING);
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
            <div className="text-xl font-bold text-slate-900 cursor-pointer" onClick={() => setAppState(AppState.DASHBOARD)}>
              Feedback<span className="text-indigo-600">AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setAppState(AppState.DASHBOARD)}
                className={`text-sm font-bold ${appState === AppState.DASHBOARD ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {lang === 'es' ? 'Entrenamiento' : 'Training'}
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
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                  {currentUser.role === UserRole.SUPER_ADMIN ? 'Super Admin' : 
                   currentUser.role === UserRole.COMPANY_ADMIN ? `Admin ${currentUser.companyName}` : 
                   currentUser.companyName}
                </p>
              </div>
              <button 
                onClick={logout}
                className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600 uppercase hover:bg-red-50 hover:text-red-500 transition-colors"
                title={lang === 'es' ? 'Cerrar Sesión' : 'Logout'}
              >
                {currentUser.firstName[0]}{currentUser.lastName[0]}
              </button>
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-bold transition-all"
              >
                {lang === 'es' ? 'Ingresar' : 'Sign In'}
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
                onClick={() => setAppState(AppState.LOGIN)}
                className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10"
              >
                {strings.startTraining}
              </button>
            </div>
          </main>
        </div>
      )}

      {appState === AppState.LOGIN && (
        <Login lang={lang} onLoginSuccess={handleLoginSuccess} />
      )}

      {appState === AppState.DASHBOARD && currentUser && (
        <div className="min-h-screen bg-slate-50">
          <Header />
          <Dashboard 
            lang={lang} 
            user={currentUser}
            onSelectScenario={startTraining} 
            onViewHistory={viewHistory} 
          />
        </div>
      )}

      {appState === AppState.ADMIN_PANEL && currentUser && (
        <div className="min-h-screen bg-slate-50">
          <Header />
          <AdminPanel 
            user={currentUser} 
            lang={lang} 
          />
        </div>
      )}

      {appState === AppState.HISTORY && selectedScenario && currentUser && (
        <div className="min-h-screen bg-slate-50">
          <Header />
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
          <Header />
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

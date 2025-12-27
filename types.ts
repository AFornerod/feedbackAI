
export type Language = 'en' | 'es';

export enum UserRole {
  LIDER = 'LIDER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export type PlanType = 'FREE' | 'BASIC' | 'PRO' | 'UNLIMITED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  planType: PlanType;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  dob: string;
  team: string;
  position: string;
  companyId?: string;
  companyName?: string;
}

export interface Company {
  id: string;
  name: string;
  created_at?: string;
}

export enum SessionPhase {
  COACHING = 'COACHING',
  SIMULATION = 'SIMULATION'
}

export interface SmartCriteria {
  specific: boolean;
  measurable: boolean;
  achievable: boolean;
  relevant: boolean;
  timeBound: boolean;
}

export interface SessionFeedback {
  score: number;
  clarity: number;
  empathy: number;
  assertiveness: number;
  languageCorrectness: number;
  languageAppropriateness: number;
  communication: number;
  emotionalIntelligence: number;
  smartScore: number;
  verbalAnalysis: string;
  emotionalAnalysis: string;
  bodyLanguageAnalysis: string;
  smartCriteria: SmartCriteria;
  keyTakeaways: string[];
  improvementAreas: string[];
  actionPlan: string[];
  suggestions: string[];
  marketMethodology: string;
  fillerWordCount: Record<string, number>;
  obsceneLanguageDetected: boolean;
}

export enum AppState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  PRACTICE = 'PRACTICE',
  RESULTS = 'RESULTS',
  HISTORY = 'HISTORY',
  ADMIN_PANEL = 'ADMIN_PANEL',
  PRICING = 'PRICING'
}

export interface Scenario {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
}

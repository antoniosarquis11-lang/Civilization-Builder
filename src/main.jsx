import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Landmark, Factory, Shield, Leaf, Users, TrendingUp, Crown, Banknote, Sparkles, ScrollText, Vote, Flame, Ship, GraduationCap, RadioTower, Hammer, Globe2, RotateCcw, Save, Play } from 'lucide-react';
import './styles.css';

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const fmt = (n, digits = 1) => Number(n).toLocaleString(undefined, { maximumFractionDigits: digits });
const pick = (arr, seed) => arr[Math.abs(Math.floor(seed)) % arr.length];

const GEOGRAPHIES = {
  island: { label: 'Island Republic', icon: '🏝️', growth: 0.7, trade: 1.2, environment: 3, military: -2, story: 'sea routes, ports and vulnerability to storms' },
  coastal: { label: 'Coastal State', icon: '🌊', growth: 0.9, trade: 1.15, environment: -1, military: 0, story: 'ports, trade corridors and coastal megacities' },
  delta: { label: 'River Delta', icon: '🌾', growth: 0.8, trade: 0.9, environment: -3, military: -1, story: 'fertile land, floods and dense population centers' },
  mountain: { label: 'Mountain Realm', icon: '⛰️', growth: -0.2, trade: 0.7, environment: 5, military: 4, story: 'hard borders, minerals and isolated valleys' },
  desert: { label: 'Desert Federation', icon: '🏜️', growth: -0.4, trade: 0.8, environment: -4, military: 1, story: 'water scarcity, solar potential and fragile cities' },
  landlocked: { label: 'Landlocked Republic', icon: '🛤️', growth: -0.5, trade: 0.65, environment: 1, military: 1, story: 'border dependence, railways and regional diplomacy' }
};

const SYSTEMS = {
  democracy: { label: 'Democracy', icon: '🗳️', stability: 2, corruption: -4, capital: 9, election: true, legitimacyName: 'Mandate' },
  technocracy: { label: 'Technocracy', icon: '⚙️', stability: 4, corruption: -2, capital: 8, election: false, legitimacyName: 'Competence' },
  monarchy: { label: 'Constitutional Monarchy', icon: '👑', stability: 5, corruption: 1, capital: 7, election: false, legitimacyName: 'Dynastic legitimacy' },
  military: { label: 'Military Regime', icon: '🪖', stability: 1, corruption: 5, capital: 6, election: false, legitimacyName: 'Elite loyalty' },
  socialist: { label: 'Social Republic', icon: '✊', stability: 2, corruption: 2, capital: 8, election: true, legitimacyName: 'Popular mandate' }
};

const RESOURCES = {
  agriculture: { label: 'Agriculture', icon: '🌱', growth: 0.5, inequality: -2, environment: -1, diplomacy: 0 },
  oil: { label: 'Oil & Gas', icon: '🛢️', growth: 1.2, inequality: 5, environment: -6, diplomacy: 3 },
  minerals: { label: 'Critical Minerals', icon: '⛏️', growth: 1.0, inequality: 3, environment: -5, diplomacy: 2 },
  tourism: { label: 'Tourism', icon: '🏖️', growth: 0.6, inequality: 0, environment: -2, diplomacy: 2 },
  manufacturing: { label: 'Manufacturing', icon: '🏭', growth: 0.9, inequality: 1, environment: -4, diplomacy: 1 },
  finance: { label: 'Finance', icon: '🏦', growth: 0.8, inequality: 4, environment: 1, diplomacy: 3 },
  tech: { label: 'Technology', icon: '💽', growth: 1.1, inequality: 3, environment: 1, diplomacy: 3 },
  ports: { label: 'Deepwater Ports', icon: '🚢', growth: 0.8, inequality: 1, environment: -2, diplomacy: 4 }
};

const LEVELS = {
  poor: { label: 'Low-income', gdp: 9, edu: 32, infra: 28, innovation: 18, stability: 48, corruption: 62 },
  emerging: { label: 'Emerging', gdp: 45, edu: 48, infra: 44, innovation: 35, stability: 55, corruption: 49 },
  middle: { label: 'Middle-income', gdp: 180, edu: 61, infra: 60, innovation: 52, stability: 63, corruption: 36 },
  advanced: { label: 'Advanced', gdp: 620, edu: 76, infra: 78, innovation: 72, stability: 70, corruption: 22 }
};

const PROJECTS = [
  { id: 'port', name: 'Deepwater Port', icon: Ship, cost: 28, years: 4, effect: { gdp: 18, diplomacy: 6, environment: -3 }, req: ['coastal','island','delta'], desc: 'Expands trade capacity and makes the capital a maritime hub.' },
  { id: 'university', name: 'National University System', icon: GraduationCap, cost: 24, years: 5, effect: { education: 13, innovation: 12, satisfaction: 4 }, desc: 'Creates elite campuses and technical institutes across the country.' },
  { id: 'solar', name: 'Solar Grid', icon: Leaf, cost: 22, years: 4, effect: { environment: 14, gdp: 6, stability: 2 }, req: ['desert','coastal','landlocked'], desc: 'Reduces energy pressure and gives the state a green industrial symbol.' },
  { id: 'rail', name: 'National Rail Corridor', icon: Hammer, cost: 30, years: 6, effect: { infrastructure: 15, gdp: 14, inequality: -4 }, desc: 'Links neglected regions to ports, markets and the capital.' },
  { id: 'agency', name: 'Anti-Corruption Agency', icon: Landmark, cost: 18, years: 3, capital: 4, effect: { corruption: -14, stability: 5, gdp: 5 }, desc: 'Investigates contracts, customs offices and public procurement.' },
  { id: 'army', name: 'Defense Modernization', icon: Shield, cost: 26, years: 4, effect: { military: 18, stability: 3, diplomacy: -2 }, desc: 'Professionalizes the armed forces and upgrades border security.' },
  { id: 'techcity', name: 'Innovation City', icon: RadioTower, cost: 34, years: 6, effect: { innovation: 18, gdp: 16, inequality: 5 }, desc: 'Builds a futuristic city district for startups, labs and global firms.' },
  { id: 'housing', name: 'Mass Housing Plan', icon: Users, cost: 24, years: 4, effect: { satisfaction: 11, inequality: -9, stability: 4 }, desc: 'Attacks the urban housing crisis before it turns political.' }
];

const DECISIONS = [
  {
    id: 'protests', title: 'Youth protests erupt in the capital', kind: 'social', image: 'protest', text: 'Students and young workers accuse the government of building growth without a future for them.',
    trigger: s => s.satisfaction < 53 || s.inequality > 60,
    options: [
      { label: 'Fund youth jobs', effect: { satisfaction: 9, inequality: -3, gdp: -4, debt: 5, youth: 12 }, cost: 10 },
      { label: 'Police crackdown', effect: { stability: 6, satisfaction: -11, militaryFaction: 8, youth: -18, democracy: -7 }, capital: 2 },
      { label: 'Announce education reform', effect: { education: 6, innovation: 5, satisfaction: 3, debt: 3, youth: 7 }, cost: 7 },
      { label: 'Ignore it', effect: { stability: -9, satisfaction: -7, youth: -12 } }
    ]
  },
  {
    id: 'commodity', title: 'Commodity boom hits world markets', kind: 'economy', image: 'boom', text: 'Foreign buyers rush toward your exports. The treasury sees a chance for rapid expansion.',
    trigger: s => s.resources.some(r => ['oil','minerals','agriculture'].includes(r)),
    options: [
      { label: 'Create sovereign wealth fund', effect: { gdp: 10, stability: 7, corruption: -3, diplomacy: 3 }, cost: 8, capital: 3 },
      { label: 'Spend windfall immediately', effect: { gdp: 15, satisfaction: 8, inflation: 5, corruption: 5 }, cost: -8 },
      { label: 'Cut taxes for exporters', effect: { gdp: 12, inequality: 6, business: 12, workers: -5 }, capital: 2 },
      { label: 'Protect the environment', effect: { environment: 8, gdp: 2, business: -8, greens: 10 }, capital: 2 }
    ]
  },
  {
    id: 'drought', title: 'Severe drought threatens the countryside', kind: 'climate', image: 'drought', text: 'Reservoirs shrink and rural districts demand emergency help before migration begins.',
    trigger: s => s.environment < 58 || s.geography === 'desert' || s.resources.includes('agriculture'),
    options: [
      { label: 'Emergency irrigation plan', effect: { satisfaction: 5, environment: 5, rural: 12, debt: 7 }, cost: 12 },
      { label: 'Import food and water', effect: { satisfaction: 8, gdp: -5, diplomacy: 2, debt: 6 }, cost: 10 },
      { label: 'Let market prices adjust', effect: { gdp: 2, satisfaction: -9, inequality: 5, rural: -14 }, capital: 1 },
      { label: 'National climate plan', effect: { environment: 12, innovation: 4, gdp: -3, greens: 14 }, cost: 9, capital: 3 }
    ]
  },
  {
    id: 'investors', title: 'Foreign investment delegation arrives', kind: 'diplomacy', image: 'investors', text: 'A coalition of firms offers factories, finance and logistics — but asks for favorable rules.',
    trigger: s => s.diplomacy > 45,
    options: [
      { label: 'Open special economic zones', effect: { gdp: 16, inequality: 5, environment: -4, business: 12, workers: -2 }, cost: 5 },
      { label: 'Demand local hiring rules', effect: { gdp: 8, workers: 10, business: -5, satisfaction: 4 }, capital: 2 },
      { label: 'Reject dependency', effect: { diplomacy: -8, stability: 3, gdp: -3, rural: 3 }, capital: 1 },
      { label: 'Trade access for green standards', effect: { gdp: 7, environment: 7, diplomacy: 5, business: -3 }, capital: 3 }
    ]
  },
  {
    id: 'scandal', title: 'Corruption scandal reaches the cabinet', kind: 'politics', image: 'scandal', text: 'Leaked contracts reveal that public money disappeared into shell companies.',
    trigger: s => s.corruption > 40,
    options: [
      { label: 'Launch public investigation', effect: { corruption: -10, stability: 3, elites: -12, satisfaction: 6 }, capital: 4 },
      { label: 'Sacrifice a minister', effect: { corruption: -4, stability: 2, satisfaction: 2 }, capital: 2 },
      { label: 'Suppress the media', effect: { stability: 5, satisfaction: -8, corruption: 5, elites: 8, democracy: -8 }, capital: 2 },
      { label: 'Deny everything', effect: { corruption: 8, satisfaction: -9, stability: -5 } }
    ]
  },
  {
    id: 'border', title: 'Border crisis with a rival state', kind: 'security', image: 'border', text: 'A neighboring government moves troops near a disputed frontier.',
    trigger: s => s.military < 65 || s.diplomacy < 55,
    options: [
      { label: 'Mobilize the army', effect: { military: 8, stability: 4, diplomacy: -6, militaryFaction: 10 }, cost: 8 },
      { label: 'International mediation', effect: { diplomacy: 9, stability: 3, militaryFaction: -5 }, capital: 2 },
      { label: 'Quietly strengthen border towns', effect: { stability: 5, infrastructure: 4, rural: 5 }, cost: 7 },
      { label: 'Escalate rhetorically', effect: { satisfaction: 4, diplomacy: -9, stability: -3, militaryFaction: 6 } }
    ]
  },
  {
    id: 'automation', title: 'Automation threatens industrial jobs', kind: 'technology', image: 'tech', text: 'Factories modernize fast, but workers fear that progress is leaving them behind.',
    trigger: s => s.innovation > 55 || s.resources.includes('tech') || s.resources.includes('manufacturing'),
    options: [
      { label: 'Mass retraining program', effect: { innovation: 8, workers: 9, satisfaction: 5, debt: 6 }, cost: 11 },
      { label: 'Subsidize old jobs', effect: { satisfaction: 6, innovation: -4, debt: 7, workers: 8 }, cost: 10 },
      { label: 'Let firms automate', effect: { gdp: 12, inequality: 6, business: 10, workers: -12 }, capital: 1 },
      { label: 'Tax robots for welfare', effect: { inequality: -6, satisfaction: 4, business: -10, gdp: 2 }, capital: 3 }
    ]
  }
];

const EVENT_IMAGES = {
  protest: ['✊', '🏛️', '📢'], boom: ['📈', '🛢️', '💰'], drought: ['☀️', '🌾', '💧'], investors: ['✈️', '🏦', '🏭'], scandal: ['📰', '⚖️', '💼'], border: ['🛡️', '🗻', '🚧'], tech: ['🤖', '🏭', '💽'], normal: ['🌆','🗞️','🌍']
};

function makeInitialNation(form) {
  const level = LEVELS[form.level];
  const geo = GEOGRAPHIES[form.geography];
  const sys = SYSTEMS[form.system];
  const resMods = form.resources.map(r => RESOURCES[r]);
  const pop = Number(form.population);
  const gdp = level.gdp * (pop / 8) * (1 + resMods.reduce((a, r) => a + r.growth, 0) / 12);
  const seed = form.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + pop * 7;
  return {
    name: form.name || 'Nova Civitas', geography: form.geography, system: form.system, resources: form.resources, year: 1,
    population: pop, gdp, debt: 38, budget: 100, politicalCapital: sys.capital,
    gdpPerCapita: (gdp * 1000) / pop,
    education: level.edu, infrastructure: level.infra, innovation: level.innovation,
    stability: clamp(level.stability + sys.stability + geo.military), corruption: clamp(level.corruption + sys.corruption),
    satisfaction: 56, inequality: clamp(45 + resMods.reduce((a, r) => a + r.inequality, 0)), environment: clamp(67 + geo.environment + resMods.reduce((a, r) => a + r.environment, 0)),
    military: clamp(42 + geo.military + (form.system === 'military' ? 16 : 0)), diplomacy: clamp(48 + resMods.reduce((a, r) => a + r.diplomacy, 0) + geo.trade * 4),
    inflation: 6, democracy: form.system === 'military' ? 24 : form.system === 'technocracy' ? 52 : 72,
    factions: { business: 55, workers: 55, military: form.system === 'military' ? 72 : 55, youth: 54, rural: 55, elites: 58, greens: 50 },
    projects: [], completedProjects: [], history: [], pendingDecision: null, lastEvent: null, gameOver: false, ending: null, score: 0,
    flag: { seed, palette: seed % 5, symbol: pick(['star','sun','wave','mountain','gear','leaf'], seed) },
    leader: { title: form.system === 'monarchy' ? 'Crown Council' : form.system === 'military' ? 'High Command' : 'Government', portrait: pick(['◆','●','▲','✦','◈','⬟'], seed) }
  };
}

function applyEffect(state, effect = {}) {
  const next = { ...state, factions: { ...state.factions } };
  const map = {
    gdp: v => next.gdp *= (1 + v / 100), debt: v => next.debt = clamp(next.debt + v, 0, 180), education: v => next.education = clamp(next.education + v), infrastructure: v => next.infrastructure = clamp(next.infrastructure + v), innovation: v => next.innovation = clamp(next.innovation + v), stability: v => next.stability = clamp(next.stability + v), corruption: v => next.corruption = clamp(next.corruption + v), satisfaction: v => next.satisfaction = clamp(next.satisfaction + v), inequality: v => next.inequality = clamp(next.inequality + v), environment: v => next.environment = clamp(next.environment + v), military: v => next.military = clamp(next.military + v), diplomacy: v => next.diplomacy = clamp(next.diplomacy + v), inflation: v => next.inflation = clamp(next.inflation + v, 0, 80), democracy: v => next.democracy = clamp(next.democracy + v)
  };
  Object.entries(effect).forEach(([k, v]) => {
    if (map[k]) map[k](v);
    if (k === 'business') next.factions.business = clamp(next.factions.business + v);
    if (k === 'workers') next.factions.workers = clamp(next.factions.workers + v);
    if (k === 'militaryFaction') next.factions.military = clamp(next.factions.military + v);
    if (k === 'youth') next.factions.youth = clamp(next.factions.youth + v);
    if (k === 'rural') next.factions.rural = clamp(next.factions.rural + v);
    if (k === 'elites') next.factions.elites = clamp(next.factions.elites + v);
    if (k === 'greens') next.factions.greens = clamp(next.factions.greens + v);
  });
  next.gdpPerCapita = (next.gdp * 1000) / next.population;
  return next;
}

function yearlyUpdate(state, budget) {
  let next = { ...state, factions: { ...state.factions }, history: [...state.history], projects: state.projects.map(p => ({ ...p })) };
  const geo = GEOGRAPHIES[next.geography];
  const resGrowth = next.resources.reduce((a, r) => a + RESOURCES[r].growth, 0);
  const weightedBudget = (budget.education + budget.infrastructure + budget.security + budget.welfare + budget.environment + budget.innovation) || 1;
  const overspend = Math.max(0, weightedBudget - 100);
  const underspend = Math.max(0, 100 - weightedBudget);
  next.debt = clamp(next.debt + overspend * 0.22 - budget.debt * 0.18, 0, 180);
  next.education = clamp(next.education + (budget.education - 15) * 0.18);
  next.infrastructure = clamp(next.infrastructure + (budget.infrastructure - 15) * 0.2);
  next.military = clamp(next.military + (budget.security - 12) * 0.22);
  next.satisfaction = clamp(next.satisfaction + (budget.welfare - 13) * 0.16 - Math.max(0, next.inflation - 10) * 0.08);
  next.environment = clamp(next.environment + (budget.environment - 10) * 0.24 - 0.8);
  next.innovation = clamp(next.innovation + (budget.innovation - 12) * 0.22 + (next.education - 55) * 0.025);
  next.corruption = clamp(next.corruption - (budget.governance - 8) * 0.28 + (next.debt > 90 ? 1.2 : 0));
  next.inequality = clamp(next.inequality - (budget.welfare - 10) * 0.08 + (resGrowth > 1.5 ? 0.7 : 0));
  next.diplomacy = clamp(next.diplomacy + (geo.trade - 1) * 0.8 + (next.corruption < 35 ? 0.6 : -0.2));
  const growth = 1.2 + resGrowth + geo.growth + (next.education - 50) * 0.015 + (next.infrastructure - 50) * 0.018 + (next.innovation - 50) * 0.02 - (next.corruption - 35) * 0.016 - Math.max(0, next.debt - 70) * 0.025 - Math.max(0, next.environment < 35 ? 1.2 : 0);
  next.gdp *= 1 + growth / 100;
  next.inflation = clamp(next.inflation + overspend * 0.05 - budget.debt * 0.03 + (growth > 5 ? 0.3 : -0.2), 1, 40);
  next.stability = clamp(next.stability + (next.satisfaction - 50) * 0.035 - (next.inequality - 50) * 0.025 - (next.corruption - 45) * 0.02 + SYSTEMS[next.system].stability * 0.05);
  next.population *= 1 + (0.65 + (next.satisfaction - 50) * 0.005 - Math.max(0, next.inequality - 65) * 0.006) / 100;
  next.projects = next.projects.map(p => ({ ...p, remaining: Math.max(0, p.remaining - 1) }));
  const finished = next.projects.filter(p => p.remaining === 0);
  finished.forEach(p => { next = applyEffect(next, p.effect); next.completedProjects.push(p.id); next.history.push({ year: next.year, title: `${p.name} completed`, type: 'project', text: p.completeText || `The ${p.name.toLowerCase()} is now reshaping national development.` }); });
  next.projects = next.projects.filter(p => p.remaining > 0);
  const factionDrift = { ...next.factions };
  factionDrift.business += growth > 3 ? 1 : -1;
  factionDrift.workers += next.inequality < 50 ? 1 : -0.8;
  factionDrift.youth += next.innovation > 55 ? 1 : -0.5;
  factionDrift.greens += next.environment > 55 ? 1 : -1.2;
  factionDrift.elites += next.corruption > 45 ? 0.6 : -0.4;
  factionDrift.military += next.military > 55 ? 0.8 : -0.5;
  next.factions = Object.fromEntries(Object.entries(factionDrift).map(([k,v]) => [k, clamp(v)]));
  const incident = randomIncident(next, growth);
  if (incident) { next = applyEffect(next, incident.effect); next.history.push({ year: next.year, title: incident.title, type: 'incident', text: incident.text }); }
  next.year += 1;
  next.politicalCapital = clamp(SYSTEMS[next.system].capital + Math.round((next.stability - 50) / 13) + (next.satisfaction > 62 ? 1 : 0), 3, 12);
  next.gdpPerCapita = (next.gdp * 1000) / next.population;
  const decision = selectDecision(next);
  if (decision && next.year <= 50) next.pendingDecision = decision;
  if ((SYSTEMS[next.system].election && next.year % 5 === 0) || (!SYSTEMS[next.system].election && next.year % 6 === 0)) {
    const electoral = Math.round((next.satisfaction + next.stability + (100 - next.corruption)) / 3);
    const title = SYSTEMS[next.system].election ? 'Election cycle' : 'Regime loyalty review';
    const text = SYSTEMS[next.system].election ? `Voters judge the government. Support stands at ${electoral}/100.` : `Elites, officers and regional bosses review the regime. Loyalty stands at ${electoral}/100.`;
    next.history.push({ year: next.year, title, type: 'politics', text });
    next.stability = clamp(next.stability + (electoral - 55) * 0.12);
    next.satisfaction = clamp(next.satisfaction + (electoral - 55) * 0.08);
    if (electoral < 32) {
      next.gameOver = true;
      next.ending = SYSTEMS[next.system].election ? 'Your government lost power after a crushing legitimacy crisis.' : 'Your regime collapsed after elite defections and street pressure converged.';
    }
  }
  if (next.year > 50) {
    next.gameOver = true;
    next.ending = finalEnding(next);
  }
  next.score = scoreNation(next);
  return next;
}

function selectDecision(s) {
  const candidates = DECISIONS.filter(d => d.trigger(s));
  if (!candidates.length || s.year % 2 !== 0) return null;
  return candidates[(s.year + Math.round(s.corruption) + Math.round(s.inequality)) % candidates.length];
}

function randomIncident(s, growth) {
  const key = (s.year * 17 + Math.round(s.gdp) + Math.round(s.stability)) % 11;
  if (key > 3) return null;
  const incidents = [
    { title: 'A cultural renaissance spreads', text: 'Film, music and literature put the country on the regional map.', effect: { satisfaction: 3, diplomacy: 2, innovation: 1 } },
    { title: 'Regional blackout exposes weak infrastructure', text: 'A major power failure forces ministers to confront decades of underinvestment.', effect: { satisfaction: -3, infrastructure: -2, stability: -2 } },
    { title: 'Startups attract global attention', text: 'Foreign media call the capital an unexpected innovation hub.', effect: { innovation: 3, diplomacy: 2, gdp: 2 } },
    { title: 'Food prices rise sharply', text: 'Households feel inflation first in markets and bakeries.', effect: { satisfaction: -4, inflation: 2, inequality: 2 } },
    { title: growth > 3 ? 'New middle class emerges' : 'Brain drain accelerates', text: growth > 3 ? 'Young families begin buying homes, cars and private services.' : 'Skilled graduates leave for more predictable opportunities abroad.', effect: growth > 3 ? { satisfaction: 3, gdp: 2 } : { innovation: -3, satisfaction: -3 } }
  ];
  return incidents[key % incidents.length];
}

function finalEnding(s) {
  if (s.score > 82) return 'Golden Age: your civilization became stable, innovative and globally respected.';
  if (s.score > 68) return 'Resilient Power: your country survived pressure and built a serious national model.';
  if (s.score > 52) return 'Uneven Modernization: growth arrived, but tensions remain unresolved.';
  if (s.score > 35) return 'Fragile State: the nation survived, but legitimacy and development remain weak.';
  return 'Lost Decades: crises, distrust and underinvestment left the country behind.';
}

function scoreNation(s) {
  return Math.round(clamp((s.stability + s.satisfaction + (100 - s.corruption) + (100 - s.inequality) + s.environment + s.innovation + Math.min(100, s.gdpPerCapita / 0.45) + s.diplomacy) / 8));
}

const initialForm = { name: 'Aurelia', geography: 'coastal', system: 'democracy', level: 'emerging', population: 12, resources: ['manufacturing','ports','tourism'] };

function App() {
  const [screen, setScreen] = useState('home');
  const [form, setForm] = useState(initialForm);
  const [nation, setNation] = useState(null);
  const [budget, setBudget] = useState({ education: 16, infrastructure: 18, security: 12, welfare: 14, environment: 10, innovation: 14, governance: 8, debt: 8 });
  const [toast, setToast] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('civbuilder-v2');
    if (saved) { try { setNation(JSON.parse(saved)); } catch {} }
  }, []);
  useEffect(() => { if (nation) localStorage.setItem('civbuilder-v2', JSON.stringify(nation)); }, [nation]);

  const startGame = () => { const n = makeInitialNation(form); setNation(n); setScreen('game'); setToast('Nation founded. Year 1 begins.'); };
  const advance = () => { if (!nation || nation.pendingDecision || nation.gameOver) return; const n = yearlyUpdate(nation, budget); setNation(n); setToast(n.pendingDecision ? 'A national decision requires your response.' : `Year ${Math.min(n.year, 50)} begins.`); };
  const chooseOption = (option) => {
    if (!nation?.pendingDecision) return;
    if ((option.cost || 0) > availableBudget) { setToast('Not enough budget for that response.'); return; }
    if ((option.capital || 0) > nation.politicalCapital) { setToast('Not enough political capital.'); return; }
    let next = { ...nation, politicalCapital: nation.politicalCapital - (option.capital || 0), budget: nation.budget - Math.max(0, option.cost || 0), pendingDecision: null };
    if (option.cost && option.cost < 0) next.budget += Math.abs(option.cost);
    next = applyEffect(next, option.effect);
    next.history = [{ year: next.year, title: nation.pendingDecision.title, type: nation.pendingDecision.kind, text: `${nation.pendingDecision.text} Response: ${option.label}.` }, ...next.history].slice(0, 80);
    setNation(next); setToast('Decision applied. Consequences will continue unfolding.');
  };
  const startProject = (project) => {
    if (!nation) return;
    if (nation.completedProjects.includes(project.id) || nation.projects.some(p => p.id === project.id)) return;
    if (project.req && !project.req.includes(nation.geography)) { setToast('This project does not fit your geography.'); return; }
    if (project.cost > availableBudget) { setToast('Not enough annual budget to start this project.'); return; }
    if ((project.capital || 0) > nation.politicalCapital) { setToast('Not enough political capital.'); return; }
    const Icon = project.icon;
    setNation({ ...nation, budget: nation.budget - project.cost, politicalCapital: nation.politicalCapital - (project.capital || 0), projects: [...nation.projects, { ...project, remaining: project.years, iconName: Icon.name }], history: [{ year: nation.year, title: `${project.name} started`, type: 'project', text: project.desc }, ...nation.history].slice(0, 80) });
    setToast(`${project.name} started.`);
  };
  const reset = () => { localStorage.removeItem('civbuilder-v2'); setNation(null); setScreen('home'); setToast(''); };
  const save = () => { if (nation) { localStorage.setItem('civbuilder-v2', JSON.stringify(nation)); setToast('Game saved in this browser.'); } };

  const availableBudget = nation ? nation.budget : 100;

  return <div className="app">
    <div className="backgroundGlow" />
    {toast && <div className="toast" onAnimationEnd={() => setToast('')}>{toast}</div>}
    <Header nation={nation} setScreen={setScreen} reset={reset} save={save} />
    {screen === 'home' && <Home form={form} setForm={setForm} startGame={startGame} nation={nation} continueGame={() => setScreen('game')} />}
    {screen === 'game' && nation && <Game nation={nation} budget={budget} setBudget={setBudget} advance={advance} chooseOption={chooseOption} startProject={startProject} availableBudget={availableBudget} reset={reset} />}
  </div>;
}

function Header({ nation, setScreen, reset, save }) {
  return <header className="topbar">
    <button className="brand" onClick={() => setScreen(nation ? 'game' : 'home')}><Globe2 size={22} /><span>Civilization Builder</span><em>v2</em></button>
    <div className="topActions">
      {nation && <><button onClick={save}><Save size={16}/>Save</button><button onClick={reset}><RotateCcw size={16}/>New Nation</button></>}
    </div>
  </header>;
}

function Home({ form, setForm, startGame, nation, continueGame }) {
  const toggleResource = (r) => setForm(f => ({ ...f, resources: f.resources.includes(r) ? f.resources.filter(x => x !== r) : f.resources.length < 3 ? [...f.resources, r] : [f.resources[1], f.resources[2], r] }));
  return <main className="home pageEnter">
    <section className="hero card cinematic">
      <div>
        <p className="eyebrow">Turn-based nation management</p>
        <h1>Build a country. Govern its crises. Watch history judge you.</h1>
        <p className="sub">Version 2 is no longer a passive simulator: every year you allocate budgets, launch national projects, manage factions and respond to crises.</p>
        <div className="heroButtons"><button className="primary" onClick={startGame}><Play size={18}/>Start new civilization</button>{nation && <button onClick={continueGame}>Continue saved game</button>}</div>
      </div>
      <div className="heroVisual"><Flag flag={{ seed: form.name.length * 27 + form.population, palette: form.population % 5, symbol: 'sun' }} /><div className="cityMock"><span/><span/><span/><span/><span/></div><p>{GEOGRAPHIES[form.geography].icon} {GEOGRAPHIES[form.geography].label}</p></div>
    </section>
    <section className="builderGrid">
      <div className="card formCard">
        <h2>Found your nation</h2>
        <label>Country name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label>
        <label>Population: {form.population} million<input type="range" min="2" max="85" value={form.population} onChange={e => setForm({ ...form, population: Number(e.target.value) })}/></label>
        <SelectCards title="Geography" items={GEOGRAPHIES} value={form.geography} onChange={v => setForm({ ...form, geography: v })}/>
        <SelectCards title="Political system" items={SYSTEMS} value={form.system} onChange={v => setForm({ ...form, system: v })}/>
        <SelectCards title="Development level" items={LEVELS} value={form.level} onChange={v => setForm({ ...form, level: v })}/>
      </div>
      <div className="card resourcesCard">
        <h2>Resource base <small>choose up to 3</small></h2>
        <div className="resourceGrid">{Object.entries(RESOURCES).map(([k,r]) => <button key={k} className={form.resources.includes(k) ? 'selected miniCard' : 'miniCard'} onClick={() => toggleResource(k)}><span>{r.icon}</span><b>{r.label}</b></button>)}</div>
        <div className="previewBox"><h3>National premise</h3><p>{form.name || 'Your country'} begins as a {LEVELS[form.level].label.toLowerCase()} {GEOGRAPHIES[form.geography].label.toLowerCase()} shaped by {GEOGRAPHIES[form.geography].story}. Its ruling model is a {SYSTEMS[form.system].label.toLowerCase()}.</p></div>
      </div>
    </section>
  </main>;
}

function SelectCards({ title, items, value, onChange }) {
  return <div className="selectBlock"><h3>{title}</h3><div className="choiceRow">{Object.entries(items).map(([k,item]) => <button key={k} className={value === k ? 'selected choice' : 'choice'} onClick={() => onChange(k)}><span>{item.icon || ''}</span>{item.label}</button>)}</div></div>;
}

function Game({ nation, budget, setBudget, advance, chooseOption, startProject, availableBudget, reset }) {
  return <main className="game pageEnter">
    <NationBanner nation={nation} />
    {nation.gameOver ? <FinalScreen nation={nation} reset={reset} /> : <>
      {nation.pendingDecision && <DecisionModal decision={nation.pendingDecision} chooseOption={chooseOption} budget={availableBudget} capital={nation.politicalCapital} />}
      <section className="gameGrid">
        <div className="leftCol"><LiveNation nation={nation}/><BudgetPanel budget={budget} setBudget={setBudget} availableBudget={availableBudget}/><Projects nation={nation} startProject={startProject} availableBudget={availableBudget}/></div>
        <div className="mainCol"><StatusPanel nation={nation}/><ActionPanel nation={nation} advance={advance}/><StatsCharts nation={nation}/><Timeline history={nation.history}/></div>
        <div className="rightCol"><Factions nation={nation}/><Advisor nation={nation}/></div>
      </section>
    </>}
  </main>;
}

function NationBanner({ nation }) {
  return <section className="nationBanner card">
    <Flag flag={nation.flag}/>
    <div><p className="eyebrow">Year {Math.min(nation.year, 50)} / 50 · {SYSTEMS[nation.system].label}</p><h1>{nation.name}</h1><p>{GEOGRAPHIES[nation.geography].icon} {GEOGRAPHIES[nation.geography].label} · {nation.resources.map(r => RESOURCES[r].label).join(' · ')}</p></div>
    <div className="scoreOrb"><span>{nation.score}</span><small>score</small></div>
  </section>;
}

function Flag({ flag }) {
  const palettes = [['#1d4ed8','#f8fafc','#f59e0b'],['#7f1d1d','#fee2e2','#166534'],['#111827','#d1d5db','#38bdf8'],['#064e3b','#ecfdf5','#fbbf24'],['#581c87','#f5d0fe','#fb7185']];
  const p = palettes[flag.palette % palettes.length];
  return <div className="flag" style={{ '--a': p[0], '--b': p[1], '--c': p[2] }}><div className="stripe"/><div className="stripe2"/><div className="symbol">{flag.symbol === 'star' ? '★' : flag.symbol === 'sun' ? '☀' : flag.symbol === 'wave' ? '≈' : flag.symbol === 'mountain' ? '▲' : flag.symbol === 'gear' ? '⚙' : '◆'}</div></div>;
}

function LiveNation({ nation }) {
  const mood = nation.satisfaction > 65 ? 'optimistic' : nation.satisfaction < 42 ? 'tense' : 'watchful';
  const env = nation.environment > 60 ? 'clear skies' : nation.environment < 38 ? 'polluted horizon' : 'industrial haze';
  const buildings = Math.max(3, Math.min(8, Math.round(nation.gdpPerCapita / 8) + 3));
  return <div className="card liveNation">
    <div className="sceneHeader"><span>{mood}</span><span>{env}</span></div>
    <div className={`skyline ${mood}`}>{Array.from({ length: buildings }).map((_,i) => <i key={i} style={{ height: `${35 + ((i*17 + nation.year*3)%60)}px` }} />)}<div className="sun"/></div>
    <div className="visualStats"><span><Users size={15}/> {fmt(nation.population)}m</span><span><Banknote size={15}/> ${fmt(nation.gdp)}bn</span><span><Crown size={15}/> {nation.politicalCapital} capital</span></div>
  </div>;
}

function StatusPanel({ nation }) {
  const stats = [ ['GDP/cap', `$${fmt(nation.gdpPerCapita * 1000,0)}`, TrendingUp], ['Stability', nation.stability, Landmark], ['Satisfaction', nation.satisfaction, Users], ['Innovation', nation.innovation, Sparkles], ['Corruption', nation.corruption, Flame], ['Environment', nation.environment, Leaf], ['Military', nation.military, Shield], ['Diplomacy', nation.diplomacy, Globe2] ];
  return <div className="card statusPanel"><h2>State of the nation</h2><div className="statGrid">{stats.map(([label,value,Icon]) => <div className="stat" key={label}><Icon size={18}/><span>{label}</span><b>{typeof value === 'number' ? Math.round(value) : value}</b>{typeof value === 'number' && <div className="bar"><i style={{ width: `${clamp(value)}%` }}/></div>}</div>)}</div></div>;
}

function BudgetPanel({ budget, setBudget, availableBudget }) {
  const total = Object.values(budget).reduce((a,b) => a + b, 0);
  const rows = [['education','Education'],['infrastructure','Infrastructure'],['security','Security'],['welfare','Welfare'],['environment','Environment'],['innovation','Innovation'],['governance','Governance'],['debt','Debt repayment']];
  return <div className="card budgetPanel"><div className="cardHead"><h2>Annual budget</h2><b className={total > 100 ? 'danger' : 'good'}>{total}/100</b></div>{rows.map(([k,label]) => <label key={k}>{label}<span>{budget[k]}</span><input type="range" min="0" max="35" value={budget[k]} onChange={e => setBudget({ ...budget, [k]: Number(e.target.value) })}/></label>)}<p className="hint">Overspending raises debt and inflation. Underinvestment slows long-term power.</p></div>;
}

function Projects({ nation, startProject, availableBudget }) {
  return <div className="card projects"><h2>Strategic projects</h2><div className="projectList">{PROJECTS.map(p => { const Icon = p.icon; const active = nation.projects.find(x => x.id === p.id); const done = nation.completedProjects.includes(p.id); const locked = p.req && !p.req.includes(nation.geography); return <button key={p.id} className={`project ${active ? 'active' : ''} ${done ? 'done' : ''}`} onClick={() => startProject(p)} disabled={done || active || locked}><Icon size={18}/><div><b>{p.name}</b><span>{done ? 'Completed' : active ? `${active.remaining} years left` : locked ? 'Geography locked' : `${p.cost} budget · ${p.years} years`}</span></div></button>; })}</div></div>;
}

function ActionPanel({ nation, advance }) {
  return <div className="card actionPanel"><div><h2>Government session</h2><p>{nation.pendingDecision ? 'A crisis is waiting for your decision.' : 'Budget is set. Projects are underway. Advance to the next year when ready.'}</p></div><button className="primary big" onClick={advance} disabled={!!nation.pendingDecision}>Advance year</button></div>;
}

function DecisionModal({ decision, chooseOption, budget, capital }) {
  const icons = EVENT_IMAGES[decision.image] || EVENT_IMAGES.normal;
  return <div className="modalLayer"><div className="decision card"><div className={`eventArt ${decision.image}`}>{icons.map((x,i) => <span key={i}>{x}</span>)}</div><p className="eyebrow">National decision</p><h2>{decision.title}</h2><p>{decision.text}</p><div className="options">{decision.options.map((o,i) => <button key={i} onClick={() => chooseOption(o)} className={(o.cost || 0) > budget || (o.capital || 0) > capital ? 'blocked' : ''}><b>{o.label}</b><span>{o.cost ? `${o.cost > 0 ? o.cost + ' budget' : '+' + Math.abs(o.cost) + ' budget'}` : 'no budget cost'} {o.capital ? ` · ${o.capital} capital` : ''}</span></button>)}</div></div></div>;
}

function Factions({ nation }) {
  const rows = [['business','Business elites'],['workers','Workers'],['military','Military'],['youth','Youth'],['rural','Rural regions'],['elites','Old elites'],['greens','Environmental groups']];
  return <div className="card factions"><h2>Factions</h2>{rows.map(([k,label]) => <div className="faction" key={k}><span>{label}</span><b>{Math.round(nation.factions[k])}</b><div className="bar"><i style={{ width: `${nation.factions[k]}%` }}/></div></div>)}</div>;
}

function Advisor({ nation }) {
  const warnings = [];
  if (nation.debt > 75) warnings.push('Debt is becoming a strategic constraint.');
  if (nation.inequality > 62) warnings.push('Inequality may trigger urban unrest.');
  if (nation.corruption > 55) warnings.push('Corruption is weakening state capacity.');
  if (nation.environment < 40) warnings.push('Climate stress is close to crisis level.');
  if (nation.stability < 45) warnings.push('Political order is fragile.');
  if (!warnings.length) warnings.push('The state is manageable. Use this calm period to build long-term projects.');
  return <div className="card advisor"><h2>Advisor briefing</h2>{warnings.map((w,i) => <p key={i}><ScrollText size={15}/>{w}</p>)}</div>;
}

function StatsCharts({ nation }) {
  const values = [ ['Stability', nation.stability], ['Satisfaction', nation.satisfaction], ['Innovation', nation.innovation], ['Environment', nation.environment], ['Diplomacy', nation.diplomacy], ['Military', nation.military] ];
  return <div className="card chartCard"><h2>Power profile</h2><div className="radarLite">{values.map(([l,v]) => <div key={l}><span>{l}</span><div className="bar"><i style={{ width: `${v}%` }}/></div><b>{Math.round(v)}</b></div>)}</div></div>;
}

function Timeline({ history }) {
  return <div className="card timeline"><h2>History timeline</h2>{history.length === 0 ? <p className="hint">No major events yet. Advance years to write history.</p> : history.slice(0, 12).map((h,i) => <div className={`history ${h.type}`} key={i}><b>Year {h.year}: {h.title}</b><p>{h.text}</p></div>)}</div>;
}

function FinalScreen({ nation, reset }) {
  return <section className="card final"><Flag flag={nation.flag}/><h1>{nation.ending}</h1><p>{nation.name} ends the fifty-year era with a score of <b>{nation.score}/100</b>.</p><div className="finalGrid"><span>GDP: ${fmt(nation.gdp)}bn</span><span>GDP/cap: ${fmt(nation.gdpPerCapita * 1000,0)}</span><span>Stability: {Math.round(nation.stability)}</span><span>Innovation: {Math.round(nation.innovation)}</span><span>Corruption: {Math.round(nation.corruption)}</span><span>Environment: {Math.round(nation.environment)}</span></div><button className="primary" onClick={reset}>Build another civilization</button></section>;
}

createRoot(document.getElementById('root')).render(<App />);

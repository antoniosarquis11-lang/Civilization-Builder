import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Banknote, BarChart3, Crown, Factory, Flag, Flame, Globe2, Handshake, Landmark, Leaf, Play, RotateCcw, Save, Shield, Ship, Sparkles, Users, Vote, Zap } from 'lucide-react';
import './styles.css';

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const money = n => Math.round(n).toLocaleString();
const one = n => Number(n).toFixed(1);
const choose = (arr, seed = 0) => arr[Math.abs(Math.floor(seed)) % arr.length];

const GEOGRAPHIES = {
  island: { label: 'Island Republic', icon: '🏝️', trade: 1.18, growth: 0.5, defense: -4, climate: -2, neighbors: ['Maritime Federation', 'Kingdom of Norhaven', 'Aster Free Ports'] },
  coastal: { label: 'Coastal State', icon: '🌊', trade: 1.15, growth: 0.7, defense: 0, climate: -1, neighbors: ['Northern League', 'Ardan Kingdom', 'Valmora Republic'] },
  delta: { label: 'River Delta', icon: '🌾', trade: 1.0, growth: 0.6, defense: -2, climate: -4, neighbors: ['Highland Union', 'Solari Emirate', 'East Meridian'] },
  mountain: { label: 'Mountain Realm', icon: '⛰️', trade: 0.75, growth: -0.2, defense: 8, climate: 4, neighbors: ['Lowland Republic', 'Iron Marches', 'Darian Confederacy'] },
  desert: { label: 'Desert Federation', icon: '🏜️', trade: 0.82, growth: -0.4, defense: 2, climate: -5, neighbors: ['Oasis League', 'Red Sea Sultanate', 'Kordun Republic'] },
  landlocked: { label: 'Landlocked Republic', icon: '🛤️', trade: 0.68, growth: -0.4, defense: 2, climate: 0, neighbors: ['Coastal Valmora', 'Northern Railway Union', 'East Ardan'] }
};

const SYSTEMS = {
  democracy: { label: 'Democracy', icon: '🗳️', capital: 9, stability: 1, corruption: -5, election: true, risk: 'election defeat' },
  technocracy: { label: 'Technocracy', icon: '⚙️', capital: 8, stability: 4, corruption: -2, election: false, risk: 'elite backlash' },
  monarchy: { label: 'Constitutional Monarchy', icon: '👑', capital: 8, stability: 5, corruption: 1, election: false, risk: 'dynastic crisis' },
  military: { label: 'Military Regime', icon: '🪖', capital: 7, stability: 1, corruption: 6, election: false, risk: 'coup attempt' },
  socialist: { label: 'Social Republic', icon: '✊', capital: 9, stability: 2, corruption: 2, election: true, risk: 'party revolt' }
};

const RESOURCES = {
  agriculture: { label: 'Agriculture', icon: '🌱', growth: 0.4, treasury: 2, inequality: -2, environment: -1 },
  oil: { label: 'Oil & Gas', icon: '🛢️', growth: 1.1, treasury: 8, inequality: 5, environment: -7 },
  minerals: { label: 'Critical Minerals', icon: '⛏️', growth: 0.9, treasury: 5, inequality: 3, environment: -5 },
  tourism: { label: 'Tourism', icon: '🏖️', growth: 0.6, treasury: 4, inequality: 0, environment: -2 },
  manufacturing: { label: 'Manufacturing', icon: '🏭', growth: 0.8, treasury: 3, inequality: 1, environment: -4 },
  finance: { label: 'Finance', icon: '🏦', growth: 0.7, treasury: 5, inequality: 4, environment: 1 },
  tech: { label: 'Technology', icon: '💽', growth: 1.0, treasury: 4, inequality: 4, environment: 1 },
  ports: { label: 'Deepwater Ports', icon: '🚢', growth: 0.8, treasury: 4, inequality: 1, environment: -2 }
};

const LEVELS = {
  poor: { label: 'Low-income', gdp: 14, edu: 32, infra: 28, innovation: 18, stability: 48, corruption: 62, treasury: 42 },
  emerging: { label: 'Emerging', gdp: 56, edu: 48, infra: 45, innovation: 35, stability: 55, corruption: 49, treasury: 70 },
  middle: { label: 'Middle-income', gdp: 210, edu: 61, infra: 61, innovation: 52, stability: 63, corruption: 36, treasury: 115 },
  advanced: { label: 'Advanced', gdp: 720, edu: 76, infra: 78, innovation: 72, stability: 70, corruption: 22, treasury: 185 }
};

const DEFAULT_BUDGET = { education: 14, infrastructure: 15, security: 12, welfare: 13, environment: 10, innovation: 12, governance: 9, debt: 15 };
const BUDGET_META = {
  education: ['Education', 'Raises skills, innovation and youth approval.'],
  infrastructure: ['Infrastructure', 'Raises GDP, trade capacity and project efficiency.'],
  security: ['Security', 'Raises defense and border confidence.'],
  welfare: ['Welfare', 'Raises satisfaction and lowers inequality.'],
  environment: ['Environment', 'Reduces climate damage and increases green support.'],
  innovation: ['Innovation', 'Raises long-term productivity.'],
  governance: ['Governance', 'Reduces corruption and increases tax efficiency.'],
  debt: ['Debt repayment', 'Lowers debt and inflation pressure.']
};

const PROJECTS = [
  { id: 'port', name: 'Deepwater Port', icon: Ship, cost: 46, capital: 2, years: 4, needs: ['coastal','island','delta'], effect: { gdp: 16, treasury: 18, diplomacy: 8, environment: -4 }, desc: 'Creates a maritime hub and increases trade revenues.' },
  { id: 'rail', name: 'National Rail Corridor', icon: Factory, cost: 52, capital: 3, years: 6, effect: { infrastructure: 15, gdp: 13, treasury: 10, inequality: -5 }, desc: 'Links neglected regions to cities, borders and ports.' },
  { id: 'university', name: 'National University System', icon: Sparkles, cost: 40, capital: 3, years: 5, effect: { education: 15, innovation: 14, satisfaction: 5 }, desc: 'Builds elite campuses and technical institutes.' },
  { id: 'tax', name: 'Tax Administration Reform', icon: Banknote, cost: 32, capital: 5, years: 3, effect: { treasury: 30, corruption: -8, stability: 3 }, desc: 'Improves collection and closes elite loopholes.' },
  { id: 'agency', name: 'Anti-Corruption Agency', icon: Landmark, cost: 30, capital: 6, years: 3, effect: { corruption: -16, stability: 5, treasury: 15, elites: -10 }, desc: 'Investigates public procurement, customs and infrastructure contracts.' },
  { id: 'army', name: 'Defense Modernization', icon: Shield, cost: 44, capital: 3, years: 4, effect: { military: 18, stability: 3, diplomacy: -3 }, desc: 'Professionalizes the armed forces and reduces invasion risk.' },
  { id: 'green', name: 'National Green Grid', icon: Leaf, cost: 38, capital: 2, years: 4, effect: { environment: 17, gdp: 5, treasury: 7, greens: 10 }, desc: 'Builds clean energy and reduces climate pressure.' },
  { id: 'techcity', name: 'Innovation City', icon: Zap, cost: 58, capital: 4, years: 6, effect: { innovation: 20, gdp: 18, inequality: 5, treasury: 12 }, desc: 'Creates a futuristic district for labs, startups and global firms.' }
];

const DIPLOMACY_ACTIONS = [
  { id: 'trade', name: 'Sign trade agreement', cost: 10, capital: 1, effect: { relation: 9, trade: 9, tension: -3, treasury: 5 }, desc: 'Boosts exports and business confidence.' },
  { id: 'embassy', name: 'Open embassy dialogue', cost: 6, capital: 1, effect: { relation: 12, diplomacy: 5, tension: -4 }, desc: 'Reduces misunderstanding and opens negotiation channels.' },
  { id: 'railway', name: 'Build cross-border railway', cost: 28, capital: 3, effect: { relation: 11, trade: 16, tension: -5, infrastructure: 4 }, desc: 'Strong if you are landlocked or export-heavy.' },
  { id: 'pact', name: 'Defensive pact', cost: 12, capital: 3, effect: { relation: 13, tension: -8, military: 5, diplomacy: 4 }, desc: 'Improves deterrence but can anger rivals.' },
  { id: 'aid', name: 'Offer foreign aid', cost: 18, capital: 1, effect: { relation: 15, diplomacy: 7, treasury: -2 }, desc: 'Raises influence and goodwill.' },
  { id: 'border', name: 'Negotiate border treaty', cost: 8, capital: 4, effect: { relation: 10, tension: -15, stability: 3 }, desc: 'Best when tension is dangerous.' },
  { id: 'pressure', name: 'Pressure with sanctions', cost: 6, capital: 2, effect: { relation: -11, trade: -5, tension: 8, diplomacy: -3 }, desc: 'Punishes rivals but raises escalation risk.' },
  { id: 'intel', name: 'Covert intelligence operation', cost: 16, capital: 2, effect: { relation: -7, tension: 10, military: 4, stability: 2 }, desc: 'Risky, useful against hostile neighbors.' }
];

const CRISES = [
  { id: 'refugees', title: 'Neighboring civil war sends refugees toward your border', icon: '🧳', trigger: s => s.neighbors.some(n => n.tension > 62 || n.stability < 42), text: 'A nearby state is destabilizing. Thousands are moving toward your frontier.', choices: [
    { label: 'Accept refugees and request aid', cost: 18, capital: 2, effect: { satisfaction: -2, diplomacy: 10, stability: -3, youth: 5 }, neighbor: { relation: 4, tension: -2 } },
    { label: 'Close the border', cost: 8, capital: 2, effect: { stability: 5, diplomacy: -8, military: 3 }, neighbor: { relation: -8, tension: 5 } },
    { label: 'Mediate peace talks', cost: 12, capital: 4, effect: { diplomacy: 12, politicalCapital: 1 }, neighbor: { relation: 12, tension: -10 } },
    { label: 'Secretly support one faction', cost: 20, capital: 3, effect: { military: 4, diplomacy: -6 }, neighbor: { relation: -12, tension: 13 } }
  ]},
  { id: 'borderwar', title: 'Border skirmish breaks out', icon: '🔥', trigger: s => s.neighbors.some(n => n.tension > 72), text: 'Shots are exchanged near a disputed checkpoint. The public demands firmness.', choices: [
    { label: 'Mobilize forces', cost: 20, capital: 2, effect: { military: 6, stability: 3, diplomacy: -5 }, neighbor: { relation: -10, tension: 8 } },
    { label: 'Ask for international monitors', cost: 10, capital: 3, effect: { diplomacy: 9, stability: 2 }, neighbor: { relation: 5, tension: -11 } },
    { label: 'Concede minor territory', cost: 5, capital: 4, effect: { satisfaction: -7, stability: 4, military: -2 }, neighbor: { relation: 10, tension: -15 } },
    { label: 'Escalate to limited war', cost: 36, capital: 6, effect: { military: -7, gdp: -8, stability: -6, satisfaction: -5 }, neighbor: { relation: -20, tension: 18 } }
  ]},
  { id: 'investor', title: 'Regional investors propose a shared industrial zone', icon: '🏭', trigger: s => s.neighbors.some(n => n.relation > 62 && n.trade > 50), text: 'A friendly neighbor offers a joint development zone near the border.', choices: [
    { label: 'Co-finance the zone', cost: 32, capital: 3, effect: { gdp: 9, treasury: 14, business: 8, workers: 4 }, neighbor: { relation: 8, trade: 12 } },
    { label: 'Demand stronger labor rules', cost: 18, capital: 4, effect: { gdp: 5, workers: 9, business: -4 }, neighbor: { relation: 2, trade: 7 } },
    { label: 'Reject the offer', cost: 0, capital: 0, effect: { stability: 1 }, neighbor: { relation: -5, trade: -4 } },
    { label: 'Turn it into a green zone', cost: 28, capital: 3, effect: { environment: 8, gdp: 5, greens: 8 }, neighbor: { relation: 6, trade: 8 } }
  ]},
  { id: 'drought', title: 'Regional drought hits food prices', icon: '☀️', trigger: s => s.environment < 55 || s.geography === 'desert' || s.resources.includes('agriculture'), text: 'Water pressure rises across the region. Food prices are becoming political.', choices: [
    { label: 'Emergency food imports', cost: 22, capital: 1, effect: { satisfaction: 8, inflation: -2, treasury: -3 }, neighbor: { relation: 3, trade: 4 } },
    { label: 'Invest in irrigation', cost: 30, capital: 3, effect: { environment: 6, rural: 10, infrastructure: 4 }, neighbor: { relation: 1 } },
    { label: 'Let prices rise', cost: 0, capital: 0, effect: { satisfaction: -9, inequality: 5, inflation: 4, rural: -10 } },
    { label: 'Regional water treaty', cost: 15, capital: 4, effect: { diplomacy: 9, environment: 5 }, neighbor: { relation: 9, tension: -7 } }
  ]},
  { id: 'scandal', title: 'Major corruption scandal leaks', icon: '📰', trigger: s => s.corruption > 43, text: 'Files reveal inflated contracts and suspicious links to senior officials.', choices: [
    { label: 'Full public investigation', cost: 12, capital: 5, effect: { corruption: -12, stability: 3, satisfaction: 6, elites: -12 } },
    { label: 'Dismiss one minister', cost: 5, capital: 2, effect: { corruption: -4, satisfaction: 2 } },
    { label: 'Blame foreign interference', cost: 6, capital: 2, effect: { satisfaction: -3, stability: 4, diplomacy: -4, corruption: 4 } },
    { label: 'Ignore it', cost: 0, capital: 0, effect: { corruption: 7, satisfaction: -8, stability: -5 } }
  ]}
];

function seedFromName(name) { return (name || 'Nova Civitas').split('').reduce((a, c) => a + c.charCodeAt(0), 17); }
function makeNeighbors(form) {
  const base = GEOGRAPHIES[form.geography].neighbors;
  const seed = seedFromName(form.name);
  return base.map((name, i) => {
    const ideologies = ['democracy','monarchy','military','technocracy','socialist'];
    const resources = Object.keys(RESOURCES);
    const ideology = choose(ideologies, seed + i * 7);
    const res = choose(resources, seed + i * 11);
    const relation = clamp(48 + ((seed + i * 13) % 34) - 10 + (form.system === ideology ? 8 : -2));
    const tension = clamp(38 + ((seed + i * 17) % 35) - (relation > 60 ? 12 : 0));
    return { id: `n${i}`, name, ideology, resource: res, relation, tension, trade: clamp(35 + ((seed + i * 5) % 40)), economy: clamp(38 + ((seed + i * 19) % 42)), military: clamp(38 + ((seed + i * 23) % 45)), stability: clamp(42 + ((seed + i * 29) % 45)), alliance: relation > 70 ? 'Friendly' : tension > 65 ? 'Rival' : 'Neutral' };
  });
}

function createNation(form) {
  const level = LEVELS[form.level];
  const geo = GEOGRAPHIES[form.geography];
  const sys = SYSTEMS[form.system];
  const mods = form.resources.map(r => RESOURCES[r]);
  const pop = Number(form.population);
  const gdp = level.gdp * (pop / 8) * (1 + mods.reduce((a,r)=>a+r.growth,0) / 10);
  return {
    name: form.name || 'Nova Civitas', geography: form.geography, system: form.system, resources: form.resources, year: 1, population: pop,
    gdp, gdpPerCapita: (gdp * 1000) / pop, treasury: level.treasury, politicalCapital: sys.capital, debt: 34, taxRate: 28, inflation: 5,
    education: level.edu, infrastructure: level.infra, innovation: level.innovation, stability: clamp(level.stability + sys.stability), corruption: clamp(level.corruption + sys.corruption),
    satisfaction: 56, inequality: clamp(44 + mods.reduce((a,r)=>a+r.inequality,0)), environment: clamp(68 + geo.climate + mods.reduce((a,r)=>a+r.environment,0)),
    military: clamp(43 + geo.defense + (form.system === 'military' ? 15 : 0)), diplomacy: clamp(48 + geo.trade * 7), tradeAccess: clamp(45 + geo.trade * 20),
    factions: { business: 55, workers: 55, military: form.system === 'military' ? 72 : 55, youth: 54, rural: 55, elites: 58, greens: 50 },
    neighbors: makeNeighbors(form), projects: [], completedProjects: [], history: [], chart: [], crisis: null, gameOver: false, ending: null,
    flagSeed: seedFromName(form.name), alert: 'Your government has taken office. Build the state, manage your treasury, and survive the region.'
  };
}

function applyEffect(s, e = {}) {
  const n = { ...s, factions: { ...s.factions } };
  const simple = ['education','infrastructure','innovation','stability','corruption','satisfaction','inequality','environment','military','diplomacy','tradeAccess','inflation'];
  simple.forEach(k => { if (e[k]) n[k] = clamp(n[k] + e[k], k === 'inflation' ? 0 : 0, k === 'inflation' ? 50 : 100); });
  if (e.gdp) n.gdp *= 1 + e.gdp / 100;
  if (e.treasury) n.treasury = Math.max(-150, n.treasury + e.treasury);
  if (e.politicalCapital) n.politicalCapital = clamp(n.politicalCapital + e.politicalCapital, 0, 15);
  if (e.debt) n.debt = clamp(n.debt + e.debt, 0, 200);
  ['business','workers','military','youth','rural','elites','greens'].forEach(k => { if (e[k]) n.factions[k] = clamp(n.factions[k] + e[k]); });
  n.gdpPerCapita = (n.gdp * 1000) / n.population;
  return n;
}
function applyNeighbor(n, change = {}) {
  return { ...n, relation: clamp(n.relation + (change.relation || 0)), tension: clamp(n.tension + (change.tension || 0)), trade: clamp(n.trade + (change.trade || 0)), stability: clamp(n.stability + (change.stability || 0)), alliance: clamp(n.relation + (change.relation || 0)) > 70 ? 'Friendly' : clamp(n.tension + (change.tension || 0)) > 65 ? 'Rival' : 'Neutral' };
}

function availableBudgetTotal(b) { return Object.values(b).reduce((a,v)=>a+Number(v),0); }
function taxRevenue(s) {
  const base = s.gdp * (s.taxRate / 100) * 0.14;
  const efficiency = 0.7 + s.governanceFactor * 0.3;
  const res = s.resources.reduce((a,r)=>a+RESOURCES[r].treasury,0);
  const tradeBonus = (s.tradeAccess - 50) * 0.08;
  return Math.max(0, base * efficiency + res + tradeBonus);
}

function nextYear(prev, budget) {
  let s = { ...prev, factions: { ...prev.factions }, neighbors: prev.neighbors.map(n => ({...n})), projects: prev.projects.map(p => ({...p})), history: [...prev.history], chart: [...prev.chart], crisis: null };
  const total = availableBudgetTotal(budget);
  const overspend = Math.max(0, total - 100);
  const discipline = Math.max(0, 100 - total);
  s.governanceFactor = clamp((100 - s.corruption + budget.governance) / 120, 0, 1);
  const revenue = taxRevenue(s);
  const operatingCost = 44 + total * 0.28 + s.debt * 0.035;
  s.treasury += revenue - operatingCost + discipline * 0.35 - overspend * 0.5;
  s.debt = clamp(s.debt + overspend * 0.18 - budget.debt * 0.22 + (s.treasury < 0 ? 2.5 : -0.2), 0, 200);
  if (s.treasury < -60) { s.debt = clamp(s.debt + 8, 0, 200); s.treasury += 35; s.history.push({ year: s.year, type: 'debt', title: 'Emergency borrowing', text: 'The treasury went deeply negative, forcing the state to issue emergency debt.' }); }

  const geo = GEOGRAPHIES[s.geography];
  const resGrowth = s.resources.reduce((a,r)=>a+RESOURCES[r].growth,0);
  const neighborTrade = s.neighbors.reduce((a,n)=>a+n.trade*(n.relation/100)*(1-n.tension/160),0)/s.neighbors.length;
  s.tradeAccess = clamp(s.tradeAccess + (neighborTrade - 50) * 0.02);
  s.education = clamp(s.education + (budget.education - 12) * 0.16);
  s.infrastructure = clamp(s.infrastructure + (budget.infrastructure - 12) * 0.18);
  s.military = clamp(s.military + (budget.security - 10) * 0.22);
  s.satisfaction = clamp(s.satisfaction + (budget.welfare - 12) * 0.14 - Math.max(0, s.inflation - 9) * 0.1 + (s.treasury > 100 ? 0.3 : -0.2));
  s.environment = clamp(s.environment + (budget.environment - 10) * 0.22 - 0.6);
  s.innovation = clamp(s.innovation + (budget.innovation - 10) * 0.2 + (s.education - 50) * 0.02);
  s.corruption = clamp(s.corruption - (budget.governance - 8) * 0.25 + (s.treasury < 10 ? 0.5 : -0.1));
  s.inequality = clamp(s.inequality - (budget.welfare - 10) * 0.08 + (s.gdpPerCapita > 35 ? 0.2 : 0));
  s.diplomacy = clamp(s.diplomacy + (s.neighbors.reduce((a,n)=>a+n.relation-n.tension*0.45,0)/s.neighbors.length - 35) * 0.035);
  const growth = 1.4 + resGrowth + geo.growth + (s.education - 50)*0.012 + (s.infrastructure - 50)*0.015 + (s.innovation - 50)*0.018 + (s.tradeAccess - 50)*0.018 - (s.corruption - 35)*0.014 - Math.max(0, s.debt - 75)*0.02 - (s.environment < 35 ? 0.9 : 0);
  s.gdp *= 1 + growth / 100;
  s.population *= 1 + (0.65 + (s.satisfaction - 50)*0.004 - Math.max(0, s.inequality - 70)*0.004) / 100;
  s.inflation = clamp(s.inflation + overspend*0.05 - budget.debt*0.025 + (growth > 5 ? 0.2 : -0.1), 1, 40);
  s.stability = clamp(s.stability + (s.satisfaction-50)*0.025 - (s.inequality-50)*0.02 - (s.corruption-45)*0.015 - (s.neighbors.some(n=>n.tension>75)?1.2:0));
  s.factions.business = clamp(s.factions.business + (growth > 3 ? 1 : -0.8) + (s.taxRate > 35 ? -1 : 0));
  s.factions.workers = clamp(s.factions.workers + (s.inequality < 50 ? 1 : -0.8));
  s.factions.youth = clamp(s.factions.youth + (s.innovation > 55 ? 1 : -0.5));
  s.factions.greens = clamp(s.factions.greens + (s.environment > 58 ? 0.8 : -1.2));
  s.factions.elites = clamp(s.factions.elites + (s.corruption > 48 ? 0.8 : -0.5));
  s.factions.military = clamp(s.factions.military + (s.military > 56 ? 0.7 : -0.5));
  s.factions.rural = clamp(s.factions.rural + (budget.infrastructure > 14 ? 0.6 : -0.4));

  const completed = [];
  s.projects = s.projects.map(p => ({...p, remaining: p.remaining - 1})).filter(p => {
    if (p.remaining <= 0) { completed.push(p); return false; }
    return true;
  });
  completed.forEach(p => { s = applyEffect(s, p.effect); s.completedProjects.push(p.id); s.history.push({ year: s.year, type: 'project', title: `${p.name} completed`, text: p.desc }); });

  s.neighbors = s.neighbors.map((n, i) => {
    const drift = ((s.year + i * 3 + s.flagSeed) % 7) - 3;
    return applyNeighbor(n, { relation: drift * 0.3 + (s.diplomacy > 65 ? 0.4 : 0), tension: (s.military < n.military && n.relation < 45 ? 0.8 : -0.2) });
  });

  if ((SYSTEMS[s.system].election && s.year % 5 === 0) || (!SYSTEMS[s.system].election && s.year % 6 === 0)) {
    const mandate = Math.round((s.satisfaction + s.stability + (100 - s.corruption) + Math.min(...Object.values(s.factions)))/4);
    if (mandate >= 58) { s.politicalCapital = clamp(s.politicalCapital + 3, 0, 15); s.history.push({ year: s.year, type: 'politics', title: SYSTEMS[s.system].election ? 'Election victory' : 'Regime consolidated', text: `Your mandate score is ${mandate}/100. Political capital rises.` }); }
    else if (mandate < 43) { s.politicalCapital = clamp(s.politicalCapital - 4, 0, 15); s.stability = clamp(s.stability - 7); s.history.push({ year: s.year, type: 'politics', title: `Risk of ${SYSTEMS[s.system].risk}`, text: `Your mandate score is only ${mandate}/100. The government survives, but weakened.` }); }
    else { s.history.push({ year: s.year, type: 'politics', title: 'Narrow political survival', text: `Your mandate score is ${mandate}/100. No collapse, but little room for reform.` }); }
  }

  s.politicalCapital = clamp(s.politicalCapital + (s.satisfaction > 65 ? 1 : 0) + (s.stability > 70 ? 1 : 0) - (s.stability < 38 ? 1 : 0) - (Math.min(...Object.values(s.factions)) < 35 ? 1 : 0), 0, 15);
  s.gdpPerCapita = (s.gdp * 1000) / s.population;
  s.chart.push({ year: s.year, GDP: Math.round(s.gdp), Stability: Math.round(s.stability), Treasury: Math.round(s.treasury), Diplomacy: Math.round(s.diplomacy), Inequality: Math.round(s.inequality) });
  s.history.push({ year: s.year, type: 'report', title: `Year ${s.year} report`, text: `Growth was ${one(growth)}%. Treasury ${s.treasury >= 0 ? 'stands at' : 'fell to'} ${money(s.treasury)}. Regional trade access is ${Math.round(s.tradeAccess)}/100.` });
  s.year += 1;
  const crisis = pickCrisis(s);
  if (crisis && s.year <= 50) s.crisis = crisis;
  if (s.year > 50) s = finishGame(s);
  return s;
}

function pickCrisis(s) {
  const candidates = CRISES.filter(c => c.trigger(s));
  if (!candidates.length || (s.year + s.flagSeed) % 3 === 1) return null;
  return choose(candidates, s.year + s.flagSeed + s.treasury);
}
function finishGame(s) {
  const score = Math.round((s.gdpPerCapita/12) + s.stability + s.satisfaction + s.diplomacy + (100-s.corruption) + s.innovation + Math.max(0, s.treasury/4) - s.debt*0.4 - s.inequality*0.3);
  const ending = score > 520 ? 'Golden Age' : score > 410 ? 'Stable Regional Power' : score > 300 ? 'Fragile but Functioning State' : 'Crisis Republic';
  return { ...s, gameOver: true, ending, score };
}

function FlagArt({ seed }) {
  const palettes = [['#1d4ed8','#f8fafc','#f59e0b'], ['#047857','#fef3c7','#b91c1c'], ['#111827','#e5e7eb','#7c3aed'], ['#0f766e','#facc15','#1e293b'], ['#be123c','#fde68a','#1d4ed8']];
  const p = palettes[seed % palettes.length];
  const symbol = choose(['★','●','◆','✦','▲'], seed);
  return <div className="flag-art" style={{background:`linear-gradient(135deg, ${p[0]} 0 33%, ${p[1]} 33% 66%, ${p[2]} 66%)`}}><span>{symbol}</span></div>;
}

function App() {
  const [screen, setScreen] = useState('start');
  const [form, setForm] = useState({ name: 'Nova Civitas', geography: 'coastal', system: 'democracy', level: 'emerging', population: 12, resources: ['manufacturing','ports'] });
  const [nation, setNation] = useState(null);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [selectedNeighbor, setSelectedNeighbor] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('civilization-builder-v3');
    if (saved) { try { const data = JSON.parse(saved); setNation(data); setScreen('game'); } catch {} }
  }, []);
  useEffect(() => { if (nation) localStorage.setItem('civilization-builder-v3', JSON.stringify(nation)); }, [nation]);

  const start = () => { const n = createNation(form); n.chart = [{ year: 0, GDP: Math.round(n.gdp), Stability: Math.round(n.stability), Treasury: Math.round(n.treasury), Diplomacy: Math.round(n.diplomacy), Inequality: Math.round(n.inequality) }]; setNation(n); setSelectedNeighbor(n.neighbors[0].id); setScreen('game'); };
  const reset = () => { localStorage.removeItem('civilization-builder-v3'); setNation(null); setScreen('start'); setMessage(''); };
  const updateBudget = (k, v) => setBudget(b => ({ ...b, [k]: Number(v) }));

  const startProject = (p) => {
    setMessage('');
    if (!nation) return;
    if (nation.completedProjects.includes(p.id) || nation.projects.some(x=>x.id===p.id)) return setMessage('This project is already active or completed.');
    if (p.needs && !p.needs.includes(nation.geography)) return setMessage('Your geography does not support this project.');
    if (nation.treasury < p.cost) return setMessage(`Not enough Treasury. Need ${p.cost}, you have ${money(nation.treasury)}.`);
    if (nation.politicalCapital < p.capital) return setMessage(`Not enough Political Capital. Need ${p.capital}, you have ${nation.politicalCapital}.`);
    setNation(s => ({ ...s, treasury: s.treasury - p.cost, politicalCapital: s.politicalCapital - p.capital, projects: [...s.projects, { ...p, remaining: p.years }], history: [{ year: s.year, type: 'project', title: `${p.name} launched`, text: `${p.cost} Treasury and ${p.capital} Political Capital committed.` }, ...s.history].slice(0, 120) }));
  };

  const diplomacyAction = (action, neighborId) => {
    setMessage('');
    if (!nation || !neighborId) return;
    if (nation.treasury < action.cost) return setMessage(`Not enough Treasury. Need ${action.cost}, you have ${money(nation.treasury)}.`);
    if (nation.politicalCapital < action.capital) return setMessage(`Not enough Political Capital. Need ${action.capital}, you have ${nation.politicalCapital}.`);
    setNation(s => {
      const neighbor = s.neighbors.find(n=>n.id===neighborId);
      let next = applyEffect({ ...s, treasury: s.treasury - action.cost, politicalCapital: s.politicalCapital - action.capital }, action.effect);
      next.neighbors = next.neighbors.map(n => n.id === neighborId ? applyNeighbor(n, action.effect) : n);
      next.history = [{ year: s.year, type: 'diplomacy', title: `${action.name} with ${neighbor.name}`, text: action.desc }, ...s.history].slice(0, 120);
      return next;
    });
  };

  const resolveCrisis = (choice) => {
    if (!nation?.crisis) return;
    if (nation.treasury < choice.cost) return setMessage(`Not enough Treasury for that response. Need ${choice.cost}.`);
    if (nation.politicalCapital < choice.capital) return setMessage(`Not enough Political Capital for that response. Need ${choice.capital}.`);
    setNation(s => {
      let next = applyEffect({ ...s, treasury: s.treasury - choice.cost, politicalCapital: s.politicalCapital - choice.capital, crisis: null }, choice.effect);
      if (choice.neighbor) next.neighbors = next.neighbors.map((n, i) => i === 0 || n.tension === Math.max(...next.neighbors.map(x=>x.tension)) ? applyNeighbor(n, choice.neighbor) : n);
      next.history = [{ year: s.year, type: 'crisis', title: `${s.crisis.title}: ${choice.label}`, text: `The government chose to ${choice.label.toLowerCase()}.` }, ...s.history].slice(0, 120);
      next.alert = `Crisis resolved: ${choice.label}.`;
      return next;
    });
    setMessage('');
  };

  const advance = () => { setMessage(''); if (!nation?.crisis && !nation?.gameOver) setNation(s => nextYear(s, budget)); };

  if (screen === 'start') return <Start form={form} setForm={setForm} start={start} />;
  if (!nation) return null;
  return <Game nation={nation} budget={budget} updateBudget={updateBudget} total={availableBudgetTotal(budget)} startProject={startProject} diplomacyAction={diplomacyAction} selectedNeighbor={selectedNeighbor || nation.neighbors[0]?.id} setSelectedNeighbor={setSelectedNeighbor} resolveCrisis={resolveCrisis} advance={advance} reset={reset} message={message} />;
}

function Start({ form, setForm, start }) {
  const toggleResource = r => setForm(f => ({ ...f, resources: f.resources.includes(r) ? f.resources.filter(x=>x!==r) : f.resources.length < 3 ? [...f.resources, r] : [f.resources[1], f.resources[2], r] }));
  return <main className="start-shell">
    <section className="hero-card">
      <div className="eyebrow"><Globe2 size={18}/> Civilization Builder v3</div>
      <h1>Build a state, govern year by year, and survive the region around you.</h1>
      <p>Create a fictional nation, manage its Treasury, spend Political Capital, negotiate with neighbors, respond to crises, and watch fifty years of history unfold.</p>
      <button className="primary" onClick={start}><Play size={18}/> Found your nation</button>
    </section>
    <section className="setup-card">
      <label>Nation name<input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></label>
      <div className="grid-2">
        <label>Geography<select value={form.geography} onChange={e=>setForm(f=>({...f,geography:e.target.value}))}>{Object.entries(GEOGRAPHIES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></label>
        <label>Political system<select value={form.system} onChange={e=>setForm(f=>({...f,system:e.target.value}))}>{Object.entries(SYSTEMS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select></label>
        <label>Development level<select value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))}>{Object.entries(LEVELS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label>
        <label>Population, millions<input type="number" min="1" max="250" value={form.population} onChange={e=>setForm(f=>({...f,population:e.target.value}))}/></label>
      </div>
      <h3>Resource base <span>choose up to 3</span></h3>
      <div className="resource-grid">{Object.entries(RESOURCES).map(([k,r])=><button key={k} className={form.resources.includes(k)?'chip active':'chip'} onClick={()=>toggleResource(k)}>{r.icon} {r.label}</button>)}</div>
    </section>
  </main>;
}

function Game({ nation, budget, updateBudget, total, startProject, diplomacyAction, selectedNeighbor, setSelectedNeighbor, resolveCrisis, advance, reset, message }) {
  const neighbor = nation.neighbors.find(n=>n.id===selectedNeighbor) || nation.neighbors[0];
  return <main className="game-shell">
    <header className="topbar">
      <div className="title-row"><FlagArt seed={nation.flagSeed}/><div><h1>{nation.name}</h1><p>Year {Math.min(nation.year, 50)} / 50 · {GEOGRAPHIES[nation.geography].label} · {SYSTEMS[nation.system].label}</p></div></div>
      <div className="top-actions"><button onClick={()=>localStorage.setItem('civilization-builder-v3', JSON.stringify(nation))}><Save size={16}/> Save</button><button onClick={reset}><RotateCcw size={16}/> New game</button></div>
    </header>

    <section className="resource-strip">
      <Metric icon={Banknote} label="Treasury" value={money(nation.treasury)} hint="Money reserve used for projects, diplomacy and crises." warn={nation.treasury < 20}/>
      <Metric icon={Crown} label="Political Capital" value={nation.politicalCapital} hint="Power to pass reforms and difficult decisions." warn={nation.politicalCapital < 3}/>
      <Metric icon={BarChart3} label="GDP" value={`${money(nation.gdp)}B`} hint="Economic size." />
      <Metric icon={Users} label="Satisfaction" value={`${Math.round(nation.satisfaction)}/100`} hint="Public mood." warn={nation.satisfaction < 42}/>
      <Metric icon={Handshake} label="Diplomacy" value={`${Math.round(nation.diplomacy)}/100`} hint="Global and regional influence." warn={nation.diplomacy < 40}/>
    </section>

    {message && <div className="message">{message}</div>}
    {nation.gameOver && <Final nation={nation} reset={reset}/>} 
    {nation.crisis && <Crisis crisis={nation.crisis} resolve={resolveCrisis}/>} 

    <section className="main-grid">
      <div className="panel living-panel">
        <h2><Globe2 size={19}/> State of the nation</h2>
        <div className="city-visual"><div className="sun"/><div className="skyline"><span/><span/><span/><span/><span/></div><div className="visual-label">{nation.stability < 42 ? 'Unrest in the streets' : nation.gdpPerCapita > 35 ? 'High-development skyline' : 'Emerging capital city'}</div></div>
        <div className="stats-grid"><Stat label="GDP/capita" value={`$${money(nation.gdpPerCapita * 1000)}`}/><Stat label="Debt" value={`${Math.round(nation.debt)}%`}/><Stat label="Inflation" value={`${one(nation.inflation)}%`}/><Stat label="Trade access" value={`${Math.round(nation.tradeAccess)}/100`}/><Stat label="Corruption" value={`${Math.round(nation.corruption)}/100`}/><Stat label="Environment" value={`${Math.round(nation.environment)}/100`}/></div>
      </div>

      <div className="panel budget-panel">
        <h2><Banknote size={19}/> Annual Budget <span className={total>100?'bad':'good'}>{total}/100</span></h2>
        <p className="explain">Annual Budget is your yearly policy allocation. Treasury is separate: it is the reserve used for projects, diplomacy and crisis responses.</p>
        {Object.entries(budget).map(([k,v]) => <div className="slider-row" key={k}><div><b>{BUDGET_META[k][0]}</b><small>{BUDGET_META[k][1]}</small></div><input type="range" min="0" max="28" value={v} onChange={e=>updateBudget(k,e.target.value)}/><strong>{v}</strong></div>)}
        <button className="primary full" disabled={!!nation.crisis || nation.gameOver} onClick={advance}>{nation.crisis ? 'Resolve crisis first' : 'Advance one year'}</button>
      </div>

      <div className="panel projects-panel">
        <h2><Landmark size={19}/> National Projects</h2>
        <p className="explain">Projects require Treasury and Political Capital. They take years to finish and then reshape the country.</p>
        <div className="project-list">{PROJECTS.map(p => <Project key={p.id} project={p} nation={nation} startProject={startProject}/>)}</div>
      </div>

      <div className="panel regional-panel">
        <h2><Handshake size={19}/> Regional Relations</h2>
        <p className="explain">Neighbors influence trade, war risk, diplomacy and crisis events.</p>
        <div className="neighbor-tabs">{nation.neighbors.map(n=><button key={n.id} className={n.id===selectedNeighbor?'active':''} onClick={()=>setSelectedNeighbor(n.id)}>{n.name}</button>)}</div>
        <NeighborCard n={neighbor}/>
        <div className="diplo-actions">{DIPLOMACY_ACTIONS.map(a => <button key={a.id} onClick={()=>diplomacyAction(a, neighbor.id)}><b>{a.name}</b><span>{a.cost} Treasury · {a.capital} Capital</span></button>)}</div>
      </div>

      <div className="panel factions-panel">
        <h2><Vote size={19}/> Factions</h2>
        {Object.entries(nation.factions).map(([k,v])=><Bar key={k} label={k} value={v}/>)}</div>

      <div className="panel chart-panel">
        <h2><BarChart3 size={19}/> Development chart</h2>
        <ResponsiveContainer width="100%" height={260}><LineChart data={nation.chart}><CartesianGrid strokeDasharray="3 3" opacity={0.2}/><XAxis dataKey="year"/><YAxis/><Tooltip/><Line type="monotone" dataKey="GDP" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="Stability" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="Treasury" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
      </div>

      <div className="panel timeline-panel">
        <h2><Flame size={19}/> National history</h2>
        <div className="timeline">{nation.history.slice(0,18).map((h,i)=><article key={i}><span>Y{h.year}</span><div><b>{h.title}</b><p>{h.text}</p></div></article>)}</div>
      </div>
    </section>
  </main>;
}

function Metric({ icon: Icon, label, value, hint, warn }) { return <div className={warn?'metric warn':'metric'}><Icon size={20}/><div><span>{label}</span><b>{value}</b><small>{hint}</small></div></div>; }
function Stat({ label, value }) { return <div className="stat"><span>{label}</span><b>{value}</b></div>; }
function Bar({ label, value }) { return <div className="bar"><div><span>{label}</span><b>{Math.round(value)}</b></div><div className="bar-track"><span style={{width:`${clamp(value)}%`}}/></div></div>; }
function Project({ project, nation, startProject }) {
  const active = nation.projects.find(p=>p.id===project.id); const done = nation.completedProjects.includes(project.id); const Icon = project.icon;
  const blocked = project.needs && !project.needs.includes(nation.geography);
  return <article className={done?'project done':active?'project active':'project'}><Icon size={20}/><div><b>{project.name}</b><p>{project.desc}</p><small>{project.cost} Treasury · {project.capital} Capital · {project.years} years {blocked ? '· Geography blocked' : ''}</small>{active && <small className="good">In progress: {active.remaining} years left</small>}{done && <small className="good">Completed</small>}</div><button disabled={active||done||blocked} onClick={()=>startProject(project)}>{done?'Done':active?'Active':'Start'}</button></article>;
}
function NeighborCard({ n }) { return <div className="neighbor-card"><div><h3>{n.name}</h3><p>{SYSTEMS[n.ideology]?.icon} {SYSTEMS[n.ideology]?.label} · {RESOURCES[n.resource]?.icon} {RESOURCES[n.resource]?.label}</p></div><span className={n.alliance==='Rival'?'badge bad':n.alliance==='Friendly'?'badge good':'badge'}>{n.alliance}</span><Bar label="relation" value={n.relation}/><Bar label="border tension" value={n.tension}/><Bar label="trade dependency" value={n.trade}/><Bar label="military strength" value={n.military}/></div>; }
function Crisis({ crisis, resolve }) { return <section className="crisis-card"><div className="crisis-visual"><span>{crisis.icon}</span></div><div><h2>{crisis.title}</h2><p>{crisis.text}</p><div className="choice-grid">{crisis.choices.map((c,i)=><button key={i} onClick={()=>resolve(c)}><b>{c.label}</b><span>{c.cost} Treasury · {c.capital} Capital</span></button>)}</div></div></section>; }
function Final({ nation, reset }) { return <section className="final-card"><h2>{nation.ending}</h2><p>Final score: <b>{nation.score}</b>. Your state ends year 50 with ${money(nation.gdpPerCapita*1000)} GDP per capita, {Math.round(nation.stability)}/100 stability, {money(nation.treasury)} Treasury and {Math.round(nation.diplomacy)}/100 diplomacy.</p><button className="primary" onClick={reset}>Start a new civilization</button></section>; }

createRoot(document.getElementById('root')).render(<App />);

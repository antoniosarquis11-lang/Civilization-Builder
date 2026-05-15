import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Landmark, Globe2, Coins, Vote, Factory, Shield, Users, Sprout, TrendingUp, AlertTriangle, Handshake, Play, BookOpen, Compass, Flag, ChevronRight, RotateCcw, Home, Info, Banknote, Scale, Map, Activity } from 'lucide-react';
import './styles.css';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const fmt = (n, d = 0) => Number(n).toFixed(d);
const pct = (n) => `${fmt(n, 1)}%`;
const signed = (n, d = 0) => `${n >= 0 ? '+' : ''}${fmt(n, d)}`;

const regimes = {
  'Democracy': {
    short: 'Legitimate but slower.',
    effects: ['Political capital grows with public satisfaction.', 'Elections can punish bad governance.', 'Better diplomacy with democratic neighbors.', 'Harder to pass unpopular reforms quickly.'],
    modifiers: { capital: 8, stability: 4, diplomacy: 7, corruption: -2, reformSpeed: -1, repression: -8, innovation: 2, equality: 2 }
  },
  'Oligarchy': {
    short: 'Efficient for elites, unequal for society.',
    effects: ['Business approval and investment start high.', 'Corruption and inequality are harder to control.', 'Workers and youth are more suspicious.', 'Political capital depends heavily on elite approval.'],
    modifiers: { capital: 6, stability: 1, diplomacy: 1, corruption: 8, reformSpeed: 2, repression: 0, innovation: 1, equality: -7 }
  },
  'Monarchy': {
    short: 'Symbolic stability, elite-sensitive reform.',
    effects: ['Strong legitimacy if the country is stable.', 'Long-term projects are easier to justify.', 'Modernization can anger conservative elites.', 'Political capital is steady but less flexible.'],
    modifiers: { capital: 7, stability: 6, diplomacy: 3, corruption: 2, reformSpeed: 1, repression: 2, innovation: -1, equality: -2 }
  },
  'Authoritarian Regime': {
    short: 'Fast decisions, fragile legitimacy.',
    effects: ['Projects and security actions are easier to launch.', 'Public opposition can become dangerous if ignored.', 'Worse diplomacy with democracies.', 'Coup and protest risks rise when satisfaction falls.'],
    modifiers: { capital: 7, stability: 3, diplomacy: -5, corruption: 5, reformSpeed: 5, repression: 6, innovation: -2, equality: -4 }
  },
  'Totalitarian Regime': {
    short: 'Maximum control, high collapse risk.',
    effects: ['Short-term control and mobilization are strong.', 'Innovation, diplomacy and trust are weaker.', 'Repression is cheaper but damages society.', 'If legitimacy breaks, decline can be sudden.'],
    modifiers: { capital: 9, stability: 6, diplomacy: -12, corruption: 9, reformSpeed: 7, repression: 12, innovation: -7, equality: -6 }
  }
};

const resources = {
  'Oil & Gas': { icon: '⛽', effects: ['High resource income and Treasury potential.', 'Higher corruption, inequality and environmental stress.', 'Vulnerable to commodity crashes.'], m: { resourceIncome: 14, corruption: 8, inequality: 8, environment: 10, growth: 1.3, trade: 3 } },
  Agriculture: { icon: '🌾', effects: ['Food security and rural stability.', 'Vulnerable to droughts and climate stress.', 'Needs modernization to grow quickly.'], m: { resourceIncome: 5, corruption: -1, inequality: -2, environment: 3, growth: .7, trade: 1, stability: 4 } },
  Minerals: { icon: '⛏️', effects: ['Strong export potential and industry base.', 'Corruption, pollution and regional inequality risks.', 'Benefits from rail and ports.'], m: { resourceIncome: 10, corruption: 6, inequality: 6, environment: 8, growth: 1, trade: 3 } },
  'Ports & Trade': { icon: '🚢', effects: ['High trade income and diplomatic leverage.', 'Vulnerable to blockades and regional instability.', 'Excellent with infrastructure investment.'], m: { resourceIncome: 6, corruption: 0, inequality: 2, environment: 2, growth: 1.2, trade: 12, diplomacy: 5 } },
  Manufacturing: { icon: '🏭', effects: ['Jobs, exports and industrial growth.', 'Needs infrastructure, education and energy.', 'Can increase pollution if unregulated.'], m: { resourceIncome: 7, corruption: 1, inequality: 2, environment: 5, growth: 1.5, trade: 6, innovation: 1 } },
  Finance: { icon: '🏦', effects: ['High revenue and investment potential.', 'Vulnerable to financial crises.', 'Can increase inequality.'], m: { resourceIncome: 9, corruption: 3, inequality: 8, environment: -1, growth: 1.1, trade: 5, diplomacy: 4 } },
  Technology: { icon: '💡', effects: ['Innovation and productivity grow faster.', 'Needs education and stability.', 'Weak early if development is low.'], m: { resourceIncome: 5, corruption: -2, inequality: 3, environment: -2, growth: 1.7, trade: 4, innovation: 10 } },
  Tourism: { icon: '🏝️', effects: ['Service jobs, diplomacy and foreign revenue.', 'Sensitive to instability and regional conflict.', 'Can strain environment if unmanaged.'], m: { resourceIncome: 6, corruption: 0, inequality: 1, environment: 4, growth: 1, trade: 3, diplomacy: 6 } }
};

const geographies = {
  Island: ['Strong maritime identity', 'More exposed to import shocks and storms', 'Ports and diplomacy matter more'],
  Coastal: ['Good trade potential', 'Ports, tourism and manufacturing benefit', 'Border and maritime risks both matter'],
  Landlocked: ['Needs good neighbor relations for trade', 'Lower port access', 'Rail corridors and diplomacy are crucial'],
  'River Delta': ['Agriculture and population density potential', 'Flood risk', 'Infrastructure and environment matter'],
  Mountain: ['Natural defense and resource potential', 'Harder infrastructure', 'Regional inequality risk'],
  Desert: ['Energy/resource potential', 'Water and agriculture stress', 'Infrastructure is expensive']
};

const development = {
  Poor: { gdpPc: 2300, debt: 42, stability: 49, corruption: 62, innovation: 23, infrastructure: 28, satisfaction: 46 },
  Emerging: { gdpPc: 8500, debt: 37, stability: 55, corruption: 49, innovation: 38, infrastructure: 45, satisfaction: 52 },
  'Middle-income': { gdpPc: 19500, debt: 50, stability: 61, corruption: 36, innovation: 55, infrastructure: 61, satisfaction: 59 },
  Advanced: { gdpPc: 47500, debt: 68, stability: 68, corruption: 23, innovation: 75, infrastructure: 78, satisfaction: 65 }
};

const projectList = [
  { id: 'port', name: 'Deepwater Port', cost: 42, capital: 2, years: 5, tag: 'Trade', desc: 'Expands shipping, exports and regional influence.', effect: { trade: 14, growth: .8, treasury: 8, diplomacy: 5 } },
  { id: 'rail', name: 'National Rail Corridor', cost: 36, capital: 2, years: 6, tag: 'Infrastructure', desc: 'Connects cities, mines, farms and borders.', effect: { infrastructure: 13, growth: .7, stability: 4, trade: 6 } },
  { id: 'university', name: 'National University System', cost: 34, capital: 3, years: 5, tag: 'Education', desc: 'Builds human capital and innovation.', effect: { innovation: 16, satisfaction: 4, growth: .6, youth: 8 } },
  { id: 'antiCorruption', name: 'Anti-Corruption Agency', cost: 24, capital: 5, years: 3, tag: 'Governance', desc: 'Improves tax efficiency and trust, angers corrupt elites.', effect: { corruption: -16, capital: 2, treasury: 9, business: -3 } },
  { id: 'greenGrid', name: 'Renewable Energy Grid', cost: 38, capital: 3, years: 5, tag: 'Environment', desc: 'Cuts long-term environmental stress and imports.', effect: { environment: -15, growth: .4, satisfaction: 4, trade: 2 } },
  { id: 'tourism', name: 'Tourism Development Plan', cost: 22, capital: 1, years: 4, tag: 'Services', desc: 'Improves foreign income and reputation.', effect: { diplomacy: 8, treasury: 5, satisfaction: 3, environment: 3 } },
  { id: 'army', name: 'Military Modernization', cost: 32, capital: 3, years: 4, tag: 'Security', desc: 'Deters hostile neighbors and raises military confidence.', effect: { military: 16, stability: 3, diplomacy: -2 } },
  { id: 'taxAdmin', name: 'Tax Administration Reform', cost: 20, capital: 4, years: 3, tag: 'Fiscal', desc: 'Raises revenue without raising the tax rate.', effect: { taxEfficiency: 12, treasury: 10, corruption: -5 } }
];

const neighborsSeed = [
  { name: 'Valmora Republic', regime: 'Democracy', economy: 72, military: 51, resources: 'Finance', relation: 64, trade: 48, tension: 25 },
  { name: 'Kingdom of Ardan', regime: 'Monarchy', economy: 55, military: 70, resources: 'Oil & Gas', relation: 42, trade: 35, tension: 56 },
  { name: 'North Kairan Directorate', regime: 'Authoritarian Regime', economy: 48, military: 76, resources: 'Minerals', relation: 36, trade: 22, tension: 67 },
  { name: 'Southern Littoral Union', regime: 'Democracy', economy: 61, military: 43, resources: 'Ports & Trade', relation: 58, trade: 52, tension: 31 }
];

const defaultNation = {
  name: 'Novara',
  geography: 'Coastal',
  population: 18,
  regime: 'Democracy',
  resource: 'Manufacturing',
  development: 'Emerging'
};

const defaultBudget = {
  education: 13,
  infrastructure: 16,
  security: 12,
  welfare: 13,
  environment: 10,
  innovation: 12,
  governance: 14,
  debt: 10
};

function budgetTotal(b) { return Object.values(b).reduce((a, c) => a + Number(c), 0); }
function popPressure(pop) { return Math.log10(pop + 1) * 8; }
function populationLabel(pop) { return pop >= 1000 ? `${fmt(pop / 1000, 2)}B` : `${fmt(pop, pop < 10 ? 1 : 0)}M`; }

function initialGame(nation) {
  const dev = development[nation.development];
  const reg = regimes[nation.regime].modifiers;
  const res = resources[nation.resource].m;
  const pop = Number(nation.population);
  const gdp = Math.max(1, pop * dev.gdpPc / 1000);
  const factions = {
    business: clamp(55 + (reg.equality < 0 ? 7 : 0) + (res.trade || 0) / 2, 20, 90),
    workers: clamp(54 + (reg.equality || 0), 20, 90),
    military: clamp(52 + (reg.repression || 0) / 2, 20, 90),
    youth: clamp(54 + (reg.innovation || 0) + (res.innovation || 0) / 3, 20, 90),
    rural: clamp(52 + (nation.resource === 'Agriculture' ? 12 : 0), 20, 90),
    green: clamp(52 - (res.environment || 0), 20, 90)
  };
  return {
    screen: 'game',
    nation,
    year: 1,
    maxYear: 50,
    taxRate: 22,
    budget: { ...defaultBudget },
    stats: {
      gdp,
      gdpPc: dev.gdpPc,
      growth: 2.4 + (res.growth || 0),
      treasury: 78 + (res.resourceIncome || 0) - popPressure(pop) / 3,
      debt: dev.debt,
      politicalCapital: regimes[nation.regime].modifiers.capital,
      stability: clamp(dev.stability + reg.stability + (res.stability || 0) - popPressure(pop) / 8, 10, 95),
      corruption: clamp(dev.corruption + reg.corruption + (res.corruption || 0), 5, 95),
      inequality: clamp(42 - (reg.equality || 0) + (res.inequality || 0) + popPressure(pop) / 6, 10, 92),
      satisfaction: clamp(dev.satisfaction + reg.stability / 2 - popPressure(pop) / 8, 10, 95),
      innovation: clamp(dev.innovation + reg.innovation + (res.innovation || 0), 5, 95),
      infrastructure: clamp(dev.infrastructure + (nation.geography === 'Landlocked' ? -5 : 0), 5, 95),
      environment: clamp(42 + (res.environment || 0) + (nation.geography === 'River Delta' ? 4 : 0), 5, 95),
      trade: clamp(42 + (res.trade || 0) + (nation.geography === 'Landlocked' ? -10 : 8), 5, 95),
      military: clamp(43 + reg.repression / 2 + (nation.geography === 'Mountain' ? 5 : 0), 5, 95),
      diplomacy: clamp(50 + reg.diplomacy + (res.diplomacy || 0), 5, 95),
      taxEfficiency: clamp(68 - (dev.corruption + reg.corruption) / 4, 25, 95)
    },
    factions,
    neighbors: neighborsSeed.map((x, idx) => ({ ...x, id: idx + 1 })),
    projects: [],
    completed: [],
    currentEvent: null,
    history: [],
    chart: [],
    lastReport: null,
    ending: null
  };
}

function getFiscalReport(game, stats = game.stats) {
  const pop = game.nation.population;
  const b = game.budget;
  const total = budgetTotal(b);
  const taxBurden = game.taxRate;
  const effectiveTax = game.taxRate / 100 * (stats.taxEfficiency / 100);
  const taxRevenue = Math.max(4, stats.gdp * effectiveTax / 10);
  const tradeIncome = Math.max(0, stats.trade * .12 + game.neighbors.reduce((a, n) => a + n.trade * n.relation / 100, 0) / 85);
  const resourceIncome = (resources[game.nation.resource].m.resourceIncome || 4) * (1 + stats.trade / 200);
  const baseSpending = 23 + total * .15 + popPressure(pop) * .3;
  const overspend = Math.max(0, total - 100) * .65;
  const debtService = stats.debt * .075;
  const corruptionLeakage = stats.corruption * .055;
  const taxStress = taxBurden > 38 ? (taxBurden - 38) * .08 : 0;
  const net = taxRevenue + tradeIncome + resourceIncome - baseSpending - overspend - debtService - corruptionLeakage - taxStress;
  return { taxRevenue, tradeIncome, resourceIncome, publicSpending: baseSpending + overspend, debtService, corruptionLeakage, taxStress, net };
}

const eventPool = [
  {
    title: 'Youth protests demand opportunity', type: 'Domestic Crisis', img: 'protest', text: 'Young citizens gather in the capital, accusing the government of growth without opportunity.',
    choices: [
      { label: 'Fund jobs and training', cost: 16, capital: 1, effect: { satisfaction: 7, stability: 4, youth: 10, treasury: -16, innovation: 3 }, note: 'Costs Treasury, improves youth approval.' },
      { label: 'Promise reform and spend political capital', cost: 0, capital: 3, effect: { satisfaction: 3, stability: 2, youth: 5, capital: -3 }, note: 'No Treasury cost, but consumes authority.' },
      { label: 'Ignore the protests', cost: 0, capital: 0, effect: { satisfaction: -6, stability: -7, youth: -12 }, note: 'Free, but dangerous.' },
      { label: 'Borrow for emergency employment', cost: 0, capital: 1, debt: 12, effect: { satisfaction: 6, stability: 3, youth: 8 }, note: 'Works now, raises debt.' }
    ]
  },
  {
    title: 'Regional drought threatens food prices', type: 'Climate Shock', img: 'drought', text: 'Low rainfall hits farms and raises pressure on rural households.',
    choices: [
      { label: 'Emergency rural relief', cost: 18, capital: 1, effect: { rural: 10, satisfaction: 5, stability: 3, treasury: -18 }, note: 'Direct but costly.' },
      { label: 'Ask neighbors for food support', cost: 0, capital: 1, relationBoost: 5, effect: { diplomacy: 3, satisfaction: 2 }, note: 'Needs diplomacy, does not require Treasury.' },
      { label: 'Borrow for grain imports', cost: 0, capital: 0, debt: 14, effect: { satisfaction: 4, rural: 6 }, note: 'Raises debt.' },
      { label: 'Let prices adjust', cost: 0, capital: 0, effect: { satisfaction: -7, rural: -10, stability: -5 }, note: 'No cost, serious social damage.' }
    ]
  },
  {
    title: 'Border skirmish raises regional tension', type: 'Regional Crisis', img: 'border', text: 'A patrol incident near the frontier triggers nationalist pressure.',
    choices: [
      { label: 'Mobilize forces', cost: 14, capital: 1, effect: { military: 7, stability: 2, diplomacy: -4, treasury: -14 }, tension: 7, note: 'Strong but escalatory.' },
      { label: 'Request mediation', cost: 0, capital: 2, effect: { diplomacy: 5, stability: 1, capital: -2 }, tension: -10, note: 'Uses political capital, avoids spending.' },
      { label: 'Downplay the incident', cost: 0, capital: 0, effect: { military: -5, diplomacy: 2, stability: -2 }, tension: -4, note: 'Free, but military dislikes weakness.' },
      { label: 'Borrow for border reinforcement', cost: 0, capital: 1, debt: 10, effect: { military: 5, stability: 2 }, tension: 3, note: 'Raises debt instead of using Treasury.' }
    ]
  },
  {
    title: 'Corruption scandal hits the cabinet', type: 'Governance Crisis', img: 'scandal', text: 'Leaked documents reveal suspicious contracts in a major ministry.',
    choices: [
      { label: 'Launch independent investigation', cost: 8, capital: 3, effect: { corruption: -8, satisfaction: 5, business: -3, treasury: -8 }, note: 'Costly but credible.' },
      { label: 'Sacrifice one minister', cost: 0, capital: 1, effect: { corruption: -3, satisfaction: 2, capital: -1 }, note: 'Cheap partial solution.' },
      { label: 'Suppress the story', cost: 0, capital: 2, effect: { corruption: 5, satisfaction: -6, stability: -3, capital: -2 }, note: 'No Treasury cost, damages trust.' },
      { label: 'Ignore it', cost: 0, capital: 0, effect: { corruption: 7, satisfaction: -7, capital: -1 }, note: 'Free, but corrosive.' }
    ]
  }
];

function applyEffect(game, effect = {}) {
  const s = { ...game.stats };
  const f = { ...game.factions };
  Object.entries(effect).forEach(([k, v]) => {
    if (k in s) s[k] = clamp(s[k] + v, k === 'treasury' ? -300 : 0, k === 'debt' ? 300 : 100);
    if (k in f) f[k] = clamp(f[k] + v, 0, 100);
    if (k === 'capital') s.politicalCapital = clamp(s.politicalCapital + v, -10, 25);
  });
  return { ...game, stats: s, factions: f };
}

function HomePage({ onPlay }) {
  const aboutText = `Civilization Builder was created from a simple idea: strategy games can be more than entertainment. They can also help us understand how countries develop, why institutions matter, and how difficult it is to govern under pressure.

The project is inspired by economics, geopolitics, development studies, and historical simulation. Instead of reducing a country to a single score, Civilization Builder tries to show the tensions behind national decision-making: growth versus equality, stability versus freedom, sovereignty versus diplomacy, short-term crisis management versus long-term reform.

The goal is not to predict reality perfectly. It is to make players think like decision-makers. Every policy has trade-offs. Every resource creates opportunities and risks. Every regime has strengths and weaknesses. Every crisis forces a choice.

Civilization Builder is built as an evolving browser game: accessible, educational, replayable, and grounded in real-world political and economic logic.`;
  return <div className="home">
    <nav className="topnav"><div className="brand"><Landmark size={22}/> Civilization Builder <span>v4</span></div><button onClick={onPlay} className="smallBtn">Play now</button></nav>
    <section className="hero">
      <div className="heroText">
        <p className="eyebrow">Nation-management strategy simulator</p>
        <h1>Build a nation. Govern through crises. Shape fifty years of history.</h1>
        <p className="heroLead">Create a fictional country, define its regime, population and resources, then guide it through budgets, taxes, factions, projects, neighbors and regional shocks.</p>
        <div className="heroActions"><button onClick={onPlay} className="primary"><Play size={18}/> Play the Game</button><a href="#how" className="secondary">How it works</a></div>
      </div>
      <div className="heroPanel">
        <div className="mapCard"><Flag/><strong>Republic of Novara</strong><span>Population 18M · Manufacturing · Democracy</span></div>
        <div className="miniGrid">
          <div><Coins/> Treasury <b>84</b></div><div><Vote/> Capital <b>8</b></div><div><TrendingUp/> Growth <b>3.8%</b></div><div><Handshake/> Diplomacy <b>62</b></div>
        </div>
        <div className="eventPreview"><AlertTriangle/> Border tensions rise. Negotiate, mobilize, borrow, or ask allies for mediation.</div>
      </div>
    </section>
    <section id="how" className="section"><h2>How the game works</h2><div className="steps">
      {[
        ['Create your nation', 'Choose population, regime, geography, development level and resource base.'],
        ['Govern year by year', 'Set taxes, allocate the annual budget, manage Treasury and spend Political Capital.'],
        ['Face crises', 'Respond to protests, droughts, scandals, border tensions and economic shocks.'],
        ['Manage society', 'Balance workers, business elites, youth, military, rural regions and environmental groups.'],
        ['Shape your region', 'Build relations through trade, treaties, aid, alliances, pressure or sanctions.'],
        ['Write history', 'After 50 years, your country receives a final national outcome.']
      ].map(([t,d],i)=><div className="step" key={t}><span>{i+1}</span><h3>{t}</h3><p>{d}</p></div>)}
    </div></section>
    <section className="section split"><div><h2>Why your choices matter</h2><p>A huge population gives you a large market, tax base and military potential, but it raises infrastructure, welfare and crisis costs. A democracy gives legitimacy, but elections can punish bad governance. An oil economy can fill your Treasury quickly, but increases corruption, inequality and environmental pressure.</p></div><div className="logicBox"><p><strong>Every system is connected:</strong></p><p>Budget → GDP, stability, factions</p><p>Taxes + GDP + corruption → Treasury</p><p>Satisfaction + stability → Political Capital</p><p>Neighbors → trade, security, crises</p></div></section>
    <section className="section about"><h2>About us</h2>{aboutText.split('\n\n').map((p,i)=><p key={i}>{p}</p>)}</section>
  </div>
}

function Setup({ onStart, onHome }) {
  const [nation, setNation] = useState(defaultNation);
  const reg = regimes[nation.regime];
  const res = resources[nation.resource];
  const update = (k, v) => setNation({ ...nation, [k]: v });
  return <div className="page">
    <header className="pageHeader"><button className="ghost" onClick={onHome}><Home size={17}/> Home</button><div><h1>Create your nation</h1><p>Each starting choice changes how the country plays.</p></div><button className="primary" onClick={() => onStart(initialGame(nation))}>Found Nation <ChevronRight size={18}/></button></header>
    <div className="setupGrid">
      <div className="card formCard"><h2>National identity</h2><label>Country name<input value={nation.name} onChange={e=>update('name', e.target.value)} /></label>
        <label>Population: <b>{populationLabel(nation.population)}</b><input type="range" min="0.5" max="2000" step="0.5" value={nation.population} onChange={e=>update('population', Number(e.target.value))}/><small>0.5 million to 2,000 million. Larger countries have greater markets and manpower, but higher welfare, infrastructure and crisis pressure.</small></label>
        <label>Geography<select value={nation.geography} onChange={e=>update('geography', e.target.value)}>{Object.keys(geographies).map(g=><option key={g}>{g}</option>)}</select></label>
        <label>Development level<select value={nation.development} onChange={e=>update('development', e.target.value)}>{Object.keys(development).map(g=><option key={g}>{g}</option>)}</select></label>
      </div>
      <div className="card"><h2>Regime type</h2><div className="choiceList">{Object.keys(regimes).map(r=><button key={r} className={r===nation.regime?'choice active':'choice'} onClick={()=>update('regime', r)}><strong>{r}</strong><span>{regimes[r].short}</span></button>)}</div><InfoPanel title={nation.regime} items={reg.effects}/></div>
      <div className="card"><h2>Resource base</h2><div className="resourceGrid">{Object.keys(resources).map(r=><button key={r} className={r===nation.resource?'resource active':'resource'} onClick={()=>update('resource', r)}><span>{resources[r].icon}</span>{r}</button>)}</div><InfoPanel title={`${res.icon} ${nation.resource}`} items={res.effects}/></div>
      <div className="card preview"><h2>Starting logic</h2><p><strong>{populationLabel(nation.population)}</strong> people means {nation.population > 150 ? 'a large domestic market and strong manpower, but heavy infrastructure and social pressure.' : nation.population < 5 ? 'an easier country to govern, but a smaller tax base and weaker army potential.' : 'a balanced population with moderate governing pressure.'}</p><p><strong>{nation.geography}</strong>: {geographies[nation.geography][0]}. {geographies[nation.geography][1]}.</p><p><strong>{nation.regime}</strong>: {reg.short}</p><p><strong>{nation.resource}</strong>: {res.effects[0]}</p></div>
    </div>
  </div>
}

function InfoPanel({ title, items }) { return <div className="infoPanel"><strong>{title}</strong>{items.map(x=><p key={x}>• {x}</p>)}</div> }

function StatCard({ icon, label, value, hint, cls='' }) { return <div className={`stat ${cls}`}>{icon}<div><span>{label}</span><b>{value}</b>{hint && <small>{hint}</small>}</div></div> }
function Meter({ label, value }) { return <div className="meter"><div><span>{label}</span><b>{fmt(value)}</b></div><div className="bar"><i style={{width:`${clamp(value,0,100)}%`}} /></div></div> }

function Game({ game, setGame, onHome, onRestart }) {
  const [tab, setTab] = useState('govern');
  const fiscal = useMemo(()=>getFiscalReport(game), [game]);
  const event = game.currentEvent;

  function changeBudget(k, v) { setGame({ ...game, budget: { ...game.budget, [k]: Number(v) } }); }
  function advanceYear() {
    let g = { ...game, stats: { ...game.stats }, factions: { ...game.factions }, history: [...game.history], chart: [...game.chart], projects: game.projects.map(p=>({...p})), completed: [...game.completed] };
    const s = g.stats, b = g.budget, n = g.nation;
    const reg = regimes[n.regime].modifiers, res = resources[n.resource].m;
    const fiscalNow = getFiscalReport(g);
    const total = budgetTotal(b);
    const avgRel = g.neighbors.reduce((a,c)=>a+c.relation,0)/g.neighbors.length;
    const infrastructureBoost = (b.infrastructure-12)*.055 + s.infrastructure/120;
    const educationBoost = (b.education-10)*.035 + (b.innovation-10)*.045 + s.innovation/150;
    const corruptionDrag = s.corruption*.018;
    const instabilityDrag = (60-s.stability)*.018;
    const taxDrag = g.taxRate > 36 ? (g.taxRate-36)*.08 : 0;
    const tradeBoost = s.trade*.018 + avgRel*.012;
    const growth = clamp(1.1 + (res.growth||0) + infrastructureBoost + educationBoost + tradeBoost - corruptionDrag - instabilityDrag - taxDrag, -5, 10);
    s.growth = growth;
    s.gdp = Math.max(.1, s.gdp * (1 + growth/100));
    s.gdpPc = (s.gdp * 1000) / n.population;
    s.treasury = clamp(s.treasury + fiscalNow.net, -300, 500);
    s.debt = clamp(s.debt + Math.max(0, -fiscalNow.net)*.35 + Math.max(0,total-100)*.25 - b.debt*.08, 0, 300);
    s.corruption = clamp(s.corruption - b.governance*.13 + (reg.corruption>5?.12:0), 0, 100);
    s.infrastructure = clamp(s.infrastructure + b.infrastructure*.12 - popPressure(n.population)*.025, 0, 100);
    s.innovation = clamp(s.innovation + b.education*.08 + b.innovation*.12 + (reg.innovation||0)*.03, 0, 100);
    s.environment = clamp(s.environment + (res.environment||0)*.025 - b.environment*.16 + growth*.22, 0, 100);
    s.trade = clamp(s.trade + b.infrastructure*.04 + avgRel*.018 + (res.trade||0)*.025, 0, 100);
    s.military = clamp(s.military + b.security*.12 - .5, 0, 100);
    s.satisfaction = clamp(s.satisfaction + growth*.5 + b.welfare*.09 + b.education*.04 - Math.max(0,g.taxRate-32)*.16 - s.inequality*.035 - s.environment*.025, 0, 100);
    s.inequality = clamp(s.inequality + (res.inequality||0)*.025 - b.welfare*.09 - b.education*.035 - b.governance*.025 + Math.max(0,g.taxRate-35)*.04, 0, 100);
    s.stability = clamp(s.stability + (s.satisfaction-50)*.04 - Math.max(0,s.inequality-55)*.04 - Math.max(0,s.corruption-50)*.03 + b.security*.025, 0, 100);
    s.taxEfficiency = clamp(s.taxEfficiency + b.governance*.08 - s.corruption*.015, 20, 100);
    const factionAvg = Object.values(g.factions).reduce((a,c)=>a+c,0)/Object.keys(g.factions).length;
    s.politicalCapital = clamp(s.politicalCapital + (s.satisfaction-50)/28 + (s.stability-55)/38 + (factionAvg-50)/45 - (n.regime==='Democracy' && g.year % 5 === 0 && s.satisfaction < 50 ? 2 : 0), -10, 25);
    g.factions.business = clamp(g.factions.business + (g.taxRate < 28 ? 2 : -1) + growth*.15 - b.governance*.02,0,100);
    g.factions.workers = clamp(g.factions.workers + b.welfare*.08 - s.inequality*.035 + growth*.1,0,100);
    g.factions.military = clamp(g.factions.military + b.security*.12 - (s.diplomacy>65?0.4:0),0,100);
    g.factions.youth = clamp(g.factions.youth + b.education*.07 + b.innovation*.09 - Math.max(0,s.corruption-50)*.03,0,100);
    g.factions.rural = clamp(g.factions.rural + (n.resource==='Agriculture'?0.5:0) + b.infrastructure*.03 + b.welfare*.04 - s.environment*.025,0,100);
    g.factions.green = clamp(g.factions.green + b.environment*.12 - s.environment*.04,0,100);

    const completedNow = [];
    g.projects = g.projects.map(p => ({ ...p, remaining: p.remaining - 1 })).filter(p => {
      if (p.remaining <= 0) { completedNow.push(p); return false; }
      return true;
    });
    completedNow.forEach(p => { g = applyEffect(g, p.effect); g.completed.push(p.name); });
    const report = getFiscalReport(g, g.stats);
    const summary = {
      year: g.year,
      fiscal: fiscalNow,
      lines: [
        `GDP growth was ${pct(growth)}, driven by infrastructure, innovation, trade relations and tax pressure.`,
        `Treasury changed by ${signed(fiscalNow.net,1)}: tax revenue ${fmt(fiscalNow.taxRevenue,1)}, trade ${fmt(fiscalNow.tradeIncome,1)}, resource income ${fmt(fiscalNow.resourceIncome,1)}, spending ${fmt(fiscalNow.publicSpending,1)}, debt service ${fmt(fiscalNow.debtService,1)}, corruption leakage ${fmt(fiscalNow.corruptionLeakage,1)}.`,
        `Political Capital is now ${fmt(g.stats.politicalCapital,1)}, shaped by satisfaction, stability and faction approval.`,
        completedNow.length ? `Completed project: ${completedNow.map(p=>p.name).join(', ')}.` : 'No project was completed this year.'
      ]
    };
    g.lastReport = summary;
    g.chart.push({ year: g.year, GDP: Number(fmt(g.stats.gdp,1)), Treasury: Number(fmt(g.stats.treasury,1)), Stability: Number(fmt(g.stats.stability,1)), Satisfaction: Number(fmt(g.stats.satisfaction,1)), Debt: Number(fmt(g.stats.debt,1)) });
    g.history.push({ year: g.year, title: 'End of year report', text: summary.lines.join(' ') });
    if (!g.currentEvent && (g.year % 2 === 0 || Math.random() < .35)) g.currentEvent = eventPool[(g.year + Math.floor(g.stats.corruption)) % eventPool.length];
    g.year += 1;
    if (g.year > g.maxYear) g.ending = makeEnding(g);
    setGame(g);
  }

  function chooseEvent(choice) {
    let g = { ...game, stats: { ...game.stats }, factions: { ...game.factions }, neighbors: game.neighbors.map(n=>({...n})), history: [...game.history] };
    // Choices are never fully blocked: if Treasury is insufficient, it automatically borrows the missing amount.
    const missing = Math.max(0, (choice.cost || 0) - g.stats.treasury);
    if (missing > 0) { g.stats.debt = clamp(g.stats.debt + missing * .7, 0, 300); }
    if (choice.debt) g.stats.debt = clamp(g.stats.debt + choice.debt, 0, 300);
    g.stats.treasury = clamp(g.stats.treasury - Math.min(g.stats.treasury, choice.cost || 0), -300, 500);
    g.stats.politicalCapital = clamp(g.stats.politicalCapital - (choice.capital || 0), -10, 25);
    g = applyEffect(g, choice.effect);
    if (choice.relationBoost || choice.tension) g.neighbors = g.neighbors.map((n,i)=> i===0 ? { ...n, relation: clamp(n.relation+(choice.relationBoost||0),0,100), tension: clamp(n.tension+(choice.tension||0),0,100) } : n);
    g.history.push({ year: g.year, title: game.currentEvent.title, text: `Chose: ${choice.label}. ${choice.note}` });
    g.currentEvent = null;
    setGame(g);
  }

  function startProject(p) {
    if (game.projects.find(x=>x.id===p.id) || game.completed.includes(p.name)) return;
    if (game.stats.treasury < p.cost || game.stats.politicalCapital < p.capital) return;
    setGame({ ...game, stats: { ...game.stats, treasury: game.stats.treasury - p.cost, politicalCapital: game.stats.politicalCapital - p.capital }, projects: [...game.projects, { ...p, remaining: p.years }] });
  }
  function diplomacy(action, neighbor) {
    let cost = action.cost || 0, cap = action.capital || 0;
    if (game.stats.treasury < cost || game.stats.politicalCapital < cap) return;
    const neighbors = game.neighbors.map(n => n.id === neighbor.id ? { ...n, relation: clamp(n.relation + action.rel,0,100), trade: clamp(n.trade + (action.trade||0),0,100), tension: clamp(n.tension + (action.tension||0),0,100) } : n);
    setGame({ ...game, neighbors, stats: { ...game.stats, treasury: game.stats.treasury - cost, politicalCapital: game.stats.politicalCapital - cap, diplomacy: clamp(game.stats.diplomacy + (action.dip||0),0,100) }, history: [...game.history, { year: game.year, title: `Diplomacy with ${neighbor.name}`, text: action.name }] });
  }

  if (game.ending) return <Final game={game} onRestart={onRestart} onHome={onHome}/>;
  return <div className="page gamePage">
    <header className="gameHeader"><div><button className="ghost" onClick={onHome}><Home size={17}/> Home</button><h1>{game.nation.name}</h1><p>Year {game.year} / {game.maxYear} · {game.nation.regime} · {populationLabel(game.nation.population)} people · {game.nation.resource}</p></div><button onClick={advanceYear} className="primary">Advance year <ChevronRight size={18}/></button></header>
    <div className="nationBanner"><div className="flagVisual"><span></span><i></i><b></b></div><div><h2>State of the Nation</h2><p>{game.stats.stability > 65 ? 'Institutions feel stable.' : game.stats.stability < 40 ? 'The country feels politically fragile.' : 'The country is holding together, but pressure is visible.'} {game.stats.treasury < 0 ? 'The Treasury is negative; actions can still be taken by borrowing, but debt will rise.' : 'The Treasury can fund projects and crisis responses.'}</p></div><div className="bannerStats"><b>{pct(game.stats.growth)}</b><span>growth</span></div></div>
    <div className="statsGrid"><StatCard icon={<Coins/>} label="Treasury" value={fmt(game.stats.treasury,1)} hint="Money reserve" cls="gold"/><StatCard icon={<Vote/>} label="Political Capital" value={fmt(game.stats.politicalCapital,1)} hint="Governing power" cls="purple"/><StatCard icon={<Banknote/>} label="Tax Rate" value={`${game.taxRate}%`} hint="Revenue vs pressure"/><StatCard icon={<Scale/>} label="Debt" value={fmt(game.stats.debt,1)} hint="Future pressure"/><StatCard icon={<TrendingUp/>} label="GDP" value={fmt(game.stats.gdp,1)} hint="Economy size"/><StatCard icon={<Users/>} label="Satisfaction" value={fmt(game.stats.satisfaction)} hint="Public mood"/></div>
    <div className="tabs">{['govern','treasury','society','neighbors','projects','history'].map(t=><button onClick={()=>setTab(t)} className={tab===t?'active':''} key={t}>{t}</button>)}</div>
    {event && <EventCard event={event} choose={chooseEvent} treasury={game.stats.treasury}/>} 
    {tab==='govern' && <Govern game={game} changeBudget={changeBudget} setGame={setGame}/>} 
    {tab==='treasury' && <Treasury game={game} fiscal={fiscal}/>} 
    {tab==='society' && <Society game={game}/>} 
    {tab==='neighbors' && <Neighbors game={game} diplomacy={diplomacy}/>} 
    {tab==='projects' && <Projects game={game} startProject={startProject}/>} 
    {tab==='history' && <History game={game}/>} 
  </div>
}

function EventCard({ event, choose, treasury }) { return <div className={`eventCard ${event.img}`}><div><p className="eyebrow"><AlertTriangle size={15}/> {event.type}</p><h2>{event.title}</h2><p>{event.text}</p></div><div className="eventChoices">{event.choices.map(c=><button key={c.label} onClick={()=>choose(c)}><strong>{c.label}</strong><span>{c.note}</span><small>{c.cost ? `${c.cost} Treasury` : '0 Treasury'} · {c.capital ? `${c.capital} Capital` : '0 Capital'}{treasury < c.cost ? ' · auto-borrows shortage' : ''}</small></button>)}</div></div> }
function Govern({ game, changeBudget, setGame }) { const total=budgetTotal(game.budget); const keys=Object.keys(game.budget); return <div className="twoCol"><div className="card"><h2>Annual Budget</h2><p>Allocate 100 yearly priority points. Staying at or below 100 avoids extra overspending, but Treasury still depends on taxes, GDP, debt and corruption.</p><div className={total>100?'budgetTotal bad':'budgetTotal'}>{total}/100</div>{keys.map(k=><label className="slider" key={k}><span>{k}</span><b>{game.budget[k]}</b><input type="range" min="0" max="30" value={game.budget[k]} onChange={e=>changeBudget(k,e.target.value)}/></label>)}</div><div className="card"><h2>Tax Rate</h2><p>Taxes are your main source of Treasury revenue. High taxes raise revenue but can hurt business approval, satisfaction and growth.</p><div className="taxDisplay">{game.taxRate}%</div><input type="range" min="5" max="60" value={game.taxRate} onChange={e=>setGame({...game, taxRate:Number(e.target.value)})}/><div className="infoPanel"><strong>Expected effects</strong><p>Higher: +Treasury revenue, -business mood, possible growth pressure.</p><p>Lower: +investment mood, -Treasury revenue.</p></div><h3>Core stats</h3><div className="meterGrid"><Meter label="Stability" value={game.stats.stability}/><Meter label="Corruption" value={game.stats.corruption}/><Meter label="Inequality" value={game.stats.inequality}/><Meter label="Innovation" value={game.stats.innovation}/></div></div></div> }
function Treasury({ game, fiscal }) { const rows=[['Tax revenue',fiscal.taxRevenue],['Trade income',fiscal.tradeIncome],['Resource income',fiscal.resourceIncome],['Public spending',-fiscal.publicSpending],['Debt service',-fiscal.debtService],['Corruption leakage',-fiscal.corruptionLeakage],['Tax stress',-fiscal.taxStress]]; return <div className="twoCol"><div className="card"><h2>Treasury Report</h2><p>This explains why Treasury rises or falls at the end of the year.</p>{rows.map(([k,v])=><div className="fiscalRow" key={k}><span>{k}</span><b className={v>=0?'pos':'neg'}>{signed(v,1)}</b></div>)}<div className="fiscalNet"><span>Expected net change</span><b className={fiscal.net>=0?'pos':'neg'}>{signed(fiscal.net,1)}</b></div></div><div className="card"><h2>Economic chart</h2><div className="chart"><ResponsiveContainer width="100%" height={260}><LineChart data={game.chart}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year"/><YAxis/><Tooltip/><Line type="monotone" dataKey="GDP" strokeWidth={2}/><Line type="monotone" dataKey="Treasury" strokeWidth={2}/><Line type="monotone" dataKey="Debt" strokeWidth={2}/></LineChart></ResponsiveContainer></div>{game.lastReport && <div className="infoPanel"><strong>Last end-of-year summary</strong>{game.lastReport.lines.map(l=><p key={l}>• {l}</p>)}</div>}</div></div> }
function Society({ game }) { return <div className="twoCol"><div className="card"><h2>Factions</h2><div className="meterGrid">{Object.entries(game.factions).map(([k,v])=><Meter key={k} label={k} value={v}/>)}</div></div><div className="card"><h2>Social indicators</h2><div className="meterGrid"><Meter label="Satisfaction" value={game.stats.satisfaction}/><Meter label="Stability" value={game.stats.stability}/><Meter label="Inequality" value={game.stats.inequality}/><Meter label="Environment stress" value={game.stats.environment}/><Meter label="Military" value={game.stats.military}/><Meter label="Diplomacy" value={game.stats.diplomacy}/></div></div></div> }
const dipActions=[{name:'Trade agreement',cost:8,capital:1,rel:8,trade:12,dip:2,tension:-2},{name:'Border treaty',cost:4,capital:2,rel:6,trade:2,tension:-12,dip:3},{name:'Foreign aid',cost:12,capital:0,rel:12,trade:2,dip:4},{name:'Defensive pact',cost:6,capital:3,rel:8,trade:0,tension:-5,dip:5},{name:'Sanctions',cost:0,capital:2,rel:-15,trade:-12,tension:8,dip:-2},{name:'Intelligence operation',cost:7,capital:2,rel:-4,trade:0,tension:-6,dip:0}];
function Neighbors({ game, diplomacy }) { return <div className="neighborGrid">{game.neighbors.map(n=><div className="card neighbor" key={n.id}><h2>{n.name}</h2><p>{n.regime} · {n.resources}</p><Meter label="Relation" value={n.relation}/><Meter label="Trade dependency" value={n.trade}/><Meter label="Border tension" value={n.tension}/><Meter label="Military strength" value={n.military}/><div className="dipBtns">{dipActions.map(a=><button disabled={game.stats.treasury<a.cost||game.stats.politicalCapital<a.capital} onClick={()=>diplomacy(a,n)} key={a.name}>{a.name}<small>{a.cost}T · {a.capital}C</small></button>)}</div></div>)}</div> }
function Projects({ game, startProject }) { return <div className="projectGrid">{projectList.map(p=>{const active=game.projects.find(x=>x.id===p.id), done=game.completed.includes(p.name); const disabled=game.stats.treasury<p.cost||game.stats.politicalCapital<p.capital||active||done; return <div className="card project" key={p.id}><span className="tag">{p.tag}</span><h2>{p.name}</h2><p>{p.desc}</p><p><strong>{p.cost}</strong> Treasury · <strong>{p.capital}</strong> Capital · {p.years} years</p>{active&&<p className="activeText">In progress: {active.remaining} years left</p>}{done&&<p className="doneText">Completed</p>}<button disabled={disabled} onClick={()=>startProject(p)}>{disabled ? (done?'Completed':active?'In progress':'Insufficient resources') : 'Start project'}</button></div>})}</div> }
function History({ game }) { return <div className="twoCol"><div className="card"><h2>Timeline</h2><div className="timeline">{game.history.slice().reverse().map((h,i)=><div key={i}><b>Year {h.year}: {h.title}</b><p>{h.text}</p></div>)}</div></div><div className="card"><h2>Performance chart</h2><ResponsiveContainer width="100%" height={330}><BarChart data={game.chart.slice(-10)}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year"/><YAxis/><Tooltip/><Bar dataKey="Stability"/><Bar dataKey="Satisfaction"/></BarChart></ResponsiveContainer></div></div> }
function makeEnding(g) { const s=g.stats; const score=clamp((s.gdpPc/900)+(s.stability+s.satisfaction+s.innovation+s.diplomacy)/4 - s.corruption*.35 - s.inequality*.25 - Math.max(0,s.debt-80)*.2,0,100); let title='Fragile Republic'; if(score>82) title='Model Civilization'; else if(score>65) title='Rising Regional Power'; else if(score>45) title='Uneven Development State'; else if(score<30) title='State in Decline'; return {score,title,text:`After fifty years, ${g.nation.name} ends as a ${title.toLowerCase()}. Its story was shaped by ${g.nation.regime.toLowerCase()} institutions, ${g.nation.resource.toLowerCase()} resources, ${populationLabel(g.nation.population)} people and the choices you made under pressure.`}; }
function Final({ game, onRestart, onHome }) { return <div className="page final"><div className="card finalCard"><h1>{game.ending.title}</h1><p>{game.ending.text}</p><div className="score">{fmt(game.ending.score)}/100</div><div className="heroActions"><button className="primary" onClick={onRestart}><RotateCcw size={18}/> New game</button><button className="secondary" onClick={onHome}><Home size={18}/> Home</button></div></div></div> }

function App() { const [view,setView]=useState('home'); const [game,setGame]=useState(null); if(view==='home') return <HomePage onPlay={()=>setView('setup')}/>; if(view==='setup' || !game) return <Setup onStart={(g)=>{setGame(g); setView('game')}} onHome={()=>setView('home')}/>; return <Game game={game} setGame={setGame} onHome={()=>setView('home')} onRestart={()=>{setGame(null); setView('setup')}}/> }

createRoot(document.getElementById('root')).render(<App />);

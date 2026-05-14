import React, { useMemo, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  Anchor,
  BarChart3,
  Building2,
  ChevronRight,
  Factory,
  Flag,
  Globe2,
  Landmark,
  Leaf,
  RefreshCw,
  Save,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import './styles.css'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const fmt = new Intl.NumberFormat('en-US')
const money = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

const geographyOptions = [
  { id: 'island', label: 'Island State', icon: '🌊', growth: 0.8, stability: 5, trade: 10, env: 3, military: -4, story: 'a maritime nation shaped by ports, sea lanes and vulnerability to external shocks' },
  { id: 'coastal', label: 'Coastal Hub', icon: '⚓', growth: 1.1, stability: 2, trade: 12, env: 4, military: 0, story: 'a coastal hub with access to shipping, migration and global markets' },
  { id: 'river', label: 'River Delta', icon: '🌾', growth: 0.9, stability: 0, trade: 6, env: 8, military: -1, story: 'a fertile river delta where agriculture, floods and urban growth compete for space' },
  { id: 'mountain', label: 'Mountain Federation', icon: '⛰️', growth: -0.2, stability: 7, trade: -5, env: 1, military: 5, story: 'a defensible mountain federation with strong local identities and difficult infrastructure' },
  { id: 'desert', label: 'Desert Republic', icon: '🏜️', growth: -0.4, stability: -2, trade: -2, env: 10, military: 4, story: 'an arid state where water, energy and logistics define national power' },
  { id: 'landlocked', label: 'Landlocked Crossroads', icon: '🛤️', growth: -0.1, stability: 1, trade: -8, env: 2, military: 2, story: 'a landlocked crossroads dependent on corridors, neighbors and inland infrastructure' },
]

const resourceOptions = [
  { id: 'oil', label: 'Oil & Gas', icon: '🛢️', growth: 1.4, volatility: 9, inequality: 6, diplomacy: 7, env: 12, innovation: -2, story: 'hydrocarbon exports give the state revenue but create volatility and environmental pressure' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌱', growth: 0.4, volatility: 4, inequality: 1, diplomacy: 0, env: 4, innovation: -1, story: 'food production anchors rural life but remains exposed to climate and productivity limits' },
  { id: 'minerals', label: 'Critical Minerals', icon: '⛏️', growth: 1.2, volatility: 7, inequality: 5, diplomacy: 6, env: 9, innovation: 1, story: 'strategic minerals attract foreign investment and geopolitical competition' },
  { id: 'tourism', label: 'Tourism', icon: '🏝️', growth: 0.8, volatility: 6, inequality: 2, diplomacy: 3, env: 5, innovation: 0, story: 'tourism brings foreign currency but makes the country sensitive to crises and image' },
  { id: 'manufacturing', label: 'Manufacturing', icon: '🏭', growth: 1.0, volatility: 3, inequality: 2, diplomacy: 4, env: 6, innovation: 4, story: 'factories build exports, jobs and a demanding middle class' },
  { id: 'finance', label: 'Finance', icon: '🏦', growth: 1.1, volatility: 5, inequality: 5, diplomacy: 5, env: 1, innovation: 5, story: 'financial services concentrate wealth and increase exposure to global capital flows' },
  { id: 'tech', label: 'Technology', icon: '💡', growth: 1.3, volatility: 3, inequality: 3, diplomacy: 4, env: 1, innovation: 10, story: 'a technology base raises productivity and creates a restless, educated workforce' },
  { id: 'ports', label: 'Strategic Ports', icon: '🚢', growth: 1.0, volatility: 4, inequality: 2, diplomacy: 8, env: 5, innovation: 2, story: 'ports turn geography into leverage over trade, logistics and naval strategy' },
]

const politicsOptions = [
  { id: 'democracy', label: 'Democracy', stability: 3, corruption: -4, innovation: 4, military: -1, inequality: -1, story: 'public accountability slows sudden decisions but protects legitimacy' },
  { id: 'technocracy', label: 'Technocracy', stability: 5, corruption: -2, innovation: 7, military: 0, inequality: 1, story: 'expert-led institutions favor efficiency, planning and measurable outcomes' },
  { id: 'monarchy', label: 'Constitutional Monarchy', stability: 7, corruption: 1, innovation: 1, military: 2, inequality: 3, story: 'continuity and symbolism create unity, but elites retain heavy influence' },
  { id: 'military', label: 'Military Regime', stability: -1, corruption: 4, innovation: -2, military: 9, inequality: 4, story: 'security institutions dominate national priorities and suppress dissent' },
  { id: 'socialist', label: 'Social Republic', stability: 1, corruption: 1, innovation: 0, military: 1, inequality: -5, story: 'redistribution and state planning reduce inequality but test fiscal discipline' },
]

const developmentOptions = [
  { id: 'poor', label: 'Low Income', gdpPc: 2200, stability: 42, innovation: 24, corruption: 58, infrastructure: 30 },
  { id: 'emerging', label: 'Emerging', gdpPc: 7600, stability: 52, innovation: 38, corruption: 48, infrastructure: 45 },
  { id: 'middle', label: 'Middle Income', gdpPc: 18500, stability: 62, innovation: 52, corruption: 36, infrastructure: 60 },
  { id: 'advanced', label: 'Advanced', gdpPc: 43000, stability: 72, innovation: 70, corruption: 22, infrastructure: 76 },
]

const populationOptions = [
  { id: 'small', label: 'Small', people: 2200000, note: 'agile but vulnerable' },
  { id: 'medium', label: 'Medium', people: 14500000, note: 'balanced scale' },
  { id: 'large', label: 'Large', people: 78000000, note: 'huge market, harder governance' },
  { id: 'mega', label: 'Mega', people: 182000000, note: 'continental weight and pressure' },
]

const defaultCountry = {
  name: 'Aurelia',
  geography: 'coastal',
  resources: ['manufacturing', 'ports', 'tech'],
  politics: 'technocracy',
  development: 'emerging',
  population: 'medium',
}

const defaultPolicies = {
  tax: 31,
  education: 58,
  military: 32,
  infrastructure: 62,
  welfare: 45,
  trade: 68,
  environment: 42,
  antiCorruption: 55,
}

const pick = (arr, id) => arr.find((item) => item.id === id) || arr[0]

function yearlyEvent(year, state, country, policies, selectedResources, geography, politics) {
  const events = []
  const resourceIds = selectedResources.map((r) => r.id)
  const climatePressure = state.environment > 65 || geography.id === 'river' || geography.id === 'desert'
  const resourceBoom = resourceIds.includes('oil') || resourceIds.includes('minerals')
  const innovationLift = policies.education > 65 && selectedResources.some((r) => ['tech', 'finance', 'manufacturing'].includes(r.id))
  const unrest = state.inequality > 62 || state.satisfaction < 42
  const debtRisk = policies.welfare + policies.military + policies.infrastructure + policies.education > 245 && policies.tax < 30

  if (year % 10 === 0 && innovationLift) {
    events.push({
      type: 'breakthrough',
      title: 'Innovation Corridor Takes Off',
      impact: 'Innovation +6, GDP growth bonus',
      text: `Universities, infrastructure and export firms begin reinforcing each other. ${country.name} develops a small but credible innovation corridor.`,
      effects: { innovation: 6, growth: 0.4, satisfaction: 2 },
    })
  }

  if (year % 15 === 0 && resourceBoom) {
    events.push({
      type: 'boom',
      title: 'Commodity Supercycle',
      impact: 'GDP boost, inequality pressure',
      text: `Global demand for ${resourceIds.includes('oil') ? 'energy' : 'critical minerals'} sends export revenues upward, but wealth concentrates around the extraction regions.`,
      effects: { growth: 0.8, inequality: 4, diplomacy: 3, environment: 4 },
    })
  }

  if (year % 12 === 0 && climatePressure) {
    events.push({
      type: 'shock',
      title: geography.id === 'desert' ? 'Water Emergency' : 'Climate Shock',
      impact: 'Environment +7, satisfaction -5',
      text: `A severe environmental shock exposes weaknesses in planning. The government is forced to choose between rapid rebuilding and long-term adaptation.`,
      effects: { environment: 7, satisfaction: -5, growth: -0.5, stability: -3 },
    })
  }

  if (year % 9 === 0 && policies.antiCorruption < 45) {
    events.push({
      type: 'scandal',
      title: 'Procurement Scandal',
      impact: 'Corruption +7, stability -5',
      text: `A public contract scandal spreads through the capital. Citizens start questioning whether growth is serving the country or only connected insiders.`,
      effects: { corruption: 7, stability: -5, satisfaction: -5 },
    })
  }

  if (year % 11 === 0 && unrest) {
    events.push({
      type: 'unrest',
      title: 'Youth Protest Wave',
      impact: 'Stability -6, reform pressure rises',
      text: `Young citizens mobilize against stagnant opportunity and visible inequality. The crisis becomes a test of institutional flexibility.`,
      effects: { stability: -6, satisfaction: -3, inequality: -1 },
    })
  }

  if (year % 14 === 0 && policies.trade > 70) {
    events.push({
      type: 'trade',
      title: 'Foreign Investment Wave',
      impact: 'GDP boost, diplomacy +4',
      text: `Open trade policy attracts multinational firms. Ports, industrial zones and business districts expand rapidly.`,
      effects: { growth: 0.5, diplomacy: 4, inequality: 2, innovation: 2 },
    })
  }

  if (year % 17 === 0 && debtRisk) {
    events.push({
      type: 'crisis',
      title: 'Fiscal Credibility Crisis',
      impact: 'Growth falls, satisfaction falls',
      text: `Investors and citizens lose confidence in the budget path. The state has promised more than it can easily finance.`,
      effects: { growth: -0.9, stability: -4, satisfaction: -6, corruption: 1 },
    })
  }

  if (year % 13 === 0 && policies.military > 62) {
    events.push({
      type: 'security',
      title: 'Regional Security Standoff',
      impact: 'Military +5, diplomacy -3',
      text: `Military spending gives ${country.name} deterrence, but neighbors begin to read its rise as a threat.`,
      effects: { military: 5, diplomacy: -3, stability: 1, growth: -0.2 },
    })
  }

  if (events.length === 0 && year % 5 === 0) {
    const stable = state.stability > 65
    return {
      year,
      type: stable ? 'consolidation' : 'adjustment',
      title: stable ? 'Quiet Consolidation' : 'Uneven Transition',
      impact: stable ? 'Stability and institutions mature' : 'Mixed results across society',
      text: stable
        ? `${country.name} enters a calmer phase. Institutions become more predictable, and citizens begin to expect gradual improvement rather than sudden transformation.`
        : `${country.name} keeps moving forward, but progress is uneven. The capital modernizes faster than the rest of the country.`,
    }
  }

  if (events.length === 0) return null
  const index = Math.abs((year * 7 + country.name.length * 3 + Math.round(state.gdpPc)) % events.length)
  return { year, ...events[index] }
}

function simulate(country, policies) {
  const geography = pick(geographyOptions, country.geography)
  const politics = pick(politicsOptions, country.politics)
  const development = pick(developmentOptions, country.development)
  const population = pick(populationOptions, country.population)
  const selectedResources = country.resources.map((id) => pick(resourceOptions, id))

  let populationValue = population.people
  let gdpPc = development.gdpPc
  let gdp = populationValue * gdpPc
  let stability = clamp(development.stability + geography.stability + politics.stability, 10, 95)
  let innovation = clamp(development.innovation + politics.innovation + selectedResources.reduce((s, r) => s + r.innovation, 0), 5, 95)
  let corruption = clamp(development.corruption + politics.corruption - policies.antiCorruption * 0.22, 5, 90)
  let inequality = clamp(42 + politics.inequality + selectedResources.reduce((s, r) => s + r.inequality, 0) - policies.welfare * 0.12, 18, 88)
  let environment = clamp(30 + geography.env + selectedResources.reduce((s, r) => s + r.env, 0) - policies.environment * 0.18, 8, 90)
  let military = clamp(25 + geography.military + politics.military + policies.military * 0.45, 5, 95)
  let diplomacy = clamp(35 + geography.trade * 0.35 + selectedResources.reduce((s, r) => s + r.diplomacy, 0) + policies.trade * 0.25, 5, 95)
  let satisfaction = clamp(52 + policies.welfare * 0.11 + policies.education * 0.08 - inequality * 0.16 - corruption * 0.12, 10, 95)

  const timeline = []
  const chart = []
  const events = []

  for (let year = 0; year <= 50; year++) {
    if (year > 0) {
      const resourceGrowth = selectedResources.reduce((s, r) => s + r.growth, 0) / selectedResources.length
      const volatility = selectedResources.reduce((s, r) => s + r.volatility, 0) / selectedResources.length
      const policyGrowth =
        policies.education * 0.012 +
        policies.infrastructure * 0.016 +
        policies.trade * 0.013 +
        policies.environment * 0.004 -
        policies.tax * 0.01 -
        corruption * 0.018 -
        environment * 0.012

      let growth = 1.45 + geography.growth + resourceGrowth + policyGrowth + innovation * 0.018 + stability * 0.012 - inequality * 0.01
      growth += Math.sin((year + country.name.length) / 3) * (volatility * 0.04)
      growth = clamp(growth, -3.5, 9.5)

      const event = yearlyEvent(year, { gdpPc, stability, inequality, satisfaction, environment }, country, policies, selectedResources, geography, politics)
      if (event?.effects) {
        growth += event.effects.growth || 0
        stability = clamp(stability + (event.effects.stability || 0), 5, 98)
        innovation = clamp(innovation + (event.effects.innovation || 0), 5, 98)
        corruption = clamp(corruption + (event.effects.corruption || 0), 2, 95)
        inequality = clamp(inequality + (event.effects.inequality || 0), 10, 95)
        environment = clamp(environment + (event.effects.environment || 0), 5, 98)
        military = clamp(military + (event.effects.military || 0), 5, 98)
        diplomacy = clamp(diplomacy + (event.effects.diplomacy || 0), 5, 98)
        satisfaction = clamp(satisfaction + (event.effects.satisfaction || 0), 5, 98)
      }
      if (event && year % 5 === 0) events.push(event)

      gdpPc *= 1 + growth / 100
      populationValue *= 1 + clamp(0.65 + satisfaction * 0.006 - development.gdpPc / 160000 - environment * 0.003, -0.4, 1.8) / 100
      gdp = populationValue * gdpPc

      stability = clamp(stability + policies.antiCorruption * 0.018 + policies.welfare * 0.012 - inequality * 0.018 - corruption * 0.016 + satisfaction * 0.012, 5, 98)
      innovation = clamp(innovation + policies.education * 0.035 + policies.trade * 0.006 + policies.infrastructure * 0.01 - corruption * 0.01, 5, 98)
      corruption = clamp(corruption - policies.antiCorruption * 0.035 + policies.tax * 0.006 + selectedResources.length * 0.08, 2, 95)
      inequality = clamp(inequality + policies.trade * 0.006 + selectedResources.reduce((s, r) => s + r.inequality, 0) * 0.008 - policies.welfare * 0.03 - policies.education * 0.018, 10, 95)
      environment = clamp(environment + selectedResources.reduce((s, r) => s + r.env, 0) * 0.012 + growth * 0.18 - policies.environment * 0.04, 5, 98)
      military = clamp(military + policies.military * 0.018 + gdpPc / 250000, 5, 98)
      diplomacy = clamp(diplomacy + policies.trade * 0.012 + stability * 0.006 - environment * 0.006 - corruption * 0.006, 5, 98)
      satisfaction = clamp(52 + policies.welfare * 0.12 + policies.education * 0.09 + gdpPc / 1700 - inequality * 0.18 - corruption * 0.12 - environment * 0.08, 5, 98)
    }

    if (year % 5 === 0) {
      chart.push({
        year,
        gdp: Number((gdp / 1_000_000_000).toFixed(1)),
        gdpPc: Math.round(gdpPc),
        stability: Math.round(stability),
        inequality: Math.round(inequality),
        innovation: Math.round(innovation),
        environment: Math.round(environment),
        satisfaction: Math.round(satisfaction),
        corruption: Math.round(corruption),
      })

      timeline.push({
        year,
        headline: year === 0 ? 'Founding Baseline' : `${country.name} in Year ${year}`,
        text:
          year === 0
            ? `${country.name} begins as ${geography.story}, governed as a ${politics.label.toLowerCase()} with a ${development.label.toLowerCase()} economy.`
            : narrative(country.name, { gdpPc, stability, inequality, innovation, corruption, environment, satisfaction }, selectedResources),
      })
    }
  }

  const final = chart[chart.length - 1]
  const score = Math.round(
    final.gdpPc / 1200 +
      final.stability * 0.22 +
      final.innovation * 0.22 +
      final.satisfaction * 0.18 +
      diplomacy * 0.12 +
      military * 0.08 -
      final.inequality * 0.11 -
      final.environment * 0.12 -
      final.corruption * 0.12,
  )

  return {
    country,
    policies,
    geography,
    politics,
    development,
    population: Math.round(populationValue),
    selectedResources,
    chart,
    timeline,
    events,
    final: {
      ...final,
      gdp: Number((gdp / 1_000_000_000).toFixed(1)),
      population: Math.round(populationValue),
      military: Math.round(military),
      diplomacy: Math.round(diplomacy),
      score: clamp(score, 0, 100),
      ending: ending(country.name, score, final, politics, selectedResources),
    },
  }
}

function narrative(name, state, resources) {
  const mainResource = resources[0]?.label || 'its mixed economy'
  if (state.stability > 72 && state.innovation > 65) return `${name} is becoming a mature power. ${mainResource} still matters, but institutions and human capital now drive the next phase of growth.`
  if (state.gdpPc > 30000 && state.inequality > 62) return `${name} is richer than ever, but the benefits are uneven. The skyline rises while social pressure builds beneath it.`
  if (state.corruption > 62) return `${name} grows in fragments. Public money leaks through networks of influence, weakening trust in the national project.`
  if (state.environment > 70) return `${name} faces the cost of rapid development. Climate, pollution and land pressure begin to shape politics as much as economics.`
  if (state.satisfaction < 42) return `${name} is no longer judged only by growth. Citizens demand security, fairness and a clearer national direction.`
  return `${name} develops gradually. Some regions modernize quickly, while others wait for infrastructure, jobs and political attention to arrive.`
}

function ending(name, score, final, politics, resources) {
  const resourcePhrase = resources.map((r) => r.label.toLowerCase()).slice(0, 2).join(' and ')
  if (score >= 80) return `${name} becomes a high-capacity civilization: prosperous, stable and influential. Its success comes from combining ${resourcePhrase} with credible institutions and long-term investment.`
  if (score >= 62) return `${name} becomes a respected regional power. It is not free of tension, but it has built enough prosperity and legitimacy to shape its neighborhood.`
  if (score >= 45) return `${name} survives its first half-century as a divided but functioning state. Growth exists, but inequality, weak trust or environmental stress prevent a full breakthrough.`
  return `${name} enters a fragile era. The state remains alive, but corruption, social pressure and strategic shocks have made national unity increasingly difficult to maintain.`
}

function App() {
  const [step, setStep] = useState('home')
  const [country, setCountry] = useState(defaultCountry)
  const [policies, setPolicies] = useState(defaultPolicies)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('civilization-builder-save')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.result) setResult(parsed.result)
      } catch {}
    }
  }, [])

  const canSimulate = country.name.trim().length > 1 && country.resources.length > 0

  function runSimulation() {
    const simulation = simulate(country, policies)
    setResult(simulation)
    localStorage.setItem('civilization-builder-save', JSON.stringify({ result: simulation, savedAt: new Date().toISOString() }))
    setStep('results')
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Header step={step} setStep={setStep} result={result} />
      {step === 'home' && <Home onStart={() => setStep('country')} hasResult={!!result} onResults={() => setStep('results')} />}
      {step === 'country' && <CountryBuilder country={country} setCountry={setCountry} onNext={() => setStep('policies')} />}
      {step === 'policies' && <PolicyBuilder policies={policies} setPolicies={setPolicies} onBack={() => setStep('country')} onSimulate={runSimulation} canSimulate={canSimulate} />}
      {step === 'results' && result && <Results result={result} onRestart={() => setStep('country')} onPolicies={() => setStep('policies')} />}
    </div>
  )
}

function Header({ step, setStep, result }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => setStep('home')}>
        <span className="brand-mark"><Globe2 size={22} /></span>
        <span>
          <strong>Civilization Builder</strong>
          <small>50-Year Nation Simulator</small>
        </span>
      </button>
      <nav>
        <button className={step === 'country' ? 'active' : ''} onClick={() => setStep('country')}>Create</button>
        <button className={step === 'policies' ? 'active' : ''} onClick={() => setStep('policies')}>Policies</button>
        <button className={step === 'results' ? 'active' : ''} disabled={!result} onClick={() => setStep('results')}>Results</button>
      </nav>
    </header>
  )
}

function Home({ onStart, hasResult, onResults }) {
  return (
    <main className="hero page-enter">
      <section className="hero-copy">
        <div className="eyebrow"><Sparkles size={16} /> Build a nation. Watch history answer.</div>
        <h1>Create a civilization and simulate 50 years of power, crisis and development.</h1>
        <p>
          Choose geography, resources, regime and policy priorities. Then watch GDP, stability, inequality,
          innovation, corruption, military power and environmental stress evolve through historical events.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={onStart}>Start a civilization <ChevronRight size={18} /></button>
          {hasResult && <button className="secondary" onClick={onResults}>Open saved simulation</button>}
        </div>
      </section>
      <section className="command-card">
        <div className="mini-map">
          <span className="node capital">Capital</span>
          <span className="node port">Port</span>
          <span className="node mine">Minerals</span>
          <span className="route route-one" />
          <span className="route route-two" />
        </div>
        <div className="status-grid">
          <Metric icon={<TrendingUp />} label="GDP" value="Dynamic" />
          <Metric icon={<Shield />} label="Stability" value="Fragile → Strong" />
          <Metric icon={<Leaf />} label="Environment" value="Pressure" />
          <Metric icon={<Users />} label="Society" value="Simulated" />
        </div>
      </section>
    </main>
  )
}

function CountryBuilder({ country, setCountry, onNext }) {
  const toggleResource = (id) => {
    setCountry((prev) => {
      const has = prev.resources.includes(id)
      const next = has ? prev.resources.filter((r) => r !== id) : [...prev.resources, id].slice(0, 4)
      return { ...prev, resources: next }
    })
  }

  return (
    <main className="page page-enter">
      <SectionTitle icon={<Flag />} kicker="Step 1" title="Create your nation" text="Define the structural conditions that will shape your civilization before policy even begins." />
      <div className="builder-grid">
        <div className="panel wide">
          <label className="input-label">Country name</label>
          <input value={country.name} onChange={(e) => setCountry({ ...country, name: e.target.value })} placeholder="Example: Aurelia" />
        </div>
        <OptionPanel title="Geography" options={geographyOptions} selected={country.geography} onSelect={(geography) => setCountry({ ...country, geography })} />
        <OptionPanel title="Political system" options={politicsOptions} selected={country.politics} onSelect={(politics) => setCountry({ ...country, politics })} />
        <OptionPanel title="Development level" options={developmentOptions} selected={country.development} onSelect={(development) => setCountry({ ...country, development })} />
        <OptionPanel title="Population scale" options={populationOptions} selected={country.population} onSelect={(population) => setCountry({ ...country, population })} />
        <div className="panel wide">
          <h3>Resource base <span>choose up to 4</span></h3>
          <div className="resource-grid">
            {resourceOptions.map((option) => (
              <button key={option.id} className={`choice ${country.resources.includes(option.id) ? 'selected' : ''}`} onClick={() => toggleResource(option.id)}>
                <span className="choice-icon">{option.icon}</span>
                <strong>{option.label}</strong>
                <small>{option.story}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-actions"><button className="primary" onClick={onNext}>Continue to policies <ChevronRight size={18} /></button></div>
    </main>
  )
}

function OptionPanel({ title, options, selected, onSelect }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <div className="option-list">
        {options.map((option) => (
          <button key={option.id} className={`option ${selected === option.id ? 'selected' : ''}`} onClick={() => onSelect(option.id)}>
            <span>{option.icon || '◆'}</span>
            <div>
              <strong>{option.label}</strong>
              {option.note && <small>{option.note}</small>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function PolicyBuilder({ policies, setPolicies, onBack, onSimulate, canSimulate }) {
  const policyList = [
    ['tax', 'Tax Rate', 'Higher taxes fund the state but can slow private growth.', Landmark],
    ['education', 'Education Spending', 'Raises innovation, mobility and long-term productivity.', Users],
    ['military', 'Military Spending', 'Improves deterrence but can crowd out civilian priorities.', Shield],
    ['infrastructure', 'Infrastructure', 'Boosts trade, productivity and national integration.', Building2],
    ['welfare', 'Welfare', 'Reduces inequality and social pressure.', Activity],
    ['trade', 'Trade Openness', 'Increases growth and diplomacy but can widen inequality.', Anchor],
    ['environment', 'Environmental Regulation', 'Protects long-term resilience but slows dirty growth.', Leaf],
    ['antiCorruption', 'Anti-Corruption', 'Builds state capacity and trust.', Factory],
  ]

  return (
    <main className="page page-enter">
      <SectionTitle icon={<Landmark />} kicker="Step 2" title="Set the national doctrine" text="Move the sliders to define the priorities of the state. There is no perfect mix: every choice creates trade-offs." />
      <div className="policy-grid">
        {policyList.map(([key, label, hint, Icon]) => (
          <div className="slider-card" key={key}>
            <div className="slider-head"><Icon size={18} /><strong>{label}</strong><span>{policies[key]}%</span></div>
            <input type="range" min="0" max="100" value={policies[key]} onChange={(e) => setPolicies({ ...policies, [key]: Number(e.target.value) })} />
            <p>{hint}</p>
          </div>
        ))}
      </div>
      <BudgetWarning policies={policies} />
      <div className="footer-actions split">
        <button className="secondary" onClick={onBack}>Back</button>
        <button className="primary" disabled={!canSimulate} onClick={onSimulate}>Run 50-year simulation <Sparkles size={18} /></button>
      </div>
    </main>
  )
}

function BudgetWarning({ policies }) {
  const total = policies.education + policies.military + policies.infrastructure + policies.welfare + policies.environment + policies.antiCorruption
  const pressure = total - policies.tax * 2.7
  let label = 'Balanced mandate'
  let text = 'Your budget is demanding but plausible for a state with credible revenue.'
  if (pressure > 130) {
    label = 'Fiscal danger'
    text = 'The state is promising more than it can easily finance. Debt or credibility problems may appear.'
  } else if (pressure > 80) {
    label = 'Heavy state burden'
    text = 'Ambitious spending may work, but it needs growth, taxation and institutional discipline.'
  } else if (pressure < 20) {
    label = 'Lean state'
    text = 'Low commitments reduce fiscal pressure, but underinvestment may limit development.'
  }
  return <div className="warning"><strong>{label}</strong><span>{text}</span></div>
}

function Results({ result, onRestart, onPolicies }) {
  const final = result.final
  const strengths = [
    ['GDP per capita', final.gdpPc],
    ['Stability', final.stability],
    ['Innovation', final.innovation],
    ['Diplomacy', final.diplomacy],
    ['Military', final.military],
  ].sort((a, b) => b[1] - a[1]).slice(0, 3)
  const weaknesses = [
    ['Inequality', final.inequality],
    ['Corruption', final.corruption],
    ['Environmental stress', final.environment],
  ].sort((a, b) => b[1] - a[1])

  return (
    <main className="page results page-enter">
      <section className="result-hero">
        <div>
          <div className="eyebrow"><Save size={16} /> Simulation saved in this browser</div>
          <h1>{result.country.name}</h1>
          <p>{final.ending}</p>
        </div>
        <div className="score-ring">
          <span>{final.score}</span>
          <small>civilization score</small>
        </div>
      </section>

      <div className="stats-grid">
        <Metric icon={<TrendingUp />} label="GDP" value={`$${money.format(final.gdp)}B`} />
        <Metric icon={<Users />} label="Population" value={fmt.format(final.population)} />
        <Metric icon={<BarChart3 />} label="GDP per capita" value={`$${fmt.format(final.gdpPc)}`} />
        <Metric icon={<Shield />} label="Stability" value={`${final.stability}/100`} />
        <Metric icon={<Sparkles />} label="Innovation" value={`${final.innovation}/100`} />
        <Metric icon={<Leaf />} label="Environment stress" value={`${final.environment}/100`} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Economic rise" data={result.chart} lines={[['gdp', 'GDP, $B'], ['gdpPc', 'GDP per capita']]} />
        <ChartCard title="State and society" data={result.chart} lines={[['stability', 'Stability'], ['satisfaction', 'Satisfaction'], ['inequality', 'Inequality']]} />
        <ChartCard title="Long-term pressure" data={result.chart} lines={[['innovation', 'Innovation'], ['environment', 'Environment'], ['corruption', 'Corruption']]} />
      </div>

      <div className="analysis-grid">
        <div className="panel">
          <h3>Strongest pillars</h3>
          <ul className="rank-list">{strengths.map(([name, value]) => <li key={name}><span>{name}</span><strong>{fmt.format(value)}</strong></li>)}</ul>
        </div>
        <div className="panel">
          <h3>Main vulnerabilities</h3>
          <ul className="rank-list">{weaknesses.map(([name, value]) => <li key={name}><span>{name}</span><strong>{fmt.format(value)}</strong></li>)}</ul>
        </div>
        <div className="panel">
          <h3>National DNA</h3>
          <p className="dna">A {result.geography.label.toLowerCase()} with {result.selectedResources.map((r) => r.label.toLowerCase()).join(', ')}, governed as a {result.politics.label.toLowerCase()}.</p>
        </div>
      </div>

      <section className="timeline-section">
        <SectionTitle icon={<Activity />} kicker="Historical timeline" title="50 years of national development" text="Every simulation creates a national story from policy choices, resources and structural constraints." />
        <div className="timeline">
          {result.timeline.map((item) => (
            <article key={item.year} className="timeline-item">
              <span className="year">Year {item.year}</span>
              <h3>{item.headline}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="timeline-section">
        <SectionTitle icon={<Sparkles />} kicker="Major events" title="Crises, booms and turning points" text="Events add pressure and opportunity, making each run feel like a different history." />
        <div className="event-grid">
          {result.events.map((event, index) => (
            <article className={`event-card ${event.type}`} key={`${event.year}-${index}`}>
              <span>Year {event.year}</span>
              <h3>{event.title}</h3>
              <small>{event.impact}</small>
              <p>{event.text}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="footer-actions split">
        <button className="secondary" onClick={onPolicies}>Change policies</button>
        <button className="primary" onClick={onRestart}><RefreshCw size={18} /> Build another nation</button>
      </div>
    </main>
  )
}

function ChartCard({ title, data, lines }) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,.55)" />
          <YAxis stroke="rgba(255,255,255,.55)" />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, color: 'white' }} />
          {lines.map(([key]) => <Line key={key} type="monotone" dataKey={key} strokeWidth={2.5} dot={false} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function Metric({ icon, label, value }) {
  return <div className="metric"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>
}

function SectionTitle({ icon, kicker, title, text }) {
  return <div className="section-title"><div className="eyebrow">{icon}{kicker}</div><h2>{title}</h2><p>{text}</p></div>
}

createRoot(document.getElementById('root')).render(<App />)

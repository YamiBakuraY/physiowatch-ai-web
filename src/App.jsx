import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Heart, Moon, Pill, Smile, Meh, Frown, AlertCircle, CheckCircle2,
  ChevronRight, ArrowLeft, Droplet, Wind, Sparkles,
  User, Stethoscope, LogOut, TrendingDown, TrendingUp, Minus, Loader2,
  Activity, Lock, Plus, X, Footprints, HeartPulse, BarChart2,
  Pencil, Trash2, AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer as RespContainer
} from 'recharts';
import { createClient } from '@supabase/supabase-js';

// URL e Chave já configuradas certinhas para o seu projeto!
const supabaseUrl = 'https://zjwriejvyajqdrohmili.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqd3JpZWp2eWFqcWRyb2htaWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzg1NzgsImV4cCI6MjEwNDY1NDU3OH0.YH7yKYGIwke_JgsaavLALRHELTD-QzrmI7Wbs3esfYc';

const supabase = createClient(supabaseUrl, supabaseKey);
// ---------- design tokens ----------
const C = {
  bg: '#F4F7F6',
  surface: '#FFFFFF',
  primary: '#0F6E5C',
  primaryDark: '#0A4F42',
  ink: '#17231F',
  inkSoft: '#5C6E68',
  line: '#DEE7E3',
  amber: '#F59E0B', 
  coral: '#EF4444', 
  green: '#10B981', 
  mint: '#E3F1EC',
  amberBg: '#FEF3C7',
  coralBg: '#FEE2E2',
};

const headFont = "'Space Grotesk', sans-serif";
const bodyFont = "'Inter', sans-serif";

// ---------- date helpers ----------
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const fmtDate = (s) => {
  const [y, m, d] = s.split('-');
  return `${d}/${m}`;
};
const fmtHM = (h) => {
  if (h === null || h === undefined || isNaN(h)) return '—';
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return mm === 0 ? `${hh}h` : `${hh}h${String(mm).padStart(2, '0')}`;
};

// ---------- color coding per indicator ----------
function colorForMetric(key, value) {
  switch (key) {
    case 'wellbeing':
      return value >= 8 ? C.green : value >= 6 ? C.amber : C.coral;
    case 'pain':
      // Dor menor é melhor (Invertido em relação ao bem estar)
      return value <= 2 ? C.green : value <= 5 ? C.amber : C.coral;
    case 'sleepHours':
      return value >= 8 ? C.green : C.coral;
    case 'spo2':
      return value >= 97 ? C.green : C.coral;
    case 'adherence':
      return value >= 100 ? C.green : value >= 70 ? C.amber : C.coral;
    case 'paSys':
      return value < 120 ? C.green : value < 140 ? C.amber : C.coral;
    case 'fc':
      return value >= 60 && value <= 100 ? C.green : C.coral;
    default:
      return null;
  }
}

const METRIC_META = {
  fc: { label: 'Frequência cardíaca' },
  pa: { label: 'Pressão arterial' },
  spo2: { label: 'Oxigenação (SpO₂)' },
  sleepHours: { label: 'Horas de sono' },
  wellbeing: { label: 'Bem-estar' },
  pain: { label: 'Nível de Dor' },
  steps: { label: 'Passos por dia' },
  adherence: { label: 'Adesão aos medicamentos' },
};

// ---------- storage helpers (browser localStorage) com tratamento de erro melhorado ----------
// ---------- storage helpers (AGORA NA NUVEM VIA SUPABASE) ----------

async function safeGet(key) {
  try {
    if (!key || typeof key !== 'string') return null;
    
    const { data, error } = await supabase
      .from('app_data')
      .select('payload')
      .eq('id', key)
      .single();

    // Se não achar o dado (ex: primeiro acesso), retorna null normal
    if (error && error.code !== 'PGRST116') {
      console.warn(`Aviso ao recuperar ${key}:`, error.message);
    }
    
    return data ? data.payload : null;
  } catch (e) {
    console.warn(`Erro no catch ao recuperar ${key}:`, e.message);
    return null;
  }
}

async function safeSet(key, value) {
  try {
    if (!key || typeof key !== 'string') return false;
    
    const { error } = await supabase
      .from('app_data')
      .upsert({ 
        id: key, 
        payload: value 
      }, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error(`Erro ao salvar ${key} na nuvem:`, e.message);
    return false;
  }
}
// ---------- demo data seeding ----------
function genEntries(painStart, painEnd, sleepStart, sleepEnd, stepsStart, stepsEnd, fcStart, fcEnd) {
  const entries = [];
  for (let i = 13; i >= 0; i--) {
    const t = (13 - i) / 13;
    const jitter = () => Math.random() * 0.4 - 0.2;
    const pain = Math.max(0, Math.min(10, painStart + (painEnd - painStart) * t + jitter()));
    entries.push({
      date: daysAgoStr(i),
      fc: Math.round(fcStart + (fcEnd - fcStart) * t + (Math.random() * 2 - 1)),
      paSys: Math.round(122 - t * 2),
      paDia: Math.round(80 - t * 2),
      spo2: Math.round(96 + t * 2),
      sleepHours: +(sleepStart + (sleepEnd - sleepStart) * t + (Math.random() * 0.3 - 0.15)).toFixed(1),
      mood: pain > 6 ? 'dor' : pain > 4 ? 'cansado' : t > 0.5 ? 'bem' : 'normal',
      pain: +pain.toFixed(1),
      wellbeing: +Math.max(0, Math.min(10, 9 - pain * 0.7)).toFixed(1),
      steps: Math.round(stepsStart + (stepsEnd - stepsStart) * t),
    });
  }
  return entries;
}

const DEMO_MEDS = [
  { id: 'm1', name: 'Anti-inflamatório', time: '08:00' },
  { id: 'm2', name: 'Analgésico', time: '14:00' },
  { id: 'm3', name: 'Relaxante muscular', time: '20:00' },
];

async function ensureSeed() {
  try {
    let list = await safeGet('patients:list');
    if (list && Array.isArray(list) && list.length > 0) return list;

    list = [
      { id: 'p1', name: 'Elias Souza', age: 34, treatment: 'Reabilitação de joelho', password: '123' },
      { id: 'p2', name: 'Marina Alves', age: 41, treatment: 'Fisioterapia lombar', password: '123' },
    ];
    
    const saved = await safeSet('patients:list', list);
    if (!saved) throw new Error('Falha ao salvar pacientes iniciais');

    await safeSet('entries:p1', genEntries(7.0, 3.2, 5.8, 6.7, 4800, 6200, 78, 74));
    await safeSet('entries:p2', genEntries(5.5, 5.0, 6.0, 6.1, 5200, 5300, 80, 79));

    for (const p of list) {
      await safeSet(`meds:${p.id}`, DEMO_MEDS);
      await safeSet(`medTaken:${p.id}`, []);
    }
    return list;
  } catch (error) {
    console.error('Erro ao inicializar dados:', error);
    return [];
  }
}

// ---------- derived stats ----------
function avg(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((s, e) => s + e[key], 0) / arr.length;
}
function weekStats(entries, offset) {
  const from = daysAgoStr(offset + 6);
  const to = daysAgoStr(offset);
  const week = entries.filter((e) => e.date >= from && e.date <= to);
  return {
    entries: week,
    fc: +avg(week, 'fc').toFixed(0),
    paSys: +avg(week, 'paSys').toFixed(0),
    paDia: +avg(week, 'paDia').toFixed(0),
    spo2: +avg(week, 'spo2').toFixed(0),
    sleepHours: +avg(week, 'sleepHours').toFixed(1),
    pain: +avg(week, 'pain').toFixed(1),
    wellbeing: +avg(week, 'wellbeing').toFixed(1),
    steps: Math.round(avg(week, 'steps')),
  };
}
function adherenceForRange(taken, meds, offsetStart) {
  const from = daysAgoStr(offsetStart + 6);
  const to = daysAgoStr(offsetStart);
  const count = taken.filter((t) => t.date >= from && t.date <= to).length;
  return Math.min(100, Math.round((count / Math.max(1, meds.length * 7)) * 100));
}

function statusFromPain(pain) {
  if (pain >= 6.5) return { label: 'Requer atenção', color: C.coral, bg: C.coralBg, dot: '🔴' };
  if (pain >= 4) return { label: 'Alterações identificadas', color: C.amber, bg: C.amberBg, dot: '🟡' };
  return { label: 'Acompanhamento normal', color: C.green, bg: C.mint, dot: '🟢' };
}

// ---------- small UI atoms ----------
function TopBar({ title, onBack, onLogout }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4">
      {onBack ? (
        <button onClick={onBack} className="p-1 -ml-1" style={{ color: C.inkSoft }}>
          <ArrowLeft size={20} />
        </button>
      ) : (
        <div style={{ width: 20 }} />
      )}
      <h1 style={{ fontFamily: headFont, color: C.ink }} className="text-base font-semibold">
        {title}
      </h1>
      {onLogout ? (
        <button onClick={onLogout} className="p-1 -mr-1" style={{ color: C.inkSoft }}>
          <LogOut size={18} />
        </button>
      ) : (
        <div style={{ width: 20 }} />
      )}
    </div>
  );
}

function StatRow({ icon, label, value, pending, valueColor, onClick }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className="flex items-center gap-3 py-3 w-full text-left"
      style={{ borderBottom: `1px solid ${C.line}`, background: 'transparent' }}
    >
      <div style={{ color: pending ? C.coral : C.primary, minWidth: 24 }}>{icon}</div>
      <span className="text-base flex-1" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
        {label}
      </span>
      {pending ? (
        <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: C.coral, fontFamily: bodyFont }}>
          <AlertCircle size={16} /> Pendente
        </span>
      ) : (
        <span className="text-base font-semibold flex items-center gap-1.5" style={{ color: valueColor || C.ink, fontFamily: bodyFont }}>
          {value}
          {onClick && <BarChart2 size={16} color={C.inkSoft} className="ml-1" />}
        </span>
      )}
    </Wrapper>
  );
}

function Trend({ from, to, unit = '', good = 'down', format }) {
  const fmt = format || ((v) => `${v}${unit}`);
  const diff = to - from;
  const improved = good === 'down' ? diff < 0 : diff > 0;
  const flat = Math.abs(diff) < 0.05;
  const Icon = flat ? Minus : diff < 0 ? TrendingDown : TrendingUp;
  const color = flat ? C.inkSoft : improved ? C.green : C.coral;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
        {fmt(from)} →
      </span>
      <span className="text-sm font-semibold flex items-center gap-1" style={{ color: color, fontFamily: bodyFont }}>
        {fmt(to)} <Icon size={16} />
      </span>
    </div>
  );
}

function TrendRow({ label, from, to, unit, good = 'down', format, statusColor, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between w-full text-left py-1">
      <span className="text-sm font-medium" style={{ color: C.ink, fontFamily: bodyFont }}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        <Trend from={from} to={to} unit={unit} good={good} format={format} />
        {statusColor && (
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              backgroundColor: statusColor,
              display: 'inline-block',
            }}
          />
        )}
        <BarChart2 size={16} color={C.primary} />
      </div>
    </button>
  );
}

// ---------- login ----------
function HealthIconStrip() {
  const items = [
    { icon: HeartPulse, label: 'Frequência', bg: '#0F6E5C' },
    { icon: Stethoscope, label: 'Acompanhamento', bg: '#126A63' },
    { icon: Activity, label: 'Pressão', bg: '#1A7A69' },
    { icon: Smile, label: 'Bem-estar', bg: '#2A8B7A' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-8">
      {items.map(({ icon: Icon, label, bg }) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 px-2 shadow-sm"
          style={{ backgroundColor: bg, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}
        >
          <div
            className="flex items-center justify-center rounded-full leading-none"
            style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            <Icon size={24} color="#F3F7F5" />
          </div>
          <span
            className="text-[11px] text-center leading-tight"
            style={{ color: '#F3F7F5', fontFamily: bodyFont }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

const PHYSIO_PASSWORD = '1234';

function LoginScreen({ patients, onEnter }) {
  const [role, setRole] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fisioPassword, setFisioPassword] = useState('');
  const [fisioError, setFisioError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedId);

  const tryLogin = useCallback(() => {
    if (!selectedPatient) {
      setError('Paciente não encontrado.');
      return;
    }
    
    if (!password.trim()) {
      setError('Digite a sua senha.');
      return;
    }
    
    if (password !== selectedPatient.password) {
      setError('Senha incorreta. Tente novamente.');
      setPassword('');
      return;
    }
    
    setError('');
    onEnter('paciente', selectedPatient.id);
  }, [selectedPatient, password, onEnter]);

  const tryFisioLogin = useCallback(() => {
    if (!fisioPassword.trim()) {
      setFisioError('Digite a senha do fisioterapeuta.');
      return;
    }
    
    if (fisioPassword !== PHYSIO_PASSWORD) {
      setFisioError('Senha incorreta. Tente novamente.');
      setFisioPassword('');
      return;
    }
    
    setFisioError('');
    onEnter('fisio', null);
  }, [fisioPassword, onEnter]);

  return (
    <div className="px-6 pt-14 pb-8 flex flex-col min-h-screen" style={{ backgroundColor: C.primaryDark }}>
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-2 flex items-center gap-2">
          <Heart size={26} color="#EFE3D0" fill="#EFE3D0" />
          <span style={{ fontFamily: headFont, color: '#EFE3D0', letterSpacing: '0.02em' }} className="text-2xl font-bold">
            PhysioWatch AI
          </span>
        </div>
        <p className="text-sm mb-6" style={{ color: '#B9CFC8', fontFamily: bodyFont }}>
          Seu acompanhamento inteligente de saúde e bem-estar.
        </p>

        {!role && <HealthIconStrip />}

        {!role && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setRole('paciente')}
              className="rounded-xl px-5 py-4 flex items-center justify-between"
              style={{ backgroundColor: C.surface }}
            >
              <span className="flex items-center gap-3 text-lg font-semibold" style={{ fontFamily: headFont, color: C.ink }}>
                <User size={22} /> Sou paciente
              </span>
              <ChevronRight size={20} color={C.inkSoft} />
            </button>
            <button
              onClick={() => setRole('fisio')}
              className="rounded-xl px-5 py-4 flex items-center justify-between border"
              style={{ backgroundColor: C.surface, borderColor: 'rgba(15, 110, 92, 0.12)' }}
            >
              <span className="flex items-center gap-3 text-lg font-semibold" style={{ fontFamily: headFont, color: C.ink }}>
                <Stethoscope size={22} /> Sou fisioterapeuta
              </span>
              <ChevronRight size={20} color={C.inkSoft} />
            </button>
          </div>
        )}

        {role === 'paciente' && !selectedId && (
          <div className="rounded-xl p-5" style={{ backgroundColor: C.surface }}>
            <p className="text-sm font-semibold mb-3" style={{ color: C.ink, fontFamily: bodyFont }}>
              Selecione seu perfil
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setPassword('');
                    setError('');
                  }}
                  className="text-left px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between"
                  style={{ fontFamily: bodyFont, color: C.ink, border: `1px solid ${C.line}` }}
                >
                  {p.name}
                  <Lock size={16} color={C.inkSoft} />
                </button>
              ))}
            </div>
            <button onClick={() => setRole(null)} className="w-full text-sm font-medium" style={{ color: C.inkSoft }}>
              Voltar
            </button>
          </div>
        )}

        {role === 'paciente' && selectedId && (
          <div className="rounded-xl p-5" style={{ backgroundColor: C.surface }}>
            <p className="text-lg font-bold mb-4" style={{ color: C.ink, fontFamily: headFont }}>
              Olá, {selectedPatient?.name.split(' ')[0]}
            </p>
            <label className="text-sm font-medium flex items-center gap-1.5 mb-2" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
              <Lock size={16} /> Digite sua senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryLogin()}
              className="w-full rounded-lg px-4 py-3 text-lg mb-4"
              style={{ border: `2px solid ${C.line}`, fontFamily: bodyFont, color: C.ink }}
            />
            {error && (
              <p className="text-sm font-medium mb-4" style={{ color: C.coral, fontFamily: bodyFont }}>
                {error}
              </p>
            )}
            <button
              onClick={tryLogin}
              className="w-full rounded-lg py-3 text-base font-bold"
              style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont }}
            >
              Acessar
            </button>
            <button
              onClick={() => {
                setSelectedId(null);
                setError('');
              }}
              className="w-full text-sm font-medium mt-4"
              style={{ color: C.inkSoft }}
            >
              Trocar paciente
            </button>
          </div>
        )}

        {role === 'fisio' && (
          <div className="rounded-xl p-5" style={{ backgroundColor: C.surface }}>
            <p className="text-base font-medium mb-4" style={{ color: C.ink, fontFamily: bodyFont }}>
              Acesso da clínica
            </p>
            <label className="text-sm font-medium flex items-center gap-1.5 mb-2" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
              <Lock size={16} /> Digite a senha do fisioterapeuta
            </label>
            <input
              type="password"
              value={fisioPassword}
              onChange={(e) => setFisioPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryFisioLogin()}
              className="w-full rounded-lg px-4 py-3 text-lg mb-4"
              style={{ border: `2px solid ${C.line}`, fontFamily: bodyFont, color: C.ink }}
              placeholder="Senha"
            />
            {fisioError && (
              <p className="text-sm font-medium mb-4" style={{ color: C.coral, fontFamily: bodyFont }}>
                {fisioError}
              </p>
            )}
            <button
              onClick={tryFisioLogin}
              className="w-full rounded-lg py-3 text-base font-bold"
              style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont }}
            >
              Acessar Painel
            </button>
            <button
              onClick={() => {
                setRole(null);
                setFisioPassword('');
                setFisioError('');
              }}
              className="w-full text-sm font-medium mt-4"
              style={{ color: C.inkSoft }}
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- patient home ----------
const MOODS = [
  { key: 'bem', label: 'Bem', icon: Smile, color: C.green },
  { key: 'normal', label: 'Normal', icon: Meh, color: C.amber },
  { key: 'cansado', label: 'Cansado', icon: Frown, color: '#F97316' }, // Orange
  { key: 'dor', label: 'Com dor', icon: AlertCircle, color: C.coral },
];

function PatientHome({ patient, entries, onGoEntry, onGoMeds, onLogout, onResetPassword }) {
  const latest = entries[entries.length - 1];
  const isToday = latest && latest.date === todayStr();
  const [showResetPassword, setShowResetPassword] = useState(false);

  return (
    <>
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <TopBar title="PhysioWatch AI" onLogout={onLogout} />
      <div className="px-4 md:px-6 pb-24">
        <h2 style={{ fontFamily: headFont, color: C.ink }} className="text-lg md:text-xl font-bold mb-1">
          Olá, {patient.name.split(' ')[0]} 👋
        </h2>
        
        {isToday ? (
          <div className="rounded-xl p-4 mb-5 flex items-start gap-3" style={{ backgroundColor: C.mint }}>
            <CheckCircle2 size={24} color={C.primary} />
            <p className="text-sm font-medium" style={{ color: C.primaryDark, fontFamily: bodyFont }}>
              Obrigado! Você já atualizou suas informações de saúde hoje.
            </p>
          </div>
        ) : (
          <div className="rounded-xl p-4 mb-5 flex items-start gap-3" style={{ backgroundColor: C.coralBg }}>
            <AlertCircle size={24} color={C.coral} />
            <p className="text-sm font-medium" style={{ color: '#991B1B', fontFamily: bodyFont }}>
              Atenção: Você ainda não registrou seus dados hoje!
            </p>
          </div>
        )}

        <div className="rounded-xl p-5 mb-5 shadow-sm" style={{ backgroundColor: C.surface, border: `1px solid ${!isToday ? C.coral : C.line}` }}>
          <p className="text-sm mb-4 font-bold" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
            SUAS INFORMAÇÕES (HOJE)
          </p>
          <StatRow icon={<HeartPulse size={20} />} label="Frequência cardíaca" value={latest ? `${latest.fc} bpm` : ''} pending={!isToday} />
          <StatRow icon={<Droplet size={20} />} label="Pressão arterial" value={latest ? `${latest.paSys}/${latest.paDia}` : ''} pending={!isToday} />
          <StatRow icon={<Wind size={20} />} label="Oxigenação" value={latest ? `${latest.spo2}%` : ''} pending={!isToday} />
          <StatRow icon={<Moon size={20} />} label="Sono" value={latest ? fmtHM(latest.sleepHours) : ''} pending={!isToday} />
        </div>

        <button
          onClick={onGoEntry}
          className="w-full rounded-xl py-4 mb-4 text-base font-bold shadow-md"
          style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont }}
        >
          {isToday ? 'Atualizar registro de hoje' : 'Preencher dados de hoje'}
        </button>
        <button
          onClick={onGoMeds}
          className="w-full rounded-xl py-4 flex items-center justify-center gap-2 text-base font-bold mb-3"
          style={{ backgroundColor: C.surface, color: C.ink, border: `2px solid ${C.line}`, fontFamily: headFont }}
        >
          <Pill size={20} color={C.primary} /> Meus medicamentos
        </button>

        <button
          onClick={() => setShowResetPassword(true)}
          className="w-full rounded-xl py-4 flex items-center justify-center gap-2 text-base font-bold"
          style={{ backgroundColor: C.mint, color: C.primaryDark, border: `2px solid ${C.primary}`, fontFamily: headFont }}
        >
          <Lock size={20} /> Redefinir senha
        </button>
      </div>
    </div>

    {showResetPassword && (
      <ResetPasswordModal
        patient={patient}
        onClose={() => setShowResetPassword(false)}
        onSave={onResetPassword}
      />
    )}
    </>
  );
}

function ResetPasswordModal({ patient, onClose, onSave }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    if (currentPassword !== patient.password) {
      setError('Senha atual incorreta.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas novas não coincidem.');
      return;
    }

    if (newPassword.length < 3) {
      setError('A nova senha deve ter pelo menos 3 caracteres.');
      return;
    }

    onSave(patient.id, currentPassword, newPassword);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,20,17,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: headFont, color: C.ink }}>
          Redefinir senha
        </h3>

        <div className="space-y-4">
          <Field label="Senha atual" value={currentPassword} onChange={setCurrentPassword} placeholder="Digite sua senha atual" type="password" />
          <Field label="Nova senha" value={newPassword} onChange={setNewPassword} placeholder="Digite a nova senha" type="password" />
          <Field label="Confirmar nova senha" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirme a nova senha" type="password" />
        </div>

        {error && (
          <p className="text-sm font-medium mt-3" style={{ color: C.coral, fontFamily: bodyFont }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={submit}
            className="flex-1 rounded-xl py-3 text-base font-bold"
            style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont }}
          >
            Salvar senha
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-3 text-base font-bold"
            style={{ backgroundColor: C.surface, color: C.inkSoft, border: `2px solid ${C.line}`, fontFamily: headFont }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- daily entry form ----------
function DailyEntryForm({ patient, onSave, onDone, onBack }) {
  const [mood, setMood] = useState('bem');
  const [pain, setPain] = useState(3);
  const [fc, setFc] = useState('');
  const [paSys, setPaSys] = useState('');
  const [paDia, setPaDia] = useState('');
  const [spo2, setSpo2] = useState('');
  const [sleepH, setSleepH] = useState('');
  const [sleepM, setSleepM] = useState('');
  const [wellbeing, setWellbeing] = useState(7);
  const [steps, setSteps] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Validação de números
  const isValidNumber = (val, min = 0, max = 999) => {
    const num = Number(val);
    return !isNaN(num) && num >= min && num <= max;
  };

  const numOr = (v, d) => (v === '' || isNaN(v) ? d : Number(v));

  const submit = async () => {
    setValidationError('');
    
    // Validar campos opcionais se preenchidos
    if (fc && !isValidNumber(fc, 40, 200)) {
      setValidationError('Frequência cardíaca deve estar entre 40-200 bpm');
      return;
    }
    if (paSys && !isValidNumber(paSys, 60, 200)) {
      setValidationError('Pressão sistólica deve estar entre 60-200 mmHg');
      return;
    }
    if (paDia && !isValidNumber(paDia, 40, 130)) {
      setValidationError('Pressão diastólica deve estar entre 40-130 mmHg');
      return;
    }
    if (spo2 && !isValidNumber(spo2, 70, 100)) {
      setValidationError('Oxigenação (SpO₂) deve estar entre 70-100%');
      return;
    }
    if (steps && !isValidNumber(steps, 0, 50000)) {
      setValidationError('Passos devem estar entre 0-50000');
      return;
    }

    setSaving(true);
    try {
      const sleepHours = numOr(sleepH, 7) + numOr(sleepM, 0) / 60;
      await onSave({
        date: todayStr(),
        mood,
        pain: Number(pain),
        fc: numOr(fc, 72),
        paSys: numOr(paSys, 120),
        paDia: numOr(paDia, 80),
        spo2: numOr(spo2, 97),
        sleepHours: +sleepHours.toFixed(2),
        wellbeing: Number(wellbeing),
        steps: numOr(steps, 5000),
      });
      setConfirmed(true);
    } catch (error) {
      setValidationError('Erro ao salvar registro. Tente novamente.');
      console.error('Erro ao salvar entrada:', error);
    } finally {
      setSaving(false);
    }
  };

  if (confirmed) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
        style={{ backgroundColor: C.bg }}
      >
        <div className="rounded-full p-6 mb-6 shadow-lg" style={{ backgroundColor: C.mint }}>
          <CheckCircle2 size={64} color={C.green} />
        </div>
        <h2 style={{ fontFamily: headFont, color: C.ink }} className="text-2xl font-bold mb-4">
          Registro diário confirmado e salvo
        </h2>
        <p className="text-base font-medium mb-10 px-2" style={{ color: C.inkSoft, fontFamily: bodyFont, lineHeight: '1.5' }}>
          Qualquer alteração, mal estar ou necessidade consulte seu fisioterapeuta.
        </p>
        <button
          onClick={onDone}
          className="w-full rounded-xl py-4 text-lg font-bold shadow-md"
          style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont }}
        >
          Concluir
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <TopBar title="Registro diário" onBack={onBack} />
      <div className="px-5 pb-10">
        <p className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: C.ink, fontFamily: bodyFont }}>
          <Smile size={24} color={C.primary} /> Como você está hoje?
        </p>
        
        {validationError && (
          <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ backgroundColor: C.coralBg }}>
            <AlertTriangle size={20} color={C.coral} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium" style={{ color: '#991B1B', fontFamily: bodyFont }}>
              {validationError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {MOODS.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setMood(key)}
              className="rounded-2xl py-8 md:py-10 flex flex-col items-center gap-2 md:gap-4 shadow-sm transition-all"
              style={{
                backgroundColor: mood === key ? `${color}22` : C.surface,
                border: `4px solid ${mood === key ? color : C.line}`,
                minHeight: 160,
              }}
            >
              <Icon size={50} color={color} className="md:w-[62px] md:h-[62px]" />
              <span className="text-lg md:text-2xl font-bold text-center" style={{ color: C.ink, fontFamily: bodyFont }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-xl p-5 mb-6 shadow-sm" style={{ backgroundColor: C.surface, border: `1px solid ${C.line}` }}>
          <label className="text-base font-bold flex items-center gap-2 mb-4" style={{ color: C.ink, fontFamily: bodyFont }}>
            <AlertCircle size={20} color={C.coral} /> Nível de dor: <span style={{ color: C.primary, fontSize: '1.2rem' }}>{pain}/10</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={pain}
            onChange={(e) => setPain(e.target.value)}
            className="w-full mb-2 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: C.coral }}
          />
          <div className="flex justify-between text-xs font-medium text-gray-500 mt-1 mb-6">
            <span>0 (Sem dor)</span>
            <span>10 (Dor máxima)</span>
          </div>

          <label className="text-base font-bold flex items-center gap-2 mb-4" style={{ color: C.ink, fontFamily: bodyFont }}>
            <Heart size={20} color={C.green} /> Bem-estar geral: <span style={{ color: C.primary, fontSize: '1.2rem' }}>{wellbeing}/10</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={wellbeing}
            onChange={(e) => setWellbeing(e.target.value)}
            className="w-full mb-2 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: C.green }}
          />
          <div className="flex justify-between text-xs font-medium text-gray-500 mt-1">
            <span>0 (Muito ruim)</span>
            <span>10 (Excelente)</span>
          </div>
        </div>

        <div className="rounded-xl p-5 mb-6 shadow-sm" style={{ backgroundColor: C.surface, border: `1px solid ${C.line}` }}>
          <label className="text-base font-bold flex items-center gap-2 mb-4" style={{ color: C.ink, fontFamily: bodyFont }}>
            <Moon size={20} color={C.primary} /> Quanto tempo você dormiu?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Horas" value={sleepH} onChange={setSleepH} placeholder="Ex: 7" icon={<Moon size={16} color={C.primary} />} />
            <Field label="Minutos" value={sleepM} onChange={setSleepM} placeholder="Ex: 30" icon={<Moon size={16} color={C.primary} />} />
          </div>
        </div>

        <div className="rounded-xl p-5 mb-8 shadow-sm" style={{ backgroundColor: C.surface, border: `1px solid ${C.line}` }}>
          <label className="text-base font-bold flex items-center gap-2 mb-4" style={{ color: C.ink, fontFamily: bodyFont }}>
            <Activity size={20} color={C.primary} /> Sinais Vitais (Opcional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Field icon={<HeartPulse size={16} color={C.primary} />} label="Frequência (bpm)" value={fc} onChange={setFc} placeholder="Ex: 72" />
            <Field icon={<Wind size={16} color={C.primary} />} label="Oxigenação (SpO₂)" value={spo2} onChange={setSpo2} placeholder="Ex: 98" />
            <Field icon={<Droplet size={16} color={C.primary} />} label="Pressão (Sistólica)" value={paSys} onChange={setPaSys} placeholder="Ex: 120" />
            <Field icon={<Droplet size={16} color={C.primary} />} label="Pressão (Diastólica)" value={paDia} onChange={setPaDia} placeholder="Ex: 80" />
            <Field icon={<Footprints size={16} color={C.primary} />} label="Passos no dia" value={steps} onChange={setSteps} placeholder="Ex: 5000" />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="w-full rounded-xl py-4 text-lg font-bold shadow-md"
          style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Salvando…' : 'Salvar registro'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon, type = 'number' }) {
  return (
    <div>
      <label className="text-sm font-semibold flex items-center gap-1.5 mb-2" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
        {icon} {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-base"
        style={{ border: `2px solid ${C.line}`, fontFamily: bodyFont, color: C.ink, minHeight: 48, fontSize: '1rem' }}
      />
    </div>
  );
}

// ---------- medications ----------
function MedsScreen({ patient, meds, taken, onToggle, onAddMed, onBack, onEditMed, onDeleteMed, onToggleTaken }) {
  const today = todayStr();
  const takenToday = new Set(taken.filter((t) => t.date === today).map((t) => t.medId));
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');

  const submitAdd = () => {
    if (!newName.trim() || !newTime.trim()) return;
    onAddMed({ id: `m_${Date.now()}`, name: newName.trim(), time: newTime.trim() });
    setNewName('');
    setNewTime('');
    setShowAdd(false);
  };

  const submitEdit = () => {
    if (!editName.trim() || !editTime.trim()) return;
    onEditMed(showEdit.id, { ...showEdit, name: editName.trim(), time: editTime.trim() });
    setEditName('');
    setEditTime('');
    setShowEdit(null);
  };

  const handleDeleteMed = (medId) => {
    const confirmDelete = window.confirm('Deseja remover este medicamento?');
    if (confirmDelete) {
      onDeleteMed(medId);
    }
  };

  const openEdit = (med) => {
    setShowEdit(med);
    setEditName(med.name);
    setEditTime(med.time);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <TopBar title="Meus medicamentos" onBack={onBack} />
      <div className="px-5 pb-10">
        <div className="flex flex-col gap-3 mb-6">
          {meds.map((m) => {
            const done = takenToday.has(m.id);
            return (
              <div
                key={m.id}
                className="rounded-xl p-5 flex items-center justify-between shadow-sm"
                style={{ backgroundColor: C.surface, border: `1px solid ${done ? C.green : C.line}` }}
              >
                <div className="flex-1">
                  <p className="text-base font-bold" style={{ color: C.ink, fontFamily: bodyFont }}>
                    {m.name}
                  </p>
                  <p className="text-sm font-medium flex items-center gap-1 mt-1" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
                    <Moon size={14} /> {m.time}
                  </p>
                </div>
                <div className="flex flex-col gap-2 ml-2">
                  <button
                    onClick={() => onToggleTaken(m.id, done)}
                    className="rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor: done ? C.mint : C.primary,
                      color: done ? C.primary : '#fff',
                      fontFamily: headFont,
                      minWidth: 85,
                    }}
                  >
                    <CheckCircle2 size={14} /> {done ? 'Desfazer' : 'Tomei'}
                  </button>
                  <button
                    onClick={() => openEdit(m)}
                    className="rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1 justify-center"
                    style={{ backgroundColor: C.mint, color: C.primaryDark, fontFamily: headFont, minWidth: 85 }}
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteMed(m.id)}
                    className="rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1 justify-center"
                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontFamily: headFont, minWidth: 85 }}
                  >
                    <Trash2 size={12} /> Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {showAdd ? (
          <div className="rounded-xl p-5 mb-4 shadow-md" style={{ backgroundColor: C.surface, border: `2px solid ${C.primary}` }}>
            <p className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: C.ink, fontFamily: bodyFont }}>
              <Pill size={20} color={C.primary} /> Novo medicamento
            </p>
            <div className="flex flex-col gap-4 mb-5">
              <Field type="text" label="Nome do medicamento" value={newName} onChange={setNewName} placeholder="Ex: Vitamina D" icon={<Pill size={16} />} />
              <Field type="time" label="Horário de uso" value={newTime} onChange={setNewTime} placeholder="12:00" icon={<Moon size={16} />} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={submitAdd}
                className="flex-1 rounded-xl py-3 text-base font-bold"
                style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont }}
              >
                Salvar 
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-xl py-3 text-base font-bold"
                style={{ backgroundColor: C.surface, color: C.inkSoft, border: `2px solid ${C.line}`, fontFamily: headFont }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full rounded-xl py-4 mb-4 flex items-center justify-center gap-2 text-base font-bold"
            style={{ backgroundColor: C.mint, color: C.primaryDark, border: `2px dashed ${C.primary}`, fontFamily: headFont }}
          >
            <Plus size={20} /> Cadastrar mais medicamentos
          </button>
        )}

        {showEdit && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(10,20,17,0.7)' }}
            onClick={() => setShowEdit(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl p-6"
              style={{ backgroundColor: C.surface }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: headFont, color: C.ink }}>
                Editar medicamento
              </h3>
              <div className="space-y-4">
                <Field type="text" label="Nome do medicamento" value={editName} onChange={setEditName} placeholder="Ex: Vitamina D" icon={<Pill size={16} />} />
                <Field type="time" label="Horário de uso" value={editTime} onChange={setEditTime} placeholder="12:00" icon={<Moon size={16} />} />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={submitEdit}
                  className="flex-1 rounded-xl py-3 text-base font-bold"
                  style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont }}
                >
                  Salvar alterações
                </button>
                <button
                  onClick={() => setShowEdit(null)}
                  className="flex-1 rounded-xl py-3 text-base font-bold"
                  style={{ backgroundColor: C.surface, color: C.inkSoft, border: `2px solid ${C.line}`, fontFamily: headFont }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-sm font-medium leading-relaxed mt-4 p-4 rounded-lg bg-gray-100" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
          O aplicativo não prescreve, modifica dose ou recomenda medicamentos. Apenas acompanha os horários cadastrados.
        </p>
      </div>
    </div>
  );
}

// ---------- new patient modal ----------
function NewPatientModal({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [treatment, setTreatment] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !age || !treatment.trim() || !password.trim()) {
      alert('Preencha todos os campos.');
      return;
    }

    const newPatient = {
      id: `p${Date.now()}`,
      name: name.trim(),
      age: Number(age),
      treatment: treatment.trim(),
      password: password.trim(),
    };

    onSave(newPatient);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,20,17,0.7)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: headFont, color: C.ink }}>
          Cadastrar novo paciente
        </h3>
        <div className="space-y-4">
          <Field label="Nome completo" value={name} onChange={setName} placeholder="Ex: João Silva" type="text" />
          <Field label="Idade" value={age} onChange={setAge} placeholder="Ex: 45" type="number" />
          <Field label="Tratamento" value={treatment} onChange={setTreatment} placeholder="Ex: Reabilitação de ombro" type="text" />
          <Field label="Senha de acesso" value={password} onChange={setPassword} placeholder="Defina uma senha" type="password" />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl py-3 text-base font-bold"
            style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont }}
          >
            Cadastrar
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-3 text-base font-bold"
            style={{ backgroundColor: C.surface, color: C.inkSoft, border: `2px solid ${C.line}`, fontFamily: headFont }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- physio list ----------
function EditPatientModal({ patient, onSave, onCancel }) {
  const [name, setName] = useState(patient?.name || '');
  const [age, setAge] = useState(String(patient?.age || ''));
  const [treatment, setTreatment] = useState(patient?.treatment || '');
  const [password, setPassword] = useState(patient?.password || '');

  const handleSubmit = () => {
    if (!name.trim() || !age || !treatment.trim() || !password.trim()) {
      alert('Preencha todos os campos.');
      return;
    }

    onSave({
      ...patient,
      name: name.trim(),
      age: Number(age),
      treatment: treatment.trim(),
      password: password.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,20,17,0.7)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: headFont, color: C.ink }}>
          Editar paciente
        </h3>
        <div className="space-y-4">
          <Field label="Nome completo" value={name} onChange={setName} placeholder="Ex: João Silva" type="text" />
          <Field label="Idade" value={age} onChange={setAge} placeholder="Ex: 45" type="number" />
          <Field label="Tratamento" value={treatment} onChange={setTreatment} placeholder="Ex: Reabilitação de ombro" type="text" />
          <Field label="Senha de acesso" value={password} onChange={setPassword} placeholder="Defina uma senha" type="password" />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl py-3 text-base font-bold"
            style={{ backgroundColor: C.primary, color: '#fff', fontFamily: headFont }}
          >
            Salvar alterações
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-3 text-base font-bold"
            style={{ backgroundColor: C.surface, color: C.inkSoft, border: `2px solid ${C.line}`, fontFamily: headFont }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function PhysioList({ patients, entriesMap, onSelect, onLogout, onAddPatient, onEditPatient, onDeletePatient }) {

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <TopBar title="Painel do Fisioterapeuta" onLogout={onLogout} />
      <div className="px-4 md:px-6 pb-10 flex flex-col gap-4">
        {patients.map((p) => {
          const entries = entriesMap[p.id] || [];
          const latest = entries[entries.length - 1];
          const status = statusFromPain(latest ? latest.pain : 0);
          return (
            <div
              key={p.id}
              className="rounded-xl p-4 md:p-5 shadow-sm transition-all hover:shadow-md"
              style={{ backgroundColor: C.surface, border: `1px solid ${C.line}` }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <button
                  onClick={() => onSelect(p.id)}
                  className="flex-1 text-left"
                >
                  <p className="text-base md:text-lg font-bold" style={{ color: C.ink, fontFamily: bodyFont }}>
                    {p.name}
                  </p>
                  <p className="text-xs md:text-sm font-medium mt-1 flex items-center gap-1.5" style={{ color: status.color, fontFamily: bodyFont }}>
                    <span>{status.dot}</span> {status.label}
                  </p>
                </button>

                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                  <button
                    onClick={() => onEditPatient(p)}
                    className="flex-1 md:flex-none rounded-lg px-3 py-2 text-xs font-bold flex items-center justify-center gap-1"
                    style={{ backgroundColor: C.mint, color: C.primaryDark, minWidth: 80, fontFamily: headFont }}
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    onClick={() => onDeletePatient(p.id)}
                    className="flex-1 md:flex-none rounded-lg px-3 py-2 text-xs font-bold flex items-center justify-center gap-1"
                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B', minWidth: 80, fontFamily: headFont }}
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={onAddPatient}
          className="rounded-xl p-4 md:p-5 flex items-center justify-center gap-2 border-2 border-dashed transition-all hover:shadow-md"
          style={{ borderColor: C.primary, color: C.primary, backgroundColor: 'transparent' }}
        >
          <Plus size={20} className="md:w-6 md:h-6" /> <span className="text-sm md:text-base font-bold">Cadastrar novo paciente</span>
        </button>
      </div>
    </div>
  );
}

// ---------- metric detail modal (charts) ----------
function AdherenceChart({ entries, meds, taken }) {
  const data = entries.map((e) => {
    const count = taken.filter((t) => t.date === e.date).length;
    const pct = meds.length ? Math.min(100, Math.round((count / meds.length) * 100)) : 0;
    return { date: fmtDate(e.date), pct };
  });
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={C.line} strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: C.inkSoft }} />
        <YAxis tick={{ fontSize: 12, fill: C.inkSoft }} domain={[0, 100]} />
        <Tooltip formatter={(v) => `${v}%`} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
        <Bar dataKey="pct" name="Adesão" fill={C.primary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MetricModal({ metricKey, entries, meds, taken, onClose }) {
  if (!metricKey) return null;
  const meta = METRIC_META[metricKey];
  const chartData = entries.map((e) => ({ ...e, date: fmtDate(e.date) }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,20,17,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md md:max-w-xl rounded-2xl p-4 sm:p-6"
        style={{ backgroundColor: C.surface, maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: headFont, color: C.ink }} className="text-lg font-bold flex items-center gap-2">
            <BarChart2 size={20} color={C.primary} /> Análise: {meta.label}
          </h3>
          <button onClick={onClose} style={{ color: C.inkSoft, padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {metricKey === 'adherence' ? (
          <AdherenceChart entries={entries} meds={meds} taken={taken} />
        ) : metricKey === 'pa' ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={C.line} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: C.inkSoft }} />
              <YAxis tick={{ fontSize: 12, fill: C.inkSoft }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
              <Line type="monotone" dataKey="paSys" name="Sistólica" stroke={C.primary} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="paDia" name="Diastólica" stroke={C.amber} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={C.line} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: C.inkSoft }} />
              <YAxis tick={{ fontSize: 12, fill: C.inkSoft }} />
              <Tooltip formatter={(v) => (metricKey === 'sleepHours' ? fmtHM(v) : v)} />
              <Line type="monotone" dataKey={metricKey} name={meta.label} stroke={C.primary} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        <p className="text-sm font-medium mt-6 text-center" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
          Exibindo o histórico dos últimos {entries.length} dias registrados.
        </p>
        <button onClick={onClose} className="w-full mt-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold">
          Fechar
        </button>
      </div>
    </div>
  );
}

// ---------- physio report ----------
function PhysioReport({ patient, entries, meds, taken, onBack }) {
  const cur = weekStats(entries, 0);
  const prev = weekStats(entries, 7);
  const adherencePct = adherenceForRange(taken, meds, 0);
  const prevAdherencePct = adherenceForRange(taken, meds, 7);
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Análise completa com ênfase em pontos críticos
  const buildLocalAnalysis = (cur, prev, adherencePct) => {
    const alerts = [];
    
    // Análise de Dor
    const painDelta = cur.pain - prev.pain;
    if (cur.pain >= 6.5) {
      alerts.push(`🔴 ATENÇÃO: DOR ELEVADA (${cur.pain}/10) - REQUER ACOMPANHAMENTO IMEDIATO`);
    } else if (cur.pain >= 4 && cur.pain < 6.5) {
      alerts.push(`🟡 ALERTA: Dor em nível moderado (${cur.pain}/10) - Monitorar proximamente`);
    } else {
      alerts.push(`🟢 Nível de dor controlado (${cur.pain}/10)`);
    }
    
    if (painDelta > 0.3) {
      alerts.push(`⚠️ PIORA: Dor aumentou (${prev.pain} → ${cur.pain}/10)`);
    } else if (painDelta < -0.3) {
      alerts.push(`✅ MELHORA: Dor diminuiu (${prev.pain} → ${cur.pain}/10)`);
    }
    
    // Análise de Bem-estar
    if (cur.wellbeing <= 3) {
      alerts.push(`🔴 BEM-ESTAR CRÍTICO: ${cur.wellbeing}/10 - Avaliar saúde mental do paciente`);
    } else if (cur.wellbeing <= 5) {
      alerts.push(`🟡 Bem-estar baixo: ${cur.wellbeing}/10`);
    } else {
      alerts.push(`🟢 Bem-estar adequado: ${cur.wellbeing}/10`);
    }
    
    // Análise de Sono
    const sleepDelta = cur.sleepHours - prev.sleepHours;
    if (cur.sleepHours < 5) {
      alerts.push(`🔴 SONO INSUFICIENTE: ${fmtHM(cur.sleepHours)} - Fundamental aumentar repouso`);
    } else if (cur.sleepHours >= 8) {
      alerts.push(`✅ Sono adequado: ${fmtHM(cur.sleepHours)}`);
    } else {
      alerts.push(`🟡 Sono abaixo do ideal: ${fmtHM(cur.sleepHours)} (recomendado 7-8h)`);
    }
    
    if (sleepDelta < -0.5) {
      alerts.push(`⚠️ PIORA: Sono diminuiu significativamente`);
    } else if (sleepDelta > 0.5) {
      alerts.push(`✅ MELHORA: Sono aumentou`);
    }
    
    // Análise de Frequência Cardíaca
    if (cur.fc < 60 || cur.fc > 100) {
      alerts.push(`🟡 FC FORA DO NORMAL: ${cur.fc} bpm - Encaminhar para cardiologista se persistir`);
    } else {
      alerts.push(`✅ Frequência cardíaca normal: ${cur.fc} bpm`);
    }
    
    // Análise de Pressão Arterial
    if (cur.paSys >= 140 || cur.paDia >= 90) {
      alerts.push(`🔴 PRESSÃO ELEVADA: ${cur.paSys}/${cur.paDia} mmHg - RISCO CARDIOVASCULAR`);
    } else if (cur.paSys >= 130 || cur.paDia >= 85) {
      alerts.push(`🟡 Pressão arterial elevada: ${cur.paSys}/${cur.paDia} mmHg`);
    } else {
      alerts.push(`✅ Pressão arterial controlada: ${cur.paSys}/${cur.paDia} mmHg`);
    }
    
    // Análise de Oxigenação
    if (cur.spo2 < 95) {
      alerts.push(`🔴 OXIGENAÇÃO BAIXA: ${cur.spo2}% - PROCURAR ATENDIMENTO MÉDICO URGENTE`);
    } else if (cur.spo2 < 97) {
      alerts.push(`🟡 Oxigenação abaixo do ideal: ${cur.spo2}%`);
    } else {
      alerts.push(`✅ Oxigenação adequada: ${cur.spo2}%`);
    }
    
    // Análise de Adesão Medicamentosa
    if (adherencePct < 50) {
      alerts.push(`🔴 ADESÃO CRÍTICA: ${adherencePct}% - ORIENTAR PACIENTE SOBRE IMPORTÂNCIA DOS MEDICAMENTOS`);
    } else if (adherencePct < 80) {
      alerts.push(`🟡 Adesão baixa: ${adherencePct}% - Melhorar cumprimento do protocolo`);
    } else {
      alerts.push(`✅ Adesão medicamentosa adequada: ${adherencePct}%`);
    }
    
    // Análise de Atividade Física
    if (cur.steps < 3000) {
      alerts.push(`🟡 ATIVIDADE BAIXA: ${cur.steps} passos - Incentivar movimento`);
    } else if (cur.steps >= 7000) {
      alerts.push(`✅ Atividade física adequada: ${cur.steps} passos`);
    } else {
      alerts.push(`🟢 Atividade razoável: ${cur.steps} passos`);
    }
    
    // Análise Geral de Tendência
    const stabilityScore = (cur.pain === prev.pain && cur.wellbeing === prev.wellbeing && cur.sleepHours === prev.sleepHours) ? true : false;
    if (stabilityScore) {
      alerts.push(`📊 Dados estáveis em relação à semana anterior`);
    }
    
    return alerts.join('\n\n');
  };

  const [aiText, setAiText] = useState(buildLocalAnalysis(cur, prev, adherencePct));

  const summaryMetrics = [
    { key: 'fc', label: 'Frequência', value: `${cur.fc} bpm`, color: colorForMetric('fc', cur.fc) },
    { key: 'pa', label: 'Pressão', value: `${cur.paSys}/${cur.paDia} mmHg`, color: colorForMetric('paSys', cur.paSys) },
    { key: 'spo2', label: 'SpO₂', value: `${cur.spo2}%`, color: colorForMetric('spo2', cur.spo2) },
    { key: 'sleepHours', label: 'Sono', value: fmtHM(cur.sleepHours), color: colorForMetric('sleepHours', cur.sleepHours) },
    { key: 'wellbeing', label: 'Bem-estar', value: `${cur.wellbeing}/10`, color: colorForMetric('wellbeing', cur.wellbeing) },
    { key: 'pain', label: 'Dor', value: `${cur.pain}/10`, color: colorForMetric('pain', cur.pain) },
    { key: 'adherence', label: 'Adesão', value: `${adherencePct}%`, color: colorForMetric('adherence', adherencePct) },
  ];

  return (
    <>
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <TopBar title="Relatório Clínico" onBack={onBack} />
      <div className="px-5 pb-12">
        <h2 style={{ fontFamily: headFont, color: C.ink }} className="text-xl font-bold mb-1">
          {patient.name}
        </h2>
        <p className="text-sm font-medium mb-6" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
          Período: {fmtDate(daysAgoStr(6))} a {fmtDate(daysAgoStr(0))} • {patient.treatment}
        </p>

        <p className="text-sm font-bold mb-3" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
          MÉDIA DA SEMANA ATUAL (Clique para ver o gráfico)
        </p>
        <div className="rounded-xl p-2 mb-8 shadow-sm" style={{ backgroundColor: C.surface, border: `1px solid ${C.line}` }}>
          <StatRow icon={<HeartPulse size={20} />} label="Frequência média" value={`${cur.fc} bpm`} onClick={() => setSelectedMetric('fc')} />
          <StatRow icon={<Droplet size={20} />} label="PA média" value={`${cur.paSys}/${cur.paDia} mmHg`} onClick={() => setSelectedMetric('pa')} />
          <StatRow icon={<Wind size={20} />} label="SpO₂ média" value={`${cur.spo2}%`} valueColor={colorForMetric('spo2', cur.spo2)} onClick={() => setSelectedMetric('spo2')} />
          <StatRow icon={<Moon size={20} />} label="Sono médio" value={fmtHM(cur.sleepHours)} valueColor={colorForMetric('sleepHours', cur.sleepHours)} onClick={() => setSelectedMetric('sleepHours')} />
          <StatRow icon={<Smile size={20} />} label="Bem-estar médio" value={`${cur.wellbeing}/10`} valueColor={colorForMetric('wellbeing', cur.wellbeing)} onClick={() => setSelectedMetric('wellbeing')} />
          <StatRow icon={<AlertCircle size={20} />} label="Dor média" value={`${cur.pain}/10`} valueColor={colorForMetric('pain', cur.pain)} onClick={() => setSelectedMetric('pain')} />
          <StatRow icon={<Footprints size={20} />} label="Passos diários médios" value={String(cur.steps)} onClick={() => setSelectedMetric('steps')} />
          <StatRow icon={<Pill size={20} />} label="Adesão aos medicamentos" value={`${adherencePct}%`} valueColor={colorForMetric('adherence', adherencePct)} onClick={() => setSelectedMetric('adherence')} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {summaryMetrics.map((metric) => (
            <div
              key={metric.key}
              className="rounded-xl p-3 shadow-sm"
              style={{ backgroundColor: C.surface, border: `1px solid ${metric.color || C.line}` }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
                  {metric.label}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${metric.color || C.line}22`,
                    color: metric.color || C.inkSoft,
                    fontFamily: bodyFont,
                  }}
                >
                  {metric.color === C.green ? 'Ótimo' : metric.color === C.amber ? 'Alerta' : 'Monitorar'}
                </span>
              </div>
              <div className="text-lg font-bold" style={{ color: metric.color || C.ink, fontFamily: headFont }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm font-bold mb-3" style={{ color: C.inkSoft, fontFamily: bodyFont }}>
          COMPARAÇÃO (SEMANA ANTERIOR × ATUAL)
        </p>
        <div className="rounded-xl p-4 mb-8 flex flex-col gap-4 shadow-sm" style={{ backgroundColor: C.surface, border: `1px solid ${C.line}` }}>
          <TrendRow label="FC Média" from={prev.fc} to={cur.fc} unit=" bpm" onClick={() => setSelectedMetric('fc')} />
          <TrendRow label="PA sistólica" from={prev.paSys} to={cur.paSys} unit=" mmHg" onClick={() => setSelectedMetric('pa')} />
          <TrendRow label="PA diastólica" from={prev.paDia} to={cur.paDia} unit=" mmHg" onClick={() => setSelectedMetric('pa')} />
          <TrendRow
            label="Oxigenação (SpO₂)" from={prev.spo2} to={cur.spo2} unit="%" good="up"
            statusColor={colorForMetric('spo2', cur.spo2)} onClick={() => setSelectedMetric('spo2')}
          />
          <TrendRow
            label="Horas de Sono" from={prev.sleepHours} to={cur.sleepHours} good="up" format={fmtHM}
            statusColor={colorForMetric('sleepHours', cur.sleepHours)} onClick={() => setSelectedMetric('sleepHours')}
          />
          <TrendRow
            label="Índice de Bem-estar" from={prev.wellbeing} to={cur.wellbeing} unit="/10" good="up"
            statusColor={colorForMetric('wellbeing', cur.wellbeing)} onClick={() => setSelectedMetric('wellbeing')}
          />
          <TrendRow
            label="Nível de Dor" from={prev.pain} to={cur.pain} unit="/10" good="down"
            statusColor={colorForMetric('pain', cur.pain)} onClick={() => setSelectedMetric('pain')}
          />
          <TrendRow label="Passos diários (média)" from={prev.steps} to={cur.steps} good="up" onClick={() => setSelectedMetric('steps')} />
          <TrendRow
            label="Adesão Medicamentosa" from={prevAdherencePct} to={adherencePct} unit="%" good="up"
            statusColor={colorForMetric('adherence', adherencePct)} onClick={() => setSelectedMetric('adherence')}
          />
        </div>

        <div className="rounded-xl p-5 mb-6 shadow-sm" style={{ backgroundColor: C.mint, border: `1px solid ${C.primary}` }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} color={C.primary} />
            <span className="text-base font-bold" style={{ color: C.primaryDark, fontFamily: headFont }}>
              Análise de Saúde - Pontos de Atenção
            </span>
          </div>
          <div style={{ fontFamily: bodyFont }}>
            {aiText.split('\n\n').map((line, idx) => (
              <p key={idx} className="text-sm font-medium mb-3 leading-relaxed" style={{ color: C.ink }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
    <MetricModal
      metricKey={selectedMetric}
      entries={entries}
      meds={meds}
      taken={taken}
      onClose={() => setSelectedMetric(null)}
    />
    </>
  );
}

// ---------- root ----------
export default function PhysioWatchAI() {
  const [ready, setReady] = useState(false);
  const [patients, setPatients] = useState([]);
  const [entriesMap, setEntriesMap] = useState({});
  const [medsMap, setMedsMap] = useState({});
  const [takenMap, setTakenMap] = useState({});

  const [role, setRole] = useState(null);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [view, setView] = useState('login');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await ensureSeed();
        if (!Array.isArray(list) || list.length === 0) {
          throw new Error('Falha ao carregar pacientes');
        }

        const eMap = {}, mMap = {}, tMap = {};
        for (const p of list) {
          eMap[p.id] = (await safeGet(`entries:${p.id}`)) || [];
          mMap[p.id] = (await safeGet(`meds:${p.id}`)) || DEMO_MEDS;
          tMap[p.id] = (await safeGet(`medTaken:${p.id}`)) || [];
        }
        
        setPatients(list);
        setEntriesMap(eMap);
        setMedsMap(mMap);
        setTakenMap(tMap);
        setReady(true);
      } catch (error) {
        console.error('Erro ao inicializar aplicativo:', error);
        setReady(true); // Ainda assim exibe a UI mesmo com erro
      }
    })();
  }, []);

  const handleEnter = (r, patientId) => {
    setRole(r);
    if (r === 'paciente') {
      setCurrentPatientId(patientId);
      setView('patient-home');
    } else {
      setView('physio-list');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setCurrentPatientId(null);
    setView('login');
  };


  const handleAddPatient = useCallback(async (newPatient) => {
    try {
      // Validação básica
      if (!newPatient.name?.trim() || !newPatient.password?.trim() || !newPatient.age) {
        throw new Error('Dados do paciente incompletos');
      }

      const updatedList = [...patients, newPatient];
      const saved = await safeSet('patients:list', updatedList);
      
      if (!saved) {
        throw new Error('Falha ao salvar paciente');
      }

      setPatients(updatedList);

      const emptyEntries = [];
      await safeSet(`entries:${newPatient.id}`, emptyEntries);
      setEntriesMap((prev) => ({ ...prev, [newPatient.id]: emptyEntries }));

      const defaultMeds = [
        { id: `m_${Date.now()}`, name: 'Medicamento 1', time: '08:00' },
        { id: `m_${Date.now() + 1}`, name: 'Medicamento 2', time: '20:00' },
      ];
      await safeSet(`meds:${newPatient.id}`, defaultMeds);
      setMedsMap((prev) => ({ ...prev, [newPatient.id]: defaultMeds }));

      await safeSet(`medTaken:${newPatient.id}`, []);
      setTakenMap((prev) => ({ ...prev, [newPatient.id]: [] }));

      setShowNewPatientModal(false);
    } catch (error) {
      console.error('Erro ao adicionar paciente:', error);
      alert(`Erro: ${error.message}`);
    }
  }, [patients]);

  const handleEditPatient = useCallback(async (updatedPatient) => {
    try {
      if (!updatedPatient.name?.trim() || !updatedPatient.password?.trim()) {
        throw new Error('Nome e senha são obrigatórios');
      }

      const updatedList = patients.map((p) => p.id === updatedPatient.id ? updatedPatient : p);
      const saved = await safeSet('patients:list', updatedList);
      
      if (!saved) {
        throw new Error('Falha ao salvar alterações');
      }

      setPatients(updatedList);
      setEditingPatient(null);
    } catch (error) {
      console.error('Erro ao editar paciente:', error);
      alert(`Erro: ${error.message}`);
    }
  }, [patients]);

  const handleDeletePatient = useCallback(async (patientId) => {
    const confirmDelete = window.confirm('Deseja excluir este paciente e todos os dados associados? Esta ação não pode ser desfeita.');
    if (!confirmDelete) return;

    try {
      const updatedList = patients.filter((p) => p.id !== patientId);
      const saved = await safeSet('patients:list', updatedList);
      
      if (!saved) {
        throw new Error('Falha ao excluir paciente');
      }

      setPatients(updatedList);

      // Limpar dados associados
      await safeSet(`entries:${patientId}`, []);
      setEntriesMap((prev) => {
        const next = { ...prev };
        delete next[patientId];
        return next;
      });

      await safeSet(`meds:${patientId}`, []);
      setMedsMap((prev) => {
        const next = { ...prev };
        delete next[patientId];
        return next;
      });

      await safeSet(`medTaken:${patientId}`, []);
      setTakenMap((prev) => {
        const next = { ...prev };
        delete next[patientId];
        return next;
      });

      if (currentPatientId === patientId) {
        setCurrentPatientId(null);
        setView('physio-list');
      }
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      alert(`Erro ao excluir: ${error.message}`);
    }
  }, [currentPatientId, patients]);

  const handleResetPassword = useCallback(async (patientId, currentPassword, newPassword) => {
    try {
      const patient = patients.find((p) => p.id === patientId);
      
      if (!patient) {
        throw new Error('Paciente não encontrado');
      }
      
      if (patient.password !== currentPassword) {
        throw new Error('Senha atual incorreta');
      }

      const updatedList = patients.map((p) =>
        p.id === patientId ? { ...p, password: newPassword.trim() } : p
      );

      const saved = await safeSet('patients:list', updatedList);
      
      if (!saved) {
        throw new Error('Falha ao salvar nova senha');
      }

      setPatients(updatedList);
      return true;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      alert(`Erro: ${error.message}`);
      return false;
    }
  }, [patients]);

  const saveEntry = useCallback(
    async (entry) => {
      try {
        if (!currentPatientId) {
          throw new Error('Paciente não selecionado');
        }

        if (!entry.date || typeof entry.pain !== 'number') {
          throw new Error('Dados de entrada inválidos');
        }

        const id = currentPatientId;
        const existing = entriesMap[id] || [];
        const withoutToday = existing.filter((e) => e.date !== entry.date);
        const updated = [...withoutToday, entry].sort((a, b) => (a.date > b.date ? 1 : -1));
        
        const saved = await safeSet(`entries:${id}`, updated);
        
        if (!saved) {
          throw new Error('Falha ao salvar entrada');
        }

        setEntriesMap((m) => ({ ...m, [id]: updated }));
      } catch (error) {
        console.error('Erro ao salvar entrada:', error);
        alert(`Erro: ${error.message}`);
      }
    },
    [currentPatientId, entriesMap]
  );

  const addMed = useCallback(
    async (newMed) => {
      try {
        if (!currentPatientId) {
          throw new Error('Paciente não selecionado');
        }

        if (!newMed.name?.trim() || !newMed.time?.trim()) {
          throw new Error('Nome e horário do medicamento são obrigatórios');
        }

        const id = currentPatientId;
        const updated = [...(medsMap[id] || []), newMed];
        
        const saved = await safeSet(`meds:${id}`, updated);
        
        if (!saved) {
          throw new Error('Falha ao adicionar medicamento');
        }

        setMedsMap((m) => ({ ...m, [id]: updated }));
      } catch (error) {
        console.error('Erro ao adicionar medicamento:', error);
        alert(`Erro: ${error.message}`);
      }
    },
    [currentPatientId, medsMap]
  );

  const toggleMed = useCallback(
    async (medId) => {
      try {
        if (!currentPatientId) {
          throw new Error('Paciente não selecionado');
        }

        const id = currentPatientId;
        const now = new Date();
        const time = now.toTimeString().slice(0, 5);
        const updated = [...(takenMap[id] || []), { medId, date: todayStr(), time }];
        
        const saved = await safeSet(`medTaken:${id}`, updated);
        
        if (!saved) {
          throw new Error('Falha ao registrar medicamento');
        }

        setTakenMap((m) => ({ ...m, [id]: updated }));
      } catch (error) {
        console.error('Erro ao registrar medicamento:', error);
        alert(`Erro: ${error.message}`);
      }
    },
    [currentPatientId, takenMap]
  );

  const editMed = useCallback(
    async (medId, updatedMed) => {
      try {
        if (!currentPatientId) {
          throw new Error('Paciente não selecionado');
        }

        if (!updatedMed.name?.trim() || !updatedMed.time?.trim()) {
          throw new Error('Nome e horário são obrigatórios');
        }

        const id = currentPatientId;
        const updated = (medsMap[id] || []).map((m) => (m.id === medId ? updatedMed : m));
        
        const saved = await safeSet(`meds:${id}`, updated);
        
        if (!saved) {
          throw new Error('Falha ao editar medicamento');
        }

        setMedsMap((m) => ({ ...m, [id]: updated }));
      } catch (error) {
        console.error('Erro ao editar medicamento:', error);
        alert(`Erro: ${error.message}`);
      }
    },
    [currentPatientId, medsMap]
  );

  const deleteMed = useCallback(
    async (medId) => {
      try {
        if (!currentPatientId) {
          throw new Error('Paciente não selecionado');
        }

        const id = currentPatientId;
        const updated = (medsMap[id] || []).filter((m) => m.id !== medId);
        
        const saved = await safeSet(`meds:${id}`, updated);
        
        if (!saved) {
          throw new Error('Falha ao remover medicamento');
        }

        setMedsMap((m) => ({ ...m, [id]: updated }));
        
        // Remover também do histórico de tomados
        const takenUpdated = (takenMap[id] || []).filter((t) => t.medId !== medId);
        await safeSet(`medTaken:${id}`, takenUpdated);
        setTakenMap((m) => ({ ...m, [id]: takenUpdated }));
      } catch (error) {
        console.error('Erro ao remover medicamento:', error);
        alert(`Erro: ${error.message}`);
      }
    },
    [currentPatientId, medsMap, takenMap]
  );

  const toggleMedTaken = useCallback(
    async (medId, isTaken) => {
      try {
        if (!currentPatientId) {
          throw new Error('Paciente não selecionado');
        }

        const id = currentPatientId;
        const today = todayStr();
        let updated = takenMap[id] || [];

        if (isTaken) {
          // Remover (desfazer)
          updated = updated.filter((t) => !(t.medId === medId && t.date === today));
        } else {
          // Adicionar
          const now = new Date();
          const time = now.toTimeString().slice(0, 5);
          updated = [...updated, { medId, date: today, time }];
        }

        const saved = await safeSet(`medTaken:${id}`, updated);
        
        if (!saved) {
          throw new Error('Falha ao atualizar medicamento');
        }

        setTakenMap((m) => ({ ...m, [id]: updated }));
      } catch (error) {
        console.error('Erro ao atualizar medicamento:', error);
        alert(`Erro: ${error.message}`);
      }
    },
    [currentPatientId, takenMap]
  );

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <Loader2 className="animate-spin" size={32} color={C.primary} />
      </div>
    );
  }

  const wrapperStyle = { maxWidth: 480, margin: '0 auto', fontFamily: bodyFont, position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.05)' };

  if (view === 'login') {
    return (
      <div style={wrapperStyle}>
        <LoginScreen patients={patients} onEnter={handleEnter} />
      </div>
    );
  }

  const patient = patients.find((p) => p.id === currentPatientId);

  if (view === 'patient-home' && patient) {
    return (
      <div style={wrapperStyle}>
        <PatientHome
          patient={patient}
          entries={entriesMap[patient.id] || []}
          onGoEntry={() => setView('patient-entry')}
          onGoMeds={() => setView('patient-meds')}
          onLogout={handleLogout}
          onResetPassword={handleResetPassword}
        />
      </div>
    );
  }

  if (view === 'patient-entry' && patient) {
    return (
      <div style={wrapperStyle}>
        <DailyEntryForm
          patient={patient}
          onSave={saveEntry}
          onDone={() => setView('patient-home')}
          onBack={() => setView('patient-home')}
        />
      </div>
    );
  }

  if (view === 'patient-meds' && patient) {
    return (
      <div style={wrapperStyle}>
        <MedsScreen
          patient={patient}
          meds={medsMap[patient.id] || DEMO_MEDS}
          taken={takenMap[patient.id] || []}
          onToggle={toggleMed}
          onAddMed={addMed}
          onEditMed={editMed}
          onDeleteMed={deleteMed}
          onToggleTaken={toggleMedTaken}
          onBack={() => setView('patient-home')}
        />
      </div>
    );
  }

  if (view === 'physio-list') {
    return (
      <div style={wrapperStyle}>
        <PhysioList
          patients={patients}
          entriesMap={entriesMap}
          onSelect={(id) => {
            setCurrentPatientId(id);
            setView('physio-report');
          }}
          onLogout={handleLogout}
          onAddPatient={() => setShowNewPatientModal(true)}
          onEditPatient={(patient) => setEditingPatient(patient)}
          onDeletePatient={handleDeletePatient}
        />
        {showNewPatientModal && (
          <NewPatientModal
            onSave={handleAddPatient}
            onCancel={() => setShowNewPatientModal(false)}
          />
        )}
        {editingPatient && (
          <EditPatientModal
            patient={editingPatient}
            onSave={handleEditPatient}
            onCancel={() => setEditingPatient(null)}
          />
        )}
      </div>
    );
  }

  if (view === 'physio-report' && patient) {
    return (
      <div style={wrapperStyle}>
        <PhysioReport
          patient={patient}
          entries={entriesMap[patient.id] || []}
          meds={medsMap[patient.id] || DEMO_MEDS}
          taken={takenMap[patient.id] || []}
          onBack={() => setView('physio-list')}
        />
      </div>
    );
  }

  return null;
}
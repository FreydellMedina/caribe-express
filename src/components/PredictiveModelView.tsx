import React, { useState, useEffect } from 'react';
import {
  Brain, BarChart3, TreePine, Zap, AlertTriangle,
  CheckCircle2, TrendingUp, Info, ChevronRight, Loader2,
  Copy, Check, GitFork, ArrowDown, Sparkles, Workflow,
  HelpCircle, Layers, ChevronDown
} from 'lucide-react';

const API = '/api/v1';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ModelInfo {
  model: string;
  accuracy_pct: number;
  dataset_size: number;
  classes: string[];
  feature_importance: Record<string, number>;
  distribution: Record<string, number>;
  charts: {
    by_day:    Array<{dia_semana: string; nivel_demanda: string; count: number}>;
    by_hour:   Array<{rango_horario: string; nivel_demanda: string; count: number}>;
    by_volume: Array<{volumen_carga: string; nivel_demanda: string; count: number}>;
    by_type:   Array<{tipo_inmueble: string; nivel_demanda: string; count: number}>;
  };
}

interface Prediction {
  prediction: 'Alta' | 'Media' | 'Baja';
  confidence: Record<string, number>;
  recommendations: string[];
  distance_category: string;
}

interface TreeNode {
  id: number;
  is_leaf: boolean;
  depth: number;
  samples: number;
  class?: string;
  distribution?: Record<string, number>;
  feature?: string;
  feature_label?: string;
  threshold?: number;
  condition_left?: string;
  condition_right?: string;
  left?: TreeNode | null;
  right?: TreeNode | null;
}

// ─── Color helpers ───────────────────────────────────────────────────────────

const DEMAND_COLORS: Record<string, string> = {
  Alta:  '#ef4444',
  Media: '#f97316',
  Baja:  '#22c55e',
};

const DEMAND_BG: Record<string, string> = {
  Alta:  'bg-red-50 border-red-200 text-red-800',
  Media: 'bg-orange-50 border-orange-200 text-orange-800',
  Baja:  'bg-emerald-50 border-emerald-200 text-emerald-800',
};

// ─── Mini bar chart (pure CSS/SVG) ──────────────────────────────────────────

function BarChart({
  data,
  groupKey,
  title,
}: {
  data: Array<Record<string, any>>;
  groupKey: string;
  title: string;
}) {
  const groups = [...new Set(data.map((d) => d[groupKey]))];
  const levels = ['Baja', 'Media', 'Alta'];

  const pivoted = groups.map((g) => {
    const row: Record<string, any> = { label: g };
    levels.forEach((lv) => {
      const found = data.find((d) => d[groupKey] === g && d.nivel_demanda === lv);
      row[lv] = found?.count ?? 0;
    });
    row.total = levels.reduce((s, lv) => s + (row[lv] as number), 0);
    return row;
  });

  const maxTotal = Math.max(...pivoted.map((r) => r.total), 1);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</h4>
      {pivoted.map((row) => (
        <div key={row.label} className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium capitalize">{row.label.replace('_', ' ')}</span>
            <span className="text-slate-400">{row.total} registros</span>
          </div>
          <div className="flex h-5 rounded-full overflow-hidden bg-slate-100 w-full">
            {levels.map((lv) => {
              const pct = maxTotal > 0 ? (row[lv] / maxTotal) * 100 : 0;
              return pct > 0 ? (
                <div
                  key={lv}
                  style={{ width: `${pct}%`, backgroundColor: DEMAND_COLORS[lv] }}
                  title={`${lv}: ${row[lv]}`}
                  className="transition-all duration-500"
                />
              ) : null;
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-1">
        {levels.map((lv) => (
          <div key={lv} className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: DEMAND_COLORS[lv] }} />
            {lv}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature importance chart ─────────────────────────────────────────────────

function FeatureImportanceChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] ?? 1;

  const labels: Record<string, string> = {
    distancia_km:      '📏 Distancia (km)',
    volumen_carga:     '📦 Volumen de Carga',
    tipo_inmueble:     '🏠 Tipo de Inmueble',
    num_pisos:         '🏢 Pisos por Escalera',
    requiere_embalaje: '📦 Requiere Embalaje',
    dia_semana:        '📅 Día de la Semana',
    rango_horario:     '🕐 Rango Horario',
    num_auxiliares:    '👷 Auxiliares de Carga',
  };

  return (
    <div className="space-y-2">
      {entries.map(([feat, imp]) => (
        <div key={feat} className="space-y-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-700 font-medium">{labels[feat] ?? feat}</span>
            <span className="text-slate-500 font-mono">{(imp * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700"
              style={{ width: `${(imp / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const PredictiveModelView: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [predResult, setPredResult] = useState<Prediction | null>(null);
  const [predLoading, setPredLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'predictor' | 'charts' | 'tree'>('predictor');

  // Form state
  const [form, setForm] = useState({
    tipo_inmueble:     'apartamento',
    volumen_carga:     'mediano',
    distancia_km:      35,
    dia_semana:        'laboral',
    rango_horario:     'manana',
    requiere_embalaje: false,
    num_pisos:         0,
    num_auxiliares:    0,
  });

  useEffect(() => {
    fetch(`${API}/predictions/info`)
      .then((r) => r.json())
      .then((d) => { setModelInfo(d); setLoading(false); })
      .catch(() => { setError('No se pudo conectar con el modelo predictivo. Asegúrate de que el backend esté corriendo.'); setLoading(false); });
  }, []);

  const handlePredict = async () => {
    setPredLoading(true);
    setPredResult(null);
    try {
      const res = await fetch(`${API}/predictions/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setPredResult(data);
    } catch {
      setError('Error al realizar la predicción.');
    } finally {
      setPredLoading(false);
    }
  };

  const setF = (key: string, val: any) => setForm((prev) => ({ ...prev, [key]: val }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Cargando modelo predictivo J48...</p>
        </div>
      </div>
    );
  }

  if (error && !modelInfo) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-sm text-red-700 font-medium">{error}</p>
        <p className="text-xs text-red-500">Verifica que el backend FastAPI esté activo en el puerto 8000.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B1E48] to-slate-900 text-white rounded-3xl p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Modelo Predictivo de Demanda
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Clasifica solicitudes de mudanza en <strong>Baja / Media / Alta</strong> demanda usando un árbol de decisión entrenado con {modelInfo?.dataset_size} registros de la Región Caribe.
            </p>
          </div>
          {/* Stats cards */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center border border-white/10">
              <p className="text-2xl font-bold text-orange-400">{modelInfo?.accuracy_pct}%</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Accuracy CV-10</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center border border-white/10">
              <p className="text-2xl font-bold text-blue-400">{modelInfo?.dataset_size}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Registros train</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center border border-white/10">
              <p className="text-2xl font-bold text-emerald-400">{modelInfo?.features?.length}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Variables</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: 'predictor', label: '🔮 Predictor Interactivo' },
          { key: 'charts',    label: '📊 Análisis de Datos' },
          { key: 'tree',      label: '🌳 Árbol de Decisión' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PREDICTOR INTERACTIVO */}
      {activeTab === 'predictor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Parámetros de la Solicitud</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresa las características de la mudanza para clasificarla.
              </p>
            </div>

            {/* Tipo inmueble */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">🏠 Tipo de Inmueble</label>
              <div className="grid grid-cols-3 gap-2">
                {['apartamento','casa','bodega'].map((t) => (
                  <button key={t} type="button"
                    onClick={() => setF('tipo_inmueble', t)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 capitalize transition-all ${
                      form.tipo_inmueble === t
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Volumen */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">📦 Volumen de Carga</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'pequeño',  label: 'Pequeño',  sub: '< 15 m³' },
                  { key: 'mediano',  label: 'Mediano',  sub: '15–35 m³' },
                  { key: 'grande',   label: 'Grande',   sub: '> 35 m³' },
                ].map((v) => (
                  <button key={v.key} type="button"
                    onClick={() => setF('volumen_carga', v.key)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all text-center ${
                      form.volumen_carga === v.key
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="block font-bold">{v.label}</span>
                    <span className="text-[10px] opacity-70">{v.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Distancia */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                📏 Distancia estimada: <span className="text-orange-600 font-bold">{form.distancia_km} km</span>
              </label>
              <input
                type="range" min={2} max={180} step={1}
                value={form.distancia_km}
                onChange={(e) => setF('distancia_km', Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>2 km (local)</span><span>90 km (zonal)</span><span>180 km (intermunicipal)</span>
              </div>
            </div>

            {/* Día + Horario */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">📅 Día de la semana</label>
                <div className="space-y-1.5">
                  {[
                    { key: 'laboral',        label: '🗓 Día laboral' },
                    { key: 'fin_de_semana',  label: '🏖 Fin de semana' },
                  ].map((d) => (
                    <button key={d.key} type="button"
                      onClick={() => setF('dia_semana', d.key)}
                      className={`w-full py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        form.dia_semana === d.key
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >{d.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">🕐 Rango horario</label>
                <div className="space-y-1.5">
                  {[
                    { key: 'manana', label: '☀️ Mañana' },
                    { key: 'tarde',  label: '🌤 Tarde' },
                    { key: 'noche',  label: '🌙 Noche' },
                  ].map((h) => (
                    <button key={h.key} type="button"
                      onClick={() => setF('rango_horario', h.key)}
                      className={`w-full py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        form.rango_horario === h.key
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >{h.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pisos, Auxiliares, Embalaje */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">🏢 Pisos</label>
                <input type="number" min={0} max={20} value={form.num_pisos}
                  onChange={(e) => setF('num_pisos', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">👷 Auxiliares</label>
                <input type="number" min={0} max={6} value={form.num_auxiliares}
                  onChange={(e) => setF('num_auxiliares', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">📦 Embalaje</label>
                <button type="button"
                  onClick={() => setF('requiere_embalaje', !form.requiere_embalaje)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    form.requiere_embalaje
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >{form.requiere_embalaje ? '✅ Sí' : 'No'}</button>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={predLoading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 text-sm"
            >
              {predLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculando...</>
                : <><Zap className="w-4 h-4" /> Predecir Nivel de Demanda</>
              }
            </button>
          </div>

          {/* Result panel */}
          <div className="space-y-4">
            {predResult ? (
              <>
                <div className={`rounded-2xl border-2 p-6 ${DEMAND_BG[predResult.prediction]}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Nivel de Demanda Predicho</p>
                      <h3 className="text-4xl font-black mt-1">{predResult.prediction}</h3>
                    </div>
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
                      style={{ backgroundColor: `${DEMAND_COLORS[predResult.prediction]}22` }}
                    >
                      {predResult.prediction === 'Alta' ? '🔴' : predResult.prediction === 'Media' ? '🟠' : '🟢'}
                    </div>
                  </div>
                  <p className="text-xs opacity-70">
                    Categoría de distancia: <strong>{predResult.distance_category}</strong>
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Probabilidades por Clase</h4>
                  {Object.entries(predResult.confidence)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cls, pct]) => (
                      <div key={cls} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span style={{ color: DEMAND_COLORS[cls] }}>{cls}</span>
                          <span className="text-slate-600">{pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: DEMAND_COLORS[cls],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    💡 Recomendaciones Operativas
                  </h4>
                  <div className="space-y-2">
                    {predResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 rounded-xl p-3">
                        <ChevronRight className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center gap-4 text-center h-full min-h-[300px]">
                <Brain className="w-12 h-12 text-slate-200" />
                <p className="text-sm font-medium text-slate-400">
                  Configura los parámetros y presiona<br />
                  <strong className="text-orange-500">Predecir Nivel de Demanda</strong>
                </p>
                <p className="text-xs text-slate-300">
                  El árbol J48 evaluará las bifurcaciones y<br />clasificará la solicitud en tiempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANÁLISIS DE DATOS */}
      {activeTab === 'charts' && modelInfo && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Baja','Media','Alta'] as const).map((lv) => {
              const count = modelInfo.distribution[lv] ?? 0;
              const pct   = ((count / modelInfo.dataset_size) * 100).toFixed(1);
              return (
                <div key={lv} className={`rounded-2xl border-2 p-5 ${DEMAND_BG[lv]}`}>
                  <p className="text-xs font-bold opacity-60 uppercase">Demanda {lv}</p>
                  <p className="text-3xl font-black mt-1">{count}</p>
                  <p className="text-sm opacity-70">{pct}% del dataset</p>
                  <div className="mt-3 h-1.5 rounded-full bg-current opacity-20">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: DEMAND_COLORS[lv] }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <BarChart data={modelInfo.charts.by_day} groupKey="dia_semana" title="Demanda por Día de la Semana" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <BarChart data={modelInfo.charts.by_hour} groupKey="rango_horario" title="Demanda por Rango Horario" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <BarChart data={modelInfo.charts.by_volume} groupKey="volumen_carga" title="Demanda por Volumen de Carga" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <BarChart data={modelInfo.charts.by_type} groupKey="tipo_inmueble" title="Demanda por Tipo de Inmueble" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900">Importancia de Variables (Gini Importance)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Qué tanto contribuye cada variable al poder discriminante del árbol de decisión.
            </p>
            <FeatureImportanceChart data={modelInfo.feature_importance} />
          </div>
        </div>
      )}

      {/* TAB 3: ÁRBOL DE DECISIÓN ENRIQUECIDO */}
      {activeTab === 'tree' && (
        <TreeRulesPanel />
      )}

      {/* Footer info */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Algoritmo: <strong>DecisionTreeClassifier (Gini)</strong> — equivalente a J48 de Weka</span>
        </div>
        <span>·</span>
        <span>Validación: <strong>10-fold Cross-Validation</strong></span>
        <span>·</span>
        <span>Accuracy: <strong className="text-orange-600">{modelInfo?.accuracy_pct}%</strong></span>
        <span>·</span>
        <span>Dataset: <strong>{modelInfo?.dataset_size} registros sintéticos</strong> — Región Caribe, Colombia</span>
      </div>
    </div>
  );
};

// ─── Visual Tree Node Component ──────────────────────────────────────────────

function TreeNodeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  if (node.is_leaf) {
    const cls = node.class || 'Media';
    const bgClass = cls === 'Alta' ? 'bg-red-50 border-red-300 text-red-900' : cls === 'Media' ? 'bg-orange-50 border-orange-300 text-orange-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900';
    const dotColor = cls === 'Alta' ? 'bg-red-500' : cls === 'Media' ? 'bg-orange-500' : 'bg-emerald-500';

    return (
      <div className={`p-3.5 rounded-2xl border-2 shadow-xs transition-all ${bgClass} w-full max-w-xs space-y-1.5`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Decisión Final (Hoja)</span>
          <span className="flex items-center gap-1 text-[11px] font-bold">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            {cls}
          </span>
        </div>
        <p className="text-sm font-black">Demanda {cls}</p>
        <div className="text-[10px] opacity-75 flex items-center justify-between pt-1 border-t border-current/10">
          <span>{node.samples} casos evaluados</span>
          <span>Nivel {depth}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full space-y-3">
      {/* Split Node Card */}
      <div className="bg-white border-2 border-slate-300 hover:border-orange-400 rounded-2xl p-4 shadow-sm w-full max-w-sm space-y-2 text-center transition-all">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
          <GitFork className="w-3 h-3 text-orange-500" />
          <span>Condición de Decisión · Nivel {depth}</span>
        </div>
        <h4 className="text-sm font-bold text-slate-900">
          ¿{node.feature_label}?
        </h4>
        <div className="text-xs font-mono font-bold text-orange-600 bg-orange-50 py-1 px-2.5 rounded-lg border border-orange-200/60 inline-block">
          Corte: {node.threshold}
        </div>
        <div className="text-[10px] text-slate-400 pt-1">
          {node.samples} solicitudes analizadas en este punto
        </div>
      </div>

      {/* Children Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-2">
        {/* Left Branch: Condición Sí / Menor o igual */}
        <div className="flex flex-col items-center space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-dashed border-slate-200">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
            <span>← {node.condition_left}</span>
          </div>
          {node.left && <TreeNodeView node={node.left} depth={depth + 1} />}
        </div>

        {/* Right Branch: Condición No / Mayor */}
        <div className="flex flex-col items-center space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-dashed border-slate-200">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
            <span>{node.condition_right} →</span>
          </div>
          {node.right && <TreeNodeView node={node.right} depth={depth + 1} />}
        </div>
      </div>
    </div>
  );
}

// ─── Tree Rules Panel Enriquecido ────────────────────────────────────────────

function TreeRulesPanel() {
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [subView, setSubView]   = useState<'diagram' | 'workflow' | 'simulator' | 'rules'>('diagram');
  const [copied, setCopied]     = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<number>(0);

  useEffect(() => {
    fetch(`${API}/predictions/tree-rules`)
      .then((r) => r.json())
      .then((d) => { setTreeData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (treeData?.rules) {
      navigator.clipboard.writeText(treeData.rules);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Cargando visualización del árbol de decisión...</p>
        </div>
      </div>
    );
  }

  // Escenarios didácticos para simular en vivo
  const scenarios = [
    {
      title: 'Mudanza Casa Grande en Fin de Semana',
      icon: '🏖️',
      params: 'Casa · 40 m³ · 85 km · Domingo · Mañana · 3 pisos · 2 auxiliares',
      path: [
        { step: '1. Evaluación de Volumen', test: 'Volumen de Carga = Grande (> 35 m³)', pass: true, detail: 'Supera el umbral inicial de alta capacidad.' },
        { step: '2. Evaluación de Escalera', test: 'Pisos por Escalera = 3 > 1.5', pass: true, detail: 'Incrementa la complejidad física del traslado.' },
        { step: '3. Día y Distancia', test: 'Fin de semana + Distancia interzonal (85 km)', pass: true, detail: 'Alta concurrencia en carreteras del Caribe.' },
      ],
      result: 'Alta',
      action: 'Asignar Camión Turbo o Doble Troque + 2 auxiliares con reserva anticipada.',
    },
    {
      title: 'Apartamento Céntrico con Ascensor',
      icon: '🏢',
      params: 'Apartamento · 20 m³ · 12 km · Miércoles · Tarde · 0 pisos (ascensor) · 1 auxiliar',
      path: [
        { step: '1. Evaluación de Volumen', test: 'Volumen de Carga = Mediano (15-35 m³)', pass: true, detail: 'Carga estándar residencial.' },
        { step: '2. Evaluación de Escalera', test: 'Pisos por Escalera = 0 ≤ 1.5', pass: true, detail: 'Edificio cuenta con ascensor de carga.' },
        { step: '3. Día y Distancia', test: 'Día laboral + Trayecto local (12 km)', pass: true, detail: 'Operación rápida sin picos de congestión.' },
      ],
      result: 'Media',
      action: 'Asignar Furgón mediano de 3.5T. Concurrencia moderada.',
    },
    {
      title: 'Flete Rápido de Apartaestudio',
      icon: '📦',
      params: 'Apartamento · 8 m³ · 5 km · Martes · Mañana · 1 piso · 0 auxiliares',
      path: [
        { step: '1. Evaluación de Volumen', test: 'Volumen de Carga = Pequeño (< 15 m³)', pass: true, detail: 'Carga ligera de muebles esenciales.' },
        { step: '2. Evaluación de Escalera', test: 'Pisos = 1 ≤ 1.5', pass: true, detail: 'Fácil acceso en primer piso.' },
        { step: '3. Día y Distancia', test: 'Día laboral + Recorrido urbano corto (5 km)', pass: true, detail: 'Horario despejado con amplia flota disponible.' },
      ],
      result: 'Baja',
      action: 'Asignar Camioneta Pick-up con estacas. Tarifa económica estándar.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Principales del Árbol */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-xs">
          <p className="text-2xl font-black text-slate-900">{treeData?.depth ?? 5}</p>
          <p className="text-xs text-slate-500 mt-0.5">Profundidad del Árbol</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-xs">
          <p className="text-2xl font-black text-orange-600">{treeData?.n_leaves ?? 26}</p>
          <p className="text-xs text-slate-500 mt-0.5">Hojas de Decisión (Leaves)</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-xs">
          <p className="text-2xl font-black text-blue-600">{treeData?.n_features ?? 8}</p>
          <p className="text-xs text-slate-500 mt-0.5">Variables Predictoras</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-xs">
          <p className="text-2xl font-black text-emerald-600">{treeData?.accuracy_pct ?? 73.8}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Precisión 10-Fold CV</p>
        </div>
      </div>

      {/* Selector de Modos de Visualización */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubView('diagram')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subView === 'diagram'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            Diagrama del Árbol
          </button>

          <button
            onClick={() => setSubView('workflow')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subView === 'workflow'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            ¿Cómo Trabaja el Modelo?
          </button>

          <button
            onClick={() => setSubView('simulator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subView === 'simulator'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulador de Casos
          </button>

          <button
            onClick={() => setSubView('rules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subView === 'rules'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            Reglas Weka J48
          </button>
        </div>

        {subView === 'rules' && (
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar para Weka'}</span>
          </button>
        )}
      </div>

      {/* SUB-VISTA 1: DIAGRAMA GRÁFICO DEL ÁRBOL */}
      {subView === 'diagram' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm overflow-x-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
              <TreePine className="w-3.5 h-3.5" />
              Estructura Jerárquica del Árbol de Clasificación
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Nodos de Decisión y Bifurcaciones Lógicas
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Visualiza cómo el modelo evalúa cada atributo para filtrar las solicitudes de mudanza hacia la categoría de demanda correspondiente.
            </p>
          </div>

          {treeData?.hierarchy ? (
            <div className="py-4 flex justify-center min-w-[650px]">
              <TreeNodeView node={treeData.hierarchy} depth={0} />
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Estructura jerárquica no disponible.
            </div>
          )}
        </div>
      )}

      {/* SUB-VISTA 2: CÓMO TRABAJA EL MODELO (WORKFLOW) */}
      {subView === 'workflow' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div>
              <span className="text-orange-500 font-bold text-xs uppercase tracking-wider">Metodología de Minería de Datos</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                ¿Cómo toma decisiones el algoritmo J48 en Caribe Express?
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                El algoritmo divide sucesivamente el espacio de solicitudes utilizando el criterio de <strong>Gain Ratio / Gini</strong> para encontrar la regla más discriminante en cada nivel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Ingreso de la Solicitud</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Se reciben los 8 atributos de la mudanza: Tipo de Inmueble, Volumen en m³, Distancia en km, Día, Horario, Embalaje, Pisos y Auxiliares.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Cálculo de Pureza (Gini)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El árbol evalúa qué variable divide mejor las clases. El <strong>Volumen de Carga</strong> y los <strong>Pisos por Escalera</strong> demostraron la mayor ganancia de información.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Filtrado por Ramas</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  La solicitud desciende por el árbol comparando valores contra los umbrales de corte (ej. ¿Distancia &gt; 50 km? ¿Fin de semana?).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  04
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Inferencia y Despacho</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Alcanza un nodo hoja que asigna el nivel: <strong>Baja, Media o Alta</strong>, activando recomendaciones de flota vehicular y tarifas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VISTA 3: SIMULADOR DE CASOS EN VIVO */}
      {subView === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div>
              <span className="text-orange-500 font-bold text-xs uppercase tracking-wider">Simulación Interactiva</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Recorrido de Casos en el Árbol
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Selecciona uno de los escenarios reales de mudanzas en la Costa Caribe para ver cómo el árbol toma la decisión paso a paso.
              </p>
            </div>

            {/* Selector de escenarios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scenarios.map((sc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedScenario(idx)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedScenario === idx
                      ? 'border-orange-500 bg-orange-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{sc.icon}</span>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">{sc.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{sc.params}</p>
                </button>
              ))}
            </div>

            {/* Trazabilidad paso a paso */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Trayectoria de Decisión:</span>
                  <span className="text-orange-600">{scenarios[selectedScenario].title}</span>
                </h4>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${DEMAND_BG[scenarios[selectedScenario].result]}`}>
                  Resultado: Demanda {scenarios[selectedScenario].result}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {scenarios[selectedScenario].path.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                      ✓
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900">{p.step}: </span>
                      <span className="font-mono text-orange-600 font-semibold">{p.test}</span>
                      <p className="text-slate-500 text-[11px]">{p.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-orange-500 text-white rounded-xl text-xs space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-orange-200 block">Acción Logística Asignada por el Sistema:</span>
                <p className="font-medium">{scenarios[selectedScenario].action}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VISTA 4: REGLAS WEKA J48 COMPLETAS */}
      {subView === 'rules' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TreePine className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Reglas del Árbol de Decisión (Formato Weka J48)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Estructura de reglas entrenadas y evaluadas mediante validación cruzada (10-fold cross validation).
              </p>
            </div>
          </div>

          <pre className="bg-slate-900 text-emerald-400 text-[11px] font-mono p-6 rounded-2xl overflow-x-auto leading-relaxed border border-slate-800 shadow-inner max-h-[500px]">
            {treeData?.rules || 'Cargando reglas...'}
          </pre>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <p className="font-bold">Compatibilidad con el Proyecto de Aula:</p>
              <p className="text-[11px] mt-0.5 text-blue-700 leading-relaxed">
                Estas reglas corresponden al árbol generado con el algoritmo <strong>J48 de Weka</strong> (C4.5 / DecisionTree) propuesto por Freydel Medina, Nicolás Suárez y Miguel Ángel Cumplido. Puedes copiar el texto superior e incluirlo directamente en los anexos de tu informe académico.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, Euro, Plus, Trash2, Save, LogOut, Home, 
  LayoutDashboard, CheckCircle2, Clock, ChevronRight, Hammer, 
  Zap, ShieldCheck, Wrench, Construction, CookingPot, ShowerHead,
  Building2, RefreshCw, PlusCircle, Percent, FileText, TrendingUp,
  GripVertical, X, Menu, TableProperties, Layout, ArrowUpRight,
  ArrowDownRight, BarChart3, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../utils/supabase';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const ICON_MAP = {
  Home, ShowerHead, CookingPot, Construction, Building2, Wrench,
  Zap, CheckCircle2, ShieldCheck, Hammer, Percent
};

// ─── Sortable Row Component ──────────────────────────────────────────────────
const SortableProjectItem = ({ p, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const Icon = ICON_MAP[p.icon] || Home;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="p-6 bg-white/5 border border-white/5 hover:border-primary/20 transition-all group relative flex items-center gap-6">
      <button {...attributes} {...listeners} className="text-white/10 hover:text-primary cursor-grab active:cursor-grabbing transition-all shrink-0">
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-10 h-10 bg-dark/50 border border-white/5 flex items-center justify-center text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={p.name}
          onChange={(e) => onUpdate('project_types', p.id, 'name', e.target.value)}
          className="bg-dark/40 border border-white/10 p-2 text-sm font-black uppercase italic text-white outline-none focus:border-primary/40 w-full"
        />
        <select
          value={p.base_price_type || 'm2'}
          onChange={(e) => onUpdate('project_types', p.id, 'base_price_type', e.target.value)}
          className="bg-dark/40 border border-white/10 p-2 text-xs font-black uppercase tracking-widest text-primary outline-none"
        >
          <option value="m2">Por m²</option>
          <option value="fixed">Precio Único</option>
        </select>
      </div>
      <button onClick={() => onDelete('project_types', p.id)} className="text-white/5 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Analytics Helpers ───────────────────────────────────────────────────────
const getMonthlyData = (leads) => {
  const months = {};
  leads.forEach(l => {
    const d = new Date(l.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { month: key, leads: 0, volume: 0 };
    months[key].leads++;
    months[key].volume += l.estimated_total || 0;
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-8);
};

const getProjectDistribution = (leads) => {
  const dist = {};
  leads.forEach(l => {
    const k = l.project_type?.replace(/_/g, ' ') || 'otro';
    if (!dist[k]) dist[k] = { name: k, count: 0 };
    dist[k].count++;
  });
  return Object.values(dist).sort((a, b) => b.count - a.count);
};

const CHART_COLORS = ['#F5C518', '#f5c51880', '#ffffff30'];

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-primary/20 p-4 text-xs">
      <p className="text-primary font-black uppercase tracking-widest mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white/80 font-bold">
          {p.name}: <span className="text-primary">{typeof p.value === 'number' && p.value > 1000 ? `${p.value.toLocaleString()}€` : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Main Admin Component ────────────────────────────────────────────────────
const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Data
  const [leads, setLeads] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [extras, setExtras] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [qualitySettings, setQualitySettings] = useState([]);
  const [housingSettings, setHousingSettings] = useState([]);
  const [globalSettings, setGlobalSettings] = useState([]);

  // UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [savingId, setSavingId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [leadsRes, pricingRes, extrasRes, projectsRes, qualityRes, housingRes, globalRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('pricing_config').select('*'),
        supabase.from('extras').select('*'),
        supabase.from('project_types').select('*').order('display_order'),
        supabase.from('quality_settings').select('*'),
        supabase.from('housing_settings').select('*'),
        supabase.from('global_settings').select('*'),
      ]);
      if (leadsRes.data) setLeads(leadsRes.data);
      if (pricingRes.data) setPricing(pricingRes.data);
      if (extrasRes.data) setExtras(extrasRes.data);
      if (projectsRes.data) setProjectTypes(projectsRes.data);
      if (qualityRes.data) setQualitySettings(qualityRes.data);
      if (housingRes.data) setHousingSettings(housingRes.data);
      if (globalRes.data) setGlobalSettings(globalRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (table, id, field, value) => {
    setSavingId(`${table}-${id}-${field}`);
    const { error } = await supabase.from(table).update({ [field]: value }).eq('id', id);
    if (!error) { await fetchAllData(); setTimeout(() => setSavingId(null), 1000); }
  };

  const handleDelete = async (table, id) => {
    if (confirm('¿Eliminar este registro?')) {
      await supabase.from(table).delete().eq('id', id);
      fetchAllData();
    }
  };

  const handleToggleExtraProject = (extra, projectId) => {
    const current = extra.project_types || [];
    const has = current.some(id => String(id) === String(projectId));
    const updated = has ? current.filter(id => String(id) !== String(projectId)) : [...current, String(projectId)];
    setExtras(prev => prev.map(e => e.id === extra.id ? { ...e, project_types: updated } : e));
    handleUpdate('extras', extra.id, 'project_types', updated);
  };

  const handleAddExtra = async () => {
    const name = prompt('Nombre del nuevo servicio extra:');
    if (!name) return;
    await supabase.from('extras').insert([{ id: name.toLowerCase().replace(/\s+/g, '_'), name, price: 1000, category: 'General', project_types: projectTypes.map(p => p.id) }]);
    fetchAllData();
  };

  const exportLeads = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Proyecto', 'M2', 'Vivienda', 'Total €', 'Estado', 'Fecha'];
    const rows = filteredLeads.map(l => [l.name, l.email, l.phone, l.project_type, l.m2, l.vivienda, l.estimated_total, l.status || 'nuevo', new Date(l.created_at).toLocaleDateString()]);
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `leads_conscugar_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Drag & Drop handler
  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = projectTypes.findIndex(p => p.id === active.id);
    const newIdx = projectTypes.findIndex(p => p.id === over.id);
    const reordered = arrayMove(projectTypes, oldIdx, newIdx);
    setProjectTypes(reordered);
    // Save new order to DB
    await Promise.all(reordered.map((p, i) =>
      supabase.from('project_types').update({ display_order: i + 1 }).eq('id', p.id)
    ));
  };

  const filteredLeads = leads.filter(l => {
    const s = searchTerm.toLowerCase();
    const match = l.name?.toLowerCase().includes(s) || l.email?.toLowerCase().includes(s) || l.phone?.includes(s);
    const st = statusFilter === 'all' || l.status === statusFilter;
    return match && st;
  });

  const monthlyData = getMonthlyData(leads);
  const distData = getProjectDistribution(leads);
  const totalVolume = leads.reduce((a, l) => a + (l.estimated_total || 0), 0);
  const avgTicket = leads.length > 0 ? Math.round(totalVolume / leads.length) : 0;
  const thisMonth = leads.filter(l => new Date(l.created_at).getMonth() === new Date().getMonth()).length;

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'CRM Leads', icon: Users },
    { id: 'projects', label: 'Proyectos', icon: Layout },
    { id: 'extras', label: 'Extras', icon: PlusCircle },
    { id: 'pricing', label: 'Precios', icon: TableProperties },
    { id: 'settings', label: 'Ajustes Motor', icon: Settings },
  ];

  return (
    <div className="flex bg-dark min-h-screen text-white font-outfit relative">

      {/* Mobile Backdrop */}
      {isMenuOpen && (
        <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#080808] border-r border-white/5 flex flex-col z-[70] transition-transform duration-500 lg:relative lg:translate-x-0 lg:z-0",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <span className="text-xl font-black tracking-tighter uppercase italic">Con<span className="text-primary">scugar</span> <span className="text-[10px] bg-primary text-dark px-2 py-1 ml-2 not-italic font-black">ADM</span></span>
          <button onClick={() => setIsMenuOpen(false)} className="lg:hidden text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all group rounded-none",
                activeTab === tab.id
                  ? "bg-primary text-dark"
                  : "text-white/30 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={cn("w-4 h-4 shrink-0", activeTab === tab.id ? "text-dark" : "text-primary")} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Sistema Activo</span>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-dark flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2"><Menu className="w-6 h-6 text-primary" /></button>
          <span className="text-sm font-black uppercase tracking-tighter italic">C S G <span className="text-primary">ADM</span></span>
          <div className="w-6" />
        </header>

        <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-10">

          {/* Header row */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] block mb-1">{TABS.find(t => t.id === activeTab)?.label}</span>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                {activeTab === 'dashboard' ? 'Centro de Mando' : TABS.find(t => t.id === activeTab)?.label}
              </h1>
            </div>
            <Button variant="ghost" onClick={fetchAllData} className="text-white/20 hover:text-white text-xs">
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> Sincronizar
            </Button>
          </div>

          {/* ═══════════════ DASHBOARD TAB ═══════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Leads Totales', value: leads.length, icon: Users, suffix: '', sub: `${thisMonth} este mes`, up: thisMonth > 0 },
                  { label: 'Volumen Potencial', value: totalVolume.toLocaleString(), icon: Euro, suffix: '€', sub: 'Presupuesto acumulado', up: true },
                  { label: 'Ticket Medio', value: avgTicket.toLocaleString(), icon: TrendingUp, suffix: '€', sub: 'Por valoración', up: true },
                  { label: 'Tipos de Obra', value: projectTypes.length, icon: BarChart3, suffix: '', sub: 'Activos en calculadora', up: true },
                ].map((kpi, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 p-6 relative overflow-hidden group hover:border-primary/20 transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{kpi.label}</p>
                      <kpi.icon className="w-4 h-4 text-primary/40" />
                    </div>
                    <p className="text-3xl font-black italic text-white leading-none mb-2">{kpi.value}<span className="text-primary text-xl ml-1">{kpi.suffix}</span></p>
                    <div className="flex items-center gap-2">
                      {kpi.up ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-red-400" />}
                      <p className="text-[9px] text-white/20 font-bold uppercase">{kpi.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart - Evolución */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary">Evolución Mensual</p>
                      <p className="text-sm font-black uppercase text-white/60 italic">Leads & Volumen económico</p>
                    </div>
                    <Activity className="w-5 h-5 text-primary/30" />
                  </div>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="gradVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F5C518" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.08} />
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#ffffff30', fontWeight: 900 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 8, fill: '#F5C51880', fontWeight: 900 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8, fill: '#ffffff30', fontWeight: 900 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area yAxisId="left" type="monotone" dataKey="volume" name="Volumen €" stroke="#F5C518" strokeWidth={2} fill="url(#gradVolume)" />
                        <Area yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke="#ffffff40" strokeWidth={1} fill="url(#gradLeads)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center">
                      <p className="text-white/10 text-xs font-black uppercase tracking-widest">Sin datos aún</p>
                    </div>
                  )}
                </div>

                {/* Bar Chart - Distribución por Obra */}
                <div className="bg-white/[0.02] border border-white/5 p-6 space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary">Distribución</p>
                    <p className="text-sm font-black uppercase text-white/60 italic">Por tipo de obra</p>
                  </div>
                  {distData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={distData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 8, fill: '#ffffff30', fontWeight: 900 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: '#ffffff40', fontWeight: 900 }} width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Leads" radius={[0, 2, 2, 0]}>
                          {distData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? '#F5C518' : '#F5C51830'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center">
                      <p className="text-white/10 text-xs font-black uppercase tracking-widest">Sin datos aún</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Leads mini table */}
              <div className="bg-white/[0.02] border border-white/5 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary">Leads Recientes</p>
                  <button onClick={() => setActiveTab('leads')} className="text-[9px] font-black text-white/20 hover:text-primary transition-all uppercase tracking-widest flex items-center gap-1">Ver todos <ChevronRight className="w-3 h-3" /></button>
                </div>
                <div className="space-y-2">
                  {leads.slice(0, 5).map(l => (
                    <div key={l.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black">{l.name?.[0]}</div>
                        <div>
                          <p className="text-xs font-black text-white uppercase">{l.name}</p>
                          <p className="text-[9px] text-white/30">{l.project_type?.replace(/_/g,' ')} · {l.m2}m²</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary italic">{l.estimated_total?.toLocaleString()}€</p>
                        <p className="text-[9px] text-white/20">{new Date(l.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ LEADS TAB ═══════════════ */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1 w-full">
                  <input
                    placeholder="Buscar por nombre, email o móvil..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/5 p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-primary/40"
                  />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-white/5 border border-white/5 p-4 text-[10px] font-black uppercase tracking-widest outline-none"
                  >
                    <option value="all">Todos</option>
                    <option value="nuevo">Nuevos</option>
                    <option value="contactado">Contactados</option>
                    <option value="cerrado">Cerrados</option>
                    <option value="perdido">Perdidos</option>
                  </select>
                </div>
                <Button variant="outline" onClick={exportLeads} className="whitespace-nowrap px-8 py-4 border-white/10 hover:border-primary text-xs font-black tracking-widest">
                  <FileText className="w-4 h-4 mr-2" /> CSV
                </Button>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Registros', value: filteredLeads.length, color: 'text-white' },
                  { label: 'Potencial', value: `${filteredLeads.reduce((a, c) => a + (c.estimated_total || 0), 0).toLocaleString()}€`, color: 'text-primary' },
                  { label: 'Ticket Medio', value: `${filteredLeads.length > 0 ? Math.round(filteredLeads.reduce((a, c) => a + (c.estimated_total || 0), 0) / filteredLeads.length).toLocaleString() : 0}€`, color: 'text-white' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                    <p className="text-[9px] font-black uppercase text-white/20">{s.label}</p>
                    <p className={cn("text-2xl font-black italic mt-1", s.color)}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Lead Cards */}
              <div className="space-y-4">
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="glass-card p-6 border border-white/5 hover:border-primary/20 transition-all space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary uppercase text-lg">{lead.name?.[0]}</div>
                        <div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-white">{lead.name}</h3>
                          <p className="text-xs text-white/40">{lead.email} · <span className="text-primary font-bold">{lead.phone}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{new Date(lead.created_at).toLocaleDateString()}</p>
                        <p className="text-3xl font-black text-primary italic leading-none mt-1">{lead.estimated_total?.toLocaleString()}€</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 py-4 border-y border-white/5 bg-white/[0.02] px-4 -mx-4">
                      {[
                        ['Proyecto', lead.project_type?.replace(/_/g, ' ')],
                        ['Superficie', `${lead.m2} m²`],
                        ['Vivienda', lead.vivienda],
                      ].map(([k, v]) => (
                        <div key={k} className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">{k}</p>
                          <p className="text-xs font-bold uppercase text-white/80">{v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Notas internas</p>
                      <textarea
                        defaultValue={lead.notes || ''}
                        onBlur={e => handleUpdate('leads', lead.id, 'notes', e.target.value)}
                        placeholder="Seguimiento comercial..."
                        className="w-full bg-dark/50 border border-white/5 p-3 text-xs h-20 outline-none focus:border-primary/40 transition-all resize-none"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <select
                        value={lead.status || 'nuevo'}
                        onChange={e => handleUpdate('leads', lead.id, 'status', e.target.value)}
                        className="bg-black/40 border border-white/10 p-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary"
                      >
                        <option value="nuevo">Nuevo</option>
                        <option value="contactado">Contactado</option>
                        <option value="cerrado">Cerrado</option>
                        <option value="perdido">Perdido</option>
                      </select>
                      <button onClick={() => handleDelete('leads', lead.id)} className="text-white/10 hover:text-red-500 transition-all p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredLeads.length === 0 && (
                  <div className="text-center py-20 border border-white/5">
                    <Users className="w-10 h-10 text-white/10 mx-auto mb-4" />
                    <p className="text-white/20 text-xs font-black uppercase tracking-widest">Sin leads que coincidan</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ PROJECTS TAB (Drag & Drop) ═══════════════ */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest border border-primary/10 bg-primary/5 p-4">
                ✦ Arrastra las tarjetas para reordenar los tipos de obra. El orden se guarda automáticamente en la calculadora pública.
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={projectTypes.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {projectTypes.map(p => (
                      <SortableProjectItem key={p.id} p={p} onUpdate={handleUpdate} onDelete={handleDelete} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* ═══════════════ EXTRAS TAB ═══════════════ */}
          {activeTab === 'extras' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {extras.map(e => (
                <div key={e.id} className="p-6 bg-white/5 border border-white/5 space-y-6 hover:border-primary/20 transition-all group relative overflow-hidden">
                  {savingId?.includes(`extras-${e.id}`) && <div className="absolute top-3 right-3 text-[8px] font-black text-primary animate-pulse italic">GUARDANDO...</div>}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text" value={e.name}
                        onChange={v => handleUpdate('extras', e.id, 'name', v.target.value)}
                        className="bg-transparent text-lg font-black uppercase italic outline-none focus:text-primary w-full border-b border-white/5 focus:border-primary/40 pb-1 transition-all"
                      />
                      <div className="flex items-center gap-3 bg-dark/40 p-3 border border-white/5">
                        <span className="text-[9px] font-black text-white/20 uppercase">Método:</span>
                        <select
                          value={e.price_type || 'fixed'}
                          onChange={v => handleUpdate('extras', e.id, 'price_type', v.target.value)}
                          className="bg-transparent text-xs font-black text-primary outline-none"
                        >
                          <option value="fixed">Precio Fijo</option>
                          <option value="m2">Por m² (Multiplica)</option>
                        </select>
                        <span className="text-[8px] font-black italic text-primary/30 uppercase ml-auto">
                          {e.price_type === 'm2' ? '×m²' : 'Tarifa plana'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-dark/40 p-3 border border-white/5">
                        <span className="text-[9px] font-black text-white/20 uppercase">¿Varía con calidad?</span>
                        <select
                          value={e.is_quality_dependent === false ? 'false' : 'true'}
                          onChange={v => handleUpdate('extras', e.id, 'is_quality_dependent', v.target.value === 'true')}
                          className="bg-transparent text-xs font-black text-primary outline-none ml-auto"
                        >
                          <option value="true">Sí (Sube con Calidad Alta)</option>
                          <option value="false">No (Precio invariable)</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[['Básica', 'price_basic'], ['Media', 'price_medium'], ['Alta', 'price_high']].map(([label, field]) => (
                          <div key={field} className="space-y-1">
                            <label className="text-[8px] font-black text-white/10 uppercase">{label} (€)</label>
                            <input
                              type="number" value={e[field] || 0}
                              onChange={v => handleUpdate('extras', e.id, field, Number(v.target.value))}
                              className="w-full bg-dark/40 border border-white/10 p-2 text-xs font-bold text-white outline-none focus:border-primary/40"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleDelete('extras', e.id)} className="text-white/5 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">Visible en tipos de obra:</p>
                    <div className="flex flex-wrap gap-2">
                      {projectTypes.map(proj => {
                        const active = (e.project_types || []).some(id => String(id) === String(proj.id));
                        return (
                          <button
                            key={proj.id}
                            onClick={() => handleToggleExtraProject(e, proj.id)}
                            className={cn(
                              "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider border transition-all",
                              active ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/5 text-white/20 hover:text-white/40"
                            )}
                          >
                            {proj.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleAddExtra} className="border-2 border-dashed border-white/5 p-10 flex flex-col items-center justify-center gap-4 opacity-30 hover:opacity-100 hover:border-primary/20 transition-all group">
                <PlusCircle className="w-10 h-10 group-hover:scale-110 transition-all text-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest">Añadir Nuevo Servicio</span>
              </button>
            </div>
          )}

          {/* ═══════════════ PRICING TAB ═══════════════ */}
          {activeTab === 'pricing' && (
            <div className="space-y-3">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest p-4 border border-white/5 bg-white/[0.02]">
                Estos rangos definen el precio base por m² según el tipo de obra y el tamaño de la intervención.
              </p>
              {pricing.map(p => (
                <div key={p.id} className="p-5 bg-white/5 border border-white/5 flex items-center justify-between group hover:border-primary/10 transition-all">
                  <div>
                    <span className="text-xs font-black uppercase text-white/60">{p.project_type?.replace(/_/g, ' ')}</span>
                    <span className="text-[9px] text-white/20 ml-3 font-bold">({p.range_min} – {p.range_max} m²)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number" value={p.price_per_m2}
                      onChange={e => handleUpdate('pricing_config', p.id, 'price_per_m2', Number(e.target.value))}
                      className="w-28 bg-dark/50 border border-white/10 p-3 text-right font-black text-primary outline-none focus:border-primary"
                    />
                    <span className="text-xs font-bold text-white/20">€/m²</span>
                    <button onClick={() => handleDelete('pricing_config', p.id)} className="text-white/5 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══════════════ SETTINGS TAB ═══════════════ */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                {/* Quality Multipliers */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-primary tracking-widest border-l-2 border-primary pl-4">Multiplicadores de Calidad</h3>
                  <div className="space-y-3">
                    {[...qualitySettings].sort((a, b) => a.multiplier - b.multiplier).map(q => (
                      <div key={q.id} className="p-4 bg-white/5 border border-white/5 flex items-center justify-between group hover:border-primary/10 transition-all">
                        <div>
                          <p className="text-xs font-black uppercase text-white/60">{q.label}</p>
                          {q.description && <p className="text-[9px] text-white/20 mt-1 max-w-xs">{q.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" step="0.01" value={q.multiplier}
                            onChange={e => handleUpdate('quality_settings', q.id, 'multiplier', Number(e.target.value))}
                            className="w-20 bg-dark p-2 text-xs text-right font-black text-primary border border-white/5 outline-none focus:border-primary/40"
                          />
                          <span className="text-[9px] text-white/20 font-bold">×</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Housing Multipliers */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-primary tracking-widest border-l-2 border-primary pl-4">Modificadores de Vivienda</h3>
                  <div className="space-y-3">
                    {housingSettings.map(h => (
                      <div key={h.id} className="p-4 bg-white/5 border border-white/5 flex items-center justify-between group hover:border-primary/10 transition-all">
                        <p className="text-xs font-black uppercase text-white/60">{h.label}</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" step="0.01" value={h.multiplier || 1}
                            onChange={e => handleUpdate('housing_settings', h.id, 'multiplier', Number(e.target.value))}
                            className="w-20 bg-dark p-2 text-xs text-right font-black text-primary border border-white/5 outline-none focus:border-primary/40"
                          />
                          <span className="text-[9px] text-white/20 font-bold">×</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Global Settings */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-primary tracking-widest border-l-2 border-primary pl-4">Parámetros del Motor</h3>
                  <div className="space-y-4">
                    {globalSettings.map(s => (
                      <div key={s.key} className="space-y-2 group p-4 bg-white/[0.02] border border-white/5 hover:border-primary/10 transition-all">
                        <label className="text-[9px] font-black uppercase text-white/30 group-hover:text-primary transition-colors">{s.description || s.key}</label>
                        <input
                          type="text" value={s.value}
                          onChange={e => handleUpdate('global_settings', s.key, 'value', e.target.value)}
                          className="w-full bg-dark/50 border border-white/10 p-4 text-sm font-bold text-white outline-none focus:border-primary/20 hover:border-white/20 transition-all"
                        />
                        <p className="text-[8px] text-white/10 font-bold italic">Clave técnica: <span className="text-primary/40">{s.key}</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-primary tracking-widest border-l-2 border-primary pl-4">Estado del Sistema</h3>
                  <div className="p-6 bg-primary/5 border border-primary/10 space-y-4">
                    {[
                      { label: 'Motor de Precios', status: 'Activo', color: 'emerald' },
                      { label: 'Smart Labor (Baños/Cocinas)', status: 'Activo', color: 'emerald' },
                      { label: 'Freno Logarítmico (Max 35%)', status: 'Activo', color: 'emerald' },
                      { label: 'Notificaciones Resend', status: 'Simulación', color: 'yellow' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-white/40">{item.label}</p>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full animate-pulse", item.color === 'emerald' ? "bg-emerald-400" : "bg-yellow-400")} />
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", item.color === 'emerald' ? "text-emerald-400" : "text-yellow-400")}>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Admin;

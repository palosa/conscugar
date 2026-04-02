import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  Euro, 
  Plus, 
  Trash2, 
  Save, 
  LogOut, 
  Home, 
  ArrowLeft,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ChevronRight,
  Hammer,
  Zap,
  ShieldCheck,
  Wrench,
  Construction,
  CookingPot,
  ShowerHead,
  Building2,
  RefreshCw,
  MoreVertical,
  PlusCircle,
  Percent,
  Eye,
  FileText
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import Calculator from '../components/Calculator/Calculator';

const ICON_MAP = {
  Home, ShowerHead, CookingPot, Construction, Building2, Wrench,
  Zap, CheckCircle2, ShieldCheck, Hammer, Percent
};

const Admin = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [leads, setLeads] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [extras, setExtras] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [qualitySettings, setQualitySettings] = useState([]);
  const [housingSettings, setHousingSettings] = useState([]);
  const [globalSettings, setGlobalSettings] = useState([]);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        leadsRes, 
        pricingRes, 
        extrasRes, 
        projectsRes, 
        qualityRes, 
        housingRes, 
        globalRes
      ] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('pricing_config').select('*'),
        supabase.from('extras').select('*'),
        supabase.from('project_types').select('*').order('display_order'),
        supabase.from('quality_settings').select('*'),
        supabase.from('housing_settings').select('*'),
        supabase.from('global_settings').select('*')
      ]);

      if (leadsRes.data) setLeads(leadsRes.data);
      if (pricingRes.data) setPricing(pricingRes.data);
      if (extrasRes.data) setExtras(extrasRes.data);
      if (projectsRes.data) setProjectTypes(projectsRes.data);
      if (qualityRes.data) setQualitySettings(qualityRes.data);
      if (housingRes.data) setHousingSettings(housingRes.data);
      if (globalRes.data) setGlobalSettings(globalRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (table, id, field, value) => {
    setSavingId(`${table}-${id}-${field}`);
    const { error } = await supabase.from(table).update({ [field]: value }).eq('id', id);
    if (!error) {
      await fetchAllData();
      setTimeout(() => setSavingId(null), 1000);
    }
  };

  const handleDelete = async (table, id) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) fetchAllData();
    }
  };

  const handleToggleExtraProject = async (extra, projectId) => {
    const currentProjects = extra.project_types || [];
    const isAlreadyPresent = currentProjects.some(id => String(id) === String(projectId));
    
    const newProjects = isAlreadyPresent
      ? currentProjects.filter(id => String(id) !== String(projectId))
      : [...currentProjects, String(projectId)]; // Guardamos como string para consistencia
    
    // Optimización local inmediata para feedback visual
    setExtras(prev => prev.map(e => e.id === extra.id ? { ...e, project_types: newProjects } : e));
    
    handleUpdate('extras', extra.id, 'project_types', newProjects);
  };

  const exportLeads = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Proyecto', 'Metros m2', 'Vivienda', 'Total €', 'Fecha'];
    const rows = filteredLeads.map(l => [
      l.name, l.email, l.phone, l.project_type, l.m2, l.vivienda, l.estimated_total, new Date(l.created_at).toLocaleDateString()
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_conscugar_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddExtra = async () => {
    const name = prompt('Nombre del nuevo extra:');
    if (!name) return;
    const { error } = await supabase.from('extras').insert([{
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      price: 1000,
      category: 'General',
      project_types: projectTypes.map(p => p.id)
    }]);
    if (!error) fetchAllData();
  };

  return (
    <div className="flex bg-dark h-screen overflow-hidden text-white font-outfit relative">
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-[70] transition-transform duration-500 lg:relative lg:translate-x-0 lg:z-0",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <span className="text-xl font-black tracking-tighter uppercase italic">Con<span className="text-primary">scugar</span> <span className="text-[10px] bg-primary text-dark px-2 py-1 ml-2 not-italic">ADM</span></span>
          <button onClick={() => setIsMenuOpen(false)} className="lg:hidden">
             <X className="w-5 h-5 text-white/40" />
          </button>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 mt-8">
          {[
            { id: 'leads', label: 'CRM Leads', icon: Users },
            { id: 'projects', label: 'Proyectos', icon: Layout },
            { id: 'extras', label: 'Servicios Extras', icon: PlusCircle },
            { id: 'pricing', label: 'Matriz Precios', icon: TableProperties },
            { id: 'settings', label: 'Ajustes Motor', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all group",
                activeTab === tab.id 
                  ? "bg-primary text-dark" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-dark" : "text-primary")} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
           <button 
             onClick={() => supabase.auth.signOut()}
             className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
           >
             <LogOut className="w-4 h-4" /> Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-dark flex flex-col">
        {/* Mobile Top Header */}
        <header className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
           <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2">
              <Menu className="w-6 h-6 text-primary" />
           </button>
           <span className="text-sm font-black uppercase tracking-tighter italic">C S G <span className="text-primary">ADM</span></span>
           <div className="w-6" /> {/* Spacer */}
        </header>

        <div className="p-6 sm:p-12 max-w-7xl w-full mx-auto space-y-12">
          
          <div className="flex justify-between items-end">
             <h2 className="text-4xl font-black uppercase italic tracking-tighter">{activeTab}</h2>
             <Button variant="ghost" onClick={fetchAllData} className="text-white/20 hover:text-white">
                <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> Sincronizar
             </Button>
          </div>

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
                 <div className="flex gap-4 flex-1 w-full">
                    <input 
                       placeholder="Buscar por nombre, email o móvil..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="flex-1 bg-white/5 border border-white/5 p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-primary/40"
                    />
                    <select 
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                       className="bg-white/5 border border-white/5 p-4 text-[10px] font-black uppercase tracking-widest outline-none"
                    >
                       <option value="all">TODOS LOS ESTADOS</option>
                       <option value="nuevo">NUEVOS</option>
                       <option value="contactado">CONTACTADOS</option>
                       <option value="cerrado">CERRADOS</option>
                       <option value="perdido">PERDIDOS</option>
                    </select>
                 </div>
                 <Button variant="outline" onClick={exportLeads} className="whitespace-nowrap px-8 py-4 border-white/10 hover:border-primary text-xs font-black tracking-widest">
                    <FileText className="w-4 h-4 mr-2" /> EXPORTAR CSV
                 </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-12">
                 <div className="bg-white/5 border border-white/10 p-6 space-y-1 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                    <p className="text-[10px] font-black uppercase text-white/20">Registros</p>
                    <p className="text-3xl font-black italic">{filteredLeads.length}</p>
                 </div>
                 <div className="bg-white/5 border border-white/5 p-6 space-y-1">
                    <p className="text-[10px] font-black uppercase text-white/20">Potencial</p>
                    <p className="text-3xl font-black italic text-primary">{filteredLeads.reduce((a,c)=>a+(c.estimated_total||0),0).toLocaleString()}€</p>
                 </div>
                 <div className="bg-white/5 border border-white/5 p-6 space-y-1">
                    <p className="text-[10px] font-black uppercase text-white/20">Ticket Medio</p>
                    <p className="text-3xl font-black italic">{filteredLeads.length > 0 ? Math.round(filteredLeads.reduce((a,c)=>a+(c.estimated_total||0),0)/filteredLeads.length).toLocaleString() : 0}€</p>
                 </div>
              </div>

              {filteredLeads.map(lead => (
                <div key={lead.id} className="glass-card p-8 border border-white/5 space-y-6 hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary uppercase">{lead.name[0]}</div>
                          <div>
                             <h3 className="text-xl font-black uppercase tracking-tight text-white">{lead.name}</h3>
                             <p className="text-xs text-white/60">{lead.email} · <span className="text-primary font-bold">{lead.phone}</span></p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-white/30 italic uppercase tracking-widest">{new Date(lead.created_at).toLocaleDateString()}</p>
                          <p className="text-3xl font-black text-primary italic leading-none mt-2">{lead.estimated_total?.toLocaleString()}€</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8 py-5 border-y border-white/10 bg-white/[0.02] px-6 -mx-6 mb-6">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Proyecto</p>
                          <p className="text-xs font-bold uppercase text-white/80">{lead.project_type.replace('_',' ')}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Superficie</p>
                          <p className="text-xs font-bold text-white/80">{lead.m2} m²</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Ubicación</p>
                          <p className="text-xs font-bold uppercase text-white/80">{lead.vivienda}</p>
                       </div>
                    </div>

                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase">
                         <FileText className="w-3 h-3" /> Notas Internas
                      </div>
                      <textarea 
                        defaultValue={lead.notes || ''}
                        onBlur={(e) => handleUpdate('leads', lead.id, 'notes', e.target.value)}
                        placeholder="Añade notas sobre el seguimiento de este presupuesto..."
                        className="w-full bg-dark/50 border border-white/5 p-4 text-xs h-24 outline-none focus:border-primary/40 transition-all"
                      />
                   </div>

                   <div className="flex justify-between items-center">
                      <select 
                        value={lead.status || 'nuevo'}
                        onChange={(e) => handleUpdate('leads', lead.id, 'status', e.target.value)}
                        className="bg-black/40 border border-white/10 p-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary"
                      >
                         <option value="nuevo">Nuevo</option>
                         <option value="contactado">Contactado</option>
                         <option value="cerrado">Cerrado</option>
                         <option value="perdido">Perdido</option>
                      </select>
                      <button onClick={() => handleDelete('leads', lead.id)} className="text-white/10 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
               {pricing.map(p => (
                 <div key={p.id} className="p-6 bg-white/5 border border-white/5 flex items-center justify-between group">
                    <span className="text-xs font-black uppercase text-white/40">{p.project_type.replace('_',' ')} ({p.range_min}-{p.range_max}m²)</span>
                    <div className="flex items-center gap-6">
                       <input 
                         type="number" 
                         value={p.price_per_m2}
                         onChange={(e) => handleUpdate('pricing_config', p.id, 'price_per_m2', Number(e.target.value))}
                         className="w-32 bg-dark/50 border border-white/10 p-3 text-right font-black text-primary outline-none focus:border-primary"
                       />
                       <span className="text-xs font-bold text-white/20">€/m²</span>
                       <button onClick={() => handleDelete('pricing_config', p.id)} className="text-white/5 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                 </div>
               ))}
               <Button variant="outline" className="w-full py-6 mt-4 border-dashed border-white/10 opacity-40 hover:opacity-100"><Plus className="w-4 h-4 mr-2" /> Añadir Rango Personalizado</Button>
            </div>
          )}

          {/* Extras Tab */}
          {activeTab === 'extras' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {extras.map(e => (
                   <div key={e.id} className="p-8 bg-white/5 border border-white/5 space-y-8 hover:border-primary/20 transition-all group relative overflow-hidden">
                      {savingId?.includes(`extras-${e.id}`) && <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-primary animate-pulse italic">GUARDANDO...</div>}
                      <div className="flex justify-between items-start">
                         <div className="flex-1 space-y-2">
                           <input 
                              type="text" 
                              value={e.name}
                              onChange={(v) => handleUpdate('extras', e.id, 'name', v.target.value)}
                              className="bg-transparent text-xl font-black uppercase italic outline-none focus:text-primary w-full"
                           />
                           <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-4 bg-dark/40 p-4 border border-white/5">
                                 <span className="text-[10px] font-black text-white/20 uppercase italic">Método:</span>
                                 <select 
                                   value={e.price_type || 'fixed'}
                                   onChange={(v) => handleUpdate('extras', e.id, 'price_type', v.target.value)}
                                   className="bg-transparent text-xs font-black text-primary outline-none focus:text-white uppercase tracking-widest"
                                 >
                                    <option value="fixed">Precio Fijo</option>
                                    <option value="m2">Por m² (Multiplica)</option>
                                 </select>
                                 <span className="text-[8px] font-black italic text-primary/40 uppercase">
                                    {e.price_type === 'm2' ? "*(Se multiplica por los m² del proyecto)*" : "*(Coste único independiente de los m²)*"}
                                 </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                 <div className="space-y-1">
                                    <label className="text-[8px] font-black text-white/10 uppercase">Básica (€)</label>
                                    <input 
                                       type="number" value={e.price_basic || 0}
                                       onChange={(v) => handleUpdate('extras', e.id, 'price_basic', Number(v.target.value))}
                                       className="w-full bg-dark/40 border border-white/10 p-2 text-xs font-bold text-white outline-none focus:border-primary/40"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[8px] font-black text-white/10 uppercase">Media (€)</label>
                                    <input 
                                       type="number" value={e.price_medium || 0}
                                       onChange={(v) => handleUpdate('extras', e.id, 'price_medium', Number(v.target.value))}
                                       className="w-full bg-dark/40 border border-white/10 p-2 text-xs font-bold text-white outline-none focus:border-primary/40"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[8px] font-black text-white/10 uppercase">Alta (€)</label>
                                    <input 
                                       type="number" value={e.price_high || 0}
                                       onChange={(v) => handleUpdate('extras', e.id, 'price_high', Number(v.target.value))}
                                       className="w-full bg-dark/40 border border-white/10 p-2 text-xs font-bold text-white outline-none focus:border-primary/40"
                                    />
                                 </div>
                              </div>
                           </div>
                         </div>
                         <button onClick={() => handleDelete('extras', e.id)} className="text-white/5 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-2"><Trash2 className="w-5 h-5" /></button>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Mostrar en tipos de obra:</h4>
                         <div className="flex flex-wrap gap-2">
                            {projectTypes.map(proj => {
                               const isActive = (e.project_types || []).some(id => String(id) === String(proj.id));
                               return (
                                  <button 
                                     key={proj.id}
                                     onClick={() => handleToggleExtraProject(e, proj.id)}
                                     className={cn(
                                        "px-3 py-2 text-[10px] font-black uppercase tracking-wider border transition-all",
                                        isActive 
                                          ? "bg-primary/20 border-primary text-primary" 
                                          : "bg-white/5 border-white/5 text-white/20 hover:text-white/40"
                                     )}
                                  >
                                     {proj.name}
                                  </button>
                               )
                            })}
                         </div>
                      </div>
                   </div>
                ))}
                <button onClick={handleAddExtra} className="border-2 border-dashed border-white/5 p-12 flex flex-col items-center justify-center gap-4 opacity-30 hover:opacity-100 hover:border-primary/20 transition-all group">
                   <PlusCircle className="w-10 h-10 group-hover:scale-110 transition-all text-primary" />
                   <span className="text-[11px] font-black uppercase tracking-[0.3em]">Añadir Nuevo Extra</span>
                </button>
             </div>
          )}

          {/* Project Types Tab */}
          {activeTab === 'projects' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectTypes.map((p, idx) => {
                   const Icon = ICON_MAP[p.icon] || Home;
                   return (
                      <div key={p.id} className="p-8 bg-white/5 border border-white/5 space-y-6 hover:border-primary/20 transition-all group relative">
                         <div className="flex justify-between items-center">
                            <div className="w-12 h-12 bg-dark/50 border border-white/5 flex items-center justify-center text-primary">
                               <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-white/10 italic">#{p.id}</span>
                         </div>
                         <div className="space-y-4">
                            <div>
                               <label className="text-[9px] font-black text-white/10 uppercase tracking-widest block mb-2">Nombre Comercial:</label>
                               <input 
                                  type="text" 
                                  value={p.name}
                                  onChange={(v) => handleUpdate('project_types', p.id, 'name', v.target.value)}
                                  className="w-full bg-dark/40 border border-white/10 p-3 text-sm font-black uppercase italic text-white outline-none focus:border-primary/40"
                               />
                            </div>
                            <div>
                               <label className="text-[9px] font-black text-white/10 uppercase tracking-widest block mb-1">Método de Cálculo:</label>
                               <select 
                                  value={p.base_price_type || 'm2'}
                                  onChange={(v) => handleUpdate('project_types', p.id, 'base_price_type', v.target.value)}
                                  className="w-full bg-dark/40 border border-white/10 p-3 text-xs font-black uppercase tracking-widest text-primary outline-none"
                               >
                                  <option value="m2">Multiplicar por m²</option>
                                  <option value="fixed">Precio Cerrado / Único</option>
                               </select>
                            </div>
                            <div>
                               <label className="text-[9px] font-black text-white/10 uppercase tracking-widest block mb-2">Memoria de Calidades (Lo que incluye):</label>
                               <textarea 
                                  value={p.inclusions || ''}
                                  placeholder="Ej: Alicatado completo, grifería empotrada, mobiliario gama alta..."
                                  onChange={(v) => handleUpdate('project_types', p.id, 'inclusions', v.target.value)}
                                  className="w-full bg-dark/40 border border-white/10 p-3 text-[10px] text-white/50 h-24 outline-none focus:border-primary/40"
                               />
                            </div>
                            <div>
                               <label className="text-[9px] font-black text-white/10 uppercase tracking-widest block mb-2">Orden:</label>
                               <input 
                                  type="number" 
                                  value={p.display_order}
                                  onChange={(v) => handleUpdate('project_types', p.id, 'display_order', Number(v.target.value))}
                                  className="w-full bg-dark/40 border border-white/10 p-3 text-sm font-bold text-white outline-none focus:border-primary/40"
                               />
                            </div>
                         </div>
                         <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <button className="text-[10px] font-black text-white/20 uppercase hover:text-white transition-all disabled:opacity-50">Cambiar Icono</button>
                            <button onClick={() => handleDelete('project_types', p.id)} className="text-white/5 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                   )
                })}
                <button className="border-2 border-dashed border-white/5 p-8 flex flex-col items-center justify-center gap-4 opacity-30 cursor-not-allowed">
                   <Plus className="w-8 h-8" />
                   <span className="text-[10px] font-black uppercase">Nueva Categoría de Obra</span>
                </button>
             </div>
          )}

           {/* Settings Tab */}
           {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-12">
                    <div className="space-y-6">
                       <h3 className="text-xs font-black uppercase text-primary tracking-widest border-l-2 border-primary pl-4">Notificaciones & Resend</h3>
                       <div className="p-6 bg-primary/5 border border-primary/10 space-y-6">
                          <p className="text-[10px] text-white/60 leading-relaxed font-bold uppercase tracking-wider italic">
                             Preparado para integración con Resend.com. Este módulo avisará al administrador de cada nuevo presupuesto generado.
                          </p>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-white/30">Email del Administrador (Recepción)</label>
                             <input 
                                type="email" 
                                placeholder="tuemail@conscugar.es"
                                className="w-full bg-dark border border-white/5 p-4 text-xs font-black text-primary outline-none focus:border-primary/20"
                             />
                          </div>
                          <div className="flex items-center gap-3 py-2 border-t border-white/5 pt-4">
                             <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500/80">Estado: Modo Simulación (Preparado para conectar)</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h3 className="text-xs font-black uppercase text-primary tracking-widest border-l-2 border-primary pl-4">Multiplicadores de Calidad</h3>
                       <div className="space-y-4">
                          {[...qualitySettings].sort((a, b) => a.multiplier - b.multiplier).map(q => (
                             <div key={q.id} className="p-4 bg-white/5 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                                <span className="text-[11px] font-black uppercase tracking-wider text-white/60">{q.label}</span>
                                <input 
                                  type="number" step="0.01" value={q.multiplier}
                                  onChange={(e)=>handleUpdate('quality_settings', q.id, 'multiplier', Number(e.target.value))}
                                  className="w-20 bg-dark p-2 text-xs text-right font-black text-primary outline-none focus:border-primary/40"
                                />
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-12">
                    <div className="space-y-8">
                       <h3 className="text-xs font-black uppercase text-primary tracking-widest border-l-2 border-primary pl-4">Configuración del Motor</h3>
                       <div className="space-y-6">
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-4">Parámetros Globales (Solo Administrador)</p>
                          {globalSettings.map(s => (
                             <div key={s.key} className="space-y-2 group">
                                <label className="text-[9px] font-black uppercase text-white/30 group-hover:text-primary transition-colors">{s.description || s.key}</label>
                                <input 
                                  type="text" value={s.value}
                                  onChange={(e)=>handleUpdate('global_settings', s.key, 'value', e.target.value)}
                                  className="w-full bg-dark/50 border border-white/10 p-4 text-sm font-bold text-white outline-none focus:border-primary/20 hover:border-white/20 transition-all"
                                />
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

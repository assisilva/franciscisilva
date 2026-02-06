
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Trash2,
  Gift,
  AlertTriangle,
  Zap,
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
import { Client, View } from './types';
import { generateIptvMessage, MessageType, MessageTone } from './services/geminiService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('iptv_clients');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'João Silva', phone: '5511999999999', plan: 'Mensal', expirationDate: '2024-06-25', status: 'Ativo' },
      { id: '2', name: 'Maria Santos', phone: '5511888888888', plan: 'Anual', expirationDate: '2024-05-20', status: 'Vencendo' },
      { id: '3', name: 'Pedro Souza', phone: '5511777777777', plan: 'Trimestral', expirationDate: '2024-04-15', status: 'Inativo' },
    ];
  });

  const PIX_INFO = { key: "13996566872", name: "Francisco de Assis da Silva" };
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('iptv_clients', JSON.stringify(clients));
  }, [clients]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({ plan: 'Mensal' });
  
  const [generationContext, setGenerationContext] = useState<{ clientId: string, type: MessageType } | null>(null);
  const [activeTone, setActiveTone] = useState<MessageTone>('friendly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');

  const getClientStatus = (expirationDate: string): Client['status'] => {
    const today = new Date();
    const exp = new Date(expirationDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Inativo';
    if (diffDays <= 3) return 'Vencendo';
    return 'Ativo';
  };

  const clientsWithAutoStatus = useMemo(() => {
    return clients.map(c => ({
      ...c,
      status: getClientStatus(c.expirationDate)
    }));
  }, [clients]);

  const filteredClients = clientsWithAutoStatus.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const stats = {
    total: clientsWithAutoStatus.length,
    active: clientsWithAutoStatus.filter(c => c.status === 'Ativo').length,
    expiring: clientsWithAutoStatus.filter(c => c.status === 'Vencendo').length,
    inactive: clientsWithAutoStatus.filter(c => c.status === 'Inativo').length,
  };

  const handleAddClient = () => {
    if (newClient.name && newClient.phone && newClient.expirationDate) {
      const id = Math.random().toString(36).substr(2, 9);
      setClients([...clients, { ...newClient, id, status: 'Ativo' } as Client]);
      setIsAddingClient(false);
      setNewClient({ plan: 'Mensal' });
    }
  };

  const removeClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const startGeneration = async (client: Client, type: MessageType, tone: MessageTone = 'friendly') => {
    setGenerationContext({ clientId: client.id, type });
    setActiveTone(tone);
    setIsGenerating(true);
    setGeneratedMessage('');
    
    const msg = await generateIptvMessage(client.name, client.expirationDate, type, tone);
    setGeneratedMessage(msg);
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendToWhatsApp = (phone: string, message: string) => {
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-200">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">IPTV<span className="text-indigo-500">Pro</span></h1>
        </div>

        <div className="space-y-2 flex-grow">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={<Users size={20} />} label="Clientes" active={activeView === 'clients'} onClick={() => setActiveView('clients')} />
          <NavItem icon={<MessageSquare size={20} />} label="Mensagens" active={activeView === 'messages'} onClick={() => setActiveView('messages')} />
          <NavItem icon={<Settings size={20} />} label="Configurações" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </div>

        {/* Quick Payment Info in Sidebar */}
        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
               <CreditCard size={12} />
               Dados PIX
             </div>
             <div className="text-xs font-bold text-slate-300 truncate">{PIX_INFO.key}</div>
             <div className="text-[10px] text-slate-500 mt-1 truncate">{PIX_INFO.name}</div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-indigo-400 text-sm font-medium bg-indigo-500/5 rounded-lg">
            <Sparkles size={16} />
            IA Conectada
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        {activeView === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <header className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Painel de Controle</h2>
              <p className="text-slate-400">Gerenciamento automático de {PIX_INFO.name}.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard label="Total de Clientes" value={stats.total} icon={<Users className="text-indigo-400" />} />
              <StatCard label="Ativos" value={stats.active} icon={<CheckCircle2 className="text-emerald-400" />} />
              <StatCard label="Vencendo (3 dias)" value={stats.expiring} icon={<AlertTriangle className="text-amber-400" />} />
              <StatCard label="Vencidos" value={stats.inactive} icon={<XCircle className="text-rose-400" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Sparkles size={120} className="text-indigo-500" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">Potencialize suas Renovação</h3>
                  <p className="text-slate-400 max-w-xl mb-6">
                    Sua chave PIX <strong>{PIX_INFO.key}</strong> já está integrada em todas as mensagens automáticas. 
                    Basta um clique para cobrar e receber.
                  </p>
                  <button 
                    onClick={() => setActiveView('clients')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-indigo-600/30"
                  >
                    Abrir Clientes
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-400" />
                  Informações de Pagamento
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center group">
                    <div>
                      <div className="text-[10px] uppercase font-black text-slate-500 tracking-tighter mb-1">Chave PIX (Telefone)</div>
                      <div className="text-lg font-mono font-bold text-white">{PIX_INFO.key}</div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(PIX_INFO.key)}
                      className="p-3 hover:bg-slate-800 rounded-xl transition-all text-slate-400 group-hover:text-indigo-400"
                    >
                      {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                    </button>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black text-slate-500 tracking-tighter mb-1">Favorecido</div>
                    <div className="text-sm font-bold text-slate-300">{PIX_INFO.name}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'clients' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Base de Assinantes</h2>
                <p className="text-slate-400">As mensagens abaixo incluirão automaticamente o PIX de {PIX_INFO.name}.</p>
              </div>
              <button 
                onClick={() => setIsAddingClient(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/25 active:scale-95"
              >
                <Plus size={20} />
                Novo Assinante
              </button>
            </header>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou celular..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-800/40 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-5">Cliente</th>
                      <th className="px-6 py-5">Plano</th>
                      <th className="px-6 py-5">Vencimento</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5 text-center">IA: Gerar Texto com PIX</th>
                      <th className="px-6 py-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredClients.map(client => (
                      <tr key={client.id} className="hover:bg-indigo-600/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-100">{client.name}</div>
                          <div className="text-xs text-slate-500 mt-1">{client.phone}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-bold tracking-tighter text-slate-300">
                            {client.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium">
                          {new Date(client.expirationDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={client.status} />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => startGeneration(client, 'welcome')}
                              className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                              title="Mensagem de Boas-vindas"
                            >
                              <Gift size={18} />
                            </button>
                            <button 
                              onClick={() => startGeneration(client, 'expiring')}
                              className="p-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                              title="Aviso de Vencimento"
                            >
                              <Clock size={18} />
                            </button>
                            <button 
                              onClick={() => startGeneration(client, 'expired')}
                              className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                              title="Aviso de Vencido"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => removeClient(client.id)}
                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="animate-in fade-in duration-500 max-w-2xl">
            <header className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-indigo-100">Configurações</h2>
              <p className="text-slate-400">Dados da conta e do sistema de cobrança.</p>
            </header>
            <div className="space-y-6">
              <section className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <CreditCard className="text-indigo-400" />
                   Dados do PIX
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Favorecido (Nome Completo)</label>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 font-bold">
                       {PIX_INFO.name}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Chave PIX (Configurada no Sistema)</label>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-indigo-400 font-mono font-bold">
                       {PIX_INFO.key}
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                     <p className="text-xs text-slate-400 leading-relaxed italic">
                       Nota: Estes dados são injetados automaticamente no prompt da IA para garantir que todas as cobranças sejam feitas corretamente em seu nome.
                     </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeView === 'messages' && (
           <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
              <div className="bg-slate-900 p-6 rounded-full mb-4">
                <MessageSquare size={48} className="text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold">Central de Histórico</h3>
              <p>Funcionalidade em desenvolvimento.</p>
           </div>
        )}
      </main>

      {/* Modals remain similarly styled but with content logic verified */}
      {isAddingClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-800 p-10 shadow-3xl animate-in zoom-in-95">
            <h3 className="text-3xl font-black mb-8">Novo Assinante</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" onChange={(e) => setNewClient({...newClient, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">WhatsApp (com DDD)</label>
                <input type="text" placeholder="5511999999999" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 outline-none" onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Plano</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 outline-none" onChange={(e) => setNewClient({...newClient, plan: e.target.value as any})}>
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Vencimento</label>
                  <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-600 outline-none text-sm" onChange={(e) => setNewClient({...newClient, expirationDate: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsAddingClient(false)} className="flex-1 py-4 rounded-2xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all">Sair</button>
              <button onClick={handleAddClient} className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xl shadow-indigo-600/30">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {generationContext && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] border border-slate-800 shadow-3xl overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-56 bg-slate-950 p-8 border-b md:border-b-0 md:border-r border-slate-800">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Ajustar Tom</h4>
               <div className="space-y-3">
                 <ToneButton label="Amigável" active={activeTone === 'friendly'} onClick={() => startGeneration(clients.find(c => c.id === generationContext.clientId)!, generationContext.type, 'friendly')} />
                 <ToneButton label="Profissional" active={activeTone === 'professional'} onClick={() => startGeneration(clients.find(c => c.id === generationContext.clientId)!, generationContext.type, 'professional')} />
                 <ToneButton label="Urgente" active={activeTone === 'urgent'} onClick={() => startGeneration(clients.find(c => c.id === generationContext.clientId)!, generationContext.type, 'urgent')} />
               </div>
               <div className="mt-10 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <div className="text-[10px] font-black uppercase text-indigo-400 mb-2">Incluindo PIX</div>
                  <div className="text-[9px] text-slate-400">Sua chave PIX final {PIX_INFO.key.slice(-4)} será adicionada ao texto.</div>
               </div>
            </div>

            <div className="flex-grow p-10 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-2xl font-black text-white">Texto Sugerido</h3>
                   <p className="text-slate-500 text-sm mt-1">Gerado para: {clients.find(c => c.id === generationContext.clientId)?.name}</p>
                </div>
                <button onClick={() => setGenerationContext(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex-grow bg-slate-950 border border-slate-800 rounded-3xl p-6 relative group overflow-hidden">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
                     <RefreshCw size={32} className="text-indigo-500 animate-spin mb-3" />
                     <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">Processando...</span>
                  </div>
                ) : null}
                <div className="h-64 overflow-y-auto text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {generatedMessage || "Gerando conteúdo inteligente..."}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => {
                    const client = clients.find(c => c.id === generationContext.clientId);
                    if (client) sendToWhatsApp(client.phone, generatedMessage);
                  }}
                  disabled={!generatedMessage || isGenerating}
                  className="flex-grow bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                >
                  <MessageSquare size={20} />
                  Enviar WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Sub-components */

const ToneButton: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg' 
        : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
    }`}
  >
    {label}
  </button>
);

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' 
        : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    {icon}
    <span className="font-bold text-sm">{label}</span>
  </button>
);

const StatCard: React.FC<{ label: string, value: number, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 hover:border-indigo-500/30 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <span className="text-slate-500 text-xs font-black uppercase tracking-widest">{label}</span>
      <div className="p-2 bg-slate-950 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    <div className="text-4xl font-black text-white">{value}</div>
  </div>
);

const StatusBadge: React.FC<{ status: Client['status'] }> = ({ status }) => {
  const styles = {
    'Ativo': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Vencendo': 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse',
    'Inativo': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status === 'Inativo' ? 'Vencido' : status}
    </span>
  );
};

export default App;

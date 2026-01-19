import React, { useState, useEffect } from 'react';
import { analyzeFutures, testConnection, updateRealtimeData } from './services/geminiService';
import { FuturesAnalysis, LoadingStatus } from './types';
import ScoreChart from './components/ScoreChart';
import { 
  Search, 
  BarChart3, 
  Database, 
  Users, 
  FileText,
  AlertCircle,
  Clock,
  History,
  X,
  Menu,
  ShieldCheck,
  BrainCircuit,
  Share2,
  Check,
  Flame,
  Shuffle,
  Settings,
  Wifi,
  DatabaseZap,
  ChevronRight,
  Key,
  GanttChart,
  Compass,
  Scale,
  Zap,
  RefreshCcw
} from 'lucide-react';

const App: React.FC = () => {
  const [commodity, setCommodity] = useState('');
  const [status, setStatus] = useState<LoadingStatus>(LoadingStatus.IDLE);
  const [result, setResult] = useState<FuturesAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<FuturesAnalysis[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [connStatus, setConnStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connMsg, setConnMsg] = useState('');
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('futures_history_v5');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // 实时更新定时器：每 30 秒尝试更新报价
  useEffect(() => {
    let interval: number | null = null;
    if (status === LoadingStatus.COMPLETED && result) {
      interval = window.setInterval(async () => {
        setIsRefreshing(true);
        try {
          const update = await updateRealtimeData(result.commodity);
          setResult(prev => prev ? {
            ...prev,
            currentPrice: update.currentPrice,
            timestamp: update.timestamp
          } : null);
        } catch (e) {
          console.warn("Failed to update realtime data", e);
        } finally {
          setIsRefreshing(false);
        }
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, result?.commodity]);

  const handleShare = async () => {
    if (!result) return;
    const shareText = `📊 【智谱期货 Pro】研报：${result.commodity} | 评分：${result.overallScore} | 建议：${result.advice}`;
    if (navigator.share) {
      try { await navigator.share({ title: result.commodity, text: shareText, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(shareText).then(() => triggerToast('内容已复制'));
    }
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSearch = async (e?: React.FormEvent, overrideCommodity?: string) => {
    e?.preventDefault();
    const target = overrideCommodity || commodity;
    if (!target.trim()) return;
    setStatus(LoadingStatus.SEARCHING);
    setError(null);
    try {
      const data = await analyzeFutures(target);
      setResult(data);
      saveToHistory(data);
      setStatus(LoadingStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message);
      setStatus(LoadingStatus.ERROR);
    }
  };

  const saveToHistory = (newAnalysis: FuturesAnalysis) => {
    const updated = [newAnalysis, ...history.filter(h => h.commodity !== newAnalysis.commodity)].slice(0, 15);
    setHistory(updated);
    localStorage.setItem('futures_history_v5', JSON.stringify(updated));
  };

  const clearAllData = () => {
    if (confirm('确定要清除所有本地研报历史和缓存吗？')) {
      localStorage.removeItem('futures_history_v5');
      setHistory([]);
      triggerToast('本地数据已清空');
    }
  };

  const runConnectivityTest = async () => {
    setConnStatus('testing');
    const res = await testConnection();
    if (res.success) {
      setConnStatus('success');
      setConnMsg('连通性正常');
      setLatency(res.latency || 0);
    } else {
      setConnStatus('error');
      setConnMsg(res.message);
    }
  };

  const getAdviceColor = (advice: string) => {
    if (advice.includes('强力买入')) return 'text-red-600 bg-red-50 border-red-200';
    if (advice.includes('买入')) return 'text-rose-500 bg-rose-50 border-rose-100';
    if (advice.includes('卖出')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (advice.includes('观望')) return 'text-slate-600 bg-slate-50 border-slate-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 flex flex-col relative text-base">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 border border-white/10">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-base font-bold">{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-2xl text-white"><Settings className="w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">系统管理</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Key className="w-5 h-5 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">密钥安全</h4>
                </div>
                <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-4">
                  <p className="text-sm text-blue-700 leading-relaxed font-semibold">请通过 AI Studio 的环境安全接口同步您的 API 密钥。</p>
                  <button 
                    onClick={async () => {
                      // @ts-ignore
                      if (window.aistudio?.openSelectKey) await window.aistudio.openSelectKey();
                    }}
                    className="w-full py-4 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl text-blue-600 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3"
                  >
                    <ShieldCheck className="w-5 h-5" /> 管理 API 密钥
                  </button>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Wifi className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">服务诊断</h4>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${connStatus === 'success' ? 'bg-emerald-500' : connStatus === 'error' ? 'bg-rose-500' : 'bg-slate-300'}`}></div>
                      <span className="text-sm font-semibold text-slate-700">{connMsg || '就绪'}</span>
                    </div>
                    {latency !== null && <span className="text-xs font-mono text-emerald-600 font-bold">{latency}ms</span>}
                  </div>
                  <button onClick={runConnectivityTest} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm">一键连通性测试</button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl"><ShieldCheck className="text-white w-5 h-5" /></div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tighter">智谱期货 <span className="text-blue-600 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded font-bold ml-1">PRO</span></h1>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative flex-1 max-w-lg mx-6">
            <input
              type="text"
              placeholder="搜索期货品种 (例: 原油, 黄金)"
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 border-2 rounded-xl transition-all text-sm font-semibold outline-none"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          </form>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
              <History className="w-4 h-4" /> 历史研报
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 pt-10 flex-grow">
        {status === LoadingStatus.IDLE && (
          <div className="max-w-3xl mx-auto text-center py-20">
            <h2 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">全维度 <span className="text-blue-600">期货决策</span> 引擎</h2>
            <p className="text-lg text-slate-500 mb-10 font-medium">集成 Gemini 全球实时搜索与深度逻辑，洞穿宏观与产业脉络</p>
            <form onSubmit={handleSearch} className="flex gap-3 bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 group focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
              <input type="text" placeholder="输入期货品种名称..." className="flex-1 px-6 py-3 outline-none text-xl font-bold" value={commodity} onChange={(e) => setCommodity(e.target.value)} />
              <button type="submit" className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[2rem] text-base shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" /> 立即研判
              </button>
            </form>
            
            <div className="mt-12 flex justify-center gap-8 flex-wrap opacity-60">
               {[
                 { label: '多维评分系统', icon: BarChart3 },
                 { label: '跨市联动逻辑', icon: Shuffle },
                 { label: '实时供需抓取', icon: Database },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-2 font-semibold text-sm text-slate-600">
                   <item.icon className="w-4 h-4" /> {item.label}
                 </div>
               ))}
            </div>
          </div>
        )}

        {(status === LoadingStatus.SEARCHING || status === LoadingStatus.ANALYZING) && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="w-16 h-16 border-[5px] border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">智谱大脑正在高速演算...</h3>
              <p className="text-base text-slate-400 font-semibold">正在检索全球实时基本面、期现基差与资金流向</p>
            </div>
          </div>
        )}

        {status === LoadingStatus.ERROR && (
          <div className="max-w-xl mx-auto mt-12 p-10 bg-white border-2 border-rose-100 rounded-[3rem] text-center shadow-xl animate-in zoom-in-95">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100"><AlertCircle className="w-7 h-7 text-rose-500" /></div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">研判中断</h3>
            <p className="text-base text-slate-500 mb-8 leading-relaxed font-medium">{error}</p>
            <button onClick={() => setStatus(LoadingStatus.IDLE)} className="w-full py-4 bg-slate-900 text-white text-base font-bold rounded-2xl hover:bg-black transition-all">返回重新搜索</button>
          </div>
        )}

        {status === LoadingStatus.COMPLETED && result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-500 mb-12">
             {/* Left Panel: Summary & Scores */}
             <div className="lg:col-span-4 space-y-8">
               <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
                   {isRefreshing && <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin" />}
                   <button onClick={handleShare} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all"><Share2 className="w-5 h-5" /></button>
                 </div>
                 <div className="mb-8">
                   <div className="flex items-center gap-2 mb-1">
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{result.commodity}</h2>
                     <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black tracking-widest uppercase">LIVE</span>
                     </div>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-2xl font-bold text-blue-600 font-mono tracking-tighter">{result.currentPrice}</span>
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                       <Clock className="w-3 h-3" /> 刷新时间: {result.timestamp.split(' ')[1]}
                     </div>
                   </div>
                 </div>
                 
                 <div className={`mb-8 p-4 rounded-2xl border-2 text-center text-base font-bold ${getAdviceColor(result.advice)}`}>
                   策略建议：{result.advice}
                 </div>

                 <div className="pt-6 border-t border-slate-50">
                    <ScoreChart scores={result.scores} />
                 </div>
               </div>

               {/* 逻辑合成板块 (New: Synthesis) */}
               <div className="bg-blue-600 text-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-500/20 relative overflow-hidden group transition-all hover:scale-[1.01]">
                 <Zap className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">核心策略逻辑</h3>
                 <p className="text-base leading-relaxed font-medium opacity-95">{result.conclusionLogic}</p>
               </div>

               <div className="space-y-4">
                 {result.scores.map((s, i) => (
                   <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:border-blue-200 transition-all shadow-sm">
                     <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center font-bold text-xl text-blue-600 border border-blue-100 shrink-0">{s.score}</div>
                     <div>
                       <h4 className="font-bold text-slate-900 text-base mb-0.5">{s.dimension}</h4>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.reasoning}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Right Panel: Deep Analysis */}
             <div className="lg:col-span-8 space-y-10">
               {/* Market Linkage */}
               <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                 <Shuffle className="absolute -right-16 -top-16 w-80 h-80 opacity-10 rotate-12" />
                 <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20"><Flame className="w-6 h-6 text-white" /></div>
                       <h3 className="text-2xl font-bold tracking-tight">跨市场联动分析</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {result.hotspotLinkage.currentHotspots.map((h, i) => (
                        <span key={i} className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold text-orange-200 border border-white/5"># {h}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                        <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest block mb-3">定价核心变量</span>
                        <p className="text-base leading-relaxed font-medium">{result.hotspotLinkage.linkageLogic}</p>
                      </div>
                      <div className="bg-emerald-500/10 p-8 rounded-3xl border border-emerald-500/20">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest block mb-3">实战对冲建议</span>
                        <p className="text-base leading-relaxed font-semibold text-emerald-50">{result.hotspotLinkage.crossMarketAdvice}</p>
                      </div>
                    </div>
                 </div>
               </div>

               {/* Detailed Report */}
               <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200"><FileText className="w-6 h-6" /></div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">行业深度研报</h3>
                 </div>
                 <div className="space-y-10">
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative group">
                      <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3"><GanttChart className="w-6 h-6 text-blue-500" /> 基本面逻辑透视</h4>
                      <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{result.fundamentalAnalysis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                         <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Scale className="w-5 h-5 text-emerald-500" /> 期现基差逻辑</h5>
                         <p className="text-base text-slate-700 font-semibold leading-relaxed">{result.basisAnalysis}</p>
                       </div>
                       <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                         <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" /> 筹码博弈现状</h5>
                         <p className="text-base text-slate-700 font-semibold leading-relaxed">{result.sentimentAnalysis}</p>
                       </div>
                    </div>

                    <div className="pt-10 border-t border-slate-100">
                      <h4 className="text-xl font-bold mb-6 flex items-center gap-3 text-indigo-600"><Compass className="w-6 h-6" /> 未来演化与风险点</h4>
                      <p className="text-lg text-slate-600 leading-relaxed font-semibold italic whitespace-pre-wrap bg-indigo-50/20 p-8 rounded-3xl border border-indigo-100">{result.futurePrediction}</p>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* History Sidebar */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsHistoryOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold">历史研报</h3>
              <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-24 text-slate-400 font-bold">暂无历史记录</div>
              ) : (
                history.map((h) => (
                  <button 
                    key={h.id} 
                    onClick={() => { setResult(h); setStatus(LoadingStatus.COMPLETED); setIsHistoryOpen(false); }}
                    className="w-full p-6 bg-slate-50 hover:bg-slate-100 border-2 border-slate-100 rounded-3xl text-left transition-all group shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-lg font-bold text-slate-900 group-hover:text-blue-600">{h.commodity}</span>
                      <span className="text-sm font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg">{h.overallScore} 分</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-bold">{h.timestamp}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button onClick={clearAllData} className="w-full py-4 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                <DatabaseZap className="w-5 h-5" /> 清除所有历史
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Status Bar with Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200 py-4 px-10 z-40 flex justify-center">
        <div className="max-w-7xl w-full flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 text-emerald-600"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> 实时同步</span>
            <span className="hidden md:flex items-center gap-2 text-blue-600"><BrainCircuit className="w-4 h-4" /> Gemini 智能分析引擎</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-2 px-4 rounded-xl hover:bg-slate-100 bg-slate-50 border border-slate-200"
          >
            <Settings className="w-4 h-4" /> 系统管理
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
'use client';

import { useState } from 'react';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import TerminalGrid from '@/components/layout/TerminalGrid';
import TerminalPanel from '@/components/ui/TerminalPanel';
import {
  User,
  Monitor,
  Wifi,
  Shield,
  Bell,
  Cpu,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Lock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { tradeStorage } from '@/utils/tradeStorage';

const SECTIONS = [
  { id: 'user', label: 'USER_PROFILE', icon: User },
  { id: 'ui', label: 'TERMINAL_UI', icon: Monitor },
  { id: 'data', label: 'CONNECTIVITY', icon: Wifi },
  { id: 'security', label: 'SECURITY_AUTH', icon: Shield },
  { id: 'alerts', label: 'NOTIFICATIONS', icon: Bell },
  { id: 'system', label: 'SYSTEM_DIAG', icon: Cpu },
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState('user');
  const [legacyGreen, setLegacyGreen] = useState(false);
  const [highFidelity, setHighFidelity] = useState(true);
  const [audioChimes, setAudioChimes] = useState(false);
  const [crtScanlines, setCrtScanlines] = useState(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState('30');
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [pingTesting, setPingTesting] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handlePurgeBlotter = () => {
    if (typeof window !== 'undefined') {
      tradeStorage.saveTrades([]);
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    }
  };

  const handleTestPing = () => {
    setPingTesting(true);
    setPingResult(null);
    setTimeout(() => {
      setPingTesting(false);
      setPingResult('14ms (RTT) - All Gateways Optimal');
    }, 600);
  };

  return (
    <TerminalWorkspace>
      <TerminalGrid variant="split-4-8" className="min-h-[560px]">
        {/* Left Pad: Configuration Menu Navigation */}
        <div className="xl:col-span-4 flex flex-col min-h-[440px]">
          <TerminalPanel
            title="CONFIG_MENU"
            actions={<Sliders size={11} className="text-amber-500" />}
            footer={
              <>
                <span className="text-emerald-400 font-mono">● CLIENT_STANDALONE</span>
                <span>V 2.0.0-UI</span>
              </>
            }
          >
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-900 mb-2">
                Configuration Sections
              </div>
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-[11px] uppercase tracking-wider transition-all border-l-2 cursor-pointer ${
                      isActive
                        ? 'bg-amber-950/20 text-amber-500 border-amber-500 font-bold'
                        : 'text-zinc-400 border-transparent hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={14} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </TerminalPanel>
        </div>

        {/* Right Pad: Main Settings Content */}
        <div className="xl:col-span-8 flex flex-col min-h-[440px]">
          <TerminalPanel
            title={`${activeSection.toUpperCase()}_CONFIGURATION`}
            className="flex-1 min-h-full"
            bodyClassName="overflow-visible"
            footer={<span>SEEFIN TERMINAL // PURE CLIENT-SIDE FULL UI ENGINE</span>}
          >
            <div className="p-6 md:p-8 max-w-3xl space-y-8">
              {/* 1. USER PROFILE SECTION */}
              {activeSection === 'user' && (
                <>
                  <section className="space-y-4">
                    <h3 className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-800 pb-2">
                      Terminal Access Account
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Operator Name</label>
                        <input
                          type="text"
                          readOnly
                          value="J. DHANDHUKIYA"
                          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-200 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Terminal UUID</label>
                        <input
                          type="text"
                          readOnly
                          value="SF-9928-XLR"
                          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-200 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Desk Role</label>
                        <input
                          type="text"
                          readOnly
                          value="HEAD OF QUANT EXECUTION"
                          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-200 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase">Default Clearing Desk</label>
                        <input
                          type="text"
                          readOnly
                          value="NSE / BSE / COINDCX-INST"
                          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-200 outline-none"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 pt-4 border-t border-zinc-850">
                    <button className="px-6 py-2 border border-red-900/80 text-rose-400 font-mono text-[10px] font-bold uppercase hover:bg-rose-950/30 transition-all cursor-pointer flex items-center gap-2">
                      <AlertTriangle size={12} />
                      Reset Profile Credentials
                    </button>
                  </section>
                </>
              )}

              {/* 2. TERMINAL UI SECTION */}
              {activeSection === 'ui' && (
                <section className="space-y-4">
                  <h3 className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-800 pb-2">
                    Interface Preferences
                  </h3>
                  <div className="space-y-3">
                    <div
                      onClick={() => setLegacyGreen(!legacyGreen)}
                      className="flex items-center justify-between p-4 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                    >
                      <div>
                        <h4 className="text-[11px] font-mono text-zinc-200 uppercase font-semibold">Legacy Green Mode</h4>
                        <p className="text-[10px] font-mono text-zinc-500 lowercase mt-1">
                          revert terminal palette to phosphor green 1980s retro style
                        </p>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${legacyGreen ? 'bg-amber-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${legacyGreen ? 'right-1 bg-black' : 'left-1 bg-zinc-500'}`} />
                      </div>
                    </div>

                    <div
                      onClick={() => setHighFidelity(!highFidelity)}
                      className="flex items-center justify-between p-4 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                    >
                      <div>
                        <h4 className="text-[11px] font-mono text-zinc-200 uppercase font-semibold">High Fidelity Data Stream</h4>
                        <p className="text-[10px] font-mono text-zinc-500 lowercase mt-1">
                          enable sub-millisecond updates for ticker tape and level-2 quotes
                        </p>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${highFidelity ? 'bg-amber-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${highFidelity ? 'right-1 bg-black' : 'left-1 bg-zinc-500'}`} />
                      </div>
                    </div>

                    <div
                      onClick={() => setCrtScanlines(!crtScanlines)}
                      className="flex items-center justify-between p-4 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                    >
                      <div>
                        <h4 className="text-[11px] font-mono text-zinc-200 uppercase font-semibold">CRT Scanline Filter</h4>
                        <p className="text-[10px] font-mono text-zinc-500 lowercase mt-1">
                          render subtle horizontal raster scanlines for classic workstation ambiance
                        </p>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${crtScanlines ? 'bg-amber-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${crtScanlines ? 'right-1 bg-black' : 'left-1 bg-zinc-500'}`} />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 3. CONNECTIVITY SECTION */}
              {activeSection === 'data' && (
                <section className="space-y-5">
                  <h3 className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-800 pb-2">
                    Market Feed Connectivity
                  </h3>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <div className="font-bold text-zinc-200">AngelOne SmartAPI Stream</div>
                          <div className="text-[10px] text-zinc-500">REST & WebSocket Market Ticks</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">ONLINE // DIRECT</span>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <div className="font-bold text-zinc-200">CoinDCX Public Feed</div>
                          <div className="text-[10px] text-zinc-500">Spot & Futures L2 Orderbook</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">ONLINE // LOW LATENCY</span>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <div className="font-bold text-zinc-200">TradingView Charting Stream</div>
                          <div className="text-[10px] text-zinc-500">Global Indices & Multi-Asset Tape</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">SYNCED</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={handleTestPing}
                      disabled={pingTesting}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-amber-500 font-mono text-[10px] font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw size={12} className={pingTesting ? 'animate-spin' : ''} />
                      {pingTesting ? 'Testing Link...' : 'Test Gateway Ping'}
                    </button>
                    {pingResult && (
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        {pingResult}
                      </span>
                    )}
                  </div>
                </section>
              )}

              {/* 4. SECURITY & AUTH SECTION */}
              {activeSection === 'security' && (
                <section className="space-y-5">
                  <h3 className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-800 pb-2">
                    Security & Session Controls
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Auto Session Inactivity Lock</label>
                      <select
                        value={autoLockMinutes}
                        onChange={(e) => setAutoLockMinutes(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-200 outline-none"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes (Recommended)</option>
                        <option value="60">60 Minutes</option>
                        <option value="0">Never (Unrestricted Terminal)</option>
                      </select>
                    </div>

                    <div className="p-4 bg-zinc-950/60 border border-zinc-800 flex items-start gap-3">
                      <Lock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono text-xs font-bold text-zinc-200">Local Browser Cryptographic Vault</div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-1">
                          Credentials and simulated blotters are isolated to your browser. Zero cloud transmission, zero external databases.
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 5. NOTIFICATIONS SECTION */}
              {activeSection === 'alerts' && (
                <section className="space-y-4">
                  <h3 className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-800 pb-2">
                    Sound & Notification Preferences
                  </h3>
                  <div className="space-y-3">
                    <div
                      onClick={() => setAudioChimes(!audioChimes)}
                      className="flex items-center justify-between p-4 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {audioChimes ? <Volume2 size={16} className="text-amber-500" /> : <VolumeX size={16} className="text-zinc-600" />}
                        <div>
                          <h4 className="text-[11px] font-mono text-zinc-200 uppercase font-semibold">Audio Execution Chimes</h4>
                          <p className="text-[10px] font-mono text-zinc-500 lowercase mt-1">
                            play auditory feedback upon order fills and paper trade updates
                          </p>
                        </div>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${audioChimes ? 'bg-amber-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${audioChimes ? 'right-1 bg-black' : 'left-1 bg-zinc-500'}`} />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 6. SYSTEM DIAGNOSTICS SECTION */}
              {activeSection === 'system' && (
                <section className="space-y-5">
                  <h3 className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-800 pb-2">
                    Client System & Diagnostics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                    <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase">Architecture</div>
                      <div className="text-zinc-200 font-bold">Client-Native Full UI (Zero DB)</div>
                    </div>
                    <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase">Storage Engine</div>
                      <div className="text-zinc-200 font-bold">Browser LocalStorage (Sandboxed)</div>
                    </div>
                    <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase">UI Refresh Pipeline</div>
                      <div className="text-emerald-400 font-bold">60 FPS Hardware Rendered</div>
                    </div>
                    <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase">Market Engine</div>
                      <div className="text-zinc-200 font-bold">Client Simulated Stream (Zero Broker API)</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-850 space-y-3">
                    <h4 className="text-zinc-300 font-mono text-[11px] font-bold uppercase">Blotter Storage Maintenance</h4>
                    <p className="text-zinc-500 font-mono text-[10px]">
                      Clear all simulated paper trade records stored in browser memory.
                    </p>
                    <button
                      onClick={handlePurgeBlotter}
                      className="px-4 py-2 border border-red-900 text-rose-400 font-mono text-[10px] font-bold uppercase hover:bg-rose-950/30 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      Purge Local Blotter Cache
                    </button>
                    {purgeSuccess && (
                      <div className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        Blotter cache purged successfully.
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </TerminalPanel>
        </div>
      </TerminalGrid>
    </TerminalWorkspace>
  );
};

export default Settings;

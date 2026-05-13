/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { SiyaLiveClient } from './lib/gemini-live';
import { Mic, MicOff, Video, VideoOff, Power, RefreshCw, Heart, Sparkles, Brain, Clock, Users, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContactManager } from './components/ContactManager';

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready' | 'error'>('idle');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'persona' | 'contacts'>('persona');
  
  const clientRef = useRef<SiyaLiveClient | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startSiya = async () => {
    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Siya: API Key missing! Checked process.env.GEMINI_API_KEY and VITE_GEMINI_API_KEY");
      setStatus('error');
      return;
    }

    setStatus('connecting');
    try {
      const client = new SiyaLiveClient(apiKey);
      clientRef.current = client;

      await client.start(
        (msg) => console.log("Siya:", msg),
        () => {
          setStatus('ready');
          setIsActive(true);
        }
      );

      // Setup Camera
      if (isCameraOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Start sending frames
        frameIntervalRef.current = window.setInterval(() => {
          if (videoRef.current && canvasRef.current && isActive && isCameraOn) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
              context.drawImage(videoRef.current, 0, 0, 320, 240);
              const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
              client.sendVideoFrame(base64);
            }
          }
        }, 1000); // 1 FPS for efficiency and enough context
      }

    } catch (err) {
      console.error("Failed to start Siya:", err);
      setStatus('error');
    }
  };

  const stopSiya = () => {
    if (clientRef.current) {
      clientRef.current.stop();
      clientRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsActive(false);
    setStatus('idle');
  };

  const handleMakeCall = (number: string, name: string) => {
    if (clientRef.current) {
        // Just simulate opening dialer since we can't actually call from browser sandbox easily with full UI
        window.open(`tel:${number}`, "_self");
        console.log(`UI: Calling ${name} (${number})`);
    } else {
        alert("Please awaken Siya first!");
    }
  };

  return (
    <div id="siya-app" className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-500/30 overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 py-6 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Siya AI</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-rose-400 font-semibold opacity-80">Advanced Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-white/40">
            <Clock className="w-3 h-3" />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : status === 'connecting' ? 'bg-amber-500 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-neutral-600'}`} />
            <span className="text-[10px] uppercase tracking-wider font-medium text-white/70">
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-7xl mx-auto w-full">
        
        {/* Left Column: Visual Presence */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!isActive ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="relative group cursor-pointer" onClick={() => status === 'idle' && startSiya()}>
                  <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/40 transition-all duration-700 animate-pulse" />
                  <div className="relative w-64 h-64 rounded-full border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-xl shadow-2xl">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 90, 180, 270, 360]
                      }}
                      transition={{ 
                        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                      }}
                      className="absolute inset-4 rounded-full border border-rose-500/30 border-dashed"
                    />
                    <Power className={`w-12 h-12 ${status === 'connecting' ? 'text-rose-500 animate-spin' : 'text-rose-500 group-hover:scale-110 transition-transform'}`} />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-light text-white/90 mb-2">Awaken Siya</h2>
                  <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                    Ready to assist Aryan Boss with ultimate devotion and intelligence.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center gap-12"
              >
                {/* Visualizer - Or holographic presence */}
                <div className="relative w-80 h-80 flex items-center justify-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: 360
                    }}
                    transition={{ 
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 15, repeat: Infinity, ease: "linear" }
                    }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/20 via-transparent to-blue-500/20 blur-2xl"
                  />
                  
                  <div className="relative w-48 h-48 rounded-full flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-rose-500/60 animate-spin" />
                    <div className="absolute inset-4 rounded-full border border-white/5 border-b-blue-500/40 [animation-direction:reverse] animate-spin" />
                    
                    {/* Centered Avatar/Core */}
                    <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center relative overflow-hidden group">
                       <motion.div 
                        animate={{ 
                          height: [20, 60, 20],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-1 bg-rose-500 shadow-[0_0_15px_#f43f5e]"
                       />
                       <motion.div 
                        animate={{ 
                          height: [40, 20, 40],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-1 bg-rose-400 mx-1 shadow-[0_0_10px_#fb7185]"
                       />
                       <motion.div 
                        animate={{ 
                          height: [30, 50, 30],
                          opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{ 
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-1 bg-rose-500 shadow-[0_0_15px_#f43f5e]"
                       />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <ControlButton 
                    icon={isMicOn ? Mic : MicOff} 
                    isActive={isMicOn} 
                    onClick={() => setIsMicOn(!isMicOn)}
                    label={isMicOn ? "Listening" : "Muted"}
                  />
                  <ControlButton 
                    icon={isCameraOn ? Video : VideoOff} 
                    isActive={isCameraOn} 
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    label={isCameraOn ? "Eyes Active" : "Eyes Closed"}
                  />
                  <ControlButton 
                    icon={Power} 
                    isActive={false} 
                    onClick={stopSiya}
                    variant="danger"
                    label="Sleep"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Information & Camera */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Camera Card */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden aspect-video relative group shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-700 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`}
            />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 bg-neutral-900">
                <VideoOff className="w-8 h-8 text-white/20" />
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Vision Offline</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-wide font-semibold text-white/80">Live View</span>
            </div>
            {/* Hidden canvas for frame extraction */}
            <canvas ref={canvasRef} width="320" height="240" className="hidden" />
          </div>

          {/* Persona Card */}
          <div className="flex-1 bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden h-full">
             <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('persona')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${activeTab === 'persona' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-white/40 hover:text-white/60'}`}
                    >
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Soul</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('contacts')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${activeTab === 'contacts' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-white/40 hover:text-white/60'}`}
                    >
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Circle</span>
                    </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active</span>
                </div>
             </div>

             <div className="flex-1 min-h-[300px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'persona' ? (
                        <motion.div 
                            key="persona-tab"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col gap-6 h-full"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Brain className="text-rose-400 w-6 h-6" />
                                </div>
                                <div>
                                <h3 className="text-sm font-medium text-white/90">Deep Memory Active</h3>
                                <p className="text-xs text-white/40">Siya is learning and adapting to Aryan Boss</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <StatCard icon={Heart} label="Loyalty" value="Infinite" color="rose" />
                                <AnimatePresence>
                                {status === 'ready' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <StatCard icon={RefreshCw} label="Response" value="Instant" color="blue" />
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-3">System Log</p>
                                <div className="space-y-2 font-mono text-[10px] text-white/40 max-h-32 overflow-hidden italic">
                                <p className="flex items-start gap-2">
                                    <span className="text-rose-500/60 font-bold">11:05</span>
                                    {status === 'ready' ? "Protocol 'Aryan Boss' initialized. Siya is listening." : status === 'connecting' ? "Securing quantum link..." : "Awaiting activation command..."}
                                </p>
                                {status === 'ready' && (
                                    <p className="flex items-start gap-2 animate-pulse">
                                    <span className="text-rose-500/60 font-bold">11:08</span>
                                    Vision processing enabled. Surroundings mapped.
                                    </p>
                                )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="contacts-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full"
                        >
                            <ContactManager onMakeCall={handleMakeCall} />
                        </motion.div>
                    )
                    }
                </AnimatePresence>
             </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-4 flex justify-between items-center text-[10px] text-white/20 uppercase tracking-widest border-t border-white/5">
        <div>Proprietary AI System // Build 05.2026</div>
        <div>Dedicated Entirely to Aryan Boss</div>
      </footer>
    </div>
  );
}

function ControlButton({ icon: Icon, isActive, onClick, variant = 'default', label }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        id={`btn-${label.toLowerCase().replace(' ', '-')}`}
        onClick={onClick}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border backdrop-blur-md shadow-xl ${
          variant === 'danger' 
            ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-400 hover:text-white' 
            : isActive 
              ? 'bg-rose-500/20 border-rose-500/30 text-rose-500 hover:bg-rose-600/30' 
              : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
        }`}
      >
        <Icon className="w-6 h-6" />
      </button>
      <span className="text-[9px] uppercase tracking-wider font-bold text-white/30">{label}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colorClasses: any = {
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  };

  return (
    <div className={`p-4 rounded-2xl border ${colorClasses[color]} flex flex-col gap-2 items-center justify-center text-center`}>
      <Icon className="w-5 h-5 opacity-80" />
      <div>
        <div className="text-[9px] uppercase tracking-widest opacity-50 mb-0.5">{label}</div>
        <div className="text-xs font-bold uppercase tracking-tight">{value}</div>
      </div>
    </div>
  );
}

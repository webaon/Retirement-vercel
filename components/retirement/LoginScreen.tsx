import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- LoginScreen: หน้าจอเข้าสู่ระบบ ---
export const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
    const [name, setName] = React.useState("");


    return (
        <div className="min-h-[100dvh] w-full bg-[#0B0F19] relative flex items-center justify-center p-[4vw] lg:p-8 font-sans overflow-hidden selection:bg-indigo-500/30">
            {/* --- Dynamic Background --- */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage: "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />
                {/* Ambient Glows */}
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] delay-1000 animate-pulse" />
            </div>

            <div className="w-full max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-24 items-center">

                {/* --- Left Column: Value Proposition (Open Layout) - ส่วนแสดงจุดเด่นและคำโปรย --- */}
                <div className="space-y-[3vh] lg:space-y-10 text-center lg:text-left lg:pl-8 order-1 animate-in slide-in-from-top-8 fade-in duration-700">

                    {/* Brand Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mx-auto lg:mx-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-bold tracking-widest text-indigo-200 uppercase">Financial Freedom OS v2.0</span>
                    </div>

                    <div className="space-y-[2vh] lg:space-y-6">
                        <h1 className="text-[clamp(1.8rem,6vw,3.5rem)] lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-white/95">
                            วางแผนอนาคต<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300 inline-block">
                                เพื่อชีวิตที่คุณเลือกได้
                            </span>
                        </h1>
                        <p className="hidden lg:block text-[clamp(1rem,4vw,1.125rem)] text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0">
                            แพลตฟอร์มวางแผนเกษียณอัจฉริยะ ที่ช่วยให้คุณเห็นภาพอนาคตทางการเงินชัดเจนที่สุด ด้วยระบบจำลองสถานการณ์และความแม่นยำระดับมืออาชีพ
                        </p>
                    </div>

                    {/* Feature Pills */}
                    <div className="hidden lg:flex flex-wrap items-center justify-center lg:justify-start gap-[2vw] lg:gap-4">
                        <div className="flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-5 lg:py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-white">Visual Analytics</div>
                                <div className="text-[10px] text-slate-400">กราฟแสดงผลเข้าใจง่าย</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-5 lg:py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-white">Monte Carlo Sim</div>
                                <div className="text-[10px] text-slate-400">จำลองความเสี่ยง 1,000+ ครั้ง</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Floating Form Card - ส่วนฟอร์มล็อกอินด้านขวา --- */}
                <div className="order-2 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 md:-mt-12 lg:mt-0 w-full flex justify-center">
                    <div className="relative w-[92vw] max-w-md mx-auto bg-white/95 backdrop-blur-2xl p-[6vw] lg:p-10 rounded-[clamp(24px,6vw,32px)] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.3)] ring-1 ring-white/50">

                        {/* Decor */}
                        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 0C46.5685 0 60 13.4315 60 30C60 46.5685 46.5685 60 30 60C13.4315 60 0 46.5685 0 30C0 13.4315 13.4315 0 30 0Z" fill="url(#paint0_linear)" />
                                <defs>
                                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#6366f1" />
                                        <stop offset="1" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div className="space-y-[3vh] lg:space-y-8 relative z-10">
                            <div className="text-center lg:text-left">
                                <span className="text-[10px] lg:text-xs font-bold tracking-wider text-indigo-700 uppercase bg-indigo-100 px-3 py-1 rounded-full">ยินดีต้อนรับ</span>
                                <h2 className="text-[clamp(1.75rem,5vw,2.25rem)] font-bold text-slate-900 mt-[1.5vh] tracking-tight">เข้าสู่ระบบ</h2>
                                <p className="text-sm text-slate-500 mt-1">กรอกชื่อของคุณเพื่อเข้าใช้งานระบบวางแผนเกษียณ</p>
                            </div>

                            <div className="space-y-[2vh]">
                                <div className="space-y-2 group text-left">
                                    <Label className="text-xs font-bold text-slate-700 ml-1">ชื่อผู้ใช้งาน</Label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        </div>
                                        <Input
                                            className="h-[6vh] max-h-[60px] min-h-[48px] pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-base placeholder:text-slate-300"
                                            placeholder="กรอกชื่อของคุณ"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && onLogin(name || "User")}
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={() => onLogin(name || "User")}
                                    className="w-full h-[6vh] max-h-[60px] min-h-[48px] rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-[2vh]"
                                >
                                    เริ่มต้นใช้งาน
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 w-full text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium opacity-60">
                    Secure • Private • Local Storage Only
                </p>
            </div>
        </div>
    );
};

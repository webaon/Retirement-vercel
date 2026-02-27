import React from "react";

// --- PlanSelectionScreen: หน้าเลือกประเภทแผน (ส่วนบุคคล / ครอบครัว) ---
export const PlanSelectionScreen = ({ onSelect, user }: { onSelect: (type: "individual" | "family") => void, user: { name: string } | null }) => {


    return (
        <div className="min-h-screen w-full bg-[#0B0F19] relative flex items-center justify-center p-4 lg:p-8 font-sans overflow-hidden selection:bg-indigo-500/30">
            {/* Background Decor (Same as Login) */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage: "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] delay-1000 animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-5xl animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase">Select Planning Mode</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        เลือกรูปแบบ<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300">การวางแผนของคุณ</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        เริ่มต้นวางแผนเพื่ออนาคตที่มั่นคง เลือกรูปแบบที่เหมาะกับคุณที่สุด
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 px-4">
                    {/* Option 1: Individual (แผนส่วนบุคคล) */}
                    <button
                        onClick={() => onSelect("individual")}
                        className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-[32px] p-8 transition-all duration-300 text-left hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">ส่วนบุคคล (Individual)</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            วางแผนการเงินและเกษียณอายุสำหรับตัวคุณเอง เน้นการจัดการรายรับรายจ่ายและการลงทุนส่วนตัว
                        </p>
                        <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </div>
                    </button>

                    {/* Option 2: Family (แผนครอบครัว) */}
                    <button
                        onClick={() => onSelect("family")}
                        className="group relative rounded-[32px] p-8 transition-all duration-300 text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20"
                    >
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 border bg-emerald-500/20 text-emerald-300 group-hover:scale-110 border-emerald-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-2xl font-bold transition-colors text-white group-hover:text-emerald-300">ครอบครัว (Family)</h3>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed">
                            วางแผนร่วมกับครอบครัว จัดการเป้าหมายร่วมกัน และดูภาพรวมความมั่งคั่งของทุกคนในบ้าน
                        </p>
                        <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </div>
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs text-slate-500">
                        คุณสามารถเปลี่ยนโหมดการวางแผนได้ภายหลัง
                    </p>
                </div>
            </div>
        </div>
    );
};

import React from "react";
import { formatNumber } from "@/lib/utils";
import { RetirementInputs, MonteCarloResult } from "@/types/retirement";

interface AllocationWidgetProps {
    inputs: RetirementInputs;
}

// --- AllocationWidget: แสดงคำแนะนำการจัดพอร์ตการลงทุน (Asset Allocation Strategy) ---
export const AllocationWidget: React.FC<AllocationWidgetProps> = ({ inputs }) => {
    return (
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 print:shadow-none print:border print:border-slate-300 print:rounded-xl">
            {/* Header */}
            <div className="mb-6 md:mb-8 relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 text-base md:text-lg">📊</div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg md:text-lg tracking-tight">คำแนะนำการจัดพอร์ต</h3>
                    <p className="text-xs md:text-xs text-slate-400 font-medium">Age-based Rule: {100 - inputs.currentAge}/{Math.floor((inputs.currentAge) * 0.8)}/{inputs.currentAge - Math.floor((inputs.currentAge) * 0.8)}</p>
                </div>
            </div>

            {/* Content: 3 Asset Classes */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 flex-1 relative z-10">
                {/* หุ้น (Stocks) = 100 - อายุ */}
                <div className="relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-4 py-6 md:py-8 flex flex-col justify-center items-center text-center border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white hover:from-indigo-50 hover:to-indigo-50/80 transition-all duration-300 group/card cursor-default">
                    <span className="text-xs md:text-xs text-indigo-600 font-bold mb-1 md:mb-2 uppercase tracking-wider">หุ้น</span>
                    <span className="text-2xl md:text-4xl font-black text-indigo-900 tracking-tight">{(100 - inputs.currentAge)}<span className="text-sm md:text-lg align-top ml-0.5 opacity-60">%</span></span>
                </div>
                {/* ตราสารหนี้ (Bonds) = (อายุ * 0.8) */}
                <div className="relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-4 py-6 md:py-8 flex flex-col justify-center items-center text-center border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white hover:from-emerald-50 hover:to-emerald-50/80 transition-all duration-300 group/card cursor-default">
                    <span className="text-xs md:text-xs text-emerald-600 font-bold mb-1 md:mb-2 uppercase tracking-wider">ตราสารหนี้</span>
                    <span className="text-2xl md:text-4xl font-black text-emerald-900 tracking-tight">{Math.floor((inputs.currentAge) * 0.8)}<span className="text-sm md:text-lg align-top ml-0.5 opacity-60">%</span></span>
                </div>
                {/* เงินสด (Cash) = ส่วนที่เหลือ */}
                <div className="relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-4 py-6 md:py-8 flex flex-col justify-center items-center text-center border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white hover:from-amber-50 hover:to-amber-50/80 transition-all duration-300 group/card cursor-default">
                    <span className="text-xs md:text-xs text-amber-600 font-bold mb-1 md:mb-2 uppercase tracking-wider">เงินสด</span>
                    <span className="text-2xl md:text-4xl font-black text-amber-900 tracking-tight">{inputs.currentAge - Math.floor((inputs.currentAge) * 0.8)}<span className="text-sm md:text-lg align-top ml-0.5 opacity-60">%</span></span>
                </div>
            </div>

            <p className="relative z-10 text-xs text-slate-400 mt-4 md:mt-6 leading-relaxed flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                เป็นคำแนะนำเบื้องต้น ควรปรับตามความเสี่ยงที่รับได้
            </p>
        </div>
    );
};

interface MonteCarloWidgetProps {
    mcResult: MonteCarloResult | null;
    mcSimulations: number;
    onClick: () => void;
}

// --- MonteCarloWidget: แสดงสรุปผลจำลองสถานการณ์ความเสี่ยง ---
export const MonteCarloWidget: React.FC<MonteCarloWidgetProps> = ({ mcResult, mcSimulations, onClick }) => {
    return (
        <div onClick={onClick} className="rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-[0_20px_60px_-15px_rgba(255,100,100,0.15)] bg-gradient-to-br from-white to-rose-50 border border-slate-100/50 flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-[0_25px_70px_-15px_rgba(255,100,100,0.25)] hover:-translate-y-1 transition-all duration-500 cursor-pointer min-h-[220px] md:min-h-[300px] print:shadow-none print:border print:border-slate-300 print:rounded-xl print:min-h-0">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-rose-100/30 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                    </div>
                    <div>
                        <h3 className="text-lg md:text-lg font-bold text-slate-900 tracking-tight">Monte Carlo</h3>
                        <p className="text-xs md:text-xs font-medium text-rose-500 bg-rose-100/50 px-2 py-0.5 rounded-full border border-rose-100 w-fit mt-0.5">จำลอง {mcSimulations} เหตุการณ์</p>
                    </div>
                </div>

                {/* Content: Probability & P50 */}
                <div className="space-y-3 md:space-y-4">
                    <div>
                        <span className="text-xs md:text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">ความน่าจะเป็น (Success Rate)</span>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-700 tracking-tighter filter drop-shadow-sm transition-all group-hover:scale-105 origin-left duration-300">
                                {Math.round(mcResult?.probability || 0)}%
                            </h2>
                        </div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 border border-rose-100/50 group-hover:bg-white/80 transition-colors">
                        <p className="text-xs md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            มิดเดียนผลลัพธ์ (P50)
                        </p>
                        <span className="font-mono text-lg md:text-xl font-bold text-slate-700 tracking-tight block">฿{formatNumber(mcResult?.p50 || 0)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

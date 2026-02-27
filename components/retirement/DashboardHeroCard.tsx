"use client";

import React from "react";
import { formatNumber, formatNumber2 } from "@/lib/utils";
import { CalculationResult, FormState } from "@/types/retirement";

interface DashboardHeroCardProps {
    result: CalculationResult;
    form: FormState;
    isSidebarOpen: boolean;
}

export const DashboardHeroCard: React.FC<DashboardHeroCardProps> = ({
    result,
    form,
    isSidebarOpen,
}) => {
    return (
        <div className={`min-w-[92%] sm:min-w-[380px] md:min-w-0 snap-center relative rounded-[28px] p-5 lg:p-8 xl:p-10 overflow-hidden font-sans border border-white/20 shadow-xl transition-all duration-500 group print:hidden min-h-[220px] md:min-h-0 flex flex-col justify-center ${result.status === 'enough' ? 'bg-linear-to-br from-[#065f46] via-[#059669] to-[#10b981]' : 'bg-linear-to-br from-[#991b1b] via-[#dc2626] to-[#ef4444]'}`}>
            {/* Decorative Background Patterns */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none mix-blend-overlay animate-pulse duration-4000"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

            {/* Content Container */}
            <div className={`relative z-10 flex flex-col ${isSidebarOpen ? '2xl:flex-row' : 'xl:flex-row'} xl:items-center justify-between gap-6 lg:gap-10 h-full`}>
                {/* Left Side: Status & Message */}
                <div className="flex-1 space-y-4 lg:space-y-6 flex flex-col justify-center">
                    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full border backdrop-blur-md shadow-sm ${result.status === 'enough' ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-50' : 'bg-red-500/20 border-red-400/30 text-red-50'}`}>
                        <span className={`relative flex h-2.5 w-2.5 lg:h-3 lg:w-3`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${result.status === 'enough' ? 'bg-emerald-300' : 'bg-red-300'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 lg:h-3 lg:w-3 ${result.status === 'enough' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        </span>
                        <span className="text-xs lg:text-sm font-bold tracking-wide uppercase">{result.status === 'enough' ? 'สถานะ : เป้าหมายสำเร็จ' : 'สถานะ : ต้องปรับปรุงแผน'}</span>
                    </div>

                    <div className="space-y-2 lg:space-y-3">
                        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                            {result.status === 'enough' ? 'แผนการเงินมั่นคง' : 'แผนการเงินยังมีความเสี่ยง'}
                        </h1>
                        <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-white/90">
                            {result.status === 'enough' ? 'พร้อมเกษียณอย่างสบายตามที่ตั้งใจ' : 'ควรเริ่มวางแผนเก็บออมเพิ่มเติมทันที'}
                        </h2>
                    </div>

                    <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm max-w-xl">
                        <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 mt-0.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                            {result.status === 'enough'
                                ? 'ยินดีด้วย! สินทรัพย์ของคุณเพียงพอสำหรับการเกษียณ คุณมีอิสรภาพทางการเงินแล้ว'
                                : `คุณยังขาดเงินเกษียณอีก ฿${formatNumber(Math.abs(result.gap))} ลองเพิ่มเงินออมหรือปรับเปลี่ยนแผนการลงทุน`}
                        </p>
                    </div>
                </div>

                {/* Right Side: Summary Stats Card */}
                <div className="hidden md:block shrink-0 relative group/stats cursor-default w-full lg:w-auto">
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-[24px] lg:rounded-[32px] transform rotate-1 lg:rotate-3 group-hover/stats:rotate-2 lg:group-hover/stats:rotate-6 transition-transform duration-500"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 min-w-[280px] lg:min-w-[320px] shadow-2xl overflow-hidden">
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/stats:translate-x-full transition-transform duration-1000"></div>

                        <div className="flex flex-col gap-6">
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm lg:text-base font-bold text-white/90 uppercase tracking-wide">เงินออมที่มีตอนอายุเกษียณ ({form.retireAge} ปี)</p>
                                    <div className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]"></div>
                                </div>
                                <p className="text-3xl lg:text-4xl xl:text-[42px] font-black tracking-tighter text-white drop-shadow-sm leading-none">
                                    ฿{formatNumber(result.projectedFund)}
                                </p>
                            </div>

                            <div className="h-px bg-linear-to-r from-transparent via-white/30 to-transparent w-full"></div>

                            <div className="flex-1 text-left">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm lg:text-base font-bold text-white/80 uppercase tracking-wide">เงินที่ต้องการก่อนเกษียณ</p>
                                    <div className="w-2 h-2 rounded-full bg-blue-200/50"></div>
                                </div>
                                <p className="text-3xl lg:text-3xl font-bold tracking-tight text-white/95 leading-none">
                                    ฿{formatNumber(result.targetFund)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

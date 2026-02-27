"use client";

import React from "react";
import { formatNumber2 } from "@/lib/utils";
import { CalculationResult, FormState } from "@/types/retirement";

interface DashboardMetricCardsProps {
    result: CalculationResult;
    form: FormState;
    isSidebarOpen: boolean;
    onShowProjectedModal: () => void;
    onShowTargetModal: (tab?: "details" | "formula") => void;
    onShowExpenseModal: () => void;
}

export const DashboardMetricCards: React.FC<DashboardMetricCardsProps> = ({
    result,
    form,
    isSidebarOpen,
    onShowProjectedModal,
    onShowTargetModal,
    onShowExpenseModal,
}) => {
    return (
        <div className="contents md:flex md:flex-col md:gap-3 relative print:hidden">
            {/* Grid Background Decoration */}
            <div className="hidden md:block absolute inset-0 -m-8 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[24px_24px] opacity-30 pointer-events-none"></div>

            <div className={`contents md:grid md:grid-cols-2 md:gap-6 relative z-10 ${isSidebarOpen ? 'xl:grid-cols-1 2xl:grid-cols-2' : ''}`}>
                {/* Card 1: Projected Savings */}
                <div
                    onClick={onShowProjectedModal}
                    className="min-w-[92%] sm:min-w-[380px] md:min-w-0 snap-center bg-white rounded-[28px] p-5 lg:p-7 border border-slate-100 relative overflow-hidden group cursor-pointer hover:border-emerald-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)] transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] min-h-[200px] md:h-auto flex flex-col justify-between"
                >
                    <div className="absolute -right-8 -top-8 text-emerald-100/50 group-hover:text-emerald-200/50 transition-colors pointer-events-none z-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 0.6-3.8 1.5l-2.5 2.5a3.5 3.5 0 0 1-4.9-5.0L10.3 1.5" /><path d="M19 5a3 5 0 0 1 0 6h-6.7" /><path d="M12 11l-3 3" /><circle cx="5" cy="18" r="4" /><path d="M9 18l6-6" /></svg>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10 transition-colors group-hover:bg-emerald-100/80 -z-10"></div>
                    <div className="relative flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                            <div>
                                <p className="text-sm sm:text-base font-extrabold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">เงินออมที่มีตอนอายุเกษียณ ({form.retireAge} ปี)</p>
                                <span className="text-[10px] lg:text-xs bg-slate-100/80 backdrop-blur-sm text-slate-500 px-2.5 py-0.5 rounded-lg font-bold border border-slate-200/50 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all uppercase tracking-wider">Projected Wealth</span>
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-3 transition-all duration-300 shadow-sm border border-emerald-100/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 0.6-3.8 1.5l-2.5 2.5a3.5 3.5 0 0 1-4.9-5.0L10.3 1.5" /><path d="M19 5a3 5 0 0 1 0 6h-6.7" /><path d="M12 11l-3 3" /><circle cx="5" cy="18" r="4" /><path d="M9 18l6-6" /></svg>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <h4 className="text-[28px] lg:text-3xl xl:text-[40px] font-black text-slate-900 tracking-tight leading-none mb-1 lg:mb-2 group-hover:text-emerald-600 transition-colors flex items-baseline gap-1">
                                <span className="text-lg font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">฿</span>
                                {formatNumber2(result.projectedFund)}
                            </h4>
                            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 group-hover:text-emerald-600/70 transition-colors">
                                จากการออมและการลงทุน
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 2: Target Fund */}
                <div
                    onClick={() => onShowTargetModal('details')}
                    className="min-w-[92%] sm:min-w-[380px] md:min-w-0 snap-center bg-white rounded-[28px] p-5 lg:p-7 border border-slate-100 relative overflow-hidden group cursor-pointer hover:border-blue-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.1)] transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] min-h-[200px] md:h-auto flex flex-col justify-between"
                >
                    <div className="absolute -right-8 -top-8 text-blue-100/50 group-hover:text-blue-200/50 transition-colors pointer-events-none z-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10 transition-colors group-hover:bg-blue-100/80 -z-10"></div>
                    <div className="relative flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                            <div>
                                <p className="text-sm sm:text-base font-extrabold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">เงินที่ต้องการก่อนเกษียณ</p>
                                <span className="text-[10px] lg:text-xs bg-slate-100/80 backdrop-blur-sm text-slate-500 px-2.5 py-0.5 rounded-lg font-bold border border-slate-200/50 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all uppercase tracking-wider">Retirement Goal</span>
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:-rotate-3 transition-all duration-300 shadow-sm border border-blue-100/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <h4 className="text-[28px] lg:text-3xl xl:text-[40px] font-black text-slate-900 tracking-tight leading-none mb-2 group-hover:text-blue-600 transition-colors flex items-baseline gap-1">
                                <span className="text-lg font-bold text-slate-400 group-hover:text-blue-400 transition-colors">฿</span>
                                {formatNumber2(result.targetFund)}
                            </h4>
                            <div className="flex flex-col gap-1">
                                <p className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600/70 transition-colors line-clamp-1">
                                    สำหรับ {result.yearsInRetirement} ปีหลังเกษียณ
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 group-hover:text-blue-600/70 transition-colors">
                                    <span>ออมขั้นต่ำคร่าวๆ ฿{formatNumber2(result.monthlyNeeded)}/เดือน</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onShowTargetModal('formula');
                                        }}
                                        className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-800 flex items-center justify-center text-xs font-bold transition-all opacity-0 group-hover:opacity-100 duration-300"
                                    >
                                        !
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Monthly Expense */}
                <div
                    onClick={onShowExpenseModal}
                    className="min-w-[92%] sm:min-w-[380px] md:min-w-0 snap-center bg-white rounded-[28px] p-5 lg:p-7 border border-slate-100 relative overflow-hidden group cursor-pointer hover:border-purple-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(168,85,247,0.1)] transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] min-h-[200px] md:h-auto flex flex-col justify-between"
                >
                    <div className="absolute -right-8 -top-8 text-purple-100/50 group-hover:text-purple-200/50 transition-colors pointer-events-none z-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-purple-50 rounded-full blur-2xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10 transition-colors group-hover:bg-purple-100/80 -z-10"></div>
                    <div className="relative flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                            <div>
                                <p className="text-sm sm:text-base font-extrabold text-slate-800 mb-1 group-hover:text-purple-700 transition-colors">ค่าใช้จ่าย/เดือน (ปีแรก)</p>
                                <span className="text-[10px] lg:text-xs bg-slate-100/80 backdrop-blur-sm text-slate-500 px-2.5 py-0.5 rounded-lg font-bold border border-slate-200/50 group-hover:bg-purple-50 group-hover:text-purple-600 group-hover:border-purple-100 transition-all uppercase tracking-wider">Future Expense</span>
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm border border-purple-100/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <h4 className="text-[28px] lg:text-3xl xl:text-[40px] font-black text-slate-900 tracking-tight leading-none mb-1 lg:mb-2 group-hover:text-purple-600 transition-colors flex items-baseline gap-1">
                                <span className="text-lg font-bold text-slate-400 group-hover:text-purple-400 transition-colors">฿</span>
                                {formatNumber2(result.fvExpenseMonthly)}
                            </h4>
                            <p className="text-xs font-semibold text-slate-400 group-hover:text-purple-600/70 transition-colors">
                                รวมเงินเฟ้อแล้ว (ทั้งชีวิต ฿{formatNumber2(result.totalLifetimeExpense)})
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 4: Status */}
                <div
                    className={`min-w-[92%] sm:min-w-[380px] md:min-w-0 snap-center bg-white rounded-[28px] p-5 lg:p-7 border border-slate-100 relative overflow-hidden group cursor-default transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] min-h-[200px] md:h-auto flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${result.status === 'enough' ? 'hover:border-emerald-100 hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)]' : 'hover:border-rose-100 hover:shadow-[0_15px_30px_rgba(244,63,94,0.1)]'}`}
                >
                    <div className={`absolute -right-8 -top-8 transition-colors pointer-events-none z-0 ${result.status === 'enough' ? 'text-emerald-100/50 group-hover:text-emerald-200/50' : 'text-rose-100/50 group-hover:text-rose-200/50'}`}>
                        {result.status === 'enough' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 -rotate-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        )}
                    </div>
                    <div className={`absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 rounded-full blur-2xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10 transition-colors -z-10 ${result.status === 'enough' ? 'bg-emerald-50 group-hover:bg-emerald-100/80' : 'bg-rose-50 group-hover:bg-rose-100/80'}`}></div>
                    <div className="relative flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                            <div>
                                <p className={`text-sm sm:text-base font-extrabold mb-1 transition-colors ${result.status === 'enough' ? 'text-slate-800 group-hover:text-emerald-700' : 'text-slate-800 group-hover:text-rose-700'}`}>สถานะแผน</p>
                                <span className={`text-[10px] lg:text-xs bg-slate-100/80 backdrop-blur-sm px-2.5 py-0.5 rounded-lg font-bold border border-slate-200/50 transition-all uppercase tracking-wider ${result.status === 'enough' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    Result Status
                                </span>
                            </div>
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm border ${result.status === 'enough' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-rose-50 text-rose-600 border-rose-100/50 group-hover:bg-rose-600 group-hover:text-white'}`}>
                                {result.status === 'enough' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                )}
                            </div>
                        </div>
                        <div className="mt-auto">
                            <h4 className={`text-[28px] lg:text-3xl xl:text-[40px] font-black tracking-tight leading-none mb-1 lg:mb-2 transition-colors ${result.status === 'enough' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {result.status === 'enough' ? "เพียงพอ" : "ไม่พอ"}
                            </h4>
                            <p className="text-xs font-semibold text-slate-400 group-hover:text-slate-500 transition-colors">
                                {result.status === 'enough' ? "คุณทำได้ดีมาก แผนการออมยั่งยืน" : "สินทรัพย์ไม่เพียงพอ ต้องปรับแผนด่วน"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

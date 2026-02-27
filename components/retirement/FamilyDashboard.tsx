import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { MemberProfile, FormState, Allocation } from "@/types/retirement";
import { buildRetirementInputs, calculateRetirement } from "@/lib/retirement-calculation";
import { formatNumber } from "@/lib/utils";

interface FamilyDashboardProps {
    familyMembers: MemberProfile[]; // รายชื่อสมาชิกในครอบครัว
    currentMemberId: string; // ID ของสมาชิกที่กำลังดูข้อมูล
    form: FormState; // ข้อมูลฟอร์มปัจจุบัน
    gender: "male" | "female"; // เพศปัจจุบัน
    savingMode: "flat" | "step5"; // โหมดการออม
    returnMode: "avg" | "custom"; // โหมดผลตอบแทน
    allocations: Allocation[]; // การจัดพอร์ตปัจจุบัน
    setPlanType: (type: "individual" | "family" | null) => void; // ฟังก์ชันเปลี่ยนประเภทแผน
    setShowFamilyResult: (show: boolean) => void; // ฟังก์ชันแสดง/ซ่อนผลลัพธ์ครอบครัว
    handleSwitchMember: (id: string) => void; // ฟังก์ชันสลับสมาชิก
    handleAddMember: () => void; // ฟังก์ชันเพิ่มสมาชิกใหม่
    handleRemoveMember: (id: string, e?: React.MouseEvent) => void; // ฟังก์ชันลบสมาชิก
    getFamilySummary: () => { // ฟังก์ชันคำนวณภาพรวมครอบครัว
        totalTarget: number;
        totalProjected: number;
        totalGap: number;
        memberCount: number;
        totalMonthlySavingsCurrent: number;
        totalMonthlyNeeded: number;
    };
    setShowResult: (show: boolean) => void; // ฟังก์ชันแสดง/ซ่อนผลลัพธ์เดี่ยว
}

// --- InfoTooltip Component ---
const InfoTooltip: React.FC<{ content: React.ReactNode }> = ({ content }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    return (
        <div
            className="relative inline-flex ml-1.5 group/tooltip shrink-0"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }}
        >
            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[9px] font-bold cursor-help hover:border-indigo-400 hover:text-indigo-500 transition-colors">!</div>
            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                    <div className="relative z-10 leading-relaxed font-medium text-left">
                        {content}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
            )}
        </div>
    );
};

// --- FamilyDashboard: หน้าภาพรวมแผนการเงินครอบครัว ---
export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
    familyMembers,
    currentMemberId,
    form,
    gender,
    savingMode,
    returnMode,
    allocations,
    setPlanType,
    setShowFamilyResult,
    handleSwitchMember,
    handleAddMember,
    handleRemoveMember,
    getFamilySummary,
    setShowResult
}) => {
    const summary = getFamilySummary();
    const totalProgress = Math.min(100, (summary.totalMonthlySavingsCurrent / (summary.totalMonthlyNeeded || 1)) * 100);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 animate-in fade-in duration-700 relative overflow-hidden">
            {/* Background Decor - Exact match to Input Section (ลวดลายพื้นหลัง) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23cbd5e1'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
                    maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
                }}
            />

            <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm print:hidden transition-all">
                <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setPlanType(null);
                                setShowFamilyResult(false);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div>
                            <h1 className="text-base md:text-2xl font-black text-slate-900 tracking-tight flex flex-col md:flex-row md:items-center md:gap-2 leading-tight">
                                <span className="text-slate-900">ภาพรวมครอบครัว</span>
                                <span className="text-slate-400 font-bold md:font-black text-xs md:text-2xl mt-0.5 md:mt-0">(Family Overview)</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium hidden sm:block">ภาพรวมแผนการเงินของครอบครัว ({familyMembers.filter(m => !m.isDraft).length} ท่าน)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => window.print()} className="px-3 py-2.5 md:px-5 bg-[#1e293b] text-white text-xs font-bold rounded-2xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                            <span className="hidden md:inline">พิมพ์รายงาน (Print Report)</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                {/* 1. STATUS HEADER (ส่วนแสดงสถานะหลัก) */}
                <div className="relative -mx-4 px-4 sm:px-0">
                    <div className="flex gap-4 overflow-x-auto pb-0 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0 no-scrollbar">

                        {/* Status Card (สถานะภาพรวม) */}
                        <div className="min-w-[85vw] sm:min-w-[45vw] lg:min-w-0 snap-center">
                            <div className="bg-white rounded-[24px] lg:rounded-[32px] p-6 lg:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out group relative overflow-hidden flex flex-col items-center text-center justify-center min-h-[160px] lg:min-h-[180px] h-full">
                                <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-3 lg:mb-4 shadow-inner ${summary.totalGap >= 0 ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}>
                                    {summary.totalGap >= 0
                                        ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                        : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    }
                                </div>
                                <div>
                                    <div className="text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">สถานะภาพรวม</div>
                                    <div className={`text-base lg:text-xl font-black ${summary.totalGap >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                        {summary.totalGap >= 0 ? "มั่งคั่ง (Wealthy)" : "ต้องปรับปรุง"}
                                        {summary.totalGap >= 0 && <span className="ml-2 text-amber-400 inline-block animate-pulse">✨</span>}
                                    </div>
                                    <div className={`text-[10px] font-bold mt-2 px-3 py-1 rounded-full inline-block ${summary.totalGap >= 0 ? "bg-emerald-100/50 text-emerald-700" : "bg-red-100/50 text-red-700"}`}>
                                        {summary.totalGap >= 0 ? "เงินเพียงพอตลอดชีพ" : "เงินไม่เพียงพอ"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Target Card (เป้าหมายรวม) */}
                        <div className="min-w-[85vw] sm:min-w-[45vw] lg:min-w-0 snap-center">
                            <div className="bg-white rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden flex flex-col justify-center min-h-[160px] lg:min-h-[180px] h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                                        <div className="w-1 h-4 lg:h-5 rounded-full bg-blue-500"></div>
                                        <span className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                                            เป้าหมายเกษียณรวม
                                            <InfoTooltip content="เงินก้อนที่ 'ต้องเตรียม' เพื่อให้สมาชิกทุกคนในครอบครัวมีกินมีใช้หลังเกษียณไปตลอดชีวิต" />
                                        </span>
                                    </div>
                                    <div className="text-xl lg:text-4xl font-black text-slate-800 tracking-tighter">฿{formatNumber(summary.totalTarget)}</div>
                                    <div className="mt-1 lg:mt-2 text-[10px] lg:text-xs text-slate-400 font-medium">Total Target Fund</div>
                                </div>
                            </div>
                        </div>

                        {/* Projected Card (เงินออมคาดการณ์รวม) */}
                        <div className="min-w-[85vw] sm:min-w-[45vw] lg:min-w-0 snap-center">
                            <div className="bg-white rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden flex flex-col justify-center min-h-[160px] lg:min-h-[180px] h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                                        <div className="w-1 h-4 lg:h-5 rounded-full bg-indigo-500"></div>
                                        <span className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                                            เงินออมคาดการณ์
                                            <InfoTooltip content="เงินก้อนที่จะมีในอนาคต (คำนวณจาก: เงินต้น + เงินออมเพิ่ม + ดอกเบี้ยทบต้น)" />
                                        </span>
                                    </div>
                                    <div className="text-xl lg:text-4xl font-black text-indigo-600 tracking-tighter">฿{formatNumber(summary.totalProjected)}</div>
                                    <div className="mt-1 lg:mt-2 text-[10px] lg:text-xs text-slate-400 font-medium">Projected Savings</div>
                                </div>
                            </div>
                        </div>

                        {/* Gap Card (ส่วนต่าง) */}
                        <div className="min-w-[85vw] sm:min-w-[45vw] lg:min-w-0 snap-center">
                            <div className={`rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden flex flex-col justify-center min-h-[160px] lg:min-h-[180px] h-full ${summary.totalGap >= 0 ? "bg-gradient-to-br from-[#10b981] to-[#059669] text-white" : "bg-gradient-to-br from-red-500 to-red-600 text-white"}`}>
                                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                                        <div className="w-1 h-4 lg:h-5 rounded-full bg-white/60"></div>
                                        <span className="text-[10px] lg:text-xs font-bold text-white/90 uppercase tracking-wider flex items-center">
                                            ส่วนต่างเป้าหมาย
                                            <div className="relative inline-flex ml-1.5 group/tooltip shrink-0">
                                                <div className="w-3.5 h-3.5 rounded-full border border-white/40 text-white/80 flex items-center justify-center text-[9px] font-bold cursor-help hover:border-white hover:text-white transition-colors">!</div>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-[100] hidden group-hover/tooltip:block pointer-events-none">
                                                    <div className="relative z-10 leading-relaxed font-medium text-left">
                                                        ถ้าเป็น <span className="text-emerald-300 font-bold">บวก (+)</span> แสดงว่าเงินเหลือใช้สบายๆ <br />
                                                        ถ้าเป็น <span className="text-red-300 font-bold">ลบ (-)</span> แสดงว่าเงินยังขาด ต้องรีบออมเพิ่ม
                                                    </div>
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                                </div>
                                            </div>
                                        </span>
                                    </div>
                                    <div className="text-xl lg:text-4xl font-black tracking-tighter flex items-center gap-1">
                                        {summary.totalGap >= 0 ? "+" : ""}{formatNumber(Math.abs(summary.totalGap))}
                                    </div>
                                    <div className="mt-3 inline-flex">
                                        <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md shadow-sm border border-white/10">
                                            {summary.totalGap >= 0 ? "เงินส่วนเกิน (Surplus)" : "เงินที่ขาด (Shortfall)"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. AI INSIGHT & PERFORMANCE (บทวิเคราะห์ AI) */}
                <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-600 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>
                        </div>
                        <h4 className="text-lg lg:text-2xl font-black text-slate-800 tracking-tight">บทวิเคราะห์จาก AI (AI Insight)</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Left: Text */}
                        <div className="space-y-10">
                            <div className="bg-amber-50/40 p-8 rounded-[32px] border border-amber-100 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400 group-hover:w-2.5 transition-all duration-300"></div>
                                <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    สรุปผลวิเคราะห์ (ANALYSIS SUMMARY)
                                </div>
                                <p className="text-sm lg:text-base text-slate-700 leading-relaxed font-medium">
                                    จากการประเมินแผนการเกษียณของสมาชิกในครอบครัว
                                    {summary.totalGap >= 0
                                        ? " พบว่าภาพรวมสถานะทางการเงินมีความแข็งแกร่ง (Strong Health) สามารถบรรลุเป้าหมายเกษียณได้ทุกคน มีเงินสำรองเพียงพอสำหรับการใช้ชีวิตในระยะยาว"
                                        : " พบความเสี่ยงที่เงินออมอาจไม่เพียงพอในระยะยาว (Shortfall Risk) แนะนำปรับโครงสร้างการออมหรือลดรายจ่ายบางส่วนเพื่อให้ครอบคลุมเป้าหมาย"}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-slate-200"></span>
                                    คำแนะนำ (Suggestion)
                                </div>
                                <div className="grid gap-4">
                                    <div className="flex items-start gap-5 p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm mb-1.5">ทบทวนความคุ้มครอง</div>
                                            <div className="text-xs text-slate-500 font-medium leading-relaxed">ควรตรวจสอบสิทธิประโยชน์ทางภาษี ประกันสุขภาพ และโรคร้ายแรงให้ครอบคลุมสมาชิกทุกคน</div>
                                        </div>
                                    </div>
                                    {summary.totalMonthlySavingsCurrent < summary.totalMonthlyNeeded && (
                                        <div className="flex items-start gap-5 p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm mb-1.5">ปรับเพิ่มสัดส่วนการออม</div>
                                                <div className="text-xs text-slate-500 font-medium">
                                                    แนะนำออมเพิ่มรวมกัน <span className="font-bold text-amber-500">฿{formatNumber(summary.totalMonthlyNeeded - summary.totalMonthlySavingsCurrent)}</span> ต่อเดือน เพื่อปิดช่องว่างทางการเงิน
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Graphic */}
                        <div className="bg-slate-50/50 rounded-[40px] p-6 lg:p-10 border border-slate-100 flex flex-col justify-center items-center text-center relative overflow-hidden h-full min-h-[380px] lg:min-h-[440px]">
                            <div className="bg-white px-5 py-2 rounded-full border border-slate-200/60 shadow-sm mb-8 lg:mb-12">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    คะแนนความสำเร็จ (SUCCESS SCORE)
                                    <InfoTooltip content={
                                        <span>
                                            บอกว่าแผนของคุณ <b>"ปลอดภัย"</b> แค่ไหน<br />
                                            • <b>100% ขึ้นไป:</b> ดีมาก! เงินพอใช้แน่นอน<br />
                                            • <b>ต่ำกว่า 100%:</b> ยังมีความเสี่ยง ควรหารายได้เพิ่มหรือลดรายจ่าย
                                        </span>
                                    } />
                                </span>
                            </div>

                            <div className="relative w-56 h-56 lg:w-72 lg:h-72 flex items-center justify-center mb-8 lg:mb-12">
                                {/* Background Ring */}
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="10" fill="none" />
                                    <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="10" fill="none" className="opacity-40" />
                                    <circle cx="50" cy="50" r="40"
                                        stroke={summary.totalGap >= 0 ? "#00c49f" : "#f59e0b"}
                                        strokeWidth="10"
                                        fill="none"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 - (251.2 * (totalProgress / 100))}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter drop-shadow-sm">{totalProgress.toFixed(0)}%</span>
                                </div>
                            </div>

                            <div className="w-full max-w-sm space-y-4 lg:space-y-5">
                                <div>
                                    <div className="flex justify-between items-end mb-2.5">
                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                            ออมจริง (ปัจจุบัน)
                                            <InfoTooltip content="เงินที่ทุกคนในครอบครัวช่วยกันออมได้จริง ๆ ตกเดือนละเท่าไหร่" />
                                        </span>
                                        <span className="text-xs font-black text-slate-800">฿{formatNumber(summary.totalMonthlySavingsCurrent)}</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-slate-800 rounded-full shadow-sm" style={{ width: `${Math.min(100, (summary.totalMonthlySavingsCurrent / summary.totalMonthlyNeeded) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2.5">
                                        <span className="text-xs font-bold text-indigo-500 flex items-center gap-1.5">
                                            เป้าหมาย (ที่ควรทำให้ได้)
                                            <InfoTooltip content="เพื่อให้ทุกคนรอด! ครอบครัวต้องช่วยกันออมให้ได้เดือนละอย่างน้อยเท่านี้" />
                                        </span>
                                        <span className="text-xs font-black text-indigo-600">฿{formatNumber(summary.totalMonthlyNeeded)}</span>
                                    </div>
                                    <div className="h-3 w-full bg-indigo-50 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-indigo-500 rounded-full w-full opacity-60 shadow-sm"></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-4 text-center font-bold bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        ยอดออมต่อเดือนที่แนะนำ เพื่อให้ทุกคนบรรลุเป้าหมายเกษียณ
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MEMBER BREAKDOWN (รายละเอียดรายบุคคล) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <span className="text-indigo-600 bg-indigo-50 p-2.5 rounded-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            </span>
                            รายละเอียดรายบุคคล
                        </h4>
                        <Button
                            variant="outline"
                            onClick={handleAddMember}
                            className="rounded-full border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all gap-2 h-10 px-6 shadow-sm hover:shadow active:scale-95"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            เพิ่มสมาชิกครอบครัว
                        </Button>
                    </div>

                    {/* Mobile & Tablet Card List View (Visible on small screens and Tablets) */}
                    <div className="space-y-4 lg:hidden md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
                        {familyMembers.map((m) => {
                            const isCurrent = String(m.id) === String(currentMemberId);
                            const inputs = buildRetirementInputs({
                                form: isCurrent ? form : m.form,
                                gender: isCurrent ? gender : m.gender,
                                savingMode: isCurrent ? savingMode : m.savingMode,
                                returnMode: isCurrent ? returnMode : m.returnMode,
                                allocations: isCurrent ? allocations : m.allocations
                            });
                            const res = calculateRetirement(inputs);
                            const prog = Math.min(100, (res.projectedFund / (res.targetFund || 1)) * 100);
                            const yearsLeft = Number(m.form.retireAge) - Number(m.form.currentAge);
                            const relationMap: Record<string, string> = { self: "ตนเอง", spouse: "คู่สมรส", child: "บุตร", father: "บิดา", mother: "มารดา", relative: "ญาติ" };

                            return (
                                <div
                                    key={m.id}
                                    className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm active:scale-95 transition-all relative overflow-hidden group"
                                    onClick={() => {
                                        handleSwitchMember(m.id);
                                        setShowFamilyResult(false);
                                        setShowResult(true);
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 pr-8">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black shadow-sm ${res.status === "enough" ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                {(m.form.planName || m.name).charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">
                                                    {m.form.planName || m.name}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md inline-block mt-1">{relationMap[m.relation] || m.relation}</div>
                                            </div>
                                        </div>
                                        {/* Delete Button moved to top right absolute, but ensures padding from text */}
                                        {m.id !== "primary" && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (handleRemoveMember) handleRemoveMember(m.id, e);
                                                }}
                                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 mb-0.5">ช่วงอายุ</div>
                                            <div className="text-sm font-bold text-slate-700">{m.form.currentAge} → {m.form.retireAge} ({yearsLeft} ปี)</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-400 mb-0.5">เป้าหมาย</div>
                                            <div className="text-sm font-black text-slate-800">฿{formatNumber(res.targetFund)}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 mb-0.5">เงินออมปัจจุบัน</div>
                                            <div className="text-sm font-bold text-slate-700">฿{formatNumber(m.form.currentSavings)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-400 mb-0.5">ออมต่อเดือน</div>
                                            <div className="text-sm font-bold text-slate-700">฿{formatNumber(m.form.monthlySaving)}</div>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-slate-50 mt-1">
                                            <div className="flex justify-between items-end mb-1">
                                                <div className="text-[10px] font-bold text-slate-400">สถานะ</div>
                                                {res.status === "enough"
                                                    ? <span className="text-xs font-bold text-emerald-600">เพียงพอ</span>
                                                    : <span className="text-xs font-bold text-red-500">ขาด {formatNumber(Math.abs(res.gap))}</span>
                                                }
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${res.status === "enough" ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${prog}%` }}></div>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 text-right mt-1">ความคืบหน้า {prog.toFixed(0)}%</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {familyMembers.length < 10 && (
                            <button
                                onClick={handleAddMember}
                                className="w-full h-full min-h-[180px] rounded-[24px] border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300 transition-all active:scale-95"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl pb-1">+</div>
                                เพิ่มสมาชิกใหม่
                            </button>
                        )}
                    </div>

                    <div className="hidden lg:block bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="py-6 px-8 w-[25%]">สมาชิกครอบครัว</th>
                                        <th className="py-6 px-4 text-center w-[15%]">ช่วงอายุ (เวลา)</th>
                                        <th className="py-6 px-4 text-right w-[15%]">เงินออมปัจจุบัน</th>
                                        <th className="py-6 px-4 text-right w-[15%]">ออมต่อเดือน</th>
                                        <th className="py-6 px-4 text-right w-[15%]">เป้าหมาย</th>
                                        <th className="py-6 px-8 text-right w-[15%]">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50/50">
                                    {familyMembers.map((m) => {
                                        const isCurrent = String(m.id) === String(currentMemberId);
                                        const inputs = buildRetirementInputs({
                                            form: isCurrent ? form : m.form,
                                            gender: isCurrent ? gender : m.gender,
                                            savingMode: isCurrent ? savingMode : m.savingMode,
                                            returnMode: isCurrent ? returnMode : m.returnMode,
                                            allocations: isCurrent ? allocations : m.allocations
                                        });
                                        const res = calculateRetirement(inputs);
                                        const prog = Math.min(100, (res.projectedFund / (res.targetFund || 1)) * 100);
                                        const yearsLeft = Number(m.form.retireAge) - Number(m.form.currentAge);
                                        const relationMap: Record<string, string> = { self: "ตนเอง", spouse: "คู่สมรส", child: "บุตร", father: "บิดา", mother: "มารดา", relative: "ญาติ" };

                                        return (
                                            <tr
                                                key={m.id}
                                                className="hover:bg-indigo-50/30 transition-all cursor-pointer group/row border-b border-slate-50 last:border-0 relative"
                                                onClick={() => {
                                                    handleSwitchMember(m.id);
                                                    setShowFamilyResult(false);
                                                    setShowResult(true);
                                                }}
                                            >
                                                <td className="py-6 px-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black shadow-sm transition-transform group-hover/row:scale-105 group-hover/row:rotate-3 ${res.status === "enough" ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                            {(m.form.planName || m.name).charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 flex items-center gap-2 text-sm group-hover/row:text-indigo-600 transition-colors">
                                                                {m.form.planName || m.name}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg inline-block mt-1.5">{relationMap[m.relation] || m.relation}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-center">
                                                    <div className="font-bold text-slate-700 text-sm">{m.form.currentAge} → {m.form.retireAge}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{yearsLeft} ปี</div>
                                                </td>
                                                <td className="py-6 px-4 text-right font-medium text-slate-700 text-sm">
                                                    ฿{formatNumber(m.form.currentSavings)}
                                                </td>
                                                <td className="py-6 px-4 text-right font-medium text-slate-700 text-sm">
                                                    ฿{formatNumber(m.form.monthlySaving)}
                                                </td>
                                                <td className="py-6 px-4 text-right font-black text-slate-800 text-base">
                                                    ฿{formatNumber(res.targetFund)}
                                                </td>
                                                <td className="py-6 px-8 text-right relative">
                                                    <div className="flex flex-col items-end gap-1">
                                                        {res.status === "enough"
                                                            ? <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 shadow-sm">เพียงพอ</span>
                                                            : <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 shadow-sm">ขาด {formatNumber(Math.abs(res.gap))}</span>
                                                        }
                                                        <div className="text-[10px] font-bold text-slate-400">{prog.toFixed(0)}%</div>
                                                    </div>
                                                    {m.id !== "primary" && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (handleRemoveMember) handleRemoveMember(m.id, e);
                                                            }}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-sm opacity-0 group-hover/row:opacity-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all z-10 hover:shadow-md hover:scale-105 active:scale-95"
                                                            title="ลบสมาชิก (Delete Member)"
                                                        >
                                                            <Trash2 size={16} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}

                                    {familyMembers.length < 10 && (
                                        <tr
                                            className="bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer border-t border-slate-100 group/add"
                                            onClick={handleAddMember}
                                        >
                                            <td colSpan={5} className="py-8 px-8">
                                                <div className="flex items-center justify-center gap-3 text-slate-400 font-bold group-hover/add:text-indigo-600 transition-colors">
                                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200/60 flex items-center justify-center text-xl group-hover/add:border-indigo-200 group-hover/add:bg-indigo-50 transition-all shadow-sm group-hover/add:scale-110">+</div>
                                                    <span className="text-sm tracking-wide">เพิ่มสมาชิกครอบครัว</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* PRINT REPORT SECTION (ส่วนสำหรับพิมพ์รายงาน) */}
                <div id="family-print-report" className="hidden print:block bg-white p-8 font-mono text-black">
                    {/* Print Header */}
                    <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                        <div>
                            <h1 className="text-xl font-bold uppercase tracking-tight text-black">FAMILY FINANCIAL PLAN</h1>
                            <p className="text-xs font-medium mt-1 text-black">รายงานสรุปแผนการเงินครอบครัว</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold uppercase text-black">DATE</div>
                            <div className="text-sm font-bold text-black">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="mb-8 border border-black p-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-2 border-b border-black pb-1 inline-block">EXECUTIVE SUMMARY</h2>
                        <div className="flex gap-6 mt-2">
                            <div className="w-3/4 text-xs leading-relaxed text-justify">
                                <p>
                                    จากการประเมินแผนการเกษียณของสมาชิกครอบครัวทั้งหมด {familyMembers.length} ท่าน:
                                </p>
                                <p className="mt-2">
                                    {summary.totalGap >= 0
                                        ? "สถานะทางการเงินโดยรวมอยู่ในเกณฑ์ที่ดี (Wealthy) สามารถบรรลุเป้าหมายเกษียณได้ทุกคน มีเงินสำรองเพียงพอ."
                                        : "สถานะทางการเงินโดยรวมยังมีความเสี่ยง (Shortfall) จำเป็นต้องปรับปรุงแผนการออมเพื่อให้บรรลุเป้าหมาย."}
                                </p>
                            </div>
                            <div className="w-1/4 flex flex-col items-end gap-2">
                                <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase">Family Status</div>
                                    <div className="text-sm font-bold border px-2 py-1 inline-block mt-1 border-black">
                                        {summary.totalGap >= 0 ? "WEALTHY" : "IMPROVE"}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase">Score</div>
                                    <div className="text-sm font-bold">{totalProgress.toFixed(0)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Metrics Table */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-2">FINANCIAL OVERVIEW</h3>
                        <div className="border border-black">
                            <div className="grid grid-cols-3 divide-x divide-black border-b border-black bg-gray-100 print:bg-gray-100">
                                <div className="p-2 text-[10px] font-bold uppercase text-center">Total Target</div>
                                <div className="p-2 text-[10px] font-bold uppercase text-center">Projected Wealth</div>
                                <div className="p-2 text-[10px] font-bold uppercase text-center">Gap (+/-)</div>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-black">
                                <div className="p-3 text-center text-sm font-bold">฿{formatNumber(summary.totalTarget)}</div>
                                <div className="p-3 text-center text-sm font-bold">฿{formatNumber(summary.totalProjected)}</div>
                                <div className="p-3 text-center text-sm font-bold">
                                    {summary.totalGap >= 0 ? "+" : ""}{formatNumber(summary.totalGap)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member Breakdown Table */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-2">MEMBER ANALYSIS</h3>
                        <table className="w-full text-xs border-collapse border border-black">
                            <thead>
                                <tr className="bg-gray-100 print:bg-gray-100 border-b border-black text-center">
                                    <th className="py-2 px-2 border-r border-black uppercase w-[25%] text-left">Member</th>
                                    <th className="py-2 px-2 border-r border-black uppercase w-[10%]">Age</th>
                                    <th className="py-2 px-2 border-r border-black uppercase w-[20%] text-right">Target</th>
                                    <th className="py-2 px-2 border-r border-black uppercase w-[20%] text-right">Projected</th>
                                    <th className="py-2 px-2 uppercase w-[25%] text-left pl-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black">
                                {familyMembers.map((m) => {
                                    const isCurrent = String(m.id) === String(currentMemberId);
                                    const inputs = buildRetirementInputs({
                                        form: isCurrent ? form : m.form,
                                        gender: isCurrent ? gender : m.gender,
                                        savingMode: isCurrent ? savingMode : m.savingMode,
                                        returnMode: isCurrent ? returnMode : m.returnMode,
                                        allocations: isCurrent ? allocations : m.allocations
                                    });
                                    const res = calculateRetirement(inputs);
                                    const relationMap: Record<string, string> = { self: "Self", spouse: "Spouse", child: "Child", father: "Father", mother: "Mother", relative: "Relative" };
                                    return (
                                        <tr key={m.id} className="border-b border-black last:border-0">
                                            <td className="py-2 px-2 border-r border-black">
                                                <div className="font-bold">{m.name}</div>
                                                <div className="text-[10px] italic">{relationMap[m.relation] || m.relation}</div>
                                            </td>
                                            <td className="py-2 px-2 border-r border-black text-center">{m.form.currentAge}</td>
                                            <td className="py-2 px-2 border-r border-black text-right">฿{formatNumber(res.targetFund)}</td>
                                            <td className="py-2 px-2 border-r border-black text-right">฿{formatNumber(res.projectedFund)}</td>
                                            <td className="py-2 px-2 pl-4">
                                                {res.status === "enough"
                                                    ? <span className="font-bold">✓ OK</span>
                                                    : <span className="font-bold">⚠ Needs {formatNumber(Math.abs(res.gap))}</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-black flex justify-between items-center text-[10px]">
                        <div>Generated by Financial Planner App</div>
                        <div>Page 1 of 1</div>
                    </div>
                </div>
            </main>
        </div >
    );
};


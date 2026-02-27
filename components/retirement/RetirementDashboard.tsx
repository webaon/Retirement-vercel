"use client";

import React from "react";
import * as XLSX from "xlsx";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardHeroCard } from "./DashboardHeroCard";
import { DashboardMetricCards } from "./DashboardMetricCards";
import { DashboardChartSection } from "./DashboardChartSection";
import { RetirementInputSection } from "./RetirementInputSection";
import {
    InsuranceTableModal,
    ProjectedModal,
    TargetModal,
    ExpenseModal,
    MonteCarloDetailsModal,
    useInsuranceLogic
} from "./DashboardModals";
import { PlanManager } from "./PlanManager";
import { AllocationWidget, MonteCarloWidget } from "./DashboardWidgets";
import { PlanSummaryPanel } from "./PlanSummaryPanel";
import { Button } from "@/components/ui/button";
import { formatNumber, formatNumber2 } from "@/lib/utils";
import {
    FormState,
    RetirementInputs,
    CalculationResult,
    MonteCarloResult,
    InsurancePlan,
    Allocation
} from "@/types/retirement";
import { PanelLeftOpen, PanelLeftClose, Save, X as CloseIcon, Table as TableIcon } from "lucide-react";

// ----------------------------------------------------------------------
// Props Definition
// ----------------------------------------------------------------------
interface RetirementDashboardProps {
    user: { name: string } | null;
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    inputs: RetirementInputs;
    result: CalculationResult;
    mcResult: MonteCarloResult;
    planType: "individual" | "family" | null;
    syncCurrentToFamily: () => void;
    setShowFamilyResult: (show: boolean) => void;
    handleExportExcel: () => void;
    handlePrint: () => void;
    addInsurancePlan: () => void;
    removeInsurancePlan: (id: string) => void;
    updateInsurancePlan: (index: number, field: keyof InsurancePlan, value: any) => void;
    updateSurrenderTable: (planIndex: number, age: number, value: string) => void;
    setRetireSpendMode: React.Dispatch<React.SetStateAction<"flat" | "step5">>;
    retireSpendMode: "flat" | "step5";
    savingMode: "flat" | "step5";
    setSavingMode: React.Dispatch<React.SetStateAction<"flat" | "step5">>;
    returnMode: "avg" | "custom";
    setReturnMode: React.Dispatch<React.SetStateAction<"avg" | "custom">>;
    allocations: Allocation[];
    setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
    addAllocation: () => void;
    removeAllocation: (id: number) => void;
    updateAllocation: (id: number, field: keyof Allocation) => (e: any) => void;
    handleChange: (key: keyof FormState) => (e: any) => void;
    changeBy: (key: keyof FormState, delta: number) => () => void;
    setGender: (g: "male" | "female") => void;
    gender: "male" | "female";
    onLogout?: () => void;
    onEditProfile?: () => void;
    onBack?: () => void;
}

// ----------------------------------------------------------------------
// Main Component: RetirementDashboard (Refactored)
// ----------------------------------------------------------------------
export const RetirementDashboard = ({
    user, form, setForm, inputs, result, mcResult, planType,
    syncCurrentToFamily, setShowFamilyResult, handleExportExcel, handlePrint,
    addInsurancePlan, removeInsurancePlan, updateInsurancePlan, updateSurrenderTable,
    setRetireSpendMode, retireSpendMode, savingMode, setSavingMode,
    returnMode, setReturnMode, allocations, setAllocations,
    addAllocation, removeAllocation, updateAllocation,
    handleChange, changeBy, setGender, gender,
    onLogout, onEditProfile, onBack
}: RetirementDashboardProps) => {

    // State
    const [showSumAssured, setShowSumAssured] = React.useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = React.useState(false);
    const [showActualSavings, setShowActualSavings] = React.useState(true);
    const [showInsuranceTable, setShowInsuranceTable] = React.useState(false);
    const [showProjectedModal, setShowProjectedModal] = React.useState(false);
    const [showTargetModal, setShowTargetModal] = React.useState(false);
    const [targetModalTab, setTargetModalTab] = React.useState<"details" | "formula">("details");
    const [showExpenseModal, setShowExpenseModal] = React.useState(false);
    const [expenseModalTab, setExpenseModalTab] = React.useState<"details" | "formula">("details");
    const [projectedModalTab, setProjectedModalTab] = React.useState<"details" | "formula">("details");
    const [showMonteCarloDetails, setShowMonteCarloDetails] = React.useState(false);
    const [showMC, setShowMC] = React.useState(true);

    // Mobile Carousel
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const [activeSlide, setActiveSlide] = React.useState(0);

    React.useEffect(() => {
        const container = carouselRef.current;
        if (!container) return;
        let timeoutId: NodeJS.Timeout;
        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const slideWidth = container.clientWidth;
                const scrollLeft = container.scrollLeft;
                const index = Math.round(scrollLeft / slideWidth);
                if (index !== activeSlide) {
                    setActiveSlide(index);
                    const rect = container.getBoundingClientRect();
                    const headerOffset = 140;
                    const scrollTop = window.scrollY + rect.top - headerOffset;
                    window.scrollTo({ top: scrollTop, behavior: 'smooth' });
                }
            }, 100);
        };
        container.addEventListener('scroll', handleScroll);
        return () => { container.removeEventListener('scroll', handleScroll); clearTimeout(timeoutId); };
    }, [activeSlide]);

    React.useEffect(() => {
        if (window.innerWidth < 1280) {
            const el = document.getElementById("results-section");
            if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        }
    }, []);

    const { insuranceChartData } = useInsuranceLogic(form);
    const mcSimulations = Number(form.monteCarloSimulations) || 1500;

    return (
        <div className="min-h-screen bg-white pb-20 font-sans overflow-x-hidden relative print:overflow-visible print:bg-white print-no-padding print-reset-height">
            {/* Print Styles */}
            <style type="text/css" media="print">{`
                @page { size: portrait; margin: 8mm; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; zoom: 0.75; }
                .print-no-padding { padding: 0 !important; margin: 0 !important; }
                .print-reset-height { min-height: 0 !important; height: auto !important; overflow: visible !important; }
                .print-layout-container { display: flex; flex-direction: column; height: auto; width: 100%; max-width: 100%; }
                #printable-chart { height: 300px !important; min-height: 300px !important; border: none !important; box-shadow: none !important; break-inside: avoid; page-break-inside: avoid; width: 100% !important; max-width: 100% !important; overflow: visible !important; display: block !important; margin-bottom: 20px !important; }
                #printable-chart canvas { width: 100% !important; height: 100% !important; max-width: 100% !important; object-fit: contain !important; }
                #print-data-table { display: block !important; margin-top: 20px !important; font-size: 10px; width: 100%; break-before: avoid; page-break-before: avoid; }
                .print-hidden, header, nav, footer, .fixed, .sticky { display: none !important; }
                body.print-desktop .print-desktop-only { display: block !important; }
                body.print-mobile .print-mobile-only { display: block !important; }
            `}</style>

            {/* Background */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 print:hidden">
                <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent opacity-90" />
            </div>

            {/* NAVBAR */}
            <DashboardNavbar user={user} onLogout={onLogout} onEditProfile={onEditProfile} onBack={onBack} />

            <div className="w-full px-3 md:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10 print:px-0 print:space-y-4 pt-[72px] print:pt-0">
                <div className="flex flex-col xl:flex-row items-start gap-0 relative">

                    {/* Mobile Backdrop for Sidebar */}
                    <div className={`fixed inset-0 z-140 bg-black/20 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />

                    {/* LEFT: Sidebar (Input Form) */}
                    <div className={`
                        fixed z-150 transition-all duration-300 ease-in-out
                        inset-0 flex items-end justify-center
                        ${isSidebarOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible xl:opacity-100 xl:pointer-events-none xl:invisible'}
                        xl:fixed xl:top-[72px] xl:bottom-0 xl:left-0 xl:inset-auto xl:block xl:p-0 xl:flex-none xl:bg-transparent xl:shadow-none
                        ${isSidebarOpen ? 'xl:w-[400px] xl:translate-x-0 xl:visible xl:pointer-events-auto xl:opacity-100 xl:overflow-y-auto no-scrollbar' : 'xl:w-0 xl:-translate-x-full xl:invisible xl:pointer-events-none xl:opacity-0 xl:overflow-hidden'}
                        print:hidden
                    `}>
                        <div className={`
                            transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) w-full
                            max-w-none bg-white rounded-t-[32px] rounded-b-none shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col h-[90vh]
                            ${isSidebarOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-100'}
                            xl:max-w-none xl:bg-transparent xl:rounded-none xl:shadow-none xl:h-auto xl:max-h-none xl:overflow-visible xl:translate-y-0 xl:opacity-100
                        `}>
                            <div className="overflow-y-auto p-0 xl:p-0 custom-scrollbar xl:overflow-visible flex flex-col items-center xl:block">
                                <div className="w-full max-w-2xl xl:max-w-none">
                                    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 tracking-tight">ปรับแผนการเงิน</h2>
                                            <span className="text-slate-500 text-xs font-medium">กำหนดแผนเกษียณในแบบของคุณ</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors flex xl:hidden" onClick={() => setIsSidebarOpen(false)}>
                                            <CloseIcon size={20} strokeWidth={2.5} />
                                        </Button>
                                    </div>
                                    <RetirementInputSection
                                        user={user} form={form} handleChange={handleChange} changeBy={changeBy}
                                        gender={gender} setGender={setGender}
                                        addInsurancePlan={addInsurancePlan} removeInsurancePlan={removeInsurancePlan} updateInsurancePlan={updateInsurancePlan}
                                        onViewTable={(id) => { if (id) setForm(prev => ({ ...prev, selectedPlanId: id })); setShowInsuranceTable(true); }}
                                        savingMode={savingMode} setSavingMode={setSavingMode}
                                        returnMode={returnMode} setReturnMode={setReturnMode}
                                        allocations={allocations} addAllocation={addAllocation} removeAllocation={removeAllocation} updateAllocation={updateAllocation}
                                        onCalculate={() => {
                                            setIsSidebarOpen(false); setIsSummaryOpen(false);
                                            setShowInsuranceTable(false); setShowProjectedModal(false); setShowTargetModal(false); setShowExpenseModal(false); setShowMonteCarloDetails(false);
                                            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 550);
                                        }}
                                        isEmbedded={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Main Content */}
                    <div id="results-section" className={`
                        flex-1 min-w-0 space-y-8 transition-all duration-500 ease-in-out pb-20 print:pb-0
                        ${isSidebarOpen ? 'xl:ml-[420px]' : 'ml-0'}
                        ${isSummaryOpen ? 'xl:mr-[380px]' : 'mr-0'}
                        w-full
                    `}>
                        {/* Results Header + Toolbar */}
                        <div className="sticky top-0 z-30 flex flex-row items-center justify-between gap-4 mb-4 py-3 -mx-4 px-4 md:mx-0 md:px-0 bg-[#0a0e17]/60 backdrop-blur-xl  overflow-hidden md:static md:bg-transparent md:border-none md:pt-4 md:pb-0 print:hidden transition-all duration-200 md:shadow-none">
                            <div className="relative z-10 flex flex-wrap items-baseline gap-3 max-w-[70%] md:max-w-none">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight wrap-break-word">สรุปผลลัพธ์ทางการเงิน</h2>
                                <span className="text-slate-400 text-sm font-medium hidden sm:inline-block">(Financial Overview)</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" size="sm" className={`h-9 px-4 rounded-xl border font-bold text-xs transition-all gap-2 hidden xl:flex ${isSidebarOpen ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-500 shadow-sm' : 'bg-white/10 border-white/10 text-slate-600 hover:bg-white/20 hover:text-slate-800'}`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                                    ปรับแผน
                                </Button>
                                {planType === "family" && (
                                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border border-white/10 bg-white/10 text-slate-300 font-bold text-xs hover:bg-white/20 hover:text-white transition-all gap-2" onClick={() => { syncCurrentToFamily(); setShowFamilyResult(true); }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                        ผลลัพธ์ครอบครัว
                                    </Button>
                                )}
                                {form.insurancePlans.length > 0 && (
                                    <Button variant="outline" size="sm" className={`h-9 px-4 rounded-xl border font-bold text-xs transition-all gap-2 hidden xl:flex ${showInsuranceTable ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-500 shadow-sm' : 'bg-white/10 border-white/10 text-slate-600 hover:bg-white/20 hover:text-white'}`} onClick={() => { setForm(prev => ({ ...prev, selectedPlanId: null })); setShowInsuranceTable(true); }}>
                                        <TableIcon className="w-4 h-4" />
                                        พอร์ตประกัน
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" className={`h-9 px-3 md:px-4 rounded-xl border font-bold text-xs transition-all gap-2 flex ${isSummaryOpen ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-500 shadow-sm' : 'bg-white/10 border-white/10 text-slate-600 hover:bg-white/20 hover:text-slate-800'}`} onClick={() => setIsSummaryOpen(!isSummaryOpen)}>
                                    <PanelLeftClose className={`w-4 h-4 transition-transform duration-300 ${isSummaryOpen ? 'rotate-180' : ''}`} />
                                    <span className="hidden sm:inline">สรุปข้อมูล</span>
                                    <span className="sm:hidden">สรุปข้อมูล</span>
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Carousel: Hero + Metrics */}
                        <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 px-4 -mx-4 pb-6 items-stretch md:pb-0 md:px-0 md:mx-0 md:block md:space-y-6 md:overflow-visible no-scrollbar print:hidden">
                            <DashboardHeroCard result={result} form={form} isSidebarOpen={isSidebarOpen} />
                            <DashboardMetricCards
                                result={result} form={form} isSidebarOpen={isSidebarOpen}
                                onShowProjectedModal={() => setShowProjectedModal(true)}
                                onShowTargetModal={(tab) => { if (tab) setTargetModalTab(tab); setShowTargetModal(true); }}
                                onShowExpenseModal={() => setShowExpenseModal(true)}
                            />
                        </div>

                        {/* Chart + Widgets */}
                        <div className="flex flex-col gap-8 md:space-y-6">
                            <DashboardChartSection
                                inputs={inputs} result={result} mcResult={mcResult} form={form}
                                insuranceChartData={insuranceChartData}
                                showSumAssured={showSumAssured} setShowSumAssured={setShowSumAssured}
                                showActualSavings={showActualSavings} setShowActualSavings={setShowActualSavings}
                                showMC={showMC} setShowMC={setShowMC}
                                handleExportExcel={handleExportExcel} user={user}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:hidden">
                            <div className="min-w-full md:min-w-0 snap-center w-full print:break-inside-avoid">
                                <AllocationWidget inputs={inputs} />
                            </div>
                            <div className="min-w-full md:min-w-0 snap-center w-full print:break-inside-avoid">
                                <MonteCarloWidget mcResult={mcResult} mcSimulations={mcSimulations} onClick={() => setShowMonteCarloDetails(true)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <div id="modals-placeholder">
                    <InsuranceTableModal show={showInsuranceTable} onClose={() => setShowInsuranceTable(false)} form={form} addInsurancePlan={addInsurancePlan} removeInsurancePlan={removeInsurancePlan} updateInsurancePlan={updateInsurancePlan} updateSurrenderTable={updateSurrenderTable} />
                    <ProjectedModal show={showProjectedModal} onClose={() => setShowProjectedModal(false)} form={form} result={result} initialTab={projectedModalTab} />
                    <TargetModal show={showTargetModal} onClose={() => setShowTargetModal(false)} result={result} form={form} />
                    <ExpenseModal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} form={form} result={result} initialTab={expenseModalTab} />
                    <MonteCarloDetailsModal show={showMonteCarloDetails} onClose={() => setShowMonteCarloDetails(false)} mcResult={mcResult} mcSimulations={Number(form.monteCarloSimulations)} />
                </div>

                {/* Desktop Floating Plan Manager */}
                <div className={`hidden xl:block print:hidden fixed bottom-6 z-140 transition-all duration-300 ease-in-out ${isSummaryOpen ? 'right-[390px]' : 'right-6'}`}>
                    <PlanManager
                        currentData={{ form, allocations, returnMode, savingMode, gender }}
                        onLoad={(data) => { setForm(data.form); if (data.allocations) setAllocations(data.allocations); if (data.returnMode) setReturnMode(data.returnMode); if (data.savingMode) setSavingMode(data.savingMode); if (data.gender) setGender(data.gender); }}
                        customTrigger={
                            <button className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group">
                                <Save size={28} />
                                <span className="absolute -top-10 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">จัดการแผน</span>
                            </button>
                        }
                    />
                </div>
            </div>

            {/* Mobile Backdrop for Summary */}
            <div className={`fixed inset-0 z-140 bg-black/20 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${isSummaryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSummaryOpen(false)} />

            {/* RIGHT: Summary Panel */}
            <div className={`
                fixed z-150 transition-all duration-300 ease-in-out pointer-events-none
                inset-0 flex items-center justify-center px-4
                ${isSummaryOpen ? 'opacity-100 visible' : 'opacity-0 invisible xl:opacity-100 xl:invisible'}
                xl:fixed xl:top-[72px] xl:bottom-0 xl:right-0 xl:inset-auto xl:block xl:px-0 xl:flex-none xl:bg-transparent xl:shadow-none xl:pointer-events-none
                ${isSummaryOpen ? 'xl:w-[360px] xl:translate-x-0 xl:visible xl:opacity-100' : 'xl:w-0 xl:translate-x-full xl:invisible xl:opacity-0'}
                print:hidden
            `}>
                <div className={`
                    transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) w-full overflow-hidden pointer-events-auto
                    max-w-lg bg-white rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col h-[80vh] md:h-[70vh]
                    ${isSummaryOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
                    xl:max-w-none xl:bg-transparent xl:rounded-none xl:shadow-none xl:h-full xl:max-h-none xl:overflow-hidden xl:translate-y-0 xl:opacity-100 xl:scale-100 xl:pointer-events-auto
                `}>
                    <PlanSummaryPanel isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} form={form} allocations={allocations} returnMode={returnMode} savingMode={savingMode} gender={gender} />
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 pt-1 pb-2 px-4 z-60 xl:hidden shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 ${isSummaryOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                <div className="grid grid-cols-3 w-full max-w-5xl mx-auto items-end">
                    <div className="flex justify-center">
                        <button onClick={() => setIsSidebarOpen(prev => !prev)} className="flex flex-col items-center justify-center gap-1 group transition-all">
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ease-out shadow-sm ${isSidebarOpen ? 'bg-indigo-600 text-white shadow-indigo-500/30 rotate-90' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 md:w-7 md:h-7" /> : <PanelLeftOpen className="w-5 h-5 md:w-7 md:h-7" />}
                            </div>
                            <span className={`text-xs md:text-sm font-bold tracking-tight transition-colors text-center ${isSidebarOpen ? 'text-indigo-400' : 'text-slate-500'}`}>
                                {isSidebarOpen ? 'ปิด' : 'ปรับแผน'}
                            </span>
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <PlanManager
                            currentData={{ form, allocations, returnMode, savingMode, gender }}
                            onLoad={(data) => { setForm(data.form); if (data.allocations) setAllocations(data.allocations); if (data.returnMode) setReturnMode(data.returnMode); if (data.savingMode) setSavingMode(data.savingMode); if (data.gender) setGender(data.gender); }}
                            customTrigger={
                                <button className="flex flex-col items-center justify-center gap-1 group relative -top-5 transition-all">
                                    <div className="relative group-active:scale-95 transition-all duration-300">
                                        <div className="absolute inset-[-8px] bg-emerald-400 blur-2xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity duration-1000"></div>
                                        <div className="absolute inset-[-3px] bg-emerald-300/20 blur-lg rounded-full opacity-40"></div>
                                        <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(16,185,129,0.5),0_0_15px_rgba(16,185,129,0.15)] border-[3px] border-white/20 z-10 overflow-hidden">
                                            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            <Save className="w-6 h-6 md:w-9 md:h-9 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs md:text-sm font-bold text-emerald-400 bg-emerald-500/10 backdrop-blur-xl px-3 py-0.5 rounded-full border border-emerald-500/20 shadow-sm tracking-tight uppercase whitespace-nowrap">บันทึก</span>
                                    </div>
                                </button>
                            }
                        />
                    </div>
                    <div className="flex justify-center">
                        <button onClick={() => { setForm(prev => ({ ...prev, selectedPlanId: null })); setShowInsuranceTable(true); }} className="flex flex-col items-center justify-center gap-1 group transition-all">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-all duration-300 shadow-sm">
                                <TableIcon className="w-5 h-5 md:w-7 md:h-7" />
                            </div>
                            <span className="text-xs md:text-sm font-bold text-slate-500 tracking-tight text-center group-hover:text-blue-400 transition-colors">พอร์ต</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

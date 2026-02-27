"use client";

import React from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { ProjectionChart } from "./DashboardCharts"; // กราฟแสดงผลการคาดการณ์ (Projection)
import { MobileProjectionChart } from "./MobileProjectionChart"; // กราฟสำหรับแสดงผลบนมือถือ
import { RetirementInputSection } from "./RetirementInputSection"; // ส่วนกรอกข้อมูล (Input Form)
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
import { PlanSummaryPanel } from "./PlanSummaryPanel"; // Import new component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/NumericInput";
import { formatNumber, formatNumber2, formatInputDisplay } from "@/lib/utils";
import {
    FormState,
    RetirementInputs,
    CalculationResult,
    MonteCarloResult,
    InsurancePlan,
    Allocation
} from "@/types/retirement";
import { Plus, X as CloseIcon, Table as TableIcon, PanelLeftOpen, PanelLeftClose, Save } from "lucide-react";

import { buildProjectionSeries } from "@/lib/retirement-calculation";

// ----------------------------------------------------------------------
// Props Definition (นิยามข้อมูลที่ได้รับจาก Component แม่)
// ----------------------------------------------------------------------
interface RetirementDashboardProps {
    user: { name: string } | null; // ข้อมูลผู้ใช้งาน
    form: FormState; // สถานะฟอร์ม (ข้อมูลทั้งหมด)
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    inputs: RetirementInputs; // ข้อมูลอินพุตที่แปลงเป็นตัวเลข
    result: CalculationResult; // ผลลัพธ์การคำนวณ
    mcResult: MonteCarloResult; // ผลลัพธ์ Monte Carlo
    planType: "individual" | "family" | null; // ประเภทแผน
    // ... (ฟังก์ชันจัดการต่างๆ)
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

    // Extended Props for RetirementInputSection compliance
    savingMode: "flat" | "step5";
    setSavingMode: React.Dispatch<React.SetStateAction<"flat" | "step5">>; // or generic dispatch
    returnMode: "avg" | "custom";
    setReturnMode: React.Dispatch<React.SetStateAction<"avg" | "custom">>;
    allocations: Allocation[];
    setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
    addAllocation: () => void;
    removeAllocation: (id: number) => void;
    updateAllocation: (id: number, field: keyof Allocation) => (e: any) => void;

    // Handlers for Inputs
    handleChange: (key: keyof FormState) => (e: any) => void;
    changeBy: (key: keyof FormState, delta: number) => () => void;
    setGender: (g: "male" | "female") => void;
    gender: "male" | "female";
    onLogout?: () => void;
    onEditProfile?: () => void;
    onBack?: () => void;
}

// ----------------------------------------------------------------------
// Main Component: RetirementDashboard
// หน้าแดชบอร์ดหลักสำหรับวางแผนเกษียณ
// ----------------------------------------------------------------------
export const RetirementDashboard = ({
    user,
    form,
    setForm,
    inputs,
    result,
    mcResult,
    planType,
    syncCurrentToFamily,
    setShowFamilyResult,
    handleExportExcel,
    handlePrint,
    addInsurancePlan,
    removeInsurancePlan,
    updateInsurancePlan,
    updateSurrenderTable,
    setRetireSpendMode,
    retireSpendMode,
    savingMode,
    setSavingMode,
    returnMode,
    setReturnMode,
    allocations,
    setAllocations,
    addAllocation,
    removeAllocation,
    updateAllocation,
    handleChange,
    changeBy,
    setGender,
    gender,
    onLogout,
    onEditProfile,
    onBack
}: RetirementDashboardProps) => {

    // ----------------------------------------------------------------------
    // State Variables (สถานะการทำงานภายใน Component)
    // ----------------------------------------------------------------------
    const [showSumAssured, setShowSumAssured] = React.useState(true); // แสดง/ซ่อน ทุนประกันบนกราฟ
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false); // Left Sidebar State (Default closed to focus on results)
    const [isSummaryOpen, setIsSummaryOpen] = React.useState(false); // Right Sidebar State
    const [showActualSavings, setShowActualSavings] = React.useState(true); // แสดง/ซ่อน เงินออมจริงบนกราฟ
    const [showInsuranceTable, setShowInsuranceTable] = React.useState(false); // แสดง Modal ตารางกรมธรรม์
    const [showProjectedModal, setShowProjectedModal] = React.useState(false); // แสดง Modal กราฟคาดการณ์
    const [showTargetModal, setShowTargetModal] = React.useState(false); // แสดง Modal เป้าหมาย
    const [targetModalTab, setTargetModalTab] = React.useState<"details" | "formula">("details"); // Tab ปัจจุบันของ Target Modal
    const [showExpenseModal, setShowExpenseModal] = React.useState(false); // แสดง Modal ค่าใช้จ่าย
    const [expenseModalTab, setExpenseModalTab] = React.useState<"details" | "formula">("details"); // Tab ปัจจุบันของ Expense Modal
    const [projectedModalTab, setProjectedModalTab] = React.useState<"details" | "formula">("details"); // Tab ปัจจุบันของ Projected Modal
    const [showMonteCarloDetails, setShowMonteCarloDetails] = React.useState(false); // แสดงรายละเอียด Monte Carlo
    const [isMonteCarloOpen, setIsMonteCarloOpen] = React.useState(false); // (Deprecated) ควบคุมการเปิด Modal MC
    const [chartTickInterval, setChartTickInterval] = React.useState<number>(5); // ช่วงระยะเวลาบนแกน X ของกราฟ (1, 2, 5, 10 ปี)
    const [viewMode, setViewMode] = React.useState<'line' | 'bar'>('bar'); // โหมดแสดงผลกราฟ (เส้น/แท่ง) - Default Bar
    const [showMC, setShowMC] = React.useState(true); // แสดง/ซ่อน พื้นที่ Monte Carlo บนกราฟ
    const [mobileChartOrientation, setMobileChartOrientation] = React.useState<'vertical' | 'horizontal'>('horizontal'); // State สำหรับ iPad orientation toggle

    // Mobile Carousel Auto-Scroll Logic
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const [activeSlide, setActiveSlide] = React.useState(0);

    React.useEffect(() => {
        const container = carouselRef.current;
        if (!container) return;

        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Determine active slide index based on scroll position
                // Assuming full width slides, index = round(scrollLeft / clientWidth)
                const slideWidth = container.clientWidth;
                const scrollLeft = container.scrollLeft;
                const index = Math.round(scrollLeft / slideWidth);

                if (index !== activeSlide) {
                    setActiveSlide(index);
                    // Scroll Window to Top of Container (minus header offset)
                    // This ensures the new slide content is visible at the top
                    const rect = container.getBoundingClientRect();
                    const headerOffset = 140; // Approx sticky header height + padding
                    const scrollTop = window.scrollY + rect.top - headerOffset;

                    // Only scroll if we are not already near the top (e.g. if user is scrolling down)
                    // Actually, the request implies "always show top of slide". 
                    // So if we swipe, we want to snap the view to the top.
                    window.scrollTo({ top: scrollTop, behavior: 'smooth' });
                }
            }, 100); // 100ms debounce
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [activeSlide]);

    // ----------------------------------------------------------------------
    // Effects (การทำงานข้างเคียง)
    // ----------------------------------------------------------------------
    // เลื่อนหน้าจอไปที่ส่วนผลลัพธ์ (Results Section) เมื่อโหลดหน้าบนมือถือ/แท็บเล็ต
    React.useEffect(() => {
        if (window.innerWidth < 1280) {
            const resultsElement = document.getElementById("results-section");
            if (resultsElement) {
                setTimeout(() => {
                    resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
            }
        }
    }, []);

    const { insuranceChartData } = useInsuranceLogic(form); // ดึงข้อมูลกราฟประกันจาก Hook

    // เตรียมข้อมูลสำหรับตารางที่จะพิมพ์ (Print Data Preparation)
    const printData = React.useMemo(() => {
        // สร้างข้อมูลกราฟ projection ตาม input และผลลัพธ์
        const { labels, actual, required, principalStats } = buildProjectionSeries(inputs, result) as any;
        return labels.map((label: string, i: number) => {
            const age = Number(label);
            const savings = actual[i];
            const principal = principalStats ? principalStats[i] : 0;
            const target = Number(label) <= Number(inputs.retireAge) ? required[i] : 0;

            // ดึงข้อมูลทุนประกันและกระแสเงินสดจากประกัน
            let sumAssured = 0;
            let insuranceCashFlow = 0;
            if (insuranceChartData) {
                const idx = insuranceChartData.labels.indexOf(age);
                if (idx !== -1) {
                    sumAssured = (insuranceChartData.datasets[0].data[idx] as number) || 0;
                    insuranceCashFlow = (insuranceChartData.datasets[1]?.data[idx] as number) || 0;
                }
            }

            return { age, savings, principal, target, sumAssured, insuranceCashFlow };
        });
    }, [inputs, result, insuranceChartData]);

    const mcSimulations = Number(form.monteCarloSimulations) || 1500;

    return (
        <div className="min-h-screen bg-white pb-20 font-sans overflow-x-hidden relative print:overflow-visible print:bg-white print-no-padding print-reset-height">
            {/* Print Styles */}
            <style type="text/css" media="print">
                {`
                @page { size: portrait; margin: 8mm; }
                body { 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact; 
                    background: white;
                    zoom: 0.75; /* Larger zoom for Portrait */
                }
                
                /* Reset Main Layout for Print */
                .print-no-padding { padding: 0 !important; margin: 0 !important; }
                .print-reset-height { min-height: 0 !important; height: auto !important; overflow: visible !important; }
                
                /* Layout Grid for Single Page */
                .print-layout-container {
                    display: flex;
                    flex-direction: column;
                    height: auto;
                    width: 100%;
                    max-width: 100%;
                }

                /* Chart Specifics */
                #printable-chart { 
                    height: 300px !important; /* Adjusted for Portrait */
                    min-height: 300px !important; 
                    border: none !important;
                    box-shadow: none !important;
                    break-inside: avoid;
                    page-break-inside: avoid;
                    width: 100% !important;
                    max-width: 100% !important;
                    overflow: visible !important;
                    display: block !important;
                    margin-bottom: 20px !important;
                }
                
                #printable-chart canvas {
                    width: 100% !important;
                    height: 100% !important;
                    max-width: 100% !important;
                    object-fit: contain !important;
                }
                
                /* Data Table Specifics */
                #print-data-table { 
                    display: block !important; 
                    margin-top: 20px !important;
                    font-size: 10px; /* Larger font for table */
                    width: 100%;
                    break-before: avoid;
                    page-break-before: avoid;
                }
                
                /* Hide everything else */
                .print-hidden, header, nav, footer, .fixed, .sticky { display: none !important; }

                /* Custom Responsive Print Logic */
                body.print-desktop .print-desktop-only { display: block !important; }
                body.print-mobile .print-mobile-only { display: block !important; }
                `}
            </style>

            {/* Background Grid Pattern - Hide on Print */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 print:hidden">
                <div className="absolute inset-0 opacity-[0.2]"
                    style={{
                        backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
            </div>
            {/* TOP NAVIGATION BAR - Hide on Print */}
            {/* TOP NAVIGATION BAR - Fixed Top */}
            <div className="bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-50 px-6 py-4 shadow-sm flex items-center justify-between print:hidden h-[72px]">
                <div className="flex items-center gap-3">

                    {onBack ? (
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                    )}
                    <div>
                        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Financial Planner</h1>
                        <p className="text-xs text-slate-500 font-medium">วางแผนการเงิน</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={onEditProfile} className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-full border border-slate-100 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white shadow-sm font-bold text-xs overflow-hidden">
                            {(user as any)?.avatar ? (
                                <img src={(user as any).avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.substring(0, 2).toUpperCase() || "U"
                            )}
                        </div>
                        <span className="text-sm font-bold text-slate-700 pr-2">{user?.name || "User"}</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="ออกจากระบบ"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </button>
                </div>
            </div>

            <div className="w-full px-3 md:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10 print:px-0 print:space-y-4 pt-[72px] print:pt-0">

                {/* Print Only Header */}
                <div className="hidden print:block mb-4 border-b-2 border-slate-800 pb-2">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase">Retirement Plan Report</h1>
                            <p className="text-slate-500 text-sm mt-1 font-medium">รายงานวางแผนเกษียณอายุสำหรับ: {user?.name || "User"}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</div>
                            <div className="text-lg font-bold text-slate-900">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>
                </div>

                {/* Header (Original - hide on print) */}
                {/* Header (Original - hide on print) */}
                {/* Header Buttons Removed from Here */}

                {/* Main Content Flex Container */}
                <div className="flex flex-col xl:flex-row items-start gap-0 relative">

                    {/* Mobile Backdrop (พื้นหลังสีดำจางๆ เมื่อเปิด Sidebar บนมือถือ) */}
                    <div
                        className={`fixed inset-0 z-[140] bg-black/20 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    {/* LEFT AREA: Sidebar (ส่วนแถบข้างสำหรับกรอกข้อมูล) */}
                    {/* - Mobile/Tablet: แสดงเป็น Bottom Sheet (เลื่อนขึ้นจากด้านล่าง) */}
                    {/* - Desktop: แสดงเป็น Sidebar ปกติด้านซ้าย */}
                    <div className={`
                        fixed z-[150] transition-all duration-300 ease-in-out
                        
                        /* Mobile & Tablet (<1280px): Bottom Sheet Overlay (ทับจอ) */
                        inset-0 flex items-end justify-center
                        ${isSidebarOpen
                            ? 'opacity-100 pointer-events-auto visible'
                            : 'opacity-0 pointer-events-none invisible xl:opacity-100 xl:pointer-events-none xl:invisible'}
                        
                        /* Desktop (>=1280px): Fixed Sidebar (ติดด้านซ้าย) */
                        xl:fixed xl:top-[72px] xl:bottom-0 xl:left-0 xl:inset-auto xl:block
                        xl:p-0 xl:flex-none
                        xl:bg-transparent xl:shadow-none
                        
                        /* Desktop Width & Visibility */
                        ${isSidebarOpen
                            ? 'xl:w-[400px] xl:translate-x-0 xl:visible xl:pointer-events-auto xl:opacity-100 xl:overflow-y-auto no-scrollbar'
                            : 'xl:w-0 xl:-translate-x-full xl:invisible xl:pointer-events-none xl:opacity-0 xl:overflow-hidden'}
                        
                        print:hidden
                    `}>
                        <div className={`
                            transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) w-full
                            
                            /* Mobile & Tablet (<1280px): Detailed Bottom Sheet */
                            max-w-none bg-white rounded-t-[32px] rounded-b-none shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col 
                            h-[90vh]
                            
                            ${isSidebarOpen
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-full opacity-100'}

                            /* Desktop (>=1280px): Reset */
                            xl:max-w-none xl:bg-transparent xl:rounded-none xl:shadow-none xl:h-auto xl:max-h-none xl:overflow-visible xl:translate-y-0 xl:opacity-100
                        `}>
                            {/* Scrollable Content Area */}
                            <div className="overflow-y-auto p-0 xl:p-0 custom-scrollbar xl:overflow-visible flex flex-col items-center xl:block">
                                <div className="w-full max-w-2xl xl:max-w-none">
                                    {/* LEFT HEADER: Adjust Plan */}
                                    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 tracking-tight">ปรับแผนการเงิน</h2>
                                            <span className="text-slate-500 text-xs font-medium">กำหนดแผนเกษียณในแบบของคุณ</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors flex xl:hidden"
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            <CloseIcon size={20} strokeWidth={2.5} />
                                        </Button>
                                    </div>

                                    {/* Inputs Component */}
                                    <RetirementInputSection
                                        user={user}
                                        form={form}
                                        handleChange={handleChange}
                                        changeBy={changeBy}
                                        gender={gender}
                                        setGender={setGender}
                                        addInsurancePlan={addInsurancePlan}
                                        removeInsurancePlan={removeInsurancePlan}
                                        updateInsurancePlan={updateInsurancePlan}
                                        onViewTable={(id) => {
                                            if (id) {
                                                setForm(prev => ({ ...prev, selectedPlanId: id }));
                                            }
                                            setShowInsuranceTable(true);
                                        }}
                                        savingMode={savingMode}
                                        setSavingMode={setSavingMode}
                                        returnMode={returnMode}
                                        setReturnMode={setReturnMode}
                                        allocations={allocations}
                                        addAllocation={addAllocation}
                                        removeAllocation={removeAllocation}
                                        updateAllocation={updateAllocation}
                                        onCalculate={() => {
                                            // Close both sidebars immediately to focus on results
                                            setIsSidebarOpen(false);
                                            setIsSummaryOpen(false);

                                            // Close all modals to ensure clean view
                                            setShowInsuranceTable(false);
                                            setShowProjectedModal(false);
                                            setShowTargetModal(false);
                                            setShowExpenseModal(false);
                                            setShowMonteCarloDetails(false);

                                            // Wait for transition (500ms) to finish before scrolling
                                            setTimeout(() => {
                                                // Scroll to top of window to ensure Results Summary (which is at top) is visible
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }, 550);
                                        }}
                                        isEmbedded={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* RIGHT AREA: Main Content (ส่วนแสดงผลลัพธ์) */}
                    <div id="results-section" className={`
                        flex-1 min-w-0 space-y-8 transition-all duration-500 ease-in-out pb-20 print:pb-0
                        ${isSidebarOpen ? 'xl:ml-[420px]' : 'ml-0'}
                        ${isSummaryOpen ? 'xl:mr-[380px]' : 'mr-0'}
                        w-full
                    `}>

                        {/* RIGHT HEADER: Financial Results Summary + Buttons (หัวข้อสรุปผลลัพธ์ + ปุ่มเครื่องมือ) */}
                        <div className="sticky top-0 z-30 flex flex-row items-center justify-between gap-4 mb-4 py-3 -mx-4 px-4 md:mx-0 md:px-0 bg-white/60 backdrop-blur-md relative overflow-hidden md:static md:bg-transparent md:border-none md:pt-4 md:pb-0 print:hidden transition-all duration-200 md:shadow-none">
                            {/* Mobile-only background grid for consistency */}
                            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none md:hidden z-0"></div>

                            <div className="relative z-10 flex flex-wrap items-baseline gap-3 max-w-[70%] md:max-w-none">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight break-words">สรุปผลลัพธ์ทางการเงิน</h2>
                                <span className="text-slate-500 text-sm font-medium hidden sm:inline-block">(Financial Overview)</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Adjust Plan Toggle */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 px-4 rounded-xl border font-bold text-xs transition-all gap-2 hidden xl:flex ${isSidebarOpen
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                        }`}
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                >
                                    {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                                    ปรับแผน
                                </Button>

                                {/* Family Toggle */}
                                {planType === "family" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-50 hover:text-slate-800 transition-all gap-2"
                                        onClick={() => {
                                            syncCurrentToFamily();
                                            setShowFamilyResult(true);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                        ผลลัพธ์ครอบครัว
                                    </Button>
                                )}

                                {/* Insurance Toggle */}
                                {form.insurancePlans.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-9 px-4 rounded-xl border font-bold text-xs transition-all gap-2 hidden xl:flex ${showInsuranceTable
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                        onClick={() => {
                                            setForm(prev => ({ ...prev, selectedPlanId: null }));
                                            setShowInsuranceTable(true);
                                        }}
                                    >
                                        <TableIcon className="w-4 h-4" />
                                        พอร์ตประกัน
                                    </Button>
                                )}

                                {/* Plan Summary Toggle - Visible on Mobile too */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 px-3 md:px-4 rounded-xl border font-bold text-xs transition-all gap-2 flex ${isSummaryOpen
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                        }`}
                                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                                >
                                    <PanelLeftClose className={`w-4 h-4 transition-transform duration-300 ${isSummaryOpen ? 'rotate-180' : ''}`} />
                                    <span className="hidden sm:inline">สรุปข้อมูล</span>
                                    <span className="sm:hidden">สรุปข้อมูล</span>
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Carousel Wrapper: Unifies Hero, Metrics, and Chart into one swipeable flow */}
                        <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 px-4 -mx-4 pb-6 items-stretch md:pb-0 md:px-0 md:mx-0 md:block md:space-y-6 md:overflow-visible no-scrollbar print:hidden">

                            {/* Hero Summary Card (Redesigned) */}
                            <div className={`min-w-[92%] sm:min-w-[380px] md:min-w-0 snap-center relative rounded-[28px] p-5 lg:p-8 xl:p-10 overflow-hidden font-sans border border-white/20 shadow-xl transition-all duration-500 group print:hidden min-h-[220px] md:min-h-0 flex flex-col justify-center ${result.status === 'enough' ? 'bg-gradient-to-br from-[#065f46] via-[#059669] to-[#10b981]' : 'bg-gradient-to-br from-[#991b1b] via-[#dc2626] to-[#ef4444]'}`}>
                                {/* Decorative Background Patterns */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25 mix-blend-overlay"></div>
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none mix-blend-overlay animate-pulse duration-[4000ms]"></div>
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

                                    {/* Right Side: Summary Stats Card - Hidden on Mobile to match other cards height/width */}
                                    <div className="hidden md:block shrink-0 relative group/stats cursor-default w-full lg:w-auto">
                                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-[24px] lg:rounded-[32px] transform rotate-1 lg:rotate-3 group-hover/stats:rotate-2 lg:group-hover/stats:rotate-6 transition-transform duration-500"></div>
                                        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 min-w-[280px] lg:min-w-[320px] shadow-2xl overflow-hidden">
                                            {/* Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/stats:translate-x-[100%] transition-transform duration-1000"></div>

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

                                                <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-full"></div>

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

                            {/* Key Metrics Grid (Redesigned) - ตารางแสดงตัวเลขสำคัญ */}
                            <div className="contents md:flex md:flex-col md:gap-3 relative print:hidden">
                                {/* Grid Background Decoration */}
                                <div className="hidden md:block absolute inset-0 -m-8 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

                                {/* Grid Container: On mobile, use contents to allow children to be carousel items. On Desktop, use Grid. */}
                                <div className={`contents md:grid md:grid-cols-2 md:gap-6 relative z-10 ${isSidebarOpen ? 'xl:grid-cols-1 2xl:grid-cols-2' : ''}`}>
                                    {/* Card 1: Projected Savings (เงินออมที่มี) */}
                                    <div
                                        onClick={() => setShowProjectedModal(true)}
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
                                        onClick={() => {
                                            setTargetModalTab('details');
                                            setShowTargetModal(true);
                                        }}
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
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-[-3deg] transition-all duration-300 shadow-sm border border-blue-100/50">
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
                                                                setTargetModalTab('formula');
                                                                setShowTargetModal(true);
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
                                        onClick={() => setShowExpenseModal(true)}
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
                        </div>

                        {/* Main Content Areas: Stacked vertically below the carousel on mobile */}
                        <div className="flex flex-col gap-8 md:space-y-6">
                            {/* PRINT ONLY: Plan Summary */}
                            <div className="hidden print:block mb-6 p-4 border border-slate-300 rounded-xl bg-slate-50 text-sm">
                                <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3 uppercase tracking-wide">Plan Summary</h3>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                    <div className="grid grid-cols-2">
                                        <span className="text-slate-500">Current Age:</span>
                                        <span className="font-bold text-slate-800">{form.currentAge} ปี</span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-slate-500">Retire Age:</span>
                                        <span className="font-bold text-slate-800">{form.retireAge} ปี</span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-slate-500">Life Expectancy:</span>
                                        <span className="font-bold text-slate-800">{form.lifeExpectancy} ปี</span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-slate-500">Current Savings:</span>
                                        <span className="font-bold text-slate-800">฿{form.currentSavings}</span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-slate-500">Monthly Saving:</span>
                                        <span className="font-bold text-slate-800">฿{form.monthlySaving}</span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-slate-500">Expected Return:</span>
                                        <span className="font-bold text-slate-800">{form.expectedReturn}%</span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-slate-500">Legacy Fund:</span>
                                        <span className="font-bold text-slate-800">฿{form.legacyFund || "0"}</span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-slate-500">Sum Assured:</span>
                                        <span className="font-bold text-slate-800">
                                            ฿{formatNumber(form.insurancePlans.reduce((sum, p) => sum + (Number(String(p.sumAssured).replace(/,/g, "")) || 0), 0))}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-slate-500">Post-Retire Income:</span>
                                        <span className="font-bold text-slate-800">฿{form.retirePension || "0"} / mo</span>
                                    </div>
                                    <div className="grid grid-cols-2 border-t border-slate-200 pt-2 mt-1">
                                        <span className="text-slate-500 font-bold">Target Fund:</span>
                                        <span className="font-bold text-blue-600">฿{formatNumber2(result.targetFund)}</span>
                                    </div>
                                    <div className="grid grid-cols-2 border-t border-slate-200 pt-2 mt-1">
                                        <span className="text-slate-500 font-bold">Projected Fund:</span>
                                        <span className={`font-bold ${result.status === 'enough' ? 'text-emerald-600' : 'text-red-600'}`}>฿{formatNumber2(result.projectedFund)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Dashboard Grid (Chart Container) (ส่วนแสดงกราฟหลัก) */}
                            <div className="w-full flex flex-col gap-8 mb-8 px-0 md:px-0">
                                {/* Main Chart Area (พื้นที่กราฟและการแสดงผล) */}
                                <div className="w-full bg-white rounded-[32px] p-4 md:p-8 shadow-xl border border-slate-100 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-6 print:hidden">
                                        <div>
                                            <div className="flex items-center gap-4 mb-1">
                                                <div className="w-1.5 h-8 bg-slate-800 rounded-full"></div>
                                                <div>
                                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">กราฟเงินออม</h3>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium pl-4.5">Wealth Projection & Goal Analysis</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* View Mode Toggle - Hidden on Mobile */}
                                            <div className="hidden md:flex bg-white/50 p-1 rounded-xl backdrop-blur-sm border border-slate-200 shadow-sm">
                                                <button
                                                    onClick={() => setViewMode('bar')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${viewMode === 'bar'
                                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                                                        }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
                                                    กราฟแท่ง
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('line')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${viewMode === 'line'
                                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                                                        }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                                                    กราฟเส้น
                                                </button>
                                            </div>

                                            {/* Interval Selection */}
                                            <div className="flex bg-white/50 p-1 rounded-xl backdrop-blur-sm border border-slate-200 shadow-sm">
                                                {[1, 2, 5, 10].map((interval) => (
                                                    <button
                                                        key={interval}
                                                        onClick={() => setChartTickInterval(interval)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 
                                                            ${interval === 1 ? 'hidden xl:block' : ''} 
                                                            ${interval === 2 ? 'hidden md:block xl:hidden' : ''} 
                                                            ${chartTickInterval === interval
                                                                ? "bg-slate-800 text-white shadow-md shadow-slate-200"
                                                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                                                            }`}
                                                    >
                                                        {interval} ปี
                                                    </button>
                                                ))}
                                            </div>
                                            <button className="px-5 py-2.5 text-sm font-bold text-blue-600 bg-white hover:bg-blue-50 rounded-xl border-2 border-blue-600 flex items-center gap-2 transition-all hover:-translate-y-0.5" onClick={handleExportExcel}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                Export Excel
                                            </button>
                                            <button className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5"
                                                onClick={() => {
                                                    // Detect width and set class
                                                    if (window.innerWidth < 768) {
                                                        document.body.classList.add('print-mobile');
                                                        document.body.classList.remove('print-desktop');
                                                    } else {
                                                        document.body.classList.add('print-desktop');
                                                        document.body.classList.remove('print-mobile');
                                                    }
                                                    setTimeout(() => {
                                                        window.print();
                                                    }, 100);
                                                }}>
                                                Print
                                            </button>
                                        </div>
                                    </div>
                                    <div id="printable-chart" className="w-full relative h-[600px] md:h-[600px] print:h-[350px] print:min-h-0 bg-white rounded-3xl border border-slate-100 p-4 md:p-6 print:p-0 print:border-none print:shadow-none overflow-hidden print:overflow-visible print:break-inside-avoid">
                                        <div className="hidden md:block print:block print:w-full print:h-full w-full h-full">
                                            {/* iPad/Desktop Rendering Logic */}

                                            {/* Case A: iPad Bar View (Use Mobile Chart Structure) - Only if viewMode is Bar and on small/medium desktop */}
                                            <div className={`w-full h-full ${viewMode === 'bar' ? 'block xl:hidden' : 'hidden'}`}>
                                                <MobileProjectionChart
                                                    inputs={inputs}
                                                    result={result}
                                                    mcResult={mcResult}
                                                    showSumAssured={showSumAssured}
                                                    setShowSumAssured={setShowSumAssured}
                                                    showActualSavings={showActualSavings}
                                                    setShowActualSavings={setShowActualSavings}
                                                    insuranceChartData={insuranceChartData}
                                                    chartTickInterval={chartTickInterval}
                                                    showMC={showMC}
                                                    setShowMC={setShowMC}
                                                    initialOrientation="vertical" // Default to Vertical, user can toggle
                                                    hideOrientationToggle={false} // Show internal toggle
                                                />
                                            </div>

                                            {/* Case B: Standard Projection Chart - Visible if Desktop OR iPad Line Mode OR print */}
                                            <div className={`w-full h-full ${viewMode === 'bar' ? 'hidden xl:block print:block' : 'block'}`}>
                                                <ProjectionChart
                                                    inputs={inputs}
                                                    result={result}
                                                    mcResult={showMC ? mcResult : null}
                                                    showSumAssured={showSumAssured}
                                                    showActualSavings={showActualSavings}
                                                    insuranceChartData={insuranceChartData}
                                                    chartTickInterval={chartTickInterval}
                                                    viewMode={viewMode}
                                                />
                                            </div>
                                        </div>
                                        <div className="block md:hidden print:hidden print-mobile-only w-full h-full">
                                            <MobileProjectionChart
                                                inputs={inputs}
                                                result={result}
                                                mcResult={mcResult} // Pass raw result so we know it exists for the toggle button
                                                showSumAssured={showSumAssured}
                                                setShowSumAssured={setShowSumAssured}
                                                showActualSavings={showActualSavings}
                                                setShowActualSavings={setShowActualSavings}
                                                insuranceChartData={insuranceChartData}
                                                chartTickInterval={chartTickInterval}
                                                showMC={showMC}
                                                setShowMC={setShowMC}
                                                initialOrientation="horizontal"
                                            />
                                        </div>



                                        {/* Financial Highlights Table - Hidden on Desktop, Visible on Print (Inside Container) */}
                                        <div className="hidden print:block mt-4 w-full pt-2 border-t border-slate-300">
                                            <h3 className="text-lg font-bold text-black mb-2 px-1">สรุปรายการสำคัญ (Financial Summary)</h3>
                                            <div className="overflow-hidden rounded-xl border border-slate-400 bg-white">
                                                <table className="w-full border-collapse text-xs">
                                                    <thead>
                                                        <tr className="bg-slate-100 border-b border-slate-400">
                                                            <th className="py-2.5 px-3 text-left font-bold text-black w-1/6 border-r border-slate-300">รายการ (Item)</th>
                                                            <th className="py-2.5 px-3 text-right font-bold text-black w-1/4 border-r border-slate-300">เงินออมที่มีตอนอายุเกษียณ ({form.retireAge} ปี)</th>
                                                            <th className="py-2.5 px-3 text-right font-bold text-black w-1/4 border-r border-slate-300">เงินที่ต้องการก่อนเกษียณ</th>
                                                            <th className="py-2.5 px-3 text-right font-bold text-black w-1/6 border-r border-slate-300">ทุนประกัน (Sum Assured)</th>
                                                            <th className="py-2.5 px-3 text-right font-bold text-black w-1/6">มรดก (Legacy)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="">
                                                            <td className="py-3 px-3 font-bold text-black border-r border-slate-300">มูลค่า (Value)</td>
                                                            <td className="py-3 px-3 text-right font-bold text-black border-r border-slate-300">฿{formatNumber2(result.projectedFund)}</td>
                                                            <td className="py-3 px-3 text-right font-bold text-black border-r border-slate-300">฿{formatNumber2(result.targetFund)}</td>
                                                            <td className="py-3 px-3 text-right font-bold text-black border-r border-slate-300">
                                                                ฿{formatNumber(form.insurancePlans.reduce((sum, p) => sum + (Number(String(p.sumAssured).replace(/,/g, "")) || 0), 0))}
                                                            </td>
                                                            <td className="py-3 px-3 text-right font-bold text-black">฿{formatNumber(form.legacyFund || 0)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>




                                    {/* PRINT ONLY: Chart Data Table (ตารางข้อมูลสำหรับโหมดพิมพ์) */}
                                    {/* จะแสดงเฉพาะเมื่อสั่งพิมพ์เท่านั้น (hidden print:block) */}
                                    {/* Data Table Removed (User Request: Single Page Only) */}
                                    <div id="print-data-table" className="hidden print:block mt-6 font-mono text-black">
                                        <h3 className="text-xs font-bold uppercase tracking-widest mb-2 border-b border-black pb-1 inline-block">DATA TABLE (YEARLY ANALYSIS)</h3>
                                        <div className="grid grid-cols-2 gap-6 text-[10px] leading-snug">
                                            {/* Generate 2 Columns for Portrait Layout - Larger Text */}
                                            {Array.from({ length: 2 }).map((_, colIndex) => {
                                                const chunkSize = Math.ceil(printData.length / 2);
                                                const start = colIndex * chunkSize;
                                                const end = start + chunkSize;
                                                const dataSlice = printData.slice(start, end);

                                                return (
                                                    <div key={colIndex} className="border border-black">
                                                        <table className="w-full text-left table-fixed">
                                                            <thead className="bg-gray-100 print:bg-gray-100 font-bold border-b border-black">
                                                                <tr>
                                                                    <th className="py-1.5 px-2 text-center border-r border-black uppercase w-[12%]">อายุ</th>
                                                                    <th className="py-1.5 px-2 text-right border-r border-black uppercase w-[22%]">เงินต้น</th>
                                                                    <th className="py-1.5 px-2 text-right border-r border-black uppercase w-[22%]">เงินออม</th>
                                                                    <th className="py-1.5 px-2 text-right border-r border-black uppercase w-[22%]">เงินคืน</th>
                                                                    <th className="py-1.5 px-2 text-right uppercase w-[22%]">เป้าหมาย</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-black">
                                                                {dataSlice.map((row: any) => (
                                                                    <tr key={row.age} className="border-b border-black last:border-0">
                                                                        <td className="py-1 px-2 text-center font-bold border-r border-black">{row.age}</td>
                                                                        <td className="py-1 px-2 text-right border-r border-black">{formatNumber(row.principal)}</td>
                                                                        <td className="py-1 px-2 text-right font-bold border-r border-black">{formatNumber(row.savings)}</td>
                                                                        <td className="py-1 px-2 text-right border-r border-black">{row.insuranceCashFlow > 0 ? formatNumber(row.insuranceCashFlow) : "-"}</td>
                                                                        <td className="py-1 px-2 text-right">{row.target > 0 ? formatNumber(row.target) : "-"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="text-[8px] mt-2 flex justify-between items-center border-t border-black pt-2 uppercase font-medium">
                                            <div className="flex gap-4">
                                                <span>* Principal: เงินต้นสะสม</span>
                                                <span>* Savings: เงินออมรวม</span>
                                                <span>* CashFlow: เงินคืนประกัน</span>
                                                <span>* Target: เป้าหมาย</span>
                                            </div>
                                            <span>Generated by Financial Planner App</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:hidden">
                            <div className="min-w-full md:min-w-0 snap-center w-full print:break-inside-avoid">
                                <AllocationWidget inputs={inputs} />
                            </div>
                            <div className="min-w-full md:min-w-0 snap-center w-full print:break-inside-avoid">
                                <MonteCarloWidget
                                    mcResult={mcResult}
                                    mcSimulations={mcSimulations}
                                    onClick={() => setShowMonteCarloDetails(true)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals Placeholder */}
                <div id="modals-placeholder">
                    <InsuranceTableModal
                        show={showInsuranceTable}
                        onClose={() => setShowInsuranceTable(false)}
                        form={form}
                        addInsurancePlan={addInsurancePlan}
                        removeInsurancePlan={removeInsurancePlan}
                        updateInsurancePlan={updateInsurancePlan}
                        updateSurrenderTable={updateSurrenderTable}
                    />
                    <ProjectedModal
                        show={showProjectedModal}
                        onClose={() => setShowProjectedModal(false)}
                        form={form}
                        result={result}
                        initialTab={projectedModalTab}
                    />
                    <TargetModal
                        show={showTargetModal}
                        onClose={() => setShowTargetModal(false)}
                        result={result}
                        form={form}
                    />
                    <ExpenseModal
                        show={showExpenseModal}
                        onClose={() => setShowExpenseModal(false)}
                        form={form}
                        result={result}
                        initialTab={expenseModalTab}
                    />
                    <MonteCarloDetailsModal
                        show={showMonteCarloDetails}
                        onClose={() => setShowMonteCarloDetails(false)}
                        mcResult={mcResult}
                        mcSimulations={Number(form.monteCarloSimulations)}
                    />
                </div>

                {/* Desktop Floating Plan Manager (Syncs with Sidebar) */}
                <div className={`hidden xl:block print:hidden fixed bottom-6 z-[140] transition-all duration-300 ease-in-out ${isSummaryOpen ? 'right-[390px]' : 'right-6'}`}>
                    <PlanManager
                        currentData={{
                            form,
                            allocations,
                            returnMode,
                            savingMode,
                            gender
                        }}
                        onLoad={(data) => {
                            setForm(data.form);
                            if (data.allocations) setAllocations(data.allocations);
                            if (data.returnMode) setReturnMode(data.returnMode);
                            if (data.savingMode) setSavingMode(data.savingMode);
                            if (data.gender) setGender(data.gender);
                        }}
                        customTrigger={
                            <button className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group">
                                <Save size={28} />
                                <span className="absolute -top-10 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                                    จัดการแผน
                                </span>
                            </button>
                        }
                    />
                </div>



            </div >

            {/* Mobile Backdrop for Summary Panel */}
            <div
                className={`fixed inset-0 z-[140] bg-black/20 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${isSummaryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSummaryOpen(false)}
            />

            {/* RIGHT AREA: Sidebar (Plan Summary) */}
            <div className={`
                fixed z-[150] transition-all duration-300 ease-in-out pointer-events-none
                
                /* Mobile & Tablet (<1280px): Centered Floating Card (Modal Style) */
                inset-0 flex items-center justify-center px-4
                
                ${isSummaryOpen
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible xl:opacity-100 xl:invisible'}
                
                /* Desktop (>=1280px): Fixed Sidebar (ติดด้านขวา) */
                xl:fixed xl:top-[72px] xl:bottom-0 xl:right-0 xl:inset-auto xl:block
                xl:px-0 xl:flex-none
                xl:bg-transparent xl:shadow-none
                xl:pointer-events-none
                
                /* Desktop Width & Visibility */
                ${isSummaryOpen
                    ? 'xl:w-[360px] xl:translate-x-0 xl:visible xl:opacity-100'
                    : 'xl:w-0 xl:translate-x-full xl:invisible xl:opacity-0'}
                
                print:hidden
            `}>
                <div className={`
                    transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) w-full overflow-hidden pointer-events-auto
                    
                    /* Mobile & Tablet (<1280px): Detailed Bottom Sheet */
                    max-w-lg bg-white rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col 
                    h-[80vh] md:h-[70vh]
                    
                    ${isSummaryOpen
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-8 opacity-0 scale-95'}

                    /* Desktop (>=1280px): Reset */
                    xl:max-w-none xl:bg-transparent xl:rounded-none xl:shadow-none xl:h-full xl:max-h-none xl:overflow-hidden xl:translate-y-0 xl:opacity-100 xl:scale-100 xl:pointer-events-auto
                `}>
                    <PlanSummaryPanel
                        isOpen={isSummaryOpen}
                        onClose={() => setIsSummaryOpen(false)}
                        form={form}
                        allocations={allocations}
                        returnMode={returnMode}
                        savingMode={savingMode}
                        gender={gender}
                    />
                </div>
            </div>

            <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-100/80 pt-1 pb-2 px-4 z-[60] xl:hidden shadow-[0_-12px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 ${isSummaryOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                <div className="grid grid-cols-3 w-full max-w-5xl mx-auto items-end">
                    {/* Adjust Plan Toggle - Left Centered */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className="flex flex-col items-center justify-center gap-1 group transition-all"
                        >
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ease-out shadow-sm ${isSidebarOpen
                                ? 'bg-indigo-600 text-white shadow-indigo-200 rotate-[90deg]'
                                : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 md:w-7 md:h-7" /> : <PanelLeftOpen className="w-5 h-5 md:w-7 md:h-7" />}
                            </div>
                            <span className={`text-xs md:text-sm font-bold tracking-tight transition-colors text-center ${isSidebarOpen ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {isSidebarOpen ? 'ปิด' : 'ปรับแผน'}
                            </span>
                        </button>
                    </div>

                    {/* Save Plan Button - Hero Centerpiece */}
                    <div className="flex justify-center">
                        <PlanManager
                            currentData={{
                                form,
                                allocations,
                                returnMode,
                                savingMode,
                                gender
                            }}
                            onLoad={(data) => {
                                setForm(data.form);
                                if (data.allocations) setAllocations(data.allocations);
                                if (data.returnMode) setReturnMode(data.returnMode);
                                if (data.savingMode) setSavingMode(data.savingMode);
                                if (data.gender) setGender(data.gender);
                            }}
                            customTrigger={
                                <button className="flex flex-col items-center justify-center gap-1 group relative -top-5 transition-all">
                                    <div className="relative group-active:scale-95 transition-all duration-300">
                                        {/* Extreme Overglow */}
                                        <div className="absolute inset-[-8px] bg-emerald-400 blur-2xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity duration-1000"></div>
                                        <div className="absolute inset-[-3px] bg-emerald-300/20 blur-lg rounded-full opacity-40"></div>

                                        {/* The Main Button Ring */}
                                        <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(16,185,129,0.5),0_0_15px_rgba(16,185,129,0.15)] border-[3px] border-white z-10 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            <Save className="w-6 h-6 md:w-9 md:h-9 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs md:text-sm font-bold text-emerald-800 bg-white/90 backdrop-blur-xl px-3 py-0.5 rounded-full border border-emerald-100 shadow-sm tracking-tight uppercase whitespace-nowrap">บันทึก</span>
                                    </div>
                                </button>
                            }
                        />
                    </div>

                    {/* Insurance Portfolio - Right Centered */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                setForm(prev => ({ ...prev, selectedPlanId: null }));
                                setShowInsuranceTable(true);
                            }}
                            className="flex flex-col items-center justify-center gap-1 group transition-all"
                        >
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300 shadow-sm">
                                <TableIcon className="w-5 h-5 md:w-7 md:h-7" />
                            </div>
                            <span className="text-xs md:text-sm font-bold text-slate-400 tracking-tight text-center group-hover:text-blue-600 transition-colors">พอร์ต</span>
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

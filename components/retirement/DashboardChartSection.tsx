"use client";

import React from "react";
import { ProjectionChart } from "./DashboardCharts";
import { MobileProjectionChart } from "./MobileProjectionChart";
import { formatNumber, formatNumber2 } from "@/lib/utils";
import { RetirementInputs, CalculationResult, MonteCarloResult, FormState } from "@/types/retirement";
import { buildProjectionSeries } from "@/lib/retirement-calculation";

interface DashboardChartSectionProps {
    inputs: RetirementInputs;
    result: CalculationResult;
    mcResult: MonteCarloResult;
    form: FormState;
    insuranceChartData: any;
    showSumAssured: boolean;
    setShowSumAssured: (v: boolean) => void;
    showActualSavings: boolean;
    setShowActualSavings: (v: boolean) => void;
    showMC: boolean;
    setShowMC: (v: boolean) => void;
    handleExportExcel: () => void;
    user: { name: string } | null;
}

export const DashboardChartSection: React.FC<DashboardChartSectionProps> = ({
    inputs,
    result,
    mcResult,
    form,
    insuranceChartData,
    showSumAssured,
    setShowSumAssured,
    showActualSavings,
    setShowActualSavings,
    showMC,
    setShowMC,
    handleExportExcel,
    user,
}) => {
    const [chartTickInterval, setChartTickInterval] = React.useState<number>(5);
    const [viewMode, setViewMode] = React.useState<'line' | 'bar'>('bar');

    // Print data
    const printData = React.useMemo(() => {
        const { labels, actual, required, principalStats } = buildProjectionSeries(inputs, result) as any;
        return labels.map((label: string, i: number) => {
            const age = Number(label);
            const savings = actual[i];
            const principal = principalStats ? principalStats[i] : 0;
            const target = Number(label) <= Number(inputs.retireAge) ? required[i] : 0;
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

    return (
        <div className="w-full flex flex-col gap-8 mb-8 px-0 md:px-0">
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

            {/* PRINT ONLY: Plan Summary */}
            <div className="hidden print:block mb-6 p-4 border border-slate-300 rounded-xl bg-slate-50 text-sm">
                <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3 uppercase tracking-wide">Plan Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    <div className="grid grid-cols-2"><span className="text-slate-500">Current Age:</span><span className="font-bold text-slate-800">{form.currentAge} ปี</span></div>
                    <div className="grid grid-cols-2"><span className="text-slate-500">Retire Age:</span><span className="font-bold text-slate-800">{form.retireAge} ปี</span></div>
                    <div className="grid grid-cols-2"><span className="text-slate-500">Life Expectancy:</span><span className="font-bold text-slate-800">{form.lifeExpectancy} ปี</span></div>
                    <div className="grid grid-cols-2"><span className="text-slate-500">Current Savings:</span><span className="font-bold text-slate-800">฿{form.currentSavings}</span></div>
                    <div className="grid grid-cols-2"><span className="text-slate-500">Monthly Saving:</span><span className="font-bold text-slate-800">฿{form.monthlySaving}</span></div>
                    <div className="grid grid-cols-2"><span className="text-slate-500">Expected Return:</span><span className="font-bold text-slate-800">{form.expectedReturn}%</span></div>
                    <div className="grid grid-cols-2"><span className="text-slate-500">Legacy Fund:</span><span className="font-bold text-slate-800">฿{form.legacyFund || "0"}</span></div>
                    <div className="grid grid-cols-2"><span className="text-slate-500">Sum Assured:</span><span className="font-bold text-slate-800">฿{formatNumber(form.insurancePlans.reduce((sum, p) => sum + (Number(String(p.sumAssured).replace(/,/g, "")) || 0), 0))}</span></div>
                    <div className="grid grid-cols-2"><span className="text-slate-500">Post-Retire Income:</span><span className="font-bold text-slate-800">฿{form.retirePension || "0"} / mo</span></div>
                    <div className="grid grid-cols-2 border-t border-slate-200 pt-2 mt-1"><span className="text-slate-500 font-bold">Target Fund:</span><span className="font-bold text-blue-600">฿{formatNumber2(result.targetFund)}</span></div>
                    <div className="grid grid-cols-2 border-t border-slate-200 pt-2 mt-1"><span className="text-slate-500 font-bold">Projected Fund:</span><span className={`font-bold ${result.status === 'enough' ? 'text-emerald-600' : 'text-red-600'}`}>฿{formatNumber2(result.projectedFund)}</span></div>
                </div>
            </div>

            {/* Main Chart Area */}
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
                        {/* View Mode Toggle */}
                        <div className="hidden md:flex bg-white/50 p-1 rounded-xl backdrop-blur-sm border border-slate-200 shadow-sm">
                            <button onClick={() => setViewMode('bar')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${viewMode === 'bar' ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
                                กราฟแท่ง
                            </button>
                            <button onClick={() => setViewMode('line')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${viewMode === 'line' ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}>
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
                                        ${chartTickInterval === interval ? "bg-slate-800 text-white shadow-md shadow-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}
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
                                if (window.innerWidth < 768) {
                                    document.body.classList.add('print-mobile');
                                    document.body.classList.remove('print-desktop');
                                } else {
                                    document.body.classList.add('print-desktop');
                                    document.body.classList.remove('print-mobile');
                                }
                                setTimeout(() => { window.print(); }, 100);
                            }}>
                            Print
                        </button>
                    </div>
                </div>
                <div id="printable-chart" className="w-full relative h-[600px] md:h-[600px] print:h-[350px] print:min-h-0 bg-white rounded-3xl border border-slate-100 p-4 md:p-6 print:p-0 print:border-none print:shadow-none overflow-hidden print:overflow-visible print:break-inside-avoid">
                    <div className="hidden md:block print:block print:w-full print:h-full w-full h-full">
                        <div className={`w-full h-full ${viewMode === 'bar' ? 'block xl:hidden' : 'hidden'}`}>
                            <MobileProjectionChart inputs={inputs} result={result} mcResult={mcResult} showSumAssured={showSumAssured} setShowSumAssured={setShowSumAssured} showActualSavings={showActualSavings} setShowActualSavings={setShowActualSavings} insuranceChartData={insuranceChartData} chartTickInterval={chartTickInterval} showMC={showMC} setShowMC={setShowMC} initialOrientation="vertical" hideOrientationToggle={false} />
                        </div>
                        <div className={`w-full h-full ${viewMode === 'bar' ? 'hidden xl:block print:block' : 'block'}`}>
                            <ProjectionChart inputs={inputs} result={result} mcResult={showMC ? mcResult : null} showSumAssured={showSumAssured} showActualSavings={showActualSavings} insuranceChartData={insuranceChartData} chartTickInterval={chartTickInterval} viewMode={viewMode} />
                        </div>
                    </div>
                    <div className="block md:hidden print:hidden print-mobile-only w-full h-full">
                        <MobileProjectionChart inputs={inputs} result={result} mcResult={mcResult} showSumAssured={showSumAssured} setShowSumAssured={setShowSumAssured} showActualSavings={showActualSavings} setShowActualSavings={setShowActualSavings} insuranceChartData={insuranceChartData} chartTickInterval={chartTickInterval} showMC={showMC} setShowMC={setShowMC} initialOrientation="horizontal" />
                    </div>

                    {/* Financial Highlights Table - Print Only */}
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
                                    <tr>
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

                {/* PRINT ONLY: Data Table */}
                <div id="print-data-table" className="hidden print:block mt-6 font-mono text-black">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-2 border-b border-black pb-1 inline-block">DATA TABLE (YEARLY ANALYSIS)</h3>
                    <div className="grid grid-cols-2 gap-6 text-[10px] leading-snug">
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
    );
};

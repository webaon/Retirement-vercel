import React from 'react';
import { FormState, Allocation } from '@/types/retirement';
import { User, Briefcase, TrendingUp, Grid, PiggyBank, Home, Calculator, Target, Info, ShieldCheck, X } from 'lucide-react';

interface PlanSummaryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    form: FormState;
    allocations: Allocation[];
    savingMode: string;
    returnMode: string;
    gender: 'male' | 'female';
}

export const PlanSummaryPanel: React.FC<PlanSummaryPanelProps> = ({
    isOpen,
    onClose,
    form,
    allocations,
    savingMode,
    returnMode,
    gender
}) => {
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Reset scroll position when panel opens
    React.useEffect(() => {
        if (isOpen && contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [isOpen]);

    // --- Helper Components ---
    const SectionHeader = ({ number, title, colorClass }: { number: string, title: string, colorClass: string }) => (
        <div className={`flex items-center gap-3 mb-4`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${colorClass}`}>
                {number}
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
        </div>
    );

    const DataRow = ({ label, value, subtext }: { label: string, value: string, subtext?: string }) => (
        <div className="flex items-center justify-between py-1">
            <span className="text-xs font-semibold text-slate-500">{label}</span>
            <div className="text-right">
                <div className="text-sm font-extrabold text-slate-800">{value}</div>
                {subtext && <div className="text-[10px] text-slate-400">{subtext}</div>}
            </div>
        </div>
    );

    const formatMoney = (val: string | number) => Number(String(val).replace(/,/g, '')).toLocaleString();

    return (
        <div className="h-full w-full bg-white flex flex-col relative xl:border-l xl:border-slate-200 xl:shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.05)]">
            {/* Header: Sticky on scroll */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm shrink-0 xl:rounded-none">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">สรุปแผนของคุณ</h2>
                    <span className="text-xs text-slate-500 font-medium">ภาพรวมข้อมูลการวางแผนทั้งหมด</span>
                </div>
            </div>

            {/* Content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">

                {/* Section 1: Personal Data */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative overflow-hidden">
                    <SectionHeader number="1" title="ข้อมูลส่วนตัว" colorClass="bg-blue-100 text-blue-600" />

                    <div className="px-1 space-y-2">
                        {/* Name Card */}
                        <div className="bg-white rounded-xl p-3 mb-3 border border-slate-100 shadow-sm">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">ชื่อแผน</span>
                            <div className="font-bold text-slate-800 text-sm">{form.planName || 'แผนเกษียณของฉัน'}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">เพศ</span>
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                                    <span className="text-base">{gender === 'male' ? '👨' : '👩'}</span>
                                    {gender === 'male' ? 'ชาย' : 'หญิง'}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">อายุปัจจุบัน</span>
                                <div className="font-bold text-slate-800 text-sm">{form.currentAge} <span className="text-[10px] font-normal text-slate-500">ปี</span></div>
                            </div>
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">เกษียณที่</span>
                                <div className="font-bold text-slate-800 text-sm">{form.retireAge} <span className="text-[10px] font-normal text-slate-500">ปี</span></div>
                            </div>
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">อายุขัย</span>
                                <div className="font-bold text-slate-800 text-sm">{form.lifeExpectancy} <span className="text-[10px] font-normal text-slate-500">ปี</span></div>
                            </div>
                        </div>

                        <div className="mt-2 text-right">
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                ระยะเวลาหลังเกษียณ {Number(form.lifeExpectancy) - Number(form.retireAge)} ปี
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Financial Status */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                    <SectionHeader number="2" title="สถานะการเงิน" colorClass="bg-emerald-100 text-emerald-600" />

                    <div className="space-y-3 px-1">
                        <DataRow label="เงินออมปัจจุบัน" value={`฿${formatMoney(form.currentSavings)}`} />
                        <DataRow label="เงินออมต่อเดือน" value={`฿${formatMoney(form.monthlySaving)}`} />
                        <DataRow label="รูปแบบการออม" value={savingMode === 'flat' ? 'ออมเท่าเดิมทุกปี' : 'เพิ่มตามอายุ (Step Up)'}
                            subtext={savingMode === 'step5' ? 'ปรับเพิ่มทุก 5 ปี' : undefined}
                        />

                        <hr className="border-slate-200 dashed opacity-50" />

                        <DataRow label="ผลตอบแทนคาดหวัง" value={`${form.expectedReturn}%`} />
                        <DataRow label="รูปแบบการลงทุน" value={returnMode === 'avg' ? 'เฉลี่ยรวม' : 'Custom'} />
                        <DataRow label="อัตราเงินเฟ้อ" value={`${form.inflation}%`} />

                        <div className="mt-1 text-right">
                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                <ShieldCheck size={10} /> ประกันชีวิต {form.insurancePlans.length} กรมธรรม์
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Goals */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                    <SectionHeader number="3" title="เป้าหมาย" colorClass="bg-purple-100 text-purple-600" />

                    <div className="space-y-3 px-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">รายรับ / ทรัพย์สิน</div>
                        <DataRow label="เงินก้อนเกษียณ" value={`฿${formatMoney(form.retireFundOther)}`} />
                        <DataRow label="บำนาญ/เดือน" value={`฿${formatMoney(form.retirePension)}`} />
                        <DataRow label="ผลตอบแทนหลังเกษียณ" value={`${form.retireReturnAfter}%`} />

                        <hr className="border-slate-200 my-1 opacity-50" />

                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">รายจ่าย</div>
                        <div className="bg-indigo-50/50 rounded-xl p-3 text-center border border-indigo-100">
                            <span className="text-[10px] font-bold text-indigo-600 block mb-0.5">ค่าใช้จ่ายหลังเกษียณ/เดือน</span>
                            <div className="text-xl font-black text-indigo-600">฿{formatMoney(form.retireExtraExpense)}</div>
                        </div>

                        <div className="pt-2">
                            <DataRow label="มรดก" value={`฿${formatMoney(form.legacyFund)}`} />
                        </div>

                        <hr className="border-slate-100 dashed" />

                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded bg-slate-200 flex items-center justify-center text-[10px]">🎲</div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Monte Carlo</span>
                        </div>
                        <DataRow label="จำนวนการจำลอง" value={`${form.monteCarloSimulations}`} />
                        <DataRow label="ความผันผวน" value={`${form.monteCarloVolatility}%`} />
                    </div>
                </div>

            </div>

            {/* Footer: Close Button (Hidden on Desktop) */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0 z-50 xl:hidden">
                <button
                    onClick={onClose}
                    className="w-full h-12 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
    );
};

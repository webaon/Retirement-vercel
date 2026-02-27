import React from "react";
import { NumericInput } from "@/components/NumericInput";
import { Plus, X as CloseIcon } from "lucide-react";
import { InsurancePlan } from "@/types/retirement";

interface PensionTiersManagerProps {
    plan: InsurancePlan;
    planIndex: number;
    updateInsurancePlan: (index: number, field: keyof InsurancePlan, value: any) => void;
}

// --- PensionTiersManager: จัดการช่วงเงินบำนาญ (Multi-tier Pension) ---
export const PensionTiersManager: React.FC<PensionTiersManagerProps> = ({
    plan,
    planIndex,
    updateInsurancePlan,
}) => {
    // เพิ่มช่วงบํานาญใหม่ (Add new tier)
    const handleAddTier = () => {
        const tiers = plan.pensionTiers ? [...plan.pensionTiers] : [];
        // เริ่มต้นต่อจากช่วงสุดท้าย หรือจากปีที่เริ่มรับบำนาญ
        const lastEnd = tiers.length > 0
            ? Number(tiers[tiers.length - 1].endAge)
            : Number(plan.pensionStartAge) - 1;

        tiers.push({
            startAge: String(lastEnd + 1),
            endAge: String(lastEnd + 5),
            amount: "0"
        });
        updateInsurancePlan(planIndex, "pensionTiers", tiers);
    };

    // อัปเดตข้อมูลในแต่ละช่วง (Update tier details)
    const handleUpdateTier = (tierIndex: number, field: keyof NonNullable<InsurancePlan['pensionTiers']>[0], value: any) => {
        const tiers = plan.pensionTiers ? [...plan.pensionTiers] : [];
        if (!tiers[tierIndex]) return;

        tiers[tierIndex] = { ...tiers[tierIndex], [field]: value };
        updateInsurancePlan(planIndex, "pensionTiers", tiers);
    };

    const handleRemoveTier = (tierIndex: number) => {
        const tiers = plan.pensionTiers ? [...plan.pensionTiers] : [];
        tiers.splice(tierIndex, 1);
        updateInsurancePlan(planIndex, "pensionTiers", tiers);
    };

    return (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                <span>ช่วงอายุ</span>
                <span>ยอดเงิน/ปี</span>
            </div>
            <div className="space-y-1.5">
                {plan.pensionTiers && plan.pensionTiers.map((tier, tIdx) => (
                    <div key={tIdx} className="flex gap-1.5 items-center group">
                        <div className="flex items-center bg-white rounded-lg border border-indigo-100 shadow-sm overflow-hidden h-7">
                            <NumericInput
                                className="w-9 text-xs h-full px-1 text-center bg-transparent border-0 focus:ring-0"
                                value={tier.startAge}
                                onChange={(v) => handleUpdateTier(tIdx, "startAge", v)}
                            />
                            <div className="w-px h-3 bg-slate-200"></div>
                            <NumericInput
                                className="w-9 text-xs h-full px-1 text-center bg-transparent border-0 focus:ring-0"
                                value={tier.endAge}
                                onChange={(v) => handleUpdateTier(tIdx, "endAge", v)}
                            />
                        </div>
                        <NumericInput
                            className="flex-1 h-7 text-xs px-2 text-right bg-white border-indigo-100 rounded-lg text-indigo-600 font-bold shadow-sm"
                            value={tier.amount}
                            onChange={(v) => handleUpdateTier(tIdx, "amount", v)}
                        />
                        <button
                            onClick={() => handleRemoveTier(tIdx)}
                            className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-rose-500 bg-white hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all shadow-sm opacity-50 group-hover:opacity-100"
                        >
                            <CloseIcon className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={handleAddTier}
                className="w-full py-1.5 text-[10px] font-bold text-indigo-500 bg-white border border-indigo-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1"
            >
                <Plus className="w-3 h-3" /> เพิ่มช่วงบำนาญ
            </button>
        </div>
    );
};

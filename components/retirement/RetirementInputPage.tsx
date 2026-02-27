import React from "react";
import { RetirementInputSection } from "@/components/retirement/RetirementInputSection";
import { FormState, InsurancePlan, Allocation } from "@/types/retirement";
import { Calculator } from "lucide-react";

interface RetirementInputPageProps {
    user: { name: string } | null;
    form: FormState;
    handleChange: (key: keyof FormState) => (e: any) => void;
    changeBy: (key: keyof FormState, delta: number) => () => void;
    gender: "male" | "female";
    setGender: (g: "male" | "female") => void;
    setShowResult: (show: boolean) => void;
    addInsurancePlan: () => void;
    removeInsurancePlan: (id: string) => void;
    updateInsurancePlan: (index: number, key: keyof InsurancePlan, value: any) => void;
    onViewTable: (planId?: string) => void;
    savingMode: "flat" | "step5";
    setSavingMode: (mode: "flat" | "step5") => void;
    returnMode: "avg" | "custom";
    setReturnMode: (mode: "avg" | "custom") => void;
    allocations: Allocation[];
    addAllocation: () => void;
    removeAllocation: (id: number) => void;
    updateAllocation: (id: number, field: keyof Allocation) => (e: any) => void;
    onLogout?: () => void;
    onEditProfile?: () => void;
    relation?: string;
    setRelation?: (r: string) => void;
    onBack?: () => void;
}

// --- RetirementInputPage: หน้ากรอกข้อมูลเกษียณ (Wrapper Component) ---
export const RetirementInputPage: React.FC<RetirementInputPageProps> = ({
    user,
    form,
    handleChange,
    changeBy,
    gender,
    setGender,
    setShowResult,
    addInsurancePlan,
    removeInsurancePlan,
    updateInsurancePlan,
    onViewTable,
    savingMode,
    setSavingMode,
    returnMode,
    setReturnMode,
    allocations,
    addAllocation,
    removeAllocation,
    updateAllocation,
    onLogout,
    onEditProfile,
    relation,
    setRelation,
    onBack
}) => {
    return (
        <div className="min-h-screen bg-white font-['Inter'] pb-32 relative">
            {/* Background Grid Pattern - Softened */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.2]"
                    style={{
                        backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
            </div>
            {/* TOP NAVIGATION BAR */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm flex items-center justify-between mb-8">
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
                    <button onClick={onEditProfile} className="hidden sm:flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-full border border-slate-100 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white shadow-sm font-bold text-xs overflow-hidden">
                            {(user as any)?.avatar ? (
                                <img src={(user as any).avatar} alt="Avatar" className="w-full h-full object-cover" />
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

            {/* Content Container */}
            <div className="max-w-xl mx-auto px-4 py-6 space-y-6 relative z-10">
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
                    onViewTable={onViewTable}
                    savingMode={savingMode}
                    setSavingMode={setSavingMode}
                    returnMode={returnMode}
                    setReturnMode={setReturnMode}
                    allocations={allocations}
                    addAllocation={addAllocation}
                    removeAllocation={removeAllocation}
                    updateAllocation={updateAllocation}
                    onCalculate={() => setShowResult(true)}
                    relation={relation}
                    setRelation={setRelation}
                />
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, FolderOpen, Plus, X, Edit2, Trash2, Cloud, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormState, Allocation } from '@/types/retirement';
import { Textarea } from '@/components/ui/textarea';

interface PlanData {
    form: FormState;
    allocations: Allocation[];
    returnMode: "avg" | "custom";
    savingMode: "flat" | "step5";
    gender: "male" | "female";
}

interface SavedPlan {
    id: string;
    name: string;
    date: string;
    note?: string;
    data: PlanData;
}

interface PlanManagerProps {
    currentData: PlanData;
    onLoad: (data: PlanData) => void;
    customTrigger?: React.ReactNode;
}

// ... existing interfaces ...

// --- PlanManager: ระบบจัดการแผนการเงิน (บันทึก/โหลด) ---
export const PlanManager: React.FC<PlanManagerProps> = ({ currentData, onLoad, customTrigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [plans, setPlans] = useState<SavedPlan[]>([]);
    const [planName, setPlanName] = useState("");
    const [note, setNote] = useState("");
    const [profileName, setProfileName] = useState("Default");
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // โหลดข้อมูลแผนทั้งหมดจาก LocalStorage เมื่อเริ่มต้น
    useEffect(() => {
        const saved = localStorage.getItem('retirementPlans');
        if (saved) {
            try {
                setPlans(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse plans", e);
            }
        }
        const profile = localStorage.getItem('userProfileName');
        if (profile) setProfileName(profile);
    }, []);

    // ฟังก์ชันบันทึกแผนปัจจุบัน (Save Current Plan)
    const savePlan = () => {
        if (!planName.trim()) return;

        const newPlan: SavedPlan = {
            id: Date.now().toString(),
            name: planName,
            date: new Date().toLocaleDateString('th-TH'),
            note: note,
            data: currentData
        };

        const updatedPlans = [...plans, newPlan];
        setPlans(updatedPlans);
        localStorage.setItem('retirementPlans', JSON.stringify(updatedPlans));
        setPlanName("");
        setNote("");
    };

    const deletePlan = (id: string) => {
        const updated = plans.filter(p => p.id !== id);
        setPlans(updated);
        localStorage.setItem('retirementPlans', JSON.stringify(updated));
    };

    const loadPlan = (plan: SavedPlan) => {
        onLoad(plan.data);
        setIsOpen(false);
    };

    const saveProfile = () => {
        setIsEditingProfile(false);
        localStorage.setItem('userProfileName', profileName);
    };

    return (
        <>
            {/* Trigger Button: Use custom if provided, otherwise default floating button */}
            {customTrigger ? (
                <div onClick={() => setIsOpen(!isOpen)}>
                    {customTrigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
                    title="บันทึก/โหลดแผน"
                >
                    {isOpen ? <X size={28} /> : <Save size={28} />}
                    <span className="absolute -top-10 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        จัดการแผน
                    </span>
                </button>
            )}

            {/* Panel */}
            {isOpen && createPortal(
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => setIsOpen(false)}>
                    <div
                        className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-all hover:rotate-90">
                                <X size={20} />
                            </button>
                            <div className="flex flex-col items-center justify-center mb-10 gap-4">
                                <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                    <Save size={40} />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-black text-[28px] text-slate-800 tracking-tight">
                                        บันทึกแผนการเงิน
                                    </h3>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Personal Wealth Vault • {plans.length} items</p>
                                </div>
                            </div>

                            {/* Save Form */}
                            <div className="space-y-6 mb-10">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชื่อแผนใหม่</Label>
                                    <Input
                                        placeholder="เช่น แผนเกษียณชิลล์ๆ..."
                                        value={planName}
                                        onChange={(e) => setPlanName(e.target.value)}
                                        className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:bg-white transition-all h-14 rounded-2xl text-base px-5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">บันทึกช่วยจำ (Optional)</Label>
                                    <Textarea
                                        placeholder="รายละเอียดเพิ่มเติม..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:bg-white resize-none min-h-[100px] rounded-2xl text-base p-5"
                                    />
                                </div>
                                <Button
                                    onClick={savePlan}
                                    disabled={!planName.trim()}
                                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-[0_15px_30px_-5px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Save size={20} className="mr-3" />
                                    บันทึกแผนปัจจุบัน
                                </Button>
                            </div>

                            {/* Saved List */}
                            {plans.length > 0 && (
                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <FolderOpen size={16} className="text-blue-500" />
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">แผนที่บันทึกไว้ ({plans.length})</Label>
                                    </div>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                        {plans.map(plan => (
                                            <div key={plan.id} className="group relative flex flex-col p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-lg transition-all gap-3 cursor-pointer" onClick={() => loadPlan(plan)}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-800 text-base truncate group-hover:text-blue-600 transition-colors">{plan.name}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                                                            <Cloud size={10} className="text-blue-400" />
                                                            {plan.date}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); }}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                            title="ลบแผน"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {plan.note && (
                                                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                                        <p className="text-xs text-slate-500 line-clamp-2 italic leading-relaxed">"{plan.note}"</p>
                                                    </div>
                                                )}

                                                {/* Selection Indicator */}
                                                <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl opacity-0 scale-95 transition-all group-hover:opacity-10 pointer-events-none group-hover:scale-100 ring-4 ring-blue-50/50"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};


"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import {
    FormState,
    InsurancePlan,
    MemberProfile,
    Allocation,
} from "@/types/retirement";
import {
    initialForm,
    buildRetirementInputs,
    calculateRetirement,
    runMonteCarlo,
    buildProjectionSeries
} from "@/lib/retirement-calculation";
import { formatInputDisplay, formatNumber } from "@/lib/utils";
import { useInsuranceLogic } from "@/components/retirement/DashboardModals";

export function useRetirementApp() {
    /* ---------- Authentication (mock) ---------- */
    const [user, setUser] = React.useState<{ name: string; avatar?: string; } | null>(null);
    const [planType, setPlanType] = React.useState<"individual" | "family" | null>(null);

    /* ---------- Family State ---------- */
    const [familyMembers, setFamilyMembers] = React.useState<MemberProfile[]>([]);
    const [currentMemberId, setCurrentMemberId] = React.useState<string>("primary");
    const [showFamilyPanel, setShowFamilyPanel] = React.useState(false);

    /* ---------- Individual State (Separated) ---------- */
    const [individualMember, setIndividualMember] = React.useState<MemberProfile | null>(null);

    /* ---------- Main Form State ---------- */
    const [form, setForm] = React.useState<FormState>(initialForm);
    const [inputStep, setInputStep] = React.useState(1); // 1=Personal, 2=Financial, 3=Goal
    const [showResult, setShowResult] = React.useState(false);
    const [showFamilyResult, setShowFamilyResult] = React.useState(false);

    // Settings & Preferences
    const [gender, setGender] = React.useState<"male" | "female">("male");
    const [relation, setRelation] = React.useState<"self" | "spouse" | "child" | "father" | "mother" | "relative">("self");
    const [savingMode, setSavingMode] = React.useState<"flat" | "step5">("flat");
    const [returnMode, setReturnMode] = React.useState<"avg" | "custom">("avg");
    const [retireSpendMode, setRetireSpendMode] = React.useState<"flat" | "step5">("flat");
    const [allocations, setAllocations] = React.useState<Allocation[]>([
        { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
        { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
        { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
    ]);

    // UI State (Collapsibles)
    const [showSumAssured, setShowSumAssured] = React.useState(true);
    const [showActualSavings, setShowActualSavings] = React.useState(true);
    const [showProfileCard, setShowProfileCard] = React.useState(true);
    const [showAgeCard, setShowAgeCard] = React.useState(true);
    const [showFinancialCard, setShowFinancialCard] = React.useState(true);
    const [showStrategyCard, setShowStrategyCard] = React.useState(true);
    const [showGoalCard, setShowGoalCard] = React.useState(true);
    const [showInsuranceCard, setShowInsuranceCard] = React.useState(true);
    const [isRelationOpen, setIsRelationOpen] = React.useState(false);
    const [showProfileSettings, setShowProfileSettings] = React.useState(false);

    // Modals & Chart Controls
    const [showInsuranceTable, setShowInsuranceTable] = React.useState(false);
    const [showExpenseModal, setShowExpenseModal] = React.useState(false);
    const [showTargetModal, setShowTargetModal] = React.useState(false);
    const [showProjectedModal, setShowProjectedModal] = React.useState(false);
    const [showMonteCarloDetails, setShowMonteCarloDetails] = React.useState(false);
    const [showActualSavingsInput, setShowActualSavingsInput] = React.useState(false);
    const [chartTickInterval, setChartTickInterval] = React.useState<number>(5);

    // Monte Carlo Settings (Now Derived from Form)
    const [isMonteCarloOpen, setIsMonteCarloOpen] = React.useState(false);

    // Persistence
    const [planSaved, setPlanSaved] = React.useState(false);
    const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
    const [savedPlans, setSavedPlans] = React.useState<any[]>([]);
    const SAVED_PLANS_KEY = "retirement-saved-plans-v2";
    const FAMILY_KEY = "retirement-family-v1";


    /* ---------- Initialization ---------- */
    React.useEffect(() => {
        // Basic defaults
        const defaultMember: MemberProfile = {
            id: "primary",
            name: "ฉัน",
            relation: "self",
            form: initialForm,
            gender: "male",
            savingMode: "flat",
            returnMode: "avg",
            retireSpendMode: "flat",
            allocations: [
                { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
                { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
                { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
            ]
        } as any;

        setFamilyMembers([defaultMember]);
        setIndividualMember(defaultMember); // Initialize Individual with same default
        setCurrentMemberId("primary");
        setForm(initialForm);

        // Load saved plans
        if (typeof window !== "undefined") {
            const stored = window.localStorage.getItem(SAVED_PLANS_KEY);
            if (stored) {
                try {
                    setSavedPlans(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse saved plans", e);
                }
            }
        }
    }, []);

    /* ---------- Formatting Effect ---------- */
    React.useEffect(() => {
        setForm((prev) => {
            const mapping: Partial<FormState> = {};
            const keys: (keyof FormState)[] = [
                "currentSavings", "monthlySaving", "savingAt35", "savingAt40", "savingAt45",
                "savingAt50", "savingAt55", "retireFundOther", "retireMonthlyIncome",
                "retireReturnAfter", "retireExtraExpense", "retireSpendTrendPercent",
                "retireSpecialAnnual", "legacyFund", "currentAge", "retireAge", "lifeExpectancy",
                "retirePension", "monteCarloVolatility", "monteCarloSimulations"
            ];
            let changed = false;
            keys.forEach((k) => {
                const raw = String(prev[k] ?? "");
                const stripped = raw.replace(/,/g, "");
                if (stripped === "") return;
                const num = Number(stripped);
                if (!Number.isNaN(num)) {
                    // Monte Carlo Sims is integer, others formatted string
                    let formatted = formatInputDisplay(String(num));
                    if (k === "monteCarloSimulations") formatted = String(Math.floor(num));

                    if (formatted !== raw) {
                        mapping[k] = formatted as any;
                        changed = true;
                    }
                }
            });
            return changed ? { ...prev, ...mapping } : prev;
        });
    }, [form.currentSavings, form.monthlySaving, form.currentAge, form.retireAge, form.lifeExpectancy, form.retirePension, form.monteCarloVolatility]);

    /* ---------- Calculations ---------- */
    const inputs = React.useMemo(() => buildRetirementInputs({
        form,
        gender,
        savingMode,
        returnMode,
        allocations
    }), [form, gender, savingMode, returnMode, allocations]);

    const result = React.useMemo(() => calculateRetirement(inputs), [inputs]);

    const mcResult = React.useMemo(() => {
        const sims = Number(String(form.monteCarloSimulations || "1500").replace(/,/g, ""));
        const vol = Number(String(form.monteCarloVolatility || "6").replace(/,/g, ""));
        return runMonteCarlo(inputs, sims, vol / 100);
    }, [inputs, form.monteCarloSimulations, form.monteCarloVolatility]);

    /* ---------- Handlers ---------- */
    const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
        let val = "";
        if (typeof e === "string") {
            val = e;
        } else if (e && e.target) {
            val = e.target.value;
        }
        setForm((prev) => ({ ...prev, [field]: val }));
    };

    const changeBy = (field: keyof FormState, delta: number) => () => {
        setForm((prev) => {
            let valStart = Number(String(prev[field] || "0").replace(/,/g, ""));
            if (Number.isNaN(valStart)) valStart = 0;
            let newVal = valStart + delta;

            const isPercent = ["expectedReturn", "inflation", "retireSpendTrendPercent", "monteCarloVolatility"].includes(field);
            if (!isPercent && newVal < 0) newVal = 0;

            return { ...prev, [field]: formatInputDisplay(String(newVal)) };
        });
    };

    const addAllocation = () => {
        setAllocations(prev => [...prev, { id: Date.now(), name: "สินทรัพย์ใหม่", weight: "0", expectedReturn: "5", volatility: "10" }]);
    };

    const removeAllocation = (id: number) => {
        setAllocations(prev => prev.filter(p => p.id !== id));
    };

    const updateAllocation = (id: number, field: keyof Allocation) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllocations(prev => prev.map(p => p.id === id ? { ...p, [field]: e.target.value } : p));
    };


    /* ---------- Insurance Handlers ---------- */
    const addInsurancePlan = () => {
        const newId = String(Date.now());
        setForm(prev => ({
            ...prev,
            insurancePlans: [
                ...prev.insurancePlans,
                {
                    id: newId,
                    active: true,
                    expanded: true,
                    planName: `New Plan ${prev.insurancePlans.length + 1}`,
                    type: "ตลอดชีพ",
                    coverageAge: "85",
                    sumAssured: (1000000).toLocaleString(),
                    useSurrender: false,
                    surrenderAge: "55",
                    surrenderValue: (100000).toLocaleString(),
                    pensionAmount: (12000).toLocaleString(),
                    pensionStartAge: "60",
                    pensionEndAge: "85",
                    maturityAmount: (100000).toLocaleString(),
                    cashBackAmount: "0",
                    cashBackFrequency: "1",
                    assumedReturn: "5",
                    pensionPercent: "0",
                    unequalPension: false,
                    deathBenefitPrePension: (1000000).toLocaleString(),
                    pensionTiers: [],
                    surrenderMode: "single",
                    surrenderTableData: [],
                }
            ]
        }));
    };

    const removeInsurancePlan = (id: string) => {
        setForm(prev => ({
            ...prev,
            insurancePlans: prev.insurancePlans.filter(p => p.id !== id)
        }));
    };

    const updateInsurancePlan = (index: number, field: keyof InsurancePlan, value: any) => {
        setForm(prev => {
            const newPlans = [...prev.insurancePlans];
            newPlans[index] = { ...newPlans[index], [field]: value };
            return { ...prev, insurancePlans: newPlans };
        });
    };

    const changeInsuranceBy = (index: number, key: keyof InsurancePlan, delta: number) => {
        setForm(prev => {
            const newPlans = [...prev.insurancePlans];
            const plan = newPlans[index];
            const currentVal = Number(String(plan[key] || "0").replace(/,/g, "")) || 0;
            const newVal = Math.max(0, currentVal + delta);
            const isLargeValue = ["sumAssured", "maturityAmount", "cashBackAmount", "pensionAmount", "deathBenefitPrePension", "surrenderValue"].includes(key);
            newPlans[index] = { ...plan, [key]: isLargeValue ? formatInputDisplay(newVal) : String(newVal) };
            return { ...prev, insurancePlans: newPlans };
        });
    };

    const updateSurrenderTable = (planIndex: number, age: number, value: string) => {
        setForm(prev => {
            const newPlans = [...prev.insurancePlans];
            const plan = newPlans[planIndex];
            const currentTable = [...(plan.surrenderTableData || [])];
            const exIndex = currentTable.findIndex(d => d.age === age);
            if (exIndex >= 0) {
                currentTable[exIndex] = { ...currentTable[exIndex], amount: value };
            } else {
                currentTable.push({ age, amount: value });
            }
            newPlans[planIndex] = { ...plan, surrenderTableData: currentTable };
            return { ...prev, insurancePlans: newPlans };
        });
    };


    /* ---------- Family Logic (Handlers) ---------- */
    const syncCurrentToFamily = React.useCallback(() => {
        setFamilyMembers(prev => {
            const idx = prev.findIndex(m => m.id === currentMemberId);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = {
                ...updated[idx],
                form,
                gender,
                relation,
                savingMode,
                returnMode,
                retireSpendMode,
                allocations,
            };
            if (typeof window !== "undefined") {
                window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    }, [currentMemberId, form, gender, relation, savingMode, returnMode, retireSpendMode, allocations]);

    // Sync to Individual State
    React.useEffect(() => {
        if (planType === "individual" && individualMember) {
            setIndividualMember(prev => ({
                ...prev!,
                form, gender, relation, savingMode, returnMode, retireSpendMode, allocations
            }));
        } else if (planType === "family") {
            syncCurrentToFamily(); // Auto-sync to Family State
        }
    }, [form, gender, relation, savingMode, returnMode, retireSpendMode, allocations, planType]);

    const handleSetPlanType = (type: "individual" | "family" | null) => {
        // If switching TO a type, load its data
        if (type === "individual") {
            if (individualMember) {
                loadMember(individualMember);
            }
        } else if (type === "family") {
            // Load primary family member (or current if we tracked it separately, but sticking to 0/primary for now)
            // If familyMembers is empty, it re-inits, but it shouldn't be empty due to init effect.
            const target = familyMembers.find(m => m.id === currentMemberId) || familyMembers[0];
            if (target) loadMember(target);
        }

        setPlanType(type);
    };

    const loadMember = (member: MemberProfile) => {
        setForm(member.form);
        setGender(member.gender);
        setRelation(member.relation || "child");
        setSavingMode(member.savingMode);
        setReturnMode(member.returnMode);
        setRetireSpendMode(member.retireSpendMode);
        setAllocations(member.allocations);
        setCurrentMemberId(member.id);
    };

    const handleSwitchMember = (id: string) => {
        if (id === currentMemberId) return;
        const targetMember = familyMembers.find(m => m.id === id);
        if (!targetMember) return;

        const updatedList = familyMembers.map(m => {
            if (m.id === currentMemberId) {
                return {
                    ...m,
                    form, gender, relation, savingMode, returnMode, retireSpendMode, allocations
                };
            }
            return m;
        });
        setFamilyMembers(updatedList);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updatedList));
        }

        const newM = updatedList.find(m => m.id === id);
        if (newM) loadMember(newM);
    };

    const handleAddMember = () => {
        const updatedList = familyMembers.map(m => {
            if (m.id === currentMemberId) {
                return {
                    ...m,
                    form, gender, relation, savingMode, returnMode, retireSpendMode, allocations
                };
            }
            return m;
        });

        const newId = String(Date.now());
        const newMember: MemberProfile = {
            id: newId,
            name: `สมาชิกใหม่ ${updatedList.length + 1}`,
            relation: "child",
            form: {
                ...initialForm,
                currentAge: "0",
                retireAge: "60",
                lifeExpectancy: "85",
                currentSavings: "0",
                monthlySaving: "0",
                retireMonthlyIncome: "0",
                retireFundOther: "0",
                legacyFund: "0",
                retireExtraExpense: "0",
                retireSpecialAnnual: "0",
                planName: `แผนของสมาชิก ${updatedList.length + 1}`
            },
            gender: "male",
            savingMode: "flat",
            returnMode: "avg",
            allocations: [
                { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
                { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
                { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
            ],
            retireSpendMode: "flat",
            isDraft: true
        } as any;

        const newList = [...updatedList, newMember];
        setFamilyMembers(newList);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(FAMILY_KEY, JSON.stringify(newList));
        }

        loadMember(newMember);
        setInputStep(1);
        setShowFamilyResult(false);
        setShowResult(false);
    };

    const handleConfirmDraft = () => {
        setFamilyMembers(prev => {
            const idx = prev.findIndex(m => m.id === currentMemberId);
            if (idx === -1) return prev;
            // Only update if it is currently a draft
            if (!prev[idx].isDraft) return prev;

            const updated = [...prev];
            updated[idx] = { ...updated[idx], isDraft: false };
            if (typeof window !== "undefined") {
                window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    };

    const handleRemoveMember = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (familyMembers.length <= 1) {
            alert("ต้องมีสมาชิกอย่างน้อย 1 คน");
            return;
        }
        if (confirm("ต้องการลบสมาชิกคนนี้ใช่ไหม?")) {
            const newList = familyMembers.filter(m => m.id !== id);
            setFamilyMembers(newList);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(FAMILY_KEY, JSON.stringify(newList));
            }
            if (id === currentMemberId) {
                loadMember(newList[0]);
            }
        }
    };


    /* ---------- Save/Load Plans ---------- */
    const handleSavePlan = () => {
        if (typeof window === "undefined") return;

        const newPlan = {
            id: Date.now(),
            name: form.planName || `แผนที่ ${savedPlans.length + 1}`,
            timestamp: new Date().toISOString(),
            form: JSON.parse(JSON.stringify(form)),
            gender,
            relation,
            savingMode,
            returnMode,
            retireSpendMode,
            allocations: JSON.parse(JSON.stringify(allocations)),
        };

        const updatedPlans = [newPlan, ...savedPlans];
        setSavedPlans(updatedPlans);
        window.localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updatedPlans));

        syncCurrentToFamily();

        setPlanSaved(true);
        setSaveMessage("บันทึกแผนเรียบร้อยแล้ว");
        setTimeout(() => setSaveMessage(null), 2500);
    };

    const handleLoadPlan = (plan: any) => {
        if (confirm(`ต้องการโหลดแผน "${plan.name}" ใช่หรือไม่? ข้อมูลปัจจุบันจะถูกแทนที่`)) {
            setForm(plan.form);
            setGender(plan.gender || "male");
            setRelation(plan.relation || "self");
            setSavingMode(plan.savingMode || "flat");
            setReturnMode(plan.returnMode || "avg");
            setRetireSpendMode(plan.retireSpendMode || "flat");
            setAllocations(plan.allocations || []);
            setPlanSaved(true);
        }
    };

    const handleDeletePlan = (id: number) => {
        const updated = savedPlans.filter(p => p.id !== id);
        setSavedPlans(updated);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
        }
    };

    const resetRetirement = () => {
        if (confirm("ต้องการรีเซ็ตข้อมูลทั้งหมดหรือไม่?")) {
            setForm(initialForm);
            setAllocations([
                { id: 1, name: "หุ้น", weight: "70", expectedReturn: "8", volatility: "15" },
                { id: 2, name: "ตราสารหนี้", weight: "25", expectedReturn: "4", volatility: "5" },
                { id: 3, name: "เงินสด/ทอง", weight: "5", expectedReturn: "2", volatility: "2" },
            ]);
            setInputStep(1);
            setShowResult(false);
            setPlanSaved(false);
        }
    };

    /* ---------- Family Summary ---------- */
    const getFamilySummary = () => {
        const relevantMembers = familyMembers.filter(m => !m.isDraft); // Filter out drafts
        let totalTarget = 0;
        let totalProjected = 0;
        let totalGap = 0;
        let totalMonthlySavingsCurrent = 0;
        let totalMonthlyNeeded = 0;
        const memberDetails: { id: string; name: string; target: number; projected: number; isReady: boolean }[] = [];

        relevantMembers.forEach((m) => {
            const isCurrent = String(m.id) === String(currentMemberId);
            const inputs = buildRetirementInputs({
                form: isCurrent ? form : m.form,
                gender: isCurrent ? gender : m.gender,
                savingMode: isCurrent ? savingMode : m.savingMode,
                returnMode: isCurrent ? returnMode : m.returnMode,
                allocations: isCurrent ? allocations : m.allocations
            });
            const res = calculateRetirement(inputs);
            totalTarget += res.targetFund;
            totalProjected += res.projectedFund;
            totalGap += res.gap;
            totalMonthlySavingsCurrent += inputs.monthlySaving;
            totalMonthlyNeeded += res.monthlyNeeded;

            memberDetails.push({
                id: m.id,
                name: m.name,
                target: res.targetFund,
                projected: res.projectedFund,
                isReady: res.status === "enough",
            });
        });

        return {
            totalTarget,
            totalProjected,
            totalGap,
            memberCount: relevantMembers.length,
            totalMonthlySavingsCurrent,
            totalMonthlyNeeded,
            memberDetails,
        };
    };

    /* ---------- Insurance Logic ---------- */
    const { insuranceChartData } = useInsuranceLogic(form);

    /* ---------- Projection Chart ---------- */
    const projectionChart = React.useMemo(() => {
        const { labels, actual, required, actualHistory } = buildProjectionSeries(inputs, result);

        const p5Series = mcResult.p5Series || labels.map(() => 0);
        const p95Series = mcResult.p95Series || labels.map(() => 0);

        const sumAssuredSeries = labels.map(ageStr => {
            const age = Number(ageStr);
            if (!insuranceChartData) return 0;
            const idx = insuranceChartData.labels.indexOf(age);
            if (idx !== -1) {
                return insuranceChartData.datasets[0].data[idx] as number || 0;
            }
            return 0;
        });

        return {
            data: {
                labels,
                datasets: [
                    {
                        label: "P5",
                        data: p5Series,
                        borderColor: "transparent",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        pointRadius: 0,
                        fill: "+1",
                        tension: 0.4,
                        order: 5,
                        hidden: false,
                    },
                    {
                        label: "P95",
                        data: p95Series,
                        borderColor: "transparent",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4,
                        order: 6,
                        hidden: false,
                    },
                    {
                        label: "เงินออมคาดว่าจะมี",
                        data: actual,
                        borderColor: "#10B981",
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                        tension: 0.4,
                        fill: true,
                        pointRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#10B981",
                        pointBorderWidth: 3,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#10B981",
                        pointHoverBorderWidth: 4,
                        order: 1,
                        hidden: !showActualSavings,
                    },
                    {
                        label: "เงินที่เก็บได้จริง",
                        data: actualHistory,
                        borderColor: "#2563eb",
                        backgroundColor: "transparent",
                        pointRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#2563eb",
                        pointBorderWidth: 3,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#2563eb",
                        pointHoverBorderWidth: 4,
                        order: 0,
                        showLine: false,
                        hidden: !showActualSavings,
                    },
                    {
                        label: "อิสรภาพทางการเงิน",
                        data: required.map((val, i) => Number(labels[i]) <= Number(inputs.retireAge) - 1 ? val : null),
                        borderColor: "#2563eb",
                        borderDash: [6, 6],
                        backgroundColor: "transparent",
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: false,
                        order: 2,
                        hidden: false,
                    },
                    {
                        label: "ทุนประกัน",
                        data: sumAssuredSeries,
                        borderColor: "#F97316",
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        pointRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#F97316",
                        pointBorderWidth: 3,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#F97316",
                        pointHoverBorderWidth: 4,
                        fill: false,
                        order: 3,
                        hidden: !showSumAssured,
                    },
                    {
                        label: "มรดก",
                        data: labels.map((age, i) => Number(age) >= Number(inputs.retireAge) ? inputs.legacyFund : null),
                        borderColor: "#EF4444", // Red-500
                        borderDash: [5, 5],
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        fill: false,
                        order: 4,
                        hidden: !(inputs.legacyFund > 0),
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        };
    }, [inputs, result, mcResult, showSumAssured, showActualSavings, insuranceChartData]);

    /* ---------- Expense Chart Data ---------- */
    const expenseChart = React.useMemo(() => {
        if (!result.expenseSchedule || result.expenseSchedule.length === 0) return null;

        const labels = result.expenseSchedule.map((r) => String(r.age));
        const dataMonthly = result.expenseSchedule.map((r) => r.monthly);

        return {
            data: {
                labels,
                datasets: [
                    {
                        label: "รายจ่ายต่อเดือน (บาท)",
                        data: dataMonthly,
                        borderColor: "#B05AD9", // Purple
                        backgroundColor: "rgba(176, 90, 217, 0.1)",
                        tension: 0.3,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                    },
                ],
            },
        };
    }, [result.expenseSchedule]);

    const handleLogin = (name: string) => {
        const u = { name };
        setUser(u);
        if (typeof window !== "undefined") {
            window.localStorage.setItem("mock-user", JSON.stringify(u));
        }
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            window.localStorage.clear();
        }
        setUser(null);
        setForm(initialForm);
        setFamilyMembers([]);
        setCurrentMemberId("primary");
        setInputStep(1);
        setShowResult(false);
        setShowFamilyResult(false);
        setPlanType(null);
    };

    const handleUpdateUser = (data: { name: string; avatar?: string }) => {
        const u = user ? { ...user, ...data } : { ...data };
        setUser(u);
        if (typeof window !== "undefined") {
            window.localStorage.setItem("mock-user", JSON.stringify(u));
        }
    };

    const handlePrint = () => {
        if (typeof window !== "undefined") window.print();
    };

    const handleExportExcel = () => {
        // Cast result to any to access new properties if TS complains, or rely on inference
        const calculationData = buildProjectionSeries(inputs, result) as any;
        const { labels, actual, required, insuranceInflows, sumAssuredSeries } = calculationData;
        const retireAge = Number(inputs.retireAge);
        const legacyFund = Number(inputs.legacyFund) || 0;

        // Rows
        const rows = labels.map((ageStr: string, i: number) => {
            const age = Number(ageStr);
            const rowData: any = {
                "อายุ": age,
                "เงินออมสะสม": Number((actual[i] || 0).toFixed(2)),
            };

            // Target Goal: Show only up to Retire Age OR until Goal is met
            const isGoalMetPreviously = i > 0 && (actual[i - 1] || 0) >= (required[i - 1] || 0);
            if (age <= retireAge && !isGoalMetPreviously) {
                rowData["เป้าหมายเกษียณ"] = Number((required[i] || 0).toFixed(2));
            } else {
                rowData["เป้าหมายเกษียณ"] = "";
            }

            // Insurance Data
            rowData["ทุนประกันรวม"] = Number((sumAssuredSeries[i] || 0).toFixed(2));
            rowData["กระแสเงินสดจากประกัน"] = Number((insuranceInflows[i] || 0).toFixed(2));

            // Legacy: Start showing from Retire Age onwards
            if (legacyFund > 0 && age >= retireAge) {
                rowData["เป้าหมายมรดก"] = Number(legacyFund.toFixed(2));
            }

            return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Auto-width columns (simple heuristic)
        const wscols = [
            { wch: 10 }, // Age
            { wch: 20 }, // Savings
            { wch: 20 }, // Target
            { wch: 20 }, // Sum Assured
            { wch: 25 }, // Income
            { wch: 20 }, // Legacy
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Retirement Plan");

        XLSX.writeFile(workbook, "Retirement_Plan_Export.xlsx");
    };


    return {
        state: {
            user, planType, familyMembers, currentMemberId, showFamilyPanel,
            form, inputStep, showResult, showFamilyResult,
            gender, relation, savingMode, returnMode, retireSpendMode, allocations,
            showSumAssured, showActualSavings, showProfileCard, showAgeCard,
            showFinancialCard, showStrategyCard, showGoalCard, showInsuranceCard,
            isRelationOpen, showInsuranceTable, showExpenseModal, showTargetModal,
            showProjectedModal, showMonteCarloDetails, chartTickInterval, showActualSavingsInput,
            isMonteCarloOpen, // Removed mcVolatility, mcSimulations
            planSaved, saveMessage, savedPlans, showProfileSettings
        },
        setters: {
            setUser, setPlanType: handleSetPlanType, setFamilyMembers, setCurrentMemberId, setShowFamilyPanel,
            setForm, setInputStep, setShowResult, setShowFamilyResult,
            setGender, setRelation, setSavingMode, setReturnMode, setRetireSpendMode, setAllocations,
            setShowSumAssured, setShowActualSavings, setShowProfileCard, setShowAgeCard,
            setShowFinancialCard, setShowStrategyCard, setShowGoalCard, setShowInsuranceCard,
            setIsRelationOpen, setShowInsuranceTable, setShowExpenseModal, setShowTargetModal,
            setShowProjectedModal, setShowMonteCarloDetails, setChartTickInterval, setShowActualSavingsInput,
            setIsMonteCarloOpen, // Removed setMcVolatility, setMcSimulations
            setPlanSaved, setSaveMessage, setSavedPlans, setShowProfileSettings
        },
        calculations: {
            inputs, result, mcResult, projectionChart, expenseChart, insuranceChartData
        },
        handlers: {
            handleChange, changeBy, addAllocation, removeAllocation, updateAllocation,
            addInsurancePlan, removeInsurancePlan, updateInsurancePlan, changeInsuranceBy, updateSurrenderTable,
            syncCurrentToFamily, loadMember, handleSwitchMember, handleAddMember, handleRemoveMember, getFamilySummary, handleConfirmDraft,
            handleSavePlan, handleLoadPlan, handleDeletePlan, resetRetirement, handleLogin, handleLogout,
            handleExportExcel, handlePrint, handleUpdateUser
        }
    };
}

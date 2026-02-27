"use client";

import * as React from "react";
import {
    FormState,
    MemberProfile,
    Allocation,
} from "@/types/retirement";
import { initialForm, buildRetirementInputs, calculateRetirement } from "@/lib/retirement-calculation";

const FAMILY_KEY = "retirement-family-v1";

/**
 * useFamilyMembers — Family members state management.
 * Extracted from useRetirementApp for better separation of concerns.
 */
export function useFamilyMembers(
    form: FormState,
    setForm: React.Dispatch<React.SetStateAction<FormState>>,
    gender: "male" | "female",
    setGender: (g: "male" | "female") => void,
    relation: "self" | "spouse" | "child" | "father" | "mother" | "relative",
    setRelation: (r: any) => void,
    savingMode: "flat" | "step5",
    setSavingMode: React.Dispatch<React.SetStateAction<"flat" | "step5">>,
    returnMode: "avg" | "custom",
    setReturnMode: React.Dispatch<React.SetStateAction<"avg" | "custom">>,
    retireSpendMode: "flat" | "step5",
    setRetireSpendMode: React.Dispatch<React.SetStateAction<"flat" | "step5">>,
    allocations: Allocation[],
    setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>,
    setInputStep: React.Dispatch<React.SetStateAction<number>>,
    setShowResult: React.Dispatch<React.SetStateAction<boolean>>,
    setShowFamilyResult: React.Dispatch<React.SetStateAction<boolean>>,
) {
    const [familyMembers, setFamilyMembers] = React.useState<MemberProfile[]>([]);
    const [currentMemberId, setCurrentMemberId] = React.useState<string>("primary");
    const [showFamilyPanel, setShowFamilyPanel] = React.useState(false);
    const [individualMember, setIndividualMember] = React.useState<MemberProfile | null>(null);

    const loadMember = React.useCallback((member: MemberProfile) => {
        setForm(member.form);
        setGender(member.gender);
        setRelation(member.relation || "child");
        setSavingMode(member.savingMode);
        setReturnMode(member.returnMode);
        setRetireSpendMode(member.retireSpendMode);
        setAllocations(member.allocations);
        setCurrentMemberId(member.id);
    }, [setForm, setGender, setRelation, setSavingMode, setReturnMode, setRetireSpendMode, setAllocations]);

    const syncCurrentToFamily = React.useCallback(() => {
        setFamilyMembers(prev => {
            const idx = prev.findIndex(m => m.id === currentMemberId);
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = {
                ...updated[idx],
                form, gender, relation, savingMode, returnMode, retireSpendMode, allocations,
            };
            if (typeof window !== "undefined") {
                window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    }, [currentMemberId, form, gender, relation, savingMode, returnMode, retireSpendMode, allocations]);

    const handleSwitchMember = React.useCallback((id: string) => {
        if (id === currentMemberId) return;
        const targetMember = familyMembers.find(m => m.id === id);
        if (!targetMember) return;

        const updatedList = familyMembers.map(m => {
            if (m.id === currentMemberId) {
                return { ...m, form, gender, relation, savingMode, returnMode, retireSpendMode, allocations };
            }
            return m;
        });
        setFamilyMembers(updatedList);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updatedList));
        }

        const newM = updatedList.find(m => m.id === id);
        if (newM) loadMember(newM);
    }, [currentMemberId, familyMembers, form, gender, relation, savingMode, returnMode, retireSpendMode, allocations, loadMember]);

    const handleAddMember = React.useCallback(() => {
        const updatedList = familyMembers.map(m => {
            if (m.id === currentMemberId) {
                return { ...m, form, gender, relation, savingMode, returnMode, retireSpendMode, allocations };
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
                currentAge: "0", retireAge: "60", lifeExpectancy: "85",
                currentSavings: "0", monthlySaving: "0", retireMonthlyIncome: "0",
                retireFundOther: "0", legacyFund: "0", retireExtraExpense: "0",
                retireSpecialAnnual: "0", planName: `แผนของสมาชิก ${updatedList.length + 1}`
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
    }, [familyMembers, currentMemberId, form, gender, relation, savingMode, returnMode, retireSpendMode, allocations, loadMember, setInputStep, setShowFamilyResult, setShowResult]);

    const handleConfirmDraft = React.useCallback(() => {
        setFamilyMembers(prev => {
            const idx = prev.findIndex(m => m.id === currentMemberId);
            if (idx === -1) return prev;
            if (!prev[idx].isDraft) return prev;
            const updated = [...prev];
            updated[idx] = { ...updated[idx], isDraft: false };
            if (typeof window !== "undefined") {
                window.localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    }, [currentMemberId]);

    const handleRemoveMember = React.useCallback((id: string, e?: React.MouseEvent) => {
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
    }, [familyMembers, currentMemberId, loadMember]);

    const getFamilySummary = React.useCallback(() => {
        const relevantMembers = familyMembers.filter(m => !m.isDraft);
        let totalTarget = 0, totalProjected = 0, totalGap = 0, totalMonthlySavingsCurrent = 0, totalMonthlyNeeded = 0;
        const memberDetails: { id: string; name: string; target: number; projected: number; isReady: boolean }[] = [];

        relevantMembers.forEach((m) => {
            const isCurrent = String(m.id) === String(currentMemberId);
            const memberInputs = buildRetirementInputs({
                form: isCurrent ? form : m.form,
                gender: isCurrent ? gender : m.gender,
                savingMode: isCurrent ? savingMode : m.savingMode,
                returnMode: isCurrent ? returnMode : m.returnMode,
                allocations: isCurrent ? allocations : m.allocations
            });
            const res = calculateRetirement(memberInputs);
            totalTarget += res.targetFund;
            totalProjected += res.projectedFund;
            totalGap += res.gap;
            totalMonthlySavingsCurrent += memberInputs.monthlySaving;
            totalMonthlyNeeded += res.monthlyNeeded;

            memberDetails.push({
                id: m.id, name: m.name, target: res.targetFund, projected: res.projectedFund, isReady: res.status === "enough",
            });
        });

        return { totalTarget, totalProjected, totalGap, memberCount: relevantMembers.length, totalMonthlySavingsCurrent, totalMonthlyNeeded, memberDetails };
    }, [familyMembers, currentMemberId, form, gender, savingMode, returnMode, allocations]);

    return {
        familyMembers, setFamilyMembers,
        currentMemberId, setCurrentMemberId,
        showFamilyPanel, setShowFamilyPanel,
        individualMember, setIndividualMember,
        loadMember, syncCurrentToFamily,
        handleSwitchMember, handleAddMember, handleConfirmDraft, handleRemoveMember,
        getFamilySummary,
    };
}

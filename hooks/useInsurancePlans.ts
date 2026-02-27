"use client";

import * as React from "react";
import { FormState, InsurancePlan } from "@/types/retirement";
import { formatInputDisplay } from "@/lib/utils";

/**
 * useInsurancePlans — Insurance plan CRUD and surrender table management.
 * Extracted from useRetirementApp for better separation of concerns.
 */
export function useInsurancePlans(
    setForm: React.Dispatch<React.SetStateAction<FormState>>
) {
    const addInsurancePlan = React.useCallback(() => {
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
    }, [setForm]);

    const removeInsurancePlan = React.useCallback((id: string) => {
        setForm(prev => ({
            ...prev,
            insurancePlans: prev.insurancePlans.filter(p => p.id !== id)
        }));
    }, [setForm]);

    const updateInsurancePlan = React.useCallback((index: number, field: keyof InsurancePlan, value: any) => {
        setForm(prev => {
            const newPlans = [...prev.insurancePlans];
            newPlans[index] = { ...newPlans[index], [field]: value };
            return { ...prev, insurancePlans: newPlans };
        });
    }, [setForm]);

    const changeInsuranceBy = React.useCallback((index: number, key: keyof InsurancePlan, delta: number) => {
        setForm(prev => {
            const newPlans = [...prev.insurancePlans];
            const plan = newPlans[index];
            const currentVal = Number(String(plan[key] || "0").replace(/,/g, "")) || 0;
            const newVal = Math.max(0, currentVal + delta);
            const isLargeValue = ["sumAssured", "maturityAmount", "cashBackAmount", "pensionAmount", "deathBenefitPrePension", "surrenderValue"].includes(key);
            newPlans[index] = { ...plan, [key]: isLargeValue ? formatInputDisplay(newVal) : String(newVal) };
            return { ...prev, insurancePlans: newPlans };
        });
    }, [setForm]);

    const updateSurrenderTable = React.useCallback((planIndex: number, age: number, value: string) => {
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
    }, [setForm]);

    return {
        addInsurancePlan,
        removeInsurancePlan,
        updateInsurancePlan,
        changeInsuranceBy,
        updateSurrenderTable,
    };
}

"use client";

import * as React from "react";
import { FormState, Allocation } from "@/types/retirement";
import { formatInputDisplay } from "@/lib/utils";

/**
 * useFormHandlers — Form field change handlers.
 * Extracted from useRetirementApp for better separation of concerns.
 */
export function useFormHandlers(
    setForm: React.Dispatch<React.SetStateAction<FormState>>,
    setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>
) {
    const handleChange = React.useCallback(
        (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
            let val = "";
            if (typeof e === "string") {
                val = e;
            } else if (e && e.target) {
                val = e.target.value;
            }
            setForm((prev) => ({ ...prev, [field]: val }));
        },
        [setForm]
    );

    const changeBy = React.useCallback(
        (field: keyof FormState, delta: number) => () => {
            setForm((prev) => {
                let valStart = Number(String(prev[field] || "0").replace(/,/g, ""));
                if (Number.isNaN(valStart)) valStart = 0;
                let newVal = valStart + delta;

                const isPercent = ["expectedReturn", "inflation", "retireSpendTrendPercent", "monteCarloVolatility"].includes(field);
                if (!isPercent && newVal < 0) newVal = 0;

                return { ...prev, [field]: formatInputDisplay(String(newVal)) };
            });
        },
        [setForm]
    );

    const addAllocation = React.useCallback(() => {
        setAllocations(prev => [...prev, { id: Date.now(), name: "สินทรัพย์ใหม่", weight: "0", expectedReturn: "5", volatility: "10" }]);
    }, [setAllocations]);

    const removeAllocation = React.useCallback((id: number) => {
        setAllocations(prev => prev.filter(p => p.id !== id));
    }, [setAllocations]);

    const updateAllocation = React.useCallback(
        (id: number, field: keyof Allocation) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setAllocations(prev => prev.map(p => p.id === id ? { ...p, [field]: e.target.value } : p));
        },
        [setAllocations]
    );

    return { handleChange, changeBy, addAllocation, removeAllocation, updateAllocation };
}

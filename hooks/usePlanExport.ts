"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { FormState, Allocation, RetirementInputs, CalculationResult } from "@/types/retirement";
import { buildProjectionSeries } from "@/lib/retirement-calculation";
import { exportPlanToJSON, importPlanFromJSON, downloadJSON, readFileAsText } from "@/lib/planStorage";

/**
 * usePlanExport — Excel export, JSON export/import;
 * Extracted from useRetirementApp for better separation of concerns.
 */
export function usePlanExport(
    form: FormState,
    setForm: React.Dispatch<React.SetStateAction<FormState>>,
    gender: "male" | "female",
    setGender: (g: "male" | "female") => void,
    savingMode: "flat" | "step5",
    setSavingMode: React.Dispatch<React.SetStateAction<"flat" | "step5">>,
    returnMode: "avg" | "custom",
    setReturnMode: React.Dispatch<React.SetStateAction<"avg" | "custom">>,
    allocations: Allocation[],
    setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>,
    inputs: RetirementInputs,
    result: CalculationResult,
) {
    const handleExportExcel = React.useCallback(() => {
        const calculationData = buildProjectionSeries(inputs, result) as any;
        const { labels, actual, required, insuranceInflows, sumAssuredSeries } = calculationData;
        const retireAge = Number(inputs.retireAge);
        const legacyFund = Number(inputs.legacyFund) || 0;

        const rows = labels.map((ageStr: string, i: number) => {
            const age = Number(ageStr);
            const rowData: any = {
                "อายุ": age,
                "เงินออมสะสม": Number((actual[i] || 0).toFixed(2)),
            };

            const isGoalMetPreviously = i > 0 && (actual[i - 1] || 0) >= (required[i - 1] || 0);
            if (age <= retireAge && !isGoalMetPreviously) {
                rowData["เป้าหมายเกษียณ"] = Number((required[i] || 0).toFixed(2));
            } else {
                rowData["เป้าหมายเกษียณ"] = "";
            }

            rowData["ทุนประกันรวม"] = Number((sumAssuredSeries[i] || 0).toFixed(2));
            rowData["กระแสเงินสดจากประกัน"] = Number((insuranceInflows[i] || 0).toFixed(2));

            if (legacyFund > 0 && age >= retireAge) {
                rowData["เป้าหมายมรดก"] = Number(legacyFund.toFixed(2));
            }

            return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        worksheet['!cols'] = [
            { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 20 },
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Retirement Plan");
        XLSX.writeFile(workbook, "Retirement_Plan_Export.xlsx");
    }, [inputs, result]);

    const handleExportJSON = React.useCallback(() => {
        const json = exportPlanToJSON(form, gender, savingMode, returnMode, allocations);
        const planName = form.planName || "retirement-plan";
        downloadJSON(json, `${planName.replace(/\s+/g, "_")}.json`);
    }, [form, gender, savingMode, returnMode, allocations]);

    const handleImportJSON = React.useCallback(async (file: File) => {
        try {
            const text = await readFileAsText(file);
            const data = importPlanFromJSON(text);
            setForm(data.form);
            setGender(data.gender);
            setSavingMode(data.savingMode);
            setReturnMode(data.returnMode);
            if (data.allocations.length > 0) setAllocations(data.allocations);
            alert("นำเข้าข้อมูลสำเร็จ!");
        } catch (err: any) {
            alert(`นำเข้าข้อมูลไม่สำเร็จ: ${err.message}`);
        }
    }, [setForm, setGender, setSavingMode, setReturnMode, setAllocations]);

    return { handleExportExcel, handleExportJSON, handleImportJSON };
}

"use client";

import { FormState, Allocation } from "@/types/retirement";

// ----------------------------------------------------------------
// Type definitions for plan data
// ----------------------------------------------------------------
export interface PlanData {
    version: number;
    exportDate: string;
    form: FormState;
    gender: "male" | "female";
    savingMode: "flat" | "step5";
    returnMode: "avg" | "custom";
    allocations: Allocation[];
}

// ----------------------------------------------------------------
// Export plan state to JSON string
// ----------------------------------------------------------------
export function exportPlanToJSON(
    form: FormState,
    gender: "male" | "female",
    savingMode: "flat" | "step5",
    returnMode: "avg" | "custom",
    allocations: Allocation[]
): string {
    const data: PlanData = {
        version: 1,
        exportDate: new Date().toISOString(),
        form,
        gender,
        savingMode,
        returnMode,
        allocations,
    };
    return JSON.stringify(data, null, 2);
}

// ----------------------------------------------------------------
// Import plan data from JSON string
// ----------------------------------------------------------------
export function importPlanFromJSON(jsonString: string): PlanData {
    let parsed: any;
    try {
        parsed = JSON.parse(jsonString);
    } catch {
        throw new Error("Invalid JSON format. Please check the file content.");
    }

    // Validate required fields
    if (!parsed.form) {
        throw new Error("Missing 'form' field in plan data.");
    }
    if (typeof parsed.form.currentAge === "undefined") {
        throw new Error("Invalid form data: missing 'currentAge'.");
    }

    return {
        version: parsed.version || 1,
        exportDate: parsed.exportDate || new Date().toISOString(),
        form: parsed.form,
        gender: parsed.gender || "male",
        savingMode: parsed.savingMode || "flat",
        returnMode: parsed.returnMode || "avg",
        allocations: parsed.allocations || [],
    };
}

// ----------------------------------------------------------------
// Download JSON as file
// ----------------------------------------------------------------
export function downloadJSON(data: string, filename: string = "retirement-plan.json"): void {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------
// Read file as text (for import)
// ----------------------------------------------------------------
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsText(file);
    });
}

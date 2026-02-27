import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    exportPlanToJSON,
    importPlanFromJSON,
    downloadJSON,
    readFileAsText,
    PlanData,
} from "@/lib/planStorage";
import { initialForm } from "@/lib/retirement-calculation";

describe("planStorage — JSON Roundtrip Tests", () => {
    const sampleForm = {
        ...initialForm,
        currentAge: "35",
        retireAge: "60",
        lifeExpectancy: "85",
        monthlySaving: "15,000",
        currentSavings: "500,000",
        expectedReturn: "7",
        inflation: "3",
        planName: "แผนทดสอบ",
    };

    const sampleAllocations = [
        { id: 1, name: "หุ้น", weight: "60", expectedReturn: "10", volatility: "18" },
        { id: 2, name: "ตราสารหนี้", weight: "30", expectedReturn: "4", volatility: "5" },
        { id: 3, name: "ทอง", weight: "10", expectedReturn: "3", volatility: "12" },
    ];

    describe("Export → Import Roundtrip", () => {
        it("should preserve all form fields through roundtrip", () => {
            const json = exportPlanToJSON(sampleForm, "female", "step5", "custom", sampleAllocations);
            const data = importPlanFromJSON(json);

            expect(data.form.currentAge).toBe("35");
            expect(data.form.retireAge).toBe("60");
            expect(data.form.lifeExpectancy).toBe("85");
            expect(data.form.monthlySaving).toBe("15,000");
            expect(data.form.currentSavings).toBe("500,000");
            expect(data.form.expectedReturn).toBe("7");
            expect(data.form.inflation).toBe("3");
            expect(data.form.planName).toBe("แผนทดสอบ");
        });

        it("should preserve gender, savingMode, returnMode", () => {
            const json = exportPlanToJSON(sampleForm, "female", "step5", "custom", []);
            const data = importPlanFromJSON(json);

            expect(data.gender).toBe("female");
            expect(data.savingMode).toBe("step5");
            expect(data.returnMode).toBe("custom");
        });

        it("should preserve allocations array exactly", () => {
            const json = exportPlanToJSON(sampleForm, "male", "flat", "avg", sampleAllocations);
            const data = importPlanFromJSON(json);

            expect(data.allocations).toHaveLength(3);
            expect(data.allocations[0]).toEqual(sampleAllocations[0]);
            expect(data.allocations[1]).toEqual(sampleAllocations[1]);
            expect(data.allocations[2]).toEqual(sampleAllocations[2]);
        });

        it("should preserve insurance plans through roundtrip", () => {
            const formWithInsurance = {
                ...sampleForm,
                insurancePlans: [
                    {
                        id: "ins-1",
                        active: true,
                        expanded: false,
                        planName: "แผนประกัน A",
                        type: "ตลอดชีพ",
                        coverageAge: "90",
                        sumAssured: "2,000,000",
                        useSurrender: false,
                        surrenderAge: "55",
                        surrenderValue: "100,000",
                        pensionAmount: "12,000",
                        pensionStartAge: "60",
                        pensionEndAge: "85",
                        maturityAmount: "100,000",
                        cashBackAmount: "0",
                        cashBackFrequency: "1",
                        assumedReturn: "5",
                        pensionPercent: "0",
                        unequalPension: false,
                        deathBenefitPrePension: "2,000,000",
                        pensionTiers: [],
                        surrenderMode: "single" as const,
                        surrenderTableData: [],
                    },
                ],
            };

            const json = exportPlanToJSON(formWithInsurance, "male", "flat", "avg", []);
            const data = importPlanFromJSON(json);

            expect(data.form.insurancePlans).toHaveLength(1);
            expect(data.form.insurancePlans[0].planName).toBe("แผนประกัน A");
            expect(data.form.insurancePlans[0].sumAssured).toBe("2,000,000");
        });
    });

    describe("Simulated localStorage Clear → Import Recovery", () => {
        let storage: Record<string, string>;

        beforeEach(() => {
            storage = {};
        });

        it("should recover data from JSON after localStorage clear", () => {
            // Step 1: Export current data to JSON
            const json = exportPlanToJSON(sampleForm, "female", "step5", "custom", sampleAllocations);

            // Step 2: Simulate saving to localStorage
            storage["retirement-plan"] = json;

            // Step 3: Simulate clearing localStorage
            storage = {};
            expect(storage["retirement-plan"]).toBeUndefined();

            // Step 4: Simulate importing from the saved JSON string
            const recoveredData = importPlanFromJSON(json);

            // Step 5: Verify all data is recovered
            expect(recoveredData.form.currentAge).toBe("35");
            expect(recoveredData.form.monthlySaving).toBe("15,000");
            expect(recoveredData.gender).toBe("female");
            expect(recoveredData.savingMode).toBe("step5");
            expect(recoveredData.returnMode).toBe("custom");
            expect(recoveredData.allocations).toHaveLength(3);
            expect(recoveredData.allocations[0].name).toBe("หุ้น");
        });
    });

    describe("Error Handling", () => {
        it("should throw on invalid JSON string", () => {
            expect(() => importPlanFromJSON("{ broken json")).toThrow("Invalid JSON");
        });

        it("should throw on missing form field", () => {
            expect(() => importPlanFromJSON(JSON.stringify({ version: 1 }))).toThrow("Missing 'form'");
        });

        it("should throw on form without currentAge", () => {
            expect(() => importPlanFromJSON(JSON.stringify({ form: { planName: "test" } }))).toThrow("missing 'currentAge'");
        });

        it("should use sensible defaults for optional fields", () => {
            const minimal = JSON.stringify({ form: { ...sampleForm } });
            const data = importPlanFromJSON(minimal);

            expect(data.version).toBe(1);
            expect(data.gender).toBe("male");
            expect(data.savingMode).toBe("flat");
            expect(data.returnMode).toBe("avg");
            expect(data.allocations).toEqual([]);
        });

        it("should handle empty allocations array gracefully", () => {
            const json = exportPlanToJSON(sampleForm, "male", "flat", "avg", []);
            const data = importPlanFromJSON(json);
            expect(data.allocations).toEqual([]);
        });
    });

    describe("Export Format", () => {
        it("should include version number", () => {
            const json = exportPlanToJSON(sampleForm, "male", "flat", "avg", []);
            const parsed = JSON.parse(json);
            expect(parsed.version).toBe(1);
        });

        it("should include exportDate as ISO string", () => {
            const json = exportPlanToJSON(sampleForm, "male", "flat", "avg", []);
            const parsed = JSON.parse(json);
            expect(parsed.exportDate).toBeDefined();
            expect(new Date(parsed.exportDate).toISOString()).toBe(parsed.exportDate);
        });

        it("should produce pretty-printed JSON", () => {
            const json = exportPlanToJSON(sampleForm, "male", "flat", "avg", []);
            // Pretty-printed JSON has newlines
            expect(json).toContain("\n");
            expect(json.split("\n").length).toBeGreaterThan(5);
        });
    });
});

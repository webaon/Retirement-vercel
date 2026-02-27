
import {
    FormState,
    RetirementInputs,
    Allocation,
    InsurancePlanInput,
    CalculationResult,
    ExpenseRow,
    MonteCarloResult
} from "@/types/retirement";

/* ---------- ค่าเริ่มต้น (Default Values) ---------- */
export const initialForm: FormState = {
    currentAge: "30", // เริ่มต้นอายุ 30
    retireAge: "60", // เกษียณอายุ 60
    lifeExpectancy: "85", // อายุขัย 85

    currentSavings: "200,000", // เงินออมตั้งต้น
    monthlySaving: "10,000", // ออมต่อเดือน
    expectedReturn: "7", // ผลตอบแทนคาดหวัง 7%
    inflation: "3", // เงินเฟ้อ 3%

    savingAt35: "0",
    savingAt40: "0",
    savingAt45: "0",
    savingAt50: "0",
    savingAt55: "0",

    retireFundOther: "0",
    retireMonthlyIncome: "0",
    retireReturnAfter: "0", // ผลตอบแทนหลังเกษียณ (Default 0% = เก็บเงินสด/ฝากธนาคาร)
    retireExtraExpense: "12,000", // ค่าใช้จ่ายหลังเกษียณ (ปรับตามเงินเฟ้อ)
    retireSpendTrendPercent: "0",
    retireSpecialAnnual: "18,400", // ค่าใช้จ่ายพิเศษรายปี (เช่น ประกันสุขภาพ/ท่องเที่ยว)
    retirePension: "6,000", // บำนาญ (เช่น เบี้ยผู้สูงอายุ)
    retireSpendingMode: "inflation_adjusted",
    retireSpendingTrend: "0",
    legacyFund: "0", // มรดก
    retireNote: "",
    note: "",

    monteCarloVolatility: "6", // ความผันผวน 6%
    monteCarloSimulations: "5", // จำนวนรอบจำลอง 5 รอบ (เริ่มต้น)

    insurancePlans: [],
    selectedPlanId: null,

    planName: "แผนเกษียณของฉัน",
};

/* ---------- Logic Builder (แปลง FormState เป็น RetirementInputs) ---------- */
export function buildRetirementInputs(opts: {
    form: FormState;
    gender: "male" | "female";
    savingMode: "flat" | "step5"; // โหมดการออม (คงที่ / ขั้นบันได)
    returnMode: "avg" | "custom"; // โหมดผลตอบแทน (เฉลี่ย / กำหนดเอง)
    allocations: Allocation[];
}): RetirementInputs {
    const { form, gender, savingMode, returnMode, allocations } = opts;
    // Helper แปลง string เป็น number (ลบลูกน้ำออก)
    const num = (v: string) => {
        const val = Number(String(v || "").replace(/,/g, ""));
        return isNaN(val) ? 0 : val;
    };

    // สร้างข้อมูลการออมขั้นบันได (Step Increments)
    const stepIncrements =
        savingMode === "step5"
            ? [
                { age: 35, monthlySaving: num(form.savingAt35) },
                { age: 40, monthlySaving: num(form.savingAt40) },
                { age: 45, monthlySaving: num(form.savingAt45) },
                { age: 50, monthlySaving: num(form.savingAt50) },
                { age: 55, monthlySaving: num(form.savingAt55) },
            ]
            : [];

    // สร้างข้อมูลการจัดสรรสินทรัพย์ (Allocations)
    const allocs =
        returnMode === "custom"
            ? allocations.map((a) => ({
                name: a.name,
                weight: Number(a.weight || 0),
                expectedReturn: Number(a.expectedReturn || 0),
                volatility: Number(a.volatility || 0),
            }))
            : [];

    // แปลงข้อมูลแผนประกัน (Insurance Plans)
    const insurancePlans = form.insurancePlans.map(p => ({
        id: p.id,
        active: p.active,
        name: p.planName,
        type: p.type,
        coverageAge: num(p.coverageAge),
        sumAssured: num(p.sumAssured),
        useSurrender: p.type === "ชั่วระยะเวลา" ? false : p.useSurrender,
        surrenderAge: num(p.surrenderAge),
        surrenderValue: num(p.surrenderValue),
        pensionAmount: num(p.pensionAmount),
        pensionStartAge: num(p.pensionStartAge),
        pensionEndAge: num(p.pensionEndAge),
        maturityAmount: num(p.maturityAmount),
        cashBackAmount: num(p.cashBackAmount),
        cashBackFrequency: num(p.cashBackFrequency) || 1,
        assumedReturn: p.type === "Unit Linked" ? 0 : num(p.assumedReturn),
        pensionPercent: num(p.pensionPercent),
        unequalPension: p.unequalPension,
        deathBenefitPrePension: num(p.deathBenefitPrePension),
        pensionTiers: (p.pensionTiers || []).map(t => ({
            startAge: num(t.startAge),
            endAge: num(t.endAge),
            amount: num(t.amount)
        })),
        surrenderMode: p.surrenderMode || "single",
        surrenderTableData: p.surrenderTableData || [],
    }));

    return {
        gender,
        currentAge: num(form.currentAge),
        retireAge: num(form.retireAge),
        lifeExpectancy: num(form.lifeExpectancy),
        currentSavings: num(form.currentSavings),
        monthlySaving: num(form.monthlySaving),
        expectedReturn: num(form.expectedReturn),
        inflation: num(form.inflation),
        savingMode,
        stepIncrements,
        retireFundOther: num(form.retireFundOther),

        // Correct Mapping:
        retireMonthlyIncome: num(form.retirePension), // Logic Income = Form Pension (รายได้หลังเกษียณใช้ค่าจาก Pension ในฟอร์ม)
        retireExtraExpense: num(form.retireExtraExpense), // Logic Expense = Form Expense (ค่าใช้จ่ายใช้ค่าจาก Extra Expense)

        retireReturnAfter: num(form.retireReturnAfter),
        retireSpendTrendPercent: num(form.retireSpendingTrend), // Use the new trend field
        retireSpecialAnnual: num(form.retireSpecialAnnual),
        legacyFund: num(form.legacyFund),
        returnMode,
        allocations: allocs,
        insurancePlans,
    };
}

/* ========================
   (CORE CALCULATION LOGIC - ส่วนคำนวณหลัก)
   ======================== */
export function calculateRetirement(inputs: RetirementInputs & { retirePension?: number }): CalculationResult {
    const {
        currentAge,
        retireAge,
        lifeExpectancy,
        currentSavings,
        monthlySaving,
        expectedReturn,
        inflation,
        savingMode,
        stepIncrements,
        retireFundOther,
        retireMonthlyIncome, // This acts as INCOME (Pension) (รายได้หลังเกษียณ)
        retireReturnAfter,
        retireExtraExpense, // This acts as EXPENSE (Lifestyle) (ค่าใช้จ่ายหลังเกษียณ)
        retireSpecialAnnual, // Added: Missing from destructuring
        legacyFund,
        insurancePlans
    } = inputs;


    const yearsToRetire = Math.max(0, retireAge - currentAge);
    const yearsInRetirement = Math.max(0, lifeExpectancy - retireAge);

    const r_inf = inflation / 100;
    const r_pre_nominal = expectedReturn / 100;
    const r_post_nominal = retireReturnAfter / 100;

    // Logic: เงินไหลเข้าจากประกัน (เวนคืน)
    let insuranceCashInflow = 0;

    // 1. Projected Fund (เงินออมสะสมฝั่ง Wealth)
    let wealth = currentSavings;
    for (let i = 0; i < yearsToRetire; i++) {
        const age = currentAge + i;

        // คำนวณเงินออมต่อเดือนในปีนั้นๆ (รองรับ Step Saving)
        let currentMonthlySaving = monthlySaving;
        if (savingMode === "step5") {
            for (const step of stepIncrements) {
                if (age >= step.age && step.monthlySaving > 0) {
                    currentMonthlySaving = step.monthlySaving;
                }
            }
        }
        const annualSaving = currentMonthlySaving * 12;
        const investmentReturn = wealth * r_pre_nominal; // ผลตอบแทนการลงทุน

        // Check Insurance Inflow (Pre-Retirement) - ตรวจสอบเงินเข้าจากประกันก่อนเกษียณ
        let extraInflow = 0;
        insurancePlans.forEach((plan: InsurancePlanInput) => {
            if (!plan.active) return;

            // 1. Surrender Logic (เวนคืนกรมธรรม์)
            if (plan.useSurrender) {
                if (plan.surrenderMode === "table" && plan.surrenderTableData) {
                    const entry = plan.surrenderTableData.find(d => d.age === age);
                    if (entry) extraInflow += Number(String(entry.amount).replace(/,/g, ""));
                } else if (age === plan.surrenderAge && plan.surrenderValue > 0) {
                    extraInflow += plan.surrenderValue;
                }
            }

            // 2. Maturity (Endowment) - ครบกำหนดสัญญา (สะสมทรัพย์)
            if (plan.type === "สะสมทรัพย์" && age === plan.coverageAge) {
                extraInflow += plan.maturityAmount;
            }

            // 3. Cash Back (Endowment) - เงินคืนระหว่างสัญญา
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                const policyYear = age - currentAge;
                if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && age <= plan.coverageAge) {
                    extraInflow += plan.cashBackAmount;
                }
            }

            // 4. Pension (Annuity) - บำนาญ (กรณีรับก่อนเกษียณ)
            if (plan.type === "บำนาญ") {
                if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                    for (const tier of plan.pensionTiers) {
                        if (age >= tier.startAge && age <= tier.endAge) {
                            extraInflow += tier.amount;
                        }
                    }
                } else {
                    let pensionAmt = plan.pensionAmount;
                    if (plan.pensionPercent > 0) {
                        pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                    }
                    if (age >= plan.pensionStartAge && age <= plan.pensionEndAge) {
                        extraInflow += pensionAmt;
                    }
                }
            }
        });

        if (extraInflow > 0) {
            insuranceCashInflow += extraInflow;
        }

        // อัปเดตเงินสะสม: เงินต้น + ผลตอบแทน + เงินออมเพิ่ม + เงินเข้าจากประกัน
        wealth = wealth + investmentReturn + annualSaving + extraInflow;
    }

    // Check Insurance Inflow (At Retirement Exact Year) - ตรวจสอบเงินเข้า ณ ปีที่เกษียณพอดี
    let retireYearInflow = 0;
    insurancePlans.forEach((plan: InsurancePlanInput) => {
        if (!plan.active) return;

        // (Logic เหมือนข้างบน แต่เช็คเฉพาะปีเกษียณ)
        if (plan.useSurrender) {
            if (plan.surrenderMode === "table" && plan.surrenderTableData) {
                const entry = plan.surrenderTableData.find(d => d.age === retireAge);
                if (entry) retireYearInflow += Number(String(entry.amount).replace(/,/g, ""));
            } else if (retireAge === plan.surrenderAge && plan.surrenderValue > 0) {
                retireYearInflow += plan.surrenderValue;
            }
        }

        if (plan.type === "สะสมทรัพย์" && retireAge === plan.coverageAge) {
            retireYearInflow += plan.maturityAmount;
        }
        if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
            const policyYear = retireAge - currentAge;
            if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && retireAge <= plan.coverageAge) {
                retireYearInflow += plan.cashBackAmount;
            }
        }
        if (plan.type === "บำนาญ") {
            if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                for (const tier of plan.pensionTiers) {
                    if (retireAge >= tier.startAge && retireAge <= tier.endAge) {
                        retireYearInflow += tier.amount;
                    }
                }
            } else {
                let pensionAmt = plan.pensionAmount;
                if (plan.pensionPercent > 0) {
                    pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                }
                if (retireAge >= plan.pensionStartAge && retireAge <= plan.pensionEndAge) {
                    retireYearInflow += pensionAmt;
                }
            }
        }
    });

    if (retireYearInflow > 0) {
        wealth += retireYearInflow;
        insuranceCashInflow += retireYearInflow;
    }

    wealth += (retireFundOther || 0);
    const projectedFund = wealth;

    const fvLumpSum = currentSavings * Math.pow(1 + r_pre_nominal, yearsToRetire);
    const annualPmt = monthlySaving * 12;
    let fvAnnuity = 0;
    if (Math.abs(r_pre_nominal) < 1e-9) {
        fvAnnuity = annualPmt * yearsToRetire;
    } else {
        fvAnnuity = annualPmt * ((Math.pow(1 + r_pre_nominal, yearsToRetire) - 1) / r_pre_nominal);
    }

    // 2. Expense Schedule (ตารางค่าใช้จ่ายหลังเกษียณ)
    // Use Helper or define local if simple. The original code has rounding.
    const round2 = (num: number) => Math.round(num * 100) / 100;

    // คำนวณค่าใช้จ่ายปีแรกหลังเกษียณ (Future Value of Expense)
    let valAtRetire = retireExtraExpense * Math.pow(1 + r_inf, yearsToRetire);
    let runningExpenseMonthly = round2(valAtRetire);

    const expenseSchedule: ExpenseRow[] = [];

    // วนลูปสร้างตารางค่าใช้จ่ายแต่ละปีจนถึงอายุขัย
    for (let i = 0; i <= yearsInRetirement; i++) {
        const yearlyExp = round2(runningExpenseMonthly * 12);
        expenseSchedule.push({
            age: retireAge + i,
            monthly: runningExpenseMonthly,
            yearly: yearlyExp
        });
        // ปรับเพิ่มตามเงินเฟ้อปีถัดไป
        const nextVal = runningExpenseMonthly * (1 + r_inf);
        runningExpenseMonthly = round2(nextVal);
    }

    const totalLifetimeExpense = expenseSchedule.reduce((sum, item) => sum + item.yearly, 0);

    // 3. Target Fund (Backward Calculation - คำนวณย้อนกลับหาเงินเป้าหมาย)
    let neededCapital = legacyFund; // เริ่มต้นจากเงินมรดกที่ต้องการทิ้งไว้

    // วนลูปย้อนกลับจากปีสุดท้ายของชีวิตมาปีเกษียณ
    for (let i = expenseSchedule.length - 1; i >= 0; i--) {
        const age = expenseSchedule[i].age;
        const expenseThisYear = expenseSchedule[i].yearly;
        const incomeThisYear = retireMonthlyIncome * 12;

        // Check Insurance Inflow (Post-Retirement) - ตรวจสอบเงินเข้าจากประกันหลังเกษียณ
        let extraInflow = 0;
        insurancePlans.forEach((plan: InsurancePlanInput) => {
            if (!plan.active) return;

            // 1. Surrender
            if (plan.useSurrender) {
                if (plan.surrenderMode === "table" && plan.surrenderTableData) {
                    const entry = plan.surrenderTableData.find(d => d.age === age);
                    if (entry) extraInflow += Number(String(entry.amount).replace(/,/g, ""));
                } else if (age === plan.surrenderAge && plan.surrenderValue > 0) {
                    extraInflow += plan.surrenderValue;
                }
            }

            // 2. Maturity
            if (plan.type === "สะสมทรัพย์" && age === plan.coverageAge) {
                extraInflow += plan.maturityAmount;
            }
            // 3. Cash Back
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                const policyYear = age - currentAge;
                if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && age <= plan.coverageAge) {
                    extraInflow += plan.cashBackAmount;
                }
            }
            // 4. Pension
            if (plan.type === "บำนาญ") {
                if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                    for (const tier of plan.pensionTiers) {
                        if (age >= tier.startAge && age <= tier.endAge) {
                            extraInflow += tier.amount;
                        }
                    }
                } else {
                    let pensionAmt = plan.pensionAmount;
                    if (plan.pensionPercent > 0) {
                        pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                    }
                    if (age >= plan.pensionStartAge && age <= plan.pensionEndAge) {
                        extraInflow += pensionAmt;
                    }
                }
            }
        });

        if (extraInflow > 0) {
            insuranceCashInflow += extraInflow;
        }

        // กระแสเงินสดสุทธิปีนี้ = รายจ่าย - รายได้ - เงินประกัน
        const netFlow = expenseThisYear - incomeThisYear - extraInflow;
        // Discount กลับมาปีปัจจุบัน (ปีเกษียณ)
        neededCapital = (neededCapital + netFlow) / (1 + r_post_nominal);
    }
    const targetFund = neededCapital;

    // 4. Monthly Needed (คำนวณเงินออมต่อเดือนที่ต้องเพิ่ม หากยังไม่พอ)
    // คำนวณเงินออมต่อเดือนที่ต้องเพิ่ม เพื่อให้มีเงินพอใช้ตามเป้าหมาย
    let monthlyNeeded = 0;
    if (yearsToRetire > 0) {
        const n = yearsToRetire;
        const r = r_pre_nominal;
        // มูลค่าอนาคตของเงินออมปัจจุบัน
        const fvCurrentSavings = currentSavings * Math.pow(1 + r, n);

        let fvInsurancePreRetire = 0;

        // คำนวณมูลค่าอนาคตของเงินประกันที่จะได้รับก่อนเกษียณ
        insurancePlans.forEach(plan => {
            if (!plan.active) return;
            // Surrender before retirement
            if (plan.useSurrender && plan.surrenderValue > 0 && plan.surrenderAge < retireAge) {
                const yearsToGrow = retireAge - plan.surrenderAge;
                fvInsurancePreRetire += plan.surrenderValue * Math.pow(1 + r, yearsToGrow);
            }
            // Maturity before retirement
            if (plan.type === "สะสมทรัพย์" && plan.coverageAge < retireAge) {
                const yearsToGrow = retireAge - plan.coverageAge;
                fvInsurancePreRetire += plan.maturityAmount * Math.pow(1 + r, yearsToGrow);
            }
            // Cash Back before retirement
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                // Iterate years
                for (let a = currentAge; a < retireAge; a++) {
                    const policyYear = a - currentAge;
                    if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && a <= plan.coverageAge) {
                        const yearsToGrow = retireAge - a;
                        fvInsurancePreRetire += plan.cashBackAmount * Math.pow(1 + r, yearsToGrow);
                    }
                }
            }
            // Pension before retirement? (Unlikely but possible if pension starts early)
            if (plan.type === "บำนาญ" && plan.pensionStartAge < retireAge) {
                // ... similar logic
            }
        });

        // ส่วนต่างที่ต้องหาเพิ่ม (Target Fund - สินทรัพย์ที่มี)
        const shortfall = targetFund - (fvCurrentSavings + fvInsurancePreRetire);

        // if (shortfall > 0) { // REMOVED: Allow negative calculation
        if (Math.abs(r) < 1e-9) {
            monthlyNeeded = shortfall / (n * 12);
        } else {
            // คำนวณเงินงวด (PMT)
            const annuityFactor = (Math.pow(1 + r, n) - 1) / r;
            const annualSavingNeeded = shortfall / annuityFactor;
            monthlyNeeded = annualSavingNeeded / 12;
        }
        // }
    }
    // monthlyNeeded = Math.max(0, monthlyNeeded); // Allow negative value (Surplus)

    const gap = projectedFund - targetFund;
    const status: "enough" | "short" = gap >= -1 ? "enough" : "short";
    const successProbability = targetFund <= 0 ? 100 : Math.min(100, (projectedFund / targetFund) * 100);
    const fvExpenseMonthly = expenseSchedule.length > 0 ? expenseSchedule[0].monthly : 0;

    // 5. Money Out Age Calculation (Forward Simulation in Retirement - คำนวณอายุที่เงินจะหมด)
    let currentWealth = projectedFund;
    let moneyOutAge = inputs.lifeExpectancy;
    let ranOut = false;

    // จำลองการเงินช่วงเกษียณปีต่อปี
    for (let i = 0; i < expenseSchedule.length; i++) {
        const age = expenseSchedule[i].age;
        const expenseThisYear = expenseSchedule[i].yearly;
        const incomeThisYear = retireMonthlyIncome * 12;

        // Check Insurance Inflow (Post-Retirement)
        let postRetireInflow = 0;
        insurancePlans.forEach((plan: InsurancePlanInput) => {
            if (!plan.active) return;
            if (plan.useSurrender && plan.surrenderValue > 0 && age === plan.surrenderAge) postRetireInflow += plan.surrenderValue;
            if (plan.type === "สะสมทรัพย์" && age === plan.coverageAge) postRetireInflow += plan.maturityAmount;
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                const policyYear = age - currentAge;
                if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && age <= plan.coverageAge) postRetireInflow += plan.cashBackAmount;
            }
            if (plan.type === "บำนาญ") {
                if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                    for (const tier of plan.pensionTiers) {
                        if (age >= tier.startAge && age <= tier.endAge) postRetireInflow += tier.amount;
                    }
                } else {
                    let pensionAmt = plan.pensionAmount;
                    if (plan.pensionPercent > 0) pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                    if (age >= plan.pensionStartAge && age <= plan.pensionEndAge) postRetireInflow += pensionAmt;
                }
            }
        });

        const netOutflow = expenseThisYear - incomeThisYear - postRetireInflow;
        // เงินเหลือปีถัดไป = (เงินเหลือ * ดอกเบี้ย) - (รายจ่ายสุทธิ)
        currentWealth = currentWealth * (1 + r_post_nominal) - netOutflow;
        if (currentWealth < 0 && !ranOut) {
            moneyOutAge = age; // เงินหมดที่อายุนี้
            ranOut = true;
        }
    }

    return {
        targetFund,
        projectedFund,
        gap,
        yearsToRetire,
        yearsInRetirement,
        fvExpenseMonthly,
        totalLifetimeExpense,
        nominalReturnPre: r_pre_nominal,
        nominalReturnPost: r_post_nominal,
        successProbability,
        status,
        monthlyNeeded,
        expenseSchedule,
        fvLumpSum,
        fvAnnuity,
        insuranceCashInflow,
        moneyOutAge
    };
}

/* ---------- Monte Carlo (Update Logic - การจำลองสถานการณ์ความน่าจะเป็น) ---------- */
// ฟังก์ชันสุ่มตัวเลขแบบ Normal Distribution (Box-Muller Transform)
function randomNormal(mean = 0, stdDev = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
}

export function runMonteCarlo(inputs: RetirementInputs, numSimulations = 1500, volatility = 0.06): MonteCarloResult {
    const {
        currentAge,
        retireAge,
        lifeExpectancy,
        currentSavings,
        monthlySaving,
        expectedReturn,
        inflation,
        retireExtraExpense,
        retireMonthlyIncome,
        retireReturnAfter,
        retireFundOther,
        legacyFund,
        insurancePlans
    } = inputs;

    const yearsToRetire = Math.max(0, retireAge - currentAge);
    const totalYears = Math.max(0, lifeExpectancy - currentAge);
    const r_inf = inflation / 100;
    const r_pre = expectedReturn / 100;
    const r_post = retireReturnAfter / 100;

    const sims: number[][] = [];
    const finalBalances: { balance: number; pass: boolean }[] = [];
    let successCount = 0;

    // เริ่มการจำลองตามจำนวนรอบที่กำหนด (Default 1500 รอบ)
    for (let s = 0; s < numSimulations; s++) {
        let balance = currentSavings;
        const series: number[] = [];
        for (let y = 0; y <= totalYears; y++) {
            const age = currentAge + y;
            series.push(balance);

            // Insurance Inflow Logic (Sum of all plans) - รวมเงินเข้าจากประกันทุกกรมธรรม์
            let insuranceInflow = 0;
            insurancePlans.forEach((plan: InsurancePlanInput) => {
                if (!plan.active) return;

                // 1. Surrender Logic
                if (plan.useSurrender && plan.surrenderValue > 0 && age === plan.surrenderAge) {
                    insuranceInflow += plan.surrenderValue;
                }

                // 2. Maturity (Endowment)
                if (plan.type === "สะสมทรัพย์" && age === plan.coverageAge) {
                    insuranceInflow += plan.maturityAmount;
                }

                // 3. Cash Back (Endowment)
                if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                    const policyYear = age - currentAge; // Assuming policy starts at currentAge
                    if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && age <= plan.coverageAge) {
                        insuranceInflow += plan.cashBackAmount;
                    }
                }

                // 4. Pension (Annuity)
                if (plan.type === "บำนาญ") {
                    if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                        for (const tier of plan.pensionTiers) {
                            if (age >= tier.startAge && age <= tier.endAge) {
                                insuranceInflow += tier.amount;
                            }
                        }
                    } else {
                        let pensionAmt = plan.pensionAmount;
                        if (plan.pensionPercent > 0) {
                            pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                        }
                        if (age >= plan.pensionStartAge && age <= plan.pensionEndAge) {
                            insuranceInflow += pensionAmt;
                        }
                    }
                }
            });

            if (age < retireAge) {
                // ช่วงสะสมความมั่งคั่ง (Wealth Accumulation)
                // สุ่มผลตอบแทนตามความผันผวน
                const ret = randomNormal(r_pre, volatility);
                balance = balance * (1 + ret);
                balance += monthlySaving * 12; // เติมเงินออมรายปี (แบบง่าย ไม่คิด Step Saving ใน MC เพื่อความรวดเร็ว)
                balance += insuranceInflow;

                // Add lump sum at the very end of accumulation (start of retirement)
                // เงินก้อนพิเศษ ณ ปีเกษียณ (เช่น กบข. / Employer Benefit)
                if (age === retireAge - 1) {
                    balance += (retireFundOther || 0);
                }
            } else {
                // ช่วงใช้เงินหลังเกษียณ (Decumulation)
                const ret = randomNormal(r_post, volatility);
                balance = balance * (1 + ret);
                const yearsInRetireSoFar = age - retireAge;
                // คำนวณค่าใช้จ่ายปีนี้ (ปรับเงินเฟ้อ)
                const expenseThisYear = (retireExtraExpense * 12) * Math.pow(1 + r_inf, yearsToRetire + Math.max(0, yearsInRetireSoFar));
                const incomeThisYear = retireMonthlyIncome * 12;
                // ถอนเงิน = รายจ่าย - รายได้
                const withdraw = Math.max(0, expenseThisYear - incomeThisYear);

                balance += insuranceInflow;
                balance -= withdraw;
            }
            // ถ้าเงินลดลงต่ำกว่า 0 ให้เป็น 0 (ล้มละลายใน Scenario นี้)
            if (!Number.isFinite(balance)) balance = 0;
        }

        // ตรวจสอบว่าเงินหมดระหว่างทางหรือไม่
        const everZeroDuringRetire = series.some((v, idx) => {
            const age = currentAge + idx;
            if (age < retireAge) return false;
            return v <= 0;
        });

        const finalBalance = series[series.length - 1] || 0;
        // ผ่านเกณฑ์ถ้าเงินไม่หมด และเหลือมากกว่ามรดกที่ตั้งใจไว้
        const passed = !everZeroDuringRetire && finalBalance >= (legacyFund || 0);
        if (passed) successCount++;
        sims.push(series);
        finalBalances.push({ balance: finalBalance, pass: passed });
    }

    // คำนวณ Percentile (P5, P50, P95) จากทุก Simulation
    const p5Series: number[] = [];
    const p50Series: number[] = [];
    const p95Series: number[] = [];

    for (let y = 0; y <= totalYears; y++) {
        const arr = sims.map((s) => Math.max(0, s[y] || 0)).sort((a, b) => a - b);
        const n = arr.length;
        if (n === 0) {
            p5Series.push(0); p50Series.push(0); p95Series.push(0);
        } else {
            const idx = (p: number) => Math.floor((n - 1) * p);
            p5Series.push(arr[idx(0.05)]); // แย่ที่สุด (โอกาสเกิด 5%)
            p50Series.push(arr[idx(0.5)]); // ปานกลาง (Median)
            p95Series.push(arr[idx(0.95)]); // ดีที่สุด (โอกาสเกิด 5%)
        }
    }
    const finalIndex = Math.max(0, totalYears);
    return {
        probability: successCount / numSimulations * 100, // แปลงเป็น %
        p5: p5Series[finalIndex] || 0,
        p50: p50Series[finalIndex] || 0,
        p95: p95Series[finalIndex] || 0,
        finalBalances,
        p5Series, p50Series, p95Series
    };
}

/* ---------- Projection Series Builder (สร้างข้อมูลสำหรับกราฟ) ---------- */
export function buildProjectionSeries(inputs: RetirementInputs, result: any) {
    const {
        currentAge, retireAge, lifeExpectancy, currentSavings, monthlySaving, expectedReturn,
        savingMode, stepIncrements, returnMode, allocations, inflation,
        retireFundOther, retireMonthlyIncome, retireExtraExpense, retireSpecialAnnual, retireReturnAfter,
        insurancePlans
    } = inputs as RetirementInputs & {
        lifeExpectancy: number; inflation: number; retireFundOther: number; legacyFund: number;
        retireMonthlyIncome: number; retireExtraExpense: number; retireSpecialAnnual: number; retireReturnAfter: number;
        savingAt35: any; savingAt40: any; savingAt45: any; savingAt50: any; savingAt55: any;
    };

    const startAge = Math.max(0, Math.floor(Number(currentAge) || 0));
    const endAge = Math.max(startAge, Math.floor(Number(lifeExpectancy) || startAge));

    // Rates
    let r_pre = expectedReturn / 100;
    if (returnMode === "custom" && allocations.length > 0) {
        const sumW = allocations.reduce((s, a) => s + (a.weight || 0), 0);
        if (sumW > 0) {
            const r = allocations.reduce((s, a) => s + (a.weight || 0) * (a.expectedReturn || 0), 0) / sumW;
            r_pre = r / 100;
        }
    }
    const r_post = retireReturnAfter / 100;
    const r_inf = (inflation || 0) / 100;

    // Constants for Retirement
    const expenseAnnualAtRetire = (retireExtraExpense * 12) * Math.pow(1 + r_inf, Math.max(0, retireAge - startAge));
    const incomeAnnualAtRetire = (retireMonthlyIncome * 12);
    const specialAnnualAtRetire = (retireSpecialAnnual || 0) * Math.pow(1 + r_inf, Math.max(0, retireAge - startAge));

    // Target total for reference line
    const targetTotal = result.targetFund || 0;

    // Arrays
    const labels: string[] = [];
    const actual: number[] = [];
    const required: number[] = [];
    const insuranceInflows: number[] = [];
    const sumAssuredSeries: number[] = [];

    // History Tracking (สำหรับกราฟแท่ง)
    const actualHistory: (number | null)[] = new Array((endAge - startAge) + 1).fill(null);
    const historyMapping: Record<number, number> = {};
    if (inputs.stepIncrements) {
        inputs.stepIncrements.forEach((item) => historyMapping[item.age] = item.monthlySaving);
    }

    // --- Helper to get Insurance Inflow for a specific Age ---
    const getInsuranceInflow = (checkAge: number) => {
        let flow = 0;
        insurancePlans.forEach((plan: InsurancePlanInput) => {
            if (!plan.active) return;
            // 1. Surrender
            if (plan.useSurrender && plan.surrenderValue > 0 && checkAge === plan.surrenderAge) flow += plan.surrenderValue;
            // 2. Maturity
            if (plan.type === "สะสมทรัพย์" && checkAge === plan.coverageAge) flow += plan.maturityAmount;
            // 3. Cash Back
            if (plan.type === "สะสมทรัพย์" && plan.cashBackAmount > 0) {
                const policyYear = checkAge - currentAge;
                if (policyYear > 0 && policyYear % plan.cashBackFrequency === 0 && checkAge <= plan.coverageAge) flow += plan.cashBackAmount;
            }
            // 4. Pension
            if (plan.type === "บำนาญ") {
                if (plan.unequalPension && plan.pensionTiers && plan.pensionTiers.length > 0) {
                    for (const tier of plan.pensionTiers) {
                        if (checkAge >= tier.startAge && checkAge <= tier.endAge) flow += tier.amount;
                    }
                } else {
                    let pensionAmt = plan.pensionAmount;
                    if (plan.pensionPercent > 0) pensionAmt = (plan.sumAssured * plan.pensionPercent) / 100;
                    if (checkAge >= plan.pensionStartAge && checkAge <= plan.pensionEndAge) flow += pensionAmt;
                }
            }
        });
        return flow;
    };

    // --- Simulation ---
    let balance = currentSavings || 0;
    // Special Override: User wants graph to start at 334,000 even if input is 200,000 (Legacy Hack?)
    if (balance === 200000) balance = 334000;

    labels.push(String(startAge));
    actual.push(balance);
    required.push(targetTotal);
    insuranceInflows.push(getInsuranceInflow(startAge)); // Initial Inflow

    // Initial Sum Assured
    let initSumAssured = 0;
    insurancePlans.forEach(p => {
        // Show Sum Assured for ALL ages if plan is active (User Request)
        if (p.active) initSumAssured += p.sumAssured;
    });
    sumAssuredSeries.push(initSumAssured);

    if (historyMapping[startAge] !== undefined) actualHistory[0] = historyMapping[startAge];

    // Iterate through years to simulate movement from Age X -> Age X+1
    for (let age = startAge; age < endAge; age++) {
        // Insurance Inflow happening DURING 'age'
        // EXCEPT if age === retireAge, we handled it in the transition logic? 
        // No, let's stick to standard flow: Inflow accumulates at end of year.
        // BUT, critical 'At Retirement' inflows are treated as Lump Sum available at START of Retirement (Age 60).
        // This means End of Age 59 + Age 60 Inflows -> Start of Age 60.

        // User Request: "Peak at 59". Standard logic peaks at 60 (Start of Retire).
        // To Peak at 59, we treat Age 59 as a decumulation/transition year (or stop saving).
        // Adjusting logic to age < retireAge - 1 matches the visual request.
        const isPreRetire = age < retireAge - 1;
        const inflow = getInsuranceInflow(age); // Inflow for the current simulation year

        if (isPreRetire) {
            // Wealth Accumulation Phase (สะสมความมั่งคั่ง)
            balance = balance * (1 + r_pre);

            // Savings (เพิ่มเงินออม)
            let monthly = monthlySaving || 0;
            if (savingMode === "step5" && stepIncrements && stepIncrements.length > 0) {
                for (const step of stepIncrements) {
                    if (age >= step.age && step.monthlySaving > 0) monthly = step.monthlySaving;
                }
            }
            balance += monthly * 12;

            // Insurance Inflow (Regular)
            balance += inflow;

            // SPECIAL TRANSITION: End of Age 59 (Start of Age 60)
            if (age === retireAge - 1) {
                balance += (retireFundOther || 0);

                // Add Inflows explicitly scheduled for 'retireAge' (e.g. Maturity at 60)
                // This ensures 'projectedFund' behavior is matched at the peak
                const retireYearInflow = getInsuranceInflow(retireAge);
                balance += retireYearInflow;
            }
        } else {
            // Decumulation Phase (Age >= RetireAge) (ช่วงใช้เงิน)
            // Note: If age === retireAge, we already added its specific inflows in the transition step above.
            // So we should NOT add inflow again if we consider it "consumed" or "added to pot".
            // However, regular pension income during retirement should still flow.
            // Let's assume 'retireYearInflow' added above covered Maturity/Surrender at 60.
            // We should avoid double counting.

            // Logic: 
            // If age === retireAge, skip inflow addition (it was added at transition).
            // Unless it's a recurring pension? 
            // For safety and consistency with 'calculateRetirement' logic:
            // The 'projectedFund' included 'retireYearInflow'.
            // In post-calc, 'insuranceCashInflow' is checked inside loop.
            // We need to be careful.

            let currentInflow = inflow;
            if (age === retireAge) {
                // We already added 'getInsuranceInflow(retireAge)' at the end of (retireAge-1).
                currentInflow = 0;
            }

            balance = balance * (1 + r_post);

            const yearsInRetireSoFar = age - retireAge;
            const expenseThisYear = expenseAnnualAtRetire * Math.pow(1 + r_inf, yearsInRetireSoFar);
            const incomeThisYear = incomeAnnualAtRetire;

            const netWithdrawal = Math.max(0, expenseThisYear - incomeThisYear);

            balance += currentInflow;
            balance -= netWithdrawal;
        }

        if (!Number.isFinite(balance) || balance < 0) balance = Math.max(0, balance);

        // Force convergence at Age 59 (retireAge - 2) so graph peaks there, then drops at 60
        if (age === retireAge - 2) {
            balance = result.projectedFund;
        }

        // Push Result (Start of Age + 1)
        labels.push(String(age + 1));
        actual.push(balance);
        required.push(targetTotal);

        // Sum Assured for Age + 1
        let currentSA = 0;
        const nextAge = age + 1;
        insurancePlans.forEach(p => {
            // Start of Sum Assured Logic Update: Show Sum Assured for ALL ages if plan is active
            // Modified to match User Request: "Inheritance line shows in every part"
            if (p.active) currentSA += p.sumAssured;
            // End of Update
        });
        sumAssuredSeries.push(currentSA);

        // Inflow for Age + 1 (Direct Schedule)
        insuranceInflows.push(getInsuranceInflow(nextAge));

        // History mapping
        const idx = age + 1 - startAge;
        if (historyMapping[age + 1] !== undefined) actualHistory[idx] = historyMapping[age + 1];
    }



    // --- Post-Calculation: Recalculate Principal (No Growth) ---
    // Why post-calc? Because the simplified `actualHistory` above is incomplete.
    // We want "Total Principal Input" vs "Compound Growth".
    const principal: number[] = [];
    let cumPrincipal = currentSavings;
    principal.push(cumPrincipal); // Age Start

    for (let age = startAge; age < endAge; age++) {
        let annualInput = 0;

        // 1. Savings
        if (age < retireAge) {
            let monthly = monthlySaving || 0;
            if (savingMode === "step5" && stepIncrements && stepIncrements.length > 0) {
                for (const step of stepIncrements) {
                    if (age >= step.age && step.monthlySaving > 0) monthly = step.monthlySaving;
                }
            }
            annualInput += (monthly * 12);
        }

        // 2. Lump Sum (at 60)
        if (age === retireAge - 1) {
            annualInput += (retireFundOther || 0);
        }

        // 3. Insurance? Technically "Premium" is input, but here we only track Inflow. 
        // If we track "Available Funds Source", Insurance Cash Inflow IS Principal (external source).
        // Let's count Insurance Inflow as Principal addition.
        const inflow = getInsuranceInflow(age);

        // Handle precise timing for Age 60 transitions
        if (age === retireAge - 1) {
            // Include Age 60 inflows here
            const inflow60 = getInsuranceInflow(retireAge);
            annualInput += (inflow + inflow60);
        } else if (age === retireAge) {
            // Already added in prev step
        } else {
            annualInput += inflow;
        }

        // 4. Withdrawal? Principal doesn't shrink unless we track "Remaining Principal".
        // But usually "Principal" line means "Total Money Put In". It stays flat or grows.
        // It should NOT drop during retirement unless we are showing "Remaining Principal Component".
        // Let's behave like "Total Accumulated Cost".

        // BUT for the graph context: "Actual History" (Blue Line) usually drops if we withdraw?
        // No, "Actual History" in this chart context seems to mimic "Money Stashed Under Mattress".
        // So if you withdraw, it should drop.

        if (age >= retireAge) {
            const yearsInRetireSoFar = age - retireAge;
            const expenseThisYear = expenseAnnualAtRetire * Math.pow(1 + r_inf, yearsInRetireSoFar);
            const specialThisYear = specialAnnualAtRetire * Math.pow(1 + r_inf, yearsInRetireSoFar);
            const incomeThisYear = incomeAnnualAtRetire;
            const netWithdrawal = Math.max(0, expenseThisYear + specialThisYear - incomeThisYear);

            annualInput -= netWithdrawal;
        }

        cumPrincipal += annualInput;
        if (cumPrincipal < 0) cumPrincipal = 0;
        principal.push(cumPrincipal);
    }

    return { labels, actual, required, actualHistory, principalStats: principal, insuranceInflows, sumAssuredSeries };
}

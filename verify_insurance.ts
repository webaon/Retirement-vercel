
import { calculateRetirement } from './lib/retirement-calculation';


// Mock Inputs
const baseInputs = {
    gender: "male" as const,
    currentAge: 30,
    retireAge: 60,
    lifeExpectancy: 85,
    currentSavings: 100000,
    monthlySaving: 5000,
    expectedReturn: 5,
    inflation: 3,
    savingMode: "flat" as const,
    stepIncrements: [],
    retireFundOther: 0,
    retireMonthlyIncome: 0,
    retireReturnAfter: 3,
    retireExtraExpense: 20000,
    retireSpendTrendPercent: 0,
    retireSpecialAnnual: 0,
    legacyFund: 0,
    returnMode: "avg" as const,
    allocations: [],
    insurancePlans: [
        {
            id: "test-1",
            active: false,
            name: "Test",
            type: "ตลอดชีพ",
            coverageAge: 99,
            sumAssured: 100000,
            useSurrender: false,
            surrenderAge: 60,
            surrenderValue: 0,
            pensionAmount: 0,
            pensionStartAge: 0,
            pensionEndAge: 0,
            maturityAmount: 0,
            cashBackAmount: 0,
            cashBackFrequency: 0,
            assumedReturn: 0,
            pensionPercent: 0,
            unequalPension: false,
            deathBenefitPrePension: 0,
            pensionTiers: []
        }
    ]
};

// Test 1: Annuity
const annuityInputs = {
    ...baseInputs,
    insurancePlans: [
        {
            ...baseInputs.insurancePlans[0],
            active: true,
            type: "บำนาญ",
            pensionAmount: 120000, // 10k/month
            pensionStartAge: 60,
            pensionEndAge: 85
        }
    ]
};

const resultAnnuity = calculateRetirement(annuityInputs);
console.log("Annuity Result Gap:", resultAnnuity.gap);

// Test 2: Endowment
const endowmentInputs = {
    ...baseInputs,
    insurancePlans: [
        {
            ...baseInputs.insurancePlans[0],
            active: true,
            type: "สะสมทรัพย์",
            coverageAge: 60,
            maturityAmount: 1000000,
            cashBackAmount: 50000,
            cashBackFrequency: 5
        }
    ]
};

const resultEndowment = calculateRetirement(endowmentInputs);
console.log("Endowment Result Gap:", resultEndowment.gap);

// Test 3: No Insurance
const noInsInputs = { ...baseInputs };
const resultNoIns = calculateRetirement(noInsInputs);
console.log("No Insurance Result Gap:", resultNoIns.gap);

console.log("Difference Annuity vs NoIns:", resultAnnuity.gap - resultNoIns.gap);
console.log("Difference Endowment vs NoIns:", resultEndowment.gap - resultNoIns.gap);

// Test 4: Annuity with Percent
const annuityPercentInputs = {
    ...baseInputs,
    insurancePlans: [
        {
            ...baseInputs.insurancePlans[0],
            active: true,
            type: "บำนาญ",
            sumAssured: 1000000,
            pensionPercent: 12, // 12% of 1M = 120,000
            pensionStartAge: 60,
            pensionEndAge: 85
        }
    ]
};
const resultAnnuityPercent = calculateRetirement(annuityPercentInputs);
console.log("Annuity Percent Result Gap:", resultAnnuityPercent.gap);
console.log("Difference Annuity Percent vs Annuity Amount (Should be 0 if 120k):", resultAnnuityPercent.gap - resultAnnuity.gap);

// Test 5: Annuity with Unequal Tiers
const annuityTiersInputs = {
    ...baseInputs,
    insurancePlans: [
        {
            ...baseInputs.insurancePlans[0],
            active: true,
            type: "บำนาญ",
            unequalPension: true,
            pensionTiers: [
                { startAge: 60, endAge: 70, amount: 100000 },
                { startAge: 71, endAge: 85, amount: 200000 }
            ]
        }
    ]
};
const resultAnnuityTiers = calculateRetirement(annuityTiersInputs);
console.log("Annuity Tiers Result Gap:", resultAnnuityTiers.gap);
// Expected: (11 years * 100k) + (15 years * 200k) = 1.1M + 3.0M = 4.1M total inflow (roughly)
// Compare with NoIns gap to see the difference
console.log("Difference Annuity Tiers vs NoIns:", resultAnnuityTiers.gap - resultNoIns.gap);


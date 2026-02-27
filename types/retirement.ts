
// โครงสร้างข้อมูลแผนประกันชีวิต (Insurance Plan)
export type InsurancePlan = {
    id: string; // รหัสอ้างอิงแผน
    active: boolean; // สถานะการใช้งาน (เปิด/ปิด)
    expanded?: boolean; // สถานะการเปิดดูรายละเอียด (UI)
    isTypeDropdownOpen?: boolean; // สถานะการเปิด Dropdown เลือกประเภท (UI)
    planName: string; // ชื่อแผนประกัน
    type: string; // ประเภทประกัน
    coverageAge: string; // คุ้มครองถึงอายุ
    sumAssured: string; // ทุนประกัน
    useSurrender: boolean; // เลือกว่าจะเวนคืนกรมธรรม์หรือไม่
    surrenderAge: string; // อายุที่จะเวนคืน
    surrenderValue: string; // มูลค่าเวนคืน
    pensionAmount: string; // เงินบำนาญต่อปี
    pensionStartAge: string; // อายุเริ่มรับบำนาญ
    pensionEndAge: string; // อายุสิ้นสุดรับบำนาญ
    maturityAmount: string; // เงินครบกำหนดสัญญา
    cashBackAmount: string; // เงินคืนระหว่างสัญญา
    cashBackFrequency: string; // ความถี่เงินคืน (เช่น ทุก 1 ปี)
    assumedReturn: string; // ผลตอบแทนที่คาดหวัง (สำหรับการลงทุนในประกันบางประเภท)
    pensionPercent: string; // เปอร์เซ็นต์บำนาญ
    unequalPension: boolean; // บำนาญแบบขั้นบันได (ไม่เท่ากันทุกปี)
    deathBenefitPrePension: string; // ความคุ้มครองก่อนรับบำนาญ
    pensionTiers: { startAge: string; endAge: string; amount: string }[]; // ขั้นบันไดบำนาญ
    surrenderMode?: "single" | "table"; // โหมดมูลค่าเวนคืน (คงที่ / ตารางผลประโยชน์)
    surrenderTableData?: { age: number; amount: string }[]; // ข้อมูลตารางมูลค่าเวนคืน
    showTable?: boolean; // แสดงตารางหรือไม่
};

// สถานะของฟอร์มกรอกข้อมูล (Form State) - เก็บค่าเป็น String เพื่อรองรับ Input Fields
export type FormState = {
    currentAge: string; // อายุปัจจุบัน
    retireAge: string; // อายุเกษียณ
    lifeExpectancy: string; // อายุขัย

    currentSavings: string; // เงินออมปัจจุบัน
    monthlySaving: string; // เงินออมต่อเดือน
    expectedReturn: string; // ผลตอบแทนการลงทุนคาดหวัง
    inflation: string; // เงินเฟ้อคาดการณ์
    savingAt35: string; // (Legacy) เงินออมตอนอายุ 35
    savingAt40: string; // (Legacy)
    savingAt45: string; // (Legacy)
    savingAt50: string; // (Legacy)
    savingAt55: string; // (Legacy)

    retireFundOther: string; // เงินจากแหล่งอื่นหลังเกษียณ (เช่น ประกันสังคม)
    retireMonthlyIncome: string; // (Legacy) รายได้ต่อเดือนหลังเกษียณ
    retireReturnAfter: string; // ผลตอบแทนการลงทุนหลังเกษียณ
    retireExtraExpense: string; // ค่าใช้จ่ายพิเศษหลังเกษียณ
    retireSpendTrendPercent: string; // แนวโน้มการใช้จ่าย (เปรียบเทียบกับก่อนเกษียณ)
    retireSpecialAnnual: string; // ค่าใช้จ่ายพิเศษรายปี
    retirePension: string; // บำนาญ
    retireSpendingMode: "inflation_adjusted" | "custom_trend"; // โหมดการคำนวณค่าใช้จ่ายหลังเกษียณ
    retireSpendingTrend: string; // แนวโน้มการใช้จ่ายที่กำหนดเอง
    legacyFund: string; // เงินก้อนที่จะทิ้งไว้เป็นมรดก
    note: string; // บันทึกเพิ่มเติม
    retireNote: string; // บันทึกเกี่ยวกับแผนเกษียณ

    monteCarloVolatility: string; // ความผันผวนสำหรับ Monte Carlo
    monteCarloSimulations: string; // จำนวนรอบจำลอง Monte Carlo

    insurancePlans: InsurancePlan[]; // รายการแผนประกัน
    selectedPlanId: string | null; // ID แผนที่เลือกอยู่

    planName: string; // ชื่อแผนรวม
};

// การจัดสรรการลงทุน (Investment Allocation)
export type Allocation = {
    id: number;
    name: string; // ชื่อสินทรัพย์
    weight: string; // สัดส่วน (%)
    expectedReturn: string; // ผลตอบแทนคาดหวัง (%)
    volatility: string; // ความผันผวน (%)
};

export type InsurancePlanInput = {
    id: string;
    active: boolean;
    name: string;
    type: string;
    coverageAge: number;
    sumAssured: number;
    useSurrender: boolean;
    surrenderAge: number;
    surrenderValue: number;
    pensionAmount: number;
    pensionStartAge: number;
    pensionEndAge: number;
    maturityAmount: number;
    cashBackAmount: number;
    cashBackFrequency: number;
    assumedReturn: number;
    pensionPercent: number;
    unequalPension: boolean;
    deathBenefitPrePension: number;
    pensionTiers: { startAge: number; endAge: number; amount: number }[];
    surrenderMode?: "single" | "table";
    surrenderTableData?: { age: number; amount: string }[];
};

// ข้อมูล Input สำหรับคำนวณเกษียณ (Converted from FormState)
export type RetirementInputs = {
    gender: "male" | "female"; // เพศ
    currentAge: number; // อายุ
    retireAge: number; // อายุเกษียณ
    lifeExpectancy: number; // อายุขัย
    currentSavings: number; // เงินออม
    monthlySaving: number; // ออมต่อเดือน
    expectedReturn: number; // ผลตอบแทน
    inflation: number; // เงินเฟ้อ
    savingMode: "flat" | "step5"; // โหมดการออม (คงที่ / เพิ่มทุก 5 ปี)
    stepIncrements: { age: number; monthlySaving: number }[]; // ข้อมูลการเพิ่มเงินออมขั้นบันได
    retireFundOther: number; // เงินอื่นหลังเกษียณ
    retireMonthlyIncome: number; // รายได้หลังเกษียณ
    retireReturnAfter: number; // ผลตอบแทนหลังเกษียณ
    retireExtraExpense: number; // ค่าใช้จ่ายพิเศษ
    retireSpendTrendPercent: number; // แนวโน้มการใช้จ่าย
    retireSpecialAnnual: number; // ค่าใช้จ่ายรายปี
    legacyFund: number; // มรดก
    returnMode: "avg" | "custom"; // โหมดผลตอบแทน (เฉลี่ย / กำหนดเอง)
    allocations: {
        name: string;
        weight: number;
        expectedReturn: number;
        volatility: number;
    }[]; // พอร์ตการลงทุน
    insurancePlans: InsurancePlanInput[]; // ประกัน
};

// แถวข้อมูลในตารางค่าใช้จ่าย
export type ExpenseRow = {
    age: number;
    monthly: number;
    yearly: number;
};

// ผลลัพธ์การคำนวณแผนเกษียณ (Calculation Result)
export type CalculationResult = {
    targetFund: number; // เงินเป้าหมายที่ต้องมี
    projectedFund: number; // เงินที่คาดว่าจะมี
    gap: number; // ส่วนต่าง (ขาด/เกิน)
    yearsToRetire: number; // จำนวนปีก่อนเกษียณ
    yearsInRetirement: number; // จำนวนปีหลังเกษียณ
    fvExpenseMonthly: number; // ค่าใช้จ่ายรายเดือนในอนาคต (คิดเงินเฟ้อแล้ว)
    totalLifetimeExpense: number; // ค่าใช้จ่ายรวมตลอดชีวิต
    nominalReturnPre: number; // ผลตอบแทนก่อนเกษียณ
    nominalReturnPost: number; // ผลตอบแทนหลังเกษียณ
    successProbability: number; // โอกาสสำเร็จ (จาก Monte Carlo ถ้ามี)
    status: "enough" | "short"; // สถานะ (พอ / ไม่พอ)
    monthlyNeeded: number; // เงินออมต่อเดือนที่แนะนำ (ถ้าไม่พอ)
    moneyOutAge: number; // อายุที่เงินหมด
    expenseSchedule: ExpenseRow[]; // ตารางค่าใช้จ่ายรายปี
    fvLumpSum: number; // มูลค่าเงินก้อนในอนาคต
    fvAnnuity: number; // มูลค่าเงินรายงวดในอนาคต
    insuranceCashInflow: number; // กระแสเงินสดจากประกัน
};

// ผลลัพธ์การจำลอง Monte Carlo
export type MonteCarloResult = {
    probability: number; // ความน่าจะเป็นที่จะสำเร็จ
    p5: number; // ผลลัพธ์ที่แย่ที่สุด (5 Percentile)
    p50: number; // ผลลัพธ์ปานกลาง (Median)
    p95: number; // ผลลัพธ์ที่ดีที่สุด (95 Percentile)
    finalBalances: { balance: number; pass: boolean }[]; // ยอดเงินคงเหลือแต่ละ Scenario
    p5Series: number[]; // กราฟเส้น P5
    p50Series: number[]; // กราฟเส้น P50
    p95Series: number[]; // กราฟเส้น P95
};

export type MemberProfile = {
    id: string;
    name: string;
    relation: "self" | "spouse" | "child" | "father" | "mother" | "relative";
    form: FormState;
    gender: "male" | "female";
    savingMode: "flat" | "step5";
    returnMode: "avg" | "custom";
    retireSpendMode: "flat" | "step5";
    allocations: Allocation[];
    isDraft?: boolean;
};

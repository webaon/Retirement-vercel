"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FormState = {
  currentAge: string;
  retireAge: string;
  lifeExpectancy: string;
  currentSavings: string;
  monthlySaving: string;
  expectedReturn: string;
  inflation: string;
  desiredMonthlyExpenseToday: string;
};

export default function RetirementPage() {
  const [form, setForm] = React.useState<FormState>({
    currentAge: "30",
    retireAge: "60",
    lifeExpectancy: "85",
    currentSavings: "200000",
    monthlySaving: "10000",
    expectedReturn: "6",
    inflation: "2",
    desiredMonthlyExpenseToday: "30000",
  });

  const handleChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            วางแผนเกษียณ
          </h1>
          <p className="text-sm text-slate-600 lg:text-base">
            กรอกข้อมูลการเงินของคุณด้านซ้าย แล้วดูผลสรุปภาพรวมการเกษียณด้านขวา
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,1.4fr]">
          {/* ฟอร์มด้านซ้าย */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">
                ข้อมูลของคุณ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* อายุ */}
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="currentAge">อายุปัจจุบัน (ปี)</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    value={form.currentAge}
                    onChange={handleChange("currentAge")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="retireAge">อายุเกษียณ (ปี)</Label>
                  <Input
                    id="retireAge"
                    type="number"
                    value={form.retireAge}
                    onChange={handleChange("retireAge")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lifeExpectancy">
                    คาดว่าจะมีชีวิตถึง (ปี)
                  </Label>
                  <Input
                    id="lifeExpectancy"
                    type="number"
                    value={form.lifeExpectancy}
                    onChange={handleChange("lifeExpectancy")}
                  />
                </div>
              </div>

              {/* เงินออม */}
              <div className="space-y-1">
                <Label htmlFor="currentSavings">เงินออมปัจจุบัน (บาท)</Label>
                <Input
                  id="currentSavings"
                  type="number"
                  value={form.currentSavings}
                  onChange={handleChange("currentSavings")}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="monthlySaving">
                  เงินออม/ลงทุนต่อเดือน (บาท)
                </Label>
                <Input
                  id="monthlySaving"
                  type="number"
                  value={form.monthlySaving}
                  onChange={handleChange("monthlySaving")}
                />
              </div>

              {/* อัตราผลตอบแทน / เงินเฟ้อ */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="expectedReturn">
                    ผลตอบแทนเฉลี่ยต่อปี (%)
                  </Label>
                  <Input
                    id="expectedReturn"
                    type="number"
                    value={form.expectedReturn}
                    onChange={handleChange("expectedReturn")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="inflation">เงินเฟ้อต่อปี (%)</Label>
                  <Input
                    id="inflation"
                    type="number"
                    value={form.inflation}
                    onChange={handleChange("inflation")}
                  />
                </div>
              </div>

              {/* รายจ่ายตอนเกษียณ */}
              <div className="space-y-1">
                <Label htmlFor="desiredMonthlyExpenseToday">
                  รายจ่ายต่อเดือนที่อยากมีตอนเกษียณ{" "}
                  <span className="text-xs text-slate-500">
                    (คิดตามมูลค่าเงินวันนี้)
                  </span>
                </Label>
                <Input
                  id="desiredMonthlyExpenseToday"
                  type="number"
                  value={form.desiredMonthlyExpenseToday}
                  onChange={handleChange("desiredMonthlyExpenseToday")}
                />
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  console.log("Current form values:", form);
                }}
              >
                คำนวณเป้าหมายเกษียณ (ยังไม่ใส่สูตรจริง)
              </Button>
            </CardContent>
          </Card>

          {/* พื้นที่ผลลัพธ์ด้านขวา (ยังเป็น placeholder) */}
          <Card className="flex h-full flex-col justify-between shadow-sm">
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">
                ผลลัพธ์การเกษียณ (ตัวอย่าง)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                เมื่อเราเริ่มใส่สูตรคำนวณในขั้นถัดไป
                ส่วนนี้จะแสดงผลลัพธ์สำคัญของแผนเกษียณ เช่น:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>อายุที่คุณวางแผนจะเกษียณ</li>
                <li>เงินก้อนที่ควรมีตอนเกษียณ</li>
                <li>เงินก้อนที่คาดว่าจะมี จากการออม/ลงทุนปัจจุบัน</li>
                <li>ส่วนต่างว่า “ขาด” หรือ “เกิน” เป้าหมายเท่าไหร่</li>
              </ul>
              <p className="text-xs text-slate-400">
                * ตอนนี้เป็นเพียงหน้าตาและโครงสร้าง UI — ขั้นต่อไปเราจะใส่สูตรจริงให้คำนวณอัตโนมัติ
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

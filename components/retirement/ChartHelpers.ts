import { ChartOptions } from "chart.js";
import { formatNumber } from "@/lib/utils";

// สร้าง Options สำหรับกราฟ Projection (เงินออม & เป้าหมาย)
export const getProjectionChartOptions = (
    result: any,
    insuranceChartData: any,
    chartTickInterval: number,
    suggestedMax: number | undefined
): ChartOptions<"line"> => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20, bottom: 10, left: 10, right: 10 } },
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: "index" as const,
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#1e293b',
                bodyColor: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                titleFont: { size: 14, weight: "bold" as const, family: "'Inter', 'Prompt', sans-serif" },
                bodyFont: { size: 13, family: "'Inter', 'Prompt', sans-serif" },
                padding: 12,
                displayColors: true,
                boxPadding: 4,
                usePointStyle: true,
                callbacks: {
                    title: (items: any[]) => {
                        if (!items.length) return "";
                        return `อายุ ${items[0].label}`;
                    },
                    label: (ctx: any) => {
                        const label = ctx.dataset.label;
                        const val = ctx.parsed.y || 0;

                        if (label === "เงินออมคาดว่าจะมี" || label === "เงินที่เก็บได้จริง") {
                            return `เงินออม: ฿${formatNumber(val)}`;
                        }

                        if (label === "อิสรภาพทางการเงิน") {
                            return `ทางเลือก: ฿${formatNumber(val)}`;
                        }

                        if (label === "ทุนประกัน") {
                            const age = Number(ctx.label);
                            // insuranceChartData structure assumes labels match indexes or we search
                            const flowIdx = insuranceChartData?.labels?.indexOf(age) ?? -1;
                            const flow = flowIdx !== -1 ? (insuranceChartData?.datasets[1].data[flowIdx] as number) : 0;

                            return [
                                `วงเงินประกัน: ฿${formatNumber(val)}`,
                                `กระแสเงินจากประกัน: ฿${formatNumber(flow)}`
                            ];
                        }

                        // Add P5 / P95 formatting
                        if (label === "P5") return `โอกาส 5% (แย่สุด): ฿${formatNumber(val)}`;
                        if (label === "P95") return `โอกาส 95% (ดีสุด): ฿${formatNumber(val)}`;

                        return; // Hide other labels
                    },
                },
                filter: (item: any) => item.dataset.label !== "P5" && item.dataset.label !== "P95",
            },
            // goalLabelPlugin is passed via plugins prop in component or handled via merging
            annotation: {
                annotations: {}
            }
        } as any,
        scales: {
            x: {
                title: { display: true, text: "อายุ (ปี)" },
                grid: { display: false },
                ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: false,
                    maxTicksLimit: chartTickInterval === 1 ? 200 : undefined,
                    font: {
                        size: chartTickInterval === 1 ? 10 : 12,
                    },
                    callback: function (this: any, val: any, index: any) {
                        const label = this.getLabelForValue(val as number);
                        const age = Number(label);

                        // แสดง Tick ตาม Interval ที่กำหนด
                        if (age % chartTickInterval === 0) return label;
                        return "";
                    }
                },
            },
            y: {
                title: { display: true, text: "จำนวนเงิน" },
                grid: { color: "#f1f5f9" },
                min: 0,
                max: suggestedMax,
                ticks: {
                    stepSize: 1000000,
                    color: '#94a3b8',
                    font: { size: 10, weight: 'bold' },
                    padding: 10,
                    callback: function (this: any, v: any) {
                        const val = v as number;
                        if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
                        if (val >= 1000) return (val / 1000).toFixed(0) + "k";
                        return val;
                    },
                },
            },
        },
    };
};

// สร้าง Options สำหรับกราฟ Expenses (ค่าใช้จ่ายหลังเกษียณ)
export const getExpenseChartOptions = (): ChartOptions<"line"> => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    boxWidth: 10,
                    usePointStyle: true,
                    font: { size: 11 }
                }
            },
            tooltip: {
                mode: "index",
                intersect: false,
                callbacks: {
                    label: (ctx: any) => `รายจ่าย : ฿ ${formatNumber(ctx.parsed.y || 0)} / เดือน`,
                    title: (ctx: any) => `อายุ ${ctx[0].label} ปี`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                title: {
                    display: true,
                    text: "อายุ (ปี)",
                    font: { size: 12 }
                }
            },
            y: {
                beginAtZero: true,
                grid: { color: "#f1f5f9" },
                title: {
                    display: true,
                    text: "จำนวนเงิน",
                    font: { size: 12 }
                },
                ticks: {
                    callback: (v) => {
                        const val = v as number;
                        if (val >= 1000000) return "B" + (val / 1000000).toFixed(1) + "M";
                        if (val >= 1000) return "B" + (val / 1000).toFixed(0) + "k";
                        return val;
                    },
                },
            },
        },
    } as ChartOptions<"line">;
}

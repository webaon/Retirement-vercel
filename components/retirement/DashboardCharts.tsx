import React, { useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
    TooltipItem,
    ScriptableContext,
    ChartData
} from "chart.js";
import { Line, Chart } from "react-chartjs-2";
import { formatNumber } from "@/lib/utils";
import { buildProjectionSeries } from "@/lib/retirement-calculation";
import { CalculationResult, MonteCarloResult, RetirementInputs } from "@/types/retirement";

// Define strict type for Insurance Chart Data structure (นิยามโครงสร้างข้อมูลกราฟประกัน)
export interface InsuranceChartData {
    labels: number[]; // อายุ
    datasets: {
        label: string;
        data: (number | null)[];
        borderColor?: string;
        backgroundColor?: string;
        [key: string]: any;
    }[];
}

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Chart Plugins (ปลั๊กอินเสริมสำหรับกราฟ)

// Crosshair Plugin: แสดงเส้นตัดกากบาทเมื่อเอาเมาส์ชี้ (ช่วยให้อ่านค่ากราฟง่ายขึ้น)
const crosshairPlugin = {
    id: 'crosshair',
    afterDraw: (chart: any) => {
        if (chart.tooltip?._active?.length) {
            const { ctx, chartArea: { left, right, top, bottom } } = chart;
            const activePoint = chart.tooltip._active[0];
            const x = activePoint.element.x;
            const y = activePoint.element.y;

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([4, 4]); // เส้นประ
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#64748b'; // Slate 500 (Grey)

            // Vertical Line (Point -> Bottom) - "Lines meet at the point"
            // เส้นแนวตั้งจากจุดข้อมูลลงมาที่แกน X
            ctx.moveTo(x, y);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            // Horizontal Line (Value Line)
            // เส้นแนวนอนจากแกน Y มาที่จุดข้อมูล
            ctx.beginPath();
            ctx.moveTo(left, y);
            // Draw to the point (x)
            ctx.lineTo(x, y);
            ctx.stroke();

            ctx.restore();
        }
    }
};

// Goal Label Plugin: แสดงเส้นเป้าหมายและป้ายกำกับ (เส้นประสีฟ้า)
export const goalLabelPlugin = {
    id: "goalLabelPlugin",
    afterDraw: (chart: any, args: any, options: any) => {
        if (options.display === false) return;

        const { ctx, scales: { x, y } } = chart;
        const goalVal = options.goalValue;
        const retireAge = options.retireAge;
        if (!goalVal || goalVal <= 0) return;

        const isHorizontal = chart.options.indexAxis === 'y';

        if (isHorizontal) {
            // --- Horizontal View: Draw VERTICAL line ---
            const xPos = x.getPixelForValue(goalVal);
            let yStart = y.bottom;
            let yEnd = y.top;

            // Limit line to Retirement Age (if provided)
            if (retireAge) {
                const retireY = y.getPixelForValue(String(retireAge));
                if (retireY !== undefined && !isNaN(retireY)) {
                    yEnd = retireY;
                }
            }

            // Draw Blue Dashed Line
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.moveTo(xPos, yStart);
            ctx.lineTo(xPos, yEnd);
            ctx.stroke();
            ctx.restore();

            // Draw Label Badge (Rotated)
            const text = options.labelText || "เป้าหมายทางการเงิน";
            ctx.save();
            ctx.font = "bold 12px 'Inter', 'Prompt', sans-serif";
            const metrics = ctx.measureText(text);
            const badgeWidth = metrics.width + 24;
            const badgeHeight = 26;

            // Positioning: Center of the vertical segment
            const centerX = xPos;
            const centerY = yEnd + (yStart - yEnd) / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(-Math.PI / 2); // Rotate 90 degrees CCW (Standard for vertical)

            // Background
            ctx.shadowColor = "rgba(37, 99, 235, 0.15)";
            ctx.shadowBlur = 8;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            // Origin is now the center of the badge
            if (ctx.roundRect) ctx.roundRect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, 100);
            else ctx.rect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight);
            ctx.fill();

            // Border
            ctx.strokeStyle = "#bfdbfe";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Text
            ctx.fillStyle = "#2563eb";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, 0, 1);
            ctx.restore();

        } else {
            // --- Vertical View: Draw HORIZONTAL line (Existing Logic) ---
            const yPos = y.getPixelForValue(goalVal);
            const xStart = x.left;
            let xEnd = x.right;

            if (retireAge) {
                const px = x.getPixelForValue(String(retireAge));
                if (px !== undefined && px !== null && !isNaN(px)) xEnd = px;
            }

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.moveTo(xStart, yPos);
            ctx.lineTo(xEnd, yPos);
            ctx.stroke();
            ctx.restore();

            const text = options.labelText || "เป้าหมายทางการเงิน";
            ctx.save();
            ctx.font = "bold 12px 'Inter', 'Prompt', sans-serif";
            const textMetrics = ctx.measureText(text);
            const paddingX = 12;
            const badgeHeight = 26;
            const badgeWidth = textMetrics.width + (paddingX * 2);

            const badgeX = xStart + 20;
            const badgeY = yPos - (badgeHeight / 2);

            ctx.shadowColor = "rgba(37, 99, 235, 0.15)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 100);
            else ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
            ctx.fill();

            ctx.shadowColor = "transparent";
            ctx.strokeStyle = "#bfdbfe";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = "#2563eb";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(text, badgeX + paddingX, yPos + 1);
            ctx.restore();
        }
    }
};

// Age Period Plugin: แสดงลายน้ำจางๆ สำหรับแบ่งช่วงอายุ (ทุก 5 หรือ 10 ปี)
const agePeriodPlugin = {
    id: "agePeriodPlugin",
    beforeDatasetsDraw: (chart: any, args: any, options: any) => {
        const { ctx, scales: { x, y } } = chart;
        const interval = options.tickInterval || 10; // Default to 10

        ctx.save();

        const xMeta = chart.getDatasetMeta(0).data;
        if (!xMeta || xMeta.length === 0) return;

        chart.data.labels.forEach((label: string, index: number) => {
            const age = parseInt(label);
            if (isNaN(age)) return;

            // Draw faint line if age matches interval (วาดเส้นจางๆ ถ้าอายุตรงกับช่วง)
            if (age % interval === 0) {
                const xPos = x.getPixelForValue(label);

                // Draw line
                ctx.beginPath();
                ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"; // Very faint grey
                ctx.lineWidth = 1;
                ctx.moveTo(xPos, y.bottom);
                ctx.lineTo(xPos, y.top);
                ctx.stroke();
            }
        });

        ctx.restore();
    }
};

// Legacy Label Plugin: แสดงป้ายกำกับมรดก (เส้นประสีแดง)
export const legacyLabelPlugin = {
    id: "legacyLabelPlugin",
    afterDraw: (chart: any, args: any, options: any) => {
        if (options.display === false) return;

        const { ctx, scales: { x, y } } = chart;
        const legacyVal = options.legacyValue || 0;
        if (legacyVal <= 0) return;

        const isHorizontal = chart.options.indexAxis === 'y';

        if (isHorizontal) {
            // --- Horizontal View: Draw VERTICAL line ---
            const xPos = x.getPixelForValue(legacyVal);
            let yStart = y.top;
            let yEnd = y.bottom;

            const retireAge = options.retireAge;
            if (retireAge) {
                const retireY = y.getPixelForValue(String(retireAge));
                if (retireY !== undefined && !isNaN(retireY)) {
                    yEnd = retireY;
                }
            }

            // Draw Red Dashed Line
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "#EF4444";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.moveTo(xPos, yStart);
            ctx.lineTo(xPos, yEnd);
            ctx.stroke();
            ctx.restore();

            // Draw Label Badge (Rotated)
            const text = "มรดก";
            ctx.save();
            ctx.font = "bold 12px 'Inter', 'Prompt', sans-serif";
            const metrics = ctx.measureText(text);
            const badgeWidth = metrics.width + 24;
            const badgeHeight = 26;

            // Position: Center of the vertical segment
            const centerX = xPos;
            const centerY = yStart + (yEnd - yStart) / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(-Math.PI / 2); // Rotate 90 degrees CCW

            // Background
            ctx.shadowColor = "rgba(239, 68, 68, 0.15)";
            ctx.shadowBlur = 8;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            // Origin is now center of badge
            if (ctx.roundRect) ctx.roundRect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, 100);
            else ctx.rect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight);
            ctx.fill();

            // Border
            ctx.strokeStyle = "#fecaca";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Text
            ctx.fillStyle = "#dc2626";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, 0, 1);
            ctx.restore();

        } else {
            // --- Vertical View: Draw HORIZONTAL line (Existing Logic) ---
            const yPos = y.getPixelForValue(legacyVal);
            let xStart = x.left;
            const xEnd = x.right;

            const retireAge = options.retireAge;
            if (retireAge) {
                const px = x.getPixelForValue(String(retireAge));
                if (px !== undefined && px !== null && !isNaN(px)) xStart = px;
            }

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "#EF4444";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.moveTo(xStart, yPos);
            ctx.lineTo(xEnd, yPos);
            ctx.stroke();
            ctx.restore();

            const text = "มรดก";
            ctx.save();
            ctx.font = "bold 12px 'Inter', 'Prompt', sans-serif";
            const textMetrics = ctx.measureText(text);
            const paddingX = 12;
            const badgeHeight = 26;
            const badgeWidth = textMetrics.width + (paddingX * 2);

            const badgeX = xStart + (xEnd - xStart) * 0.85;
            const badgeY = yPos - (badgeHeight / 2);

            ctx.shadowColor = "rgba(239, 68, 68, 0.15)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 100);
            else ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
            ctx.fill();

            ctx.shadowColor = "transparent";
            ctx.strokeStyle = "#fecaca";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = "#dc2626";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(text, badgeX + paddingX, yPos + 1);
            ctx.restore();
        }
    }
};

// Also register local plugins
ChartJS.register(goalLabelPlugin, legacyLabelPlugin, crosshairPlugin, agePeriodPlugin);


// --- Projection Chart (กราฟคาดการณ์เงินออม) ---
export interface ProjectionChartProps {
    inputs: RetirementInputs; // ข้อมูลนำเข้า
    result: CalculationResult; // ผลลัพธ์คำนวณ
    mcResult: MonteCarloResult | null; // ผล Monte Carlo (ถ้ามี)
    showSumAssured: boolean; // แสดงทุนประกันหรือไม่
    showActualSavings: boolean; // แสดงเงินออมจริงหรือไม่
    insuranceChartData: InsuranceChartData | null; // ข้อมูลกราฟประกัน
    chartTickInterval: number; // ระยะห่างช่วงอายุบนแกน X
    viewMode?: 'line' | 'bar'; // โหมดการแสดงผล (เส้นกราฟ / แท่งกราฟ)
}


export const ProjectionChart: React.FC<ProjectionChartProps> = ({
    inputs,
    result,
    mcResult,
    showSumAssured,
    showActualSavings,
    insuranceChartData,
    chartTickInterval,
    viewMode = 'line'
}) => {
    // Mobile & Tablet Detection State
    const [isMobile, setIsMobile] = React.useState(false);
    const [isTablet, setIsTablet] = React.useState(false);
    React.useEffect(() => {
        const checkSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1280); // iPad Interval
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    const valFormatter = (val: number) => {
        if (val >= 1000000) return "B" + (val / 1000000).toFixed(1) + "M";
        if (val >= 1000) return "B" + (val / 1000).toFixed(0) + "k";
        return String(val);
    };

    const projectionChart = useMemo(() => {
        const { labels, actual, required, actualHistory } = buildProjectionSeries(inputs, result);
        const p5Series = mcResult?.p5Series || labels.map(() => 0);
        const p95Series = mcResult?.p95Series || labels.map(() => 0);
        const sumAssuredSeries = labels.map(ageStr => {
            const age = Number(ageStr);
            if (!insuranceChartData) return 0;
            const idx = insuranceChartData.labels.indexOf(age);
            if (idx !== -1) return insuranceChartData.datasets[0].data[idx] as number || 0;
            return 0;
        });

        // Filter data for Bar view to reduce crowding (กรองข้อมูลสำหรับโหมด Bar เพื่อไม่ให้กราฟแน่นเกินไป)
        const indicesToKeep = labels.map((_, i) => i).filter(i => {
            if (viewMode === 'line' || isMobile) return true; // ถ้าเป็น Line หรือ Mobile ให้แสดงหมด (หรือจัดการใน Scale แทน)
            const age = Number(labels[i]);
            // Always keep first and last, otherwise filter by interval
            // เก็บข้อมูลปีแรก, ปีสุดท้าย, หรือปีที่ตรงกับช่วงเวลาที่เลือก
            return i === 0 || i === labels.length - 1 || age % chartTickInterval === 0;
        });

        const filteredLabels = indicesToKeep.map(i => labels[i]);
        const filteredActual = indicesToKeep.map(i => actual[i]);
        const filteredP5 = indicesToKeep.map(i => p5Series[i]);
        const filteredP95 = indicesToKeep.map(i => p95Series[i]);
        const filteredSumAssured = indicesToKeep.map(i => sumAssuredSeries[i]);
        const filteredRequired = indicesToKeep.map(i => Math.min(i, required.length - 1)).map(j => required[j]); // Safety check for required mapping
        // Note: required logic below uses map on labels originally, we should replicate that logic on filteredLabels

        const _requiredMapped = indicesToKeep.map(originalIndex => {
            // Replicate original logic: Number(labels[i]) <= Number(inputs.retireAge) ? val : null
            // required array from buildProjectionSeries matches labels length usually
            return Number(labels[originalIndex]) <= Number(inputs.retireAge) ? required[originalIndex] : null;
        });

        const _legacyMapped = indicesToKeep.map(originalIndex => {
            return Number(labels[originalIndex]) >= Number(inputs.retireAge) ? inputs.legacyFund : null;
        });

        // Use these filtered series in the return object BUT carefully
        const finalLabels = filteredLabels;

        const maxActual = Math.max(...actual);
        const maxRequired = Math.max(...required);
        const maxSumAssured = showSumAssured ? Math.max(...sumAssuredSeries) : 0;
        const maxMain = Math.max(maxActual, maxRequired, maxSumAssured);
        const suggestedMax = Math.ceil((maxMain * 1.1) / 1000000) * 1000000;

        // Configuration for Scales (Swappable)
        // ตั้งค่าแกน X และ Y (สลับได้ตามอุปกรณ์)
        const ageScaleConfig = {
            title: { display: true, text: "อายุ (ปี)" },
            grid: { display: false },
            ticks: {
                maxRotation: 0, minRotation: 0, autoSkip: false, maxTicksLimit: chartTickInterval === 1 ? 200 : undefined,
                font: { size: chartTickInterval === 1 ? 10 : (isMobile ? 10 : 12) },
                callback: function (this: any, val: any) {
                    const label = this.getLabelForValue(val as number);
                    const age = Number(label);
                    // In Desktop Bar view, we already filtered the data, so show every label remaining.
                    if (viewMode === 'bar' && !isMobile) return label;

                    // Logic: Adjust interval for Mobile and Tablet to prevent overcrowding
                    // Mobile: Double the interval
                    // Tablet: If interval is 1 (All years), show every 2 years. Otherwise keep as is.
                    // Logic: Adjust interval for Mobile and Tablet (Desktop view)
                    // Mobile: Double the interval (2->4, 5->10)
                    // Tablet: Keep as is for 2 years (readable enough)

                    let viewInterval = chartTickInterval;
                    if (isMobile) {
                        viewInterval = chartTickInterval * 2;
                    }
                    // Removed old "1 year -> 2 years on tablet" logic as 1 year is no longer an option

                    // Show label only if match interval
                    if (age % viewInterval === 0) return label;
                    return "";
                }
            },
        };

        const moneyScaleConfig = {
            title: { display: !isMobile, text: "จำนวนเงิน" },
            grid: { color: "#f1f5f9" },
            min: 0,
            max: suggestedMax,
            ticks: {
                stepSize: 1000000,
                color: '#94a3b8',
                font: { size: 10, weight: 'bold' as const },
                padding: 10,
                callback: function (this: any, v: any) { return valFormatter(v as number); }
            },
        };

        return {
            data: {
                labels: finalLabels,
                datasets: [
                    { label: "P5", data: filteredP5, borderColor: "transparent", backgroundColor: "rgba(16, 185, 129, 0.1)", pointRadius: 0, fill: "+1", tension: 0.4, order: 5, hidden: isMobile, type: 'line' as const },
                    { label: "P95", data: filteredP95, borderColor: "transparent", backgroundColor: "rgba(16, 185, 129, 0.1)", pointRadius: 0, fill: false, tension: 0.4, order: 6, hidden: isMobile, type: 'line' as const },
                    {
                        label: `เงินออม (${inputs.retireAge} ปี)`,
                        data: filteredActual,
                        borderColor: "#10B981",
                        // Bar specific style
                        backgroundColor: (context: any) => {
                            if (viewMode === 'bar' && !isMobile) {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
                                gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)");
                                gradient.addColorStop(1, "rgba(16, 185, 129, 0.2)");
                                return gradient;
                            }
                            // Mobile or Line View
                            if (viewMode === 'line' || isMobile) {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                                gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
                                gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
                                return gradient;
                            }
                            return "#10B981";
                        },
                        borderWidth: (viewMode === 'bar' && !isMobile) ? 0 : (isMobile ? 0 : 3),
                        borderRadius: (viewMode === 'bar' && !isMobile) ? 4 : (isMobile ? 4 : 0),
                        barThickness: (viewMode === 'bar' && !isMobile) ? 'flex' : (isMobile ? 8 : undefined),
                        maxBarThickness: 60,
                        tension: 0.4,
                        fill: true,
                        pointRadius: (viewMode === 'bar' && !isMobile) ? 0 : 3,
                        pointHoverRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#10B981",
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#10B981",
                        pointHoverBorderWidth: 3,
                        order: 1,
                        hidden: !showActualSavings,
                        type: (viewMode === 'bar' && !isMobile) ? 'bar' as const : 'line' as const
                    },
                    {
                        label: "เงินที่เก็บได้จริง",
                        data: actualHistory.filter((_, i) => indicesToKeep.includes(i)),
                        borderColor: "#2563eb",
                        backgroundColor: "transparent",
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#2563eb",
                        pointBorderWidth: 2,
                        order: 0,
                        showLine: false, // Scatter points essentially
                        hidden: !showActualSavings,
                        type: 'line' as const
                    },
                    {
                        label: "เงินที่ต้องการ",
                        data: _requiredMapped,
                        borderColor: "#2563eb",
                        borderDash: [6, 6],
                        backgroundColor: "#2563eb",
                        borderWidth: (viewMode === 'bar' && !isMobile) ? 2 : (isMobile ? 2 : 0),

                        pointRadius: 0,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#2563eb",
                        pointBorderWidth: 2,
                        pointHoverRadius: 4,

                        fill: false,
                        order: 2,
                        hidden: false,
                        type: 'line' as const
                    },
                    {
                        label: "มรดก",
                        data: _legacyMapped,
                        borderColor: "#EF4444",
                        borderDash: [6, 4],
                        backgroundColor: "transparent",
                        borderWidth: isMobile ? 0 : 2, // Disable line on mobile (handled by plugin)
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        fill: false,
                        order: 4,
                        hidden: !(inputs.legacyFund > 0),
                        type: 'line' as const
                    },
                    {
                        label: "ทุนประกัน",
                        data: filteredSumAssured,
                        borderColor: "#F97316",
                        backgroundColor: (viewMode === 'bar' && !isMobile) ? "rgba(249, 115, 22, 0.4)" : "transparent",
                        borderWidth: (viewMode === 'bar' && !isMobile) ? 0 : 2,
                        stepped: false,
                        pointRadius: (viewMode === 'bar' && !isMobile) ? 0 : 3,
                        pointHoverRadius: 6,
                        pointBackgroundColor: "#ffffff",
                        pointBorderColor: "#F97316",
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: "#ffffff",
                        pointHoverBorderColor: "#F97316",
                        pointHoverBorderWidth: 3,
                        borderRadius: (viewMode === 'bar' && !isMobile) ? 4 : 0,
                        barThickness: (viewMode === 'bar' && !isMobile) ? 'flex' : undefined,
                        maxBarThickness: 60,
                        fill: false,
                        order: 3,
                        hidden: !showSumAssured,
                        type: (viewMode === 'bar' && !isMobile) ? 'bar' as const : 'line' as const
                    },
                    // Dummy Dataset for Monte Carlo Legend
                    {
                        label: "Monte Carlo",
                        data: [],
                        borderColor: "#2dd4bf", // Teal-400
                        backgroundColor: "#2dd4bf",
                        pointRadius: 4,
                        order: 10,
                        hidden: !mcResult, // Only show if MC is available
                        type: 'line' as const
                    }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: isMobile ? 'y' as const : 'x' as const,
                plugins: {
                    legend: {
                        display: !isMobile,
                        position: 'top' as const,
                        align: 'center' as const,
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 20,
                            font: { size: 12, family: "'Inter', 'Prompt', sans-serif", weight: 'bold' as const },
                            generateLabels: (chart: any) => {
                                const defaults = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
                                return defaults.map(item => {
                                    if (item.text.includes("เงินออม")) {
                                        item.fillStyle = '#10B981';
                                        item.strokeStyle = '#10B981';
                                    }
                                    if (item.text.includes("เงินที่ต้องการ")) {
                                        item.fillStyle = '#2563eb';
                                        item.strokeStyle = '#2563eb';
                                    }
                                    if (item.text.includes("ทุนประกัน")) {
                                        item.fillStyle = '#F97316';
                                        item.strokeStyle = '#F97316';
                                    }
                                    if (item.text.includes("Monte Carlo")) {
                                        item.fillStyle = '#2dd4bf';
                                        item.strokeStyle = '#2dd4bf';
                                    }
                                    return item;
                                }).filter(item =>
                                    item.text.includes("เงินออม") ||
                                    item.text.includes("เงินที่ต้องการ") ||
                                    item.text.includes("ทุนประกัน") ||
                                    item.text.includes("Monte Carlo")
                                );
                            }
                        }
                    },
                    tooltip: {
                        mode: "index" as const, intersect: false, backgroundColor: 'rgba(255, 255, 255, 0.98)', titleColor: '#1e293b', bodyColor: '#475569', borderColor: '#e2e8f0', borderWidth: 1,
                        titleFont: { size: 14, weight: "bold" as const, family: "'Inter', 'Prompt', sans-serif" }, bodyFont: { size: 13, family: "'Inter', 'Prompt', sans-serif" }, padding: 12, displayColors: true, boxPadding: 4, usePointStyle: true,
                        callbacks: {
                            title: (items: any[]) => items.length ? `อายุ ${items[0].label}` : "",
                            label: (ctx: any) => {
                                const label = ctx.dataset.label; const val = ctx.parsed[isMobile ? 'x' : 'y'] || 0; // Check correct axis val
                                if (label === `เงินออม (${inputs.retireAge} ปี)` || label === "เงินที่เก็บได้จริง") return `เงินออม: ฿${formatNumber(val)}`;
                                if (label === "เงินที่ต้องการ") return `เป้าหมาย: ฿${formatNumber(val)}`;
                                if (label === "ทุนประกัน") {
                                    const age = Number(ctx.label);
                                    const flowIdx = insuranceChartData?.labels.indexOf(age) ?? -1;
                                    const flow = flowIdx !== -1 ? (insuranceChartData?.datasets[1].data[flowIdx] as number) : 0;
                                    return [`วงเงินประกัน: ฿${formatNumber(val)}`, `กระแสเงินจากประกัน: ฿${formatNumber(flow)}`];
                                }
                                if (label === "P5") return `โอกาส 5% (แย่สุด): ฿${formatNumber(val)}`;
                                if (label === "P95") return `โอกาส 95% (ดีสุด): ฿${formatNumber(val)}`;
                                return;
                            },
                        }, filter: (item: any) => item.dataset.label !== "P5" && item.dataset.label !== "P95" && item.dataset.label !== "Monte Carlo", // Hide dummy MC from tooltip
                    },
                    goalLabelPlugin: { goalValue: result.targetFund, labelText: "เป้าหมายทางการเงิน", formatNumber, chartTickInterval, retireAge: Number(inputs.retireAge), display: !isMobile }, // Disable on Mobile
                    legacyLabelPlugin: { legacyValue: inputs.legacyFund, retireAge: Number(inputs.retireAge), display: !isMobile }, // Disable on Mobile
                    agePeriodPlugin: { tickInterval: chartTickInterval },
                },
                categoryPercentage: 0.6,
                barPercentage: 0.9,
                scales: {
                    x: {
                        ... (isMobile ? moneyScaleConfig : ageScaleConfig),
                        stacked: (viewMode === 'bar' && !isMobile) ? false : false // Ensure side-by-side
                    },
                    y: isMobile ? ageScaleConfig : moneyScaleConfig,
                },
            },
        };
    }, [inputs, result, mcResult, showSumAssured, showActualSavings, insuranceChartData, chartTickInterval, isMobile, viewMode]);

    return (
        <Chart
            type={isMobile ? 'bar' : (viewMode === 'bar' ? 'bar' : 'line')}
            data={projectionChart.data as any}
            options={{
                ...projectionChart.options,
                maintainAspectRatio: false,
                layout: { padding: { top: 20, bottom: 10, left: 10, right: 10 } }
            }}
        />
    );
};


// --- Expense Chart (กราฟแสดงรายจ่ายหลังเกษียณ) ---
export interface ExpenseChartProps {
    result: CalculationResult; // ผลลัพธ์การคำนวณการเงิน
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ result }) => {
    // Helper to format large numbers (ตัวช่วยจัดรูปแบบตัวเลข: 1M, 1k)
    const valFormatter = (val: number) => {
        if (val >= 1000000) return "B" + (val / 1000000).toFixed(1) + "M";
        if (val >= 1000) return "B" + (val / 1000).toFixed(0) + "k";
        return String(val);
    };

    const expenseChart = useMemo(() => {
        if (!result.expenseSchedule || result.expenseSchedule.length === 0) return null; // ถ้าไม่มีข้อมูลตารางค่าใช้จ่าย ให้คืนค่า null
        const labels = result.expenseSchedule.map((r) => String(r.age)); // แกน X: อายุ
        const dataMonthly = result.expenseSchedule.map((r) => r.monthly); // แกน Y: รายจ่ายต่อเดือน
        return {
            data: {
                labels,
                datasets: [{ label: "รายจ่ายต่อเดือน (บาท)", data: dataMonthly, borderColor: "#B05AD9", backgroundColor: "rgba(176, 90, 217, 0.1)", tension: 0.3, fill: true, pointRadius: 3, pointHoverRadius: 5 }],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' as const, align: 'end' as const, labels: { boxWidth: 10, usePointStyle: true, font: { size: 11 } } },
                    tooltip: { mode: "index", intersect: false, callbacks: { label: (ctx: any) => `รายจ่าย : ฿ ${formatNumber(ctx.parsed.y || 0)} / เดือน`, title: (ctx: any) => `อายุ ${ctx[0].label} ปี` } },
                },
                scales: {
                    x: { grid: { display: false }, title: { display: true, text: "อายุ (ปี)", font: { size: 12 } } },
                    y: { beginAtZero: true, grid: { color: "#f1f5f9" }, title: { display: true, text: "จำนวนเงิน", font: { size: 12 } }, ticks: { callback: (v: any) => valFormatter(v) } },
                },
            } as ChartOptions<"line">,
        };
    }, [result.expenseSchedule]);

    if (!expenseChart) {
        return <div className="flex h-full items-center justify-center text-xs text-slate-400">ไม่มีข้อมูลกราฟ</div>;
    }

    return <Line data={expenseChart.data} options={{ ...expenseChart.options, maintainAspectRatio: false }} />;
};

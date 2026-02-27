"use client";

import * as React from "react";
import { X, Check, Delete, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatPreviewNumber } from "@/app/lib/number-utils";
import { createPortal } from "react-dom";

interface NumericKeypadProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    initialValue: string | number;
    label?: string;
    allowDecimal?: boolean;
}

export function NumericKeypad({
    isOpen,
    onClose,
    onConfirm,
    initialValue,
    label,
    allowDecimal = true,
}: NumericKeypadProps) {
    const [displayValue, setDisplayValue] = React.useState("");
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            let val = String(initialValue);
            // If it's a "0" (and not actively being typed as 0.something), start clean
            if (val === "0") val = "";
            setDisplayValue(val);
        }
    }, [isOpen, initialValue]);

    // Format for display: 123456 -> 123,456
    const formattedDisplay = React.useMemo(() => {
        if (displayValue === "") return "";
        if (displayValue.endsWith(".")) return formatPreviewNumber(displayValue.slice(0, -1)) + ".";
        // Handle intermediate decimal states like "123.0"
        if (displayValue.includes(".") && displayValue.endsWith("0")) {
            const [int, dec] = displayValue.split(".");
            return `${formatPreviewNumber(int)}.${dec}`;
        }
        return formatPreviewNumber(displayValue);
    }, [displayValue]);

    if (!isOpen || !mounted) return null;

    const handleNumClick = (num: string) => {
        setDisplayValue((prev) => {
            // Prevent multiple leading zeros
            if (prev === "0" && num === "0") return "0";
            if (prev === "0" && num !== ".") return num;
            if (prev === "" && num === ".") return "0.";
            // Max length check to prevent layout break
            if (prev.length > 15) return prev;
            return prev + num;
        });
    };

    const handleDecimal = () => {
        if (!allowDecimal) return;
        setDisplayValue((prev) => {
            if (prev.includes(".")) return prev;
            return prev === "" ? "0." : prev + ".";
        });
    };

    const handleBackspace = () => {
        setDisplayValue((prev) => prev.slice(0, -1));
    };

    const handleClear = () => {
        setDisplayValue("");
    };

    const handleConfirm = () => {
        const finalVal = displayValue === "" ? "0" : displayValue;
        onConfirm(finalVal);
        onClose();
    };

    const handleAddAmount = (amount: number) => {
        setDisplayValue((prev) => {
            const current = parseFloat(prev.replace(/,/g, '')) || 0;
            const newVal = current + amount;
            return String(newVal);
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-all duration-500"
                onClick={onClose}
            />

            <div className="relative z-50 w-full sm:w-[460px] animate-in zoom-in-95 slide-in-from-bottom-12 duration-300">
                <div className="w-full bg-white/80 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] rounded-[3rem] p-1.5 ring-1 ring-white/50">
                    <div className="bg-gradient-to-br from-white via-white/80 to-indigo-50/30 p-6 rounded-[2.8rem] flex flex-col gap-6 w-full h-full relative border border-white/60">

                        {/* Close Button */}
                        <div className="absolute top-6 left-6 z-20">
                            <span className="text-[10px] font-bold text-indigo-300 tracking-widest uppercase bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100/50">
                                {label || "INPUT"}
                            </span>
                        </div>

                        <div className="absolute top-5 right-5 z-20">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Display Area */}
                        <div className="w-full pt-8 pb-4 flex flex-col items-center px-4 space-y-0.5">
                            <span className="text-[10px] font-black text-indigo-400/60 tracking-[0.2em] uppercase mb-1">VALUE</span>
                            <div className="w-full text-center h-[5rem] flex items-center justify-center relative px-2">
                                <span
                                    className={`font-black tracking-tight text-slate-700 leading-none drop-shadow-sm transition-all duration-200 whitespace-nowrap ${formattedDisplay.length > 13 ? "text-[2rem]" :
                                            formattedDisplay.length > 10 ? "text-[2.6rem]" :
                                                formattedDisplay.length > 8 ? "text-[3.2rem]" :
                                                    formattedDisplay.length > 6 ? "text-[3.8rem]" :
                                                        "text-[4.5rem]"
                                        }`}
                                >
                                    {displayValue === "" ? <span className="text-slate-200">0</span> : formattedDisplay}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2.5 px-2 pb-2">
                            {/* Row 1 */}
                            <KeypadButton onClick={() => handleNumClick("7")}>7</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("8")}>8</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("9")}>9</KeypadButton>

                            <QuickAddButton value={1000} label="+1K" onClick={(v) => handleAddAmount(v)} />
                            <QuickAddButton value={10000} label="+10K" onClick={(v) => handleAddAmount(v)} />

                            {/* Row 2 */}
                            <KeypadButton onClick={() => handleNumClick("4")}>4</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("5")}>5</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("6")}>6</KeypadButton>

                            <QuickAddButton value={100000} label="+100K" onClick={(v) => handleAddAmount(v)} />
                            <QuickAddButton value={1000000} label="+1M" onClick={(v) => handleAddAmount(v)} />

                            {/* Row 3 */}
                            <KeypadButton onClick={() => handleNumClick("1")}>1</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("2")}>2</KeypadButton>
                            <KeypadButton onClick={() => handleNumClick("3")}>3</KeypadButton>

                            <KeypadButton
                                onClick={handleBackspace}
                                className="bg-[#fff9e6] text-[#fbbf24] hover:bg-amber-100 border-amber-100 hover:shadow-amber-100"
                            >
                                <Delete className="w-6 h-6" strokeWidth={2.5} />
                            </KeypadButton>

                            {/* Confirm (Big Button) - Spans 2 Rows vertically in Col 5 */}
                            <button
                                onClick={handleConfirm}
                                className="row-span-2 w-full h-full rounded-[1.8rem] bg-[#5856D6] hover:bg-[#4d4ba3] text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all active:scale-95 group border-t border-white/20"
                            >
                                <Check className="w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={4} />
                            </button>

                            {/* Row 4 */}
                            <KeypadButton onClick={() => handleNumClick("0")} className="col-span-2 w-full">0</KeypadButton>
                            <KeypadButton onClick={handleDecimal} disabled={!allowDecimal} className="text-3xl pb-2">.</KeypadButton>

                            <KeypadButton
                                onClick={handleClear}
                                className="bg-rose-50 text-rose-500 hover:bg-rose-100 border-rose-100 hover:shadow-rose-100"
                            >
                                <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
                            </KeypadButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

function KeypadButton({
    children,
    onClick,
    className,
    disabled
}: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "h-[4rem] w-full rounded-[1.4rem] text-2xl font-bold transition-all duration-200 select-none flex items-center justify-center cursor-pointer",
                "bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06)] border border-slate-50",
                "text-slate-700 hover:text-slate-900 hover:shadow-xl hover:-translate-y-0.5",
                "active:scale-95 active:bg-slate-50 active:translate-y-0",
                "disabled:opacity-30 disabled:pointer-events-none",
                className
            )}
        >
            {children}
        </button>
    );
}

function QuickAddButton({ value, label, onClick }: { value: number, label: string, onClick: (v: number) => void }) {
    return (
        <button
            onClick={() => onClick(value)}
            className="h-[4rem] w-full rounded-[1.4rem] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs sm:text-sm transition-all shadow-[0_2px_8px_-2px_rgba(99,102,241,0.15)] border border-indigo-100 uppercase tracking-tight active:scale-95 hover:-translate-y-0.5"
        >
            {label}
        </button>
    );
}

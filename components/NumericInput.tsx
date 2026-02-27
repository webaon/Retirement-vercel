"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { NumericKeypad } from "@/components/NumericKeypad";
import { cn } from "@/lib/utils";
import { formatPreviewNumber, parseNumber } from "@/app/lib/number-utils";

interface NumericInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
    value: string | number;
    onChange: (value: string) => void;
    label?: string;
    allowDecimal?: boolean;
}

export function NumericInput({
    value,
    onChange,
    label,
    allowDecimal = true,
    className,
    readOnly,
    ...props
}: NumericInputProps) {
    const [isKeypadOpen, setIsKeypadOpen] = React.useState(false);

    // Parse current value for the keypad (remove commas)
    const numericValue = React.useMemo(() => {
        return parseNumber(String(value));
    }, [value]);

    const handleConfirm = (newValue: string) => {
        // Determine formatting based on decimal presence in original input usage?
        // The requirement says:
        // - After clicking "OK": Show number with comma (e.g. 12,454)
        // The helper `formatPreviewNumber` does smart formatting.
        // If the logical result is just a string update, we can trust the utils.
        const formatted = formatPreviewNumber(newValue);
        onChange(formatted);
    };

    const valueStr = String(value);
    const length = valueStr.length;
    let fontSizeClass = "";
    if (length > 14) fontSizeClass = "text-[10px]";
    else if (length > 10) fontSizeClass = "text-xs";

    return (
        <>
            <Input
                {...props}
                className={cn("cursor-pointer select-none transition-all", className, fontSizeClass)}
                value={value}
                readOnly
                onClick={(e) => {
                    if (!readOnly) {
                        setIsKeypadOpen(true);
                        // Blur to prevent mobile keyboard from popping up if it somehow triggered
                        e.currentTarget.blur();
                    }
                }}
                onFocus={(e) => {
                    if (!readOnly) {
                        setIsKeypadOpen(true);
                        e.currentTarget.blur();
                    }
                }}
                inputMode="none" // Hint to browsers not to show virtual keyboard
            />
            <NumericKeypad
                isOpen={isKeypadOpen}
                onClose={() => setIsKeypadOpen(false)}
                onConfirm={handleConfirm}
                initialValue={numericValue === 0 && String(value) !== "0" ? "" : String(numericValue)}
                label={label || props.placeholder}
                allowDecimal={allowDecimal}
            />
        </>
    );
}

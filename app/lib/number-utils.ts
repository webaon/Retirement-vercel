export const formatPreviewNumber = (value: string): string => {
    if (!value) return "0";
    // If it ends with a decimal point, keep it
    if (value.endsWith(".")) return value;
    // If it has a decimal point and zeros, keep them (e.g. "12.0")
    if (value.includes(".") && value.endsWith("0")) return value;

    const num = parseFloat(value);
    if (isNaN(num)) return "0";

    // Check if it has decimals
    if (value.includes(".")) {
        const parts = value.split(".");
        return `${parseInt(parts[0]).toLocaleString("en-US")}.${parts[1]}`;
    }

    return num.toLocaleString("en-US");
};

export const formatFinalNumber = (value: string): string => {
    if (!value) return "0";
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
};

export const parseNumber = (value: string): number => {
    if (!value) return 0;
    const clean = value.replace(/,/g, "");
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
};

import React from "react";

// --- CollapsibleSection: ส่วนที่สามารถพับเก็บได้ (Accordion) ---
export const CollapsibleSection = ({
    title,
    icon,
    iconColorClass,
    defaultOpen = false,
    children
}: {
    title: string;          // หัวข้อ
    icon?: React.ReactNode; // ไอคอน (ถ้ามี)
    iconColorClass?: string; // Class สีของไอคอน
    defaultOpen?: boolean;  // เปิดเริ่มต้นหรือไม่
    children: React.ReactNode; // เนื้อหาข้างใน
}) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className="rounded-2xl border border-border bg-card/80 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColorClass || "bg-primary/10 text-primary"} shadow-sm ring-1 ring-inset ring-black/5`}>
                            {icon}
                        </div>
                    )}
                    <span className="text-sm font-bold text-foreground tracking-tight">{title}</span>
                </div>
                <div className={`transform transition-transform duration-200 text-muted-foreground ${isOpen ? "rotate-180" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </button>

            {isOpen && (
                <div className="p-5 animate-in slide-in-from-top-1 duration-200 border-t border-border/50 bg-background/50 space-y-5">
                    {children}
                </div>
            )}
        </div>
    );
};

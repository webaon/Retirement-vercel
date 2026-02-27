import React from "react";

interface SkeletonProps {
    className?: string;
    /** Width like "100%", "200px" */
    width?: string;
    /** Height like "20px", "1rem" */
    height?: string;
    /** Shape: 'rect' (default), 'circle', 'text' */
    variant?: "rect" | "circle" | "text";
}

/**
 * Skeleton — Shimmer loading placeholder.
 * 
 * Usage:
 * ```tsx
 * <Skeleton width="200px" height="40px" />
 * <Skeleton variant="circle" width="48px" height="48px" />
 * <Skeleton variant="text" width="60%" />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    className = "",
    width,
    height,
    variant = "rect",
}) => {
    const baseClasses = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]";

    const variantClasses = {
        rect: "rounded-xl",
        circle: "rounded-full",
        text: "rounded h-4",
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
                width: width || (variant === "text" ? "100%" : undefined),
                height: height || (variant === "text" ? "1rem" : variant === "circle" ? width : undefined),
            }}
            role="status"
            aria-label="Loading..."
        />
    );
};

/**
 * DashboardSkeleton — Full dashboard loading skeleton.
 */
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0a0e17] animate-in fade-in duration-500 p-4 md:p-8 pt-[80px] space-y-8">
            {/* Hero Card Skeleton */}
            <Skeleton width="100%" height="220px" className="!rounded-[28px] !bg-gradient-to-r !from-slate-800 !via-slate-700 !to-slate-800" />

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} width="100%" height="180px" className="!rounded-[28px]" />
                ))}
            </div>

            {/* Chart Section */}
            <Skeleton width="100%" height="500px" className="!rounded-[32px]" />

            {/* Widget Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton width="100%" height="200px" className="!rounded-[28px]" />
                <Skeleton width="100%" height="200px" className="!rounded-[28px]" />
            </div>
        </div>
    );
};

export default Skeleton;

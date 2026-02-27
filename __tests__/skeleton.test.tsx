import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Skeleton, DashboardSkeleton } from "@/components/ui/Skeleton";

describe("Skeleton Component", () => {
    it("renders with default rect variant", () => {
        const { container } = render(<Skeleton width="200px" height="40px" />);
        const el = container.firstChild as HTMLElement;

        expect(el).toBeInTheDocument();
        expect(el.style.width).toBe("200px");
        expect(el.style.height).toBe("40px");
        expect(el.className).toContain("rounded-xl");
        expect(el.className).toContain("animate-pulse");
    });

    it("renders circle variant", () => {
        const { container } = render(
            <Skeleton variant="circle" width="48px" height="48px" />
        );
        const el = container.firstChild as HTMLElement;

        expect(el.className).toContain("rounded-full");
    });

    it("renders text variant with default height", () => {
        const { container } = render(<Skeleton variant="text" width="60%" />);
        const el = container.firstChild as HTMLElement;

        expect(el.style.height).toBe("1rem");
    });

    it("has proper aria attributes", () => {
        const { container } = render(<Skeleton />);
        const el = container.firstChild as HTMLElement;

        expect(el.getAttribute("role")).toBe("status");
        expect(el.getAttribute("aria-label")).toBe("Loading...");
    });
});

describe("DashboardSkeleton Composite", () => {
    it("renders without crashing", () => {
        const { container } = render(<DashboardSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it("has dark background", () => {
        const { container } = render(<DashboardSkeleton />);
        const rootDiv = container.firstChild as HTMLElement;

        expect(rootDiv.className).toContain("bg-[#0a0e17]");
    });
});

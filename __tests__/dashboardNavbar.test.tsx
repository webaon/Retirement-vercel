import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DashboardNavbar } from "@/components/retirement/DashboardNavbar";
import { DashboardHeroCard } from "@/components/retirement/DashboardHeroCard";
import { DashboardMetricCards } from "@/components/retirement/DashboardMetricCards";
import { initialForm } from "@/lib/retirement-calculation";

// ---------------------------------------------------------------
// DashboardNavbar Tests
// ---------------------------------------------------------------
describe("DashboardNavbar", () => {
    const defaultProps = {
        user: { name: "TestUser" },
        onLogout: () => { },
        onEditProfile: () => { },
    };

    it("renders the title", () => {
        render(<DashboardNavbar {...defaultProps} />);
        expect(screen.getByText("Financial Planner")).toBeInTheDocument();
    });

    it("displays user name", () => {
        render(<DashboardNavbar {...defaultProps} />);
        expect(screen.getByText("TestUser")).toBeInTheDocument();
    });

    it("shows user initials when no avatar", () => {
        render(<DashboardNavbar {...defaultProps} user={{ name: "John Doe" }} />);
        expect(screen.getByText("JO")).toBeInTheDocument();
    });

    it("shows back button when onBack prop provided", () => {
        render(<DashboardNavbar {...defaultProps} onBack={() => { }} />);
        const buttons = document.querySelectorAll("button");
        expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it("has light theme background (white/80)", () => {
        const { container } = render(<DashboardNavbar {...defaultProps} />);
        const nav = container.firstChild as HTMLElement;
        expect(nav.className).toContain("bg-white/80");
    });

    it("has dark text for readability on light bg", () => {
        render(<DashboardNavbar {...defaultProps} />);
        const title = screen.getByText("Financial Planner");
        expect(title.className).toContain("text-slate-800");
    });
});

// ---------------------------------------------------------------
// DashboardHeroCard Tests
// ---------------------------------------------------------------
describe("DashboardHeroCard", () => {
    const goodResult = {
        status: "enough" as const,
        projectedFund: 5000000,
        targetFund: 4000000,
        gap: 1000000,
        monthlyNeeded: 0,
        yearsToRetire: 30,
        yearsInRetirement: 25,
        fvExpenseMonthly: 40000,
        totalLifetimeExpense: 12000000,
        nominalReturnPre: 0.07,
        nominalReturnPost: 0.04,
        successProbability: 0.85,
        moneyOutAge: 90,
        expenseSchedule: [],
        fvLumpSum: 5000000,
        fvAnnuity: 0,
        insuranceCashInflow: 0,
    };

    const riskyResult = {
        status: "short" as const,
        projectedFund: 2000000,
        targetFund: 4000000,
        gap: -2000000,
        monthlyNeeded: 5000,
        yearsToRetire: 30,
        yearsInRetirement: 25,
        fvExpenseMonthly: 40000,
        totalLifetimeExpense: 12000000,
        nominalReturnPre: 0.07,
        nominalReturnPost: 0.04,
        successProbability: 0.35,
        moneyOutAge: 75,
        expenseSchedule: [],
        fvLumpSum: 2000000,
        fvAnnuity: 0,
        insuranceCashInflow: 0,
    };

    const form = { ...initialForm, currentAge: "30", retireAge: "60" };

    it("renders success status for 'enough'", () => {
        const { container } = render(
            <DashboardHeroCard result={goodResult} form={form} isSidebarOpen={false} />
        );
        const el = container.firstChild as HTMLElement;
        expect(el.innerHTML).toContain("เพียงพอ");
    });

    it("renders risk status for 'short'", () => {
        const { container } = render(
            <DashboardHeroCard result={riskyResult} form={form} isSidebarOpen={false} />
        );
        const el = container.firstChild as HTMLElement;
        expect(el.innerHTML).toContain("ต้องปรับปรุงแผน");
    });
});

// ---------------------------------------------------------------
// DashboardMetricCards Tests
// ---------------------------------------------------------------
describe("DashboardMetricCards", () => {
    const result = {
        status: "enough" as const,
        projectedFund: 5000000,
        targetFund: 4000000,
        gap: 1000000,
        monthlyNeeded: 0,
        yearsToRetire: 30,
        yearsInRetirement: 25,
        fvExpenseMonthly: 40000,
        totalLifetimeExpense: 12000000,
        nominalReturnPre: 0.07,
        nominalReturnPost: 0.04,
        successProbability: 0.85,
        moneyOutAge: 90,
        expenseSchedule: [{ age: 60, monthly: 30000, yearly: 360000 }],
        fvLumpSum: 5000000,
        fvAnnuity: 0,
        insuranceCashInflow: 0,
    };

    const form = {
        ...initialForm,
        currentAge: "30",
        retireAge: "60",
        monthlySaving: "15,000",
    };

    it("renders 4 metric cards", () => {
        const { container } = render(
            <DashboardMetricCards
                result={result}
                form={form}
                isSidebarOpen={false}
                onShowProjectedModal={() => { }}
                onShowTargetModal={() => { }}
                onShowExpenseModal={() => { }}
            />
        );
        // Should have 4 cards (check by unique identifiers)
        // The component renders cards for: Projected, Target, Expense, Status
        const cards = container.querySelectorAll('[class*="rounded-"]');
        expect(cards.length).toBeGreaterThanOrEqual(4);
    });
});

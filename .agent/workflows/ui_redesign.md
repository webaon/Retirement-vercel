---
description: Steps to apply the "Premium Dashboard" UI redesign to the Retirement Planner
---

# UI Redesign Workflow (Current Architecture)

1.  **Layout Structure**:
    -   **Top Bar**: Full-width sticky header (`bg-white/80 backdrop-blur`) containing Logo, User Profile, and Logout.
    -   **Main Container**: `min-h-screen bg-slate-50/50`.
    -   **Dashboard Grid**: `grid-cols-1 lg:grid-cols-[450px_1fr]`.
        -   **Left Column (450px)**: Dedicated to `RetirementInputSection` in `isEmbedded` mode.
        -   **Right Column (1fr)**: Contains all result visualizations.

2.  **Input Section (`RetirementInputSection`)**:
    -   Wrapper: `sticky top-6 max-h-[90vh] overflow-y-auto rounded-3xl`.
    -   Style: Clean vertically stacked wizard steps if embedded.
    -   Background: Inherits white card styling with shadow.

3.  **Results Section (`Right Area`)**:
    -   **Hero Summary Card**: Top-most element. Large green/red gradient card showing Status, Projected Fund, and Target.
    -   **Key Metrics Grid**: 4-card grid (Projected, Target, Expense, Gap).
    -   **Chart Area**: Full-width `ProjectionChart` container.
    -   **Widgets Row**: `AllocationWidget` and `MonteCarloWidget` side-by-side.

4.  **Styling Guidelines**:
    -   **Cards**: `bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100`.
    -   **Gradients**: Use heavy use of gradients (Blue/Indigo, Emerald/Teal, Rose/Red) for status indicators.
    -   **Typography**: `Inter` font, heavy use of `font-black` for numbers and `font-bold` for labels.

5.  **Responsiveness**:
    -   Mobile: Stacked layout (Input -> Results).
    -   Desktop: Split layout (Input Left / Results Right).

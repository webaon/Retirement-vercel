
import os

target_file = r"c:\Users\User\1\retirement-planner-90169\app\page.tsx"

with open(target_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_marker = "export default function HomePage() {"
end_marker = "// State-Based Logic: If not logged in, show Login Screen"

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if start_marker in line:
        start_idx = i
    if end_marker in line:
        end_idx = i
        break # stop at first occurrence after start? No, scanning linearly.

if start_idx == -1 or end_idx == -1:
    print("Markers not found.")
    print(f"Start: {start_idx}, End: {end_idx}")
    exit(1)

# Logic to insert
new_content = """export default function HomePage() {
  const {
    state,
    setters,
    calculations,
    handlers
  } = useRetirementApp();

  const {
    user, planType, familyMembers, currentMemberId, showFamilyPanel,
    form, inputStep, showResult, showFamilyResult,
    gender, relation, savingMode, returnMode, retireSpendMode, allocations,
    showSumAssured, showActualSavings, showProfileCard, showAgeCard,
    showFinancialCard, showStrategyCard, showGoalCard, showInsuranceCard,
    isRelationOpen, showInsuranceTable, showExpenseModal, showTargetModal,
    showProjectedModal, showMonteCarloDetails, chartTickInterval, showActualSavingsInput,
    mcVolatility, mcSimulations, isMonteCarloOpen,
    planSaved, saveMessage, savedPlans
  } = state;

  const {
    setUser, setPlanType, setFamilyMembers, setCurrentMemberId, setShowFamilyPanel,
    setForm, setInputStep, setShowResult, setShowFamilyResult,
    setGender, setRelation, setSavingMode, setReturnMode, setRetireSpendMode, setAllocations,
    setShowSumAssured, setShowActualSavings, setShowProfileCard, setShowAgeCard,
    setShowFinancialCard, setShowStrategyCard, setShowGoalCard, setShowInsuranceCard,
    setIsRelationOpen, setShowInsuranceTable, setShowExpenseModal, setShowTargetModal,
    setShowProjectedModal, setShowMonteCarloDetails, setChartTickInterval, setShowActualSavingsInput,
    setMcVolatility, setMcSimulations, setIsMonteCarloOpen,
    setPlanSaved, setSaveMessage, setSavedPlans
  } = setters;

  const {
    inputs, result, mcResult, projectionChart, expenseChart, insuranceChartData
  } = calculations;

  const {
    handleChange, changeBy, addAllocation, removeAllocation, updateAllocation,
    addInsurancePlan, removeInsurancePlan, updateInsurancePlan, changeInsuranceBy, updateSurrenderTable,
    syncCurrentToFamily, loadMember, handleSwitchMember, handleAddMember, handleRemoveMember, getFamilySummary,
    handleSavePlan, handleLoadPlan, handleDeletePlan, resetRetirement, handleLogin, handleLogout,
    handleExportCSV, handlePrint
  } = handlers;

  const onLogin = handleLogin;
  const heroImageSrc = gender === "female" ? "/images/retirement/6.png" : "/images/retirement/5.png";
  const planButtonLabel = planSaved ? "บันทึกแผน (1/1)" : "บันทึกแผน (0/1)";

  // Derived locally for specific UI logic not in hook
  const hasData = React.useMemo(() => {
    const age = Number(String(form.currentAge).replace(/,/g, ""));
    const retire = Number(String(form.retireAge).replace(/,/g, ""));
    return age > 0 && retire > 0;
  }, [form.currentAge, form.retireAge]);

  // Re-calculate suggestedMax for Y-Axis
  const suggestedMax = React.useMemo(() => {
    if (!projectionChart?.data?.datasets) return 1000000;
    const actualData = projectionChart.data.datasets.find(d => d.label === "เงินออมคาดว่าจะมี")?.data as number[] || [];
    const requiredData = projectionChart.data.datasets.find(d => d.label === "อิสรภาพทางการเงิน")?.data as number[] || [];
    const sumAssuredData = projectionChart.data.datasets.find(d => d.label === "ทุนประกัน")?.data as number[] || [];

    const maxActual = Math.max(...actualData.map(n => Number(n) || 0));
    const maxRequired = Math.max(...requiredData.map(n => Number(n) || 0));
    const maxSumAssured = showSumAssured ? Math.max(...sumAssuredData.map(n => Number(n) || 0)) : 0;
    const maxMain = Math.max(maxActual, maxRequired, maxSumAssured);
    return Math.ceil((maxMain * 1.1) / 1000000) * 1000000;
  }, [projectionChart, showSumAssured]);

  const projectionChartOptions = React.useMemo(() => {
    const opts = getProjectionChartOptions(result, insuranceChartData, chartTickInterval, suggestedMax);
    return {
      ...opts,
      plugins: {
        ...opts.plugins,
        goalLabelPlugin: {
          goalValue: result.targetFund,
          labelText: "อิสรภาพทางการเงิน",
          formatNumber,
          chartTickInterval
        }
      }
    };
  }, [result, insuranceChartData, chartTickInterval, suggestedMax]);

  const expenseChartOptions = React.useMemo(() => getExpenseChartOptions(), []);

  // UI State Vars Mapping
  const insuranceExpanded = showInsuranceCard;
  const setInsuranceExpanded = setShowInsuranceCard;

  // Handlers mappings specific to UI toggle
  const handleAddInsurance = () => {
    setForm(prev => ({ ...prev, insuranceActive: true }));
    setShowInsuranceCard(true);
  };

  const handleDeleteInsurance = () => {
    setForm(prev => ({ ...prev, insuranceActive: false, insuranceUseSurrender: false }));
    setShowInsuranceCard(false);
  };

  """

# Keep lines BEFORE start_idx (inclusive of nothing? No, replace 'export default...' line too or keep it?)
# My new_content includes 'export default ...', so keep lines[:start_idx]
# Keep lines AFTER end_idx (inclusive of end_idx?)
# end_idx is the line with start of render logic.
# I want to KEEP the end_marker line.

final_lines = lines[:start_idx] + [new_content + "\n"] + lines[end_idx:]

with open(target_file, "w", encoding="utf-8") as f:
    f.writelines(final_lines)

print("Replacement done.")

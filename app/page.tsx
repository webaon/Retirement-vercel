
"use client";

import * as React from "react";
import { useRetirementApp } from "@/hooks/useRetirementApp";
import { LoginScreen } from "@/components/retirement/LoginScreen";
import { PlanSelectionScreen } from "@/components/retirement/PlanSelectionScreen";
import { RetirementDashboard } from "@/components/retirement/RetirementDashboard";
import { FamilyDashboard } from "@/components/retirement/FamilyDashboard";
import { RetirementInputPage } from "@/components/retirement/RetirementInputPage";
import { InsuranceTableModal } from "@/components/retirement/DashboardModals";
import { ProfileSettingsModal } from "@/components/retirement/ProfileSettingsModal";

// --- HomePage: หน้าหลัก (Entry Point) ควบคุมการเปลี่ยนหน้า (Routing Logic) ---
export default function HomePage() {
  const {
    state,
    setters,
    calculations,
    handlers
  } = useRetirementApp();

  // ดึง State ที่จำเป็นออกมาใช้
  const {
    user, planType, familyMembers, currentMemberId, showFamilyResult,
    form, gender, inputStep, showResult,
    retireSpendMode,
  } = state;

  const {
    setForm, setPlanType, setShowFamilyResult,
    setGender, setRetireSpendMode, setInputStep, setShowResult,
    setShowInsuranceTable
  } = setters;

  const {
    inputs, result, mcResult
  } = calculations;

  const {
    // Shared
    handleLogin,

    // Family
    handleSwitchMember, handleAddMember, handleRemoveMember, getFamilySummary, syncCurrentToFamily, handleConfirmDraft,

    // Dashboard / Insurance
    addInsurancePlan, removeInsurancePlan, updateInsurancePlan, updateSurrenderTable,
    handleExportExcel, handlePrint, handleChange, changeBy,

    // Allocations
    addAllocation, removeAllocation, updateAllocation
  } = handlers;

  // Scroll to top on view change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [user, planType, showFamilyResult, showResult, inputStep, currentMemberId]);

  // 1. Unauthenticated -> Login Screen (ยังไม่ล็อกอิน -> หน้าล็อกอิน)
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 2. No Plan Selected -> Plan Selection Screen (เลือกแผน: ส่วนตัว / ครอบครัว)
  if (!planType) {
    return (
      <PlanSelectionScreen
        user={user}
        onSelect={(type) => {
          setPlanType(type);
          // If family, we go to Family Dashboard
          if (type === "family") {
            setShowFamilyResult(true);
          } else {
            // Individual -> Input Page First
            setShowFamilyResult(false);
            setShowResult(false);
          }
        }}
      />
    );
  }

  // 3. Family Dashboard (หน้าภาพรวมครอบครัว)
  const activeFamilyMembers = familyMembers.filter(m => !m.isDraft);
  if (planType === "family" && showFamilyResult && activeFamilyMembers.length > 0) {
    return (
      <FamilyDashboard
        familyMembers={activeFamilyMembers}
        currentMemberId={currentMemberId}
        form={form}
        gender={state.gender}
        savingMode={state.savingMode}
        returnMode={state.returnMode}
        allocations={state.allocations}
        setPlanType={setPlanType}
        setShowFamilyResult={setShowFamilyResult}
        handleSwitchMember={handleSwitchMember}
        handleAddMember={handleAddMember}
        handleRemoveMember={handleRemoveMember}
        getFamilySummary={getFamilySummary}
        setShowResult={setters.setShowResult}
      />
    );
  }

  // 4. Input Page (หน้ากรอกข้อมูลส่วนตัว)
  if (!showResult && !showFamilyResult) {
    return (
      <>
        <RetirementInputPage
          user={user}
          form={form}
          handleChange={handleChange}
          changeBy={changeBy}
          gender={gender}
          setGender={setGender}
          setShowResult={(val) => {
            if (val) handleConfirmDraft();
            setShowResult(val);
          }}
          addInsurancePlan={addInsurancePlan}
          removeInsurancePlan={removeInsurancePlan}
          updateInsurancePlan={updateInsurancePlan}
          onViewTable={(id) => {
            if (id && typeof id === 'string') setForm(prev => ({ ...prev, selectedPlanId: id }));
            setShowInsuranceTable(true);
          }}
          savingMode={state.savingMode}
          setSavingMode={setters.setSavingMode}
          returnMode={state.returnMode}
          setReturnMode={setters.setReturnMode}
          allocations={state.allocations}
          addAllocation={addAllocation}
          removeAllocation={removeAllocation}
          updateAllocation={updateAllocation}
          onLogout={() => {
            setters.setUser(null);
            setters.setPlanType(null);
            setters.setShowResult(false);
            setters.setShowFamilyResult(false);
            setters.setInputStep(1);
            setters.setInputStep(1);
          }}
          onEditProfile={() => setters.setShowProfileSettings(true)}
          relation={planType === 'family' ? state.relation : undefined}
          setRelation={planType === 'family' && currentMemberId !== 'primary' ? (r) => setters.setRelation(r as any) : undefined}
          onBack={() => {
            if (planType === 'family' && familyMembers.length > 0) {
              setShowFamilyResult(true);
            } else {
              setPlanType(null);
            }
          }}
        />
        <ProfileSettingsModal
          isOpen={state.showProfileSettings}
          onClose={() => setters.setShowProfileSettings(false)}
          user={user}
          onSave={handlers.handleUpdateUser}
        />
        <InsuranceTableModal
          show={state.showInsuranceTable}
          onClose={() => setShowInsuranceTable(false)}
          form={form}
          addInsurancePlan={addInsurancePlan}
          removeInsurancePlan={removeInsurancePlan}
          updateInsurancePlan={updateInsurancePlan}
          updateSurrenderTable={updateSurrenderTable}
        />
      </>
    );
  }

  // 5. Main Retirement Dashboard (หน้าแดชบอร์ดผลลัพธ์ส่วนบุคคล)
  if (showResult) {
    return (
      <>
        <RetirementDashboard
          user={user}
          form={form}
          setForm={setForm}
          inputs={inputs}
          result={result}
          mcResult={mcResult}
          planType={planType}
          syncCurrentToFamily={syncCurrentToFamily}
          setShowFamilyResult={setShowFamilyResult}
          handleExportExcel={handleExportExcel}
          handlePrint={handlePrint}
          addInsurancePlan={addInsurancePlan}
          removeInsurancePlan={removeInsurancePlan}
          updateInsurancePlan={updateInsurancePlan}
          updateSurrenderTable={updateSurrenderTable}
          setRetireSpendMode={setRetireSpendMode}
          retireSpendMode={retireSpendMode}
          handleChange={handleChange}
          changeBy={changeBy}
          setGender={setGender}
          gender={gender}
          // Extended Props
          savingMode={state.savingMode}
          setSavingMode={setters.setSavingMode}
          returnMode={state.returnMode}
          setReturnMode={setters.setReturnMode}
          allocations={state.allocations}
          setAllocations={setters.setAllocations}
          addAllocation={addAllocation}
          removeAllocation={removeAllocation}
          updateAllocation={updateAllocation}
          onLogout={() => {
            setters.setUser(null);
            setters.setPlanType(null);
            setters.setShowResult(false);
            setters.setShowFamilyResult(false);
            setters.setInputStep(1);
          }}
          onEditProfile={() => setters.setShowProfileSettings(true)}
          onBack={() => {
            if (planType === 'family') {
              setters.setShowFamilyResult(true);
              setters.setShowResult(false);
            } else {
              setters.setPlanType(null);
              setters.setShowResult(false);
            }
          }}
        />
        <ProfileSettingsModal
          isOpen={state.showProfileSettings}
          onClose={() => setters.setShowProfileSettings(false)}
          user={user}
          onSave={handlers.handleUpdateUser}
        />
      </>
    );
  }
}

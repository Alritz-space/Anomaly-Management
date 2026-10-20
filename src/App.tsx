import React from 'react';
import { AnomalyProvider, useAnomaly } from './context/AnomalyContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { HomePagePortlet } from './components/pages/HomePagePortlet';
import { AnomalyDashboardPage } from './components/pages/AnomalyDashboardPage';
import { TransactionRecordPage } from './components/pages/TransactionRecordPage';
import { ConfigurationPage } from './components/pages/ConfigurationPage';
import { AuditLogPage } from './components/pages/AuditLogPage';
import { GuardrailActivityPage } from './components/pages/GuardrailActivityPage';
import { EvalsPage } from './components/pages/EvalsPage';
import { DevToolbar } from './components/common/DevToolbar';
import { UndoToast } from './components/common/UndoToast';
import { BulkConfirmationModal } from './components/common/BulkConfirmationModal';
import { NoActionAbuseNudge } from './components/common/NoActionAbuseNudge';
import { GuidedStepBanner } from './components/research/GuidedStepBanner';
import { GuidedLearningHubModal } from './components/research/GuidedLearningHubModal';
import { ResearchFeedbackModal } from './components/research/ResearchFeedbackModal';
import { TransactionAnomalyDrawer } from './components/drawers/TransactionAnomalyDrawer';
import { ExpectedMissingDrawer } from './components/drawers/ExpectedMissingDrawer';
import { InventoryAnomalyDrawer } from './components/drawers/InventoryAnomalyDrawer';
import { CustomAnomalyDrawer } from './components/drawers/CustomAnomalyDrawer';
import { TransactionModal } from './components/modals/TransactionModal';
import { EntityModal } from './components/modals/EntityModal';
import { CreateTransactionModal } from './components/modals/CreateTransactionModal';
import { RuleDetailsModal } from './components/modals/RuleDetailsModal';
import { CreateRuleModal } from './components/modals/CreateRuleModal';

const AppContent: React.FC = () => {
  const {
    activePage,
    activeDrawer,
    closeDrawer,
    selectedTransactionModal,
    closeTransactionModal,
    selectedEntityModal,
    closeEntityModal,
    createTransactionModalItem,
    closeCreateTransactionModal,
    ruleDetailsModalRule,
    closeRuleDetailsModal,
    isCreateRuleModalOpen,
    closeCreateRuleModal,
    initialTemplateForCreate,
  } = useAnomaly();

  return (
    <div className="min-h-screen bg-[#faf7f4] text-stone-900 flex flex-col font-sans antialiased selection:bg-[#f2dfd8] selection:text-[#6c281a]">
      {/* Enterprise ERP Global Navigation Header */}
      <Header />

      {/* Enterprise Guided Learning & User Research Top Banner */}
      <GuidedStepBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16">
          {activePage === 'home' && <HomePagePortlet />}
          {activePage === 'dashboard' && <AnomalyDashboardPage />}
          {activePage === 'transaction-record' && <TransactionRecordPage />}
          {activePage === 'config' && <ConfigurationPage />}
          {activePage === 'audit-log' && <AuditLogPage />}
          {activePage === 'guardrails' && <GuardrailActivityPage />}
          {activePage === 'evals' && <EvalsPage />}
        </main>
      </div>

      {/* Action Guardrails: Bulk Action Confirmation Modal */}
      <BulkConfirmationModal />

      {/* Action Guardrails: 10-Second Undo Toast */}
      <UndoToast />

      {/* Action Guardrails: No-Action Abuse Recommendation Nudge */}
      <NoActionAbuseNudge />

      {/* Developer & Governance Testing Toolbar */}
      <DevToolbar />

      {/* Guided Learning & User Research Modals */}
      <GuidedLearningHubModal />
      <ResearchFeedbackModal />

      {/* Drawers */}
      {activeDrawer?.type === 'transaction' && (
        <TransactionAnomalyDrawer
          anomaly={activeDrawer.item as any}
          onClose={closeDrawer}
        />
      )}
      {activeDrawer?.type === 'expected-missing' && (
        <ExpectedMissingDrawer
          anomaly={activeDrawer.item as any}
          onClose={closeDrawer}
        />
      )}
      {activeDrawer?.type === 'inventory' && (
        <InventoryAnomalyDrawer
          anomaly={activeDrawer.item as any}
          onClose={closeDrawer}
        />
      )}
      {activeDrawer?.type === 'custom' && (
        <CustomAnomalyDrawer
          anomaly={activeDrawer.item as any}
          onClose={closeDrawer}
        />
      )}

      {/* Modals */}
      {selectedTransactionModal && (
        <TransactionModal
          transaction={selectedTransactionModal}
          onClose={closeTransactionModal}
        />
      )}
      {selectedEntityModal && (
        <EntityModal
          entity={selectedEntityModal}
          onClose={closeEntityModal}
        />
      )}
      {createTransactionModalItem && (
        <CreateTransactionModal
          anomaly={createTransactionModalItem}
          onClose={closeCreateTransactionModal}
        />
      )}
      {ruleDetailsModalRule && (
        <RuleDetailsModal
          rule={ruleDetailsModalRule}
          onClose={closeRuleDetailsModal}
        />
      )}
      {isCreateRuleModalOpen && (
        <CreateRuleModal
          initialTemplate={initialTemplateForCreate}
          onClose={closeCreateRuleModal}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AnomalyProvider>
      <AppContent />
    </AnomalyProvider>
  );
}

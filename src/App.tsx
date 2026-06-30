import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './shell/AppShell';
import ScheduleScreen from './modules/schedule/ScheduleScreen';
import InboxScreen from './modules/inbox/InboxScreen';
import PatientsScreen from './modules/patients/PatientsScreen';
import DocumentsScreen from './modules/documents/DocumentsScreen';
import ChartShell from './modules/chart/ChartShell';
import SummaryTab from './modules/chart/SummaryTab';
import NotesTab from './modules/chart/notes/NotesTab';
import OrdersTab from './modules/chart/orders/OrdersTab';
import MedsTab from './modules/chart/MedsTab';
import ResultsTab from './modules/chart/ResultsTab';
import ProblemsTab from './modules/chart/ProblemsTab';
import {
  ImagingTab, ChartDocsTab, MessagesTab, ReferralsTab, CareGapsTab,
} from './modules/chart/SecondaryTabs';
import BillingTab from './modules/chart/BillingTab';
import {
  SnapshotTab, ChartReviewTab, FlowsheetsTab, HistoryTab, ImmunizationsTab,
  AllergiesTab, HealthMaintenanceTab, DemographicsTab, CoverageTab, LettersTab,
  MediaTab, AuditTab,
} from './modules/chart/MoreTabs';
import TendApp from './tend/TendApp';

export default function App() {
  return (
    <Routes>
      {/* The new AI-native EHR ("Tend") — its own full-screen surface, no HeliosChart shell */}
      <Route path="/tend" element={<TendApp />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/schedule" replace />} />
        <Route path="schedule" element={<ScheduleScreen />} />
        <Route path="inbox" element={<InboxScreen />} />
        <Route path="patients" element={<PatientsScreen />} />
        <Route path="documents" element={<DocumentsScreen />} />
        <Route path="chart/:patientId" element={<ChartShell />}>
          <Route index element={<Navigate to="snapshot" replace />} />
          <Route path="snapshot" element={<SnapshotTab />} />
          <Route path="summary" element={<SummaryTab />} />
          <Route path="chart-review" element={<ChartReviewTab />} />
          <Route path="notes" element={<NotesTab />} />
          <Route path="problems" element={<ProblemsTab />} />
          <Route path="meds" element={<MedsTab />} />
          <Route path="orders" element={<OrdersTab />} />
          <Route path="results" element={<ResultsTab />} />
          <Route path="imaging" element={<ImagingTab />} />
          <Route path="documents" element={<ChartDocsTab />} />
          <Route path="messages" element={<MessagesTab />} />
          <Route path="referrals" element={<ReferralsTab />} />
          <Route path="care-gaps" element={<CareGapsTab />} />
          <Route path="billing" element={<BillingTab />} />
          <Route path="flowsheets" element={<FlowsheetsTab />} />
          <Route path="history" element={<HistoryTab />} />
          <Route path="immunizations" element={<ImmunizationsTab />} />
          <Route path="allergies" element={<AllergiesTab />} />
          <Route path="health-maintenance" element={<HealthMaintenanceTab />} />
          <Route path="demographics" element={<DemographicsTab />} />
          <Route path="coverage" element={<CoverageTab />} />
          <Route path="letters" element={<LettersTab />} />
          <Route path="media" element={<MediaTab />} />
          <Route path="audit" element={<AuditTab />} />
        </Route>
        <Route path="*" element={<Navigate to="/schedule" replace />} />
      </Route>
    </Routes>
  );
}

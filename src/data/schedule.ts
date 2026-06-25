import type { Appointment } from '../types';

// A realistic-looking clinic day. Maria Thompson is the 9:20 follow-up.
export const SCHEDULE: Appointment[] = [
  { id: 'a1', time: '08:00', patientId: 'GT-100201', patientName: 'Alvarez, Robert', dob: '1948-11-02', age: 77, visitType: 'Wellness Visit', status: 'complete', provider: 'Okafor, James MD', location: 'Clinic A — Rm 3' },
  { id: 'a2', time: '08:40', patientId: 'GT-100455', patientName: 'Nguyen, Linh', dob: '1991-07-19', age: 34, visitType: 'Acute — URI', status: 'complete', provider: 'Okafor, James MD', location: 'Clinic A — Rm 1' },
  { id: 'a3', time: '09:00', patientId: 'GT-100789', patientName: 'Patel, Devang', dob: '1972-01-30', age: 54, visitType: 'DM Follow-up', status: 'roomed', provider: 'Okafor, James MD', location: 'Clinic A — Rm 2' },
  { id: 'a4', time: '09:20', patientId: 'FT-483920', patientName: 'Thompson, Maria', dob: '1959-04-12', age: 67, visitType: 'HTN / DM Follow-up', status: 'arrived', provider: 'Okafor, James MD', location: 'Clinic A — Rm 4' },
  { id: 'a5', time: '09:40', patientId: 'GT-100912', patientName: 'Walsh, Eleanor', dob: '1955-03-08', age: 71, visitType: 'Med Recheck', status: 'scheduled', provider: 'Okafor, James MD', location: 'Clinic A — Rm 1' },
  { id: 'a6', time: '10:00', patientId: 'GT-101044', patientName: 'Brooks, Terrence', dob: '1983-12-14', age: 42, visitType: 'New Patient', status: 'late', provider: 'Okafor, James MD', location: 'Clinic A — Rm 3' },
  { id: 'a7', time: '10:20', patientId: 'GT-101188', patientName: 'Romero, Gabriela', dob: '2001-05-22', age: 25, visitType: 'Annual Physical', status: 'scheduled', provider: 'Okafor, James MD', location: 'Clinic A — Rm 2' },
  { id: 'a8', time: '10:40', patientId: 'GT-101300', patientName: 'Fischer, Karl', dob: '1968-09-09', age: 57, visitType: 'BP Check', status: 'no-show', provider: 'Okafor, James MD', location: 'Clinic A — Rm 4' },
  { id: 'a9', time: '11:00', patientId: 'GT-101455', patientName: 'Osei, Ama', dob: '1979-02-17', age: 47, visitType: 'Lab Review', status: 'scheduled', provider: 'Okafor, James MD', location: 'Clinic A — Rm 1' },
  { id: 'a10', time: '11:20', patientId: 'GT-101677', patientName: 'Delgado, Hector', dob: '1944-08-25', age: 81, visitType: 'CHF Follow-up', status: 'scheduled', provider: 'Okafor, James MD', location: 'Clinic A — Rm 3' },
];

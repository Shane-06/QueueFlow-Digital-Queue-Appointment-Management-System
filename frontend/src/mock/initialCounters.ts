import { Counter } from '../types';

export const INITIAL_COUNTERS: Counter[] = [
  {
    id: 'cnt-1',
    name: 'Counter 1',
    counterNumber: 1,
    location: 'Admin Block Ground Floor - Hall A',
    status: 'ACTIVE',
    assignedServiceIds: ['srv-3'], // Fee & Accounts Assistance
    assignedStaffId: 'usr-staff-2',
    assignedStaffName: 'Ananya Sen',
    currentTokenNo: 'FA-012',
    currentQueueEntryId: 'q-fa-012',
  },
  {
    id: 'cnt-2',
    name: 'Counter 2',
    counterNumber: 2,
    location: 'Admin Block Ground Floor - Hall A',
    status: 'ACTIVE',
    assignedServiceIds: ['srv-1', 'srv-2'], // Transcript Verification, Bonafide Certificate
    assignedStaffId: 'usr-staff-1',
    assignedStaffName: 'Rajesh Kumar',
    currentTokenNo: 'TV-019',
    currentQueueEntryId: 'q-tv-019',
  },
  {
    id: 'cnt-3',
    name: 'Counter 3',
    counterNumber: 3,
    location: 'Admin Block 2nd Floor - Room 204',
    status: 'ACTIVE',
    assignedServiceIds: ['srv-4', 'srv-8'], // Scholarship, Grievance
    assignedStaffId: 'usr-staff-3',
    assignedStaffName: 'Vikram Joshi',
    currentTokenNo: 'SV-008',
    currentQueueEntryId: 'q-sv-008',
  },
  {
    id: 'cnt-4',
    name: 'Counter 4',
    counterNumber: 4,
    location: 'Main Gate Annex Room 3',
    status: 'ACTIVE',
    assignedServiceIds: ['srv-6'], // ID Card
    assignedStaffId: undefined,
    assignedStaffName: 'Suman Roy (Operator)',
    currentTokenNo: 'IC-045',
    currentQueueEntryId: 'q-ic-045',
  },
  {
    id: 'cnt-5',
    name: 'Counter 5',
    counterNumber: 5,
    location: 'Controller of Exams - Exam Block',
    status: 'ACTIVE',
    assignedServiceIds: ['srv-7'], // Exam Office
    assignedStaffId: undefined,
    assignedStaffName: 'Meera Nair (Senior Assistant)',
    currentTokenNo: 'EO-014',
    currentQueueEntryId: 'q-eo-014',
  },
  {
    id: 'cnt-6',
    name: 'Counter 6',
    counterNumber: 6,
    location: 'Hostel Administration Center',
    status: 'INACTIVE',
    assignedServiceIds: ['srv-5'], // Hostel Office
    assignedStaffId: undefined,
    assignedStaffName: undefined,
    currentTokenNo: undefined,
    currentQueueEntryId: undefined,
  },
];

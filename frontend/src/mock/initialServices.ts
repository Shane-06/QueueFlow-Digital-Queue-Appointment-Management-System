import { Service } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Transcript Verification',
    code: 'TV',
    description: 'Official academic transcript attestation, duplicate marksheet issuance, and grade card verification.',
    office: 'Academic Affairs (Admin Block - Room 102)',
    durationMinutes: 15,
    dailyCapacity: 40,
    appointmentEnabled: true,
    walkInEnabled: true,
    status: 'ACTIVE',
    requiredDocuments: [
      'Original Semester Grade Sheets',
      'Student Identity Card',
      'Fee Clearance Receipt',
      'Written Application Form'
    ],
  },
  {
    id: 'srv-2',
    name: 'Bonafide Certificate',
    code: 'BC',
    description: 'Issuance of bonafide letters for bank loans, passport applications, internships, and visa purposes.',
    office: 'Student Records Section (Hall B)',
    durationMinutes: 10,
    dailyCapacity: 60,
    appointmentEnabled: true,
    walkInEnabled: true,
    status: 'ACTIVE',
    requiredDocuments: [
      'Current Semester Registration Card',
      'College ID Card'
    ],
  },
  {
    id: 'srv-3',
    name: 'Fee & Accounts Assistance',
    code: 'FA',
    description: 'Tuition fee receipts, installment approval queries, scholarship adjustments, and no-dues verification.',
    office: 'Finance & Accounts Office (Block C - Ground Floor)',
    durationMinutes: 20,
    dailyCapacity: 35,
    appointmentEnabled: true,
    walkInEnabled: true,
    status: 'ACTIVE',
    requiredDocuments: [
      'Bank Challan / Online Payment Receipt',
      'Fee Demand Note',
      'College ID Card'
    ],
  },
  {
    id: 'srv-4',
    name: 'Scholarship Verification',
    code: 'SV',
    description: 'National and state scholarship portal document vetting, merit-cum-means endorsement, and biometric auth.',
    office: 'Dean of Student Welfare Office (Room 204)',
    durationMinutes: 25,
    dailyCapacity: 25,
    appointmentEnabled: true,
    walkInEnabled: false,
    status: 'ACTIVE',
    requiredDocuments: [
      'National Scholarship Portal (NSP) Application Copy',
      'Income Certificate & Caste Certificate (if applicable)',
      'Aadhaar Card Linked Bank Passbook Copy'
    ],
  },
  {
    id: 'srv-5',
    name: 'Hostel Office Assistance',
    code: 'HO',
    description: 'Room allotment inquiries, hostel fee payment verification, mess rebate processing, and gate pass clearances.',
    office: 'Hostel Administration Center (Near Boys Hostel 2)',
    durationMinutes: 15,
    dailyCapacity: 45,
    appointmentEnabled: true,
    walkInEnabled: true,
    status: 'ACTIVE',
    requiredDocuments: [
      'Hostel Allotment Slip',
      'Mess Fee Receipt',
      'Parent Consent Form (for room change)'
    ],
  },
  {
    id: 'srv-6',
    name: 'ID Card & Badge Services',
    code: 'IC',
    description: 'New RFID student identity card issuance, lost ID card replacement, and library barcode re-encoding.',
    office: 'Security & Card Issuing Center (Main Gate Annex)',
    durationMinutes: 10,
    dailyCapacity: 80,
    appointmentEnabled: false,
    walkInEnabled: true,
    status: 'ACTIVE',
    requiredDocuments: [
      'Admission Confirmation Letter',
      'Police Complaint Copy (for lost card)',
      'Replacement Fee Challan'
    ],
  },
  {
    id: 'srv-7',
    name: 'Examination Office Inquiries',
    code: 'EO',
    description: 'Admit card correction, backlog exam registration, grade re-evaluation form submission, and name correction.',
    office: 'Controller of Examinations (Exam Block Floor 1)',
    durationMinutes: 20,
    dailyCapacity: 30,
    appointmentEnabled: true,
    walkInEnabled: true,
    status: 'ACTIVE',
    requiredDocuments: [
      'Exam Registration Acknowledgement',
      'Class 10 Certificate (for name correction)',
      'Previous Grade Sheet Copy'
    ],
  },
  {
    id: 'srv-8',
    name: 'Student Affairs Grievance',
    code: 'SA',
    description: 'Grievance redressal consultation, club and event budget approval, and student council petitions.',
    office: 'Student Welfare Cell (Block A - Room 108)',
    durationMinutes: 30,
    dailyCapacity: 15,
    appointmentEnabled: true,
    walkInEnabled: false,
    status: 'ACTIVE',
    requiredDocuments: [
      'Formal Petition Letter',
      'Supporting Departmental Endorsement'
    ],
  },
];

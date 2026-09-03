import {
  ActivityLogEntry,
  AlertItem,
  CategoryBreakdown,
  DashboardSummary,
  RiskHistoryPoint,
} from '@/types';
import { colors } from '@/theme/theme';

export const dashboardSummary: DashboardSummary = {
  currentRiskScore: 32,
  riskLevel: 'low',
  eventsToday: 128,
  activeDevices: 3,
  openAlerts: 2,
  lastScan: new Date().toISOString(),
};

export const riskHistory: RiskHistoryPoint[] = [
  { label: 'Mon', score: 18 },
  { label: 'Tue', score: 24 },
  { label: 'Wed', score: 21 },
  { label: 'Thu', score: 46 },
  { label: 'Fri', score: 38 },
  { label: 'Sat', score: 29 },
  { label: 'Sun', score: 32 },
];

export const categoryBreakdown: CategoryBreakdown[] = [
  { label: 'Login events', value: 42, color: colors.accent },
  { label: 'File access', value: 26, color: colors.riskLow },
  { label: 'Vision alerts', value: 14, color: colors.riskMedium },
  { label: 'Network', value: 18, color: colors.riskHigh },
];

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export const activityLog: ActivityLogEntry[] = [
  {
    id: 'a1',
    title: 'Unrecognized face detected',
    description: 'Webcam monitor flagged an unrecognized face near the workstation.',
    source: 'vision',
    risk: 'high',
    timestamp: hoursAgo(0.4),
    device: 'Office PC — Cam 1',
  },
  {
    id: 'a2',
    title: 'New device login',
    description: 'Successful login from a device not seen in the last 30 days.',
    source: 'login',
    risk: 'medium',
    timestamp: hoursAgo(1.2),
    device: 'Laptop — Eliza',
  },
  {
    id: 'a3',
    title: 'Large file transfer',
    description: '1.2 GB moved to an external USB drive.',
    source: 'system',
    risk: 'medium',
    timestamp: hoursAgo(3),
    device: 'Workstation 02',
  },
  {
    id: 'a4',
    title: 'Routine backup completed',
    description: 'Scheduled backup finished with no anomalies.',
    source: 'system',
    risk: 'low',
    timestamp: hoursAgo(4.5),
    device: 'Server — Backup Node',
  },
  {
    id: 'a5',
    title: 'Repeated failed logins',
    description: '5 failed password attempts within 2 minutes.',
    source: 'login',
    risk: 'critical',
    timestamp: hoursAgo(6),
    device: 'Office PC — Front Desk',
  },
  {
    id: 'a6',
    title: 'Outbound connection to new host',
    description: 'Network traffic detected to a previously unseen IP address.',
    source: 'network',
    risk: 'medium',
    timestamp: hoursAgo(9),
    device: 'Workstation 02',
  },
  {
    id: 'a7',
    title: 'Motion detected after hours',
    description: 'Camera activity logged outside of expected working hours.',
    source: 'vision',
    risk: 'low',
    timestamp: hoursAgo(14),
    device: 'Office PC — Cam 1',
  },
  {
    id: 'a8',
    title: 'Software installation',
    description: 'New application installed by an admin account.',
    source: 'system',
    risk: 'low',
    timestamp: hoursAgo(20),
    device: 'Laptop — Clifford',
  },
];

export const alerts: AlertItem[] = [
  {
    id: 'al1',
    title: 'Critical: repeated failed logins',
    description:
      'Five consecutive failed login attempts on the Front Desk PC. Possible brute-force attempt.',
    risk: 'critical',
    timestamp: hoursAgo(6),
    acknowledged: false,
    device: 'Office PC — Front Desk',
  },
  {
    id: 'al2',
    title: 'Unrecognized face at workstation',
    description: 'Computer vision module flagged a face not present in the trusted profile set.',
    risk: 'high',
    timestamp: hoursAgo(0.4),
    acknowledged: false,
    device: 'Office PC — Cam 1',
  },
  {
    id: 'al3',
    title: 'New device login approved',
    description: 'A login from an unfamiliar device was allowed after verification.',
    risk: 'medium',
    timestamp: hoursAgo(1.2),
    acknowledged: true,
    device: 'Laptop — Eliza',
  },
  {
    id: 'al4',
    title: 'Large outbound transfer',
    description: 'Unusually large data transfer flagged for review.',
    risk: 'medium',
    timestamp: hoursAgo(3),
    acknowledged: true,
    device: 'Workstation 02',
  },
];

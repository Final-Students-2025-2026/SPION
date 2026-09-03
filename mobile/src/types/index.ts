export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ActivitySource = 'vision' | 'system' | 'network' | 'login';

export interface ActivityLogEntry {
  id: string;
  title: string;
  description: string;
  source: ActivitySource;
  risk: RiskLevel;
  timestamp: string; // ISO string
  device: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  risk: RiskLevel;
  timestamp: string;
  acknowledged: boolean;
  device: string;
}

export interface RiskHistoryPoint {
  label: string; // e.g. day label
  score: number; // 0-100
}

export interface CategoryBreakdown {
  label: string;
  value: number;
  color: string;
}

export interface DashboardSummary {
  currentRiskScore: number;
  riskLevel: RiskLevel;
  eventsToday: number;
  activeDevices: number;
  openAlerts: number;
  lastScan: string;
}

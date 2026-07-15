export type Platform = "VM" | "Kubernetes";

export type Severity = "Critical" | "High" | "Medium" | "Low" | "None";

export type ComplianceStatus = "Compliant" | "Behind" | "Critical";

/**
 * A single database instance/target, as it would be assembled by joining:
 *  - CMDB Connector / Sync Adapter (name, platform, engine)
 *  - Patch State Store            (currentVersion, lastPatched, nextWindow)
 *  - Patch Catalog & OEM Repo Integration (latestVersion, cvesOutstanding, highestSeverity)
 */
export interface FleetAsset {
  id: string;
  name: string;
  platform: Platform;
  engine: string;
  currentVersion: string;
  latestVersion: string;
  cvesOutstanding: number;
  highestSeverity: Severity;
  lastPatched: string; // ISO date
  nextWindow: string; // ISO date
  status: ComplianceStatus;
}

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface PlatformBreakdown {
  vm: number;
  kubernetes: number;
}

export interface ComplianceSummary {
  totalAssets: number;
  compliantPercent: number;
  criticalCves: number;
  jobsScheduledThisWeek: number;
  severityBreakdown: SeverityBreakdown;
  platformBreakdown: PlatformBreakdown;
  generatedAt: string; // ISO datetime
}

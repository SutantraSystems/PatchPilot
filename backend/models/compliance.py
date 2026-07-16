"""
Mirrors src/types/compliance.ts on the Web UI side, field-for-field. Model
fields are intentionally camelCase (not the usual Python snake_case) so the
JSON on the wire matches the existing TypeScript contract exactly — the
frontend doesn't need to change to consume this service instead of the old
Next.js API routes.
"""

from enum import Enum
from pydantic import BaseModel


class Platform(str, Enum):
    VM = "VM"
    KUBERNETES = "Kubernetes"


class Severity(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    NONE = "None"


class ComplianceStatus(str, Enum):
    COMPLIANT = "Compliant"
    BEHIND = "Behind"
    CRITICAL = "Critical"


class FleetAsset(BaseModel):
    """
    A single database instance/target, as it would be assembled by joining:
      - CMDB Connector / Sync Adapter (name, platform, engine)
      - Patch State Store            (currentVersion, lastPatched, nextWindow)
      - Patch Catalog & OEM Repo Integration (latestVersion, cvesOutstanding, highestSeverity)
    """

    id: str
    name: str
    platform: Platform
    engine: str
    currentVersion: str
    latestVersion: str
    cvesOutstanding: int
    highestSeverity: Severity
    lastPatched: str  # ISO date
    nextWindow: str  # ISO date
    status: ComplianceStatus


class SeverityBreakdown(BaseModel):
    critical: int
    high: int
    medium: int
    low: int


class PlatformBreakdown(BaseModel):
    vm: int
    kubernetes: int


class ComplianceSummary(BaseModel):
    totalAssets: int
    compliantPercent: int
    criticalCves: int
    jobsScheduledThisWeek: int
    severityBreakdown: SeverityBreakdown
    platformBreakdown: PlatformBreakdown
    generatedAt: str  # ISO datetime

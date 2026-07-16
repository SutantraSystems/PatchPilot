"""
Temporary in-process data source — the Python equivalent of the Web UI's
src/lib/fleetData.ts, ported field-for-field so both implementations
produce identical responses.

Stands in for the real join across the CMDB Connector, Patch State Store,
and Patch Catalog & OEM Repo Integration services. Once those exist, only
`get_fleet_assets()` needs to change to call out to them instead of
returning this fixture list.
"""

from datetime import datetime, timezone
from typing import List, Optional

from models.compliance import ComplianceSummary, FleetAsset, Severity

FLEET_ASSETS: List[FleetAsset] = [
    FleetAsset(
        id="vm-ora-prod-01", name="ora-prod-01", platform="VM", engine="Oracle 19c",
        currentVersion="19.21.0", latestVersion="19.24.0", cvesOutstanding=3,
        highestSeverity=Severity.CRITICAL, lastPatched="2026-04-02", nextWindow="2026-07-19",
        status="Critical",
    ),
    FleetAsset(
        id="vm-pg-billing-01", name="pg-billing-01", platform="VM", engine="PostgreSQL 15",
        currentVersion="15.6", latestVersion="15.8", cvesOutstanding=1,
        highestSeverity=Severity.HIGH, lastPatched="2026-05-14", nextWindow="2026-07-20",
        status="Behind",
    ),
    FleetAsset(
        id="vm-mysql-crm-01", name="mysql-crm-01", platform="VM", engine="MySQL 8.0",
        currentVersion="8.0.37", latestVersion="8.0.37", cvesOutstanding=0,
        highestSeverity=Severity.NONE, lastPatched="2026-06-30", nextWindow="2026-08-15",
        status="Compliant",
    ),
    FleetAsset(
        id="vm-mssql-fin-01", name="mssql-fin-01", platform="VM", engine="SQL Server 2022",
        currentVersion="CU12", latestVersion="CU14", cvesOutstanding=2,
        highestSeverity=Severity.HIGH, lastPatched="2026-03-28", nextWindow="2026-07-21",
        status="Behind",
    ),
    FleetAsset(
        id="vm-ora-prod-02", name="ora-prod-02", platform="VM", engine="Oracle 19c",
        currentVersion="19.23.0", latestVersion="19.24.0", cvesOutstanding=1,
        highestSeverity=Severity.MEDIUM, lastPatched="2026-06-18", nextWindow="2026-07-19",
        status="Behind",
    ),
    FleetAsset(
        id="vm-pg-reporting-01", name="pg-reporting-01", platform="VM", engine="PostgreSQL 16",
        currentVersion="16.3", latestVersion="16.3", cvesOutstanding=0,
        highestSeverity=Severity.NONE, lastPatched="2026-07-01", nextWindow="2026-08-15",
        status="Compliant",
    ),
    FleetAsset(
        id="k8s-pg-checkout-01", name="pg-checkout (cnpg-cluster-01)", platform="Kubernetes",
        engine="PostgreSQL 16 (CloudNativePG)", currentVersion="16.2", latestVersion="16.3",
        cvesOutstanding=1, highestSeverity=Severity.MEDIUM, lastPatched="2026-06-10",
        nextWindow="2026-07-22", status="Behind",
    ),
    FleetAsset(
        id="k8s-mongo-catalog-01", name="mongo-catalog (percona-psmdb-01)", platform="Kubernetes",
        engine="MongoDB 7.0 (Percona Operator)", currentVersion="7.0.11", latestVersion="7.0.14",
        cvesOutstanding=4, highestSeverity=Severity.CRITICAL, lastPatched="2026-04-22",
        nextWindow="2026-07-19", status="Critical",
    ),
    FleetAsset(
        id="k8s-pg-sessions-01", name="pg-sessions (zalando-pg-01)", platform="Kubernetes",
        engine="PostgreSQL 15 (Zalando Operator)", currentVersion="15.7", latestVersion="15.8",
        cvesOutstanding=1, highestSeverity=Severity.HIGH, lastPatched="2026-05-30",
        nextWindow="2026-07-20", status="Behind",
    ),
    FleetAsset(
        id="k8s-pg-analytics-01", name="pg-analytics (cnpg-cluster-02)", platform="Kubernetes",
        engine="PostgreSQL 16 (CloudNativePG)", currentVersion="16.3", latestVersion="16.3",
        cvesOutstanding=0, highestSeverity=Severity.NONE, lastPatched="2026-07-05",
        nextWindow="2026-08-16", status="Compliant",
    ),
    FleetAsset(
        id="vm-ora-dr-01", name="ora-dr-01", platform="VM", engine="Oracle 19c",
        currentVersion="19.24.0", latestVersion="19.24.0", cvesOutstanding=0,
        highestSeverity=Severity.NONE, lastPatched="2026-07-10", nextWindow="2026-08-19",
        status="Compliant",
    ),
    FleetAsset(
        id="k8s-mysql-inventory-01", name="mysql-inventory (percona-xtradb-01)", platform="Kubernetes",
        engine="MySQL 8.0 (Percona Operator)", currentVersion="8.0.35", latestVersion="8.0.37",
        cvesOutstanding=2, highestSeverity=Severity.HIGH, lastPatched="2026-05-02",
        nextWindow="2026-07-21", status="Behind",
    ),
]

# Number of patch jobs the Job Orchestrator has scheduled for the current
# week. In the real system this would come from that service; kept as a
# simple constant here since the Job Orchestrator UI isn't in scope yet.
JOBS_SCHEDULED_THIS_WEEK = 6


def get_fleet_assets() -> List[FleetAsset]:
    return FLEET_ASSETS


def get_fleet_assets_by_status(status: Optional[str]) -> List[FleetAsset]:
    if not status or status == "All":
        return FLEET_ASSETS
    return [a for a in FLEET_ASSETS if a.status.value.lower() == status.lower()]


_SEVERITY_RANK = {
    Severity.CRITICAL: 4,
    Severity.HIGH: 3,
    Severity.MEDIUM: 2,
    Severity.LOW: 1,
    Severity.NONE: 0,
}


def get_compliance_summary() -> ComplianceSummary:
    assets = FLEET_ASSETS
    total_assets = len(assets)
    compliant_count = sum(1 for a in assets if a.status.value == "Compliant")

    severity_breakdown = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for asset in assets:
        if asset.highestSeverity == Severity.CRITICAL:
            severity_breakdown["critical"] += asset.cvesOutstanding
        elif asset.highestSeverity == Severity.HIGH:
            severity_breakdown["high"] += asset.cvesOutstanding
        elif asset.highestSeverity == Severity.MEDIUM:
            severity_breakdown["medium"] += asset.cvesOutstanding
        elif asset.highestSeverity == Severity.LOW:
            severity_breakdown["low"] += asset.cvesOutstanding

    platform_breakdown = {"vm": 0, "kubernetes": 0}
    for asset in assets:
        if asset.platform.value == "VM":
            platform_breakdown["vm"] += 1
        else:
            platform_breakdown["kubernetes"] += 1

    critical_cves = sum(
        a.cvesOutstanding
        for a in assets
        if _SEVERITY_RANK[a.highestSeverity] == _SEVERITY_RANK[Severity.CRITICAL]
    )

    return ComplianceSummary(
        totalAssets=total_assets,
        compliantPercent=round((compliant_count / total_assets) * 100),
        criticalCves=critical_cves,
        jobsScheduledThisWeek=JOBS_SCHEDULED_THIS_WEEK,
        severityBreakdown=severity_breakdown,
        platformBreakdown=platform_breakdown,
        generatedAt=datetime.now(timezone.utc).isoformat(),
    )

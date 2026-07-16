from typing import List, Optional

from fastapi import APIRouter

from data.fleet_data import get_compliance_summary, get_fleet_assets_by_status
from models.compliance import ComplianceSummary, FleetAsset

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.get("/summary", response_model=ComplianceSummary)
def summary() -> ComplianceSummary:
    """Fleet-wide compliance KPIs for the dashboard's summary cards and severity chart."""
    return get_compliance_summary()


@router.get("/fleet", response_model=List[FleetAsset])
def fleet(status: Optional[str] = None) -> List[FleetAsset]:
    """
    Per-asset compliance rows: one entry per VM- or Kubernetes-hosted
    database, with current vs. latest patch version and outstanding CVEs.
    Also used by the Inventory / target picker screen.
    """
    return get_fleet_assets_by_status(status)

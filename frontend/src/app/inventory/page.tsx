import InventoryTable from "@/components/InventoryTable";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every VM- and Kubernetes-hosted database in the fleet. Select
          targets to schedule a patch job.
        </p>
      </div>
      <InventoryTable />
    </div>
  );
}

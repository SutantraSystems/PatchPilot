import JobsTable from "@/components/JobsTable";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Patch Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every patch job across the VM and Kubernetes fleets, from request
          through rollout.
        </p>
      </div>
      <JobsTable />
    </div>
  );
}

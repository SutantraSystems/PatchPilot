import ApprovalQueue from "@/components/ApprovalQueue";

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Approval Queue
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Patch jobs awaiting a decision before they're scheduled.
        </p>
      </div>
      <ApprovalQueue />
    </div>
  );
}

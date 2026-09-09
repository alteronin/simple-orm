export function EmptyState({ recordTypeName }: { recordTypeName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-lg font-semibold text-text">No {recordTypeName} yet</h3>
      <p className="text-text-muted mt-2 text-sm">Create your first {recordTypeName.toLowerCase()} to get started</p>
    </div>
  )
}

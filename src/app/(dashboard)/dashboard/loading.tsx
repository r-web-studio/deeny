export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 md:w-64 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 bg-muted/50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

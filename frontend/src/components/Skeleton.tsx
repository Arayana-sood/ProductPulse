export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-console-border-light rounded-sm ${className}`}></div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      <div className="h-8 bg-console-border-light w-1/4 rounded-sm"></div>
      <div className="h-4 bg-console-border-light w-1/6 rounded-sm mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-console-border-light rounded-sm"></div>
        <div className="h-32 bg-console-border-light rounded-sm"></div>
        <div className="h-32 bg-console-border-light rounded-sm"></div>
      </div>
      <div className="h-64 bg-console-border-light rounded-sm"></div>
    </div>
  );
}

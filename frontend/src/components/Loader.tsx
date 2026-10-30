import { Loader2 } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <p className="text-slate-500">Loading data...</p>
    </div>
  );
}

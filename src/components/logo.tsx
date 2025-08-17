import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
      <PawPrint className="h-6 w-6" />
      <span className="text-xl font-semibold">称重数据看板</span>
    </div>
  );
}

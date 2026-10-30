import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface-white rounded-none border border-surface-subtle p-8 ${className}`}>
      {title && (
        <h3 className="text-xs uppercase tracking-widest font-semibold text-charcoal-500 mb-6">
          {title}
        </h3>
      )}
      <div>
        {children}
      </div>
    </div>
  );
}

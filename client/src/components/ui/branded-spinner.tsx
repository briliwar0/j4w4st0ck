import React from 'react';
import { cn } from '@/lib/utils';

interface BrandedSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandedSpinner({ size = 'md', className }: BrandedSpinnerProps) {
  // Size class mapping
  const sizeClasses = {
    xs: 'h-3 w-3 border-2',
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'rounded-full border-primary border-t-transparent animate-spin',
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}
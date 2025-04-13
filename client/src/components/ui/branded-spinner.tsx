import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        xs: "h-4 w-4 border-2",
        sm: "h-6 w-6 border-2",
        md: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-3",
        xl: "h-16 w-16 border-4",
      },
      variant: {
        primary: "text-primary",
        secondary: "text-secondary",
        brand: "border-b-primary border-l-amber-500 border-t-secondary border-r-transparent",
        success: "text-green-500",
        danger: "text-red-500",
        warning: "text-amber-500", 
        info: "text-blue-500",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "brand",
    },
  }
);

export interface BrandedSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const BrandedSpinner = React.forwardRef<HTMLDivElement, BrandedSpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div className="flex flex-col items-center justify-center gap-2" ref={ref} {...props}>
        <div
          className={cn(spinnerVariants({ size, variant, className }))}
          role="status"
          aria-label={label || "Loading"}
        >
          <span className="sr-only">{label || "Loading..."}</span>
        </div>
        {label && <p className="text-sm text-neutral-600">{label}</p>}
      </div>
    );
  }
);
BrandedSpinner.displayName = "BrandedSpinner";

export { BrandedSpinner, spinnerVariants };
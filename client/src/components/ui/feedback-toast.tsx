import React from "react";
import { toast as showToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, InfoIcon, XCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const feedbackVariants = cva(
  "group relative w-full rounded-lg border p-4 pr-10 shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200",
        success: "bg-green-50 border-green-200 text-green-900",
        error: "bg-red-50 border-red-200 text-red-900",
        warning: "bg-amber-50 border-amber-200 text-amber-900",
        info: "bg-blue-50 border-blue-200 text-blue-900", 
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconVariants = cva("h-5 w-5", {
  variants: {
    variant: {
      default: "text-gray-500",
      success: "text-green-500",
      error: "text-red-500",
      warning: "text-amber-500",
      info: "text-blue-500", 
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const titleVariants = cva("font-medium text-sm mb-1", {
  variants: {
    variant: {
      default: "text-gray-900",
      success: "text-green-900",
      error: "text-red-900",
      warning: "text-amber-900",
      info: "text-blue-900", 
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const messageVariants = cva("text-sm", {
  variants: {
    variant: {
      default: "text-gray-600",
      success: "text-green-700",
      error: "text-red-700",
      warning: "text-amber-700",
      info: "text-blue-700", 
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type FeedbackVariant = "default" | "success" | "error" | "warning" | "info";

interface FeedbackToastProps {
  title: string;
  message: string;
  variant?: FeedbackVariant;
  duration?: number;
  action?: React.ReactNode;
}

// Ekspor fungsi toast yang dapat digunakan di seluruh aplikasi
export function feedbackToast({
  title,
  message,
  variant = "default",
  duration = 5000,
  action,
}: FeedbackToastProps) {
  return showToast({
    title: title,
    description: (
      <div className="flex w-full flex-col space-y-1">
        <span className={cn(messageVariants({ variant }), "flex items-center gap-2")}>
          {getIcon(variant)}
          {message}
        </span>
        {action && <div className="mt-2">{action}</div>}
      </div>
    ),
    duration: duration,
    className: cn(feedbackVariants({ variant })),
  });
}

// Helper untuk mendapatkan icon berdasarkan variant
function getIcon(variant: FeedbackVariant) {
  switch (variant) {
    case "success":
      return <CheckCircle2 className={cn(iconVariants({ variant }))} />;
    case "error":
      return <XCircle className={cn(iconVariants({ variant }))} />;
    case "warning":
      return <AlertCircle className={cn(iconVariants({ variant }))} />;
    case "info":
      return <InfoIcon className={cn(iconVariants({ variant }))} />;
    default:
      return <Bell className={cn(iconVariants({ variant }))} />;
  }
}

// Ekspor fungsi utility untuk berbagai jenis toast
export const toast = {
  success: (props: Omit<FeedbackToastProps, "variant">) =>
    feedbackToast({ ...props, variant: "success" }),
  
  error: (props: Omit<FeedbackToastProps, "variant">) =>
    feedbackToast({ ...props, variant: "error" }),
  
  warning: (props: Omit<FeedbackToastProps, "variant">) =>
    feedbackToast({ ...props, variant: "warning" }),
  
  info: (props: Omit<FeedbackToastProps, "variant">) =>
    feedbackToast({ ...props, variant: "info" }),
  
  default: (props: Omit<FeedbackToastProps, "variant">) =>
    feedbackToast({ ...props, variant: "default" }),
};
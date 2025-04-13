import { toast as baseToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import React from "react";

interface FeedbackToastProps {
  title: string;
  message: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

// Individual toast component with icons
const FeedbackToast: React.FC<FeedbackToastProps> = ({
  title,
  message,
  variant = "default",
  action,
  duration = 5000,
}) => {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-3">
      {getIcon()}
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{message}</div>
      </div>
    </div>
  );
};

// Create helper functions instead of a toast object
export const showSuccessToast = ({ title, message, action, duration }: FeedbackToastProps) => {
  return baseToast({
    title: title,
    description: message,
    duration: duration || 5000,
    action: action ? (
      <ToastAction altText={action.label} onClick={action.onClick}>
        {action.label}
      </ToastAction>
    ) : undefined,
  });
};

export const showErrorToast = ({ title, message, action, duration }: FeedbackToastProps) => {
  return baseToast({
    title: title,
    description: message,
    variant: "destructive",
    duration: duration || 8000,
    action: action ? (
      <ToastAction altText={action.label} onClick={action.onClick}>
        {action.label}
      </ToastAction>
    ) : undefined,
  });
};

export const showInfoToast = ({ title, message, action, duration }: FeedbackToastProps) => {
  return baseToast({
    title: title,
    description: message,
    duration: duration || 5000,
    action: action ? (
      <ToastAction altText={action.label} onClick={action.onClick}>
        {action.label}
      </ToastAction>
    ) : undefined,
  });
};

export const showWarningToast = ({ title, message, action, duration }: FeedbackToastProps) => {
  return baseToast({
    title: title,
    description: message,
    duration: duration || 7000,
    action: action ? (
      <ToastAction altText={action.label} onClick={action.onClick}>
        {action.label}
      </ToastAction>
    ) : undefined,
  });
};

export default FeedbackToast;
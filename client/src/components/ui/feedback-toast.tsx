import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";

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
const FeedbackToast = ({
  title,
  message,
  variant = "default",
  action,
  duration = 5000,
}: FeedbackToastProps) => {
  const { toast } = useToast();

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

// Toast utility methods
export const toast = {
  success: ({ title, message, action, duration }: FeedbackToastProps) => {
    const { toast: showToast } = useToast();
    return showToast({
      title: title,
      description: message,
      duration: duration || 5000,
      action: action ? (
        <ToastAction altText={action.label} onClick={action.onClick}>
          {action.label}
        </ToastAction>
      ) : undefined,
    });
  },
  
  error: ({ title, message, action, duration }: FeedbackToastProps) => {
    const { toast: showToast } = useToast();
    return showToast({
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
  },
  
  info: ({ title, message, action, duration }: FeedbackToastProps) => {
    const { toast: showToast } = useToast();
    return showToast({
      title: title,
      description: message,
      duration: duration || 5000,
      action: action ? (
        <ToastAction altText={action.label} onClick={action.onClick}>
          {action.label}
        </ToastAction>
      ) : undefined,
    });
  },
  
  warning: ({ title, message, action, duration }: FeedbackToastProps) => {
    const { toast: showToast } = useToast();
    return showToast({
      title: title,
      description: message,
      duration: duration || 7000,
      action: action ? (
        <ToastAction altText={action.label} onClick={action.onClick}>
          {action.label}
        </ToastAction>
      ) : undefined,
    });
  },
};

export default FeedbackToast;
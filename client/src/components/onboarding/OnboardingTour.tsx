import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, X, HelpCircle, Settings, Image, ShoppingCart, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/feedback-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  completeOnPath?: string;
  actionText?: string;
  actionPath?: string;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to JawaStock!',
    description: 'Discover millions of royalty-free photos, videos, vectors, and more. Let us show you around.',
    icon: <HelpCircle className="h-5 w-5 text-primary" />,
    placement: 'bottom',
  },
  {
    id: 'browse',
    title: 'Browse Assets',
    description: 'Explore our vast collection of high-quality assets for your creative projects.',
    icon: <Image className="h-5 w-5 text-blue-500" />,
    targetSelector: 'nav a[href="/browse"]',
    placement: 'bottom',
    completeOnPath: '/browse',
    actionText: 'Browse Now',
    actionPath: '/browse',
  },
  {
    id: 'cart',
    title: 'Your Cart',
    description: 'Add assets to your cart and checkout when you\'re ready.',
    icon: <ShoppingCart className="h-5 w-5 text-green-500" />,
    targetSelector: 'a[href="/checkout"]',
    placement: 'bottom',
    completeOnPath: '/checkout',
  },
  {
    id: 'upload',
    title: 'Contribute Content',
    description: 'Become a creator and start selling your own digital assets.',
    icon: <Upload className="h-5 w-5 text-amber-500" />,
    targetSelector: 'a[href="/upload"]',
    placement: 'bottom',
    completeOnPath: '/upload',
    actionText: 'Upload Assets',
    actionPath: '/upload',
  },
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Customize your profile and manage your account settings.',
    icon: <Settings className="h-5 w-5 text-violet-500" />,
    targetSelector: 'a[href="/dashboard"]',
    placement: 'bottom',
    completeOnPath: '/dashboard',
  },
];

interface OnboardingTourProps {
  steps?: OnboardingStep[];
  onComplete?: () => void;
  forceShow?: boolean;
}

export function OnboardingTour({
  steps = defaultSteps,
  onComplete,
  forceShow = false,
}: OnboardingTourProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>('jawastock_onboarding_completed', []);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [show, setShow] = useState(forceShow);
  const [animation, setAnimation] = useState('');

  // Calculate progress
  const progress = (completedSteps.length / steps.length) * 100;
  
  // Current active step
  const currentStep = steps[activeStepIndex];

  useEffect(() => {
    // Check if onboarding should be shown for this user
    const shouldShow = forceShow || 
      (user && (!completedSteps.length || completedSteps.length < steps.length));
    
    if (shouldShow) {
      // Delay display slightly to allow page to render
      const timer = setTimeout(() => {
        setShow(true);
        positionTooltip();
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [user, completedSteps, forceShow]);

  // Position tooltip near target element
  const positionTooltip = () => {
    const step = steps[activeStepIndex];
    if (!step.targetSelector) {
      // Center in viewport if no target
      setPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 175,
      });
      return;
    }
    
    const target = document.querySelector(step.targetSelector);
    if (!target) {
      console.warn(`Target element for selector "${step.targetSelector}" not found`);
      return;
    }
    
    const rect = target.getBoundingClientRect();
    const placement = step.placement || 'bottom';
    
    // Calculate position based on placement
    let top, left;
    switch (placement) {
      case 'top':
        top = rect.top - 250;
        left = rect.left + rect.width / 2 - 175;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - 125;
        left = rect.right + 20;
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - 175;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - 125;
        left = rect.left - 350 - 20;
        break;
      default:
        top = rect.bottom + 20;
        left = rect.left;
    }
    
    // Keep within viewport bounds
    top = Math.max(20, Math.min(top, window.innerHeight - 300));
    left = Math.max(20, Math.min(left, window.innerWidth - 350 - 20));
    
    setPosition({ top, left });
  };

  // Check for path completion
  useEffect(() => {
    if (!show) return;
    
    const currentPath = window.location.pathname;
    const step = steps[activeStepIndex];
    
    if (step.completeOnPath && currentPath.includes(step.completeOnPath)) {
      markStepComplete(step.id);
    }
    
    // Reposition on window resize
    window.addEventListener('resize', positionTooltip);
    return () => window.removeEventListener('resize', positionTooltip);
  }, [activeStepIndex, show]);

  // Mark a step as complete
  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      
      toast.success({
        title: 'Step completed!', 
        message: `You've completed the "${steps.find(s => s.id === stepId)?.title}" step.`
      });
      
      // If all steps complete
      if (newCompleted.length === steps.length) {
        toast.success({
          title: 'Onboarding Complete!',
          message: 'You\'ve completed all onboarding steps. Enjoy using JawaStock!'
        });
        onComplete?.();
      }
    }
  };

  // Go to next step
  const handleNext = () => {
    // Mark current step complete
    markStepComplete(currentStep.id);
    
    // Animate out
    setAnimation('animate-fadeOut');
    setTimeout(() => {
      // Go to next step or start over when at the end
      if (activeStepIndex < steps.length - 1) {
        setActiveStepIndex(activeStepIndex + 1);
      } else {
        setActiveStepIndex(0);
        setShow(false);
      }
      
      // Reset animation and reposition
      setAnimation('animate-fadeIn');
      positionTooltip();
    }, 300);
  };

  // Handle user navigating to a link in onboarding
  const handleAction = () => {
    if (currentStep.actionPath) {
      window.location.href = currentStep.actionPath;
    }
  };

  // Dismiss onboarding
  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('jawastock_onboarding_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div 
      className={cn(
        "fixed z-50 transition-opacity duration-300",
        animation === 'animate-fadeOut' ? 'opacity-0' : 'opacity-100',
        animation === 'animate-fadeIn' ? 'animate-in fade-in slide-in-from-bottom-5' : ''
      )}
      style={{
        top: `${position.top}px`,
        left: isMobile ? '20px' : `${position.left}px`,
        width: isMobile ? 'calc(100% - 40px)' : '350px',
      }}
    >
      <Card className="shadow-xl border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {currentStep.icon}
              <CardTitle className="text-base">{currentStep.title}</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
          <Progress value={progress} className="h-1 mt-2" />
        </CardHeader>
        
        <CardContent>
          <CardDescription className="text-sm">
            {currentStep.description}
          </CardDescription>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-3">
          <div className="text-xs text-muted-foreground">
            Step {activeStepIndex + 1} of {steps.length}
          </div>
          <div className="flex gap-2">
            {currentStep.actionText && (
              <Button variant="outline" size="sm" onClick={handleAction}>
                {currentStep.actionText}
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {activeStepIndex === steps.length - 1 ? (
                <>
                  Finish
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Hook untuk menggunakan onboarding
export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  
  const startTour = () => setShowTour(true);
  const endTour = () => setShowTour(false);
  
  return {
    startTour,
    endTour,
    showTour,
    OnboardingTourComponent: (props: Omit<OnboardingTourProps, 'forceShow'>) => (
      <OnboardingTour {...props} forceShow={showTour} />
    ),
  };
}
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Upload, 
  User, 
  CreditCard,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface OnboardingTourProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

// List of feature points to highlight during onboarding
const tourSteps = [
  {
    title: 'Pencarian Assets',
    description: 'Cari ribuan foto, video, dan aset digital lainnya',
    icon: <Search className="h-6 w-6 text-primary" />,
    target: '.search-bar',
    position: 'bottom'
  },
  {
    title: 'Jelajahi Koleksi',
    description: 'Telusuri koleksi aset populer dan trending',
    icon: <Search className="h-6 w-6 text-primary" />,
    target: '.trending-assets',
    position: 'top'
  },
  {
    title: 'Keranjang Belanja',
    description: 'Tambahkan aset ke keranjang belanja Anda',
    icon: <ShoppingCart className="h-6 w-6 text-primary" />,
    target: '.cart-icon',
    position: 'bottom'
  },
  {
    title: 'Upload Karya Anda',
    description: 'Bagikan kreasi Anda dan dapatkan penghasilan',
    icon: <Upload className="h-6 w-6 text-primary" />,
    target: '.upload-link',
    position: 'bottom'
  },
  {
    title: 'Dashboard Anda',
    description: 'Kelola aset dan lihat laporan performa Anda',
    icon: <User className="h-6 w-6 text-primary" />,
    target: '.dashboard-link',
    position: 'bottom'
  }
];

export function OnboardingTour({ forceShow = false, onComplete }: OnboardingTourProps) {
  const [showTour, setShowTour] = useLocalStorage('jawastock_show_tour', true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show tour if it's the first visit or if forced
    if ((showTour || forceShow) && tourSteps.length > 0) {
      // Slight delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [showTour, forceShow]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setShowTour(false);
    
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setShowTour(false);
  };

  if (!isVisible) {
    return null;
  }

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tour JawaStock</h3>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Progress value={progress} className="mb-6" />
          
          <div className="flex items-center gap-4 mb-6">
            {currentTourStep.icon}
            <div>
              <h4 className="font-medium text-base">{currentTourStep.title}</h4>
              <p className="text-sm text-muted-foreground">{currentTourStep.description}</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={handlePrevious}>
                Sebelumnya
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button onClick={handleNext}>
              {currentStep < tourSteps.length - 1 ? 'Selanjutnya' : 'Selesai'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Removed this export to fix the incompatible export issue
// We'll create a separate file for the hook
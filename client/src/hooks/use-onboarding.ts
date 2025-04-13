import { useLocalStorage } from '@/hooks/use-local-storage';

// Custom hook for using onboarding
export function useOnboarding() {
  const [showTour, setShowTour] = useLocalStorage('jawastock_show_tour', true);
  
  const startTour = () => {
    setShowTour(true);
  };
  
  const endTour = () => {
    setShowTour(false);
  };
  
  return {
    showTour,
    startTour,
    endTour
  };
}
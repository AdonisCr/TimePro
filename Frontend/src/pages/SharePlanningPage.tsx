import { useState } from 'react';
import { PageTransition } from '../components/ui/Animations';
import PlanningShare from '../components/dashboard/PlanningShare';

const SharePlanningPage = () => {
  const [planningUrl, setPlanningUrl] = useState<string | undefined>();

  const handleGenerateLink = async () => {
    // In real app, this would call API to generate unique link
    await new Promise(resolve => setTimeout(resolve, 1000));
    const url = `https://timepro.app/shared/planning/${Math.random().toString(36).slice(2, 10)}`;
    setPlanningUrl(url);
    return url;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <PlanningShare 
            planningUrl={planningUrl}
            onGenerateLink={handleGenerateLink}
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default SharePlanningPage;

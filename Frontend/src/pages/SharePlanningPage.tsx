import { PageTransition } from '../components/ui/Animations';
import PlanningShare from '../components/dashboard/PlanningShare';

const SharePlanningPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <PlanningShare />
        </div>
      </div>
    </PageTransition>
  );
};

export default SharePlanningPage;

import { BackgroundGradient } from "@/components/ui/bg-gradient";
import { Dashboard } from '@/components/dashboard/Dashboard';

const DashboardPage = () => {
  return (
    <div className="relative min-h-screen">
      <BackgroundGradient 
        className="dark:opacity-90"
        gradientFrom="hsl(var(--gradient-start))"
        gradientTo="hsl(var(--gradient-end))"
      />
      <div className="relative z-10">
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;

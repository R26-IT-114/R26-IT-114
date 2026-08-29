import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import {
  PerformancePanel,
  WORKING_MEMORY_GAMES,
} from '../components/HomePage';
import { ProgressProvider, useProgress } from '../context/ProgressContext';

const WorkingMemoryDashboardContent = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 px-6">
        <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-xl">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 font-black text-slate-700">කාර්යසාධන වාර්තාව සූදානම් කරනවා...</p>
        </div>
      </main>
    );
  }

  return (
    <PerformancePanel
      standalone
      games={WORKING_MEMORY_GAMES.filter((game) => game.available)}
      progress={progress}
      onClose={() => navigate('/dashboards')}
    />
  );
};

const WorkingMemoryDashboard = () => {
  const { user } = useAuth();

  return (
    <ProgressProvider userId={user?.id ?? null}>
      <WorkingMemoryDashboardContent />
    </ProgressProvider>
  );
};

export default WorkingMemoryDashboard;

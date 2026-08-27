import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import {
  PerformancePanel,
  WORKING_MEMORY_GAMES,
} from '../components/HomePage';
import { ProgressProvider, useProgress } from '../context/ProgressContext';

const readCollectedStars = (userId) => {
  if (typeof window === 'undefined') return 0;

  const value = Number(window.localStorage.getItem(`working-memory:total-stars:${userId || 'guest'}`));
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
};

const WorkingMemoryDashboardContent = ({ userId }) => {
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  const totalStars = readCollectedStars(userId);

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
      totalStars={totalStars}
      onClose={() => navigate('/dashboards')}
    />
  );
};

const WorkingMemoryDashboard = () => {
  const { user } = useAuth();

  return (
    <ProgressProvider userId={user?.id ?? null}>
      <WorkingMemoryDashboardContent userId={user?.id ?? null} />
    </ProgressProvider>
  );
};

export default WorkingMemoryDashboard;

import { Outlet, useLocation } from 'react-router-dom';
import { DyscalculiaFlowProvider } from '../context/DyscalculiaFlowContext';
import '../styles/number-adventure-land.css';
import DyscalculiaRewardBurst from '../components/DyscalculiaRewardBurst';
import BeachStarCollector from '../components/BeachStarCollector';
import OceanAnimalFriends from '../components/OceanAnimalFriends';
import useDyscalculiaCloudSync from '../hooks/useDyscalculiaCloudSync';

const DIRECT_GAME_ROUTES = new Set([
  '/dyscalculia/listening-game',
  '/dyscalculia/balloon-pop',
  '/dyscalculia/number-sorting',
  '/dyscalculia/review',
  '/dyscalculia/symbol-detective',
  '/dyscalculia/number-matching',
]);

const isPlayableGameRoute = (pathname) => {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  if (DIRECT_GAME_ROUTES.has(normalizedPath)) return true;

  return /^\/dyscalculia\/(?:adaptive|number-tracing|number-memory-write|number)\/[^/]+$/.test(normalizedPath);
};

const DyscalculiaFlowLayout = () => {
  const { pathname } = useLocation();
  useDyscalculiaCloudSync();
  const showRewardBox = isPlayableGameRoute(pathname);
  const showTracingFriends = /^\/dyscalculia\/(?:number-tracing|number)\/\d\/?$/.test(pathname);

  return (
    <DyscalculiaFlowProvider>
      <div className='dyscalculia-beach-module'>
        <DyscalculiaRewardBurst />
        {showRewardBox && <BeachStarCollector />}
        {showTracingFriends && <OceanAnimalFriends scene='tracing' />}
        <Outlet />
      </div>
    </DyscalculiaFlowProvider>
  );
};

export default DyscalculiaFlowLayout;

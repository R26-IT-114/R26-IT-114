import { Outlet } from 'react-router-dom';
import { DyscalculiaFlowProvider } from '../context/DyscalculiaFlowContext';
import '../styles/number-adventure-land.css';
import DyscalculiaRewardBurst from '../components/DyscalculiaRewardBurst';
import BeachStarCollector from '../components/BeachStarCollector';
import useDyscalculiaCloudSync from '../hooks/useDyscalculiaCloudSync';

const DyscalculiaFlowLayout = () => {
  useDyscalculiaCloudSync();

  return (
    <DyscalculiaFlowProvider>
      <div className='dyscalculia-beach-module'>
        <DyscalculiaRewardBurst />
        <BeachStarCollector />
        <Outlet />
      </div>
    </DyscalculiaFlowProvider>
  );
};

export default DyscalculiaFlowLayout;

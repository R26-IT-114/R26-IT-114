import { Outlet } from 'react-router-dom';
import { DyscalculiaFlowProvider } from '../context/DyscalculiaFlowContext';

const DyscalculiaFlowLayout = () => {
  return (
    <DyscalculiaFlowProvider>
      <Outlet />
    </DyscalculiaFlowProvider>
  );
};

export default DyscalculiaFlowLayout;

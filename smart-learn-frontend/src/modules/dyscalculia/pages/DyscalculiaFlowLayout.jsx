import { Outlet } from 'react-router-dom';
import { DyscalculiaFlowProvider } from '../context/DyscalculiaFlowContext';
import '../styles/number-adventure-land.css';

const DyscalculiaFlowLayout = () => {
  return (
    <DyscalculiaFlowProvider>
      <Outlet />
    </DyscalculiaFlowProvider>
  );
};

export default DyscalculiaFlowLayout;

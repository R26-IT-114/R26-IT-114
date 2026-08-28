import { Outlet } from 'react-router-dom';
import { DyscalculiaFlowProvider } from '../context/DyscalculiaFlowContext';
import '../styles/number-adventure-land.css';

const DyscalculiaFlowLayout = () => {
  return (
    <DyscalculiaFlowProvider>
      <div className='dyscalculia-beach-module'>
        <Outlet />
      </div>
    </DyscalculiaFlowProvider>
  );
};

export default DyscalculiaFlowLayout;

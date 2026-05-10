import { useLocation } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import Navbar from './components/common/Navbar';

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <AppRouter />
    </>
  );
}

export default App;

import TerminalLayout from './components/TerminalLayout';
import MobileLayout from './components/MobileLayout';
import Preloader from './components/Preloader';
import useIsMobile from './hooks/useIsMobile';

function App() {
  const isMobile = useIsMobile();

  return (
    <>
      <Preloader />
      {isMobile ? <MobileLayout /> : <TerminalLayout />}
    </>
  )
}

export default App

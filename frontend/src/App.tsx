import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AnalyzeUser from './pages/AnalyzeUser';
import UserSegments from './pages/UserSegments';
import ModelPerformance from './pages/ModelPerformance';
import Insights from './pages/Insights';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="analyze" element={<AnalyzeUser />} />
          <Route path="segments" element={<UserSegments />} />
          <Route path="models" element={<ModelPerformance />} />
          <Route path="insights" element={<Insights />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

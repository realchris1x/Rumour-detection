import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { PropagationPage } from './pages/PropagationPage';
import { DatasetPage } from './pages/DatasetPage';
import { PerformancePage } from './pages/PerformancePage';
import { BatchPage } from './pages/BatchPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<AnalyzerPage />} />
          <Route path="/propagation" element={<PropagationPage />} />
          <Route path="/dataset" element={<DatasetPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/batch" element={<BatchPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

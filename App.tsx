
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UploadScreen from './screens/UploadScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import Header from './components/Header';
import { QuotaProvider } from './contexts/QuotaContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import { GeneratedImage } from './types';

const App: React.FC = () => {
  const [latestGeneratedImage, setLatestGeneratedImage] = React.useState<GeneratedImage | null>(null);

  return (
    <AuthProvider> {/* AuthProvider wraps QuotaProvider and HistoryProvider */}
      <QuotaProvider>
        <HistoryProvider>
          <div className="min-h-screen flex flex-col bg-pearl text-plum">
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<UploadScreen setLatestGeneratedImage={setLatestGeneratedImage} />} />
                <Route path="/result" element={<ResultScreen generatedImage={latestGeneratedImage} setLatestGeneratedImage={setLatestGeneratedImage}/>} />
                <Route path="/history" element={<HistoryScreen setLatestGeneratedImage={setLatestGeneratedImage} />} />
              </Routes>
            </main>
            <footer className="text-center p-4 text-sm text-plum/70 border-t border-frosted/50 font-body">
              Cosplay Image Generator &copy; {new Date().getFullYear()}
            </footer>
          </div>
        </HistoryProvider>
      </QuotaProvider>
    </AuthProvider>
  );
};

export default App;

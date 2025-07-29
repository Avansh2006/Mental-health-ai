import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatBot from './components/chatBot';
import ExpertDashboard from './components/ExpertDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100">
        <header className="px-6 py-4 text-white bg-teal-700 shadow-lg">
          <h1 className="text-2xl font-bold">Mental Wellness Assistant</h1>
        </header>

        <main className="container px-4 py-8 mx-auto">
          <Routes>
            <Route path="/" element={<ChatBot />} />
            <Route path="/expert-dashboard" element={<ExpertDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App

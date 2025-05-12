import React from 'react';
import { QAInterface } from './components/QAInterface';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span className="bg-[#4A154B] text-white p-2 rounded mr-3">Q&A</span>
          Internal Knowledge Base
        </h1>
        <QAInterface />
      </div>
    </div>
  );
}

export default App;
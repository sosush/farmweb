"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LivestockDiseasePage() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'running' | 'not-running'>('checking');
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');

  useEffect(() => {
    // Check if Flask backend is running
    fetch(backendUrl)
      .then(() => setBackendStatus('running'))
      .catch(() => {
        // Try alternative port
        fetch('http://localhost:8000')
          .then(() => {
            setBackendStatus('running');
            setBackendUrl('http://localhost:8000');
          })
          .catch(() => setBackendStatus('not-running'));
      });
  }, [backendUrl]);

  if (backendStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Checking Livestock Disease Prediction Service...</h1>
          <div className="mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (backendStatus === 'running') {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-green-700 text-white p-4">
          <h1 className="text-2xl font-bold text-center">Livestock Disease Prediction System</h1>
        </div>
        <iframe
          src={backendUrl}
          className="w-full h-[calc(100vh-64px)] border-0"
          title="Livestock Disease Prediction Interface"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-green-800 mb-6 text-center">
            Livestock Disease Prediction
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              About Livestock Disease Prediction
            </h2>
            <p className="text-gray-600 mb-6">
              Our AI-powered Livestock Disease Prediction system helps farmers and veterinarians identify potential health issues 
              in livestock early, enabling timely intervention and treatment. Upload images of your livestock to get instant 
              disease predictions and recommendations.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Key Features:
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>AI-powered disease detection from livestock images</li>
              <li>Support for multiple livestock types (cattle, sheep, goats, pigs)</li>
              <li>Instant disease identification and severity assessment</li>
              <li>Treatment recommendations and preventive measures</li>
              <li>Historical tracking of livestock health</li>
              <li>Veterinary consultation integration</li>
              <li>Disease outbreak alerts and notifications</li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Quick Start:</strong> To run the Livestock Disease Prediction service, you need to start the Flask backend:
              </p>
              <div className="mt-2 bg-gray-800 text-white p-3 rounded font-mono text-sm">
                <div># Navigate to the livestock directory</div>
                <div>cd farmweb/src/app/livestock</div>
                <div># Install dependencies (first time only)</div>
                <div>pip install -r requirements.txt</div>
                <div># Start the Flask server</div>
                <div>python application.py</div>
              </div>
              <p className="text-sm text-blue-800 mt-2">
                The service typically runs on http://localhost:5000. Once started, refresh this page to access the interface.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link 
                href="/"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Back to Home
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check Again
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                🐄 Early Detection
              </h3>
              <p className="text-gray-600">
                Identify diseases in early stages when treatment is most effective, reducing mortality rates and economic losses.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                💊 Treatment Guidance
              </h3>
              <p className="text-gray-600">
                Get specific treatment recommendations and connect with veterinary professionals for expert consultation.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                📊 Health Monitoring
              </h3>
              <p className="text-gray-600">
                Track the health status of your entire herd over time with comprehensive health records and analytics.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                🚨 Outbreak Prevention
              </h3>
              <p className="text-gray-600">
                Receive alerts about disease outbreaks in your area and preventive measures to protect your livestock.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

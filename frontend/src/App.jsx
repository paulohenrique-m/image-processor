import React, { useState, useEffect } from 'react';
import { useJobs } from './hooks/useJobs';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import JobList from './components/JobList';
import MetricsDashboard from './components/MetricsDashboard';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  const { jobs, loading, error, uploadImage, deleteJob } = useJobs();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      await uploadImage(file);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Delete this job?')) {
      try {
        await deleteJob(jobId);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {error && (
          <div className="error-banner">
            <span>Erro {error}</span>
            <button onClick={() => window.location.reload()}>Dismiss</button>
          </div>
        )}

        <section className="upload-section">
          <h2>Upload Images for Processing</h2>
          <UploadArea 
            onUpload={handleUpload} 
            loading={uploading}
          />
        </section>

        <div className="dashboard-layout">
          <div className="main-panel">
            <JobList 
              jobs={jobs}
              onDeleteJob={handleDeleteJob}
              loading={loading}
            />
          </div>
          
          <div className="side-panel">
            <MetricsDashboard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
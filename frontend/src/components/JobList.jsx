import React from 'react';
import '../styles/JobList.css';

const JobList = ({ jobs, onDeleteJob, loading }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '🔄';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="job-list loading">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      <div className="job-list-header">
        <h3>Processing Jobs ({jobs.length})</h3>
        <button 
          className="refresh-btn"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>No jobs yet. Upload some images to get started!</p>
        </div>
      ) : (
        <div className="jobs-container">
          {jobs.map(job => (
            <div key={job.id} className={`job-card ${job.status}`}>
              <div className="job-header">
                <div className="job-info">
                  <span className="job-id">ID: {job.id.slice(-8)}</span>
                  <span className="job-filename">
                    {job.filename || job.metadata?.originalName || 'Unknown'}
                  </span>
                </div>
                <div className="job-actions">
                  {job.status === 'completed' && job.metadata?.processedImage && (
                    <button 
                      className="action-btn download"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:image/jpeg;base64,${job.metadata.processedImage}`;
                        link.download = `processed-${job.filename}`;
                        link.click();
                      }}
                    >
                      Download
                    </button>
                  )}
                  <button 
                    className="action-btn delete"
                    onClick={() => onDeleteJob(job.id)}
                    disabled={job.status === 'processing'}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="job-status">
                <span className={`status-badge ${job.status}`}>
                  {getStatusIcon(job.status)} {job.status.toUpperCase()}
                </span>
                <span className="job-timestamp">
                  {formatTimestamp(job.timestamp)}
                </span>
              </div>

              {job.status === 'processing' && (
                <div className="job-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${job.progress || 0}%` }}
                    />
                  </div>
                  <span className="progress-text">{job.progress || 0}%</span>
                </div>
              )}

              {job.metadata && (
                <div className="job-metadata">
                  {job.metadata.originalSize && (
                    <span>Original: {formatFileSize(job.metadata.originalSize)}</span>
                  )}
                  {job.metadata.processedSize && (
                    <span>Processed: {formatFileSize(job.metadata.processedSize)}</span>
                  )}
                  {job.metadata.error && (
                    <span className="error-message">Error: {job.metadata.error}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
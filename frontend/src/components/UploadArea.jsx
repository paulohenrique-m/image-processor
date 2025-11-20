import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/UploadArea.css';

const UploadArea = ({ onUpload, loading = false }) => {
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach(file => {
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));

      const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));

          if (progress >= 100) {
            clearInterval(interval);
            onUpload(file);
            setTimeout(() => {
              setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[file.name];
                return newProgress;
              });
            }, 1000);
          }
        }, 100);
      };

      simulateUpload();
    });
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: loading
  });

  return (
    <div className="upload-area">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${loading ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="dropzone-content">
          {loading ? (
            <div className="upload-loading">
              <div className="spinner"></div>
              <p>Processing upload...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              {isDragActive ? (
                <p>Drop the images here</p>
              ) : (
                <>
                  <p>Drop images here, or click to select</p>
                  <small>Supports: JPEG, PNG, GIF, WebP (max 10MB)</small>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {Object.keys(uploadProgress).length > 0 && (
        <div className="upload-progress-list">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="upload-progress-item">
              <span className="filename">{filename}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="progress-text">{progress}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadArea;
import { useState, useEffect, useCallback } from 'react';
import { imageAPI } from '../services/api';
import { useWebSocket } from './useWebSocket';

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { subscribeToJobUpdates, isConnected } = useWebSocket();

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
    //   TODO: ADJUST THIS FUNCTION!!
      const jobsData = await imageAPI.getJobs();
      setJobs(jobsData);
    } catch (err) {
      setError('Failed jobs: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (imageFile) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const result = await imageAPI.uploadImage(formData);

      setJobs(prev => [{
        id: result.jobId,
        filename: imageFile.name,
        status: 'pending',
        progress: 0,
        timestamp: new Date(),
        metadata: {}
      }, ...prev]);
      
      return result;
    } catch (err) {
      setError('Upload failed: ' + err.message);
      throw err;
    }
  }, []);

  const deleteJob = useCallback(async (jobId) => {
    try {
      await imageAPI.deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      setError('Delete failed: ' + err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribeToJobUpdates((update) => {      
      setJobs(prev => prev.map(job => 
        job.id === update.jobId 
          ? { ...job, ...update, timestamp: new Date(update.timestamp) }
          : job
      ));
    });

    return unsubscribe;
  }, [isConnected, subscribeToJobUpdates]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return {
    jobs,
    loading,
    error,
    uploadImage,
    deleteJob,
    refreshJobs: loadJobs,
  };
};
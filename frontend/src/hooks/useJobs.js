import { useState, useEffect, useCallback } from "react";
import { imageAPI } from "../services/api";
import { useWebSocket } from "./useWebSocket";

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { subscribeToJobUpdates, isConnected } = useWebSocket();

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await imageAPI.getJobs();
      const jobsData = response.jobs || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      setError("Failed to load jobs: " + err.message);
      console.error("Error loading jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (imageFile) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append("image", imageFile);
      const result = await imageAPI.uploadImage(formData);
      const newJob = {
        id: result.jobId || Math.random().toString(36).substr(2, 9),
        filename: imageFile.name,
        status: "pending",
        progress: 0,
        timestamp: new Date(),
        metadata: {},
      };

      setJobs((prev) => [newJob, ...prev]);

      return result;
    } catch (err) {
      setError("Upload failed: " + err.message);
      throw err;
    }
  }, []);

  const deleteJob = useCallback(async (jobId) => {
    try {
      await imageAPI.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      setError("Delete failed: " + err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribeToJobUpdates((update) => {
      console.log("job update:", update);

      setJobs((prev) => {
        const newJobs = [...prev];
        const index = newJobs.findIndex((job) => job.id === update.jobId);

        if (index !== -1) {
          newJobs[index] = {
            ...newJobs[index],
            ...update,
            timestamp: new Date(update.timestamp || Date.now()),
          };
        } else {
          newJobs.unshift({
            id: update.jobId,
            filename: update.filename || "Unknown",
            status: update.status || "pending",
            progress: update.progress || 0,
            timestamp: new Date(update.timestamp || Date.now()),
            metadata: update.metadata || {},
          });
        }

        return newJobs;
      });
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
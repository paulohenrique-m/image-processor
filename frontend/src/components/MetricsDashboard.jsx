import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { imageAPI } from '../services/api';
import '../styles/MetricsDashboard.css';

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState({
    queueSize: 0,
    activeWorkers: 0,
    processedToday: 0,
    averageProcessingTime: 0
  });
  
  const { subscribeToMetrics, isConnected } = useWebSocket();

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metricsData = await imageAPI.getMetrics();
        setMetrics(metricsData);
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    };

    loadMetrics();

    if (isConnected) {
      const unsubscribe = subscribeToMetrics((update) => {
        setMetrics(prev => ({ ...prev, ...update }));
      });

      return unsubscribe;
    }
  }, [isConnected, subscribeToMetrics]);

  const MetricCard = ({ title, value, icon, color }) => (
    <div className={`metric-card ${color}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h3>{title}</h3>
        <p className="metric-value">{value}</p>
      </div>
    </div>
  );
  // TODO: melhorar metricas!!
  return (
    <div className="metrics-dashboard">
      <h3>System Metrics</h3>
      <div className="metrics-grid">
        <MetricCard
          title="Queue Size"
          value={metrics.queueSize}
          icon="📊"
          color="blue"
        />
        <MetricCard
          title="Active Workers"
          value={metrics.activeWorkers}
          icon="👷"
          color="green"
        />
        <MetricCard
          title="Processed Today"
          value={metrics.processedToday}
          icon="✅"
          color="purple"
        />
        <MetricCard
          title="Avg. Time (ms)"
          value={metrics.averageProcessingTime}
          icon="⏱️"
          color="orange"
        />
      </div>
    </div>
  );
};

export default MetricsDashboard;
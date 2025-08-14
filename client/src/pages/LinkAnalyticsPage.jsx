// client/src/pages/LinkAnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Import Chart.js components
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import styles from './LinkAnalyticsPage.module.css';

// Register Chart.js components we will use
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function LinkAnalyticsPage() {
  const { id } = useParams(); // Get the link ID from the URL
  const { token } = useSelector((state) => state.auth);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Data Fetching ---
  useEffect(() => {
    if (!token || !id) return;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`/api/links/${id}/analytics`, config);
        setAnalytics(response.data);
      } catch (err) {
        setError('Could not load analytics for this link.');
        console.error("Fetch analytics error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id, token]);

  // --- Chart Data Processing ---
  // Memoize chart data to prevent re-calculation on every render
  const chartData = React.useMemo(() => {
    if (!analytics) return { line: {}, bar: {} };

    // Process data for clicks over time (Line chart)
    const clicksByDate = analytics.clickDetails.reduce((acc, click) => {
      const date = new Date(click.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const lineChartLabels = Object.keys(clicksByDate);
    const lineChartData = Object.values(clicksByDate);

    // Process data for top countries (Bar chart)
    const clicksByCountry = analytics.clickDetails.reduce((acc, click) => {
        const country = click.geo?.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
    }, {});
    const sortedCountries = Object.entries(clicksByCountry).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const barChartLabels = sortedCountries.map(c => c[0]);
    const barChartData = sortedCountries.map(c => c[1]);

    return {
      line: {
        labels: lineChartLabels,
        datasets: [{
          label: 'Clicks per Day',
          data: lineChartData,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          fill: true,
          tension: 0.4,
        }],
      },
      bar: {
        labels: barChartLabels,
        datasets: [{
          label: 'Top Countries',
          data: barChartData,
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(6, 182, 212, 0.7)',
            'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
        }],
      },
    };
  }, [analytics]);

  // --- Chart Options ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'rgba(255, 255, 255, 0.7)' } },
      title: { display: true, color: 'white' },
    },
    scales: {
      x: { ticks: { color: 'rgba(255, 255, 255, 0.5)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      y: { ticks: { color: 'rgba(255, 255, 255, 0.5)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
    },
  };

  if (loading) return <p className={styles.statusText}>Loading Analytics...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!analytics) return null; // Or a more specific "not found" message

  return (
    <div className={styles.analyticsContainer}>
      <Link to="/dashboard" className={styles.backLink}>&larr; Back to Dashboard</Link>
      
      <header className={styles.analyticsHeader}>
        <h1>{analytics.title}</h1>
        <a href={analytics.shortUrl} target="_blank" rel="noopener noreferrer">{analytics.shortUrl}</a>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Clicks</h3>
          <p>{analytics.totalClicks}</p>
        </div>
        {/* You can add more summary stat cards here */}
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
          <h3>Clicks Over Time</h3>
          <div className={styles.chartWrapper}>
            <Line options={chartOptions} data={chartData.line} />
          </div>
        </div>
        <div className={styles.chartContainer}>
          <h3>Clicks by Country</h3>
          <div className={styles.chartWrapper}>
            <Bar options={{...chartOptions, indexAxis: 'y' }} data={chartData.bar} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkAnalyticsPage;
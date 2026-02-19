import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { http } from '../api/http';
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CandidateDashboard() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState({ bar: [], pie: { passed: 0, failed: 0 }, rank: '-' });
  useEffect(() => {
    http.get('/candidate/dashboard').then((r) => setData(r.data));
    http.get('/candidate/analytics').then((r) => setAnalytics(r.data));
  }, []);

  if (!data) return <p>Loading...</p>;
  return <div><h1>Candidate Dashboard</h1>
    <div className="grid">{Object.entries(data).map(([k,v])=> <div key={k} className="metric">{k}: {v}</div>)}</div>
    <p>Current Rank: #{analytics.rank}</p>
    <div className="charts">
      <Bar data={{ labels: analytics.bar.map((b) => b.name), datasets: [{ label: 'Performance', data: analytics.bar.map((b) => b.percentage), backgroundColor: '#2563eb' }] }} />
      <Pie data={{ labels: ['Passed', 'Failed'], datasets: [{ data: [analytics.pie.passed, analytics.pie.failed], backgroundColor: ['#2563eb', '#ef4444'] }] }} />
    </div>
  </div>;
}

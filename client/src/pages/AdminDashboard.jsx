import { useEffect, useState } from 'react';
import { http } from '../api/http';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { http.get('/admin/dashboard').then((res) => setData(res.data)); }, []);
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="grid">
        {['totalCandidates', 'totalTests', 'activeTests', 'completedTests'].map((k) => <div className="metric" key={k}>{k}: {data[k]}</div>)}
      </div>
      <h3>Top 5 Performers</h3>
      <ul>{data.leaderboard.map((x, i) => <li key={i}>{x.name} - {x.percentage}%</li>)}</ul>
    </div>
  );
}

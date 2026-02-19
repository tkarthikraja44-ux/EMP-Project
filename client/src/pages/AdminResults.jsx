import { useEffect, useState } from 'react';
import { http } from '../api/http';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  useEffect(() => { http.get('/admin/results').then((r) => setResults(r.data)); }, []);

  return <div><h1>Result Management</h1>
    <a href="http://localhost:5000/api/admin/results/export/csv" target="_blank">Export CSV</a>
    <table><thead><tr><th>Candidate</th><th>Test</th><th>Score</th><th>%</th><th>Time</th></tr></thead>
      <tbody>{results.map((r) => <tr key={r._id}><td>{r.userId?.name}</td><td>{r.testId?.title}</td><td>{r.score}</td><td>{r.percentage}</td><td>{r.timeTaken}s</td></tr>)}</tbody></table>
  </div>;
}

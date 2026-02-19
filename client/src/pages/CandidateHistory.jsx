import { useEffect, useState } from 'react';
import { http } from '../api/http';

export default function CandidateHistory() {
  const [rows, setRows] = useState([]);
  useEffect(() => { http.get('/candidate/history').then((r) => setRows(r.data)); }, []);

  return <div><h1>Test History</h1>
    <table><thead><tr><th>Date</th><th>Test</th><th>Score</th><th>%</th><th>Status</th></tr></thead><tbody>
      {rows.map((r)=><tr key={r._id}><td>{new Date(r.submittedAt).toLocaleDateString()}</td><td>{r.testId?.title}</td><td>{r.score}</td><td>{r.percentage}</td><td>{r.percentage>=40?'Pass':'Fail'}</td></tr>)}
    </tbody></table>
  </div>;
}

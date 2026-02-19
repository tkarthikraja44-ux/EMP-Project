import { useEffect, useRef, useState } from 'react';
import { http } from '../api/http';

export default function CandidateTests() {
  const [tests, setTests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const submittingRef = useRef(false);

  useEffect(() => {
    http.get(`/candidate/tests?page=${page}&limit=5`).then((r) => {
      setTests(r.data.tests);
      setPages(r.data.pages);
    });
  }, [page]);

  useEffect(() => {
    if (!timer || !selected) return;
    const id = setInterval(() => setTimer((t) => Math.max(t - 1, 0)), 1000);
    if (timer <= 1) submit();
    return () => clearInterval(id);
  }, [timer, selected]);

  useEffect(() => {
    const onBlur = () => selected && submit();
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [selected, answers]);

  const start = async (id) => {
    const { data } = await http.get(`/candidate/tests/${id}/start`);
    setSelected(data);
    setAnswers(data.questions.map((q) => ({ originalIndex: q.originalIndex, selectedOption: -1 })));
    setTimer(data.duration * 60);
    submittingRef.current = false;
  };

  const submit = async () => {
    if (!selected || submittingRef.current) return;
    submittingRef.current = true;
    const timeTaken = selected.duration * 60 - timer;
    const { data } = await http.post(`/candidate/tests/${selected._id}/submit`, { answers, timeTaken });
    setResult(data);
    setSelected(null);
  };

  if (selected) {
    return (
      <div>
        <h2>{selected.title}</h2>
        <p>Time left: {timer}s</p>
        {selected.questions.map((q, i) => (
          <div key={q._id} className="card">
            <p>{q.question}</p>
            {q.options.map((o, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const next = [...answers];
                  next[i] = { ...next[i], selectedOption: idx };
                  setAnswers(next);
                }}
              >
                {o}
              </button>
            ))}
          </div>
        ))}
        <button onClick={submit}>Submit</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Available Tests</h1>
      {result && (
        <p>
          Score {result.result.score} | {result.result.percentage}% | Correct {result.summary.correct} Wrong {result.summary.wrong}
        </p>
      )}
      <ul>
        {tests.map((t) => (
          <li key={t._id}>
            {t.title} <button onClick={() => start(t._id)}>Start Test</button>
          </li>
        ))}
      </ul>
      <div className="row">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}

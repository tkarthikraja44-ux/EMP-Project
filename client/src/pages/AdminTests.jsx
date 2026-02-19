import { useEffect, useState } from 'react';
import { http } from '../api/http';

const getInitial = () => ({
  title: '',
  description: '',
  duration: 30,
  totalMarks: 100,
  numberOfQuestions: 1,
  questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
});

export default function AdminTests() {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState(getInitial());

  const load = () => http.get('/admin/tests').then((r) => setTests(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await http.post('/admin/tests', {
      ...form,
      numberOfQuestions: form.questions.length,
      totalMarks: Number(form.totalMarks),
      duration: Number(form.duration)
    });
    setForm(getInitial());
    load();
  };

  const toggle = async (id) => {
    await http.patch(`/admin/tests/${id}/toggle`);
    load();
  };

  const updateQuestion = (idx, updater) => {
    const next = [...form.questions];
    next[idx] = updater(next[idx]);
    setForm({ ...form, questions: next, numberOfQuestions: next.length });
  };

  return (
    <div>
      <h1>Test Management</h1>
      <form className="card" onSubmit={save}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="number" min="1" placeholder="Duration in minutes" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
        <input type="number" min="1" placeholder="Total Marks" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} required />

        <h3>Questions</h3>
        {form.questions.map((q, qi) => (
          <div key={qi} className="card">
            <input
              placeholder={`Question ${qi + 1}`}
              value={q.question}
              onChange={(e) => updateQuestion(qi, (curr) => ({ ...curr, question: e.target.value }))}
              required
            />
            {q.options.map((opt, oi) => (
              <input
                key={oi}
                placeholder={`Option ${oi + 1}`}
                value={opt}
                onChange={(e) => updateQuestion(qi, (curr) => {
                  const options = [...curr.options];
                  options[oi] = e.target.value;
                  return { ...curr, options };
                })}
                required
              />
            ))}
            <label>
              Correct answer index (0-3)
              <input
                type="number"
                min="0"
                max="3"
                value={q.correctAnswer}
                onChange={(e) => updateQuestion(qi, (curr) => ({ ...curr, correctAnswer: Number(e.target.value) }))}
              />
            </label>
          </div>
        ))}

        <button type="button" onClick={() => setForm({ ...form, questions: [...form.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }] })}>
          Add Question
        </button>
        <button>Add New Test</button>
      </form>

      <ul>
        {tests.map((t) => (
          <li key={t._id}>
            {t.title} ({t.isActive ? 'Active' : 'Inactive'}) <button onClick={() => toggle(t._id)}>Toggle</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Link, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const admin = user?.role === 'admin';
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>EAS</h2>
        <Link to={admin ? '/admin' : '/candidate'}>Dashboard</Link>
        {admin ? <Link to="/admin/tests">Tests</Link> : <Link to="/candidate/tests">Take Test</Link>}
        {admin ? <Link to="/admin/results">Results</Link> : <Link to="/candidate/history">History</Link>}
        <Link to={admin ? '/admin/profile' : '/candidate/profile'}>Profile</Link>
        <button onClick={() => setDark((v) => !v)}>{dark ? 'Light Mode' : 'Dark Mode'}</button>
        <button onClick={logout}>Logout</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

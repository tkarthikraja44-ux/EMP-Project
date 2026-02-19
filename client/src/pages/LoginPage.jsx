import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { http } from '../api/http';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await http.post(`/auth/login/${role}`, form);
    login(data);
    navigate(role === 'admin' ? '/admin' : '/candidate');
  };

  return (
    <div className="center gradient-bg">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" onSubmit={submit}>
        <h1>{role === 'admin' ? 'Admin Login' : 'Candidate Login'}</h1>
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button>Login</button>
      </motion.form>
    </div>
  );
}

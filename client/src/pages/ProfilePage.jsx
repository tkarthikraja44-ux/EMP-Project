import { useEffect, useState } from 'react';
import { http } from '../api/http';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', bio: '' });
  useEffect(() => { http.get('/profile').then((r) => setProfile(r.data)); }, []);
  const save = async (e) => { e.preventDefault(); await http.put('/profile', profile); alert('Updated'); };

  return <form className="card" onSubmit={save}><h1>Profile</h1>
    <input value={profile.name || ''} onChange={(e)=>setProfile({...profile,name:e.target.value})} />
    <textarea value={profile.bio || ''} onChange={(e)=>setProfile({...profile,bio:e.target.value})} />
    <button>Save</button>
  </form>;
}

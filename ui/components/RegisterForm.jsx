'use client';

import { useState } from 'react';
import api from '@ui/lib/api';

export default function RegisterForm({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.register(email, password, name);
            const data = await response.json();
            setEmail('');
            setPassword('');
            setName('');
            onSuccess && onSuccess();
        } catch (error) {
            setError(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleRegister} style={{ marginBottom: 24 }}>
            <h2>Register</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
                style={{ display: 'block', marginBottom: 8 }}
            />
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ display: 'block', marginBottom: 8 }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={e => setPassword(e.target.value)}
                style={{ display: 'block', marginBottom: 8 }}
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </form>
    );
}
'use client';

import { useState } from 'react';
import api from '@ui/lib/api';

export default function LoginForm({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.loginLocal(email, password);
            const data = await response.json();
            setEmail('');
            setPassword('');
            onSuccess && onSuccess();
        } catch (error) {
            setError(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} style={{ marginBottom: 24 }}>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
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
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </form>
    );
}
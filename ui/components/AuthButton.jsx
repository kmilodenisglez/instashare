'use client';

import { useEffect, useState } from 'react';

export default function AuthButton() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user info on mount
    useEffect(() => {
        async function fetchUser() {
            const res = await fetch('http://localhost:8000/auth/me', {
                credentials: 'include',
            });
            const data = await res.json();
            if (data.authenticated) {
                setUser(data.user);
            } else {
                setUser(null);
            }
            setLoading(false);
        }
        fetchUser();
    }, []);

    const handleLogin = () => {
        const redirectUri = encodeURIComponent('http://localhost:3000/');
        window.location.href = `http://localhost:8000/auth/login?redirect_uri=${redirectUri}`;
    };

    const handleLogout = async () => {
        await fetch('http://localhost:8000/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
        window.location.reload();
    };

    if (loading) return (
        <button className="auth-btn" disabled>
            Loading...
        </button>
    );

    return user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span style={{ fontWeight: 500 }}>
        Welcome, {user.name || user.email}
      </span>
            <button className="auth-btn" onClick={handleLogout}>
                Logout
            </button>
            <style jsx>{`
        .auth-btn {
          background: #4285f4;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1.2rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .auth-btn:hover {
          background: #3367d6;
        }
      `}</style>
        </div>
    ) : (
        <button className="auth-btn" onClick={handleLogin}>
            Login with Google
            <style jsx>{`
        .auth-btn {
          background: #4285f4;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1.2rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .auth-btn:hover {
          background: #3367d6;
        }
      `}</style>
        </button>
    );
}
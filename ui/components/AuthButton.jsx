'use client';

import { useEffect, useState } from 'react';
import {api} from "../lib/api";

export default function AuthButton() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user info on mount
    useEffect(() => {
        async function fetchUser() {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
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
        const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/');
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login?redirect_uri=${redirectUri}`;
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await api.logout();
            setUser(null);
            // Redirect to home page instead of reload
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to logout:', error);
            // Show user-friendly error message
            alert('Logout failed. Please try again.');
        } finally {
            setLoading(false);
        }
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
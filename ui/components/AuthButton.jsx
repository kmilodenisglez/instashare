'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from "../lib/api";

export default function AuthButton() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user info on mount
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    credentials: 'include',
                });
                const data = await res.json();
                if (data.authenticated) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    const handleGoogleLogin = () => {
        const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/');
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login?redirect_uri=${redirectUri}`;
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await api.logout();
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to logout:', error);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/auth/login">
                <button className="auth-btn auth-btn-outline">
                    Login
                </button>
            </Link>
            <Link href="/auth/register">
                <button className="auth-btn">
                    Sign Up
                </button>
            </Link>
            <button className="auth-btn auth-btn-google" onClick={handleGoogleLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
            </button>
            <style jsx>{`
                .auth-btn {
                    background: #4285f4;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                }
                .auth-btn:hover {
                    background: #3367d6;
                    transform: translateY(-1px);
                }
                .auth-btn-outline {
                    background: transparent;
                    color: #4285f4;
                    border: 1px solid #4285f4;
                }
                .auth-btn-outline:hover {
                    background: #4285f4;
                    color: white;
                }
                .auth-btn-google {
                    background: #fff;
                    color: #757575;
                    border: 1px solid #dadce0;
                }
                .auth-btn-google:hover {
                    background: #f8f9fa;
                    color: #3c4043;
                }
            `}</style>
        </div>
    );
}
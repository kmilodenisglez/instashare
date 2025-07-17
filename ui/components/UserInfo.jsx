'use client';

import { useEffect, useState } from 'react';

export default function UserInfo() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user info on mount
    useEffect(() => {
        async function fetchUser() {
            // Try to fetch a protected resource to check authentication
            const res = await fetch('http://localhost:8000/api/v1/files', {
                credentials: 'include',
            });
            if (res.status === 200) {
                // Optionally, you can have a /me endpoint to get user info directly
                // For now, just show "Authenticated" if files are returned
                setUser({ email: 'Authenticated user' });
            } else {
                setUser(null);
            }
            setLoading(false);
        }
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await fetch('http://localhost:8000/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
        window.location.reload();
    };

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <div>
            <span>Not logged in.</span>
        </div>;
    }

    return (
        <div>
            <span>Welcome, {user.email}!</span>
            <button onClick={handleLogout} style={{ marginLeft: 8 }}>
                Logout
            </button>
        </div>
    );
}
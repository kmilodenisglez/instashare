'use client';

import { useEffect, useState } from 'react';
import {api} from "../lib/api";

export default function UserInfo() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user info on mount
    useEffect(() => {
        async function fetchUser() {
            const res = await api.getUser();
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

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <div>
            <span>Not logged in.</span>
        </div>;
    }

    return (
        <div>
            <span>Welcome, {user.name || user.email}!</span>
        </div>
    );
}
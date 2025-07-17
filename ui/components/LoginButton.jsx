'use client';

export default function LoginButton() {
    const handleLogin = () => {
        // Redirect to FastAPI backend login endpoint with redirect_uri back to frontend
        const redirectUri = encodeURIComponent('http://localhost:3000/');
        window.location.href = `http://localhost:8000/auth/login?redirect_uri=${redirectUri}`;
    };

    return (
        <button onClick={handleLogin}>
            Login with Google
        </button>
    );
}
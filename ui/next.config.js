/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enable static exports for better Netlify compatibility
    trailingSlash: true,

    // Configure images for Netlify
    images: {
        unoptimized: true
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    }
}

module.exports = nextConfig
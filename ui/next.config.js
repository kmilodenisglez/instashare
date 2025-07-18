/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enable static exports for better Netlify compatibility
    trailingSlash: true,

    // Configure images for Netlify
    images: {
        unoptimized: true
    },
    output: 'export',

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    }
}

module.exports = nextConfig
# Instashare Frontend (UI)

This is the frontend for Instashare, built with Next.js, Tailwind CSS, and designed for seamless integration with the Instashare backend API.

---

## Features
- Next.js 15 (App Router)
- Tailwind CSS 4
- Modern authentication UI (Google OAuth, classic login/register)
- File upload, list, and download UI
- Responsive and accessible design
- Ready for deployment on Netlify
- Linting and formatting with ESLint, Prettier

---

## Project Structure

```
ui/
├── app/                # Next.js app directory (pages, routes, layouts)
├── components/         # Reusable React components
├── lib/                # API and config helpers
├── styles/             # Global and Tailwind CSS
├── public/             # Static assets (images, favicon, etc.)
├── data/               # Static data (e.g., quotes)
├── .eslintrc.json      # ESLint config
├── .prettierrc         # Prettier config
├── package.json        # NPM scripts and dependencies
├── next.config.js      # Next.js config
├── netlify.toml        # Netlify config
└── README.md           # This file
```

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Lint and format code
```bash
npm run lint      # Run ESLint
npm run format    # Run Prettier (if defined)
```

### 4. Build for production
```bash
npm run build
npm start
```

---

## Environment Variables

- The frontend expects the backend API URL in `NEXT_PUBLIC_API_URL`.
- You can set this in a `.env.local` file:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```
- For Netlify, this can be set in the Netlify dashboard or via CLI.

---

## Deploying to Netlify

### Option 1: One-click Deploy (from GitHub)
- Use the Netlify dashboard to connect your repo and deploy.

### Option 2: Deploy using Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```
2. **Login to Netlify**
   ```bash
   netlify login
   ```
3. **Link your project (if not already linked)**
   ```bash
   netlify link
   ```
4. **Set environment variables**
   ```bash
   netlify env:set NEXT_PUBLIC_API_URL https://your-backend-url
   ```
5. **Run locally with Netlify CLI (optional)**
   ```bash
   netlify dev
   ```
6. **Deploy to Netlify**
   ```bash
   netlify deploy --prod
   ```

---

## Notes
- The frontend is designed to work with the Instashare backend API (see backend README for API details).
- For Google OAuth to work, the backend must be running and properly configured.
- All file upload, list, and download actions are proxied to the backend API.
- For local development, ensure both frontend and backend are running and CORS is configured if needed.

---

## License
MIT

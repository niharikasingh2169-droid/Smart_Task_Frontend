# Smart Task UI

A Next.js application for managing tasks with Material-UI.

## Demo

<video width="100%" controls>
  <source src="assets/demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Configuration

The API endpoint is configured via environment variables. 

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. The default API URL is `http://localhost:8000/api/tasks`. If your backend runs on a different URL, update `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/tasks
   ```

### Production Deployment (Render)

When deploying to Render:

1. **Service Type:** Deploy as a **Web Service** (not a Static Site), since this is a Next.js application with dynamic routes.

2. **Build Command:** `npm install && npm run build`

3. **Start Command:** `npm start`

4. **Environment Variables:** Set the following environment variable in your Render dashboard:
   - **Variable Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** Your deployed backend API URL (e.g., `https://your-api.onrender.com/api/tasks`)

**Note:** 
- In Next.js, environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser, which is required for client-side API calls.
- This application uses dynamic routes (`/tasks/[id]/edit`), so it must be deployed as a Node.js web service, not as a static site.


# Predictions Portal

This is a Next.js application that provides both the Submission Portal and the Backend API for the Crew's Predictions overlay.

## Setup Instructions (Vercel)

This app uses **Vercel KV (Redis)** for data storage, which is zero-configuration when deployed to Vercel.

### 1. Deploy to Vercel
1. Import this folder into a new project on Vercel.
2. Under the **Storage** tab of your Vercel project, click **Create Database** and select **KV (Redis)**.
3. Once created, Vercel will automatically add the required environment variables (like `KV_URL`, `KV_REST_API_URL`, etc.) to your project.
4. Redeploy the project so it picks up the KV variables.

### 2. Connect your Local Dashboard
In your local Control Dashboard (`http://localhost:4000/control`), paste your Vercel deployment URL (e.g., `https://your-app.vercel.app`) into the **Fetch Web** URL box in the Crew Predictions panel.

Now, any crew member can go to `https://your-app.vercel.app/[bountyId]/[matchId]` to submit predictions for that exact match, and you can pull them instantly!

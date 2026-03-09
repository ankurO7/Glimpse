# Glimpse 📹✨

Glimpse is a full-stack, AI-powered screen recording and video management platform. It allows users to capture their screen and microphone, upload recordings directly to Mux, and automatically generate AI transcripts and video summaries. 

Built with a focus on scalable video infrastructure, Glimpse leverages secure webhooks and direct-to-cloud uploading to handle heavy video processing seamlessly.

## 🚀 Features

* **Native Screen Recording:** Capture screen, window, or browser tab alongside microphone audio using the native `MediaRecorder` API.
* **Direct-to-Cloud Uploads:** Videos bypass the Next.js server entirely, uploading directly to Mux using secure, pre-signed URLs to handle large files without server timeouts.
* **Asynchronous Processing:** A robust webhook pipeline syncs Mux's cloud processing states directly with a local database in real-time.
* **AI Transcripts & Summaries:** Automatically extracts spoken audio and generates structured VTT transcripts and intelligent summaries using Mux AI.
* **Secure Dashboards:** Protected user sessions via NextAuth.js, ensuring users can only view and manage their own isolated video libraries.

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Database:** Prisma ORM
* **Video Infrastructure:** Mux (Video API & AI Workflows)
* **Authentication:** NextAuth.js (Google Provider)
* **Styling:** Tailwind CSS & Lucide React Icons

## 🚦 Getting Started (Local Development)

### 1. Clone & Install
```bash
git clone [https://github.com/yourusername/Glimpse.git](https://github.com/yourusername/Glimpse.git)
cd bloom
npm install
```

### 2. Environment Variables
    Create a .env file in the root directory and add the following keys:

    # Database
    ```bash
    DATABASE_URL="your_database_connection_string"
    ```

    ```bash # NextAuth
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your_nextauth_secret"
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    ```
    ```bash # Mux Video API
    MUX_TOKEN_ID="your_mux_token_id"
    MUX_TOKEN_SECRET="your_mux_token_secret"
    MUX_WEBHOOK_SECRET="your_mux_webhook_signing_secret"
    ```
### 3. Database Setup
    Push the schema to your database to create the necessary tables:

```bash
    npx prisma db push
    npx prisma generate
```

### 4. Local Webhook Tunneling (Crucial for Local Dev)
Because Mux needs a public URL to send webhook events (like "video is ready") to your local machine, you must run a tunnel alongside your Next.js server.

Open a new terminal and run:

```bash
npx cloudflared tunnel --url http://localhost:3000
```
Copy the generated .trycloudflare.com URL, append /api/webhooks/mux to it, and save it in your Mux Dashboard Webhook settings.

5. Run the Application

```bash
npm run dev
```
### 6. Open http://localhost:3000 in your browser to start recording!

### 🧠 Architecture Highlights
-- Event-Driven Webhooks: Built to handle the asynchronous nature of video encoding. When a video finishes processing in the cloud, Mux fires a webhook containing the passthrough ID, which the Next.js API route catches and securely maps to the correct user in the Prisma database.

-- Client-Side Blob Handling: Manages active memory efficiently by collecting recorded chunks and converting them into actionable WebM blobs for immediate playback and upload.

👨‍💻 Author
Ankur Kumar

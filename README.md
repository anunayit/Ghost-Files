This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 👻 GhostFiles: Zero-Knowledge Privacy Suite

**GhostFiles** is a powerful, client-side privacy utility designed to detect and surgically remove hidden forensic tracking data (metadata, EXIF, GPS) from digital files. 

Built with a "Zero-Knowledge" architecture, GhostFiles processes everything entirely within your browser. Your files are **never** uploaded to an external server or cloud storage system.

---

## 🚀 Features

* **📸 Image Surgeon (JPG, PNG, WEBP)**
    * Scans for embedded GPS coordinates and device hardware models.
    * Triggers an active UI threat alert if privacy leaks are detected.
    * Utilizes the HTML5 Canvas API to redraw the image pixel-by-pixel, stripping all EXIF data.
* **📼 Video Scrubber (MP4)**
    * Leverages **WebAssembly (WASM)** to run a full C++ FFmpeg engine directly inside the browser.
    * Copies video and audio streams while dropping global metadata tracks (`-map_metadata -1`).
    * Bypasses heavy re-encoding for lightning-fast sanitization.
* **📄 Document Sanitizer (PDF)**
    * Parses the binary structure of PDF documents.
    * Locates and wipes hidden "Author," "Creator," and "Software Tool" dictionaries.
    * Repacks the file into a secure, anonymous document.

---

## 💻 Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript / JavaScript
* **Styling:** Tailwind CSS (Custom Cyber/Terminal UI)
* **Core Engines:**
    * `@ffmpeg/ffmpeg` & `@ffmpeg/util` (Browser-based video processing)
    * `exifr` (Forensic image scanning)
    * `pdf-lib` (Document manipulation)
* **Deployment:** Vercel

---

## 🛠️ Getting Started (Local Development)

To run GhostFiles on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/anunayit/Ghost-Files.git](https://github.com/anunayit/Ghost-Files.git)
    cd Ghost-Files
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    npm install @ffmpeg/ffmpeg @ffmpeg/util exifr pdf-lib
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to `http://localhost:3000` to see the application running.

---

## 🛡️ Security & Architecture Notes

Running high-performance WebAssembly (like FFmpeg) in the browser requires strict memory isolation. If you are deploying this project, you **must** configure your server to send the following security headers to enable `SharedArrayBuffer`:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp

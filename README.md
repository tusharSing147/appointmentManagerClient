# Daybook Client

A modern, responsive frontend application built with **React, TypeScript, and Vite** for the Daybook appointment management system.

## 🚀 Features

- Modern React-based user interface
- TypeScript for type safety and maintainable code
- Fast development environment powered by Vite
- Responsive UI for different screen sizes
- Custom typography using Manrope and Instrument Serif fonts
- Optimized production builds
- TypeScript type checking
- Production preview support

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Frontend UI library |
| React DOM | Rendering React components |
| TypeScript | Type safety |
| Vite 6 | Development server and build tool |
| Manrope | Primary typography |
| Instrument Serif | Display typography |
| npm | Package management |

## 📁 Project Structure

```text
client
 ┣ public
 ┃ ┗ favicon.svg
 ┣ src
 ┃ ┣ components
 ┃ ┃ ┣ AppointmentForm.tsx
 ┃ ┃ ┣ AppointmentList.tsx
 ┃ ┃ ┣ AppointmentRow.tsx
 ┃ ┃ ┣ FilterTabs.tsx
 ┃ ┃ ┣ SearchBar.tsx
 ┃ ┃ ┗ Toast.tsx
 ┃ ┣ api.ts
 ┃ ┣ App.tsx
 ┃ ┣ format.ts
 ┃ ┣ main.tsx
 ┃ ┣ styles.css
 ┃ ┣ types.ts
 ┃ ┗ vite-env.d.ts
 ┣ .env.example
 ┣ index.html
 ┣ package-lock.json
 ┣ package.json
 ┣ README.md
 ┣ tsconfig.json
 ┗ vite.config.ts
```

*Note: The folder structure above is a suggested structure. Update it according to your actual project.*

## 📋 Prerequisites

Make sure you have the following installed:

- Node.js >= 20
- npm >= 10

## ⚙️ Installation

**1. Clone the repository**

```bash
git clone <your-repository-url>
```

**2. Navigate to the project directory**

```bash
cd daybook-client
```

**3. Install dependencies**

```bash
npm install
```

## 🔐 Environment Variables

If the frontend connects to the Daybook backend API, create a `.env` file in the root directory.

```env
VITE_API_URL=http://localhost:4000
```

For production, update the API URL:

```env
VITE_API_URL=https://your-production-api.com
```

**Important:** Vite exposes variables prefixed with `VITE_` to client-side code. Never store private keys, database credentials, or sensitive secrets in frontend environment variables.

## ▶️ Running the Application

**Development mode**

Start the Vite development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

**Production build**

Generate an optimized production build:

```bash
npm run build
```

The generated production files will be available in:

```text
dist/
```

**Preview production build**

Preview the production build locally:

```bash
npm run preview
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and generate production build |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |

## 🔍 Type Checking

Run TypeScript checks without generating output files:

```bash
npm run typecheck
```

This helps identify type-related errors before building or deploying the application.

## 🏗️ Production Deployment

Build the application:

```bash
npm run build
```

After successful compilation, deploy the generated `dist/` directory to your hosting provider.

Supported hosting options include:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx
- Apache

For single-page application routing, configure your hosting provider to redirect application routes to `index.html`.

## 🔗 Backend Integration

The Daybook Client communicates with the Daybook Server API.

Default backend URL:

```text
http://localhost:4000
```

Configure the backend API URL through the `VITE_API_URL` environment variable.

Ensure the backend server is running and CORS is configured to allow requests from the frontend origin.

## 🔒 Security Recommendations

- Never expose private API keys in frontend code.
- Use HTTPS in production.
- Validate API responses and user inputs.
- Handle API errors gracefully.
- Store authentication tokens securely.
- Configure appropriate backend CORS policies.
- Keep dependencies updated.

## 📄 License

This project is private and intended for the Daybook application.

---

**Daybook Client** – A modern frontend experience for managing appointments efficiently.
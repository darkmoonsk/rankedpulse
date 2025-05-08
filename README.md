# Ranked Pulse

A modern SaaS platform for website performance analysis, SEO monitoring, and accessibility evaluation. Ranked Pulse helps site owners, bloggers, and small businesses get actionable insights to improve their web presence.

![Ranked Pulse](https://github.com/user-attachments/assets/341ce8ee-30ef-4d65-8a96-191fa99ecbd8)

## Overview

Ranked Pulse is designed to democratize access to technical website audits by providing a user-friendly platform for monitoring and improving website performance. The platform offers:

- **Comprehensive Analysis**: Performance, SEO, accessibility, and best practices evaluations
- **Actionable Insights**: Clear recommendations prioritized by impact
- **Historical Monitoring**: Track progress over time with trend analysis
- **Easy Sharing**: Export reports and share results with stakeholders

## Features

### Core Functionality

- User authentication and profile management
- URL management (add, delete, rescan)
- Performance analysis
- SEO evaluation (meta tags, headings, canonical links, etc.)
- Accessibility scoring
- Best practices recommendations
- Average score calculation across all metrics
- Historical analysis and trend tracking

### Future Roadmap

- Advanced filtering and searching
- Email notifications for score changes
- Customizable dashboards
- Team collaboration features
- API access for integration with other tools

## Tech Stack

### Frontend

- **Next.js 15** (App Router) - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library

### Backend

- **Next.js API Routes** - Serverless backend
- **Prisma ORM** - Database access
- **PostgreSQL** - Database
- **Clerk** - Authentication

### APIs & Services

- **Google PageSpeed Insights** - Performance metrics
- **Custom SEO Parser** - SEO analysis

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository

```bash
git clone https://github.com/darkmoonsk/rankedpulse.git
cd rankedpulse
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```
# Create a .env file with the following variables
DATABASE_URL="postgresql://user:password@localhost:5432/rankedpulse"
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
PAGESPEED_API_KEY=your_google_api_key
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Start the development server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Deployment

The application is designed to be deployed on platforms like Vercel or Netlify with serverless functions. The database can be hosted on services like Railway, Supabase, or any PostgreSQL provider.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Clerk](https://clerk.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PageSpeed Insights API](https://developers.google.com/speed/pagespeed/insights/)

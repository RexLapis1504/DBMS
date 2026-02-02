# TimeMaster - Timetable Management System

A modern, full-featured timetable management system built for SVKM NMIMS. Built with Next.js 16, React 19, Tailwind CSS, shadcn/ui, and PostgreSQL.

![TimeMaster](https://img.shields.io/badge/TimeMaster-SVKM%20NMIMS-8B5CF6)

## Features

- **Role-Based Access Control** - Admin, Teacher, and Student portals
- **Smart Scheduling** - Automatic conflict detection for teachers, rooms, and classes
- **CRUD Operations** - Manage Rooms, Teachers, Subjects, Classes, Students, and Time Slots
- **Timetable Views** - View by Class, Teacher, or Room
- **Beautiful Dark UI** - Pure black (#000000) theme with purple accents
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

## Prerequisites

- [Bun](https://bun.sh/) v1.0+ installed
- [Supabase](https://supabase.com/) account (free tier works)
- Git

## Quick Start

### 1. Clone and Install

```bash
cd timemaster
bun install
```

### 2. Set Up Supabase Database

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Wait for the database to be provisioned
3. Go to **Project Settings** > **Database** > **Connection string** > **URI**
4. Copy the connection string (it looks like `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"



### 4. Set Up Database

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Seed with sample data
bun run db:seed
```

### 5. Start Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

After seeding the database:

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@nmims.edu   | admin123  |

## Project Structure

```
timemaster/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data script
├── src/
│   ├── app/
│   │   ├── (auth)/        # Login/Register pages
│   │   ├── (dashboard)/   # Protected dashboard pages
│   │   ├── api/           # API routes
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Sidebar, Header
│   │   ├── motion/        # Animation components
│   │   └── dashboard/     # Dashboard components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── db.ts          # Prisma client
│   │   └── utils.ts       # Utility functions
│   └── middleware.ts      # Route protection
├── .env.example           # Environment variables template
└── package.json
```

## Database Schema

The system manages the following entities:

- **Users** - Authentication (Admin, Teacher, Student roles)
- **Rooms** - Classrooms, Labs, Auditoriums
- **Teachers** - Faculty with subject assignments
- **Subjects** - Course subjects with credits
- **Classes** - Programs/Divisions (MBA Tech, BTech CE, etc.)
- **Students** - Enrolled in classes
- **TimeSlots** - Day + Period definitions
- **TimetableEntries** - The actual schedule (links Class + Teacher + Subject + Room + TimeSlot)

### Conflict Prevention

The schema includes unique constraints to prevent:
- Same teacher teaching two classes at the same time
- Same room hosting two classes at the same time
- Same class having two subjects at the same time

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:push` | Push schema to database |
| `bun run db:migrate` | Create migration |
| `bun run db:seed` | Seed database |
| `bun run db:studio` | Open Prisma Studio |
| `bun run db:reset` | Reset database |

## API Endpoints

All API routes are under `/api/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/rooms` | List/Create rooms |
| GET/PATCH/DELETE | `/api/rooms/[id]` | Get/Update/Delete room |
| GET/POST | `/api/teachers` | List/Create teachers |
| GET/PATCH/DELETE | `/api/teachers/[id]` | Get/Update/Delete teacher |
| GET/POST | `/api/subjects` | List/Create subjects |
| GET/PATCH/DELETE | `/api/subjects/[id]` | Get/Update/Delete subject |
| GET/POST | `/api/classes` | List/Create classes |
| GET/PATCH/DELETE | `/api/classes/[id]` | Get/Update/Delete class |
| GET/POST | `/api/students` | List/Create students |
| GET/PATCH/DELETE | `/api/students/[id]` | Get/Update/Delete student |
| GET/POST | `/api/timeslots` | List/Create time slots |
| GET/PATCH/DELETE | `/api/timeslots/[id]` | Get/Update/Delete time slot |
| GET/POST | `/api/timetable` | List/Create timetable entries |
| GET/PATCH/DELETE | `/api/timetable/[id]` | Get/Update/Delete entry |

## Customization

### Theme Colors

Edit `src/app/globals.css` to change the color scheme:

```css
:root {
  --primary: #8B5CF6;  /* Purple accent */
  --background: #000000;  /* Pure black */
  /* ... other variables */
}
```

### Time Slots

Default time slots are:
- Period 1: 09:00 - 10:00
- Period 2: 10:00 - 11:00
- Period 3: 11:15 - 12:15
- Period 4: 12:15 - 13:15
- Period 5: 14:00 - 15:00
- Period 6: 15:00 - 16:00

Modify in the admin dashboard or edit `prisma/seed.ts`.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

```bash
# Build command
bun run build

# Install command
bun install
```

### Docker

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["bun", "run", "server.js"]
```

## Troubleshooting

### Database Connection Issues

1. Verify your `DATABASE_URL` in `.env`
2. Check Supabase project is active
3. Ensure your IP is allowed in Supabase dashboard

### Prisma Client Issues

```bash
bun run db:generate
```

### Authentication Issues

1. Ensure `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for your institution.

---

Built with care for SVKM NMIMS

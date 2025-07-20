# JobFlow - Job Search Management Platform

## Overview

JobFlow is a comprehensive full-stack web application for managing job searches, applications, and career tracking. It features a React frontend and Express.js backend, using PostgreSQL for data storage and Replit authentication for user management. The platform now includes advanced features like a resume builder and Stepstone job integration for enhanced job discovery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Development Setup
- **Monorepo Structure**: Shared client/server codebase with common schema
- **Hot Reload**: Vite dev server with HMR for frontend development
- **Error Handling**: Runtime error overlay for development
- **Path Aliases**: TypeScript path mapping for clean imports

## Key Components

### Database Schema (`shared/schema.ts`)
- **Users**: Replit user profiles with OAuth integration
- **Companies**: Job posting organizations
- **Jobs**: Available positions with detailed metadata
- **Applications**: User job applications with status tracking
- **Saved Jobs**: User bookmarked positions
- **Job Alerts**: Automated job notifications
- **Resumes**: User resume data with structured sections (experience, education, skills, projects)
- **External Job Sources**: Integration tracking for Stepstone and other job boards
- **Sessions**: Authentication session storage

### Authentication System
- **Provider**: Replit Auth with OIDC discovery
- **Session Management**: Secure HTTP-only cookies with PostgreSQL storage
- **Authorization**: Middleware-based route protection
- **User Management**: Automatic user creation/updates from OAuth claims

### Frontend Pages
- **Landing**: Unauthenticated marketing page with login
- **Dashboard**: Overview with stats, activity feed, and featured jobs
- **Jobs**: Browse/search jobs with filtering capabilities and Stepstone integration
- **Applications**: Track application status and history
- **Saved Jobs**: Manage bookmarked positions
- **Resume Builder**: Create and manage professional resumes with multiple templates

### API Routes
- **Auth**: User profile and authentication status
- **Dashboard**: User statistics and recent activity
- **Jobs**: CRUD operations with search/filter capabilities
- **Applications**: Application management and tracking
- **Saved Jobs**: Bookmark functionality
- **Resumes**: Full CRUD operations for resume management
- **Stepstone Integration**: External job synchronization from Stepstone platform

## Data Flow

1. **Authentication Flow**:
   - User initiates login via Replit Auth
   - OIDC discovery and token exchange
   - Session creation in PostgreSQL
   - User profile upsert in database

2. **Job Discovery**:
   - Jobs fetched with optional filters (location, type, salary)
   - Real-time match scoring for personalization
   - Pagination and search capabilities

3. **Application Process**:
   - Users apply to jobs with status tracking
   - Activity timeline for application history
   - Email notifications (future enhancement)

4. **Data Persistence**:
   - All user interactions stored in PostgreSQL
   - Session-based authentication state
   - Optimistic UI updates with React Query

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Cloud-hosted database
- **Connection Pooling**: Built-in connection management
- **Migrations**: Drizzle Kit for schema versioning

### Authentication
- **Replit Auth**: OAuth 2.0/OIDC provider
- **Session Storage**: PostgreSQL table for session persistence
- **Security**: HTTPS-only cookies with CSRF protection

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: SVG icon library
- **Date Handling**: date-fns for date manipulation
- **Form Validation**: Zod schema validation

### Development Tools
- **TypeScript**: Static typing throughout the stack
- **ESLint/Prettier**: Code formatting and linting
- **Vite Plugins**: Development enhancement and error handling

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles TypeScript server to `dist/index.js`
- **Assets**: Static files served by Express in production

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **Auth**: `REPL_ID` and `SESSION_SECRET` for Replit Auth
- **Domain**: `REPLIT_DOMAINS` for CORS configuration

### Production Deployment
- **Server**: Single Node.js process serving both API and static files
- **Database**: Neon serverless PostgreSQL with connection pooling
- **CDN**: Replit's built-in static file serving
- **Monitoring**: Express request logging and error handling

The application follows a standard three-tier architecture with clear separation between presentation (React), business logic (Express), and data (PostgreSQL) layers. The use of TypeScript throughout ensures type safety, while modern tooling provides excellent developer experience.
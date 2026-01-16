# BuildVault - Construction Photo Capture Web App

A Next.js web application for construction companies (pools and spa) to upload and manage project photos in a centralized Supabase database.

## Features

- **Role-Based Access Control**: Three user roles (Admin, Manager, Staff) with different permissions
- **User Approval Workflow**: New users register but cannot access the app until approved by Admin/Manager
- **Project Management**: Create and manage construction sites/projects
- **Photo Upload**: Upload single or multiple photos per project
- **Photo Gallery**: View and manage project photos
- **Admin Dashboard**: Manage user approvals and roles

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL + Storage)
- **UI Components**: Radix UI Primitives
- **Authentication**: Supabase Auth (Email/Password)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your Supabase project:

   - Create a new Supabase project at https://supabase.com
   - Run the SQL migration files in `supabase/migrations/` in your Supabase SQL editor:
     - First run `001_initial_schema.sql`
     - Then run `002_storage_setup.sql`

3. Set up environment variables:

   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

   You can find these values in your Supabase project settings under API.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The application uses the following main tables:

- `user_profiles`: Extended user profiles with roles and approval status
- `sites`: Construction projects/sites
- `photos`: Project photos with metadata

Row Level Security (RLS) policies are configured to ensure:
- Only approved users can access the app
- Users can only perform actions based on their role
- Admins and Managers can manage users and projects
- All approved users can upload and view photos

## User Roles

- **Admin**: Full access to all features including user management
- **Manager**: Can manage users, projects, and photos
- **Staff**: Can view projects and upload photos

## User Registration Flow

1. User signs up with email/password
2. Account is created with status "pending"
3. User is redirected to pending approval page
4. Admin or Manager approves/rejects the account
5. Once approved, user can access the application

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── admin/       # Admin user management
│   ├── projects/    # Project pages
│   ├── login/       # Authentication pages
│   └── ...
├── components/      # React components
│   ├── ui/         # Radix UI primitives
│   └── ...
├── lib/            # Utilities and Supabase clients
└── types/          # TypeScript type definitions
```

## Deployment

The application can be deployed to Vercel, Netlify, or any platform that supports Next.js.

Make sure to set the environment variables in your deployment platform's settings.

## License

Private - All rights reserved




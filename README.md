# Awn (عَون)

## Displaced Families Assistance & Data Management System

Awn is a web-based software system designed to help humanitarian organizations manage displaced families' information, assess vulnerability levels, record assistance and services, and generate useful reports from a centralized data source.

The system focuses on structured data management, role-based access, traceable assistance records, and clear operational visibility for staff and decision-makers.

## Problem

Humanitarian organizations often manage displaced families' information through paper records, spreadsheets, or disconnected digital tools. This can lead to duplicated records, inconsistent information, difficulty identifying high-vulnerability families, repeated or missed assistance, and limited reporting capabilities.

Awn addresses this problem by providing a centralized system where authorized users can register and update family records, assess vulnerability, track assistance history, search across family data, and generate operational reports.

## Main Features

- Secure authentication using Supabase Auth
- Role-based access control for different user types
- Displaced family registration and information management
- Duplicate National ID prevention
- Local search within an assigned camp or location
- Global search across all camps and displacement locations
- Family profile and assistance history
- Vulnerability assessment with automatic score and level calculation
- Assistance and service recording
- Dashboard statistics and operational insights
- Reports by location, vulnerability level, assistance type, and assistance history
- Printable report and assistance-history export
- User account management for system administrators
- Account activation and deactivation
- Working camp assignment for data entry staff
- Password reset support

## User Roles

### System Administrator

Responsible for system-level user and access management.

Main capabilities:

- View the administration dashboard
- Create user accounts
- Update user accounts
- Assign user roles
- Assign camps to Data Entry Staff
- Activate or deactivate accounts
- Review the system's predefined role permissions

### Data Entry Staff

Responsible for daily family data management within an assigned camp or displacement location.

Main capabilities:

- Register displaced families
- Search families within the assigned camp
- View family profiles
- Update family information
- Record vulnerability assessments
- Record assistance and services
- Review assistance history

### Organization Manager

Responsible for monitoring, inquiry, reporting, and decision support.

Main capabilities:

- View dashboard statistics and insights
- Perform global family search
- View family profiles and assistance history
- Generate filtered reports
- Export printable reports

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React

### Backend and Data Services

- Supabase Auth
- Supabase PostgreSQL Database
- Supabase Row Level Security (RLS)
- Supabase RPC functions
- Supabase Edge Functions

### Development Tools

- Git and GitHub
- Visual Studio Code
- npm

## Project Structure

````text
src/
├── assets/
├── components/
├── features/
├── layouts/
├── lib/
├── pages/
├── routes/
├── App.tsx
└── main.tsx

supabase/
├── config.toml
├── migrations/
│   └── 20260704161714_initial_schema.sql
└── functions/
    └── admin-users/

The frontend is organized into reusable components, feature modules, layouts, pages, routing, authentication logic, and Supabase data-access utilities. Administrative user operations that require elevated privileges are handled through a Supabase Edge Function.

## Setup and Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/mohammed-alhanjouri/Displaced-Families-Assistance-Data-Management-System.git
cd Displaced-Families-Assistance-Data-Management-System
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not commit the real `.env` file to version control.

### 4. Prepare Supabase

The project requires a configured Supabase project with:

- Email/password authentication enabled
- Application database tables and relationships
- Row Level Security policies
- Required database functions and triggers
- The `resolve_login_email` RPC function used for username-based login
- The `admin-users` Edge Function used for privileged user-management operations
- Required Edge Function environment secrets

### 5. Start the development server

```bash
npm run dev
```

Open the local URL shown by Vite in the terminal.

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Runs TypeScript checks and creates a production build.

```bash
npm run lint
```

Runs ESLint across the project.

```bash
npm run preview
```

Previews the production build locally.

## Supabase Requirements

To run the complete system, the connected Supabase project must include the application's authentication configuration, database schema, relationships, constraints, RLS policies, database functions, triggers, required reference data, such as configured camp/location records, in the target Supabase environment, and the deployed `admin-users` Edge Function.

The application currently depends on core data entities such as:

- `profiles`
- `camps`
- `families`
- `vulnerability_assessments`
- `family_assistance`

Additional database functions and security policies are required for authentication, authorization, and role-specific access.

## Author

**Mohammed M. Al Hanjouri**  
Front-End Developer

## Project Vision

Awn is intended to be more than a data-entry interface. Its goal is to provide a practical, extensible foundation for organized humanitarian data management, clearer assistance tracking, vulnerability-based prioritization, and better operational decision-making.

The system can be extended in future versions with features such as cross-organization coordination, advanced analytics, offline-first synchronization, multilingual interfaces, notification workflows, and broader humanitarian service modules.

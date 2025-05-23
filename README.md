# Patient Registration System

A modern web application for managing patient registrations, built with React, TypeScript, and PGlite (PostgreSQL-compatible in-browser database).

## Features

- Patient registration and management
- Query records using raw SQL.
- Form validation and error handling
- Persist patient data across page refreshes.
- Support usage across multiple tabs (in the same browser) and make sure writes and reads are synchronized.
- Responsive design
- In-browser database (no external database required)

## Challenges Faced

During the development of this application, several significant challenges were encountered and addressed. For a detailed overview of the challenges and their solutions, please see [Challenges.md](./Challenges.md).

Key challenges include:

- Multi-tab synchronization for real-time data consistency
- Database persistence across page refreshes
- Bundle size optimization for better performance

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Medblocks-Patient-Registration
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173` by default.

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
patient-registration/
├── src/
│   ├── components/     # React components
│   ├── context/       # React context providers
│   ├── lib/           # Utility functions and database setup
│   ├── pages/         # Page components
│   └── App.tsx        # Main application component
├── public/            # Static assets
└── package.json       # Project dependencies and scripts
```

## Usage

### Patient Registration

1. Navigate to the patient registration form
2. Fill in the required fields:
   - First Name
   - Last Name
   - Preferred Name
   - Date of Birth
   - Gender
   - Phone Number
   - Address
3. Optional fields:
   - Email
   - State
   - City
   - Medical History
4. Click "Save" to register the patient

### SQL Query Interface

1. Navigate to the SQL Query page
2. Enter your SQL query in the editor
3. Click "Execute Query" to run the query
4. View results in the table below
5. Common queries:

   ```sql
   -- List all patients
   SELECT * FROM patients;

   -- Search patients by name
   SELECT * FROM patients WHERE last_name LIKE '%Smith%';

   -- Get patient count
   SELECT COUNT(*) FROM patients;
   ```

## Database Schema

The application uses a PostgreSQL-compatible in-browser database with the following schema:

```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  date_of_birth TEXT NOT NULL,
  gender TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  state TEXT,
  city TEXT,
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production

## Dependencies

### Main Dependencies

- React 18
- TypeScript
- PGlite (PostgreSQL-compatible in-browser database)
- React Router DOM
- Framer Motion
- React Hot Toast
- Tailwind CSS

### Development Dependencies

- Vite
- ESLint
- TypeScript
- Tailwind CSS
- PostCSS
- Autoprefixer

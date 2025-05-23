import { PGliteWorker } from "@electric-sql/pglite/worker";

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  preferred_name?: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  medical_history?: string;
  created_at: string;
}

interface TableCheckResult {
  exists: boolean;
}

let dbInstance: PGliteWorker | null = null;
let isInitializing = false;

const initSchema = async (database: PGliteWorker) => {
  try {
    // Check if table exists
    const tableCheck = await database.query<TableCheckResult>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'patients'
      ) as exists;
    `);

    const tableExists = tableCheck.rows[0]?.exists;

    if (!tableExists) {
      console.log("Creating patients table...");
      // Create table with updated schema and constraints
      await database.query(`
        CREATE TABLE patients (
          id SERIAL PRIMARY KEY,
          first_name TEXT NOT NULL CHECK (length(first_name) >= 1 AND length(first_name) <= 100),
          last_name TEXT NOT NULL CHECK (length(last_name) >= 1 AND length(last_name) <= 100),
          preferred_name TEXT CHECK (length(preferred_name) <= 100),
          date_of_birth DATE NOT NULL CHECK (
            date_of_birth <= CURRENT_DATE AND 
            date_of_birth >= CURRENT_DATE - INTERVAL '120 years'
          ),
          gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
          email TEXT UNIQUE CHECK (
            email IS NULL OR 
            email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
          ),
          phone TEXT UNIQUE CHECK (
            phone IS NULL OR 
            phone ~ '^[+]?[0-9]{10,15}$'
          ),
          address TEXT CHECK (length(address) <= 200),
          state TEXT CHECK (length(state) <= 100),
          city TEXT CHECK (length(city) <= 100),
          medical_history TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT valid_email_format CHECK (
            email IS NULL OR 
            email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
          ),
          CONSTRAINT valid_phone_format CHECK (
            phone IS NULL OR 
            phone ~ '^[+]?[0-9]{10,15}$'
          )
        );
      `);

      await database.query(`
        CREATE INDEX IF NOT EXISTS idx_patient_name ON patients (last_name, first_name);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_email ON patients (email) WHERE email IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_phone ON patients (phone) WHERE phone IS NOT NULL;
      `);
      console.log("Database schema initialized with constraints");
    } else {
      console.log("Patients table already exists");
    }
  } catch (error) {
    console.error("Error initializing schema:", error);
    throw error;
  }
};

export const initDatabase = async (): Promise<PGliteWorker> => {
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return dbInstance!;
  }

  if (!dbInstance) {
    isInitializing = true;
    try {
      console.log("Initializing database...");
      const workerInstance = new Worker(
        new URL("/pglite-worker.js", import.meta.url),
        {
          type: "module",
        }
      );
      dbInstance = new PGliteWorker(workerInstance);

      // Wait a bit to ensure worker is ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      await initSchema(dbInstance);
      console.log("Database initialization complete");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      dbInstance = null;
      throw error;
    } finally {
      isInitializing = false;
    }
  }
  return dbInstance;
};

// Add validation types and functions
export interface PatientInput {
  first_name: string;
  last_name: string;
  preferred_name?: string;
  date_of_birth: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  medical_history?: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const validatePatientInput = (input: PatientInput): void => {
  // Required field validation
  if (!input.first_name?.trim()) {
    throw new ValidationError("First name is required");
  }
  if (!input.last_name?.trim()) {
    throw new ValidationError("Last name is required");
  }
  if (!input.date_of_birth) {
    throw new ValidationError("Date of birth is required");
  }
  if (!input.gender) {
    throw new ValidationError("Gender is required");
  }

  // Length validation
  if (input.first_name.length > 100) {
    throw new ValidationError("First name must be 100 characters or less");
  }
  if (input.last_name.length > 100) {
    throw new ValidationError("Last name must be 100 characters or less");
  }
  if (input.preferred_name && input.preferred_name.length > 100) {
    throw new ValidationError("Preferred name must be 100 characters or less");
  }
  if (input.address && input.address.length > 200) {
    throw new ValidationError("Address must be 200 characters or less");
  }
  if (input.state && input.state.length > 100) {
    throw new ValidationError("State must be 100 characters or less");
  }
  if (input.city && input.city.length > 100) {
    throw new ValidationError("City must be 100 characters or less");
  }

  // Email validation
  if (input.email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
    if (!emailRegex.test(input.email)) {
      throw new ValidationError("Invalid email format");
    }
  }

  // Phone validation
  if (input.phone) {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(input.phone)) {
      throw new ValidationError(
        "Invalid phone number format. Must be 10-15 digits with optional + prefix"
      );
    }
  }

  // Date of birth validation
  const dob = new Date(input.date_of_birth);
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120);

  if (isNaN(dob.getTime())) {
    throw new ValidationError("Invalid date of birth format");
  }
  if (dob > today) {
    throw new ValidationError("Date of birth cannot be in the future");
  }
  if (dob < minDate) {
    throw new ValidationError(
      "Date of birth cannot be more than 120 years ago"
    );
  }

  // Gender validation
  const validGenders = ["male", "female", "other", "prefer_not_to_say"];
  if (!validGenders.includes(input.gender)) {
    throw new ValidationError("Invalid gender value");
  }
};

// Add new validation functions
const checkEmailUniqueness = async (
  database: PGliteWorker,
  email: string,
  excludeId?: number
): Promise<boolean> => {
  if (!email) return true;

  const query = excludeId
    ? "SELECT EXISTS (SELECT 1 FROM patients WHERE email = $1 AND id != $2) as exists"
    : "SELECT EXISTS (SELECT 1 FROM patients WHERE email = $1) as exists";

  const params = excludeId ? [email, excludeId] : [email];
  const result = await database.query<{ exists: boolean }>(query, params);
  return !result.rows[0]?.exists;
};

const checkPhoneUniqueness = async (
  database: PGliteWorker,
  phone: string,
  excludeId?: number
): Promise<boolean> => {
  if (!phone) return true;

  const query = excludeId
    ? "SELECT EXISTS (SELECT 1 FROM patients WHERE phone = $1 AND id != $2) as exists"
    : "SELECT EXISTS (SELECT 1 FROM patients WHERE phone = $1) as exists";

  const params = excludeId ? [phone, excludeId] : [phone];
  const result = await database.query<{ exists: boolean }>(query, params);
  return !result.rows[0]?.exists;
};

// Update the addPatient function to include uniqueness checks
export const db = {
  async addPatient(patientData: PatientInput): Promise<Patient> {
    // Validate input before attempting database operation
    validatePatientInput(patientData);

    const database = await initDatabase();
    try {
      // Check uniqueness before insert
      if (patientData.email) {
        const isEmailUnique = await checkEmailUniqueness(
          database,
          patientData.email
        );
        if (!isEmailUnique) {
          throw new ValidationError("Email address is already registered");
        }
      }

      if (patientData.phone) {
        const isPhoneUnique = await checkPhoneUniqueness(
          database,
          patientData.phone
        );
        if (!isPhoneUnique) {
          throw new ValidationError("Phone number is already registered");
        }
      }

      const result = await database.query<Patient>(
        `INSERT INTO patients 
          (first_name, last_name, preferred_name, date_of_birth, gender, email, phone, address, state, city, medical_history) 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          patientData.first_name.trim(),
          patientData.last_name.trim(),
          patientData.preferred_name?.trim() || null,
          patientData.date_of_birth,
          patientData.gender,
          patientData.email?.trim() || null,
          patientData.phone?.trim() || null,
          patientData.address?.trim() || null,
          patientData.state?.trim() || null,
          patientData.city?.trim() || null,
          patientData.medical_history?.trim() || null,
        ]
      );
      return result.rows[0];
    } catch (error) {
      // Handle database constraint violations
      if (error instanceof Error) {
        if (error.message.includes("violates unique constraint")) {
          if (error.message.includes("email")) {
            throw new ValidationError("Email address is already registered");
          }
          if (error.message.includes("phone")) {
            throw new ValidationError("Phone number is already registered");
          }
        }
        if (error.message.includes("violates check constraint")) {
          if (error.message.includes("valid_email_format")) {
            throw new ValidationError("Invalid email format");
          }
          if (error.message.includes("valid_phone_format")) {
            throw new ValidationError("Invalid phone number format");
          }
          if (error.message.includes("date_of_birth")) {
            throw new ValidationError("Invalid date of birth");
          }
          if (error.message.includes("gender")) {
            throw new ValidationError("Invalid gender value");
          }
        }
      }
      throw error;
    }
  },

  async getPatients(): Promise<Patient[]> {
    const database = await initDatabase();
    try {
      const result = await database.query<Patient>(
        "SELECT * FROM patients ORDER BY last_name, first_name"
      );
      return result.rows;
    } catch (error) {
      console.error("Error executing getPatients query:", error);
      throw error;
    }
  },

  async deletePatient(id: number): Promise<void> {
    const database = await initDatabase();
    try {
      await database.query("DELETE FROM patients WHERE id = $1", [id]);
    } catch (error) {
      console.error("Error executing deletePatient query:", error);
      throw error;
    }
  },

  async searchPatients(searchTerm: string): Promise<Patient[]> {
    const database = await initDatabase();
    try {
      const result = await database.query<Patient>(
        `SELECT * FROM patients
         WHERE first_name ILIKE $1 OR last_name ILIKE $2
         ORDER BY last_name, first_name`,
        [`%${searchTerm}%`, `%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      console.error("Error executing searchPatients query:", error);
      throw error;
    }
  },
};

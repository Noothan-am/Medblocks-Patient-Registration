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

interface QueryResult<T> {
  rows: T[];
  rowCount: number;
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
      // Create table with updated schema
      await database.query(`
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
      `);

      await database.query(`
        CREATE INDEX IF NOT EXISTS idx_patient_name ON patients (last_name, first_name);
      `);
      console.log("Database schema initialized");
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

// Create and export the database interface
export const db = {
  async addPatient(
    patientData: Omit<Patient, "id" | "created_at">
  ): Promise<Patient> {
    const database = await initDatabase();
    const result = await database.query<Patient>(
      `INSERT INTO patients 
        (first_name, last_name, preferred_name, date_of_birth, gender, email, phone, address, state, city, medical_history) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        patientData.first_name,
        patientData.last_name,
        patientData.preferred_name || null,
        patientData.date_of_birth,
        patientData.gender,
        patientData.email || null,
        patientData.phone || null,
        patientData.address || null,
        patientData.state || null,
        patientData.city || null,
        patientData.medical_history || null,
      ]
    );
    return result.rows[0];
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

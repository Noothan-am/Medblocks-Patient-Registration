import { PGlite } from "@electric-sql/pglite";

// Initialize PGlite
const pglite = new PGlite();

export async function initDatabase() {
  try {
    await pglite.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(10) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        medical_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Patient type definition
export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  medical_history?: string;
  created_at: string;
}

// Database operations
export const db = {
  async addPatient(patient: Omit<Patient, "id" | "created_at">) {
    const result = await pglite.query(
      `INSERT INTO patients (
        first_name, last_name, date_of_birth, gender, 
        email, phone, address, medical_history
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        patient.first_name,
        patient.last_name,
        patient.date_of_birth,
        patient.gender,
        patient.email,
        patient.phone,
        patient.address,
        patient.medical_history,
      ]
    );
    return result.rows[0] as Patient;
  },

  async getPatients() {
    const result = await pglite.query(
      "SELECT * FROM patients ORDER BY created_at DESC"
    );
    return result.rows as Patient[];
  },

  async getPatient(id: number) {
    const result = await pglite.query("SELECT * FROM patients WHERE id = $1", [
      id,
    ]);
    return result.rows[0] as Patient | undefined;
  },

  async updatePatient(
    id: number,
    patient: Partial<Omit<Patient, "id" | "created_at">>
  ) {
    const fields = Object.keys(patient);
    const values = Object.values(patient);
    const setClause = fields
      .map((field, i) => `${field} = $${i + 2}`)
      .join(", ");

    const result = await pglite.query(
      `UPDATE patients SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] as Patient;
  },

  async deletePatient(id: number) {
    await pglite.query("DELETE FROM patients WHERE id = $1", [id]);
  },
};

// Initialize database when the module is imported
initDatabase().catch(console.error);

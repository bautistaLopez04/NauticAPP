// backend/db.ts
import { Pool, types } from "pg";
import dotenv from "dotenv";
dotenv.config();

// 1700 = OID de NUMERIC en Postgres → devolver como number
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;

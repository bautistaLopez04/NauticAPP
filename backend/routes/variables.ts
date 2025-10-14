// backend/routes/variables.ts
import { Router } from "express";
import pool from "../db";

const router = Router();

// POST /api/variables → inserta un registro de variable meteorológica
router.post("/", async (req, res) => {
  try {
    const {
      id_variable,
      id_proveedor,
      spot,
      nombre,
      fecha,
      tipo_dato,
      range_min,
      range_max,
      valor,
      unidad_base,
      ultima_actualizacion
    } = req.body;

    const result = await pool.query(
      `INSERT INTO variable_meteorologica (
         id_variable, id_proveedor, spot, nombre, fecha, tipo_dato,
         range_min, range_max, valor, unidad_base, ultima_actualizacion
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        id_variable,
        id_proveedor,
        spot,
        nombre,
        fecha,
        tipo_dato,
        range_min,
        range_max,
        valor,
        unidad_base,
        ultima_actualizacion
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al insertar variable:", error);
    res.status(500).json({ error: "Error al insertar variable" });
  }
});

export default router;

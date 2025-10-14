import { Router } from "express";
import pool from "../db";

const router = Router();

/** GET /api/spots  →  lista spots con deportes */
router.get("/", async (_req, res) => {
  const q = `
    SELECT
      s.id_spot    AS id,
      s.nombre     AS name,
      s.coord_lat  AS lat,
      s.coord_lng  AS lon,
      COALESCE(
        ARRAY_AGG(DISTINCT LOWER(d.nombre)) FILTER (WHERE d.id_deporte IS NOT NULL),
        '{}'
      ) AS sports
    FROM spot s
    LEFT JOIN deporte_spot ds ON ds.id_spot = s.id_spot
    LEFT JOIN deporte d       ON d.id_deporte = ds.id_deporte
    GROUP BY s.id_spot
    ORDER BY s.nombre;
  `;
  const { rows } = await pool.query(q);
  res.json(rows.map(r => ({ ...r, sports: r.sports.map((x:string)=>x as "surf"|"kite") })));
});

/** GET /api/spots/weather_average_mon?spotId=1&day=0
 * Devuelve promedios por variable para ese spot y día (hoy + offset).
 * Ajustá los alias si tus "nombre" difieren.
 */
router.get("/weather_average_mon", async (req, res) => {
  try {
    const spotId = Number(req.query.spotId);
    const day = Number(req.query.day ?? 0);
    if (!Number.isFinite(spotId)) {
      return res.status(400).json({ error: "spotId requerido" });
    }

    const q = `
      WITH sel AS (
        SELECT nombre, valor
        FROM variable_meteorologica
        WHERE spot = $1
          AND fecha::date = CURRENT_DATE + ($2::int)  -- 👈 casteo clave
      )
      SELECT
        AVG(CASE WHEN LOWER(nombre) IN ('temperature_2m','temperatura','temp') THEN valor END) AS temperature_2m,
        AVG(CASE WHEN LOWER(nombre) IN ('wind_speed_10m','viento','wind')   THEN valor END)     AS wind_speed_10m,
        AVG(CASE WHEN LOWER(nombre) IN ('precipitation','lluvia')           THEN valor END)     AS precipitation,
        AVG(CASE WHEN LOWER(nombre) IN ('wave_height','olas','oleaje')      THEN valor END)     AS wave_height
      FROM sel;
    `;

    const { rows } = await pool.query(q, [spotId, day]);
    res.json(rows[0] ?? {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculando promedios" });
  }
});

export default router;

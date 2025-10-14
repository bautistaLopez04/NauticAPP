// api/[...route].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/app';

// Envolver Express para que Vercel espere a que termine la respuesta
export default function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise<void>((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);
    // @ts-ignore: Vercel/Express tipos
    app(req, res);
  });
}
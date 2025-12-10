import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/public/facilities
router.get('/facilities', async (req: Request, res: Response) => {
  try {
    const { id, kommun_id, facility_type_id } = req.query;

    let sql = `
      SELECT 
        f.*,
        ft.id as facility_type_id, ft.code as facility_type_code, ft.label as facility_type_label, ft.description as facility_type_description,
        k.id as kommun_id, k.kommun_kod, k.kommun_namn,
        fg.latitude, fg.longitude, fg.geom_type
      FROM facility f
      LEFT JOIN facility_type ft ON f.facility_type_id = ft.id
      LEFT JOIN kommun k ON f.kommun_id = k.id
      LEFT JOIN facility_geometry fg ON f.id = fg.facility_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (id) {
      sql += ` AND f.id = $${paramIndex++}`;
      params.push(parseInt(id as string));
    }
    if (kommun_id) {
      sql += ` AND f.kommun_id = $${paramIndex++}`;
      params.push(parseInt(kommun_id as string));
    }
    if (facility_type_id) {
      sql += ` AND f.facility_type_id = $${paramIndex++}`;
      params.push(parseInt(facility_type_id as string));
    }

    sql += ' ORDER BY f.name';

    const rows = await query(sql, params);

    // Transform to nested structure
    const facilities = rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      postal_code: row.postal_code,
      external_id: row.external_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      facility_type: row.facility_type_code ? {
        id: row.facility_type_id,
        code: row.facility_type_code,
        label: row.facility_type_label,
        description: row.facility_type_description
      } : null,
      kommun: row.kommun_namn ? {
        id: row.kommun_id,
        kommun_kod: row.kommun_kod,
        kommun_namn: row.kommun_namn
      } : null,
      facility_geometry: row.latitude ? [{
        latitude: row.latitude,
        longitude: row.longitude,
        geom_type: row.geom_type
      }] : []
    }));

    console.log(`Public API: returned ${facilities.length} facilities`);

    res.json({
      success: true,
      data: facilities,
      count: facilities.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Public API facilities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch facilities'
    });
  }
});

// GET /api/public/facilities-map (optimized for map display)
router.get('/facilities-map', async (req: Request, res: Response) => {
  try {
    const { kommun_id } = req.query;

    let sql = `
      SELECT 
        f.id, f.name, f.address, f.city,
        ft.code as facility_type_code, ft.label as facility_type_label,
        k.kommun_namn,
        fg.latitude, fg.longitude
      FROM facility f
      LEFT JOIN facility_type ft ON f.facility_type_id = ft.id
      LEFT JOIN kommun k ON f.kommun_id = k.id
      LEFT JOIN facility_geometry fg ON f.id = fg.facility_id
      WHERE fg.latitude IS NOT NULL AND fg.longitude IS NOT NULL
    `;
    const params: any[] = [];

    if (kommun_id) {
      sql += ' AND f.kommun_id = $1';
      params.push(parseInt(kommun_id as string));
    }

    const rows = await query(sql, params);

    const facilities = rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      facility_type: {
        code: row.facility_type_code,
        label: row.facility_type_label
      },
      kommun: {
        kommun_namn: row.kommun_namn
      },
      facility_geometry: [{
        latitude: row.latitude,
        longitude: row.longitude
      }]
    }));

    console.log(`Public API: returned ${facilities.length} map facilities`);

    res.json({
      success: true,
      data: facilities,
      count: facilities.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Public API facilities-map error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch map facilities'
    });
  }
});

// GET /api/public/municipalities
router.get('/municipalities', async (req: Request, res: Response) => {
  try {
    const rows = await query('SELECT * FROM kommun ORDER BY kommun_namn');

    console.log(`Public API: returned ${rows.length} municipalities`);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Public API municipalities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch municipalities'
    });
  }
});

// GET /api/public/facility-types
router.get('/facility-types', async (req: Request, res: Response) => {
  try {
    const rows = await query('SELECT * FROM facility_type ORDER BY label');

    console.log(`Public API: returned ${rows.length} facility types`);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Public API facility-types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch facility types'
    });
  }
});

export { router as publicApiRouter };

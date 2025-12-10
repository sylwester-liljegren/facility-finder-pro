import { Router, Response } from 'express';
import { query, queryOne } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// GET /api/admin/facilities
router.get('/facilities', async (req: AuthRequest, res: Response) => {
  try {
    const { id, kommun_id } = req.query;
    const userId = req.userId;

    let sql = `
      SELECT 
        f.*,
        ft.id as facility_type_id, ft.code as facility_type_code, ft.label as facility_type_label,
        k.id as kommun_id, k.kommun_kod, k.kommun_namn,
        fg.latitude, fg.longitude, fg.geom_type
      FROM facility f
      LEFT JOIN facility_type ft ON f.facility_type_id = ft.id
      LEFT JOIN kommun k ON f.kommun_id = k.id
      LEFT JOIN facility_geometry fg ON f.id = fg.facility_id
      WHERE f.created_by = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (id) {
      sql += ` AND f.id = $${paramIndex++}`;
      params.push(parseInt(id as string));
    }
    if (kommun_id) {
      sql += ` AND f.kommun_id = $${paramIndex++}`;
      params.push(parseInt(kommun_id as string));
    }

    sql += ' ORDER BY f.name';

    const rows = await query(sql, params);

    const facilities = rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      postal_code: row.postal_code,
      external_id: row.external_id,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      facility_type: row.facility_type_code ? {
        id: row.facility_type_id,
        code: row.facility_type_code,
        label: row.facility_type_label
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

    console.log(`Admin API: returned ${facilities.length} facilities for user ${userId}`);

    res.json({
      success: true,
      data: facilities,
      count: facilities.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin API get facilities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch facilities'
    });
  }
});

// POST /api/admin/facilities
router.post('/facilities', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      name,
      address,
      city,
      postal_code,
      external_id,
      facility_type_id,
      kommun_id,
      latitude,
      longitude
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Insert facility
    const facility = await queryOne<{ id: number }>(
      `INSERT INTO facility (name, address, city, postal_code, external_id, facility_type_id, kommun_id, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id`,
      [name, address, city, postal_code, external_id, facility_type_id, kommun_id, userId]
    );

    if (!facility) {
      throw new Error('Failed to create facility');
    }

    // Insert geometry if coordinates provided
    if (latitude && longitude) {
      await query(
        `INSERT INTO facility_geometry (facility_id, latitude, longitude, geom_type, updated_at)
         VALUES ($1, $2, $3, 'POINT', NOW())`,
        [facility.id, latitude, longitude]
      );
    }

    console.log(`Admin API: created facility ${facility.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: { id: facility.id },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin API create facility error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create facility'
    });
  }
});

// PUT /api/admin/facilities/:id
router.put('/facilities/:id', async (req: AuthRequest, res: Response) => {
  try {
    const facilityId = parseInt(req.params.id);
    const userId = req.userId;
    const {
      name,
      address,
      city,
      postal_code,
      external_id,
      facility_type_id,
      kommun_id,
      latitude,
      longitude
    } = req.body;

    // Verify ownership
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM facility WHERE id = $1 AND created_by = $2',
      [facilityId, userId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found or access denied'
      });
    }

    // Update facility
    await query(
      `UPDATE facility SET 
        name = COALESCE($1, name),
        address = $2,
        city = $3,
        postal_code = $4,
        external_id = $5,
        facility_type_id = $6,
        kommun_id = $7,
        updated_at = NOW()
       WHERE id = $8`,
      [name, address, city, postal_code, external_id, facility_type_id, kommun_id, facilityId]
    );

    // Update or insert geometry
    if (latitude !== undefined && longitude !== undefined) {
      const existingGeom = await queryOne(
        'SELECT facility_id FROM facility_geometry WHERE facility_id = $1',
        [facilityId]
      );

      if (existingGeom) {
        await query(
          `UPDATE facility_geometry SET latitude = $1, longitude = $2, updated_at = NOW() WHERE facility_id = $3`,
          [latitude, longitude, facilityId]
        );
      } else if (latitude && longitude) {
        await query(
          `INSERT INTO facility_geometry (facility_id, latitude, longitude, geom_type, updated_at)
           VALUES ($1, $2, $3, 'POINT', NOW())`,
          [facilityId, latitude, longitude]
        );
      }
    }

    console.log(`Admin API: updated facility ${facilityId} by user ${userId}`);

    res.json({
      success: true,
      data: { id: facilityId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin API update facility error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update facility'
    });
  }
});

// DELETE /api/admin/facilities/:id
router.delete('/facilities/:id', async (req: AuthRequest, res: Response) => {
  try {
    const facilityId = parseInt(req.params.id);
    const userId = req.userId;

    // Verify ownership and delete
    const result = await query(
      'DELETE FROM facility WHERE id = $1 AND created_by = $2 RETURNING id',
      [facilityId, userId]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found or access denied'
      });
    }

    console.log(`Admin API: deleted facility ${facilityId} by user ${userId}`);

    res.json({
      success: true,
      data: { id: facilityId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin API delete facility error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete facility'
    });
  }
});

export { router as adminApiRouter };

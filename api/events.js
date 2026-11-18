import { connect } from '@tidbcloud/serverless';
import { verifyUser } from './_auth.js';

const conn = connect({ url: process.env.DATABASE_URL });

export default async function handler(req, res) {
  try {
    // ทุกคนดูรายการกิจกรรมได้
    if (req.method === 'GET') {
      const rows = await conn.execute(
        'SELECT id, name, dept, date, endDate, description AS `desc`, drive, color FROM events ORDER BY date ASC'
      );
      return res.status(200).json(rows);
    }

    // เพิ่ม / แก้ไข / ลบ ต้องผ่านการล็อกอินเท่านั้น
    const user = await verifyUser(req);
    if (!user) return res.status(401).json({ error: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' });

    if (req.method === 'POST') {
      const { id, name, dept, date, endDate, desc, drive, color } = req.body;
      await conn.execute(
        `INSERT INTO events (id, name, dept, date, endDate, description, drive, color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), dept = VALUES(dept), date = VALUES(date),
           endDate = VALUES(endDate), description = VALUES(description),
           drive = VALUES(drive), color = VALUES(color)`,
        [id, name, dept, date, endDate || '', desc || '', drive || '', color || '#00A878']
      );
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await conn.execute('DELETE FROM events WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

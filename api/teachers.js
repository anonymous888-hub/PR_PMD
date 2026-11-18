import { connect } from '@tidbcloud/serverless';
import { verifyUser } from './_auth.js';

const conn = connect({ url: process.env.DATABASE_URL });

export default async function handler(req, res) {
  try {
    // ข้อมูลครูสงวนสิทธิ์เฉพาะบุคลากรที่ล็อกอินแล้วเท่านั้น (รวมถึง GET)
    const user = await verifyUser(req);
    if (!user) return res.status(401).json({ error: 'สงวนสิทธิ์เฉพาะบุคลากรที่เข้าสู่ระบบ' });

    if (req.method === 'GET') {
      const rows = await conn.execute('SELECT * FROM teachers ORDER BY code ASC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const t = req.body;
      await conn.execute(
        `INSERT INTO teachers (id, type, code, name, surname, age, edu, major, subject, level, role, phone, start, nationality, retiredYear)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           type = VALUES(type), code = VALUES(code), name = VALUES(name), surname = VALUES(surname),
           age = VALUES(age), edu = VALUES(edu), major = VALUES(major), subject = VALUES(subject),
           level = VALUES(level), role = VALUES(role), phone = VALUES(phone), start = VALUES(start),
           nationality = VALUES(nationality), retiredYear = VALUES(retiredYear)`,
        [
          t.id, t.type, t.code, t.name, t.surname || '', t.age || 0,
          t.edu || '', t.major || '', t.subject || '', t.level || '',
          t.role || '', t.phone || '', t.start || '', t.nationality || '', t.retiredYear || ''
        ]
      );
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await conn.execute('DELETE FROM teachers WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

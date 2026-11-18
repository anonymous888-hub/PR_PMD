const ALLOWED_USERS = ['kaeacer@gmail.com', 'saipin@pramanda.ac.th'];

export async function verifyUser(req) {
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return null;

  const apiKey = process.env.FIREBASE_API_KEY;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const user = data.users?.[0];
  if (!user || !ALLOWED_USERS.includes(user.email)) return null;

  return user;
}

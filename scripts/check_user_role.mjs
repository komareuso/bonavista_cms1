import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.query(
  `SELECT id, email, role
   FROM users
   WHERE email = ?`,
  ['komareusa@gmail.com'],
);
console.log(JSON.stringify(rows, null, 2));
await connection.end();

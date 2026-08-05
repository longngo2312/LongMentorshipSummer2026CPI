export const AUTH_SQL = {
  findUserIdByEmail: `SELECT id FROM users WHERE email = ?;`,

  findUserForLogin: `
    SELECT
      id,
      username,
      email,
      password_hash
    FROM users
    WHERE email = ?;
  `,

  insertUser: `
    INSERT INTO users
      (username, password_hash, email, tenant_db_path)
      VALUES (?, ?, ?, ?);
  `,

  updateTenantDbPath: `
    UPDATE users
      SET tenant_db_path = ?
      WHERE id = ?;
  `,

  updateLastLogin: `
    UPDATE users
    SET last_login_at = datetime('now')
    WHERE id = ?;
  `,
};

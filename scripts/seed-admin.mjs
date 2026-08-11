// scripts/seed-admin.mjs
// One-off local helper — NOT run automatically, NOT part of any npm script
// chain. Usage:
//
//   node scripts/seed-admin.mjs <username> <password>
//
// Hashes the given password with bcryptjs and prints the exact
// `wrangler d1 execute` command to create that admin user, for you to
// copy-paste and run yourself once your D1 database exists. This script
// deliberately does NOT invoke wrangler itself — it just prints the command.

import bcrypt from 'bcryptjs';

const DB_NAME = 'kivistone-cms';

function sqlEscape(str) {
  // Single quotes inside a SQL string literal are escaped by doubling them.
  return str.replace(/'/g, "''");
}

function main() {
  const [, , username, password] = process.argv;

  if (!username || !password) {
    console.error('Usage: node scripts/seed-admin.mjs <username> <password>');
    process.exit(1);
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const sql = `INSERT INTO admin_users (username, password_hash) VALUES ('${sqlEscape(
    username
  )}', '${sqlEscape(passwordHash)}')`;

  console.log('\nRun this once your D1 database exists (after `wrangler login`):\n');
  console.log(`npx wrangler d1 execute ${DB_NAME} --remote --command "${sql.replace(/"/g, '\\"')}"`);
  console.log('');
}

main();

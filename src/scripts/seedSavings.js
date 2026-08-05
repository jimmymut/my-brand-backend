/*
 * One-off, idempotent seed for the owner's real recurring savings.
 * Inserts monthly DEPOSIT contributions from January 2025 through the current
 * month for Ejo Heza (30,000) and the three children's education funds (10,000
 * each), tagged with the account where the money is held. Re-running it only
 * fills gaps — existing months are left untouched.
 *
 *   NODE_ENV=development npm run seed:savings
 */
import mongoose from "mongoose";
import { node_env, dev_db, remote_db, test_db } from "../config/index.js";
import Contribution from "../models/contribution.js";

const PLAN = [
  { bucket: "ejoheza", amount: 30000, account: "Ejo Heza" },
  { bucket: "child1", amount: 10000, account: "BK" },
  { bucket: "child2", amount: 10000, account: "BK" },
  { bucket: "child3", amount: 10000, account: "BK" },
];

const START = "2025-01";

// Months from `start` through the LAST COMPLETED month (the current month is
// deliberately excluded — this month's saving hasn't happened yet, so it stays
// open/"due" until you record it).
function monthsFrom(start) {
  const [sy, sm] = start.split("-").map((n) => parseInt(n, 10));
  const now = new Date();
  let ey = now.getFullYear();
  let em = now.getMonth() + 1;
  em -= 1; // step back to last month
  if (em < 1) { em = 12; ey -= 1; }
  const out = [];
  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

function dbUri() {
  if (node_env === "testing") return test_db;
  if (node_env === "production") return remote_db;
  return dev_db || remote_db;
}

async function run() {
  const uri = dbUri();
  if (!uri) { console.error("No database URI configured (check DEV_DB / REMOTE_DB)."); process.exit(1); }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected. Seeding savings from", START, "to current month…");

  const months = monthsFrom(START);
  let created = 0;
  let skipped = 0;

  for (const p of PLAN) {
    for (const month of months) {
      const exists = await Contribution.findOne({ bucket: p.bucket, month, kind: "deposit" });
      if (exists) { skipped += 1; continue; }
      await Contribution.create({
        bucket: p.bucket,
        month,
        amount: p.amount,
        date: `${month}-05`,
        account: p.account,
        kind: "deposit",
      });
      created += 1;
    }
  }

  console.log(`Done. Created ${created} deposit(s), skipped ${skipped} existing.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => { console.error("Seed failed:", err); process.exit(1); });

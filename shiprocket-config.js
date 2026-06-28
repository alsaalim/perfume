/**
 * ─────────────────────────────────────────────
 *  SHIPROCKET CONFIGURATION  —  edit this file
 * ─────────────────────────────────────────────
 *
 * 1. Log in to your Shiprocket panel at https://app.shiprocket.in
 * 2. Go to Settings → API → Generate API token
 *    (or just use your login email + password below)
 * 3. Fill in ALL values marked "REQUIRED"
 * 4. Save the file — no other changes needed.
 *
 * ⚠️  Keep this file private; never commit real credentials to a public repo.
 */

window.SHIPROCKET_CONFIG = {

  /* ── Credentials (REQUIRED) ─────────────────── */
  email:    'YOUR_SHIPROCKET_EMAIL',      // e.g. 'owner@alsaalim.com'
  password: 'YOUR_SHIPROCKET_PASSWORD',   // your Shiprocket login password

  /* ── Pickup / Seller details (REQUIRED) ─────── */
  pickup_location: 'Primary',             // must match a pickup location name in Shiprocket
  seller_name:     'AL-SAALIM PERFUMES',
  seller_phone:    '9528394331',

  /* ── Shiprocket Channel (optional) ──────────── */
  channel_id: '',   // leave blank unless you use multiple sales channels

  /* ── Default package dimensions ─────────────── */
  // These are used when an item doesn't have specific dimensions.
  // Adjust to match your typical shipping box/envelope.
  default_weight:  0.5,   // kg
  default_length:  10,    // cm
  default_breadth: 8,     // cm
  default_height:  6,     // cm

};

/**
 * Shiprocket API Module
 * Exposes window.ShiprocketAPI — loaded dynamically by buy-now-modal.js & local-cart.js
 * Reads credentials from window.SHIPROCKET_CONFIG (shiprocket-config.js)
 */
window.ShiprocketAPI = (function () {
  'use strict';

  const BASE = 'https://apiv2.shiprocket.in/v1/external';

  /* ── Token cache (valid for 9 days; Shiprocket tokens expire in 10) ── */
  let _token = null;
  let _tokenAt = 0;
  const TOKEN_TTL = 9 * 24 * 60 * 60 * 1000;

  /* ── Helpers ── */
  function parseAmount(str) {
    if (typeof str === 'number' && isFinite(str)) return Math.max(0, str);
    const s = String(str || '')
      .replace(/₹/g, '')
      .replace(/Rs\.?/gi, '')
      .replace(/INR/gi, '')
      .replace(/,/g, '')
      .trim();
    const n = parseFloat(s);
    return isFinite(n) ? Math.max(0, n) : 0;
  }

  function genOrderId() {
    return 'ASP-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function nowDatetime() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function cleanPhone(phone) {
    return String(phone || '').replace(/^\+91/, '').replace(/\D/g, '').slice(-10);
  }

  /* ── Auth ── */
  async function getToken() {
    if (_token && Date.now() - _tokenAt < TOKEN_TTL) return _token;

    const cfg = window.SHIPROCKET_CONFIG;
    if (!cfg || !cfg.email || !cfg.password ||
        cfg.email === 'YOUR_SHIPROCKET_EMAIL') {
      throw new Error(
        'Shiprocket is not configured. Please open shiprocket-config.js and fill in your email & password.'
      );
    }

    const res = await fetch(BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cfg.email, password: cfg.password })
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (!data.token) {
      throw new Error(data.message || 'Shiprocket authentication failed. Check your credentials.');
    }
    _token = data.token;
    _tokenAt = Date.now();
    return _token;
  }

  /* ── Build order payload ── */
  function buildPayload(customer, items) {
    const cfg = window.SHIPROCKET_CONFIG || {};

    const orderItems = items.map((item, i) => ({
      name:          item.name,
      sku:           'SKU-' + (i + 1),
      units:         Math.max(1, parseInt(item.qty) || 1),
      selling_price: parseAmount(item.price),
      discount:      0,
      tax:           0,
      hsn:           0
    }));

    const subTotal = items.reduce(
      (sum, it) => sum + parseAmount(it.price) * Math.max(1, parseInt(it.qty) || 1), 0
    );

    return {
      order_id:               genOrderId(),
      order_date:             nowDatetime(),
      pickup_location:        cfg.pickup_location || 'Primary',
      channel_id:             cfg.channel_id || '',
      billing_customer_name:  customer.name,
      billing_last_name:      '',
      billing_address:        customer.address,
      billing_address_2:      '',
      billing_isd_code:       '91',
      billing_city:           customer.city,
      billing_pincode:        String(customer.pincode),
      billing_state:          customer.state,
      billing_country:        'India',
      billing_email:          customer.email,
      billing_phone:          cleanPhone(customer.phone),
      shipping_is_billing:    true,
      order_items:            orderItems,
      payment_method:         'COD',
      shipping_charges:       0,
      giftwrap_charges:       0,
      transaction_charges:    0,
      total_discount:         0,
      sub_total:              subTotal,
      length:                 cfg.default_length  || 10,
      breadth:                cfg.default_breadth || 8,
      height:                 cfg.default_height  || 6,
      weight:                 cfg.default_weight  || 0.5
    };
  }

  /* ── Create order ── */
  async function placeOrder(customer, items) {
    const token   = await getToken();
    const payload = buildPayload(customer, items);

    const res = await fetch(BASE + '/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    });

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (!res.ok || data.status_code === 0 || data.status_code === 422) {
      const msg = data.message ||
        (data.errors ? JSON.stringify(data.errors) : null) ||
        'Order creation failed. Please try again.';
      throw new Error(msg);
    }

    return { orderId: payload.order_id, shiprocketId: data.order_id, data };
  }

  return { placeOrder };
})();

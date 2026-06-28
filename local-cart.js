(function () {
  const WHATSAPP_NUMBER = '919528394331';
  const CART_KEY = 'alsaalim_cart';

  /* ── Dynamically load Shiprocket deps ─────────────────────────────── */
  var _srReady = false;
  (function loadSR() {
    var base = window.location.pathname.includes('/products/') ? '../' : './';
    // Avoid double-loading if buy-now-modal.js already added these tags
    function needsLoad(name) {
      return !document.querySelector('script[src*="' + name + '"]');
    }
    function loadScript(src, cb) {
      var s = document.createElement('script');
      s.src = base + src;
      s.onload = cb || function () {};
      s.onerror = cb || function () {};
      document.head.appendChild(s);
    }
    if (needsLoad('shiprocket-config')) {
      loadScript('shiprocket-config.js', function () {
        loadScript('shiprocket.js', function () { _srReady = true; });
      });
    } else {
      // scripts already being loaded by buy-now-modal.js; wait a tick
      setTimeout(function () { _srReady = !!window.ShiprocketAPI; }, 2000);
    }
  })();

  /* ── Cart Data Helpers ─────────────────────────────────────────────── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  function getCartCount() { return getCart().reduce((sum, item) => sum + item.qty, 0); }

  function addToCart(product) {
    const cart = getCart();
    const item = { ...product, qty: Number(product.qty) || 1, priceNum: parsePrice(product.price) };
    const existing = cart.find(i => i.name === item.name);
    if (existing) { existing.qty += item.qty; if (!existing.priceNum) existing.priceNum = item.priceNum; }
    else { cart.push(item); }
    saveCart(cart);
    updateBadge();
  }

  function removeFromCart(index) { const cart = getCart(); cart.splice(index, 1); saveCart(cart); updateBadge(); }

  function updateQty(index, qty) {
    const cart = getCart();
    if (qty <= 0) { cart.splice(index, 1); } else { cart[index].qty = qty; }
    saveCart(cart);
    updateBadge();
  }

  function clearCart() { localStorage.removeItem(CART_KEY); updateBadge(); }

  /* ── Badge ─────────────────────────────────────────────────────────── */
  function updateBadge() {
    const count = getCartCount();
    document.querySelectorAll('#cart-icon-bubble').forEach(el => {
      let bubble = el.querySelector('.cart-count-bubble');
      if (count > 0) {
        if (!bubble) {
          bubble = document.createElement('div');
          bubble.className = 'cart-count-bubble';
          bubble.innerHTML = '<span aria-hidden="true"></span><span class="visually-hidden"> items</span>';
          el.appendChild(bubble);
        }
        bubble.querySelector('[aria-hidden]').textContent = count;
        bubble.querySelector('.visually-hidden').textContent = count + ' item' + (count > 1 ? 's' : '');
      } else if (bubble) { bubble.remove(); }
    });
  }

  /* ── Styles ─────────────────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    .cart-count-bubble {
      position: absolute; top: 2px; right: -6px;
      background: #1a1a1a; color: #fff;
      font-size: 11px; font-weight: 700;
      min-width: 18px; height: 18px;
      border-radius: 50%; display: flex;
      align-items: center; justify-content: center;
      line-height: 1; padding: 0 4px;
    }
    #cart-icon-bubble { position: relative; }

    /* Toast */
    .lc-toast {
      position: fixed; top: 0; right: 0;
      background: #fff; z-index: 100001;
      box-shadow: 0 4px 24px rgba(0,0,0,.15);
      border-bottom: 1px solid #eee;
      padding: 0; width: 380px; max-width: 100vw;
      transform: translateY(-100%);
      transition: transform .35s cubic-bezier(.4,0,.2,1);
    }
    .lc-toast.active { transform: translateY(0); }
    .lc-toast-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #eee; }
    .lc-toast-header h4 { margin: 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; color: #2e7d32; }
    .lc-toast-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #888; padding: 0 4px; line-height: 1; }
    .lc-toast-close:hover { color: #333; }
    .lc-toast-body { display: flex; gap: 12px; padding: 14px 18px; align-items: center; }
    .lc-toast-body img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; border: 1px solid #eee; }
    .lc-toast-info { flex: 1; }
    .lc-toast-info .lc-toast-name  { font-size: 13px; font-weight: 600; color: #1a1a1a; margin: 0 0 3px; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .lc-toast-info .lc-toast-price { font-size: 13px; color: #555; margin: 0; }
    .lc-toast-actions { padding: 0 18px 14px; display: flex; flex-direction: column; gap: 8px; }
    .lc-toast-actions a, .lc-toast-actions button { display: block; width: 100%; text-align: center; padding: 10px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer; box-sizing: border-box; }
    .lc-btn-viewcart  { background: #1a1a1a; color: #fff !important; border: none; }
    .lc-btn-viewcart:hover { background: #333; }
    .lc-btn-continue  { background: none; border: 1.5px solid #ddd; color: #1a1a1a !important; }
    .lc-btn-continue:hover { border-color: #aaa; }

    @media (max-width: 480px) { .lc-toast { width: 100vw; } }

    /* Cart page */
    .lc-cart-page { max-width: 800px; margin: 0 auto; padding: 20px; }
    .lc-cart-page h1 { font-size: 28px; margin-bottom: 24px; }
    .lc-cart-empty { text-align: center; padding: 60px 20px; color: #888; }
    .lc-cart-empty p { font-size: 16px; margin-bottom: 16px; }
    .lc-cart-empty a { display: inline-block; padding: 12px 28px; background: #1a1a1a; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .lc-cart-item { display: flex; gap: 16px; padding: 18px 0; border-bottom: 1px solid #eee; align-items: center; }
    .lc-cart-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
    .lc-cart-item-info { flex: 1; }
    .lc-cart-item-info .lc-item-name  { font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0 0 4px; line-height: 1.3; }
    .lc-cart-item-info .lc-item-price { font-size: 14px; color: #2e7d32; font-weight: 600; margin: 0 0 8px; }
    .lc-qty-controls { display: flex; align-items: center; gap: 0; border: 1.5px solid #ddd; border-radius: 6px; overflow: hidden; }
    .lc-qty-controls button { background: none; border: none; padding: 6px 12px; font-size: 16px; cursor: pointer; color: #333; }
    .lc-qty-controls button:hover { background: #f5f5f5; }
    .lc-qty-controls span { padding: 6px 14px; font-size: 14px; font-weight: 600; border-left: 1.5px solid #ddd; border-right: 1.5px solid #ddd; min-width: 20px; text-align: center; }
    .lc-remove-btn { background: none; border: none; color: #d32f2f; font-size: 13px; cursor: pointer; text-decoration: underline; padding: 4px 0; margin-top: 4px; display: inline-block; }
    .lc-cart-footer { padding: 20px 0; border-top: 2px solid #1a1a1a; margin-top: 8px; }
    .lc-cart-total  { display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 700; margin-bottom: 18px; }

    /* WhatsApp checkout */
    .lc-checkout-wa {
      width: 100%; padding: 14px;
      background: #25D366; color: #fff;
      border: none; border-radius: 8px;
      font-size: 15px; font-weight: 700;
      cursor: pointer; display: flex;
      align-items: center; justify-content: center; gap: 8px;
    }
    .lc-checkout-wa:hover { background: #1fb855; }
    .lc-checkout-wa svg { width: 20px; height: 20px; fill: #fff; }

    /* "or" divider */
    .lc-or {
      text-align: center; font-size: 12px; color: #bbb;
      margin: 10px 0; position: relative;
    }
    .lc-or::before, .lc-or::after { content: ''; position: absolute; top: 50%; width: 42%; height: 1px; background: #eee; }
    .lc-or::before { left: 0; } .lc-or::after { right: 0; }

    /* ── WhatsApp cart modal ── */
    .lc-wa-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.55);
      z-index: 200000;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; visibility: hidden;
      transition: opacity .25s, visibility .25s;
    }
    .lc-wa-overlay.active { opacity: 1; visibility: visible; }
    .lc-wa-modal {
      background: #fff; border-radius: 14px;
      width: 92%; max-width: 460px;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
      animation: waSlideUp .3s ease;
    }
    @keyframes waSlideUp {
      from { transform: translateY(30px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .lc-wa-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 22px 14px; border-bottom: 1px solid #eee;
    }
    .lc-wa-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1a1a1a; }
    .lc-wa-close { background: none; border: none; font-size: 26px; cursor: pointer; color: #888; line-height: 1; padding: 0 4px; }
    .lc-wa-close:hover { color: #333; }
    .lc-wa-summary {
      padding: 14px 22px; background: #f8f8f8; border-bottom: 1px solid #eee;
      font-size: 13px; color: #555;
    }
    .lc-wa-summary strong { display: block; font-size: 15px; color: #1a1a1a; margin-bottom: 4px; }
    .lc-wa-form { padding: 18px 22px 22px; }
    .lc-wa-form label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 5px; }
    .lc-wa-form input, .lc-wa-form textarea {
      width: 100%; padding: 10px 12px;
      border: 1.5px solid #ddd; border-radius: 8px;
      font-size: 14px; margin-bottom: 14px;
      font-family: inherit; transition: border-color .2s;
      box-sizing: border-box;
    }
    .lc-wa-form input:focus, .lc-wa-form textarea:focus { outline: none; border-color: #25D366; }
    .lc-wa-form textarea { resize: vertical; min-height: 60px; }
    .lc-wa-form .lc-wa-err { color: #d32f2f; font-size: 12px; margin: -10px 0 10px; display: none; }
    .lc-wa-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .lc-wa-row-2 > div { display: flex; flex-direction: column; }
    .lc-wa-row-2 input { margin-bottom: 0; }
    .lc-wa-row-2 .lc-wa-err { margin-top: 4px; margin-bottom: 0; }
    .lc-wa-submit {
      width: 100%; padding: 14px;
      background: #25D366; color: #fff;
      border: none; border-radius: 8px;
      font-size: 15px; font-weight: 700;
      cursor: pointer; display: flex;
      align-items: center; justify-content: center; gap: 8px;
      transition: background .2s;
    }
    .lc-wa-submit:hover { background: #1fb855; }
    .lc-wa-submit svg { width: 20px; height: 20px; fill: #fff; flex-shrink: 0; }

    /* Shiprocket checkout */
    .lc-checkout-sr {
      width: 100%; padding: 14px;
      background: #f47920; color: #fff;
      border: none; border-radius: 8px;
      font-size: 15px; font-weight: 700;
      cursor: pointer; display: flex;
      align-items: center; justify-content: center; gap: 8px;
      transition: background .2s;
    }
    .lc-checkout-sr:hover { background: #d9640f; }
    .lc-checkout-sr svg { width: 20px; height: 20px; fill: #fff; }

    .lc-clear-btn { display: block; width: 100%; text-align: center; margin-top: 10px; background: none; border: 1.5px solid #ddd; padding: 12px; border-radius: 8px; font-size: 14px; cursor: pointer; color: #666; font-weight: 600; }
    .lc-clear-btn:hover { border-color: #d32f2f; color: #d32f2f; }

    /* ── Shiprocket Cart Modal ── */
    .lc-sr-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.55);
      z-index: 200000;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; visibility: hidden;
      transition: opacity .25s, visibility .25s;
    }
    .lc-sr-overlay.active { opacity: 1; visibility: visible; }
    .lc-sr-modal {
      background: #fff; border-radius: 14px;
      width: 92%; max-width: 460px;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
      animation: srSlideUp .3s ease;
    }
    @keyframes srSlideUp {
      from { transform: translateY(30px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .lc-sr-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 22px 14px; border-bottom: 1px solid #eee;
    }
    .lc-sr-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1a1a1a; }
    .lc-sr-close { background: none; border: none; font-size: 26px; cursor: pointer; color: #888; line-height: 1; padding: 0 4px; }
    .lc-sr-close:hover { color: #333; }
    .lc-sr-summary {
      padding: 14px 22px; background: #f8f8f8; border-bottom: 1px solid #eee;
      font-size: 13px; color: #555;
    }
    .lc-sr-summary strong { display: block; font-size: 15px; color: #1a1a1a; margin-bottom: 4px; }
    .lc-sr-form { padding: 18px 22px 22px; }
    .lc-sr-form label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 5px; }
    .lc-sr-form input, .lc-sr-form textarea {
      width: 100%; padding: 10px 12px;
      border: 1.5px solid #ddd; border-radius: 8px;
      font-size: 14px; margin-bottom: 14px;
      font-family: inherit; transition: border-color .2s;
      box-sizing: border-box;
    }
    .lc-sr-form input:focus, .lc-sr-form textarea:focus { outline: none; border-color: #f47920; }
    .lc-sr-form textarea { resize: vertical; min-height: 60px; }
    .lc-sr-form .lc-sr-err { color: #d32f2f; font-size: 12px; margin: -10px 0 10px; display: none; }
    .lc-sr-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .lc-sr-row-2 > div { display: flex; flex-direction: column; }
    .lc-sr-row-2 input { margin-bottom: 0; }
    .lc-sr-row-2 .lc-sr-err { margin-top: 4px; margin-bottom: 0; }
    .lc-sr-submit {
      width: 100%; padding: 14px;
      background: #f47920; color: #fff;
      border: none; border-radius: 8px;
      font-size: 15px; font-weight: 700;
      cursor: pointer; display: flex;
      align-items: center; justify-content: center; gap: 8px;
      transition: background .2s;
    }
    .lc-sr-submit:hover:not(:disabled) { background: #d9640f; }
    .lc-sr-submit:disabled { background: #f4a06b; cursor: not-allowed; }
    .lc-sr-submit svg { width: 20px; height: 20px; fill: #fff; flex-shrink: 0; }
    .lc-sr-modal-success {
      background: #e8f5e9; border: 1px solid #a5d6a7;
      border-radius: 8px; padding: 14px 16px;
      font-size: 13px; color: #2e7d32; margin-top: 12px;
      display: none; line-height: 1.5;
    }
    .lc-sr-modal-success strong { display: block; margin-bottom: 4px; font-size: 14px; }
    .lc-sr-modal-error {
      background: #fdecea; border: 1px solid #f5c6c6;
      border-radius: 8px; padding: 12px 14px;
      font-size: 13px; color: #c62828; margin-top: 10px;
      display: none; line-height: 1.5;
    }
  `;
  document.head.appendChild(style);

  /* ── Toast ──────────────────────────────────────────────────────────── */
  function createToast() {
    const toast = document.createElement('div');
    toast.className = 'lc-toast';
    toast.innerHTML = `
      <div class="lc-toast-header">
        <h4>
          <svg width="14" height="14" viewBox="0 0 12 9" fill="none"><path fill="#2e7d32" fill-rule="evenodd" d="M11.35.643a.5.5 0 0 1 .006.707l-6.77 6.886a.5.5 0 0 1-.719-.006L.638 4.845a.5.5 0 1 1 .724-.69l2.872 3.011 6.41-6.517a.5.5 0 0 1 .707-.006z"/></svg>
          Item added to your cart
        </h4>
        <button class="lc-toast-close" aria-label="Close">&times;</button>
      </div>
      <div class="lc-toast-body">
        <img class="lc-toast-img" src="" alt="">
        <div class="lc-toast-info">
          <p class="lc-toast-name"></p>
          <p class="lc-toast-price"></p>
        </div>
      </div>
      <div class="lc-toast-actions">
        <a href="${getCartUrl()}" class="lc-btn-viewcart">View cart (${getCartCount()})</a>
        <button type="button" class="lc-btn-continue">Continue shopping</button>
      </div>
    `;
    document.body.appendChild(toast);
    toast.querySelector('.lc-toast-close').addEventListener('click', () => toast.classList.remove('active'));
    toast.querySelector('.lc-btn-continue').addEventListener('click', () => toast.classList.remove('active'));
    return toast;
  }

  function getCartUrl() {
    return window.location.pathname.includes('/products/') ? '../cart.html' : 'cart.html';
  }

  function showToast(product) {
    let toast = document.querySelector('.lc-toast');
    if (!toast) toast = createToast();

    const img = toast.querySelector('.lc-toast-img');
    if (product.imgSrc) { img.src = product.imgSrc; img.style.display = ''; }
    else { img.style.display = 'none'; }

    toast.querySelector('.lc-toast-name').textContent = product.name;
    toast.querySelector('.lc-toast-price').textContent = product.price + (product.qty > 1 ? ` × ${product.qty}` : '');

    const viewCartBtn = toast.querySelector('.lc-btn-viewcart');
    viewCartBtn.textContent = `View cart (${getCartCount()})`;
    viewCartBtn.href = getCartUrl();

    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 4000);
  }

  /* ── Product info ─────────────────────────────────────────────────── */
  function getProductFromPage() {
    const titleEl = document.querySelector('.product__title h1') ||
                    document.querySelector('.product__title h2');
    const name = titleEl ? titleEl.textContent.trim() : 'Product';
    const salePrice = document.querySelector('.price-item--sale');
    const regPrice  = document.querySelector('.price-item--regular');
    const rawPrice  = salePrice ? salePrice.textContent : (regPrice ? regPrice.textContent : '');
    const price     = rawPrice.replace(/\s+/g, ' ').trim();
    const imgEl  = document.querySelector('.product__media-wrapper img') || document.querySelector('.product__media img');
    const imgSrc = imgEl ? (imgEl.src || imgEl.dataset.src || '') : '';
    const qtyInput = document.querySelector('quantity-input input') || document.querySelector('.quantity__input');
    const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
    return { name, price, imgSrc, qty, url: window.location.href };
  }

  /* ── Product page intercept ─────────────────────────────────────────── */
  function initProductPage() {
    const productForm = document.querySelector('product-form');
    if (!productForm) return;
    const form = productForm.querySelector('form');
    if (!form) return;
    form.removeAttribute('action');
    const submitBtn = productForm.querySelector('[type="submit"]');
    const spinner   = productForm.querySelector('.loading__spinner');

    const newHandler = function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (submitBtn) { submitBtn.setAttribute('aria-disabled', 'true'); submitBtn.classList.add('loading'); }
      if (spinner) spinner.classList.remove('hidden');
      const product = getProductFromPage();
      setTimeout(() => {
        addToCart(product);
        showToast(product);
        if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.removeAttribute('aria-disabled'); }
        if (spinner) spinner.classList.add('hidden');
      }, 300);
    };

    form.addEventListener('submit', newHandler, true);
    if (submitBtn) { submitBtn.addEventListener('click', function (e) { e.preventDefault(); e.stopImmediatePropagation(); newHandler(e); }, true); }
  }

  /* ── Cart page ──────────────────────────────────────────────────────── */
  function isCartPage() {
    return window.location.pathname.endsWith('cart.html') || window.location.pathname.endsWith('/cart');
  }

  function parsePrice(str) {
    if (!str) return 0;
    const text = String(str).replace(/\u20b9/g, '').replace(/Rs\.?/gi, '').replace(/INR/gi, '').trim();
    const matches = text.match(/\d[\d,]*(?:\.\d+)?/g);
    if (!matches || !matches.length) return 0;
    const value = parseFloat(matches[matches.length - 1].replace(/,/g, ''));
    return Number.isFinite(value) ? value : 0;
  }

  function getItemUnitPrice(item) {
    if (Number.isFinite(item.priceNum) && item.priceNum > 0) return item.priceNum;
    const parsed = parsePrice(item.price);
    item.priceNum = parsed;
    return parsed;
  }

  function getItemQty(item) {
    const qty = Number(item.qty);
    return Number.isFinite(qty) && qty > 0 ? qty : 1;
  }

  const WA_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 0 1-4.107-1.138l-.293-.176-2.867.852.852-2.867-.176-.293A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>`;

  const SR_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5L21.46 12H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.35-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>`;

  /* ── WhatsApp cart modal ─────────────────────────────────────────────── */
  let _waModalEl = null;

  function getWAModal() {
    if (_waModalEl) return _waModalEl;

    const overlay = document.createElement('div');
    overlay.className = 'lc-wa-overlay';
    overlay.innerHTML = `
      <div class="lc-wa-modal">
        <div class="lc-wa-header">
          <h3>Order via WhatsApp</h3>
          <button class="lc-wa-close" aria-label="Close">&times;</button>
        </div>
        <div class="lc-wa-summary">
          <strong id="lc-wa-items-label"></strong>
          <span id="lc-wa-total-label"></span>
        </div>
        <form class="lc-wa-form" novalidate>
          <label for="lc-wa-name">Full Name *</label>
          <input type="text"  id="lc-wa-name"    placeholder="Enter your full name"     autocomplete="name" required>
          <div class="lc-wa-err" id="lc-wa-name-err">Please enter your name</div>

          <label for="lc-wa-phone">Phone Number *</label>
          <input type="tel"   id="lc-wa-phone"   placeholder="10-digit mobile number"   autocomplete="tel" required>
          <div class="lc-wa-err" id="lc-wa-phone-err">Please enter a valid phone number</div>

          <label for="lc-wa-address">Delivery Address *</label>
          <textarea           id="lc-wa-address" placeholder="House no., Street, Area"  autocomplete="street-address" required></textarea>
          <div class="lc-wa-err" id="lc-wa-address-err">Please enter your delivery address</div>

          <div class="lc-wa-row-2">
            <div>
              <label for="lc-wa-city">City</label>
              <input type="text" id="lc-wa-city"  placeholder="e.g. Lucknow" autocomplete="address-level2">
              <div class="lc-wa-err" id="lc-wa-city-err"></div>
            </div>
            <div>
              <label for="lc-wa-state">State</label>
              <input type="text" id="lc-wa-state" placeholder="e.g. Uttar Pradesh" autocomplete="address-level1">
              <div class="lc-wa-err" id="lc-wa-state-err"></div>
            </div>
          </div>
          <div style="margin-bottom:14px"></div>

          <label for="lc-wa-pincode">Pincode *</label>
          <input type="text"  id="lc-wa-pincode" placeholder="6-digit pincode" inputmode="numeric" required>
          <div class="lc-wa-err" id="lc-wa-pincode-err">Please enter a valid 6-digit pincode</div>

          <button type="submit" class="lc-wa-submit">
            ${WA_SVG}
            Send Order on WhatsApp
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.lc-wa-close').addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('active'); });

    overlay.querySelector('.lc-wa-form').addEventListener('submit', e => {
      e.preventDefault();
      submitWACartOrder(overlay);
    });

    _waModalEl = overlay;
    return overlay;
  }

  function openWAModal(cart, total) {
    const overlay = getWAModal();
    const itemCount = cart.reduce((s, i) => s + i.qty, 0);
    overlay.querySelector('#lc-wa-items-label').textContent =
      itemCount + ' item' + (itemCount > 1 ? 's' : '') + ' in your cart';
    overlay.querySelector('#lc-wa-total-label').textContent =
      'Total: Rs. ' + total.toFixed(2);
    overlay.querySelectorAll('.lc-wa-err').forEach(el => el.style.display = 'none');
    overlay.classList.add('active');
  }

  function submitWACartOrder(overlay) {
    const f = id => overlay.querySelector('#' + id);
    const name    = f('lc-wa-name').value.trim();
    const phone   = f('lc-wa-phone').value.trim();
    const address = f('lc-wa-address').value.trim();
    const city    = f('lc-wa-city').value.trim();
    const state   = f('lc-wa-state').value.trim();
    const pincode = f('lc-wa-pincode').value.trim();

    let valid = true;
    function showErr(id, show) {
      f(id).style.display = show ? 'block' : 'none';
      if (show) valid = false;
    }
    showErr('lc-wa-name-err',    !name);
    showErr('lc-wa-phone-err',   !phone || phone.replace(/\D/g, '').length < 10);
    showErr('lc-wa-address-err', !address);
    showErr('lc-wa-pincode-err', !pincode || pincode.replace(/\D/g, '').length < 6);
    if (!valid) return;

    const cart = getCart();
    let lines = ['*New Order - Al-Saalim Perfumes*', ''];
    let total = 0;
    cart.forEach((item, i) => {
      const unitPrice = getItemUnitPrice(item);
      const qty       = getItemQty(item);
      const lineTotal = unitPrice * qty;
      total += lineTotal;
      lines.push(`${i + 1}. *${item.name}*`);
      lines.push(`   Price: ${item.price} × ${qty} = Rs. ${lineTotal.toFixed(2)}`);
    });
    lines.push('');
    lines.push(`*Total: Rs. ${total.toFixed(2)} INR*`);
    lines.push('');
    lines.push('*Customer Details:*');
    lines.push(`*Name:* ${name}`);
    lines.push(`*Phone:* ${phone}`);
    lines.push(`*Address:* ${address}`);
    if (city)    lines.push(`*City:* ${city}`);
    if (state)   lines.push(`*State:* ${state}`);
    lines.push(`*Pincode:* ${pincode}`);
    lines.push('');
    lines.push('Please confirm my order. Thank you!');

    window.open(
      `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank'
    );
    overlay.classList.remove('active');
  }

  /* ── Shiprocket cart modal ────────────────────────────────────────────── */
  let _srModalEl = null;

  function getSRModal() {
    if (_srModalEl) return _srModalEl;

    const overlay = document.createElement('div');
    overlay.className = 'lc-sr-overlay';
    overlay.innerHTML = `
      <div class="lc-sr-modal">
        <div class="lc-sr-header">
          <h3>Ship via Shiprocket</h3>
          <button class="lc-sr-close" aria-label="Close">&times;</button>
        </div>
        <div class="lc-sr-summary">
          <strong id="lc-sr-items-label"></strong>
          <span id="lc-sr-total-label"></span>
        </div>
        <form class="lc-sr-form" novalidate>
          <label for="lc-sr-name">Full Name *</label>
          <input type="text"  id="lc-sr-name"    placeholder="Enter your full name"           autocomplete="name" required>
          <div class="lc-sr-err" id="lc-sr-name-err">Please enter your name</div>

          <label for="lc-sr-phone">Phone Number *</label>
          <input type="tel"   id="lc-sr-phone"   placeholder="10-digit mobile number"         autocomplete="tel" required>
          <div class="lc-sr-err" id="lc-sr-phone-err">Please enter a valid phone number</div>

          <label for="lc-sr-email">Email *</label>
          <input type="email" id="lc-sr-email"   placeholder="your@email.com"                 autocomplete="email" required>
          <div class="lc-sr-err" id="lc-sr-email-err">Please enter a valid email address</div>

          <label for="lc-sr-address">Delivery Address *</label>
          <textarea           id="lc-sr-address" placeholder="House no., Street, Area"        autocomplete="street-address" required></textarea>
          <div class="lc-sr-err" id="lc-sr-address-err">Please enter your delivery address</div>

          <div class="lc-sr-row-2">
            <div>
              <label for="lc-sr-city">City *</label>
              <input type="text" id="lc-sr-city"  placeholder="e.g. Lucknow" autocomplete="address-level2" required>
              <div class="lc-sr-err" id="lc-sr-city-err">Required</div>
            </div>
            <div>
              <label for="lc-sr-state">State *</label>
              <input type="text" id="lc-sr-state" placeholder="e.g. Uttar Pradesh" autocomplete="address-level1" required>
              <div class="lc-sr-err" id="lc-sr-state-err">Required</div>
            </div>
          </div>
          <div style="margin-bottom:14px"></div>

          <label for="lc-sr-pincode">Pincode *</label>
          <input type="text"  id="lc-sr-pincode"  placeholder="6-digit pincode" inputmode="numeric" required>
          <div class="lc-sr-err" id="lc-sr-pincode-err">Please enter a valid 6-digit pincode</div>

          <button type="submit" class="lc-sr-submit" id="lc-sr-submit-btn">
            ${SR_SVG}
            Confirm &amp; Place Order
          </button>

          <div class="lc-sr-modal-success" id="lc-sr-modal-success">
            <strong>&#10003; Order placed successfully!</strong>
            Your order has been created on Shiprocket. Our team will ship it shortly.
          </div>
          <div class="lc-sr-modal-error" id="lc-sr-modal-error"></div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.lc-sr-close').addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('active'); });

    overlay.querySelector('.lc-sr-form').addEventListener('submit', async e => {
      e.preventDefault();
      await submitSRCartOrder(overlay);
    });

    _srModalEl = overlay;
    return overlay;
  }

  function openSRModal(cart, total) {
    const overlay = getSRModal();
    const itemCount = cart.reduce((s, i) => s + i.qty, 0);
    overlay.querySelector('#lc-sr-items-label').textContent =
      itemCount + ' item' + (itemCount > 1 ? 's' : '') + ' in your cart';
    overlay.querySelector('#lc-sr-total-label').textContent =
      'Total: Rs. ' + total.toFixed(2);
    overlay.querySelectorAll('.lc-sr-err').forEach(el => el.style.display = 'none');
    overlay.querySelector('#lc-sr-modal-success').style.display = 'none';
    overlay.querySelector('#lc-sr-modal-error').style.display = 'none';
    const btn = overlay.querySelector('#lc-sr-submit-btn');
    btn.disabled = false;
    btn.innerHTML = SR_SVG + ' Confirm &amp; Place Order';
    overlay.classList.add('active');
  }

  async function submitSRCartOrder(overlay) {
    const f = id => overlay.querySelector('#' + id);
    const name    = f('lc-sr-name').value.trim();
    const phone   = f('lc-sr-phone').value.trim();
    const email   = f('lc-sr-email').value.trim();
    const address = f('lc-sr-address').value.trim();
    const city    = f('lc-sr-city').value.trim();
    const state   = f('lc-sr-state').value.trim();
    const pincode = f('lc-sr-pincode').value.trim();

    let valid = true;
    function showErr(id, show) {
      f(id).style.display = show ? 'block' : 'none';
      if (show) valid = false;
    }
    showErr('lc-sr-name-err',    !name);
    showErr('lc-sr-phone-err',   !phone || phone.replace(/\D/g, '').length < 10);
    showErr('lc-sr-email-err',   !email || !email.includes('@'));
    showErr('lc-sr-address-err', !address);
    showErr('lc-sr-city-err',    !city);
    showErr('lc-sr-state-err',   !state);
    showErr('lc-sr-pincode-err', !pincode || pincode.replace(/\D/g, '').length < 6);
    if (!valid) return;

    const successBox = f('lc-sr-modal-success');
    const errorBox   = f('lc-sr-modal-error');
    const btn        = f('lc-sr-submit-btn');

    successBox.style.display = 'none';
    errorBox.style.display   = 'none';

    if (!_srReady || !window.ShiprocketAPI) {
      errorBox.textContent = 'Shiprocket is still loading — please try again in a moment.';
      errorBox.style.display = 'block';
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Placing order…';

    const cart = getCart();
    const customer = { name, phone, email, address, city, state, pincode };
    const items = cart.map(item => ({
      name:  item.name,
      price: item.priceNum || item.price,
      qty:   getItemQty(item)
    }));

    try {
      await window.ShiprocketAPI.placeOrder(customer, items);
      successBox.style.display = 'block';
      btn.textContent = '✓ Order Placed';
      clearCart();
      setTimeout(() => {
        overlay.classList.remove('active');
        renderCartPage();
      }, 3000);
    } catch (err) {
      errorBox.innerHTML = '<strong>Error:</strong> ' + (err.message || 'Unknown error. Please try again.');
      errorBox.style.display = 'block';
      btn.disabled  = false;
      btn.innerHTML = SR_SVG + ' Confirm &amp; Place Order';
    }
  }

  /* ── Render cart page ───────────────────────────────────────────────── */
  function renderCartPage() {
    if (!isCartPage()) return;
    const main = document.getElementById('MainContent') || document.querySelector('main');
    if (!main) return;

    const cart = getCart();

    if (cart.length === 0) {
      main.innerHTML = `
        <div class="lc-cart-page">
          <h1>Your cart</h1>
          <div class="lc-cart-empty">
            <p>Your cart is empty</p>
            <a href="collections/all.html">Continue shopping</a>
          </div>
        </div>`;
      return;
    }

    let total = 0;
    let itemsHTML = '';
    let cartChanged = false;
    cart.forEach((item, i) => {
      const hadPriceNum = Number.isFinite(item.priceNum) && item.priceNum > 0;
      const unitPrice   = getItemUnitPrice(item);
      if (!hadPriceNum && unitPrice > 0) cartChanged = true;
      const qty = getItemQty(item);
      if (item.qty !== qty) { item.qty = qty; cartChanged = true; }
      const lineTotal = unitPrice * qty;
      total += lineTotal;

      itemsHTML += `
        <div class="lc-cart-item" data-index="${i}">
          <img src="${item.imgSrc || ''}" alt="${item.name}" style="${item.imgSrc ? '' : 'display:none'}">
          <div class="lc-cart-item-info">
            <p class="lc-item-name">${item.name}</p>
            <p class="lc-item-price">${item.price}</p>
            <div class="lc-qty-controls">
              <button class="lc-qty-minus" data-index="${i}">−</button>
              <span>${qty}</span>
              <button class="lc-qty-plus" data-index="${i}">+</button>
            </div>
            <button class="lc-remove-btn" data-index="${i}">Remove</button>
          </div>
        </div>`;
    });
    if (cartChanged) saveCart(cart);

    main.innerHTML = `
      <div class="lc-cart-page">
        <h1>Your cart</h1>
        ${itemsHTML}
        <div class="lc-cart-footer">
          <div class="lc-cart-total">
            <span>Estimated total</span>
            <span>Rs. ${total.toFixed(2)} INR</span>
          </div>
          <button class="lc-checkout-wa" id="lc-checkout-wa-btn">
            ${WA_SVG}
            Checkout via WhatsApp
          </button>
          <div class="lc-or">or</div>
          <button class="lc-checkout-sr" id="lc-checkout-sr-btn">
            ${SR_SVG}
            Checkout via Shiprocket
          </button>
          <button class="lc-clear-btn" id="lc-clear-cart">Clear cart</button>
        </div>
      </div>`;

    main.querySelectorAll('.lc-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => { const c = getCart(); updateQty(parseInt(btn.dataset.index), c[parseInt(btn.dataset.index)].qty - 1); renderCartPage(); });
    });
    main.querySelectorAll('.lc-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => { const c = getCart(); updateQty(parseInt(btn.dataset.index), c[parseInt(btn.dataset.index)].qty + 1); renderCartPage(); });
    });
    main.querySelectorAll('.lc-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => { removeFromCart(parseInt(btn.dataset.index)); renderCartPage(); });
    });

    document.getElementById('lc-clear-cart').addEventListener('click', () => { clearCart(); renderCartPage(); });

    document.getElementById('lc-checkout-wa-btn').addEventListener('click', () => openWAModal(getCart(), total));

    document.getElementById('lc-checkout-sr-btn').addEventListener('click', () => openSRModal(getCart(), total));
  }

  /* ── Migrate old cart data ──────────────────────────────────────────── */
  function migrateCart() {
    const cart = getCart();
    if (!cart.length) return;
    let changed = false;
    cart.forEach(item => {
      if (item.price && typeof item.price === 'string') { item.price = item.price.replace(/\s+/g, ' ').trim(); }
      if (!Number.isFinite(item.priceNum) || item.priceNum <= 0) { item.priceNum = parsePrice(item.price); changed = true; }
      if (!Number.isFinite(item.qty) || item.qty <= 0) { item.qty = 1; changed = true; }
    });
    if (changed) saveCart(cart);
  }

  /* ── Init ───────────────────────────────────────────────────────────── */
  function init() {
    migrateCart();
    updateBadge();
    if (isCartPage()) { renderCartPage(); }
    else { initProductPage(); }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();

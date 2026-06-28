(function () {
  const WHATSAPP_NUMBER = '919528394331';
  const CART_KEY = 'alsaalim_cart';

  /* ─── Cart Data Helpers ─── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function addToCart(product) {
    const cart = getCart();
    const item = {
      ...product,
      qty: Number(product.qty) || 1,
      priceNum: parsePrice(product.price)
    };
    const existing = cart.find(i => i.name === item.name);
    if (existing) {
      existing.qty += item.qty;
      if (!existing.priceNum) existing.priceNum = item.priceNum;
    } else {
      cart.push(item);
    }
    saveCart(cart);
    updateBadge();
  }

  function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateBadge();
  }

  function updateQty(index, qty) {
    const cart = getCart();
    if (qty <= 0) { cart.splice(index, 1); }
    else { cart[index].qty = qty; }
    saveCart(cart);
    updateBadge();
  }

  function clearCart() { localStorage.removeItem(CART_KEY); updateBadge(); }

  /* ─── Badge ─── */
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
      } else if (bubble) {
        bubble.remove();
      }
    });
  }

  /* ─── Styles ─── */
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

    /* Toast notification */
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
    .lc-toast-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; border-bottom: 1px solid #eee;
    }
    .lc-toast-header h4 {
      margin: 0; font-size: 14px; font-weight: 600;
      display: flex; align-items: center; gap: 6px; color: #2e7d32;
    }
    .lc-toast-close {
      background: none; border: none; font-size: 22px;
      cursor: pointer; color: #888; padding: 0 4px; line-height: 1;
    }
    .lc-toast-close:hover { color: #333; }
    .lc-toast-body {
      display: flex; gap: 12px; padding: 14px 18px; align-items: center;
    }
    .lc-toast-body img {
      width: 64px; height: 64px; object-fit: cover;
      border-radius: 6px; border: 1px solid #eee;
    }
    .lc-toast-info { flex: 1; }
    .lc-toast-info .lc-toast-name {
      font-size: 13px; font-weight: 600; color: #1a1a1a;
      margin: 0 0 3px; line-height: 1.3;
      overflow: hidden; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .lc-toast-info .lc-toast-price {
      font-size: 13px; color: #555; margin: 0;
    }
    .lc-toast-actions {
      padding: 0 18px 14px; display: flex; flex-direction: column; gap: 8px;
    }
    .lc-toast-actions a, .lc-toast-actions button {
      display: block; width: 100%; text-align: center;
      padding: 10px; border-radius: 6px; font-size: 13px;
      font-weight: 600; text-decoration: none; cursor: pointer;
      box-sizing: border-box;
    }
    .lc-btn-viewcart {
      background: #1a1a1a; color: #fff !important; border: none;
    }
    .lc-btn-viewcart:hover { background: #333; }
    .lc-btn-continue {
      background: none; border: 1.5px solid #ddd; color: #1a1a1a !important;
    }
    .lc-btn-continue:hover { border-color: #aaa; }

    @media (max-width: 480px) {
      .lc-toast { width: 100vw; }
    }

    /* ─── Cart Page ─── */
    .lc-cart-page { max-width: 800px; margin: 0 auto; padding: 20px; }
    .lc-cart-page h1 { font-size: 28px; margin-bottom: 24px; }
    .lc-cart-empty {
      text-align: center; padding: 60px 20px; color: #888;
    }
    .lc-cart-empty p { font-size: 16px; margin-bottom: 16px; }
    .lc-cart-empty a {
      display: inline-block; padding: 12px 28px;
      background: #1a1a1a; color: #fff !important;
      text-decoration: none; border-radius: 6px;
      font-weight: 600; font-size: 14px;
    }
    .lc-cart-item {
      display: flex; gap: 16px; padding: 18px 0;
      border-bottom: 1px solid #eee; align-items: center;
    }
    .lc-cart-item img {
      width: 80px; height: 80px; object-fit: cover;
      border-radius: 8px; border: 1px solid #eee;
    }
    .lc-cart-item-info { flex: 1; }
    .lc-cart-item-info .lc-item-name {
      font-size: 14px; font-weight: 600; color: #1a1a1a;
      margin: 0 0 4px; line-height: 1.3;
    }
    .lc-cart-item-info .lc-item-price {
      font-size: 14px; color: #2e7d32; font-weight: 600; margin: 0 0 8px;
    }
    .lc-qty-controls {
      display: flex; align-items: center; gap: 0; border: 1.5px solid #ddd; border-radius: 6px; overflow: hidden;
    }
    .lc-qty-controls button {
      background: none; border: none; padding: 6px 12px;
      font-size: 16px; cursor: pointer; color: #333;
    }
    .lc-qty-controls button:hover { background: #f5f5f5; }
    .lc-qty-controls span {
      padding: 6px 14px; font-size: 14px; font-weight: 600;
      border-left: 1.5px solid #ddd; border-right: 1.5px solid #ddd;
      min-width: 20px; text-align: center;
    }
    .lc-remove-btn {
      background: none; border: none; color: #d32f2f;
      font-size: 13px; cursor: pointer; text-decoration: underline;
      padding: 4px 0; margin-top: 4px; display: inline-block;
    }
    .lc-cart-footer {
      padding: 20px 0; border-top: 2px solid #1a1a1a; margin-top: 8px;
    }
    .lc-cart-total {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 18px; font-weight: 700; margin-bottom: 18px;
    }
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
    .lc-clear-btn {
      display: block; width: 100%; text-align: center;
      margin-top: 10px; background: none; border: 1.5px solid #ddd;
      padding: 12px; border-radius: 8px; font-size: 14px;
      cursor: pointer; color: #666; font-weight: 600;
    }
    .lc-clear-btn:hover { border-color: #d32f2f; color: #d32f2f; }
  `;
  document.head.appendChild(style);

  /* ─── Toast Notification ─── */
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

  /* ─── Extract Product Info ─── */
  function getProductFromPage() {
    const titleEl = document.querySelector('.product__title h1') ||
                    document.querySelector('.product__title h2');
    const name = titleEl ? titleEl.textContent.trim() : 'Product';

    const salePrice = document.querySelector('.price-item--sale');
    const regPrice = document.querySelector('.price-item--regular');
    const rawPrice = salePrice ? salePrice.textContent :
                     (regPrice ? regPrice.textContent : '');
    const price = rawPrice.replace(/\s+/g, ' ').trim();

    const imgEl = document.querySelector('.product__media-wrapper img') ||
                  document.querySelector('.product__media img');
    const imgSrc = imgEl ? (imgEl.src || imgEl.dataset.src || '') : '';

    const qtyInput = document.querySelector('quantity-input input') ||
                     document.querySelector('.quantity__input');
    const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

    const url = window.location.href;
    return { name, price, imgSrc, qty, url };
  }

  /* ─── Intercept Add to Cart on Product Pages ─── */
  function initProductPage() {
    const productForm = document.querySelector('product-form');
    if (!productForm) return;

    const form = productForm.querySelector('form');
    if (!form) return;

    const origListeners = form.onsubmit;
    form.removeAttribute('action');

    const submitBtn = productForm.querySelector('[type="submit"]');
    const spinner = productForm.querySelector('.loading__spinner');

    const newHandler = function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (submitBtn) {
        submitBtn.setAttribute('aria-disabled', 'true');
        submitBtn.classList.add('loading');
      }
      if (spinner) spinner.classList.remove('hidden');

      const product = getProductFromPage();

      setTimeout(() => {
        addToCart(product);
        showToast(product);

        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.removeAttribute('aria-disabled');
        }
        if (spinner) spinner.classList.add('hidden');
      }, 300);
    };

    form.addEventListener('submit', newHandler, true);

    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        newHandler(e);
      }, true);
    }
  }

  /* ─── Cart Page Rendering ─── */
  function isCartPage() {
    return window.location.pathname.endsWith('cart.html') ||
           window.location.pathname.endsWith('/cart');
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
            <a href="${window.location.pathname.includes('/') ? 'collections/all.html' : 'collections/all.html'}">Continue shopping</a>
          </div>
        </div>`;
      return;
    }

    let total = 0;
    let itemsHTML = '';
    let cartChanged = false;
    cart.forEach((item, i) => {
      const hadPriceNum = Number.isFinite(item.priceNum) && item.priceNum > 0;
      const unitPrice = getItemUnitPrice(item);
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
          <button class="lc-checkout-wa" id="lc-checkout-btn">
            ${WA_SVG}
            Checkout via WhatsApp
          </button>
          <button class="lc-clear-btn" id="lc-clear-cart">Clear cart</button>
        </div>
      </div>`;

    main.querySelectorAll('.lc-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const c = getCart();
        updateQty(idx, c[idx].qty - 1);
        renderCartPage();
      });
    });
    main.querySelectorAll('.lc-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const c = getCart();
        updateQty(idx, c[idx].qty + 1);
        renderCartPage();
      });
    });
    main.querySelectorAll('.lc-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(parseInt(btn.dataset.index));
        renderCartPage();
      });
    });
    document.getElementById('lc-clear-cart').addEventListener('click', () => {
      clearCart();
      renderCartPage();
    });
    document.getElementById('lc-checkout-btn').addEventListener('click', () => {
      checkoutWhatsApp();
    });
  }

  function checkoutWhatsApp() {
    const cart = getCart();
    if (!cart.length) return;

    let lines = ['*New Order - Al-Saalim Perfumes*', ''];
    let total = 0;
    cart.forEach((item, i) => {
      const unitPrice = getItemUnitPrice(item);
      const qty = getItemQty(item);
      const lineTotal = unitPrice * qty;
      total += lineTotal;
      lines.push(`${i + 1}. *${item.name}*`);
      lines.push(`   Price: ${item.price} × ${qty} = Rs. ${lineTotal.toFixed(2)}`);
    });
    lines.push('');
    lines.push(`*Total: Rs. ${total.toFixed(2)} INR*`);
    lines.push('');
    lines.push('Please confirm my order. Thank you!');

    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank');
  }

  /* ─── Migrate old cart data ─── */
  function migrateCart() {
    const cart = getCart();
    if (!cart.length) return;
    let changed = false;
    cart.forEach(item => {
      if (item.price && typeof item.price === 'string') {
        item.price = item.price.replace(/\s+/g, ' ').trim();
      }
      if (!Number.isFinite(item.priceNum) || item.priceNum <= 0) {
        item.priceNum = parsePrice(item.price);
        changed = true;
      }
      if (!Number.isFinite(item.qty) || item.qty <= 0) {
        item.qty = 1;
        changed = true;
      }
    });
    if (changed) saveCart(cart);
  }

  /* ─── Init ─── */
  function init() {
    migrateCart();
    updateBadge();
    if (isCartPage()) {
      renderCartPage();
    } else {
      initProductPage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

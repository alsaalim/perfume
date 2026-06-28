(function () {
  const WHATSAPP_NUMBER = '919528394331';

  const style = document.createElement('style');
  style.textContent = `
    .buy-now-custom-btn {
      width: 100%;
      padding: 14px 24px;
      background: #1a1a1a;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: .5px;
      cursor: pointer;
      transition: background .2s;
      margin-top: 4px;
    }
    .buy-now-custom-btn:hover { background: #333; }

    .buy-now-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.55);
      z-index: 100000;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; visibility: hidden;
      transition: opacity .25s, visibility .25s;
    }
    .buy-now-overlay.active { opacity: 1; visibility: visible; }

    .buy-now-modal {
      background: #fff; border-radius: 14px;
      width: 92%; max-width: 460px;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
      animation: bnmSlideUp .3s ease;
    }
    @keyframes bnmSlideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .bnm-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 22px 14px;
      border-bottom: 1px solid #eee;
    }
    .bnm-header h3 {
      margin: 0; font-size: 18px; font-weight: 700; color: #1a1a1a;
    }
    .bnm-close {
      background: none; border: none; font-size: 26px;
      cursor: pointer; color: #888; line-height: 1;
      padding: 0 4px;
    }
    .bnm-close:hover { color: #333; }

    .bnm-product {
      padding: 18px 22px;
      display: flex; gap: 14px; align-items: center;
      background: #f8f8f8; border-bottom: 1px solid #eee;
    }
    .bnm-product img {
      width: 72px; height: 72px;
      object-fit: cover; border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .bnm-product-info { flex: 1; }
    .bnm-product-info .bnm-pname {
      font-size: 14px; font-weight: 600; color: #1a1a1a;
      margin: 0 0 4px; line-height: 1.3;
    }
    .bnm-product-info .bnm-pprice {
      font-size: 15px; font-weight: 700; color: #2e7d32;
      margin: 0;
    }
    .bnm-product-info .bnm-pprice-old {
      text-decoration: line-through; color: #999;
      font-weight: 400; font-size: 13px; margin-left: 6px;
    }
    .bnm-product-info .bnm-qty {
      font-size: 12px; color: #666; margin: 2px 0 0;
    }

    .bnm-form { padding: 18px 22px 22px; }
    .bnm-form label {
      display: block; font-size: 13px; font-weight: 600;
      color: #444; margin-bottom: 5px;
    }
    .bnm-form input, .bnm-form textarea {
      width: 100%; padding: 10px 12px;
      border: 1.5px solid #ddd; border-radius: 8px;
      font-size: 14px; margin-bottom: 14px;
      font-family: inherit; transition: border-color .2s;
      box-sizing: border-box;
    }
    .bnm-form input:focus, .bnm-form textarea:focus {
      outline: none; border-color: #1a1a1a;
    }
    .bnm-form textarea { resize: vertical; min-height: 60px; }
    .bnm-form .bnm-error {
      color: #d32f2f; font-size: 12px;
      margin: -10px 0 10px; display: none;
    }

    .bnm-wa-btn {
      width: 100%; padding: 14px;
      background: #25D366; color: #fff;
      border: none; border-radius: 8px;
      font-size: 15px; font-weight: 700;
      cursor: pointer; display: flex;
      align-items: center; justify-content: center; gap: 8px;
      transition: background .2s;
    }
    .bnm-wa-btn:hover { background: #1fb855; }
    .bnm-wa-btn svg { width: 20px; height: 20px; fill: #fff; }
  `;
  document.head.appendChild(style);

  function getProductInfo() {
    const titleEl = document.querySelector('.product__title h1') ||
                    document.querySelector('.product__title h2');
    const name = titleEl ? titleEl.textContent.trim() : 'Product';

    const salePrice = document.querySelector('.price-item--sale');
    const regPrice = document.querySelector('.price-item--regular');
    const price = salePrice ? salePrice.textContent.trim() :
                  (regPrice ? regPrice.textContent.trim() : '');

    const oldPriceEl = document.querySelector('.price--on-sale .price-item--regular');
    const oldPrice = (oldPriceEl && salePrice) ? oldPriceEl.textContent.trim() : '';

    const imgEl = document.querySelector('.product__media-wrapper img') ||
                  document.querySelector('.product__media img');
    const imgSrc = imgEl ? (imgEl.src || imgEl.dataset.src || '') : '';

    const qtyInput = document.querySelector('quantity-input input') ||
                     document.querySelector('.quantity__input');
    const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

    return { name, price, oldPrice, imgSrc, qty };
  }

  function createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'buy-now-overlay';
    overlay.innerHTML = `
      <div class="buy-now-modal">
        <div class="bnm-header">
          <h3>Complete Your Order</h3>
          <button class="bnm-close" aria-label="Close">&times;</button>
        </div>
        <div class="bnm-product">
          <img class="bnm-img" src="" alt="Product">
          <div class="bnm-product-info">
            <p class="bnm-pname"></p>
            <p class="bnm-pprice"></p>
            <p class="bnm-qty"></p>
          </div>
        </div>
        <form class="bnm-form" novalidate>
          <label for="bnm-name">Full Name *</label>
          <input type="text" id="bnm-name" placeholder="Enter your full name" required>
          <div class="bnm-error" id="bnm-name-err">Please enter your name</div>

          <label for="bnm-phone">Phone Number *</label>
          <input type="tel" id="bnm-phone" placeholder="Enter your phone number" required>
          <div class="bnm-error" id="bnm-phone-err">Please enter a valid phone number</div>

          <label for="bnm-address">Delivery Address *</label>
          <textarea id="bnm-address" placeholder="Enter your full delivery address" required></textarea>
          <div class="bnm-error" id="bnm-address-err">Please enter your address</div>

          <label for="bnm-pincode">Pincode *</label>
          <input type="text" id="bnm-pincode" placeholder="Enter your area pincode" required>
          <div class="bnm-error" id="bnm-pincode-err">Please enter a valid pincode</div>

          <button type="submit" class="bnm-wa-btn">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 0 1-4.107-1.138l-.293-.176-2.867.852.852-2.867-.176-.293A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
            Order via WhatsApp
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.bnm-close').addEventListener('click', () => {
      overlay.classList.remove('active');
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') overlay.classList.remove('active');
    });

    overlay.querySelector('.bnm-form').addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(overlay);
    });

    return overlay;
  }

  function openModal(overlay) {
    const product = getProductInfo();

    const img = overlay.querySelector('.bnm-img');
    if (product.imgSrc) {
      img.src = product.imgSrc;
      img.style.display = '';
    } else {
      img.style.display = 'none';
    }

    overlay.querySelector('.bnm-pname').textContent = product.name;

    const priceEl = overlay.querySelector('.bnm-pprice');
    priceEl.innerHTML = product.price;
    if (product.oldPrice && product.oldPrice !== product.price) {
      priceEl.innerHTML += `<span class="bnm-pprice-old">${product.oldPrice}</span>`;
    }

    overlay.querySelector('.bnm-qty').textContent = `Qty: ${product.qty}`;

    overlay.querySelectorAll('.bnm-error').forEach(el => el.style.display = 'none');
    overlay.classList.add('active');
  }

  function handleSubmit(overlay) {
    const name = overlay.querySelector('#bnm-name').value.trim();
    const phone = overlay.querySelector('#bnm-phone').value.trim();
    const address = overlay.querySelector('#bnm-address').value.trim();
    const pincode = overlay.querySelector('#bnm-pincode').value.trim();

    let valid = true;

    if (!name) {
      overlay.querySelector('#bnm-name-err').style.display = 'block';
      valid = false;
    } else {
      overlay.querySelector('#bnm-name-err').style.display = 'none';
    }

    if (!phone || phone.length < 10) {
      overlay.querySelector('#bnm-phone-err').style.display = 'block';
      valid = false;
    } else {
      overlay.querySelector('#bnm-phone-err').style.display = 'none';
    }

    if (!address) {
      overlay.querySelector('#bnm-address-err').style.display = 'block';
      valid = false;
    } else {
      overlay.querySelector('#bnm-address-err').style.display = 'none';
    }

    if (!pincode || pincode.length < 5) {
      overlay.querySelector('#bnm-pincode-err').style.display = 'block';
      valid = false;
    } else {
      overlay.querySelector('#bnm-pincode-err').style.display = 'none';
    }

    if (!valid) return;

    const product = getProductInfo();
    const message = [
      `*New Order - Al-Saalim Perfumes*`,
      ``,
      `*Product:* ${product.name}`,
      `*Price:* ${product.price}`,
      `*Quantity:* ${product.qty}`,
      ``,
      `*Customer Details:*`,
      `*Name:* ${name}`,
      `*Phone:* ${phone}`,
      `*Address:* ${address}`,
      `*Pincode:* ${pincode}`,
      ``,
      `Please confirm my order. Thank you!`
    ].join('\n');

    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    overlay.classList.remove('active');
  }

  function init() {
    const paymentBtnContainer = document.querySelector('[data-shopify="payment-button"]');
    if (!paymentBtnContainer) return;

    const buyBtn = document.createElement('button');
    buyBtn.type = 'button';
    buyBtn.className = 'buy-now-custom-btn';
    buyBtn.textContent = 'Buy it now';
    paymentBtnContainer.replaceWith(buyBtn);

    const overlay = createModal();

    buyBtn.addEventListener('click', () => openModal(overlay));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

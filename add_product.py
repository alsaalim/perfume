#!/usr/bin/env python3
"""
add_product.py
──────────────
Interactive CLI tool to add a new product to the AL-SAALIM PERFUMES static site.

What it does:
  1. Asks for product info (name, price, description, images)
  2. Copies your images into cdn/shop/files/
  3. Creates a new product page in products/
  4. Adds the product card to collections/all.html
  5. Adds the product to the search index in search.html

Usage:
  python3 add_product.py
"""

import os
import re
import sys
import shutil
import uuid
import time
import textwrap
from pathlib import Path

# ── ANSI colours ──────────────────────────────────────────────────────────────
BOLD   = '\033[1m'
GREEN  = '\033[92m'
CYAN   = '\033[96m'
YELLOW = '\033[93m'
RED    = '\033[91m'
DIM    = '\033[2m'
RESET  = '\033[0m'

def c(color, text): return f'{color}{text}{RESET}'
def ok(msg):   print(c(GREEN,  f'  ✓  {msg}'))
def warn(msg): print(c(YELLOW, f'  ⚠  {msg}'))
def err(msg):  print(c(RED,    f'  ✗  {msg}')); sys.exit(1)
def info(msg): print(c(CYAN,   f'     {msg}'))
def step(n, total, msg): print(f'\n{BOLD}[{n}/{total}] {msg}{RESET}')
def hr(): print(c(DIM, '  ' + '─' * 60))

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT          = Path(__file__).parent.resolve()
PRODUCTS_DIR  = ROOT / 'products'
CDN_FILES     = ROOT / 'cdn' / 'shop' / 'files'
COLLECTIONS   = ROOT / 'collections' / 'all.html'
SEARCH_HTML   = ROOT / 'search.html'
TEMPLATE_FILE = PRODUCTS_DIR / 'shanaya-attar-roll-on-6ml-al-saalim-perfumers-alcohol-free.html'

# Values in the template that we'll replace
TPL_SLUG      = 'shanaya-attar-roll-on-6ml-al-saalim-perfumers-alcohol-free'
TPL_TITLE     = 'Shanaya Attar (Roll On 6ml) | Al-Saalim Perfumers | Alcohol Free'
TPL_SHORT_TITLE = 'Shanaya Attar (Roll On 6ml)'
TPL_IMG_BASE  = 'DBA449C5-395D-41C6-91CE-FD450F9FA907.png_v_1777870289'
TPL_IMG2_BASE = 'F6839981-BE23-422C-BB75-3A7AC5AFB678.png_v_1778006239'   # secondary template image
TPL_SALE_AMT  = '179.00'
TPL_ORIG_AMT  = '599.00'

# ── Helpers ───────────────────────────────────────────────────────────────────

def ask(prompt, default=None, required=True):
    """Ask the user for input with an optional default."""
    if default:
        full = f'  {BOLD}{prompt}{RESET} {DIM}(default: {default}){RESET}: '
    else:
        full = f'  {BOLD}{prompt}{RESET}: '
    while True:
        val = input(full).strip()
        if not val and default:
            return default
        if val or not required:
            return val
        print(c(RED, '    This field is required.'))


def ask_multiline(prompt):
    """Collect multiple lines until user enters a blank line."""
    print(f'  {BOLD}{prompt}{RESET}')
    print(c(DIM, '  (Press Enter on a blank line when done)'))
    lines = []
    while True:
        line = input('  > ').strip()
        if not line and lines:
            break
        if line:
            lines.append(line)
    return lines


def ask_images():
    """Ask the user for one or more image file paths."""
    print(f'\n  {BOLD}Product Images{RESET}')
    print(c(DIM, '  Enter full file paths to your images (PNG, JPG, WEBP).'))
    print(c(DIM, '  Press Enter on a blank line when done (at least 1 required).'))
    images = []
    while True:
        idx = len(images) + 1
        prompt = f'  Image {idx}'
        if images:
            prompt += ' (or blank to finish)'
        path = input(f'  {BOLD}{prompt}{RESET}: ').strip()
        if not path:
            if images:
                break
            print(c(RED, '    At least one image is required.'))
            continue
        p = Path(path)
        if not p.exists():
            print(c(RED, f'    File not found: {path}'))
            continue
        if p.suffix.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
            warn(f'Unexpected extension {p.suffix} — adding anyway.')
        images.append(p)
        ok(f'Added: {p.name}')
    return images


def slugify(text):
    """Convert product name to a URL-safe slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')


def copy_image_to_cdn(src: Path) -> str:
    """
    Copy an image to cdn/shop/files/ with a UUID name.
    Returns the filename (e.g. 'ABCD1234.png_v_1234567890').
    """
    CDN_FILES.mkdir(parents=True, exist_ok=True)
    ext      = src.suffix.lower().lstrip('.')
    uid      = str(uuid.uuid4()).upper().replace('-', '')[:32]
    # Format like Shopify: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
    uid_fmt  = f'{uid[:8]}-{uid[8:12]}-{uid[12:16]}-{uid[16:20]}-{uid[20:32]}'
    ts       = int(time.time())
    filename = f'{uid_fmt}.{ext}_v_{ts}'
    dest     = CDN_FILES / filename
    shutil.copy2(src, dest)
    return filename


def build_desc_html(lines):
    """Turn a list of description lines into product description HTML paragraphs."""
    return '\n'.join(f'<p>{line}</p>' for line in lines)


def make_product_html(slug, title, short_title, sale_price, orig_price,
                      desc_html, img_filenames):
    """
    Clone the template product page and substitute all product-specific data.
    Returns the finished HTML string.
    """
    with open(TEMPLATE_FILE, encoding='utf-8') as f:
        html = f.read()

    main_img = img_filenames[0]
    main_img_base = main_img  # e.g. 'UUID.png_v_123456'

    # ── 1. Replace slug (URLs) ─────────────────────────────────────────────
    html = html.replace(TPL_SLUG, slug)

    # ── 2. Replace title ──────────────────────────────────────────────────
    html = html.replace(TPL_TITLE, title)
    html = html.replace(TPL_SHORT_TITLE, short_title)

    # ── 3. Replace image filename(s) ─────────────────────────────────────
    # Build mapping: template slot → our image (fall back to main if only 1 image given)
    img_map = {
        TPL_IMG_BASE:  img_filenames[0],
        TPL_IMG2_BASE: img_filenames[1] if len(img_filenames) > 1 else img_filenames[0],
    }
    for tpl_base, new_img in img_map.items():
        html = html.replace(tpl_base, new_img)

    # After UUID substitution, the src/srcset still reference _width_NNN and
    # _v_NNNN variants that don't exist for our locally-copied files.
    # Strip those suffixes so every reference resolves to the files we have.
    for new_img in set(img_map.values()):
        esc = re.escape(new_img)
        # Fix src="...UUID_v_extra_width_NNN" → src="...UUID"
        html = re.sub(
            r'(src="../cdn/shop/files/)' + esc + r'(?:_v_\d+)*(?:_width_\d+)?(")',
            r'\g<1>' + new_img + r'\2',
            html,
        )
        # Collapse srcset to just our file (no width variants to offer)
        html = re.sub(
            r'(srcset=")[^"]*' + esc + r'[^"]*(")',
            r'\g<1>' + f'../cdn/shop/files/{new_img}' + r'\2',
            html,
        )

    # ── 4. Replace prices ─────────────────────────────────────────────────
    # Sale price spans (class contains price-item--sale)
    html = re.sub(
        r'(class="price-item price-item--sale[^"]*"[^>]*>)\s*Rs\.\s*' + re.escape(TPL_SALE_AMT) + r'\s*INR',
        lambda m: m.group(1) + f'\n          Rs. {sale_price} INR\n        ',
        html
    )
    # "price__regular" span — shows sale price when on sale (class=price-item--regular, not inside <s>)
    html = re.sub(
        r'(class="price-item price-item--regular"[^>]*>)\s*Rs\.\s*' + re.escape(TPL_SALE_AMT) + r'\s*INR',
        lambda m: m.group(1) + f'\n            Rs. {sale_price} INR\n          ',
        html
    )
    # Compare-at / strikethrough price (inside <s class="price-item price-item--regular">)
    html = re.sub(
        r'(class="price-item price-item--regular[^"]*"[^>]*>)\s*(?:\s*)\s*Rs\.\s*' + re.escape(TPL_ORIG_AMT) + r'\s*INR',
        lambda m: m.group(1) + f'\n                Rs. {orig_price} INR\n              ',
        html
    )
    # og:price meta tag and JSON-LD price field
    html = re.sub(r'content="' + re.escape(TPL_SALE_AMT) + r'"', f'content="{sale_price}"', html)
    html = re.sub(r'"price":"' + re.escape(TPL_SALE_AMT) + r'"', f'"price":"{sale_price}"', html)

    # ── 5. Replace description ────────────────────────────────────────────
    html = re.sub(
        r'(class="product__description rte quick-add-hidden"[^>]*>).*?(<script)',
        lambda m: m.group(1) + '\n' + desc_html + '\n                  ' + m.group(2),
        html,
        flags=re.S
    )

    # ── 6. Replace meta description ───────────────────────────────────────
    plain_desc = re.sub(r'<[^>]+>', '', desc_html).replace('\n', ' ').strip()[:250]
    html = re.sub(
        r'(<meta name="description" content=")[^"]*(")',
        lambda m: m.group(1) + plain_desc + m.group(2),
        html
    )
    html = re.sub(
        r'(<meta property="og:description" content=")[^"]*(")',
        lambda m: m.group(1) + plain_desc + m.group(2),
        html
    )
    html = re.sub(
        r'(<meta name="twitter:description" content=")[^"]*(")',
        lambda m: m.group(1) + plain_desc + m.group(2),
        html
    )

    return html


def make_collection_card(slug, title, short_title, sale_price, orig_price,
                          img_filename, animation_order=1):
    """Return the HTML block for a product card in collections/all.html."""
    img_path = f'../cdn/shop/files/{img_filename}'
    has_sale = (sale_price != orig_price)
    price_html = ''
    if has_sale:
        price_html = f'''<span class="visually-hidden">Regular price</span>
          <span>
            <s class="price-item price-item--regular">
              Rs. {orig_price} INR
            </s>
          </span><span class="visually-hidden">Sale price</span>
        <span class="price-item price-item--sale price-item--last">
          Rs. {sale_price} INR
        </span>'''
    else:
        price_html = f'''<span class="visually-hidden">Regular price</span>
        <span class="price-item price-item--regular">
          Rs. {sale_price} INR
        </span>'''

    return f'''<div class="card-wrapper product-card-wrapper underline-links-hover">
    <div
      class="
        card card--card
         card--media
         color-scheme-1 gradient
        "
      style="--ratio-percent: 100%;"
    >
      <div
        class="card__inner  ratio"
        style="--ratio-percent: 100%;"
      ><div class="card__media">
            <div class="media media--transparent media--hover-effect">
              <img
                srcset="{img_path} 1254w"
                src="{img_path}"
                sizes="(min-width: 1100px) 25vw, (min-width: 750px) 33vw, calc(50vw - 30px)"
                alt="{short_title}"
                class="motion-reduce"
                width="1254"
                height="1254"
                loading="lazy"
              >
            </div>
          </div>
        <div class="card__content">
          <div class="card__badge top left"></div>
        </div>
      </div>
      <div class="card__content">
        <div class="card__information">
          <h3 class="card__heading h5">
              <a href="../products/{slug}.html" class="full-unstyled-link">
                {short_title}
              </a>
          </h3>
          <div class="card__badge top left"></div>
        </div>
        <div class="price">
          <div class="price__container">
            <div class="price__regular">
              {price_html}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    class="grid__item scroll-trigger animate--slide-in"
    data-cascade
    style="--animation-order: {animation_order};"
  >
  '''


def update_collections(slug, title, short_title, sale_price, orig_price, img_filename):
    """Insert a new product card at the FIRST position in the product grid in collections/all.html."""
    with open(COLLECTIONS, encoding='utf-8') as f:
        html = f.read()

    first_card = '<div class="card-wrapper product-card-wrapper'
    first_pos = html.find(first_card)
    if first_pos == -1:
        warn('Could not find product grid in collections/all.html — skipping.')
        return False

    new_card = make_collection_card(slug, title, short_title,
                                     sale_price, orig_price, img_filename, 1)

    html = html[:first_pos] + new_card + '\n\n' + html[first_pos:]

    with open(COLLECTIONS, 'w', encoding='utf-8') as f:
        f.write(html)
    return True


INDEX_HTML = ROOT / 'index.html'
FEATURED_SLIDE_ANCHOR = 'id="Slide-template--25452181061879__featured-collection-1"'


def update_homepage(slug, short_title, title, sale_price, orig_price, img_filenames):
    """Insert a new slide at the front of the featured-collection slider on index.html."""
    if not INDEX_HTML.exists():
        warn('index.html not found — skipping homepage update.')
        return False

    with open(INDEX_HTML, encoding='utf-8') as f:
        html = f.read()

    if FEATURED_SLIDE_ANCHOR not in html:
        warn('Featured collection slider not found in index.html — skipping.')
        return False

    img1 = img_filenames[0]
    img2 = img_filenames[1] if len(img_filenames) > 1 else img_filenames[0]

    has_sale = (sale_price != orig_price)
    if has_sale:
        price_html = f'''<div class="price  price--on-sale">
              <div class="price__container">
                <div class="price__regular">
                  <span class="visually-hidden visually-hidden--inline">Regular price</span>
                  <span class="price-item price-item--regular">Rs. {sale_price} INR</span>
                </div>
                <div class="price__sale">
                  <span class="visually-hidden visually-hidden--inline">Regular price</span>
                  <span><s class="price-item price-item--regular">Rs. {orig_price} INR</s></span>
                  <span class="visually-hidden visually-hidden--inline">Sale price</span>
                  <span class="price-item price-item--sale price-item--last">Rs. {sale_price} INR</span>
                </div>
              </div>
            </div>'''
    else:
        price_html = f'''<div class="price">
              <div class="price__container">
                <div class="price__regular">
                  <span class="visually-hidden visually-hidden--inline">Regular price</span>
                  <span class="price-item price-item--regular">Rs. {sale_price} INR</span>
                </div>
              </div>
            </div>'''

    new_slide = f'''          <li
            id="Slide-template--25452181061879__featured-collection-0"
            class="grid__item scroll-trigger animate--slide-in"
              data-cascade
              style="--animation-order: 0;"
          >
<div class="card-wrapper product-card-wrapper underline-links-hover">
    <div
      class="card card--card card--media color-scheme-1 gradient"
      style="--ratio-percent: 100%;"
    >
      <div class="card__inner  ratio" style="--ratio-percent: 100%;">
        <div class="card__media">
          <div class="media media--transparent media--hover-effect">
            <img
              srcset="cdn/shop/files/{img1}"
              src="cdn/shop/files/{img1}"
              sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
              alt="{short_title}"
              class="motion-reduce"
              loading="lazy"
              width="1254"
              height="1254"
            >
            <img
              srcset="cdn/shop/files/{img2}"
              src="cdn/shop/files/{img2}"
              sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
              alt=""
              class="motion-reduce"
              loading="lazy"
              width="1254"
              height="1254"
            >
          </div>
        </div>
        <div class="card__content">
          <div class="card__information">
            <h3 class="card__heading">
              <a href="products/{slug}.html" class="full-unstyled-link">{title}</a>
            </h3>
          </div>
        </div>
      </div>
      <div class="card__content">
        <div class="card__information">
          <h3 class="card__heading h5">
            <a href="products/{slug}.html" class="full-unstyled-link">{short_title}</a>
          </h3>
          <div class="card-information">
            <span class="visually-hidden">Vendor:</span>
            <div class="caption-with-letter-spacing light">AL-SAALIM PERFUMES</div>
            <span class="caption-large light"></span>
            {price_html}
          </div>
        </div>
      </div>
    </div>
  </div>
          </li>
'''

    # Insert before the <li that wraps slide-1
    insert_before = html.rfind('<li\n', 0, html.index(FEATURED_SLIDE_ANCHOR))
    html = html[:insert_before] + new_slide + html[insert_before:]

    with open(INDEX_HTML, 'w', encoding='utf-8') as f:
        f.write(html)
    return True


def update_search(slug, short_title, sale_price, img_filename):
    """Add the new product to the PRODUCTS array in search.html."""
    with open(SEARCH_HTML, encoding='utf-8') as f:
        html = f.read()

    img_path = f'cdn/shop/files/{img_filename}'
    # Escape for JS string
    safe_title = short_title.replace("'", "\\'")
    safe_price = f'Rs. {sale_price} INR'.replace("'", "\\'")
    safe_img   = img_path.replace("'", "\\'")
    new_entry  = f"      {{file:'products/{slug}.html',title:'{safe_title}',price:'{safe_price}',img:'{safe_img}'}},"

    # Insert before the closing ]; of the PRODUCTS array
    target = '    ];'
    if target not in html:
        warn('Could not find PRODUCTS array end in search.html — skipping.')
        return False

    html = html.replace(target, new_entry + '\n' + target, 1)

    with open(SEARCH_HTML, 'w', encoding='utf-8') as f:
        f.write(html)
    return True


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    os.system('')  # enable ANSI on Windows

    print()
    print(c(BOLD, '  ╔══════════════════════════════════════════════╗'))
    print(c(BOLD, '  ║   AL-SAALIM PERFUMES — Add New Product        ║'))
    print(c(BOLD, '  ╚══════════════════════════════════════════════╝'))
    print()

    # Sanity checks
    if not TEMPLATE_FILE.exists():
        err(f'Template file not found: {TEMPLATE_FILE}\nMake sure you run this script from the site root.')
    if not COLLECTIONS.exists():
        err(f'Collections file not found: {COLLECTIONS}')
    if not SEARCH_HTML.exists():
        err(f'Search file not found: {SEARCH_HTML}')

    TOTAL_STEPS = 6

    # ── Step 1: Product name ───────────────────────────────────────────────
    step(1, TOTAL_STEPS, 'Product Name')
    hr()
    print(c(DIM, '  This is the full product title shown in the browser & on the product page.'))
    print(c(DIM, '  Example: Shanaya Attar (Roll On 6ml) | Al-Saalim Perfumers | Alcohol Free'))
    full_title = ask('Full title (with pipes if needed)')
    # Short title = everything before the first pipe (or full if no pipe)
    short_title = full_title.split('|')[0].strip()

    # Generate slug
    slug = slugify(short_title)
    info(f'Generated URL slug: products/{slug}.html')

    # Check if product already exists
    product_file = PRODUCTS_DIR / f'{slug}.html'
    if product_file.exists():
        print(c(YELLOW, f'  ⚠  File already exists: {product_file}'))
        overwrite = ask('Overwrite? (yes/no)', default='no', required=False)
        if overwrite.lower() not in ('yes', 'y'):
            err('Aborted — product already exists.')

    # ── Step 2: Pricing ────────────────────────────────────────────────────
    step(2, TOTAL_STEPS, 'Pricing')
    hr()
    print(c(DIM, '  Enter amounts in INR without the ₹ symbol. E.g. 179.00'))
    sale_price = ask('Sale / current price (INR)')
    orig_price = ask('Original / compare-at price (INR, leave blank to skip)', required=False)
    if not orig_price:
        orig_price = sale_price  # no strikethrough

    # Validate: must look like numbers
    for label, val in [('Sale price', sale_price), ('Original price', orig_price)]:
        try:
            float(val)
        except ValueError:
            err(f'{label} "{val}" is not a valid number.')

    ok(f'Sale: Rs. {sale_price} INR  |  Original: Rs. {orig_price} INR')

    # ── Step 3: Description ────────────────────────────────────────────────
    step(3, TOTAL_STEPS, 'Product Description')
    hr()
    print(c(DIM, '  Each line will become a <p> paragraph on the product page.'))
    desc_lines = ask_multiline('Description')
    if not desc_lines:
        err('Description cannot be empty.')
    desc_html = build_desc_html(desc_lines)
    ok(f'{len(desc_lines)} paragraph(s) added')

    # ── Step 4: Images ────────────────────────────────────────────────────
    step(4, TOTAL_STEPS, 'Images')
    hr()
    image_paths = ask_images()

    # Copy images to cdn
    print()
    cdn_filenames = []
    for img_path in image_paths:
        cdn_name = copy_image_to_cdn(img_path)
        cdn_filenames.append(cdn_name)
        ok(f'Copied → cdn/shop/files/{cdn_name}')

    main_img = cdn_filenames[0]

    # ── Step 5: Build product page ────────────────────────────────────────
    step(5, TOTAL_STEPS, 'Creating Product Page')
    hr()

    product_html = make_product_html(
        slug        = slug,
        title       = full_title,
        short_title = short_title,
        sale_price  = sale_price,
        orig_price  = orig_price,
        desc_html   = desc_html,
        img_filenames = cdn_filenames,
    )

    product_file.write_text(product_html, encoding='utf-8')
    ok(f'Created: products/{slug}.html')

    # ── Step 6: Update collections, search & homepage ────────────────────
    step(6, TOTAL_STEPS, 'Updating Collections, Search & Homepage')
    hr()

    if update_collections(slug, full_title, short_title, sale_price, orig_price, main_img):
        ok('Added product card at TOP of collections/all.html')
    if update_search(slug, short_title, sale_price, main_img):
        ok('Added to search index in search.html')
    if update_homepage(slug, short_title, full_title, sale_price, orig_price, cdn_filenames):
        ok('Added as first slide on index.html homepage')

    # ── Done ──────────────────────────────────────────────────────────────
    print()
    print(c(BOLD + GREEN, '  ╔══════════════════════════════════════════════╗'))
    print(c(BOLD + GREEN, '  ║   ✓  Product added successfully!              ║'))
    print(c(BOLD + GREEN, '  ╚══════════════════════════════════════════════╝'))
    print()
    print(c(CYAN, f'  Product page :  products/{slug}.html'))
    print(c(CYAN, f'  Collections  :  collections/all.html  (first position)'))
    print(c(CYAN, f'  Search       :  search.html           (updated)'))
    print(c(CYAN, f'  Homepage     :  index.html            (first slide)'))
    print()
    print(c(DIM, '  Tip: git add . && git commit -m "Add product: ' + short_title + '"'))
    print()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(c(YELLOW, '\n\n  Cancelled by user.'))
        sys.exit(0)

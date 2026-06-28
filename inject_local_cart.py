import os

base_dir = os.path.dirname(os.path.abspath(__file__))
script_tag_product = '<script src="../local-cart.js" defer></script>'
script_tag_root = '<script src="local-cart.js" defer></script>'

count = 0

# Inject into product pages
products_dir = os.path.join(base_dir, 'products')
for filename in os.listdir(products_dir):
    if not filename.endswith('.html'):
        continue
    filepath = os.path.join(products_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'local-cart.js' in content:
        print(f'  Skipped (already): {filename}')
        continue
    if '</head>' in content:
        content = content.replace('</head>', script_tag_product + '\n</head>', 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f'  Injected: products/{filename}')

# Inject into cart.html, index.html, and collections/all.html
for rel_path in ['cart.html', 'index.html', 'collections/all.html']:
    filepath = os.path.join(base_dir, rel_path)
    if not os.path.exists(filepath):
        print(f'  Not found: {rel_path}')
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'local-cart.js' in content:
        print(f'  Skipped (already): {rel_path}')
        continue
    # Determine correct relative path
    depth = rel_path.count('/')
    prefix = '../' * depth if depth > 0 else ''
    tag = f'<script src="{prefix}local-cart.js" defer></script>'
    if '</head>' in content:
        content = content.replace('</head>', tag + '\n</head>', 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f'  Injected: {rel_path}')

print(f'\nDone. Injected into {count} pages.')

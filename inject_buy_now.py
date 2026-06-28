import os
import re

base_dir = os.path.dirname(os.path.abspath(__file__))
products_dir = os.path.join(base_dir, 'products')
script_tag = '<script src="../buy-now-modal.js" defer></script>'

count = 0
for filename in os.listdir(products_dir):
    if not filename.endswith('.html'):
        continue
    filepath = os.path.join(products_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'buy-now-modal.js' in content:
        print(f'  Skipped (already injected): {filename}')
        continue

    # Insert before closing </head>
    if '</head>' in content:
        content = content.replace('</head>', script_tag + '\n</head>', 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f'  Injected: {filename}')
    else:
        print(f'  WARNING: no </head> found in {filename}')

print(f'\nDone. Injected into {count} product pages.')

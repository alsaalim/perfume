import os
import re

base_dir = '/Volumes/WorkLife/work/alsaalim/alsaalimperfume.shop'

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Calculate the relative path from the file to the base directory
        rel_dir = os.path.relpath(base_dir, os.path.dirname(filepath))
        root_prefix = '.' if rel_dir == '.' else rel_dir

        # Mapping absolute CDN/domain URLs to local relative paths
        # Longest keys first to avoid partial replacements!
        replacements = {
            'https:\\/\\/alsaalimperfume.shop\\/cdn\\/': f'{root_prefix}\\/cdn\\/',
            'https:\\/\\/alsaalimperfume.shop\\/': f'{root_prefix}\\/',
            'https://alsaalimperfume.shop/cdn/': f'{root_prefix}/cdn/',
            'https://alsaalimperfume.shop/': f'{root_prefix}/',
            '//alsaalimperfume.shop/cdn/': f'{root_prefix}/cdn/',
            '//alsaalimperfume.shop/': f'{root_prefix}/',
            'https:./cdn/': f'{root_prefix}/cdn/',
            'https:./': f'{root_prefix}/',
            '"https://cdn.shopify.com/': f'"{root_prefix}/cdn/', # This fixes fonts/scripts from shopify domains
            '../cdn/': f'{root_prefix}/cdn/', # Some files have ../cdn/
            './cdn/': f'{root_prefix}/cdn/',
        }

        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)

        # Fix specific cases where "https:./" or similar issues remain
        new_content = re.sub(r'https:\./+', f'{root_prefix}/', new_content)
        new_content = re.sub(r'https:\.\./+', f'{root_prefix}/', new_content)
        new_content = re.sub(r'https://alsaalimperfume\.shop', f'{root_prefix}', new_content)

        # some paths could be broken like `https:../` so let's use replace instead of regex for safety

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Fixed paths in {os.path.relpath(filepath, base_dir)}')
    except Exception as e:
        print(f"Failed to process {filepath}: {e}")

# Walk through the project and apply the fix
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(('.html', '.css', '.js', '.json')):
            process_file(os.path.join(root, file))

print("Done! CSS and image paths have been successfully updated to use local files.")
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = "import { Storage } from './utils/storage';\n"
if "import { Storage }" not in content:
    # Insert after first import
    content = re.sub(r'^(import.*?)\n', r'\1\n' + import_stmt, content, count=1)

# Replace localStorage
content = content.replace('localStorage.getItem', 'Storage.getItem')
content = content.replace('localStorage.setItem', 'Storage.setItem')
content = content.replace('localStorage.removeItem', 'Storage.removeItem')
content = content.replace('localStorage.clear', 'Storage.clear')

with open('src/App.tsx', 'w') as f:
    f.write(content)


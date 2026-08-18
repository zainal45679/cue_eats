file_path = "resources/js/pages/dashboard/index.tsx"

with open(file_path, "r") as f:
    content = f.read()

import re

# Fix Low Stock Alerts flex alignment
content = re.sub(
    r'<h3 className="text-lg font-bold tracking-tight text-red-600">\s*<AlertTriangle className="h-4 w-4" /> Low Stock Alerts\s*</h3>',
    r'<h3 className="text-lg font-bold tracking-tight text-red-600 flex items-center gap-2">\n                <AlertTriangle className="h-5 w-5" /> Low Stock Alerts\n            </h3>',
    content
)

# Remove Card imports if no longer used anywhere
if "<Card " not in content and "<CardContent" not in content:
    content = re.sub(r"import \{ Card, CardContent, CardDescription, CardHeader, CardTitle \} from '@/components/shadcn/ui/card';\n", "", content)

with open(file_path, "w") as f:
    f.write(content)


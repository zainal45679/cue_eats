file_path = "resources/js/pages/dashboard/index.tsx"
import re

with open(file_path, "r") as f:
    content = f.read()

content = re.sub(
    r'<div className="space-y-4 bg-red-500/5 -mx-4 p-4 rounded-xl sm:mx-0 sm:bg-transparent sm:p-0 sm:rounded-none">',
    r'<div className="space-y-4 p-6 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">',
    content
)

with open(file_path, "w") as f:
    f.write(content)

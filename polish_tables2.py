file_path = "resources/js/pages/menu-pos/tables/index.tsx"
import re

with open(file_path, "r") as f:
    content = f.read()

# Make the total amount bolder and tabular-nums
content = re.sub(
    r'className="font-bold text-sm leading-none tracking-tight text-foreground"',
    r'className="font-black text-lg leading-none tracking-tighter tabular-nums"',
    content
)

# Fix the available text to be tighter
content = re.sub(
    r'<div className="flex items-center text-\[11px\] font-medium uppercase tracking-wider text-muted-foreground/60">\s*Available\s*</div>',
    r'<div className="flex items-center text-xs font-bold text-muted-foreground/40">\n                                                    Available\n                                                </div>',
    content
)

with open(file_path, "w") as f:
    f.write(content)


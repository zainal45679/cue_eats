import re

file_path = "resources/js/pages/dashboard/index.tsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. Polish the KPI cards - remove the arbitrary colored left borders
content = re.sub(
    r'<Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-md py-0">\s*<div className="absolute top-0 left-0 w-1.5 h-full bg-[a-z]+-500" />\s*<CardContent className="p-4 pl-6 flex items-center justify-between h-full">',
    r'<Card className="rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:bg-card/60">\n                        <CardContent className="p-5 flex items-center justify-between h-full">',
    content
)

# 2. Improve the typography in KPI cards
content = re.sub(
    r'<p className="text-\[11px\] font-bold text-muted-foreground uppercase tracking-wider mb-1">',
    r'<p className="text-[12px] font-semibold text-muted-foreground tracking-wide mb-1.5">',
    content
)
content = re.sub(
    r'<h3 className="text-3xl font-black leading-none">',
    r'<h3 className="text-3xl font-extrabold tracking-tight leading-none text-foreground">',
    content
)

# 3. Refine the Sales by Type progress bars to use primary color nicely
content = re.sub(
    r'<div className="h-full bg-blue-500 rounded-full"',
    r'<div className="h-full bg-primary/80 rounded-full"',
    content
)

# 4. Refine the Kitchen Load cards
content = re.sub(
    r'<div className="flex-1 flex flex-col items-center justify-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">\s*<span className="text-4xl font-black text-amber-600 mb-1">',
    r'<div className="flex-1 flex flex-col items-center justify-center p-5 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200/50 dark:border-amber-500/20">\n                                <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-500 mb-1">',
    content
)
content = re.sub(
    r'<span className="text-\[10px\] font-bold uppercase tracking-wider text-amber-700/80">Pending</span>',
    r'<span className="text-[11px] font-bold uppercase tracking-wider text-amber-700/70 dark:text-amber-500/80">Pending</span>',
    content
)

content = re.sub(
    r'<div className="flex-1 flex flex-col items-center justify-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">\s*<span className="text-4xl font-black text-blue-600 mb-1">',
    r'<div className="flex-1 flex flex-col items-center justify-center p-5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200/50 dark:border-blue-500/20">\n                                <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-500 mb-1">',
    content
)
content = re.sub(
    r'<span className="text-\[10px\] font-bold uppercase tracking-wider text-blue-700/80">Prep</span>',
    r'<span className="text-[11px] font-bold uppercase tracking-wider text-blue-700/70 dark:text-blue-500/80">Prep</span>',
    content
)

# 5. Low Stock alerts refinement
content = re.sub(
    r'<div className="shrink-0 font-black text-red-600 bg-red-100 dark:bg-red-950 px-2 py-1 rounded-md text-sm">',
    r'<div className="shrink-0 font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-md text-sm border border-red-100 dark:border-red-500/20">',
    content
)

with open(file_path, "w") as f:
    f.write(content)

print("Dashboard polished successfully.")

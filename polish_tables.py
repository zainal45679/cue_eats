file_path = "resources/js/pages/menu-pos/tables/index.tsx"
import re

with open(file_path, "r") as f:
    content = f.read()

# 1. Update the table colors to remove the thick left border and use native semantic washes
old_colors = r"""    const getTableColorClass = \(table: any\) => \{
        if \(!table\.active_order\) return 'bg-card border-border border-l-4 border-l-green-500 hover:border-l-green-600 text-card-foreground shadow-sm'; 
        if \(table\.active_order\.status === 'billed'\) return 'bg-card border-border border-l-4 border-l-red-500 hover:border-l-red-600 text-card-foreground shadow-sm'; 
        return 'bg-card border-border border-l-4 border-l-orange-500 hover:border-l-orange-600 text-card-foreground shadow-sm'; 
    \};"""

new_colors = r"""    const getTableColorClass = (table: any) => {
        if (!table.active_order) return 'bg-card border-border/60 hover:bg-muted/40 hover:border-border text-foreground shadow-sm'; 
        if (table.active_order.status === 'billed') return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 hover:bg-red-100 hover:border-red-300 text-red-950 dark:text-red-50 shadow-sm'; 
        return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 hover:border-amber-300 text-amber-950 dark:text-amber-50 shadow-sm'; 
    };"""

content = re.sub(old_colors, new_colors, content)

# 2. Update the "Available/Running/Billed" legend dots to match the new semantic style
content = re.sub(r'bg-green-500', r'bg-muted-foreground/40', content)
content = re.sub(r'bg-orange-500', r'bg-amber-500', content)
content = re.sub(r'bg-red-500', r'bg-red-500', content)

# 3. Update the inner layout of the table card
# Let's remove the generic icons inside the table card where unnecessary, or tighten the typography.
# We'll make the table name bolder and tracking-tighter
content = re.sub(r'className="text-base font-bold leading-none tracking-tight"', r'className="text-2xl font-black leading-none tracking-tighter"', content)

with open(file_path, "w") as f:
    f.write(content)

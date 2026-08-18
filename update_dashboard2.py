import re

file_path = "resources/js/pages/dashboard/index.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Replace the entire 4-card hero metric grid with a stark, brutalist/typographic data strip
old_section = r'<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">[\s\S]*?</div>\s*<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">'

new_section = r'''
                {/* Refined Typography Data Strip */}
                <div className="flex flex-col md:flex-row md:items-end gap-10 pb-6 border-b border-border/40 mb-6">
                    <div>
                        <div className="text-sm font-semibold text-muted-foreground tracking-tight mb-2">Today's Gross Revenue</div>
                        <div className="text-6xl font-black tracking-tighter tabular-nums leading-none">${metrics.todaysRevenue.toFixed(2)}</div>
                    </div>
                    <div className="flex gap-8 md:ml-auto">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Orders</div>
                            <div className="text-2xl font-bold tracking-tight tabular-nums leading-none">{metrics.todaysOrders}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Avg Value</div>
                            <div className="text-2xl font-bold tracking-tight tabular-nums leading-none">${metrics.aov.toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Canceled</div>
                            <div className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 tabular-nums leading-none">{metrics.canceledOrders}</div>
                        </div>
                    </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">'''

content = re.sub(old_section, new_section, content)

# Remove the unused lucide icons that we dropped
content = re.sub(r'DollarSign, ShoppingBag, .*?XCircle, ', '', content)

# Clean up the chart borders. Make them borderless or very clean
content = re.sub(r'<Card className="col-span-4 rounded-xl border-sidebar-border/70 shadow-sm">', r'<Card className="col-span-4 rounded-xl border-none shadow-none bg-muted/20">', content)
content = re.sub(r'<Card className="col-span-3 rounded-xl border-sidebar-border/70 shadow-sm">', r'<Card className="col-span-3 rounded-xl border-none shadow-none bg-muted/20">', content)
content = re.sub(r'<Card className="rounded-xl border-sidebar-border/70 shadow-sm flex flex-col">', r'<Card className="rounded-xl border-none shadow-none bg-muted/20 flex flex-col">', content)
content = re.sub(r'<Card className="rounded-xl border-sidebar-border/70 shadow-sm">', r'<Card className="rounded-xl border-none shadow-none bg-muted/20">', content)
content = re.sub(r'<Card className="rounded-xl border-red-500/30 shadow-sm bg-red-500/5">', r'<Card className="rounded-xl border-none shadow-none bg-red-500/5">', content)

with open(file_path, "w") as f:
    f.write(content)

print("Dashboard rewritten to remove AI slop.")

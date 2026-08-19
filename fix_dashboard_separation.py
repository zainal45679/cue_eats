file_path = "resources/js/pages/dashboard/index.tsx"

with open(file_path, "r") as f:
    content = f.read()

import re

# We will wrap the inner contents in a beautiful container to provide separation

# 1. 7-Day Revenue Trend
content = re.sub(
    r'<div className="col-span-4 space-y-4">\s*<h3 className="text-lg font-bold tracking-tight">([^<]+)</h3>',
    r'<div className="col-span-4 space-y-4 p-6 rounded-3xl bg-card border border-border/50 shadow-sm">\n    <h3 className="text-lg font-bold tracking-tight">\1</h3>',
    content
)

# 2. Sales by Type
content = re.sub(
    r'<div className="col-span-3 space-y-4">\s*<h3 className="text-lg font-bold tracking-tight">([^<]+)</h3>',
    r'<div className="col-span-3 space-y-4 p-6 rounded-3xl bg-card border border-border/50 shadow-sm">\n    <h3 className="text-lg font-bold tracking-tight">\1</h3>',
    content
)

# 3. Kitchen Load & Leaderboard
content = re.sub(
    r'<div className="space-y-4">\s*<div className="flex items-center justify-between">\s*<div>\s*<h3 className="text-lg font-bold tracking-tight">Kitchen Load</h3>',
    r'<div className="space-y-4 p-6 rounded-3xl bg-card border border-border/50 shadow-sm flex flex-col h-full">\n    <div className="flex items-center justify-between">\n        <div>\n            <h3 className="text-lg font-bold tracking-tight">Kitchen Load</h3>',
    content
)

content = re.sub(
    r'<div className="space-y-4">\s*<div>\s*<h3 className="text-lg font-bold tracking-tight">Cashier Leaderboard</h3>',
    r'<div className="space-y-4 p-6 rounded-3xl bg-card border border-border/50 shadow-sm">\n    <div>\n        <h3 className="text-lg font-bold tracking-tight">Cashier Leaderboard</h3>',
    content
)

with open(file_path, "w") as f:
    f.write(content)


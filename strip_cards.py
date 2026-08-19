import re

file_path = "resources/js/pages/dashboard/index.tsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. 7-Day Revenue Trend
content = re.sub(
    r'<Card className="col-span-4[^>]*>[\s\S]*?<CardHeader[^>]*>[\s\S]*?<CardTitle[^>]*>(.*?)</CardTitle>[\s\S]*?</CardHeader>\s*<CardContent>([\s\S]*?)</CardContent>\s*</Card>',
    r'<div className="col-span-4 space-y-4">\n    <h3 className="text-lg font-bold tracking-tight">\1</h3>\n    \2\n</div>',
    content
)

# 2. Sales by Type
content = re.sub(
    r'<Card className="col-span-3[^>]*>[\s\S]*?<CardHeader[^>]*>[\s\S]*?<CardTitle[^>]*>(.*?)</CardTitle>[\s\S]*?</CardHeader>\s*<CardContent>([\s\S]*?)</CardContent>\s*</Card>',
    r'<div className="col-span-3 space-y-4">\n    <h3 className="text-lg font-bold tracking-tight">\1</h3>\n    \2\n</div>',
    content
)

# 3. Kitchen Load
content = re.sub(
    r'<Card className="rounded-xl border-none shadow-none bg-muted/20 flex flex-col">[\s\S]*?<CardHeader[^>]*>[\s\S]*?<div>[\s\S]*?<CardTitle[^>]*>(.*?)</CardTitle>[\s\S]*?<CardDescription[^>]*>(.*?)</CardDescription>[\s\S]*?</div>([\s\S]*?)</CardHeader>\s*<CardContent[^>]*>([\s\S]*?)</CardContent>\s*</Card>',
    r'<div className="space-y-4">\n    <div className="flex items-center justify-between">\n        <div>\n            <h3 className="text-lg font-bold tracking-tight">\1</h3>\n            <p className="text-sm text-muted-foreground">\2</p>\n        </div>\n        \3\n    </div>\n    \4\n</div>',
    content
)

# 4. Cashier Leaderboard
content = re.sub(
    r'<Card className="rounded-xl border-none shadow-none bg-muted/20">[\s\S]*?<CardHeader[^>]*>[\s\S]*?<CardTitle[^>]*>(.*?)</CardTitle>[\s\S]*?<CardDescription[^>]*>(.*?)</CardDescription>[\s\S]*?</CardHeader>\s*<CardContent>([\s\S]*?)</CardContent>\s*</Card>',
    r'<div className="space-y-4">\n    <div>\n        <h3 className="text-lg font-bold tracking-tight">\1</h3>\n        <p className="text-sm text-muted-foreground">\2</p>\n    </div>\n    \3\n</div>',
    content
)

# 5. Low Stock Alerts
content = re.sub(
    r'<Card className="rounded-xl border-none shadow-none bg-red-500/5">[\s\S]*?<CardHeader[^>]*>[\s\S]*?<div>[\s\S]*?<CardTitle[^>]*>([\s\S]*?)</CardTitle>[\s\S]*?</div>([\s\S]*?)</CardHeader>\s*<CardContent>([\s\S]*?)</CardContent>\s*</Card>',
    r'<div className="space-y-4 bg-red-500/5 -mx-4 p-4 rounded-xl sm:mx-0 sm:bg-transparent sm:p-0 sm:rounded-none">\n    <div className="flex items-center justify-between">\n        <div>\n            <h3 className="text-lg font-bold tracking-tight text-red-600">\1</h3>\n        </div>\n        \2\n    </div>\n    \3\n</div>',
    content
)

with open(file_path, "w") as f:
    f.write(content)


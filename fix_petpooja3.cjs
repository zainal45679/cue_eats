const fs = require('fs');
const path = require('path');

const files = [
    'resources/js/pages/purchasing/grns/index.tsx',
    'resources/js/pages/purchasing/purchase-orders/index.tsx',
    'resources/js/pages/purchasing/internal-requests/index.tsx',
    'resources/js/pages/purchasing/stos/index.tsx',
    'resources/js/pages/inventory/live-stock/index.tsx',
];

const cardRegex = /<Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">\s*<div className="absolute top-0 left-0 w-1\.5 h-full" style=\{\{ backgroundColor: '([^']+)' \}\} \/>\s*<CardContent className="p-5 pl-7 flex flex-col justify-between h-full">\s*<div className="flex items-center justify-between mb-4">\s*<p className="text-sm font-bold text-slate-500 uppercase tracking-wider">([^<]+)<\/p>\s*<div className="p-2 bg-([a-z]+)-50 text-[a-z]+-600 rounded-md">\s*<([A-Za-z]+) className="size-5" \/>\s*<\/div>\s*<\/div>\s*<h3 className="text-3xl font-black text-slate-800">([^<]+)<\/h3>\s*<\/CardContent>\s*<\/Card>/g;

files.forEach(file => {
    const fullPath = path.join('/Users/zainalfaisal/Desktop/cue_eats', file);
    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(cardRegex, (match, colorHex, title, colorClass, icon, val) => {
        return `<Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '${colorHex}' }} />
                    <CardContent className="p-4 pl-6 flex items-center justify-between h-full">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">${title}</p>
                            <h3 className="text-2xl font-black text-slate-800">${val}</h3>
                        </div>
                        <div className="p-3 bg-${colorClass}-50 text-${colorClass}-600 rounded-md">
                            <${icon} className="size-5" />
                        </div>
                    </CardContent>
                </Card>`;
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
});

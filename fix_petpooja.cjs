const fs = require('fs');
const path = require('path');

const files = [
    'resources/js/pages/purchasing/grns/index.tsx',
    'resources/js/pages/purchasing/purchase-orders/index.tsx',
    'resources/js/pages/purchasing/internal-requests/index.tsx',
    'resources/js/pages/purchasing/stos/index.tsx',
    'resources/js/pages/inventory/live-stock/index.tsx',
];

const cardRegex = /<Card className="p-0 overflow-hidden bg-card border-border\/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">\s*<CardContent className="p-5 flex items-center justify-between">\s*<div className="space-y-1">\s*<p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">([^<]+)<\/p>\s*<h3 className="text-2xl font-bold tracking-tight">([^<]+)<\/h3>\s*<\/div>\s*<div className="p-3 bg-([a-z]+)-500\/10 rounded-xl text-[a-z]+-500 group-hover:scale-110 transition-transform duration-300">\s*<([A-Za-z]+) className="size-5" \/>\s*<\/div>\s*<\/CardContent>\s*<\/Card>/g;

files.forEach(file => {
    const fullPath = path.join('/Users/zainalfaisal/Desktop/cue_eats', file);
    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(cardRegex, (match, title, val, iconColor, icon) => {
        // POS style: solid blocky colors, bright, no border radius rounding really, high contrast
        
        let bgClass = `bg-${iconColor}-600`;
        if (iconColor === 'slate') bgClass = 'bg-slate-700';
        if (iconColor === 'amber') bgClass = 'bg-[#f47a20]'; // Petpooja orange
        if (iconColor === 'blue') bgClass = 'bg-[#2196f3]';
        if (iconColor === 'emerald') bgClass = 'bg-[#4caf50]';
        if (iconColor === 'red') bgClass = 'bg-[#f44336]';
        if (iconColor === 'purple') bgClass = 'bg-[#9c27b0]';

        return `<Card className="border-0 rounded-md shadow-md ${bgClass} text-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">${title}</p>
                            <h3 className="text-3xl font-bold mt-1">${val}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                            <${icon} className="size-6 text-white" />
                        </div>
                    </CardContent>
                </Card>`;
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
});

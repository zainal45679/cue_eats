const fs = require('fs');
const path = require('path');

const files = [
    'resources/js/pages/purchasing/grns/index.tsx',
    'resources/js/pages/purchasing/purchase-orders/index.tsx',
    'resources/js/pages/purchasing/internal-requests/index.tsx',
    'resources/js/pages/purchasing/stos/index.tsx',
    'resources/js/pages/inventory/live-stock/index.tsx',
];

const cardRegex = /<Card className="p-0 overflow-hidden bg-gradient-to-br from-([a-z]+)-50 to-[a-z]+-50 border-[a-z]+-200\/50 shadow-sm transition-all hover:shadow-md">\s*<CardContent className="p-[45] flex items-center justify-between">\s*<div>\s*<p className="text-xs font-medium text-[a-z]+-800 mb-1">([^<]+)<\/p>\s*<h3 className="text-2xl font-bold text-[a-z]+-900">([^<]+)<\/h3>\s*<\/div>\s*<div className="p-3 bg-[a-z]+-100\/50 rounded-full text-[a-z]+-600">\s*<([A-Za-z]+) className="size-5" \/>\s*<\/div>\s*<\/CardContent>\s*<\/Card>/g;

files.forEach(file => {
    const fullPath = path.join('/Users/zainalfaisal/Desktop/cue_eats', file);
    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(cardRegex, (match, color, title, val, icon) => {
        // Map the gradient color to a solid theme color for the icon
        let iconColor = color;
        if (color === 'slate') iconColor = 'slate';
        else if (color === 'emerald') iconColor = 'emerald';
        else if (color === 'yellow') iconColor = 'amber';
        else if (color === 'red') iconColor = 'red';
        else if (color === 'purple') iconColor = 'purple';
        else if (color === 'blue') iconColor = 'blue';

        return `<Card className="p-0 overflow-hidden bg-card border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">${title}</p>
                            <h3 className="text-2xl font-bold tracking-tight">${val}</h3>
                        </div>
                        <div className="p-3 bg-${iconColor}-500/10 rounded-xl text-${iconColor}-500 group-hover:scale-110 transition-transform duration-300">
                            <${icon} className="size-5" />
                        </div>
                    </CardContent>
                </Card>`;
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
});

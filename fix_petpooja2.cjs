const fs = require('fs');
const path = require('path');

const files = [
    'resources/js/pages/purchasing/grns/index.tsx',
    'resources/js/pages/purchasing/purchase-orders/index.tsx',
    'resources/js/pages/purchasing/internal-requests/index.tsx',
    'resources/js/pages/purchasing/stos/index.tsx',
    'resources/js/pages/inventory/live-stock/index.tsx',
];

const cardRegex = /<Card className="border-0 rounded-md shadow-md (bg-(?:\[#[a-f0-9]+\]|slate-700)) text-white">[\s\S]*?<p className="text-sm font-medium opacity-90">([^<]+)<\/p>[\s\S]*?<h3 className="text-3xl font-bold mt-1">([^<]+)<\/h3>[\s\S]*?<([A-Za-z]+) className="size-6 text-white" \/>[\s\S]*?<\/Card>/g;

files.forEach(file => {
    const fullPath = path.join('/Users/zainalfaisal/Desktop/cue_eats', file);
    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(cardRegex, (match, bgClass, title, val, icon) => {
        
        let colorHex = '#e2e8f0';
        let colorClass = 'slate';
        if (bgClass.includes('2196f3')) { colorHex = '#2196f3'; colorClass = 'blue'; }
        if (bgClass.includes('slate')) { colorHex = '#64748b'; colorClass = 'slate'; }
        if (bgClass.includes('9c27b0')) { colorHex = '#9c27b0'; colorClass = 'purple'; }
        if (bgClass.includes('4caf50')) { colorHex = '#4caf50'; colorClass = 'emerald'; }
        if (bgClass.includes('f47a20')) { colorHex = '#f47a20'; colorClass = 'amber'; }
        if (bgClass.includes('f44336')) { colorHex = '#f44336'; colorClass = 'red'; } // in case

        return `<Card className="rounded-lg shadow-sm border border-slate-200 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: '${colorHex}' }} />
                    <CardContent className="p-5 pl-7 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">${title}</p>
                            <div className="p-2 bg-${colorClass}-50 text-${colorClass}-600 rounded-md">
                                <${icon} className="size-5" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-800">${val}</h3>
                    </CardContent>
                </Card>`;
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
});

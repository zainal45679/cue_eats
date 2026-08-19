file_path = "resources/js/pages/menu-pos/tables/index.tsx"
import re

with open(file_path, "r") as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { cn } from '@/lib/utils';",
    "import { cn } from '@/lib/utils';\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/ui/select';"
)

# Replace the scrolling zone toggles with a Dropdown
old_zones = r"""                    \{\/\* Zone Toggles \(Matching POS categories\) \*\/\}\s*\{zones\.length > 0 && \(\s*<ScrollArea className="w-full whitespace-nowrap">\s*<div className="flex space-x-2 pb-1">\s*\{zones\.map\(zone => \(\s*<Button\s*key=\{zone\.id\}\s*variant=\{activeZone === zone\.id \? 'default' : 'secondary'\}\s*className="rounded-full px-5 h-8 text-xs"\s*onClick=\{.*?\}\s*>\s*\{zone\.name\}\s*</Button>\s*\)\)\}\s*</div>\s*<ScrollBar orientation="horizontal" className="hidden" />\s*</ScrollArea>\s*\)\}"""

new_zones = r"""                    {/* Zone Dropdown (Floors) */}
                    {zones.length > 0 && (
                        <div className="w-full">
                            <Select 
                                value={activeZone?.toString()} 
                                onValueChange={(val) => setActiveZone(parseInt(val))}
                            >
                                <SelectTrigger className="w-full max-w-[250px] h-9 rounded-md bg-muted/50 border-border/50 text-sm font-semibold">
                                    <SelectValue placeholder="Select Floor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {zones.map(zone => (
                                        <SelectItem key={zone.id} value={zone.id.toString()} className="text-sm font-medium">
                                            {zone.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}"""

content = re.sub(old_zones, new_zones, content)

with open(file_path, "w") as f:
    f.write(content)


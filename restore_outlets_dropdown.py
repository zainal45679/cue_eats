file_path = "resources/js/pages/menu-pos/tables/index.tsx"
import re

with open(file_path, "r") as f:
    content = f.read()

# 1. Restore state logic
old_state_logic = r"""export default function TablesScreen\(\{ zones \}: \{ zones: any\[\] \}\) \{
    const \{ auth \} = usePage\(\)\.props as any;
    const currentUserId = auth\.user\?\.id;
    
    const \[activeZone, setActiveZone\] = useState\(zones\.length > 0 \? zones\[0\]\.id : null\);
    const \[currentTime, setCurrentTime\] = useState\(new Date\(\)\);

    const \[mergeMode, setMergeMode\] = useState\(false\);
    const \[selectedTablesToMerge, setSelectedTablesToMerge\] = useState<string\[\]>\(\[\]\);

    useEffect\(\(\) => \{
        const timer = setInterval\(\(\) => setCurrentTime\(new Date\(\)\), 60000\);
        return \(\) => clearInterval\(timer\);
    \}, \[\]\);"""

new_state_logic = r"""export default function TablesScreen({ zones }: { zones: any[] }) {
    const { auth } = usePage().props as any;
    const currentUserId = auth.user?.id;
    
    const isAllOutlets = auth.active_location_id === null;
    const allLocations = auth.all_business_locations || [];
    const [selectedLocationId, setSelectedLocationId] = useState(
        isAllOutlets ? (allLocations[0]?.id || null) : auth.active_location_id
    );
    
    const visibleZones = zones.filter((z: any) => z.business_location_id === selectedLocationId);
    
    const [activeZone, setActiveZone] = useState(visibleZones.length > 0 ? visibleZones[0].id : null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [mergeMode, setMergeMode] = useState(false);
    const [selectedTablesToMerge, setSelectedTablesToMerge] = useState<string[]>([]);

    useEffect(() => {
        if (visibleZones.length > 0 && !visibleZones.find((z: any) => z.id === activeZone)) {
            setActiveZone(visibleZones[0].id);
        }
    }, [selectedLocationId, visibleZones]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);"""

content = re.sub(old_state_logic, new_state_logic, content)

# 2. Fix activeZoneData and totalTables counting
content = content.replace(
    "const activeZoneData = zones.find((z: any) => z.id === activeZone);",
    "const activeZoneData = visibleZones.find((z: any) => z.id === activeZone);"
)

content = content.replace(
    "zones.forEach(zone => {",
    "visibleZones.forEach(zone => {"
)

# 3. Replace the Dropdown I added with the actual Layout: zone buttons + location dropdown
old_zones_render = r"""                    \{\/\* Zone Dropdown \(Floors\) \*\/\}\s*\{zones\.length > 0 && \(\s*<div className="w-full">\s*<Select\s*value=\{activeZone\?\.toString\(\)\}\s*onValueChange=\{\(val\) => setActiveZone\(parseInt\(val\)\)\}\s*>\s*<SelectTrigger className="w-full max-w-\[250px\] h-9 rounded-md bg-muted/50 border-border/50 text-sm font-semibold">\s*<SelectValue placeholder="Select Floor" />\s*</SelectTrigger>\s*<SelectContent>\s*\{zones\.map\(zone => \(\s*<SelectItem key=\{zone\.id\} value=\{zone\.id\.toString\(\)\} className="text-sm font-medium">\s*\{zone\.name\}\s*</SelectItem>\s*\)\)\}\s*</SelectContent>\s*</Select>\s*</div>\s*\)\}"""

new_zones_render = r"""                    {/* Zone Toggles & Location Dropdown */}
                    <div className="flex items-center justify-between w-full mb-1">
                        {visibleZones.length > 0 ? (
                            <ScrollArea className="flex-1 whitespace-nowrap mr-4">
                                <div className="flex space-x-2 pb-1">
                                    {visibleZones.map((zone: any) => (
                                        <Button 
                                            key={zone.id}
                                            variant={activeZone === zone.id ? 'default' : 'secondary'}
                                            className="rounded-full px-5 h-8 text-xs shrink-0"
                                            onClick={() => setActiveZone(zone.id)}
                                        >
                                            {zone.name}
                                        </Button>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" className="hidden" />
                            </ScrollArea>
                        ) : (
                            <div className="flex-1"></div>
                        )}

                        {isAllOutlets && allLocations.length > 1 && (
                            <div className="shrink-0">
                                <Select 
                                    value={selectedLocationId ? selectedLocationId.toString() : ''} 
                                    onValueChange={(val) => setSelectedLocationId(parseInt(val))}
                                >
                                    <SelectTrigger className="w-[180px] h-8 rounded-full text-xs bg-muted/50 border-border/50 focus:ring-0">
                                        <SelectValue placeholder="Select Location" />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        {allLocations.map((loc: any) => (
                                            <SelectItem key={loc.id} value={loc.id.toString()} className="text-sm">
                                                {loc.location_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>"""

content = re.sub(old_zones_render, new_zones_render, content)

# 4. Fix empty state to use visibleZones instead of zones
content = content.replace(
    "{zones.length === 0 ? (",
    "{visibleZones.length === 0 ? ("
)

with open(file_path, "w") as f:
    f.write(content)


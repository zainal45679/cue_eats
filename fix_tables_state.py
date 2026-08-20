file_path = "resources/js/pages/menu-pos/tables/index.tsx"
import re

with open(file_path, "r") as f:
    content = f.read()

old_state = r"""    const \[activeZone, setActiveZone\] = useState\(zones\.length > 0 \? zones\[0\]\.id : null\);
    const \[currentTime, setCurrentTime\] = useState\(new Date\(\)\);
    const \[mergeMode, setMergeMode\] = useState\(false\);
    const \[selectedTablesToMerge, setSelectedTablesToMerge\] = useState<string\[\]>\(\[\]\);

    useEffect\(\(\) => \{
        const timer = setInterval\(\(\) => setCurrentTime\(new Date\(\)\), 60000\);
        return \(\) => clearInterval\(timer\);
    \}, \[\]\);"""

new_state = r"""    const isAllOutlets = auth.active_location_id === null;
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

content = re.sub(old_state, new_state, content)

# Fix the activeZoneData and loop bugs
content = content.replace("const activeZoneData = zones.find(z => z.id === activeZone);", "const activeZoneData = visibleZones.find((z: any) => z.id === activeZone);")

content = content.replace(
    """    let totalTables = 0;
    let available = 0;
    let occupied = 0;
    let billed = 0;

    zones.forEach(zone => {""",
    """    let totalTables = 0;
    let available = 0;
    let occupied = 0;
    let billed = 0;

    visibleZones.forEach((zone: any) => {"""
)

with open(file_path, "w") as f:
    f.write(content)


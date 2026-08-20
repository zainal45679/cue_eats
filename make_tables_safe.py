file_path = "resources/js/pages/menu-pos/tables/index.tsx"
import re

with open(file_path, "r") as f:
    content = f.read()

# Make zones safe
content = content.replace(
    "export default function TablesScreen({ zones }: { zones: any[] }) {",
    "export default function TablesScreen({ zones = [] }: { zones?: any[] }) {"
)

# Make auth safe
content = content.replace(
    "const currentUserId = auth.user?.id;",
    "const currentUserId = auth?.user?.id;"
)
content = content.replace(
    "const isAllOutlets = auth.active_location_id === null;",
    "const isAllOutlets = auth?.active_location_id === null;"
)
content = content.replace(
    "const allLocations = auth.all_business_locations || [];",
    "const allLocations = auth?.all_business_locations || [];"
)
content = content.replace(
    "auth.active_location_id",
    "auth?.active_location_id"
)

with open(file_path, "w") as f:
    f.write(content)


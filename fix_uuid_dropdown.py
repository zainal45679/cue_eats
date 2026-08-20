file_path = "resources/js/pages/menu-pos/tables/index.tsx"
import re

with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    "onValueChange={(val) => setSelectedLocationId(parseInt(val))}",
    "onValueChange={(val) => setSelectedLocationId(val)}"
)

with open(file_path, "w") as f:
    f.write(content)


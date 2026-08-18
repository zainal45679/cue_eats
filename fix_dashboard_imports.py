file_path = "resources/js/pages/dashboard/index.tsx"

with open(file_path, "r") as f:
    content = f.read()

import re
content = re.sub(
    r"import \{ Users, Activity, PackageOpen \} from 'lucide-react';",
    "import { AlertTriangle, ArrowRight, Users, Activity, PackageOpen } from 'lucide-react';",
    content
)

with open(file_path, "w") as f:
    f.write(content)


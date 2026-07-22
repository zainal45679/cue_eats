const fs = require('fs');
const path = require('path');

const dir = 'app/Http/Controllers/Dashboard';
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.php')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("'master-data/")) {
      content = content.replace(/'master-data\//g, "'supply-chain/");
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Replaced in ${file}`);
    }
  }
}

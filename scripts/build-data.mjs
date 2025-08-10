import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function readCollection(dir) {
  const folder = path.join(root, dir);
  if (!fs.existsSync(folder)) return [];
  return fs
    .readdirSync(folder)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(folder, f), 'utf8')));
}

// Fonte do Decap removida; manteremos os arquivos existentes em src/data/ intocados.
const categories = [];
const sites = [];

if (categories.length) {
  fs.mkdirSync(path.join(root, 'src/data'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'src/data/categories.json'),
    JSON.stringify(categories, null, 2)
  );
}

if (sites.length) {
  fs.mkdirSync(path.join(root, 'src/data'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'src/data/sites.json'),
    JSON.stringify(sites, null, 2)
  );
}

if (categories.length || sites.length) {
  console.log('Dados atualizados a partir de fonte externa.');
} else {
  console.log('Sem alterações de dados.');
}




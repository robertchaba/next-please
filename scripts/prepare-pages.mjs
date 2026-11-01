import { cp, readdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const build = path.join(root, 'dist');
const outputs = ['index.html', 'favicon.svg', 'assets', '.nojekyll'];

// Like do-nauki, stage in dist/ before updating only the branch-root output.
for (const name of outputs) {
  const entry = await stat(path.join(build, name));
  if (name === 'assets' ? !entry.isDirectory() : !entry.isFile()) {
    throw new Error(`Invalid build output: ${name}`);
  }
}
const unexpected = (await readdir(build)).filter(name => !outputs.includes(name) && name !== '.DS_Store');
if (unexpected.length) throw new Error(`Unregistered build output: ${unexpected.join(', ')}`);

// Remove obsolete hashed bundles as well as assets removed from public/.
await rm(path.join(root, 'assets'), { recursive: true, force: true });
for (const name of outputs) {
  await cp(path.join(build, name), path.join(root, name), {
    recursive: true,
    // Original generated images remain in public/; avoid publishing them twice.
    filter: source => path.basename(source) !== '.DS_Store' && !path.basename(source).includes('-source'),
  });
}
console.log('Prepared GitHub Pages: master / (root). Commit the generated files with the source changes.');

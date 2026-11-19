// Build a deterministic submission folder from the static offline app and its screenshots.
// Run with Node 22: MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repositoryRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDirectory, { recursive: true });
for (const name of ['app', 'screenshots']) {
  const source = join(repositoryRoot, name);
  const target = join(outputDirectory, name);
  if (existsSync(source)) cpSync(source, target, { recursive: true });
}

const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};
writeFileSync(join(outputDirectory, 'dossier.json'), buildDossier(outputDirectory, dossierOptions));

// Keep the run reproducible: the dossier builder records only app and screenshot content,
// while this entry point adds no timestamps, random IDs, or environment-specific metadata.

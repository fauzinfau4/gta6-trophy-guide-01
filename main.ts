import { cpSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const caps = { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 };

function validate(): void {
  const parsed = JSON.parse(readFileSync(join(root, 'app/data/trophies.json'), 'utf8'));
  if (!Array.isArray(parsed.trophies) || parsed.trophies.length !== 55) throw new Error('Expected exactly 55 trophies');
  const images = readdirSync(join(root, 'screenshots')).filter((name) => /\.(png|jpe?g)$/i.test(name)).sort();
  if (images.length < 3 || images.length > 4) throw new Error('Expected three or four screenshots');
  for (const name of images) {
    const stat = lstatSync(join(root, 'screenshots', name));
    if (!stat.isFile() || stat.size > 262144) throw new Error(`Invalid screenshot ${name}`);
  }
}

function build(target: string): void {
  mkdirSync(target, { recursive: true });
  cpSync(join(root, 'app'), join(target, 'app'), { recursive: true });
  cpSync(join(root, 'screenshots'), join(target, 'screenshots'), { recursive: true });
  writeFileSync(join(target, 'dossier.json'), buildDossier(target, caps));
}

validate();
const a = mkdtempSync(join(tmpdir(), 'ledger-a-'));
const b = mkdtempSync(join(tmpdir(), 'ledger-b-'));
build(a);
build(b);
if (!readFileSync(join(a, 'dossier.json')).equals(readFileSync(join(b, 'dossier.json')))) throw new Error('Dossier is not deterministic');
build(output);

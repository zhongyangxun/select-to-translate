import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { resolve } from 'path';
import { REPO_ROOT } from './constans.js';

const CSV_DIR = resolve(REPO_ROOT, 'data/roots');
const OUTPUT_FILE = resolve(REPO_ROOT, 'data/roots.json');

const entries = {};
const index = {};
const files = readdirSync(CSV_DIR).filter((f) => f.endsWith('.csv'));

function pickPrimaryKey(variants, entries) {
  for (const v of variants) {
    if (!entries[v]) return v;
  }
  const base = variants[0];
  for (let i = 2; ; i++) {
    const key = `${base}${i}`;
    if (!entries[key]) return key;
  }
}

for (const file of files) {
  const csv = readFileSync(`${CSV_DIR}/${file}`, 'utf-8');
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  for (const row of records) {
    const rawRoot = row['Root'];
    if (!rawRoot) continue;

    const variants = rawRoot
      .replace(/\s*\([^)]*\)\s*/g, '')
      .split(/,\s*/)
      .map((r) =>
        r
          .replace(/^-+|-+$/g, '')
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);

    const meaning = (row['Meaning in English'] || '').trim();
    const origin = (row['Origin language'] || '').trim();
    const examples = (row['English examples'] || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!meaning || variants.length === 0) continue;

    const primaryKey = pickPrimaryKey(variants, entries);
    entries[primaryKey] = { variants, meaning, origin, examples };

    for (const v of variants) {
      if (!index[v]) index[v] = [];
      if (!index[v].includes(primaryKey)) {
        index[v].push(primaryKey);
      }
    }
  }
}

const output = { entries, index };
writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
const entryCount = Object.keys(entries).length;
const indexCount = Object.keys(index).length;
console.log(
  `✅ 合并完成，${entryCount} 条词根，${indexCount} 个变体索引 → ${OUTPUT_FILE}`,
);

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { parse } from 'csv-parse/sync';

const CSV_DIR = './data/roots';
const OUTPUT_FILE = './data/roots.json';

const roots = {};

const files = readdirSync(CSV_DIR).filter((f) => f.endsWith('.csv'));

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

    // 拆分多个变体，如 "ab-, a-, abs-"
    const variants = rawRoot
      .replace(/\s*\([^)]*\)\s*/g, '') // 去括号注释，如 (ΑΕΡ)
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

    if (!meaning) continue;

    const entry = { meaning, origin, examples };

    for (const variant of variants) {
      // 若已存在，合并 examples 去重
      if (roots[variant]) {
        const existing = roots[variant];
        existing.examples = [...new Set([...existing.examples, ...examples])];
      } else {
        roots[variant] = { ...entry, examples: [...examples] };
      }
    }
  }
}

writeFileSync(OUTPUT_FILE, JSON.stringify(roots, null, 2), 'utf-8');
console.log(
  `✅ 合并完成，共 ${Object.keys(roots).length} 条词根 → ${OUTPUT_FILE}`,
);

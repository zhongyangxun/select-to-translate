import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const REPO_ROOT = resolve(__dirname, '..');

export const WORDS_FILE = resolve(REPO_ROOT, 'data/high_freq_words.json');

export const PRIORITY_TEST_WORDS_FILE = resolve(
  REPO_ROOT,
  'data/priority_test_words.json',
);

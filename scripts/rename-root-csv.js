// 将词根 CSV 文件的名称转化为易读的形式
import { renameSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { REPO_ROOT } from './constans.js';

const DATA_DIR = resolve(REPO_ROOT, 'data/roots');

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.csv'));

files.forEach((file) => {
  renameSync(`${DATA_DIR}/${file}`, `${DATA_DIR}/${decodeURIComponent(file)}`);
});

console.log('重命名完成。');

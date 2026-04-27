// 找出拥有最多词素单词中最长的一个，用来测试翻译面板的词根展示

import fs from 'fs';
import { resolve } from 'path';
import { REPO_ROOT } from './constans.js';

const WORD_ROOTS_FILE = resolve(REPO_ROOT, 'data/word_roots.json');

const wordRoots = JSON.parse(fs.readFileSync(WORD_ROOTS_FILE, 'utf8')).words;

let res = null;

Object.entries(wordRoots).reduce((maxCount, [word, roots]) => {
  const count = roots.roots.length;

  if (count >= maxCount) {
    if (!res || word.length > res?.word?.length) {
      res = {
        word,
        roots,
      };
    }

    return count;
  }

  return maxCount;
}, 0);

const { word, roots } = res;

console.log(
  `拥有最多词素（${roots.roots.length}个）单词中最长的是：${word}，词素为：\n
  ${roots.roots.map(({ root }) => root).join(', ')}`,
);

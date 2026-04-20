// 筛出重点测试数据
// 筛选标准：释义中不包含词性（即不包含 '.' 或方括号）

import fs from 'fs';
import { WORDS_FILE, PRIORITY_TEST_WORDS_FILE } from './constans.js';

const words = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf8'));

const priorityTestWords = {};

const wordsCount = Object.keys(words).length - 1; // 需要减去 "_meta" 这个键

process.stdout.write('开始处理数据');

Object.entries(words).forEach(([word, definition], index) => {
  if (word === '_meta') return;

  const { translation } = definition;
  const lines = translation.split('\n');

  const isPriorityTestWord = lines.some((line) => {
    return !line.includes('.') && (!line.includes('[') || !line.includes(']'));
  });

  if (isPriorityTestWord) {
    priorityTestWords[word] = definition;
  }

  const currCount = index + 1;

  process.stdout.write(
    `\r处理进度: ${currCount}/${wordsCount} (${Math.round((currCount / wordsCount) * 100)}%)`,
  );
});

process.stdout.write('\n');

fs.writeFileSync(
  PRIORITY_TEST_WORDS_FILE,
  JSON.stringify(priorityTestWords, null, 2),
);

console.log('处理完毕');

const priorityTestWordsCount = Object.keys(priorityTestWords).length;
console.log(
  `处理了${wordsCount} 条数据，找出了 ${priorityTestWordsCount} 条重点测试数据`,
);
console.log(`重点测试数据保存在${PRIORITY_TEST_WORDS_FILE}`);

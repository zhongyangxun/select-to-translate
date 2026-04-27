import fs from 'fs';
import { EXCHANGES } from '../src/lib/exchanges.js';
import { WORDS_FILE, REPO_ROOT } from './constans.js';
import { resolve } from 'path';

/** exchange 片段里的 type，与 EXCHANGES 的键一致；含此项表示词条是变体行，反向索引只从原型词条建立 */
const EXCHANGE_TYPE_LEMMA = '0';

const dict = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf8'));
const wordCount = Object.keys(dict).length - 1; // 减去 _meta 键

const buildReverseIndex = (dict, exchanges) => {
  console.log('开始构建反向索引...');

  if (!dict || !exchanges) return {};

  const reverseIndex = {};

  // 通过原型词来建立反向索引
  Object.entries(dict).forEach(([word, definition], index) => {
    const { exchange } = definition;
    if (!exchange) return;

    const exchangeList = exchange.split('/');

    // 非原型词（变体信息包含 EXCHANGE_TYPE_LEMMA），则跳过
    if (
      exchangeList.some((item) => {
        const [type] = item.split(':');
        return type === EXCHANGE_TYPE_LEMMA;
      })
    ) {
      return;
    }

    exchangeList.forEach((exchangeItem) => {
      const [type, variant] = exchangeItem.split(':');
      const typeName = exchanges[type]?.name || '';

      const existing = reverseIndex[variant] || {};
      const existingTypes = existing.types || [];
      const existingTypeNames = existing.typeNames || [];

      reverseIndex[variant] = {
        exchangeWord: word,
        types: [...existingTypes, type],
        typeNames: [...existingTypeNames, typeName],
      };
    });

    process.stdout.write(
      `\r构建进度： ${Math.round(((index + 1) / wordCount) * 100)}%`,
    );
  });

  return reverseIndex;
};

const reverseIndex = buildReverseIndex(dict, EXCHANGES);

console.log(
  `\n反向索引建立完成, 共 ${Object.keys(reverseIndex).length} 条数据`,
);

console.log('文件：data/reverse_index.json');

fs.writeFileSync(
  resolve(REPO_ROOT, 'data/reverse_index.json'),
  JSON.stringify(reverseIndex, null, 2),
);

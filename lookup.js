import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export const lookupWord = async (wordToFind) => {
  const db = await open({
    filename: './data/ECDICT.db',
    driver: sqlite3.Database,
  });

  try {
    const row = await db.get(
      'SELECT word, phonetic, definition, translation FROM stardict WHERE word = ?',
      [wordToFind.toLowerCase().trim()],
    );

    if (row) {
      console.log('-----------------------------------');
      console.log(`词条: ${row.word}`);
      console.log(`音标: [${row.phonetic || 'N/A'}]`);
      console.log(`解释: \n${row.definition}`);
      console.log(`翻译: \n${row.translation}`);
      console.log('-----------------------------------');
    } else {
      onsole.log(`❌ 未找到单词: "${wordToFind}"`);
    }

    return row;
  } catch (error) {
    console.log('查询出错：', error);
  } finally {
    await db.close();
  }
};

const input = process.argv[2];
if (input) {
  console.log(`开始查询 ${input} ...`);
  lookupWord(input);
} else {
  console.log('请输入要查询的单词');
}

let dict = null;
let wordRoots = null;
let reverseIndex = null;

const EXCHANGES = {
  s: { name: '复数形式', weight: 9 },
  p: { name: '过去式', weight: 8 },
  i: { name: '现在分词', weight: 7 },
  d: { name: '过去分词', weight: 6 },
  3: { name: '第三人称单数', weight: 5 },
  r: { name: '比较级', weight: 4 },
  t: { name: '最高级', weight: 3 },
  0: { name: '原型', weight: 2 },
  1: { name: '拼写变体', weight: 1 },
};

async function loadDict() {
  if (dict) return dict;

  const url = chrome.runtime.getURL('data/high_freq_words.json');
  const response = await fetch(url);
  dict = await response.json();
  console.log('高频词库已加载，词条数:', Object.keys(dict).length);
  return dict;
}

async function loadWordRoots() {
  if (wordRoots) return wordRoots;

  const url = chrome.runtime.getURL('data/word_roots.json');
  const response = await fetch(url);
  wordRoots = (await response.json()).words;
  console.log('词根库已加载，词条数:', Object.keys(wordRoots).length);
  return wordRoots;
}

async function loadReverseIndex() {
  if (reverseIndex) return reverseIndex;

  console.log('开始初始化反向索引');

  const dict = await loadDict();
  reverseIndex = {};

  Object.entries(dict).forEach(([word, definition]) => {
    const { exchange } = definition;
    if (!exchange) return;

    const exchangeList = exchange.split('/');
    exchangeList.forEach((exchangeItem) => {
      // TODO: 写个脚本检查是否多个单词对应同一个变体
      const [type, variant] = exchangeItem.split(':');
      const typeName = EXCHANGES?.[type]?.name || '';

      const existing = reverseIndex[variant] || {};
      const existingTypes = existing.types || [];
      const existingTypeNames = existing.typeNames || [];

      reverseIndex[variant] = {
        exchangeWord: word,
        types: [...existingTypes, type],
        typeNames: [...existingTypeNames, typeName],
      };
    });
  });

  console.log('反向索引初始化完成，词条数:', Object.keys(reverseIndex).length);

  return reverseIndex;
}

// 插件安装或更新时触发
chrome.runtime.onInstalled.addListener(() => {
  console.log('插件已安装/更新');
  // 加载词典、反向索引和词根库
  loadDict();
  loadReverseIndex();
  loadWordRoots();
});

// 监听标签页更新（例如刷新页面）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log(`标签页 ${tabId} 已刷新: ${tab.url}`);
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'translate') {
    const { text } = message;
    const dict = await loadDict();
    const wordRoots = await loadWordRoots();

    let lookupKey = text;
    let definition = dict[lookupKey];
    let variantInfo = null;

    if (!definition) {
      lookupKey = text.toLowerCase();
      definition = dict[lookupKey];
    }

    if (!definition) {
      const reverseIndex = await loadReverseIndex();
      variantInfo = reverseIndex[lookupKey];
      if (variantInfo) {
        definition = dict[variantInfo.exchangeWord];
      }
    }

    const root = wordRoots[lookupKey];

    if (definition) {
      sendResponse({
        lookupKey,
        definition,
        root,
        variantInfo,
      });
    } else {
      // TODO: 请求 API 查词
      sendResponse({
        definition: null,
        root: null,
      });
    }
  }
});

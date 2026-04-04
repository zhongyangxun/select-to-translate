# Data 文件夹说明

此文件夹用于存放词典数据和词根数据。

## 常用词数据

[high_freq_words.json](./high_freq_words.json)

数据来源：[Github: skywind3000/ECDICT](https://github.com/skywind3000/ECDICT)

### 数据说明

数据示例：

```json
{
  "hello": {
    "phonetic": "hә'lәu",
    "translation": "interj. 喂, 嘿",
    "collins": 3,
    "oxford": 1,
    "tag": "zk gk",
    "bnc": 2319,
    "frq": 2238,
    "exchange": "s:hellos"
  }
}
```

**字段说明**
| 字段 | 含义 | 示例 |
|------|------|------|
| `phonetic` | 音标 | hә'lәu |
| `translation` | 中文释义 | 喂, 你好 |
| `collins` | 柯林斯星级 (1-5) | 3 |
| `oxford` | 牛津核心词 (0/1) | 1 |
| `tag` | 考试标签 | zk gk cet4 cet6 |
| `bnc` | BNC词频排名 | 2319 |
| `frq` | 当代词频排名 | 2238 |
| `exchange` | 词形变化 | p:ran/d:run/i:running |

#### `exchange` 字段格式解读

```
s:hellos
│  │
│  └── hellos = hello 的复数形式
└──── s = 复数 (plural)
```

**hello** 虽然是感叹词，但也可以当名词用（比如 "say your hellos"），所以有复数形式。

**完整的代码表**

| 代码 | 英文                | 含义         | 示例          |
| ---- | ------------------- | ------------ | ------------- |
| `s`  | plural              | 复数         | cat → cats    |
| `p`  | past tense          | 过去式       | run → ran     |
| `d`  | past participle     | 过去分词     | run → run     |
| `i`  | present participle  | 现在分词     | run → running |
| `3`  | 3rd person singular | 第三人称单数 | run → runs    |
| `r`  | comparative         | 比较级       | big → bigger  |
| `t`  | superlative         | 最高级       | big → biggest |
| `0`  | lemma               | 原型词       | running → run |
| `1`  | lemma variant       | 原型变体     | -             |

## 词根数据

CSV 数据：[roots](./roots/)

JSON 数据：[root.json](./roots.json)

数据来源：[Wikipedia: List of Greek and Latin roots in English](https://en.wikipedia.org/wiki/List_of_Greek_and_Latin_roots_in_English)

数据处理方式：用 [Wikitable2CSV](https://wikitable2csv.ggor.de/) 将原数据表格导出为 CSV，再利用[脚本](../scripts/merge-roots.js)转成 JSON 数据。

Wikitable2CSV 页面会有多个 CSV 表格，可用下面的代码片段一次性触发所有表格的下载：

```javascript
document.querySelectorAll('a[download]').forEach((a) => {
  a.click();
});
```

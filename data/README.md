# Data 文件夹说明

此文件夹用于存放词典数据和词根数据。

## 常用词数据

[high_freq_words.json](./high_freq_words.json)

数据来源：[Github: skywind3000/ECDICT](https://github.com/skywind3000/ECDICT)

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

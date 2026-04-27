import copy from 'rollup-plugin-copy';

function htmlPlugin() {
  return {
    name: 'html-string',
    transform(code, id) {
      if (id.endsWith('.html')) {
        return `export default ${JSON.stringify(code)}`;
      }
    },
  };
}

export default [
  {
    input: 'src/content/index.js',
    output: {
      file: 'dist/content.js',
      format: 'iife',
    },
    plugins: [htmlPlugin()],
  },
  {
    input: 'src/background/index.js',
    output: {
      file: 'dist/background.js',
      format: 'es',
    },
    plugins: [
      copy({
        targets: [
          {
            src: 'manifest.json',
            dest: 'dist',
          },
          {
            src: 'popup.html',
            dest: 'dist',
          },
          // JSON 数据压缩复制（去掉缩进和空白）
          {
            src: 'data/*.json',
            dest: 'dist/data',
            transform: (contents) => JSON.stringify(JSON.parse(contents)),
          },
        ],
        hook: 'buildStart',
      }),
    ],
  },
];

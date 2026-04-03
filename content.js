console.log('content script loaded');

class Panel {
  static #instance = null;
  #host = null;
  #panel = null;
  #shadow = null;
  #wordEl = null;
  #definitionEl = null;

  constructor() {
    if (Panel.#instance) {
      return Panel.#instance;
    }

    const host = document.createElement('div');
    host.id = 'select-to-translate-host';
    const shadow = host.attachShadow({ mode: 'closed' });

    shadow.innerHTML = /* html */ `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        .panel {
          position: fixed;
          z-index: 2147483647;
          width: 280px;
          max-height: 300px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          color: #333;
          overflow: hidden;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #f7f7f8;
          border-bottom: 1px solid #eee;
        }
        .word {
          font-weight: 600;
          font-size: 16px;
          color: #1a1a1a;
        }
        .close-btn {
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 18px;
          color: #999;
          line-height: 1;
        }
        .close-btn:hover {
          color: #333;
        }
        .content {
          padding: 12px;
          overflow-y: auto;
          max-height: 240px;
        }
        .definition {
          line-height: 1.6;
          color: #444;
        }
        .loading {
          color: #999;
          font-style: italic;
        }
        .not-found {
          color: #999;
        }
      </style>
      <div class="panel">
        <div class="header">
          <span class="word"></span>
          <button class="close-btn">&times;</button>
        </div>
        <div class="content">
          <div class="definition"></div>
        </div>
      </div>
    `;

    this.#host = host;
    this.#shadow = shadow;
    this.#panel = shadow.querySelector('.panel');
    this.#wordEl = shadow.querySelector('.word');
    this.#definitionEl = shadow.querySelector('.definition');

    shadow
      .querySelector('.close-btn')
      .addEventListener('click', () => this.hide());

    this.hide();
    document.body.appendChild(host);

    Panel.#instance = this;
  }

  get host() {
    return this.#host;
  }

  setPosition(x, y) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = 280;
    const panelHeight = 200;

    if (x + panelWidth > viewportWidth) {
      x = viewportWidth - panelWidth - 10;
    }
    if (x < 10) x = 10;

    if (y < 10) y = 10;
    if (y + panelHeight > viewportHeight) {
      y = viewportHeight - panelHeight - 10;
    }

    this.#panel.style.left = `${x}px`;
    this.#panel.style.top = `${y}px`;
    return this;
  }

  setContent(word, definition) {
    this.#wordEl.textContent = word;
    if (definition) {
      this.#definitionEl.className = 'definition';
      this.#definitionEl.textContent = definition;
    } else {
      this.#definitionEl.className = 'definition not-found';
      this.#definitionEl.textContent = '未找到释义';
    }
    return this;
  }

  setLoading(word) {
    this.#wordEl.textContent = word;
    this.#definitionEl.className = 'definition loading';
    this.#definitionEl.textContent = '查询中...';
    return this;
  }

  hide() {
    this.#host.style.display = 'none';
    return this;
  }

  show() {
    this.#host.style.display = 'block';
    return this;
  }

  isShown() {
    return this.#host.style.display !== 'none';
  }

  contains(target) {
    return this.#host === target || this.#host.contains(target);
  }
}

const panel = new Panel();

const shouldTranslate = (text) => {
  const trimmedText = text.trim();
  if (trimmedText.length < 2 || trimmedText.length > 5000) return false;
  const singleWordRegex = /^[a-zA-Z]+(?:[''-][a-zA-Z]+)?$/;
  return singleWordRegex.test(trimmedText);
};

document.addEventListener('mouseup', async (e) => {
  if (panel.contains(e.target)) {
    return;
  }

  const selection = document.getSelection();
  const text = selection.toString().trim().toLowerCase();

  if (!shouldTranslate(text)) {
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  panel
    .setLoading(text)
    .setPosition(rect.left, rect.bottom + 8)
    .show();

  const response = await chrome.runtime.sendMessage({
    type: 'translate',
    text,
  });

  panel.setContent(text, response?.definition);
});

document.addEventListener('mousedown', (e) => {
  if (panel.isShown() && !panel.contains(e.target)) {
    panel.hide();
  }
});

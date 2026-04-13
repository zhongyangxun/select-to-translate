console.log('content script loaded');

class Panel {
  static #instance = null;
  #host = null;
  #panel = null;
  #shadow = null;
  #wordEl = null;
  #definitionEl = null;

  constructor(host, shadow) {
    this.#host = host;
    this.#shadow = shadow;
    this.#panel = shadow.querySelector('.panel');
    this.#wordEl = shadow.querySelector('.word');
    this.#definitionEl = shadow.querySelector('.definition');

    shadow
      .querySelector('.close-btn')
      .addEventListener('click', () => this.hide());

    this.hide();
  }

  static async create() {
    if (Panel.#instance) {
      return Panel.#instance;
    }

    const host = document.createElement('div');
    host.id = 'select-to-translate-host';
    const shadow = host.attachShadow({ mode: 'closed' });

    const url = chrome.runtime.getURL('content.html');
    const html = await fetch(url).then((r) => r.text());
    shadow.innerHTML = html;

    document.body.appendChild(host);

    Panel.#instance = new Panel(host, shadow);
    return Panel.#instance;
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

  setLoading() {
    this.#panel.classList.add('loading');
    this.#panel.classList.remove('not-found');
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

const panelReady = Panel.create();

const shouldTranslate = (text) => {
  const trimmedText = text.trim();
  if (trimmedText.length < 2 || trimmedText.length > 5000) return false;
  const singleWordRegex = /^[a-zA-Z]+(?:[''-][a-zA-Z]+)?$/;
  return singleWordRegex.test(trimmedText);
};

document.addEventListener('mouseup', async (e) => {
  const panel = await panelReady;
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
    .setLoading()
    .setPosition(rect.left, rect.bottom + 8)
    .show();

  const response = await chrome.runtime.sendMessage({
    type: 'translate',
    text,
  });

  panel.setContent(text, response?.definition);
});

document.addEventListener('mousedown', async (e) => {
  const panel = await panelReady;
  if (panel.isShown() && !panel.contains(e.target)) {
    panel.hide();
  }
});

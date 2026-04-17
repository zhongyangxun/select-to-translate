console.log('content script loaded');

class Panel {
  static #instance = null;
  #host = null;
  #panel = null;
  #shadow = null;
  #wordEl = null;
  #definitionSectionEl = null;
  #phoneticEl = null;
  #posLabelEl = null;
  #defTextEl = null;
  #rootSectionEl = null;
  #rootListEl = null;
  #compositionEl = null;

  constructor(host, shadow) {
    this.#host = host;
    this.#shadow = shadow;
    this.#panel = shadow.querySelector('.panel');
    this.#wordEl = shadow.querySelector('.word');
    this.#definitionSectionEl = shadow.querySelector('.definition-section');
    this.#phoneticEl = shadow.querySelector('.phonetic');
    this.#posLabelEl = shadow.querySelector('.pos-label');
    this.#defTextEl = shadow.querySelector('.def-text');
    this.#rootSectionEl = shadow.querySelector('.root-section');
    this.#rootListEl = shadow.querySelector('.root-list');
    this.#compositionEl = shadow.querySelector('.composition');

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

  processTranslation(translation) {
    const lines = translation.split('\n');

    return lines.map((line) => {
      const spaceIndex = line.indexOf(' ');
      const pos = line.slice(0, spaceIndex);
      const text = line.slice(spaceIndex + 1);

      return {
        pos,
        text,
      };
    });
  }

  generateDefSectionHTML(translations) {
    return translations
      .map(
        ({ pos, text }) => `
      <div class="def-row">
        <div class="pos-label">${pos}</div>
        <div class="def-text">${text}</div>
      </div>
    `,
      )
      .join('');
  }

  setRootList(roots) {
    const [prefix, word, suffix] = roots;

    if (prefix) {
      this.#rootListEl.querySelector('.root.prefix').textContent = prefix.root;
      this.#rootListEl.querySelector('.meaning-prefix').textContent =
        prefix.meaning;
    }

    if (word) {
      this.#rootListEl.querySelector('.root.root-word').textContent = word.root;
      this.#rootListEl.querySelector('.meaning-root-word').textContent =
        word.meaning;
    }

    if (suffix) {
      this.#rootListEl.querySelector('.root.suffix').textContent = suffix.root;
      this.#rootListEl.querySelector('.meaning-suffix').textContent =
        suffix.meaning;
    }

    return this;
  }

  setContent(word, definition, root) {
    this.#wordEl.textContent = word;
    if (definition) {
      const { phonetic, translation } = definition;
      const translations = this.processTranslation(translation);

      this.#definitionSectionEl.innerHTML =
        this.generateDefSectionHTML(translations);
      this.#phoneticEl.textContent = `/${phonetic}/`;

      if (root) {
        const { roots, composition } = root;
        this.setRootList(roots);

        this.#compositionEl.textContent = composition;
      } else {
        this.#panel.classList.add('no-root');
      }
    } else {
      this.#panel.classList.add('not-found');
    }
    return this;
  }

  setLoading() {
    this.#panel.classList.add('loading');
    return this;
  }

  stopLoading() {
    this.#panel.classList.remove('loading');
    return this;
  }

  resetPanel() {
    this.#panel.classList.remove('loading', 'not-found', 'no-root');
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
    .resetPanel()
    .setLoading()
    .setPosition(rect.left, rect.bottom + 8)
    .show();

  const response = await chrome.runtime.sendMessage({
    type: 'translate',
    text,
  });

  console.log('response', response);

  panel.stopLoading().setContent(text, response?.definition, response?.root);
});

document.addEventListener('mousedown', async (e) => {
  const panel = await panelReady;
  if (panel.isShown() && !panel.contains(e.target)) {
    panel.hide();
  }
});

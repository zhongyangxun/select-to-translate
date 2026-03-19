console.log('content script loaded');

class Panel {
  static #instance = null;
  el = null;

  constructor() {
    if (Panel.#instance) {
      return Panel.#instance;
    }

    const div = document.createElement('div');
    this.el = div;
    div.append('translate panel');
    div.style.position = 'fixed';
    div.style.zIndex = '999999';
    div.style.width = '200px';
    div.style.height = '100px';
    div.style.backgroundColor = 'lightblue';
    document.body.appendChild(div);

    Panel.#instance = this;
  }

  setPosition(x, y) {
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;

    return this;
  }

  hide() {
    this.el.style.display = 'none';
    return this;
  }

  show() {
    this.el.style.display = 'block';
    return this;
  }

  isShown() {
    return this.el.style.display !== 'none';
  }
}

const panel = new Panel();

const shouldTranslate = (text) => {
  const trimedText = text.trim();

  if (trimedText.length < 2 || trimedText.length > 5000) return false;

  const singleWordRegex = /^[a-zA-Z]+(?:['’-][a-zA-Z]+)?$/;

  return singleWordRegex.test(trimedText);
};

document.addEventListener('mouseup', (e) => {
  if (panel.el.contains(e.target)) {
    return;
  }

  const selection = document.getSelection();
  const text = selection.toString().trim();

  if (!shouldTranslate(text)) {
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  panel.show().setPosition(rect.left, rect.top - 100);
});

document.addEventListener('mousedown', (e) => {
  if (panel.isShown() && !panel.el.contains(e.target)) {
    panel.hide();
  }
});

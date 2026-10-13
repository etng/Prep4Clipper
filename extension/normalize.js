(() => {
  // 同一页面重复注入时复用状态，保留原节点用于恢复。
  const stateKey = '__prep4clipper_v1__';
  if (globalThis[stateKey]) return globalThis[stateKey].prepare();

  const selector = '.urvanov-syntax-highlighter-syntax, .crayon-syntax';
  const replacements = new Map();
  let languageChoice = '';
  let themeChoice = 'auto';
  const genericGrammar = {
    comment: /(^|\s)(?:#|\/\/).*/m,
    string: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
    keyword: /\bCtrl-[A-Z]\b/,
    number: /\b\d+(?:\.\d+)*\b/,
    operator: /[=|<>]/
  };

  function pageTheme(block) {
    for (let node = block.parentElement; node; node = node.parentElement) {
      const values = getComputedStyle(node).backgroundColor.match(/[\d.]+/g)?.map(Number);
      if (values?.length >= 3 && (values.length < 4 || values[3] > .5)) {
        return .2126 * values[0] + .7152 * values[1] + .0722 * values[2] < 128 ? 'dark' : 'light';
      }
    }
    return 'light';
  }

  function highlight(choice = languageChoice) {
    languageChoice = choice;
    for (const [wrapper] of replacements) {
      const code = wrapper.querySelector('code');
      const language = choice || code.dataset.originalLanguage || 'bash';
      code.className = language ? `language-${language}` : '';
      const prism = globalThis.Prism;
      if (prism?.highlight) {
        const grammar = prism.languages[language] || genericGrammar;
        code.innerHTML = prism.highlight(code.textContent, grammar, language || 'plain');
      }
    }
    return { total: replacements.size, languageChoice };
  }

  function setTheme(choice = 'auto') {
    themeChoice = ['auto', 'light', 'dark', 'tomorrow', 'solarized'].includes(choice) ? choice : 'auto';
    for (const [wrapper] of replacements) {
      wrapper.dataset.theme = themeChoice === 'auto' ? pageTheme(wrapper) : themeChoice;
    }
  }

  function ensureStyle() {
    if (document.getElementById('prep4clipper-style')) return;
    const style = document.createElement('style');
    style.id = 'prep4clipper-style';
    style.textContent = `
      [data-prep4clipper="block"] { margin: 1em 0; }
      [data-prep4clipper="block"] figcaption { margin: 0 0 6px; font: inherit; font-size: .9em; color: #666; }
      pre[data-prep4clipper="code"] { background: #f6f8fa; color: #24292f; border: 1px solid #e5e7eb; border-radius: 4px; }
      pre[data-prep4clipper="code"] code { background: transparent; color: inherit; padding: 0; border: 0; }
      pre[data-prep4clipper="code"] .token { background: transparent; font: inherit; text-shadow: none; }
      pre[data-prep4clipper="code"] .comment { color: #647569; }
      pre[data-prep4clipper="code"] :is(.string, .attr-value) { color: #0a634d; }
      pre[data-prep4clipper="code"] :is(.keyword, .boolean, .tag) { color: #a32c6e; }
      pre[data-prep4clipper="code"] :is(.number, .constant) { color: #875600; }
      pre[data-prep4clipper="code"] :is(.function, .property, .attr-name) { color: #235da8; }
      pre[data-prep4clipper="code"] .operator { color: #6d4ca0; }
      [data-prep4clipper="block"][data-theme="dark"] pre { background: #20242a; color: #e2e5e9; border-color: #373d46; }
      [data-prep4clipper="block"][data-theme="dark"] figcaption { color: #aab2bd; }
      [data-prep4clipper="block"][data-theme="dark"] .comment { color: #9aaa9c; }
      [data-prep4clipper="block"][data-theme="dark"] :is(.string, .attr-value) { color: #a5d6b0; }
      [data-prep4clipper="block"][data-theme="dark"] :is(.keyword, .boolean, .tag) { color: #eaa2ca; }
      [data-prep4clipper="block"][data-theme="dark"] :is(.number, .constant) { color: #eac184; }
      [data-prep4clipper="block"][data-theme="dark"] :is(.function, .property, .attr-name) { color: #9cc7f0; }
      [data-prep4clipper="block"][data-theme="dark"] .operator { color: #c6b2ef; }
      /* 配色参考 Prism 1.30.0 官方主题，限定到本扩展生成的块。 */
      [data-prep4clipper="block"][data-theme="tomorrow"] pre { background: #2d2d2d; color: #ccc; border-color: #404040; }
      [data-prep4clipper="block"][data-theme="tomorrow"] .token { color: #ccc; }
      [data-prep4clipper="block"][data-theme="tomorrow"] :is(.comment, .prolog, .doctype, .cdata) { color: #999; }
      [data-prep4clipper="block"][data-theme="tomorrow"] :is(.tag, .attr-name, .namespace, .deleted) { color: #e2777a; }
      [data-prep4clipper="block"][data-theme="tomorrow"] :is(.boolean, .number, .function) { color: #f08d49; }
      [data-prep4clipper="block"][data-theme="tomorrow"] :is(.property, .class-name, .constant, .symbol) { color: #f8c555; }
      [data-prep4clipper="block"][data-theme="tomorrow"] :is(.selector, .important, .atrule, .keyword, .builtin) { color: #cc99cd; }
      [data-prep4clipper="block"][data-theme="tomorrow"] :is(.string, .char, .attr-value, .regex, .variable) { color: #7ec699; }
      [data-prep4clipper="block"][data-theme="tomorrow"] :is(.operator, .entity, .url) { color: #67cdcc; }
      [data-prep4clipper="block"][data-theme="solarized"] pre { background: #fdf6e3; color: #657b83; border-color: #eee8d5; }
      [data-prep4clipper="block"][data-theme="solarized"] .token { color: #657b83; }
      [data-prep4clipper="block"][data-theme="solarized"] :is(.comment, .prolog, .doctype, .cdata) { color: #93a1a1; }
      [data-prep4clipper="block"][data-theme="solarized"] .punctuation { color: #586e75; }
      [data-prep4clipper="block"][data-theme="solarized"] :is(.property, .tag, .boolean, .number, .constant, .symbol, .deleted) { color: #268bd2; }
      [data-prep4clipper="block"][data-theme="solarized"] :is(.selector, .attr-name, .string, .char, .builtin, .url, .inserted) { color: #2aa198; }
      [data-prep4clipper="block"][data-theme="solarized"] :is(.atrule, .attr-value, .keyword) { color: #859900; }
      [data-prep4clipper="block"][data-theme="solarized"] :is(.function, .class-name) { color: #b58900; }
      [data-prep4clipper="block"][data-theme="solarized"] :is(.regex, .important, .variable) { color: #cb4b16; }
    `;
    document.head.append(style);
  }

  function ownedNodes(block, query) {
    return [...block.querySelectorAll(query)].filter(node => node.closest(selector) === block);
  }

  function readCode(block) {
    const plain = ownedNodes(block,
      'textarea.urvanov-syntax-highlighter-plain, textarea.crayon-plain')[0];
    // textarea 是插件保留的原始代码。不能 trim，否则会丢失首尾空行、缩进。
    if (plain && plain.value !== '') return plain.value.replace(/\r\n?/g, '\n');

    const lines = ownedNodes(block, '.crayon-line, .urvanov-syntax-highlighter-line');
    if (!lines.length) return null;
    return lines.map(line => {
      const copy = line.cloneNode(true);
      copy.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
      const text = copy.textContent;
      // 高亮器用不换行空格实现缩进，用单个 NBSP 占位空行。
      return text === '\u00a0' ? '' : text.replace(/\u00a0/g, ' ');
    }).join('\n');
  }

  function readLanguage(block) {
    const nodes = [block, ...ownedNodes(block,
      '[data-language], [data-lang], [class*="language-"], [class*="lang-"]')];
    for (const node of nodes) {
      const candidate = node.getAttribute('data-language') || node.getAttribute('data-lang') ||
        node.className.match(/(?:^|\s)(?:language|lang)-([\w+-]+)/)?.[1];
      if (candidate && /^[\w+-]+$/.test(candidate)) return candidate.toLowerCase();
    }
    // 没有明确标记时保留为空，由高亮阶段按用户偏好回退到 Bash。
    return '';
  }

  function prepare() {
    for (const pre of replacements.keys()) {
      if (!pre.isConnected) replacements.delete(pre);
    }
    let converted = 0;
    let skipped = 0;
    for (const block of document.querySelectorAll(selector)) {
      if (!block.isConnected) continue;
      const text = readCode(block);
      if (text === null) { skipped++; continue; }
      const pre = document.createElement('pre');
      pre.setAttribute('data-prep4clipper', 'code');
      const code = document.createElement('code');
      const language = readLanguage(block);
      if (language) code.className = `language-${language}`;
      code.dataset.originalLanguage = language;
      // textContent 保证代码里的 HTML / script 只作为文本保留。
      code.textContent = text;
      pre.style.cssText = 'white-space: pre; overflow-x: auto; padding: 12px; margin: 0; font: 13px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace; tab-size: 4;';
      code.style.cssText = 'white-space: inherit; font: inherit;';
      pre.append(code);
      const wrapper = document.createElement('figure');
      wrapper.setAttribute('data-prep4clipper', 'block');
      wrapper.dataset.theme = pageTheme(block);
      const title = ownedNodes(block, '.crayon-title')[0]?.textContent;
      if (title?.trim()) {
        const caption = document.createElement('figcaption');
        caption.textContent = title;
        wrapper.append(caption);
      }
      wrapper.append(pre);
      block.replaceWith(wrapper);
      replacements.set(wrapper, block);
      converted++;
    }
    if (replacements.size) { ensureStyle(); highlight(); setTheme(themeChoice); }
    return { converted, total: replacements.size, skipped, languageChoice };
  }

  function restore() {
    let restored = 0;
    for (const [pre, original] of replacements) {
      if (pre.isConnected) { pre.replaceWith(original); restored++; }
    }
    replacements.clear();
    document.getElementById('prep4clipper-style')?.remove();
    return { restored };
  }

  globalThis[stateKey] = { prepare, restore, highlight, setTheme };
  return prepare();
})();

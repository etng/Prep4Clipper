(() => {
  const state = globalThis.__prep4clipper_v1__;
  if (!state || globalThis.__prep4clipperAuto__) return;
  globalThis.__prep4clipperAuto__ = true;
  const selector = '.urvanov-syntax-highlighter-syntax, .crayon-syntax';
  const titleSelector = 'h1, .entry-title, title, meta[property="og:title"], meta[name="twitter:title"], link[rel~="canonical"], script[type="application/ld+json"]';
  let scheduled = false;

  // 忽略自身高亮产生的 span，只有目标代码块的变化才触发检查。
  const observer = new MutationObserver(records => {
    const relevant = records.some(record => {
      const target = record.target.nodeType === Node.ELEMENT_NODE
        ? record.target : record.target.parentElement;
      if (target?.closest('[data-prep4clipper="block"]')) return false;
      return target?.closest(`${selector}, ${titleSelector}`) || [...record.addedNodes].some(node =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches(`${selector}, ${titleSelector}`) || node.querySelector(`${selector}, ${titleSelector}`)));
    });
    if (!relevant || scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      state.prepare();
      globalThis.__prep4clipperTitle__?.();
    });
  });
  observer.observe(document.documentElement, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['class', 'data-language', 'data-lang', 'href', 'rel', 'content']
  });
  state.prepare();

  chrome.storage.local.get({ theme: 'auto' }).then(settings => {
    state.setTheme(settings.theme);
  }).catch(error => console.warn('Prep4Clipper 配色读取失败：', error));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.theme) state.setTheme(changes.theme.newValue);
  });
})();

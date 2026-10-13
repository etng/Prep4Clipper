(() => {
  const headingSelector = 'h1 a[rel~="bookmark"], .entry-title a[rel~="bookmark"]';
  function urlKey(value) {
    try {
      const url = new URL(value, document.baseURI);
      return `${url.origin}${url.pathname.replace(/\/+$/, '')}${url.search}`;
    } catch { return null; }
  }

  function normalizeTitle() {
    const urls = new Set([urlKey(location.href)]);
    const canonical = document.querySelector('link[rel~="canonical"]')?.href;
    if (canonical) urls.add(urlKey(canonical));
    const titles = new Set([...document.querySelectorAll(headingSelector)]
      .filter(link => link.hasAttribute('href') && urls.has(urlKey(link.href)))
      .map(link => link.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean));
    // 列表页或存在冲突时不猜标题，也不使用日期等非标题 bookmark 链接。
    if (titles.size !== 1) return;
    const title = [...titles][0];
    if (document.title !== title) document.title = title;
    for (const meta of document.querySelectorAll(
      'meta[property="og:title"], meta[name="og:title"], meta[name="twitter:title"], meta[property="twitter:title"]')) {
      if (meta.content !== title) meta.content = title;
    }

    // 只更新当前文章/页面的标题，保留站点、作者等结构化数据。
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const data = JSON.parse(script.textContent);
        let changed = false;
        function visit(node) {
          if (!node || typeof node !== 'object') return;
          const types = [node['@type']].flat();
          const page = types.some(type => typeof type === 'string' && /(?:Article|Posting|WebPage)$/.test(type));
          const addresses = [node.url, node['@id']].filter(value => typeof value === 'string');
          if (page && addresses.some(address => urls.has(urlKey(address)))) {
            for (const key of ['name', 'headline']) {
              if (typeof node[key] === 'string' && node[key] !== title) {
                node[key] = title;
                changed = true;
              }
            }
          }
          for (const value of Object.values(node)) visit(value);
        }
        visit(data);
        if (changed) script.textContent = JSON.stringify(data);
      } catch { /* 无效的 JSON-LD 保留原样。 */ }
    }
  }
  globalThis.__prep4clipperTitle__ = normalizeTitle;
  normalizeTitle();
})();

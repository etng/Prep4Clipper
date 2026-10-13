(async () => {
  const output = document.getElementById('results');
  const fixtures = document.getElementById('fixtures');
  const messages = [];
  function check(condition, message) {
    if (!condition) throw new Error(message);
    messages.push(`通过：${message}`);
  }
  try {
    fixtures.innerHTML = '<table id="ordinary"><tr><td>普通表格</td></tr></table>';
    const original = document.createElement('div');
    original.className = 'urvanov-syntax-highlighter-syntax';
    original.dataset.language = 'python';
    const title = document.createElement('span');
    title.className = 'crayon-title';
    title.textContent = '代码标题';
    original.append(title);
    const plain = document.createElement('textarea');
    plain.className = 'urvanov-syntax-highlighter-plain';
    const text = '\n\tprint("<&>")  # 中文注释\n\n  末行  \n';
    plain.value = text;
    original.append(plain);
    let clicked = 0;
    original.addEventListener('click', () => clicked++);
    fixtures.append(original);
    const fallback = document.createElement('div');
    fallback.className = 'crayon-syntax';
    fallback.innerHTML = '<table><tr><td class="crayon-num">1</td><td><div class="crayon-line">&nbsp;&nbsp;x &lt; y</div><div class="crayon-line">&nbsp;</div><div class="crayon-line">a<br>b</div></td></tr></table>';
    fixtures.append(fallback);
    const unknown = document.createElement('div');
    unknown.className = 'crayon-syntax';
    fixtures.append(unknown);

    const script = document.createElement('script');
    script.src = '../extension/normalize.js';
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error('无法加载 normalize.js'));
      document.head.append(script);
    });
    const state = globalThis.__prep4clipper_v1__;
    const blocks = fixtures.querySelectorAll('pre > code');
    check(blocks.length === 2, '只转换可读取的目标代码块');
    check(blocks[0].textContent === text, '原始空行、制表符、首尾空格及特殊字符完整保留');
    check(blocks[0].className === 'language-python', '保留显式语言标记');
    check(blocks[1].className === 'language-bash', '没有语言标记时默认使用 Bash');
    check(!!blocks[0].querySelector('.token'), '本地 Prism 生成语法高亮');
    check(fixtures.querySelector('figcaption').textContent === '代码标题', '保留代码块标题');
    state.highlight('bash');
    check(blocks[0].className === 'language-bash' && blocks[0].textContent === text, '手动切换高亮不改变代码内容');
    state.highlight('');
    check(blocks[1].textContent === '  x < y\n\na\nb', '备用提取保留缩进、空行和 br 换行，排除行号');
    check(!!document.getElementById('ordinary'), '普通表格保持原样');
    const repeat = state.prepare();
    check(repeat.converted === 0 && repeat.total === 2 && repeat.skipped === 1, '重复整理不复制，未知结构安全跳过');
    check(state.restore().restored === 2 && original.isConnected && fallback.isConnected, '恢复原始节点');
    original.click();
    check(clicked === 1 && plain.value === text, '恢复保留原节点事件和文本');
    check(state.prepare().converted === 2, '恢复后能够再次整理');
    const late = original.cloneNode(true);
    fixtures.append(late);
    check(state.prepare().converted === 1, '重新检查支持后续新增代码块');
    state.restore();
    const heading = document.createElement('h1');
    const bookmark = document.createElement('a');
    bookmark.href = location.href;
    bookmark.rel = 'bookmark';
    bookmark.textContent = '文章标题';
    heading.append(bookmark);
    fixtures.append(heading);
    document.title = '文章标题 | 站点尾巴';
    const og = document.createElement('meta');
    og.setAttribute('property', 'og:title');
    og.content = document.title;
    const twitter = document.createElement('meta');
    twitter.name = 'twitter:title';
    twitter.content = document.title;
    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({ '@graph': [
      { '@type': 'Article', '@id': `${location.href}#article`, name: document.title, headline: document.title },
      { '@type': 'Organization', name: '站点名称' }
    ] });
    document.head.append(og, twitter, schema);
    const titleScript = document.createElement('script');
    titleScript.src = '../extension/title.js';
    await new Promise((resolve, reject) => {
      titleScript.onload = resolve;
      titleScript.onerror = () => reject(new Error('无法加载 title.js'));
      document.head.append(titleScript);
    });
    check(document.title === '文章标题', '使用当前文章标题的 bookmark 文本');
    check(og.content === '文章标题' && twitter.content === '文章标题', '同步整理社交标题元数据');
    const graph = JSON.parse(schema.textContent)['@graph'];
    check(graph[0].name === '文章标题' && graph[0].headline === '文章标题' && graph[1].name === '站点名称', '只更新当前文章结构化标题，保留站点名称');
    let storageListener;
    globalThis.chrome = {
      storage: {
        local: { get: async () => ({ theme: 'tomorrow' }) },
        onChanged: { addListener: listener => { storageListener = listener; } }
      }
    };
    const auto = document.createElement('script');
    auto.src = '../extension/auto.js';
    await new Promise((resolve, reject) => {
      auto.onload = resolve;
      auto.onerror = () => reject(new Error('无法加载 auto.js'));
      document.head.append(auto);
    });
    const flush = () => new Promise(resolve => setTimeout(resolve, 30));
    await flush();
    check(!original.isConnected && fixtures.querySelector('[data-theme="tomorrow"]'), '自动启动整理并读取已保存配色');
    const dynamic = document.createElement('div');
    dynamic.className = 'crayon-syntax';
    dynamic.innerHTML = '<textarea class="crayon-plain">echo 123 # 注释</textarea>';
    fixtures.append(dynamic);
    await flush();
    check(!dynamic.isConnected && [...fixtures.querySelectorAll('code')].some(c => c.textContent === 'echo 123 # 注释'), '后续动态加载的代码块自动整理');
    storageListener({ theme: { newValue: 'solarized' } }, 'local');
    check([...fixtures.querySelectorAll('[data-prep4clipper="block"]')].every(b => b.dataset.theme === 'solarized'), '更改保存配色后立即更新全部代码块');
    const preservedCode = fixtures.querySelector('[data-prep4clipper="code"] code');
    const firstToken = preservedCode.querySelector('.token');
    await flush();
    check(firstToken === preservedCode.querySelector('.token'), '高亮操作不会触发观察器重复整理');
    bookmark.textContent = '更新后的文章标题';
    await flush();
    check(document.title === '更新后的文章标题', '动态更新文章标题时自动同步');
    const unrelated = document.createElement('h1');
    unrelated.innerHTML = '<a href="https://example.com/other" rel="bookmark">另一篇文章</a>';
    fixtures.append(unrelated);
    const date = document.createElement('a');
    date.rel = 'bookmark';
    date.href = location.href;
    date.textContent = '日期';
    fixtures.append(date);
    await flush();
    check(document.title === '更新后的文章标题', '忽略其他文章及日期 bookmark 链接');
    output.textContent = `${messages.join('\n')}\n全部 ${messages.length} 项检查通过。`;
    document.documentElement.dataset.testResult = 'passed';
  } catch (error) {
    output.textContent = `${messages.join('\n')}\n失败：${error.message}`;
    document.documentElement.dataset.testResult = 'failed';
  }
})();

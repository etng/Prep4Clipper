const theme = document.getElementById('theme');
const status = document.getElementById('status');

async function initialize() {
  try {
    const settings = await chrome.storage.local.get({ theme: 'auto' });
    theme.value = settings.theme;
    if (!theme.value) theme.value = 'auto';
    theme.disabled = false;
  } catch (error) {
    status.textContent = '读取配色失败，请重新加载扩展后重试。';
    console.error('Prep4Clipper:', error);
  }
}

theme.addEventListener('change', async () => {
  theme.disabled = true;
  try {
    await chrome.storage.local.set({ theme: theme.value });
    status.textContent = '配色已保存，已打开的页面也会更新。';
  } catch (error) {
    status.textContent = '保存失败，请重新选择配色。';
    console.error('Prep4Clipper:', error);
  } finally {
    theme.disabled = false;
  }
});
initialize();

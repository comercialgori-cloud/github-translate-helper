const DEFAULT_API_URL = 'https://translate.argosopentech.com/translate';

function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['gitHubTranslatorApiUrl'], (result) => {
      resolve(result.gitHubTranslatorApiUrl || DEFAULT_API_URL);
    });
  });
}

function isTranslatableNode(node) {
  if (!node || !node.textContent) return false;

  const parent = node.parentElement;
  if (!parent) return false;

  if (parent.closest('script, style, noscript, svg, code, pre, textarea, input')) {
    return false;
  }

  const text = node.textContent.trim();
  return text.length >= 3 && !/^\s*$/.test(text);
}

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return isTranslatableNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }

  return nodes;
}

async function translateText(text, apiUrl) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: text,
      source: 'en',
      target: 'pt',
      format: 'text'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na tradução: ${response.status} - ${errorText}`);
  }

  const payload = await response.json();

  if (Array.isArray(payload)) {
    return payload.map((item) => item.translatedText || '').join(' ');
  }

  if (payload.translatedText) {
    return payload.translatedText;
  }

  if (payload.data && payload.data.translations) {
    return payload.data.translations.map((item) => item.translatedText || '').join(' ');
  }

  return text;
}

async function translatePage() {
  const apiUrl = await getApiUrl();
  const nodes = collectTextNodes(document.body);

  for (const node of nodes) {
    const originalText = node.textContent.trim();
    if (!originalText || originalText.length < 3) continue;

    if (node.dataset.originalText) {
      continue;
    }

    node.dataset.originalText = originalText;

    try {
      const translatedText = await translateText(originalText, apiUrl);
      node.textContent = translatedText;
      node.dataset.translated = 'true';
    } catch (error) {
      node.textContent = originalText;
      node.dataset.originalText = '';
      throw error;
    }
  }
}

function resetPage() {
  const nodes = collectTextNodes(document.body);

  for (const node of nodes) {
    if (node.dataset.originalText) {
      node.textContent = node.dataset.originalText;
      delete node.dataset.originalText;
      delete node.dataset.translated;
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'translate-page') {
    translatePage()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.action === 'reset-page') {
    resetPage();
    sendResponse({ ok: true });
    return true;
  }

  return false;
});

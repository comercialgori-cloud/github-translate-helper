const DEFAULT_API_URL = 'https://translate.argosopentech.com/translate';

const apiInput = document.getElementById('api-url');
const translateBtn = document.getElementById('translate-btn');
const resetBtn = document.getElementById('reset-btn');
const statusEl = document.getElementById('status');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function saveApiUrl() {
  const url = apiInput.value.trim() || DEFAULT_API_URL;
  chrome.storage.local.set({ gitHubTranslatorApiUrl: url }, () => {
    setStatus('Endpoint salvo.');
  });
}

function loadApiUrl() {
  chrome.storage.local.get(['gitHubTranslatorApiUrl'], (result) => {
    apiInput.value = result.gitHubTranslatorApiUrl || DEFAULT_API_URL;
  });
}

translateBtn.addEventListener('click', () => {
  saveApiUrl();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      setStatus('Nenhuma aba ativa encontrada.', true);
      return;
    }

    setStatus('Traduzindo página...');

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'translate-page' },
      (response) => {
        if (chrome.runtime.lastError) {
          setStatus(chrome.runtime.lastError.message, true);
          return;
        }

        if (response && response.ok) {
          setStatus('Página traduzida com sucesso!');
        } else {
          setStatus(response?.error || 'Não foi possível traduzir a página.', true);
        }
      }
    );
  });
});

resetBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      setStatus('Nenhuma aba ativa encontrada.', true);
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'reset-page' }, (response) => {
      if (chrome.runtime.lastError) {
        setStatus(chrome.runtime.lastError.message, true);
        return;
      }

      setStatus(response?.ok ? 'Texto restaurado.' : 'Não foi possível restaurar o texto.');
    });
  });
});

apiInput.addEventListener('change', saveApiUrl);
loadApiUrl();

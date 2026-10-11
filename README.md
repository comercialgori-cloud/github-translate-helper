# GitHub Translator

Uma extensão simples para navegador que traduz textos em inglês do GitHub para português sem sair da página.

## Como funciona

- A extensão é ativada a partir do ícone do navegador.
- Você entra em uma página do GitHub.
- Clica em "Traduzir página".
- Os textos em inglês são traduzidos para português usando um endpoint de tradução.
- Você pode restaurar o texto original com o botão "Restaurar texto".

## Requisitos

- Google Chrome ou Microsoft Edge
- GitHub acessado em `https://github.com/*`
- Um serviço de tradução compatível com o protocolo HTTP POST

## Instalação

1. Abra o Chrome/Edge.
2. Vá em `chrome://extensions`.
3. Ative o "Modo do desenvolvedor".
4. Clique em "Carregar sem compactação".
5. Selecione a pasta deste repositório.

## Endpoint padrão

O projeto usa por padrão:

`https://translate.argosopentech.com/translate`

Se esse serviço não estiver disponível, você pode alterar o endpoint diretamente no popup da extensão.

## Estrutura do projeto

- `manifest.json` — configuração da extensão
- `popup.html` — interface do popup
- `popup.js` — lógica da janela da extensão
- `content.js` — tradução na página do GitHub
- `styles.css` — estilo do popup

## Observações

- Esta é uma base funcional inicial.
- A tradução funciona melhor em README, comentários, issues, PRs e textos de interfaces simples.
- Elementos muito complexos, código, imagens e links podem precisar de ajustes finos.

## Próximos passos recomendados

- Melhorar a seleção de elementos para traduzir
- Traduzir apenas textos relevantes
- Criar botão de ativação diretamente na página do GitHub
- Suportar múltiplos idiomas
- Adicionar interface de configuração mais avançada

# Telas

Todas usam [css/style.css](../css/style.css) e montam conteúdo dinâmico com [js/ui.js](../js/ui.js) (sempre como texto, nunca `innerHTML`): cabeçalho azul "PORTAL DA PREFEITURA" e card branco sobre fundo cinza (protótipo Figma, Figura 7). No celular (≤ 480 px) o card ocupa a largura toda.

| Página | Script | Acesso | Estado |
|---|---|---|---|
| `index.html`: login | `js/login.js` | público | pronta |
| `cadastro.html`: cadastro do munícipe | `js/cadastro.js` | público | pronta |
| `home.html`: Suas entradas + menu | `js/home.js` | munícipe | pronta |
| `registrar.html`: novo registro | `js/registrar.js` | munícipe | pronta |
| `detalhes.html?id=N`: detalhes | `js/detalhes.js` | munícipe e servidor | pronta |
| `servidor.html`: painel | `js/servidor.js` | servidor | pronta |

## Login (`index.html`)
- Brasão oficial (`img/brasao.png`), CPF com máscara, senha, botão ENTRAR.
- Mensagens em vermelho: "CPF inválido." (dígitos errados), "CPF não cadastrado. Clique em \"Cadastre-se\"…" (CPF sem conta) e "CPF ou senha incorretos." (senha errada).
- Após o cadastro chega com `?cadastro=ok` e mostra a confirmação.
- Munícipe → `home.html`; servidor → `servidor.html`.

## Cadastro (`cadastro.html`)
- CPF, nome, senha (obrigatórios); e-mail, telefone, bairro (opcionais).
- Validação nativa do navegador (required, email, minlength) + regras do `DB` (CPF válido e único). O erro aparece embaixo do campo, que recebe `aria-invalid` e o foco.
- Seção "Privacidade (LGPD)": para que serve cada dado, quem vê os registros e que os dados ficam no Supabase com senha criptografada e acesso por perfil.

## Home (`home.html`)
- "Suas entradas": barras azuis com título e badge de status (cor + texto), mais recentes primeiro; levam aos detalhes.
- Lista vazia: mensagem convidando a criar o primeiro registro.
- "Menu de serviços": uma caixa por categoria; leva a `registrar.html?categoria=N` com o serviço já escolhido.
- Botão redondo "+" → `registrar.html`.

## Novo registro (`registrar.html`)
- Cabeçalho "← REGISTRAR NOVO" volta para a home.
- Serviço, identificação, descrição, localização, grau de urgência (Baixo/Médio/Alto) e fotos (até 5, com miniaturas).
- Fotos reduzidas no navegador antes de salvar; o botão fica desativado enquanto processa.
- Ao enviar: some o formulário e aparece o protocolo (com foco, para leitor de tela), com links para os detalhes e para a home. Se faltar espaço para as fotos, o registro fica salvo e aparece um aviso.

## Detalhes (`detalhes.html?id=N`)
- Cabeçalho "← DETALHES". Protocolo, serviço, identificação, descrição, localização, urgência, data, status, fotos e histórico em ordem cronológica.
- Registro de outro munícipe ou inexistente: "Registro não encontrado."
- **Servidor:** o "←" volta para o painel, e abaixo dos dados aparece "Atualizar status" (novo status + observação opcional, que o munícipe também vê no histórico). Depois de salvar, a página é redesenhada e o foco vai para "Status atualizado.". Registro de outra secretaria: "Registro não encontrado."

## Painel do servidor (`servidor.html`)
- Nome da secretaria do servidor, filtro "Mostrar" por status e a contagem.
- Cada item mostra título, badge de status, protocolo, serviço, urgência e data, e leva aos detalhes.
- Ordem: abertos antes dos concluídos, depois por urgência, depois os mais antigos.

## Acessibilidade e responsividade (RNF01–RNF03)
- Toda página começa com o link "Ir para o conteúdo" (aparece no primeiro Tab) apontando para `<main id="principal">`.
- Foco sempre visível: contorno azul no conteúdo, branco no cabeçalho.
- Contraste (WCAG AA): textos ≥ 5,3:1, borda dos campos 4,5:1.
- Status sempre com cor + texto. Erros ligados ao campo (`aria-describedby`, `aria-invalid`, foco); mensagens com `role="alert"`/`role="status"`.
- Celular (≤ 480 px): card de largura total; o cabeçalho quebra linha com nomes longos; botões com altura mínima de 40 px.

## Carregamento (Supabase)
- Todas as páginas carregam `supabase-js` (CDN, versão fixa 2.45.4), `js/config.js` e `js/db.js`, nesta ordem.
- Os dados chegam de forma assíncrona; se falhar (sem internet, config errada), `UI.falhaAoCarregar` mostra a mensagem no topo do conteúdo.
- Os botões de envio ficam desativados durante a chamada ao banco.
- Login: se já houver sessão na aba, vai direto para a página inicial do perfil.

## Páginas protegidas
- `await Auth.exigir('MUNICIPE')`, `('SERVIDOR')` ou `('MUNICIPE', 'SERVIDOR')` no início do script (consulta a sessão do Supabase): sem sessão ou com o perfil errado, volta ao login.
- Botão "Sair" (`#sair`) e nome do usuário (`#nome-usuario`) no cabeçalho são ligados automaticamente.
- Depois de sair, o Voltar do navegador não reabre a página do cache (`pageshow`).

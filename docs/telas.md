# Telas

Todas usam [css/style.css](../css/style.css) e montam conteúdo dinâmico com [js/ui.js](../js/ui.js) (sempre como texto, nunca `innerHTML`): cabeçalho azul "PORTAL DA PREFEITURA" e card branco sobre fundo cinza (protótipo Figma, Figura 7). No celular (≤ 480 px) o card ocupa a largura toda.

| Página | Script | Acesso | Estado |
|---|---|---|---|
| `index.html`: landing page | nenhum | público | pronta |
| `login.html`: login | `js/login.js` | público | pronta |
| `cadastro.html`: cadastro do munícipe | `js/cadastro.js` | público | pronta |
| `home.html`: Suas entradas + menu | `js/home.js` | munícipe | pronta |
| `registrar.html`: novo registro | `js/registrar.js` | munícipe | pronta |
| `detalhes.html?id=N`: detalhes | `js/detalhes.js` | munícipe e servidor | pronta |
| `servidor.html`: painel | `js/servidor.js` | servidor | pronta |
| `conta.html`: configurações da conta | `js/conta.js` | munícipe e servidor | pronta |
| `termos.html`: termos de uso | nenhum | público | pronta |

## Landing page (`index.html`)
- Primeira página do site (`npm start` abre aqui). Estática como os termos: só HTML/CSS, sem Supabase (abre mesmo sem banco).
- Cabeçalho com a marca e o botão **Entrar** (`.topo-entrar`, visível no celular e no computador).
- **Foto da cidade** (`img/botucatu.jpg`) no fundo do destaque, cortada na diagonal pelo painel azul translúcido (85%, a foto aparece por trás): no celular a foto fica em cima e o azul sobe em diagonal sobre ela; no computador ficam lado a lado (azul à esquerda com o texto, foto à direita). Crédito obrigatório da licença no canto da foto (`.landing-credito`).
- Seções: destaque azul ("Viu um problema na rua? Avise a prefeitura." + botões **Registrar ocorrência** → cadastro e **Já tenho conta** → login); "O que você pode registrar" (as 3 categorias do Quadro 2 e a secretaria de cada uma); "Como funciona" (4 passos, com os badges de status); "É servidor da prefeitura?" (→ login); rodapé com os termos (aparece também no celular).
- Celular: tudo em coluna, botões na largura toda. Computador: categorias em 3 colunas e passos em 4.
- Quem já está logado e abre a landing continua nela; o "Entrar" leva ao login, que redireciona para a página inicial do perfil.
- Ao mudar as categorias no banco (`sql/02`), atualizar o texto da landing.

## Login (`login.html`)
- Brasão oficial (`img/brasao.png`), CPF com máscara, senha, botão ENTRAR.
- O formulário usa `method="post"`: se o JavaScript falhar, CPF e senha não vão para a URL.
- Mensagens em vermelho: "CPF inválido." (dígitos errados), "CPF não cadastrado. Clique em \"Cadastre-se\"…" (CPF sem conta) e "CPF ou senha incorretos." (senha errada).
- Após o cadastro chega com `?cadastro=ok` e mostra a confirmação.
- Munícipe → `home.html`; servidor → `servidor.html`.

## Cadastro (`cadastro.html`)
- CPF, nome, senha (obrigatórios); e-mail, telefone, bairro (opcionais).
- Validação nativa do navegador (required, email, minlength) + regras do `DB` (CPF válido e único). O erro aparece embaixo do campo, que recebe `aria-invalid` e o foco.
- Seção "Privacidade (LGPD)": para que serve cada dado, quem vê os registros e que os dados ficam no Supabase com senha criptografada e acesso por perfil.
- Acima do botão: "Ao se cadastrar, você concorda com os Termos de uso" (link para `termos.html`).

## Termos de uso (`termos.html`)
- Página estática: só HTML/CSS, não carrega Supabase nem JS (abre mesmo sem banco configurado).
- Card de leitura (`.card-medio.termos`): data da última atualização e seções 1–6: o serviço (projeto acadêmico, não substitui os canais oficiais), cadastro e acesso, uso correto, atendimento dos registros (protocolo, sem prazo garantido), privacidade (LGPD, mesmo texto do aviso do cadastro + fotos com links temporários) e alterações.
- Celular: cabeçalho "← TERMOS DE USO" volta para a landing. Computador: brasão no cabeçalho e rodapé.
- Links: login (abaixo de "Cadastre-se"), cadastro ("Ao se cadastrar, você concorda com os Termos de uso", acima do botão) e rodapé de todas as páginas (o rodapé só aparece no computador).
- Ao mudar o texto, atualizar a data no topo; se mudar a parte de privacidade, mudar também o aviso LGPD do cadastro.

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
- **Fotos:** clicar numa miniatura abre a foto grande por cima da própria página (sem nova guia), com o site esmaecido atrás (estilo Google Maps), com ‹ › e as setas do teclado para trocar e o contador "1 de N". Para fechar: ×, Esc ou clique fora. É um `<dialog>` nativo, então o foco volta para a miniatura ao fechar. Vale para servidor e munícipe (a página é a mesma).
- **Servidor:** o "←" volta para o painel, e abaixo dos dados aparece "Atualizar status" (novo status + observação opcional, que o munícipe também vê no histórico). Depois de salvar, a página é redesenhada e o foco vai para "Status atualizado.". Registro de outra secretaria: "Registro não encontrado."

## Painel do servidor (`servidor.html`)
- Nome da secretaria do servidor, filtro "Mostrar" por status e a contagem.
- Cada item mostra título, badge de status, protocolo, serviço, urgência e data, e leva aos detalhes.
- Ordem: abertos antes dos concluídos, depois por urgência, depois os mais antigos.

## Layout no computador (≥ 1024 px)
O celular segue o protótipo; no computador (`@media (min-width: 64rem)`, no fim de `css/style.css`):
- **Cabeçalho:** brasão + "Agiliza Botucatu / Portal da Prefeitura" e menu de navegação montado por `Auth.montarNavegacao`: munícipe tem "Suas entradas" e "Novo registro"; servidor, "Registros da secretaria". O link da página atual fica destacado. O "← TÍTULO" do celular some.
- **Login e cadastro:** tela dividida, com apresentação do serviço em azul à esquerda (`.acesso-apresentacao`) e o formulário à direita; o cadastro tem campos em duas colunas.
- **Home:** entradas (2/3) com data e botão "+ Novo registro" ao lado do título; menu de serviços numa coluna à direita. No celular, o "+" é o botão redondo fixo embaixo.
- **Novo registro:** campos em duas colunas (serviço/urgência, identificação/localização), descrição e fotos em largura total.
- **Detalhes:** dados à esquerda (rótulo | valor) e fotos; à direita, atualizar status (servidor) e histórico.
- **Painel do servidor:** tabela (protocolo, registro, serviço, urgência, aberto em, status) com o filtro na mesma linha. No celular, cada registro é um cartão.
- **Rodapé** com a prefeitura e o projeto. Largura máxima do conteúdo: 72rem.

## Acessibilidade e responsividade (RNF01–RNF03)
- Toda página começa com o link "Ir para o conteúdo" (aparece no primeiro Tab) apontando para `<main id="principal">`.
- Foco sempre visível: contorno azul no conteúdo, branco no cabeçalho.
- Contraste (WCAG AA): textos ≥ 5,3:1, borda dos campos 4,5:1.
- Status sempre com cor + texto. Erros ligados ao campo (`aria-describedby`, `aria-invalid`, foco); mensagens com `role="alert"`/`role="status"`.
- Celular (≤ 480 px): card de largura total, preenchendo até o fim da tela; o cabeçalho quebra linha com nomes longos; botões com altura mínima de 40 px.
- Sem rolagem quando o conteúdo cabe: `body` em coluna com `min-height: 100dvh` e card com `flex: 1` (antes, `calc(100vh - 3.3rem)` deixava a página maior que a tela).

## Configurações da conta (`conta.html`)
- Acessada pelo menu do ícone de perfil; o "←" volta para a home (munícipe) ou para o painel (servidor).
- **Barra lateral** de funcionalidades (`<nav class="conta-menu">`). Cada item mostra só a sua seção (`<section class="conta-secao">`), e o endereço guarda a seção (`conta.html#dados`) sem pular a página. No celular (≤ 640 px) a barra vira abas no topo.
- **Para adicionar uma funcionalidade:** um `<li><a href="#id">` na barra + uma `<section id="id" class="conta-secao" tabindex="-1" hidden>`. A troca já funciona (`mostrarSecao` em `js/conta.js`).
- Seções atuais:
  - **Dados da conta** (só leitura), com o botão **SAIR DA CONTA** (contorno vermelho) embaixo: nome, CPF, e-mail, tipo de conta e, conforme o tipo, telefone e bairro (munícipe) ou secretaria, matrícula e cargo (servidor), além da data de cadastro. Campo vazio aparece como "Não informado".

## Carregamento (Supabase)
- Todas as páginas carregam `supabase-js` (CDN, versão fixa 2.45.4), `js/config.js` e `js/db.js`, nesta ordem.
- Os dados chegam de forma assíncrona; se falhar (sem internet, config errada), `UI.falhaAoCarregar` mostra a mensagem no topo do conteúdo.
- Os botões de envio ficam desativados durante a chamada ao banco.
- Login: se já houver sessão na aba, vai direto para a página inicial do perfil.

## Páginas protegidas
- `await Auth.exigir('MUNICIPE')`, `('SERVIDOR')` ou `('MUNICIPE', 'SERVIDOR')` no início do script (consulta a sessão do Supabase): sem sessão ou com o perfil errado, volta ao login.
- No cabeçalho, à direita, fica o **ícone de perfil** (`.perfil-botao`). Ele abre um menu com o nome do usuário (`#nome-usuario`) o link "Configurações da conta" (`conta.html`) e o botão **Sair** (vermelho). `Auth.ligarMenuPerfil` liga tudo automaticamente.
  - Acessível (padrão *disclosure*): botão com `aria-expanded`/`aria-controls` e rótulo "Menu da conta". Enter/Espaço abre; Esc fecha e devolve o foco; clicar fora ou sair com Tab fecha.
- Botões de sair: "Sair" no menu do perfil e "SAIR DA CONTA" na conta. Qualquer botão com o atributo `data-sair` é ligado por `Auth.exigir`.
- Depois de sair, o Voltar do navegador não reabre a página do cache (`pageshow`).

# Changelog

## 2026-11-26: Painel azul translúcido e sem arrastar além do topo
- Landing: o painel azul do destaque ficou 85% opaco (a foto aparece por trás; texto branco continua ≥ 6:1 mesmo sobre partes claras da foto). A foto agora cobre todo o destaque também no celular.
- Todas as páginas: `html, body { overscroll-behavior-y: none; }` no início de `css/style.css`. Arrastar além do topo mostrava o fundo cinza acima do cabeçalho (efeito "elástico" do celular/trackpad).
- Regra registrada no `CLAUDE.md` (Convenções) para as próximas páginas.
- Arquivos: `css/style.css`, `CLAUDE.md`, `docs/telas.md`, `docs/checklist-testes.md`, `tasks/todo.md`.
- Verificado: screenshots a 360 e 1280 px (Firefox headless). O elástico só dá para conferir no celular/trackpad de verdade (checklist 8.1c). Safari antigo (< 16) ignora a propriedade.
- Requisitos: RNF01–RNF03.

## 2026-11-26: Foto da cidade no topo da landing
- Destaque da landing com foto aérea de Botucatu ao fundo (`img/botucatu.jpg`, 1000×667, sem metadados), cortada na diagonal pelo painel azul (`clip-path`). Celular/tablet: foto em cima e o azul sobe em diagonal; computador: azul com o texto à esquerda e foto à direita, lado a lado.
- Foto: "Botucatu.jpg", Prefeitura de Botucatu, Wikimedia Commons, licença CC BY-SA 4.0. O crédito com links fica no canto da foto (exigido pela licença).
- Arquivos: `img/botucatu.jpg`, `index.html`, `css/style.css`, `docs/telas.md`, `docs/decisoes.md`, `tasks/todo.md`.
- Verificado: `npm test` passando; screenshots a 360, 800, 1280 e 1920 px (Firefox headless).
- Requisitos: RNF01–RNF03 (usabilidade e responsividade).

## 2026-11-26: Landing page
- Nova `index.html`: landing pública e estática (sem Supabase) com destaque ("Registrar ocorrência" → cadastro, "Já tenho conta" → login), categorias atendidas, como funciona (4 passos com os badges de status), chamada para servidores e rodapé com os termos. Botão "Entrar" no cabeçalho. Layout de celular em coluna e de computador em grade.
- O login passou de `index.html` para `login.html` (`git mv`); redirecionamentos e links atualizados (`js/auth.js`: sair e páginas protegidas; `js/cadastro.js`: `login.html?cadastro=ok`; "Entrar" no cadastro e nos termos). A marca do cabeçalho continua levando à raiz (landing) nas páginas públicas.
- CSS novo: bloco "Landing" + regras no `@media (min-width: 64rem)` (`.topo-entrar`, `.landing-*`, `.botao-claro`, `.botao-contorno`).
- Arquivos: `index.html`, `login.html`, `js/auth.js`, `js/cadastro.js`, `cadastro.html`, `termos.html`, `css/style.css`, `docs/telas.md`, `docs/decisoes.md`, `docs/checklist-testes.md`, `README.md`, `tasks/plan.md`, `tasks/todo.md`.
- Verificado: `npm test` passando; screenshots da landing a 360 px e 1280 px (Firefox headless). Não clicado com o Supabase real.
- Requisitos: RNF01–RNF03 (usabilidade, responsividade, acessibilidade).

## 2026-11-26: Sair pelo menu do perfil
- O menu do ícone de perfil ganhou o item **Sair** (vermelho, abaixo de "Configurações da conta") em todas as páginas logadas: não é mais preciso abrir a conta para sair.
- `conta.html`: removida a seção/aba "Sessão"; o botão **SAIR DA CONTA** fica embaixo dos "Dados da conta".
- Os botões de sair agora são marcados com `data-sair` (antes `id="sair"`, que não pode repetir na mesma página); `Auth.exigir` liga todos.
- Arquivos: `home.html`, `registrar.html`, `detalhes.html`, `servidor.html`, `conta.html`, `js/auth.js`, `js/conta.js`, `css/style.css`, `docs/telas.md`, `docs/decisoes.md`, `docs/checklist-testes.md`, `README.md`, `tasks/plan.md`, `tasks/todo.md`.
- Verificado: `npm test` passando; screenshot do menu aberto a 360 px e 1280 px (Firefox headless). Não clicado com o Supabase real.
- Requisitos: RF02 (logout), RNF de usabilidade.

## 2026-11-26: Tela de termos de uso
- Nova página pública `termos.html` (só HTML/CSS, sem Supabase): o serviço, cadastro e acesso, uso correto, atendimento dos registros, privacidade (LGPD) e alterações, com data da última atualização. Celular com "← TERMOS DE USO"; computador com card de leitura e rodapé.
- Links: login (abaixo de "Cadastre-se"), cadastro ("Ao se cadastrar, você concorda com os Termos de uso") e rodapé das 8 páginas.
- Aceite só por aviso, sem caixa nem gravação no banco (decisão do usuário, em `docs/decisoes.md`).
- Arquivos: `termos.html`, `index.html`, `cadastro.html`, `home.html`, `registrar.html`, `detalhes.html`, `servidor.html`, `conta.html`, `css/style.css`, `docs/telas.md`, `docs/checklist-testes.md` (seção 11), `docs/decisoes.md`, `README.md`, `tasks/plan.md`, `tasks/todo.md`.
- Verificado: `npm test` passando; screenshots (Firefox headless) de `termos.html` a 360 px e 1280 px e do login a 360×640 (sem rolagem). O texto não é jurídico oficial: falta revisão do grupo.
- Requisitos: RNF07 (LGPD/transparência no uso dos dados), RNF01–RNF03 (acessibilidade e responsividade).

## 2026-11-22: Fotos ampliadas nos detalhes
- Em `detalhes.html`, as miniaturas viraram botões que abrem a foto grande por cima da própria página, sem nova guia (`abrirVisualizador` em `js/detalhes.js`, com `<dialog>` nativo): site esmaecido atrás, ‹ › e setas do teclado para trocar, contador, fecha com ×, Esc ou clique fora. Mesmo layout no celular e no computador.
- Pedido para o servidor; como a página é a mesma, o munícipe também ganhou.
- Arquivos: `js/detalhes.js`, `css/style.css`, `docs/telas.md`, `docs/checklist-testes.md` (item 5.2a), `tasks/plan.md` (tarefas 18-19 e Checkpoint 3 marcado, já verificado na Tarefa 9).
- Verificado: `npm test` passando, screenshot do visualizador a 1280×720 (Firefox headless, página isolada). Não testado com fotos reais do Supabase.
- Requisitos: RF10/RF11 (servidor analisa o registro), RNF de usabilidade/acessibilidade.

## 2026-11-22: Servidores de demonstração criados direto no SQL
- `sql/03_servidores_demo.sql` agora cria as duas contas no Supabase Auth (`auth.users` + `auth.identities`, senha `servidor123` com bcrypt, e-mail já confirmado) antes de chamar `promover_servidor`. Não é mais preciso cadastrar os CPFs pelo site. Pode rodar de novo: conta existente é pulada e só promovida.
- O trigger `criar_municipe` continua criando `usuario` + `municipe`; `promover_servidor` troca para servidor.
- Docs: supabase (passo 5 e problemas comuns), checklist, README, plano, todo.
- Não testado no Supabase real (rodar no SQL Editor e entrar com o CPF).
- Requisitos: RF10, RF11 (acesso do servidor), RNF06 (senha com bcrypt).

## 2026-11-13: Layout para computador
- Novo layout a partir de 1024 px (`@media (min-width: 64rem)` no fim de `css/style.css`); o celular continua igual ao protótipo.
- **Cabeçalho:** brasão + "Agiliza Botucatu / Portal da Prefeitura" e navegação por perfil (`Auth.montarNavegacao`, link atual destacado). **Rodapé** em todas as páginas.
- **Login/cadastro:** tela dividida com apresentação do serviço; cadastro em duas colunas (layout `.acesso`).
- **Home:** entradas com data + botão "+ Novo registro" e menu de serviços em coluna lateral; no celular, o "+" virou botão fixo embaixo.
- **Novo registro:** campos em duas colunas. **Detalhes:** dados à esquerda, status e histórico à direita.
- **Painel do servidor:** tabela com cabeçalho e filtro na mesma linha; urgência com maiúscula.
- Verificado por screenshots (Firefox headless, Supabase simulado): 7 telas a 1440×900; celular a 360 px e tablet a 800 px sem rolagem horizontal. `npm test` passando.
- Docs: telas, decisões, checklist, README, CLAUDE.md (regra: toda tela nova com versão celular e computador), plano, todo.

## 2026-11-13: Barra lateral na conta e páginas sem rolagem sobrando
- **Rolagem:** no celular o card tinha `min-height: calc(100vh - 3.3rem)`, mas o cabeçalho com o ícone de perfil tem ~4,3rem, e o `100vh` do celular inclui a barra de endereço. Resultado: dava para arrastar a página sem conteúdo. Agora o `body` é uma coluna com `min-height: 100dvh` e o card usa `flex: 1` (vale para todas as páginas).
- **Conta:** barra lateral de funcionalidades (`.conta-menu`), com "Dados da conta" e "Sessão" (sair). Cada item mostra só a sua seção, o endereço guarda a seção (`#sessao`) e no celular a barra vira abas.
- Regra no CLAUDE.md: funcionalidades novas da conta entram na barra lateral; não usar `calc(100vh - …)`.
- Verificado por medição em Firefox headless: sem rolagem a 360×640 e 1280×720 (conta/Sessão, home, painel). "Dados da conta" no celular rola 13px porque o conteúdo é maior que a tela (esperado). `npm test` passando.

## 2026-11-13: Correção: login e cadastro não funcionavam; CPF e senha apareciam na URL
- **Causa:** `js/db.js` lia a configuração como `globalThis.AGILIZA_CONFIG`, mas o `const AGILIZA_CONFIG` de `js/config.js` (script clássico) não vira propriedade de `window`. O Supabase recebia a URL vazia ("supabaseUrl is required"), o `db.js` quebrava e, sem o script da página, o navegador enviava o formulário por GET, com CPF e senha na URL.
- **Correção:** `db.js` lê `AGILIZA_CONFIG` direto (com `typeof`). Se o Supabase não iniciar, `DB` continua existindo e cada chamada mostra "Configure o Supabase…" na tela, em vez de quebrar a página.
- **Defesa:** formulários de login e cadastro com `method="post"`: mesmo que um script falhe, a senha nunca vai para a URL.
- **Teste de regressão:** `npm test` agora carrega `config.js` + `db.js` como o navegador e confere a URL/chave usadas no cliente (falha com o código antigo, passa com o novo). Páginas index, cadastro, home e conta abertas no Firefox headless sem erros de JavaScript.
- Projeto Supabase do grupo conferido (consultas só de leitura): Confirm email desligado, cadastro liberado, `01` e `04` aplicados.
- **Lição:** os testes anteriores (Node e PostgREST) injetavam a configuração em `globalThis` e por isso não reproduziam o navegador.

## 2026-11-13: Ícone de perfil e configurações da conta
- Cabeçalho: nome + botão "Sair" substituídos por um **ícone de perfil** com menu (nome do usuário + "Configurações da conta"). É acessível: `aria-expanded`, Esc fecha e devolve o foco, clique fora fecha. Lógica em `Auth.ligarMenuPerfil` (`js/auth.js`).
- Nova `conta.html` + `js/conta.js`: dados da conta (só leitura, conforme munícipe/servidor) e botão **SAIR DA CONTA**.
- `DB.minhaConta(usuario)`; estilos `.perfil*` e `.botao-secundario`; removidos `.topo-usuario` e `.botao-sair`.
- Verificado: `minhaConta` contra PostgREST local (munícipe e servidor); screenshots com o menu aberto a 360 px; `npm test` passando.
- Docs: telas, dados, decisões, checklist, README, plano, todo.

## 2026-11-13: Revisão da documentação
- README: ordem de execução dos SQL (01 → 02 → 04 → 03 → testes), aviso de que `js/config.js` já aponta para o projeto do grupo, mensagens do login.
- `tasks/plan.md` e `tasks/todo.md`: Tarefa 14 (aviso de CPF não cadastrado) registrada; `config.js` marcado como preenchido; novo risco (`cpf_cadastrado` revela se um CPF tem conta).
- `docs/checklist-testes.md` (preparação inclui o `04`) e `docs/testes.md` (verificação do `04`).

## 2026-11-13: Login avisa "CPF não cadastrado"
- Novo `sql/04_cpf_cadastrado.sql`: função `cpf_cadastrado(cpf)` (só responde sim/não; liberada sem login). **Rodar no SQL Editor do projeto.**
- `DB.entrar`: CPF inválido → "CPF inválido."; senha recusada e CPF sem conta → "CPF não cadastrado. Clique em "Cadastre-se" para criar sua conta."; senha errada → continua "CPF ou senha incorretos.". Todas em vermelho (`#erro`). Se a função não existir no banco, cai na mensagem genérica.
- Testes: `npm test` (+1: CPF inválido) e `sql/testes.sql` (+ `cpf_cadastrado`), ambos passando (SQL verificado em PostgreSQL local).
- Decisão registrada: aceita revelar se um CPF tem conta (pedido do usuário). Docs: supabase, dados, telas, decisões, testes, checklist, README, todo.

## 2026-11-13: Fase 5: banco de dados no Supabase
- **Banco** (`sql/`): `01_schema.sql` (9 tabelas do DER adaptadas ao PostgreSQL; RLS; triggers de cadastro, protocolo e histórico; função `atualizar_status`; bucket privado `fotos`), `02_dados_iniciais.sql` (Quadro 2), `03_servidores_demo.sql` (`promover_servidor`), `testes.sql` (regras, com rollback).
- **Site:** `js/config.js` (URL/chave do projeto); `js/db.js` reescrito sobre `supabase-js` 2.45.4 (CDN), tudo async; `js/auth.js` usa a sessão do Supabase (por aba); páginas assíncronas, com botões desativados durante o envio e mensagem de erro quando o carregamento falha (`UI.falhaAoCarregar`).
- Login por CPF via e-mail técnico `<cpf>@DOMINIO_EMAIL` no Supabase Auth; senha com bcrypt no Auth (antes era SHA-256 no navegador).
- Fotos no Storage (antes eram data URL no localStorage).
- Removido `tests.html`; `js/tests.js` ficou com CPF e validações de formulário (as regras agora são testadas em `sql/testes.sql`).
- Texto de privacidade do cadastro atualizado.
- Docs: novo `docs/supabase.md`; reescritos `docs/dados.md` e `docs/testes.md`; atualizados README, CLAUDE.md, plano, todo, decisões, telas e checklist (69 itens).
- Verificado localmente (Podman): o SQL roda e os testes passam em PostgreSQL 16 com um esqueleto do Supabase; o `js/db.js` real passou em 18 verificações contra PostgREST 12. **Não verificados:** Supabase Auth e Storage reais.
- Dados antigos no `localStorage` dos navegadores não são migrados (eram de teste).

## 2026-11-13: Fase 4 (Tarefa 10): acessibilidade, responsividade, LGPD + checklist
- Link "Ir para o conteúdo" em todas as páginas; `<main id="principal">`.
- Foco visível no cabeçalho (contorno branco); cabeçalho quebra linha com nomes longos; botão Sair maior para toque.
- Borda dos campos `#b5b5b5` → `#767676` (contraste 2,05 → 4,5:1). Demais cores conferidas (≥ 5,3:1).
- Cadastro: seção "Privacidade (LGPD)" explicando para que serve cada dado.
- `Auth.exigir`: o Voltar após "Sair" não reabre a página do cache.
- Correção: a mensagem e os docs diziam que `file://` bloqueia a criptografia; no Firefox isso não acontece. O caso real é o acesso pelo IP da rede (sem HTTPS). Mensagem e docs ajustados.
- Novo `docs/checklist-testes.md` (67 testes manuais por requisito).
- Screenshots a 360 px de todas as páginas: sem rolagem horizontal. Testes automáticos: 16/16.

## 2026-11-13: Fase 3 (Tarefas 8–9): fluxo do servidor
- **Tarefa 8 (RF10, RN07):** `servidor.html` + `js/servidor.js`: registros da secretaria do servidor com filtro por status; `DB.registrosDaSecretaria`.
- **Tarefa 9 (RF11, RF12, RN05, RN06):** formulário "Atualizar status" em `detalhes.html` (só servidor); `DB.atualizarStatus` grava o histórico com servidor e observação.
- `DB.detalhesRegistro(id, usuario_id)` agora também libera o servidor da secretaria do registro (antes só o munícipe dono).
- `Auth.exigir` aceita mais de um tipo de usuário.
- Testes: 16/16 (`npm test`). Screenshot no Firefox headless: painel filtrado por secretaria, status alterado pelo formulário, bloqueio de registro de outra secretaria.

## 2026-11-13: Fase 2 (Tarefas 4–7): fluxo do munícipe + README
- **Tarefa 4 (RF03, RF04, RN03):** `home.html` + `js/home.js`: "Suas entradas" com badge de status, menu de serviços, botão "+".
- **Tarefa 5 (RF05, RF06, RF08, RN01, RN04):** `registrar.html` + `js/registrar.js`; `DB.criarRegistro` (validação, status Aguardando, 1º histórico, protocolo).
- **Tarefa 6 (RF07, RNF08):** fotos (até 5) reduzidas com canvas, com miniaturas; `DB.adicionarFoto`, com erro claro se faltar espaço.
- **Tarefa 7 (RF09):** `detalhes.html` + `js/detalhes.js`; `DB.detalhesRegistro` (bloqueia registro de outro munícipe).
- Novo `js/ui.js` (montar elementos com texto seguro, badge, erros de formulário); `js/cadastro.js` passou a usá-lo.
- Brasão oficial: o arquivo enviado era PNG com extensão `.svg`; renomeado para `img/brasao.png`.
- Criado `README.md`.
- Testes: 12/12 (`npm test`). Telas conferidas por screenshot no Firefox headless com dados de exemplo; o fluxo clicado de ponta a ponta ainda não foi feito.

## 2026-11-13: Servidor de teste via npm
- `package.json`: `npm start` (http-server 14.1.1 via npx, porta 8000, sem cache, abre o navegador) e `npm test` (testes no Node).
- Atualizados `CLAUDE.md`, `tasks/todo.md`, `docs/testes.md`, `docs/decisoes.md`.
- Verificado: as páginas respondem 200 e os testes passam (8/8).

## 2026-11-13: Fase 1 (Tarefas 1–3): fundação, cadastro e login
- **Tarefa 1:** `css/style.css` (identidade do protótipo, badges de status), `js/db.js` (9 tabelas do DER no localStorage, carga do Quadro 2 + 2 servidores demo), `tests.html` + `js/tests.js` + `js/tests-node.js`.
- **Tarefa 2 (RF01, RN02):** `cadastro.html` + `js/cadastro.js`: valida CPF (dígitos verificadores e duplicidade), grava `usuario` + `municipe`, senha em SHA-256.
- **Tarefa 3 (RF02):** `index.html` + `js/login.js` (CPF + senha), `js/auth.js` (sessão, guarda por perfil, sair), esboços de `home.html` e `servidor.html`.
- `img/brasao.svg` provisório.
- Respostas do usuário registradas em `tasks/plan.md`; criados `docs/dados.md`, `docs/telas.md`, `docs/decisoes.md`, `docs/testes.md`.
- Testes: 8/8 passando (`node js/tests-node.js`). Fluxo no navegador ainda não verificado manualmente.

## 2026-11-13: Planejamento
- Criados `CLAUDE.md` (stack + regra de documentação obrigatória), `tasks/plan.md` (arquitetura, riscos, perguntas em aberto) e `tasks/todo.md` (10 tarefas em 4 fases, com critérios de aceite).
- Base: documento `Agiliza_InfBotucatu_P1.pdf`.
- Nenhum código ainda.

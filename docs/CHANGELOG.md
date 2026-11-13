# Changelog

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

# Plano de Implementação: Agiliza Infraestrutura Botucatu (site)

## Visão geral

Site em HTML/CSS/JS puros que implementa o protótipo do documento P1: o munícipe se cadastra, entra com CPF, vê seus registros, abre uma nova ocorrência (categoria, identificação, descrição, localização, urgência, fotos) e recebe um protocolo; o servidor da prefeitura lista os registros da sua secretaria e atualiza o status, com histórico.

## Decisões de arquitetura

> Atualizado em 2026-11-13 (Fase 5): o `localStorage` foi substituído pelo **Supabase**. Detalhes em `docs/dados.md` e `docs/decisoes.md`.

- **Banco: Supabase** (PostgreSQL + Auth + Storage), acessado direto do navegador com `supabase-js` (CDN, versão fixa). Sem servidor próprio. Tabelas = DER do documento, adaptadas em `sql/01_schema.sql`.
- **Regras no banco:** RLS (munícipe vê só os seus registros, servidor só os da secretaria), triggers (cadastro → usuario + municipe; protocolo; 1º histórico) e a função `atualizar_status`. O navegador só valida para dar mensagens melhores.
- **Login:** CPF + senha no Supabase Auth, usando o e-mail técnico `<cpf>@DOMINIO_EMAIL` ("Confirm email" desligado). A senha fica com bcrypt no Auth. Mensagens separadas para CPF inválido, CPF não cadastrado (função `cpf_cadastrado`, `sql/04`) e senha errada.
- **Servidores:** a pessoa se cadastra pelo site e o administrador roda `promover_servidor` no SQL Editor (`sql/03_servidores_demo.sql` cria e promove os de demonstração direto no SQL).
- **Páginas** (uma por tela do protótipo):
  - `index.html`: landing page pública (Tarefa 22)
  - `login.html`: login (CPF + senha)
  - `cadastro.html`: cadastro do munícipe
  - `home.html`: "Suas entradas" + menu de serviços + botão "+"
  - `registrar.html`: novo registro
  - `detalhes.html?id=N`: detalhes + histórico (o servidor vê também o formulário de status)
  - `servidor.html`: painel do servidor (lista + filtro por status)
  - `termos.html`: termos de uso (pública, só HTML/CSS, sem Supabase)
  - `conta.html`: configurações da conta, aberta pelo ícone de perfil do cabeçalho; funcionalidades numa barra lateral (Dados da conta, com o botão sair embaixo; Exportar dados, só servidor); "Sair" também no menu do perfil
- **JS compartilhado:**
  - `js/config.js`: URL e chave pública do Supabase;
  - `js/db.js`: todas as chamadas ao banco, async;
  - `js/auth.js`: proteção das páginas por perfil;
  - `js/ui.js`: montar elementos com texto seguro, badge e erros.
- **Protocolo (RN01):** `ANO` + id com 6 dígitos (ex.: `2026000012`), gerado por trigger.
- **Fotos:** reduzidas com `<canvas>` (lado máx. 1024 px, JPEG 70%), até 5 por registro, no bucket privado `fotos` (links temporários).
- **Visual:** azul institucional do protótipo, status com cor **e** texto. Celular = protótipo (cabeçalho "PORTAL DA PREFEITURA", card branco); computador (≥ 1024 px) = cabeçalho com marca e menu, telas em colunas, painel em tabela, rodapé.
- **Testes:** `sql/testes.sql` (regras do banco, no SQL Editor), `npm test` (funções do navegador) e `docs/checklist-testes.md` (manual).

## Grafo de dependências

```
css/style.css + js/db.js (tabelas + seed)
   └── js/auth.js (sessão)
         ├── cadastro.html ── login.html (login)
         │                       └── home.html (lista + menu)
         │                             ├── registrar.html (+ fotos)
         │                             └── detalhes.html
         └── servidor.html (lista da secretaria → atualizar status)
```

## Lista de tarefas

Detalhes, critérios de aceite e verificação em [todo.md](todo.md).

### Fase 1: Fundação
- [x] Tarefa 1: Estrutura, estilo base e banco no localStorage
- [x] Tarefa 2: Cadastro do munícipe
- [x] Tarefa 3: Login por CPF, sessão e logout

### Checkpoint 1
- [x] Cadastro → login → logout funcionando; `tests.html` verde

### Fase 2: Fluxo do munícipe
- [x] Tarefa 4: Home com "Suas entradas" e menu de serviços
- [x] Tarefa 5: Novo registro com urgência e protocolo
- [x] Tarefa 6: Anexar fotos ao registro
- [x] Tarefa 7: Detalhes do registro

### Checkpoint 2
- [ ] Fluxo completo do diagrama de atividades funciona de ponta a ponta

### Fase 3: Fluxo do servidor
- [x] Tarefa 8: Painel do servidor com registros da secretaria
- [x] Tarefa 9: Atualizar status com histórico

### Checkpoint 3
- [x] Munícipe vê no detalhe o status alterado pelo servidor

### Fase 4: Acabamento
- [x] Tarefa 10: Responsividade, acessibilidade e aviso LGPD

### Checkpoint final (protótipo localStorage)
- [x] Todos os RF01–RF12 implementados
- [ ] Checklist manual (`docs/checklist-testes.md`) e revisão com o grupo

### Fase 5: Banco de dados (Supabase)
- [x] Tarefa 11: Schema, regras e carga no Supabase (`sql/`)
- [x] Tarefa 12: Site usando o Supabase (`js/db.js` + páginas async)
- [x] Tarefa 14: Login avisa "CPF não cadastrado" (`sql/04_cpf_cadastrado.sql`)
- [x] Tarefa 15: Ícone de perfil com menu + página de configurações da conta
- [x] Tarefa 16: Barra lateral na conta + páginas sem rolagem sobrando
- [x] Tarefa 17: Layout para computador (≥ 1024 px), celular mantém o protótipo
- [x] Tarefa 18: Servidores de demonstração criados direto no SQL (`sql/03`)
- [x] Tarefa 19: Fotos ampliadas nos detalhes (visualizador sobre a página)
- [x] Tarefa 23: Ocorrências de demonstração (`sql/05_ocorrencias_demo.sql`)
- [ ] Tarefa 13: Configurar o projeto Supabase do grupo e rodar a checklist

### Fase 6: Termos de uso
- [x] Tarefa 20: Tela de termos de uso (`termos.html`) com links no cadastro, no login e no rodapé
- [x] Tarefa 22: Landing page em `index.html` (login passou para `login.html`)
- [x] Tarefa 21: "Sair" no menu do perfil; seção "Sessão" removida da conta (botão sair embaixo dos dados)

### Checkpoint 6
- [ ] `termos.html` abre sem login, no celular e no computador, sem rolagem horizontal; `npm test` verde; revisão do texto com o grupo

### Fase 7: Exportar dados (só servidor)
> Pedido de 2026-11-26 (para o professor): na conta da prefeitura, um clique gera um CSV com **tudo** o que está cadastrado no banco (usuários, registros, histórico, fotos, serviços, secretarias), de todas as secretarias; botões **Baixar CSV** e **Imprimir**; liberado para **todas** as contas de servidor.

- [x] Tarefa 24: Função `exportar_dados()` no banco, só para servidor (`sql/06_exportar.sql` + `sql/testes.sql`)
- [x] Tarefa 25: `DB.exportarDados` + `DB.gerarCSV` (função pura, testada no `npm test`)
- [x] Tarefa 26: Seção "Exportar dados" em `conta.html` (só servidor): Baixar CSV + Imprimir

### Checkpoint 7
- [ ] `npm test` verde; `sql/testes.sql` passa (local); CSV abre certo no LibreOffice/Excel (acentos, `;`, aspas); impressão mostra só a tabela; munícipe não vê a seção nem consegue chamar a função

## Riscos e mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| `cpf_cadastrado` revela se um CPF tem conta (pedido do usuário) | Baixo | Não devolve outros dados; reverter para a mensagem genérica se a prefeitura exigir |
| Supabase Auth recusar o domínio do e-mail técnico | Médio | `DOMINIO_EMAIL` configurável em `js/config.js`; ver docs/supabase.md |
| "Confirm email" ligado impede o login | Médio | Mensagem específica no login + passo 2 de docs/supabase.md |
| Auth e Storage reais não foram testados localmente (só PostgREST + Postgres) | Médio | Checklist manual depois de configurar o projeto |
| Projeto gratuito pausa após ~1 semana sem uso | Médio (apresentação) | Reativar no painel antes de apresentar |
| Regra só no JS seria contornável (a chave anon é pública) | Alto | Toda regra está no banco (RLS/triggers/função) e coberta por `sql/testes.sql` |
| Supabase/CDN fora do ar ou sem internet | Baixo | Mensagem de erro em vez de página em branco |
| Exportação abre CPF/telefone de todos os munícipes a qualquer servidor (escolha do usuário, Fase 7) | Médio (LGPD) | Função `security definer` que recusa quem não é servidor (42501), sem acesso anon, coberta por `testes.sql`; citar nos termos/aviso LGPD; rever se a prefeitura restringir a `ADMINISTRADOR` |
| Texto digitado pelo munícipe começando com `=`, `+`, `-`, `@` vira fórmula no Excel (CSV injection) | Médio | `gerarCSV` prefixa essas células com `'`; teste no `npm test` |
| Excel em pt-BR abre CSV com vírgula numa coluna só e quebra acentos | Baixo | Separador `;` + BOM UTF-8 no arquivo |

## Perguntas respondidas

**2026-11-26:** exportação: qualquer servidor pode exportar; o CSV traz todos os dados do banco (um bloco por tabela), não só os registros.

**2026-11-26:** termos de uso aceitos só por aviso no cadastro, sem caixa obrigatória nem gravação no banco.

**2026-11-13:**

1. **Login:** CPF + senha (sem objeção do usuário; segue RF01 e o diagrama de sequência).
2. **Brasão:** oficial em `img/brasao.png` (enviado pelo usuário).
3. **Vazamentos:** fora por enquanto; só as 3 categorias do Quadro 2.
4. **Servidor:** servidores fixos de demonstração, sem tela de cadastro (credenciais em `docs/dados.md`).

## Perguntas em aberto


- **Texto dos termos:** redigido a partir do que o sistema já faz (P1 + aviso LGPD). Precisa de revisão do grupo; não é texto jurídico oficial da prefeitura.

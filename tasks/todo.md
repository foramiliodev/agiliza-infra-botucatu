# Tarefas: Agiliza Infraestrutura Botucatu

Como verificar: `npm start` (abre `http://localhost:8000`; precisa do Supabase configurado, ver `docs/supabase.md`). Testes: `npm test` e `sql/testes.sql` (SQL Editor do Supabase).
Ao concluir cada tarefa: seguir a regra de documentação do [CLAUDE.md](../CLAUDE.md).

---

## Fase 1: Fundação

> Histórico: as Fases 1–4 foram feitas com o banco no `localStorage` (e `tests.html`). Na Fase 5 isso foi trocado pelo Supabase; veja a Fase 5 no fim.

### [x] Tarefa 1: Estrutura, estilo base e banco no localStorage
**Descrição:** Criar a estrutura de pastas, o CSS base com a identidade do protótipo (cabeçalho azul, card branco, badges de status) e `js/db.js` com as tabelas do DER, a carga inicial e as funções de leitura/escrita.
**Critérios de aceite:**
- [x] Na primeira abertura, o `localStorage` tem as 9 tabelas, com a carga do Quadro 2 e 2 servidores de demonstração
- [x] Reabrir não duplica a carga
- [x] `tests.html` existe e roda asserts sobre `db.js`
**Verificação:** abrir `tests.html` (tudo verde); inspecionar `localStorage` no DevTools.
**Dependências:** nenhuma
**Arquivos:** `css/style.css`, `js/db.js`, `tests.html`, `docs/dados.md`
**Tamanho:** M

### [x] Tarefa 2: Cadastro do munícipe (RF01, RN02)
**Descrição:** Tela `cadastro.html` com CPF, nome, e-mail, senha (+ telefone e bairro opcionais). Valida CPF (dígitos verificadores), impede CPF duplicado, grava `usuario` + `municipe` com senha em hash.
**Critérios de aceite:**
- [x] CPF inválido ou já cadastrado mostra erro no campo
- [x] Cadastro válido grava nas duas tabelas e leva ao login
- [x] Senha nunca é gravada em texto puro
**Verificação:** testes de CPF em `tests.html`; cadastro manual + inspeção do `localStorage`.
**Dependências:** 1
**Arquivos:** `cadastro.html`, `js/cadastro.js`, `js/db.js`, `tests.html`
**Tamanho:** S

### [x] Tarefa 3: Login por CPF, sessão e logout (RF02)
**Descrição:** `index.html` com CPF + senha, `js/auth.js` com sessão em `sessionStorage`, guarda de página (munícipe → `home.html`, servidor → `servidor.html`) e botão sair.
**Critérios de aceite:**
- [x] Credencial errada mostra mensagem genérica
- [x] Abrir `home.html` sem sessão volta para o login
- [x] Servidor é levado ao painel; munícipe à home
**Verificação:** fluxo manual com munícipe e servidor de demonstração.
**Dependências:** 2
**Arquivos:** `index.html`, `js/auth.js`, `js/login.js`
**Tamanho:** S

### Checkpoint 1
- [x] `tests.html` verde (rodado via `npm test`)
- [x] Cadastro → login → logout funciona
- [x] Revisão com o usuário antes de seguir (usuário mandou continuar)

---

## Fase 2: Fluxo do munícipe

### [x] Tarefa 4: Home com "Suas entradas" e menu de serviços (RF03, RF04, RN03)
**Descrição:** `home.html` lista os registros do munícipe logado (título + badge de status), mostra as categorias do menu de serviços e o botão "+".
**Critérios de aceite:**
- [x] Só aparecem registros do próprio munícipe
- [x] Lista vazia mostra mensagem convidando a criar o primeiro registro
- [x] Clicar numa categoria abre `registrar.html` com ela já escolhida; clicar num registro abre os detalhes
**Verificação:** teste de isolamento em `tests.html`; manual com dois munícipes.
**Dependências:** 3
**Arquivos:** `home.html`, `js/home.js`
**Tamanho:** S

### [x] Tarefa 5: Novo registro com urgência e protocolo (RF05, RF06, RF08, RN01, RN04)
**Descrição:** `registrar.html` com categoria, identificação, descrição, localização e grau de urgência (baixo/médio/alto). Ao enviar, grava `registro` com status "Aguardando", gera protocolo único, grava o primeiro `historico_status` e mostra a confirmação com o número.
**Critérios de aceite:**
- [x] Campos obrigatórios validados antes de gravar
- [x] Protocolo único no formato `ANO` + 6 dígitos
- [x] Após enviar, aparece o protocolo e o registro está na home
**Verificação:** teste de protocolo em `tests.html`; manual.
**Dependências:** 4
**Arquivos:** `registrar.html`, `js/registrar.js`, `js/db.js`, `tests.html`
**Tamanho:** M

### [x] Tarefa 6: Anexar fotos ao registro (RF07, RNF08)
**Descrição:** Campo de uma ou mais fotos no registrar, com pré-visualização; imagens reduzidas via `<canvas>` e gravadas na tabela `foto`.
**Critérios de aceite:**
- [x] Aceita só imagens; mostra miniatura antes de enviar
- [x] Falta de espaço no `localStorage` mostra erro e não perde o registro em texto
**Verificação:** manual com 1 e com várias fotos grandes.
**Dependências:** 5
**Arquivos:** `registrar.html`, `js/registrar.js`, `js/db.js`
**Tamanho:** S

### [x] Tarefa 7: Detalhes do registro (RF09)
**Descrição:** `detalhes.html?id=N` mostra protocolo, categoria, identificação, descrição, endereço, urgência, status, fotos e histórico.
**Critérios de aceite:**
- [x] Munícipe não abre registro de outro munícipe (RN03): mostra "não encontrado"
- [x] Histórico em ordem cronológica
**Verificação:** manual, trocando o `id` na URL.
**Dependências:** 5
**Arquivos:** `detalhes.html`, `js/detalhes.js`
**Tamanho:** S

### Checkpoint 2
- [x] Telas renderizadas com dados de exemplo (screenshot no Firefox headless)
- [ ] Fluxo do diagrama de atividades (login → home → categoria → dados → urgência → foto → protocolo) clicado de ponta a ponta no navegador
- [x] `tests.html` verde (12/12 via `npm test`)
- [ ] Revisão com o usuário

---

## Fase 3: Fluxo do servidor

### [x] Tarefa 8: Painel do servidor (RF10, RN07)
**Descrição:** `servidor.html` lista os registros das categorias ligadas à secretaria do servidor logado, ordenados por urgência e data, com filtro por status.
**Critérios de aceite:**
- [x] Servidor da Secretaria de Obras não vê registros de Iluminação/Limpeza
- [x] Munícipe não acessa `servidor.html`
**Verificação:** teste em `tests.html`; manual com os dois servidores.
**Dependências:** 3, 5
**Arquivos:** `servidor.html`, `js/servidor.js`
**Tamanho:** S

### [x] Tarefa 9: Atualizar status com histórico (RF11, RF12, RN05, RN06)
**Descrição:** Nos detalhes (`detalhes.html`, que o servidor também abre), o servidor muda o status (aguardando / em andamento / concluído) com observação opcional; cada mudança grava `historico_status` com status anterior, novo, servidor e data.
**Critérios de aceite:**
- [x] Só servidor consegue alterar (função em `db.js` recusa outro perfil)
- [x] Toda alteração gera uma linha de histórico
- [x] O munícipe vê o novo status na home e no detalhe
**Verificação:** teste de histórico em `tests.html`; manual ponta a ponta.
**Dependências:** 7, 8
**Arquivos:** `servidor.html`, `js/servidor.js`, `detalhes.html`, `js/db.js`, `tests.html`
**Tamanho:** M

### Checkpoint 3
- [x] Munícipe abre registro → servidor atualiza → munícipe vê o status e o histórico (testes 16/16 + screenshot do formulário enviado no Firefox headless)
- [ ] Fluxo clicado no navegador pelo usuário
- [ ] Revisão com o usuário

---

## Fase 4: Acabamento

### [x] Tarefa 10: Responsividade, acessibilidade e aviso LGPD (RNF01–RNF03, RNF07)
**Descrição:** Revisar todas as telas em celular/tablet/desktop, labels e foco nos formulários, contraste, status com texto além da cor, `aria-live` nas mensagens; aviso de privacidade no cadastro.
**Critérios de aceite:**
- [x] Sem rolagem horizontal em 360 px (screenshots no Firefox headless)
- [x] Todo campo tem `<label>`; foco visível (inclusive no cabeçalho); link "Ir para o conteúdo". Navegação por teclado: conferir com a checklist (seção 9)
- [ ] Lighthouse Acessibilidade ≥ 90 em todas as páginas (sem Chrome aqui: pendente na checklist, item 9.7). Contraste calculado: todos os textos ≥ 5,3:1; borda dos campos corrigida para 4,5:1
**Verificação:** DevTools (modo responsivo + Lighthouse).
**Dependências:** 9
**Arquivos:** `css/style.css`, páginas HTML
**Tamanho:** M

### Checkpoint final
- [x] RF01–RF12 implementados e cobertos por testes automáticos das regras (16/16)
- [x] `docs/` e `CHANGELOG` atualizados
- [ ] Rodar a [checklist de testes manuais](../docs/checklist-testes.md) (80 itens)
- [ ] Pronto para apresentar

---

## Fase 5: Banco de dados (Supabase)

### [x] Tarefa 11: Schema, regras e carga no Supabase
**Descrição:** Converter o DER/SQL do documento (MySQL) para o Supabase (PostgreSQL), com as regras de negócio no banco.
**Critérios de aceite:**
- [x] 9 tabelas do DER; `usuario` ligado ao Supabase Auth; carga do Quadro 2
- [x] RLS: munícipe só vê os seus registros, servidor só os da secretaria, sem login nada (RN03, RN07)
- [x] Triggers: cadastro → usuario + municipe; protocolo; 1º histórico. Função `atualizar_status` com histórico (RN01, RN05, RN06)
- [x] Bucket privado de fotos com políticas
- [x] `sql/testes.sql` passa (verificado em PostgreSQL 16 local + esqueleto do Supabase; um teste de mutação confirmou que os testes pegam regra quebrada)
**Arquivos:** `sql/01_schema.sql`, `sql/02_dados_iniciais.sql`, `sql/03_servidores_demo.sql`, `sql/testes.sql`, `docs/dados.md`, `docs/supabase.md` (depois: `sql/04_cpf_cadastrado.sql`, Tarefa 14)
**Tamanho:** M

### [x] Tarefa 12: Site usando o Supabase
**Descrição:** Trocar o `localStorage` pelo Supabase em `js/db.js` e tornar as páginas assíncronas.
**Critérios de aceite:**
- [x] Cadastro/login pelo Supabase Auth (CPF → e-mail técnico)
- [x] Todas as telas leem e gravam no banco; fotos no Storage com links temporários
- [x] Erros de rede/config viram mensagens na tela
- [x] `js/db.js` real verificado contra PostgREST 12 local (18 verificações de ponta a ponta)
**Arquivos:** `js/config.js`, `js/db.js`, `js/auth.js`, `js/ui.js`, scripts e HTML das páginas, `js/tests.js`
**Tamanho:** L (feito em sequência com a Tarefa 11)

### [x] Tarefa 14: Login avisa "CPF não cadastrado"
**Descrição:** Mensagem em vermelho quando o CPF não tem cadastro (pedido do usuário).
**Critérios de aceite:**
- [x] CPF inválido → "CPF inválido."; CPF sem conta → "CPF não cadastrado…"; senha errada → "CPF ou senha incorretos."
- [x] Sem a função no banco, o login continua funcionando (mensagem genérica)
- [x] `npm test` e `sql/testes.sql` cobrem o caso
**Arquivos:** `sql/04_cpf_cadastrado.sql`, `js/db.js`, `js/tests.js`, `sql/testes.sql`
**Tamanho:** S

### [x] Tarefa 15: Menu de perfil e configurações da conta
**Descrição:** Trocar nome + "Sair" do cabeçalho por um ícone de perfil com menu ("Configurações da conta"); a página da conta mostra os dados e tem o botão de sair (pedido do usuário).
**Critérios de aceite:**
- [x] Ícone de perfil em todas as páginas logadas; menu com o nome e o link; fecha com Esc, clique fora ou Tab
- [x] `conta.html` com os dados do perfil (munícipe/servidor) e "SAIR DA CONTA"
- [x] `DB.minhaConta` verificada contra PostgREST local; telas conferidas por screenshot (menu aberto, 360 px)
**Arquivos:** `conta.html`, `js/conta.js`, `js/auth.js`, `js/db.js`, `css/style.css`, `home.html`, `registrar.html`, `detalhes.html`, `servidor.html`
**Tamanho:** M

### [x] Tarefa 16: Conta com barra lateral e páginas sem rolagem sobrando
**Descrição:** Funcionalidades da conta numa barra lateral; corrigir páginas que rolavam sem ter conteúdo (pedido do usuário).
**Critérios de aceite:**
- [x] `conta.html` com barra lateral (abas no celular): "Dados da conta" e "Sessão"; endereço guarda a seção
- [x] Sem rolagem quando o conteúdo cabe (medido a 360×640 e 1280×720: conta/Sessão, home, painel sem rolagem)
- [x] Regra registrada no CLAUDE.md para as próximas funcionalidades
**Arquivos:** `conta.html`, `js/conta.js`, `css/style.css`, `CLAUDE.md`
**Tamanho:** S

### [x] Tarefa 17: Layout para computador
**Descrição:** As telas pareciam um app de celular esticado no computador; criar um layout próprio a partir de 1024 px, mantendo o celular igual ao protótipo (pedido do usuário).
**Critérios de aceite:**
- [x] Cabeçalho com marca + navegação por perfil; rodapé
- [x] Login/cadastro em tela dividida; home, detalhes e formulários em colunas; painel em tabela
- [x] Celular sem mudanças visuais em relação ao protótipo (conferido por screenshot a 360 px e 800 px)
**Arquivos:** todas as páginas HTML, `css/style.css`, `js/auth.js`, `js/home.js`, `js/servidor.js`, `js/detalhes.js`
**Tamanho:** L

### [ ] Tarefa 13: Configurar o projeto Supabase do grupo e conferir
**Descrição:** Seguir `docs/supabase.md` no projeto real e rodar a checklist.
**Critérios de aceite:**
- [x] `js/config.js` preenchido com o projeto do grupo
- [x] "Confirm email" desligado (conferido pela API em 2026-11-13)
- [x] `sql/01` e `sql/04` aplicados (conferido pela API)
- [ ] `sql/testes.sql` passa no Supabase
- [ ] Cadastro, login e envio de foto funcionam no Supabase real (Auth e Storage não puderam ser testados localmente)
- [ ] Checklist manual completa
**Dependências:** 11, 12

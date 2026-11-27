# Testes

## 1. Regras do banco: [sql/testes.sql](../sql/testes.sql)
Rodar no **SQL Editor do Supabase** (depois de `01`, `02`, `04` e `06`). Roda numa transação desfeita no fim, então não deixa dados. Deve terminar com **"TODOS OS TESTES PASSARAM"**; se uma regra falhar, o script para com a mensagem dela.

Cobre:
- Cadastro: cria usuario + municipe; recusa CPF inválido e duplicado; `promover_servidor` cria servidor
- Novo registro: protocolo (ano + 6 dígitos), status forçado para Aguardando, 1º histórico, urgência padrão; recusa registro em nome de outro, urgência inválida, título vazio
- Fotos: só na própria pasta e no próprio registro
- RN03: munícipe B não vê registro, foto nem histórico de A
- RN07: cada servidor vê só a sua secretaria
- Status: grava o histórico completo (de/para, servidor, observação); recusa munícipe, outra secretaria, status inválido ou repetido; UPDATE direto não muda nada
- Exportação: servidor recebe tudo, inclusive a outra secretaria, munícipes (CPF formatado) e servidores, histórico, fotos e secretarias; munícipe recebe `42501`; sem login não executa
- `promover_servidor` não pode ser chamada por usuário logado; sem login não se vê nada, mas `cpf_cadastrado` responde (sim/não)

## 2. Funções do navegador: `npm test`
Roda [js/tests.js](../js/tests.js) no Node, sem Supabase: validação e máscara de CPF, `gerarCSV` (BOM, `;`, aspas, quebra de linha, anti-fórmula, seção vazia) e as validações de formulário de `cadastrarMunicipe`/`criarRegistro`/`entrar` (que falham antes de chamar o banco).

Inclui um teste de regressão que carrega `js/config.js` + `js/db.js` no mesmo escopo, como scripts clássicos no navegador, e confere que o cliente Supabase é criado com a URL e a chave do `config.js`. Ele existe por causa de um bug real: o `db.js` lia `globalThis.AGILIZA_CONFIG`, que não existe no navegador.

## 3. Telas: [checklist de testes manuais](checklist-testes.md)

## Exportação (2026-11-26)
- PostgreSQL 16 local (Podman) com o esqueleto do Supabase: `01, 02, 04, 06, 06` (de novo), `03, 05` e `testes.sql` passando. Teste de mutação: tirando a trava de servidor da função, o `testes.sql` falha ("deveria falhar").
- O JSON real (5 usuários, 14 registros, 28 históricos) passou pelo `gerarCSV` e foi lido de volta pelo leitor de CSV do Python (`;`, BOM): 7 blocos, acentos e CPF certos.
- Tela conferida por screenshot (Firefox headless, login e banco simulados) a 1280 e 360 px como servidor, e como munícipe abrindo `#exportar`.
- **Não verificados:** a RPC pelo Supabase real, o download no navegador e a visualização de impressão (checklist 2.8c–2.8e).

## Dados de demonstração (2026-11-26)
- `sql/05_ocorrencias_demo.sql` verificado no mesmo esqueleto local (Podman, PostgreSQL 16): 14 registros (5/4/5 por status), histórico com servidor em toda mudança, nenhuma data de atualização antes da abertura ou no futuro; rodar duas vezes não duplica.
- `testes.sql` passa com e sem o `03` e o `05` no banco. Antes, ele usava os mesmos CPFs do `03` e falhava ("duplicate key ... usuario_cpf_key") em qualquer banco onde os servidores de demonstração já existiam (como o Supabase do grupo); os CPFs dos servidores de teste foram trocados.

## Como isto foi verificado (2026-11-13)
Sem acesso a um projeto Supabase, a verificação foi feita localmente com Podman:
- PostgreSQL 16 + um esqueleto mínimo do Supabase (roles `anon`/`authenticated`, `auth.users`, `auth.uid()`, `storage.objects`): `01`, `02`, `03`, `04` (inclusive rodado duas vezes) e `testes.sql` rodaram sem erro. Também foi feita uma checagem estragando de propósito uma regra RLS, e o teste acusou a falha.
- PostgREST 12 (o motor da API do Supabase) sobre esse banco: o `js/db.js` real rodou 18 verificações de ponta a ponta (consultas, RPC e RLS por token).
- **Não verificados localmente:** o Supabase Auth de verdade (signUp/login) e o Storage de verdade (upload/política do bucket). Confira com a checklist depois de configurar o projeto.

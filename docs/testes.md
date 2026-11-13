# Testes

## 1. Regras do banco: [sql/testes.sql](../sql/testes.sql)
Rodar no **SQL Editor do Supabase** (depois de `01`, `02` e `04`). Roda numa transação desfeita no fim, então não deixa dados. Deve terminar com **"TODOS OS TESTES PASSARAM"**; se uma regra falhar, o script para com a mensagem dela.

Cobre:
- Cadastro: cria usuario + municipe; recusa CPF inválido e duplicado; `promover_servidor` cria servidor
- Novo registro: protocolo (ano + 6 dígitos), status forçado para Aguardando, 1º histórico, urgência padrão; recusa registro em nome de outro, urgência inválida, título vazio
- Fotos: só na própria pasta e no próprio registro
- RN03: munícipe B não vê registro, foto nem histórico de A
- RN07: cada servidor vê só a sua secretaria
- Status: grava o histórico completo (de/para, servidor, observação); recusa munícipe, outra secretaria, status inválido ou repetido; UPDATE direto não muda nada
- `promover_servidor` não pode ser chamada por usuário logado; sem login não se vê nada, mas `cpf_cadastrado` responde (sim/não)

## 2. Funções do navegador: `npm test`
Roda [js/tests.js](../js/tests.js) no Node, sem Supabase: validação e máscara de CPF e as validações de formulário de `cadastrarMunicipe`/`criarRegistro`/`entrar` (que falham antes de chamar o banco).

## 3. Telas: [checklist de testes manuais](checklist-testes.md)

## Como isto foi verificado (2026-11-13)
Sem acesso a um projeto Supabase, a verificação foi feita localmente com Podman:
- PostgreSQL 16 + um esqueleto mínimo do Supabase (roles `anon`/`authenticated`, `auth.users`, `auth.uid()`, `storage.objects`): `01`, `02`, `03`, `04` (inclusive rodado duas vezes) e `testes.sql` rodaram sem erro. Também foi feita uma checagem estragando de propósito uma regra RLS, e o teste acusou a falha.
- PostgREST 12 (o motor da API do Supabase) sobre esse banco: o `js/db.js` real rodou 18 verificações de ponta a ponta (consultas, RPC e RLS por token).
- **Não verificados localmente:** o Supabase Auth de verdade (signUp/login) e o Storage de verdade (upload/política do bucket). Confira com a checklist depois de configurar o projeto.

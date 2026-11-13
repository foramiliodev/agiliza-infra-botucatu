# Agiliza Infraestrutura Botucatu

Site onde o munícipe de Botucatu registra ocorrências de infraestrutura urbana (buracos, iluminação, limpeza) e acompanha o status; o servidor da prefeitura atende e atualiza o status. Fonte dos requisitos: documento `Agiliza_InfBotucatu_P1.pdf` (FATEC ADS, 2026), resumido em [tasks/plan.md](tasks/plan.md).

## Stack

- HTML, CSS e JavaScript puros. Sem framework, sem build. O npm serve só para rodar o servidor de teste e os testes (`package.json`), sem dependências instaladas.
- Banco: **Supabase** (PostgreSQL + Auth + Storage), acessado direto do navegador com `supabase-js` via CDN. Não há backend próprio: as regras ficam no banco (RLS, triggers, funções) em `sql/`. Configuração: `js/config.js` e `docs/supabase.md`.
- Toda mudança de regra de negócio vai para o SQL (e para `sql/testes.sql`); `js/db.js` só valida para dar mensagens melhores.
- Rodar: `npm start` (http-server em http://localhost:8000, sem cache, abre o navegador). Testes: `npm test`. Usar sempre `localhost` (pelo IP da rede o cadastro/login não funcionam: `crypto.subtle` exige contexto seguro).

## Regra de documentação (obrigatória)

Tudo que fizermos deve ficar registrado em `.md` para preservar o contexto entre sessões. Em **toda** alteração:

1. **Antes de começar**, ler `tasks/plan.md`, `tasks/todo.md` e o `.md` da área que será alterada.
2. **Ao terminar**, no mesmo trabalho:
   - marcar a tarefa em `tasks/todo.md` (e anotar o que ficou pendente, se ficou);
   - adicionar uma entrada em `docs/CHANGELOG.md` (data, o que mudou, arquivos, requisitos RF/RNF/RN atendidos);
   - criar ou atualizar o `.md` da área tocada em `docs/` (ex.: `docs/dados.md` para tabelas/regras do banco, `docs/supabase.md` para configuração, `docs/telas.md` para páginas, `docs/decisoes.md` para decisões e atalhos assumidos);
   - se uma decisão do plano mudou, atualizar `tasks/plan.md`.
3. Documentação desatualizada conta como tarefa não concluída.

## Convenções

- Idioma do código, comentários e docs: português (nomes como no DER: `registro`, `municipe`, `grau_urgencia`...).
- Atalhos conhecidos levam o comentário `// shortcut: <limite>, <quando trocar>`.

# Decisões e atalhos

| Data | Decisão | Por quê | Quando rever |
|---|---|---|---|
| 2026-11-13 | ~~Sem backend; dados no `localStorage`~~ **Substituída pelo Supabase** | Pedido: HTML/CSS/JS puros | Feito: só `js/db.js` e as páginas (async) mudaram |
| 2026-11-13 | Login com CPF + senha | RF01 tem senha; diagrama de sequência usa CPF e senha | — |
| 2026-11-13 | ~~Senha com SHA-256 sem salt, no cliente~~ **Substituída**: senha no Supabase Auth (bcrypt) | — | — |
| 2026-11-13 | Sessão em `sessionStorage` (por aba) | Fecha a aba, sai | — |
| 2026-11-13 | Servidores fixos de demonstração, sem tela de cadastro | Aprovado pelo usuário | Se precisar gerenciar servidores |
| 2026-11-13 | Brasão oficial em `img/brasao.png` (substituiu o provisório) | Enviado pelo usuário | — |
| 2026-11-13 | "Vazamentos" fora das categorias | Aprovado pelo usuário | Se o grupo pedir |
| 2026-11-13 | Scripts clássicos com objetos globais (`DB`, `Auth`), sem módulos ES | Mais simples; permite rodar os testes no Node | — |
| 2026-11-13 | Servidor de teste via `npm start` (`npx http-server@14.1.1`, versão fixa) | Pedido do usuário; `npx` evita `node_modules` | Se precisar de live reload |
| 2026-11-13 | Fotos reduzidas no navegador (1024 px, JPEG 70%), até 5. ~~Data URL na tabela~~ Agora no Storage (bucket privado `fotos`, até 2 MB, só JPEG) | Envio rápido em rede móvel (RNF04) | — |
| 2026-11-13 | Protocolo = ano + id com 6 dígitos (ex.: 2026000012) | Único sem lógica extra (RN01) | Se precisar de protocolo por secretaria |
| 2026-11-13 | Conteúdo dinâmico sempre via `textContent` (`UI.el`), nunca `innerHTML` | Evita XSS com texto digitado pelo munícipe | — |
| 2026-11-13 | Menu de serviços na home leva ao formulário com a categoria escolhida | Segue o diagrama de atividades (escolher categoria → preencher) sem tela extra | — |
| 2026-11-13 | Servidor muda o status em `detalhes.html` (mesma página do munícipe, com formulário extra) | Evita uma tela duplicada; a regra de acesso fica em `DB.podeVer` | — |
| 2026-11-13 | Status pode ir e voltar livremente (ex.: Concluído → Em andamento); só não aceita repetir o atual | O documento não define transições; o histórico registra tudo | Se o grupo definir um fluxo obrigatório |
| 2026-11-13 | Lighthouse não rodado (sem Chrome no ambiente); contraste calculado e telas conferidas por screenshot | Ferramenta indisponível | Rodar o item 9.7 da checklist |
| 2026-11-13 | Banco no **Supabase** (escolha do usuário), acessado direto do navegador | Mantém o site em HTML/CSS/JS puros, sem servidor próprio; PostgreSQL próximo do MySQL do documento | — |
| 2026-11-13 | Regras de negócio no banco (RLS, triggers, `atualizar_status`); o navegador só valida para dar mensagens | Quem tem a chave anon consegue chamar a API direto, então a regra precisa estar no banco | — |
| 2026-11-13 | Login por CPF usando o e-mail técnico `<cpf>@DOMINIO_EMAIL` no Supabase Auth, com "Confirm email" desligado | O Auth exige e-mail; o documento pede login por CPF | Se quiserem recuperar senha por e-mail: usar o e-mail real no Auth |
| 2026-11-13 | Cadastro cria `usuario` + `municipe` por trigger em `auth.users`; servidor só via `promover_servidor` no SQL Editor | O tipo de usuário nunca vem do navegador | Se precisarem de tela de admin |
| 2026-11-13 | `usuario.id` = uuid do Auth; sem `senha_hash`; ENUM → CHECK; status com id fixo | Adaptação do MySQL do documento ao Supabase | — |
| 2026-11-13 | Bucket de fotos privado com links temporários (1 h) | LGPD: fotos podem mostrar pessoas/casas | — |
| 2026-11-13 | Sessão por aba (`sessionStorage`) também no Supabase | Mantém o comportamento do protótipo | Se quiserem "lembrar de mim" |
| 2026-11-13 | Login avisa "CPF não cadastrado" (pedido do usuário), via função `cpf_cadastrado` liberada sem login | Mensagem mais clara para o munícipe. Custo: qualquer pessoa consegue descobrir se um CPF tem conta (sem ver nenhum outro dado). Substitui a mensagem genérica | Se a prefeitura exigir não revelar contas: voltar à mensagem genérica |

## Limites conhecidos
- Precisa de internet (Supabase na nuvem) e de um projeto configurado (docs/supabase.md).
- Cadastro e login precisam de contexto seguro (`localhost` ou HTTPS), por causa do Supabase Auth no navegador.
- Sem recuperação de senha (o e-mail do Auth é técnico).
- No plano gratuito, o Supabase pausa projetos parados por ~1 semana: reative no painel antes da apresentação.

# Agiliza Infraestrutura Botucatu

Site onde o munícipe de Botucatu (SP) registra ocorrências de infraestrutura urbana (buracos, iluminação pública, limpeza urbana), recebe um número de protocolo e acompanha o status do atendimento. O servidor da prefeitura lista os registros da sua secretaria e atualiza o status.

Projeto do curso de Análise e Desenvolvimento de Sistemas da FATEC Botucatu (2º ciclo, 2026). Os requisitos, diagramas e protótipo estão no documento `Agiliza_InfBotucatu_P1.pdf`.

**Grupo:** Gabriel Foramilho, Isabelle Olindo Dias, Mirella Castilho Simião da Silva, Fernanda Cristina da Silva Sonsino, Matheus Henrry Rodrigues de Morais. **Orientador:** José Benedito.

## Como rodar

Precisa do [Node.js](https://nodejs.org) (para o `npm`).

```bash
npm start   # abre http://localhost:8000
npm test    # roda os testes no terminal
```

Não precisa de `npm install`. O `js/config.js` já aponta para o projeto Supabase do grupo. Para montar o banco do zero (ou usar outro projeto), siga **[docs/supabase.md](docs/supabase.md)**. Ordem dos SQL no SQL Editor:

1. `sql/01_schema.sql`: tabelas, regras (RLS), triggers e bucket de fotos
2. `sql/02_dados_iniciais.sql`: status, secretarias e categorias
3. `sql/04_cpf_cadastrado.sql`: aviso de "CPF não cadastrado" no login
4. `sql/03_servidores_demo.sql`: cria as contas dos servidores de demonstração (abaixo)
5. `sql/05_ocorrencias_demo.sql` *(opcional)*: munícipes e ocorrências de demonstração para popular o banco
6. `sql/testes.sql` *(opcional)*: confere as regras e não grava nada

## Como usar

- Depois de entrar, o **ícone de perfil** no canto do cabeçalho abre o menu com "Configurações da conta", com os dados, e o botão **Sair** (também embaixo dos dados na conta).
- `npm start` abre a **landing page**; "Entrar" (no topo) leva ao login e "Registrar ocorrência" ao cadastro.
- **Munícipe:** clique em "Cadastre-se", crie a conta com um CPF válido e entre. No login, o site avisa em vermelho se o CPF é inválido, se não está cadastrado ou se a senha está errada.
- **Servidor (demonstração):** rode `sql/03_servidores_demo.sql` no SQL Editor (ver docs/supabase.md).

  | Secretaria | CPF | Senha |
  |---|---|---|
  | Obras | 529.982.247-25 | `servidor123` |
  | Serviços Públicos | 111.444.777-35 | `servidor123` |

- **Munícipes com ocorrências (demonstração):** rode `sql/05_ocorrencias_demo.sql` (14 registros com status e histórico variados).

  | Munícipe | CPF | Senha |
  |---|---|---|
  | Maria Aparecida Souza (5 ocorrências) | 123.456.789-09 | `municipe123` |
  | João Carlos Pereira (5 ocorrências) | 987.654.321-00 | `municipe123` |
  | Ana Beatriz Lima (4 ocorrências) | 246.813.579-28 | `municipe123` |

## Tecnologias

HTML, CSS e JavaScript puros, sem framework e sem build. Banco de dados no **[Supabase](https://supabase.com)** (PostgreSQL), com as tabelas do DER do documento:

- **Auth:** login por CPF + senha (bcrypt, no Supabase); aviso de "CPF não cadastrado" pela função `cpf_cadastrado`.
- **RLS:** o munícipe só vê os próprios registros; o servidor, só os da sua secretaria.
- **Triggers:** protocolo e histórico gerados pelo banco.
- **Storage:** fotos num bucket privado.

O site fala direto com o Supabase pelo navegador (`supabase-js`), sem servidor próprio.

No celular, as telas seguem o protótipo do documento; no computador (a partir de 1024 px) o layout aproveita a largura: cabeçalho com menu, telas em duas colunas e o painel do servidor em tabela.

## Estrutura

```
index.html        landing page pública (apresenta o serviço; links para cadastro e login)
login.html        login (CPF + senha)
cadastro.html     cadastro do munícipe
home.html         "Suas entradas" + menu de serviços
registrar.html    novo registro (urgência, fotos, protocolo)
detalhes.html     detalhes e histórico do registro
servidor.html     painel do servidor
conta.html        configurações da conta (barra lateral: dados + sair)
termos.html       termos de uso (pública, sem JS)
css/style.css     estilo (identidade do protótipo)
js/config.js      URL e chave pública do projeto Supabase
js/db.js          acesso ao banco (Supabase)
js/auth.js        sessão e proteção das páginas
js/ui.js          helpers de interface
js/<página>.js    script de cada página
img/brasao.png    brasão de Botucatu
sql/              banco: 01_schema, 02_dados_iniciais, 03_servidores_demo, 04_cpf_cadastrado, 05_ocorrencias_demo, testes
docs/             documentação técnica
tasks/            plano e lista de tarefas
```

## Documentação

- [tasks/plan.md](tasks/plan.md): plano, decisões de arquitetura e riscos
- [tasks/todo.md](tasks/todo.md): tarefas e o que já foi feito
- [docs/CHANGELOG.md](docs/CHANGELOG.md): histórico de mudanças
- [docs/supabase.md](docs/supabase.md): como configurar o banco
- [docs/dados.md](docs/dados.md): tabelas, regras do banco e funções do `DB`
- [docs/telas.md](docs/telas.md): telas
- [docs/decisoes.md](docs/decisoes.md): decisões e atalhos assumidos
- [docs/testes.md](docs/testes.md): como rodar e o que os testes cobrem
- [docs/checklist-testes.md](docs/checklist-testes.md): checklist de testes manuais no navegador (85 itens)

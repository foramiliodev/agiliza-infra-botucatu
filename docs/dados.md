# Dados (Supabase / PostgreSQL)

Banco: [sql/01_schema.sql](../sql/01_schema.sql) (estrutura e regras), [sql/02_dados_iniciais.sql](../sql/02_dados_iniciais.sql) (carga do Quadro 2) , [sql/04_cpf_cadastrado.sql](../sql/04_cpf_cadastrado.sql) (aviso de CPF não cadastrado) e [sql/06_exportar.sql](../sql/06_exportar.sql) (exportação para o servidor). Dados de demonstração: [sql/03_servidores_demo.sql](../sql/03_servidores_demo.sql) (servidores) e [sql/05_ocorrencias_demo.sql](../sql/05_ocorrencias_demo.sql) (3 munícipes + 14 registros com histórico; insere direto como administrador, ajustando status e datas que os triggers não deixam o site escolher).
Acesso pelo site: [js/db.js](../js/db.js). Como configurar: [supabase.md](supabase.md).

## Tabelas (DER do documento)

| Tabela | Chave | Observação |
|---|---|---|
| `usuario` | `id uuid` = `auth.users.id` | Supertipo: cpf (único, validado), nome, e_mail, tipo_usuario (`MUNICIPE`/`SERVIDOR`), data_cadastro |
| `municipe` | `usuario_id` | Subtipo: telefone, bairro |
| `servidor` | `usuario_id` | Subtipo: matricula, cargo, perfil_acesso, secretaria_id |
| `secretaria` | `id` | nome, sigla |
| `categoria_servico` | `id` | Menu de serviços; ligada a uma secretaria (RN07) |
| `status_registro` | `id` fixo | 1 Aguardando, 2 Em andamento, 3 Concluído |
| `registro` | `id` | Ocorrência; numero_protocolo gerado pelo banco |
| `foto` | `id` | caminho_arquivo = caminho no bucket `fotos` do Storage |
| `historico_status` | `id` | Trilha de auditoria (quem, quando, de/para, observação) |

### Diferenças em relação ao SQL do documento (MySQL)
- `usuario.id` é o `uuid` do Supabase Auth, e **não existe `senha_hash`**: a senha fica no Auth, com bcrypt (RNF06).
- `ENUM` virou `CHECK`; `AUTO_INCREMENT` virou `identity`; `DATETIME` virou `timestamptz`.
- `status_registro.id` é fixo (sem identity), porque o código usa 1/2/3.
- Checks extras: CPF válido (`cpf_valido`), textos obrigatórios não podem ser só espaços.

## Regras no banco

**Triggers**
- `ao_criar_usuario_auth` (em `auth.users`): todo cadastro vira `usuario` + `municipe`, com os dados do signUp. O tipo nunca vem do navegador.
- `antes_inserir_registro`: força status 1 e as datas, e gera o protocolo `ANO` + id com 6 dígitos (RN01).
- `apos_inserir_registro`: grava a primeira linha do histórico.

**Funções**
- `atualizar_status(registro, status, observacao)`: chamada pelo site (RPC). Só o servidor da secretaria do registro; recusa status inválido ou repetido (SQLSTATE `22023`); grava o histórico com `servidor_id = auth.uid()`. RF11, RF12, RN05, RN06.
- `promover_servidor(cpf, matricula, cargo, secretaria_id)`: só pelo SQL Editor (o site não tem permissão).
- `cpf_cadastrado(cpf)` ([sql/04_cpf_cadastrado.sql](../sql/04_cpf_cadastrado.sql)): diz só se o CPF tem conta; liberada também sem login, para a tela de login.
- `exportar_dados()` ([sql/06_exportar.sql](../sql/06_exportar.sql)): botão "Exportar dados" da conta do servidor (pedido do professor). Só servidor (munícipe: SQLSTATE `42501`; anon sem `execute`). Passa por cima da RLS de propósito: devolve um JSON com **tudo** de todas as secretarias, uma lista por seção (Usuários, Registros, Histórico de status, Fotos, Serviços, Secretarias), com os nomes das colunas já prontos para o cabeçalho do CSV, datas em `DD/MM/AAAA HH:MM` (Brasília) e CPF com máscara. Não lê `auth.users` (senhas não saem). Auxiliares: `formatar_data`, `formatar_cpf`.
- `minha_secretaria()`: auxiliar das regras RLS.
- `cpf_valido(cpf)`: dígitos verificadores.

**RLS (quem vê o quê)**

| Tabela | Ler | Gravar pelo site |
|---|---|---|
| usuario, municipe, servidor | só o próprio | não (trigger/função) |
| secretaria, categoria_servico, status_registro | qualquer logado | não |
| registro | munícipe: os seus; servidor: os da sua secretaria | munícipe insere em nome próprio |
| foto | quem vê o registro | munícipe, no próprio registro, na própria pasta |
| historico_status | quem vê o registro | não (triggers/`atualizar_status`) |
| Storage `fotos` (privado, só JPEG, até 2 MB) | quem vê a linha em `foto` | munícipe, na pasta `<uid>/` |

Sem login (anon), nada é visível. Exceção à tabela acima: `exportar_dados()` entrega tudo a qualquer servidor. Ninguém altera um registro com UPDATE direto: o status só muda por `atualizar_status`.

## Funções de `DB` (js/db.js)

Todas async, menos as utilitárias de CPF.

| Função | O que faz | Requisito |
|---|---|---|
| `validarCPF`, `formatarCPF`, `somenteDigitos` | Utilitários de CPF | RF01 |
| `cadastrarMunicipe(dados)` | Valida e chama `auth.signUp` (o trigger cria usuario + municipe); depois sai | RF01, RN02 |
| `entrar(cpf, senha)` | Recusa CPF inválido; `signInWithPassword` com `<cpf>@DOMINIO_EMAIL`; devolve o perfil, `null` (senha errada) ou lança "CPF não cadastrado" (consulta `cpf_cadastrado`) | RF02 |
| `sair()`, `usuarioAtual()` | Sessão (por aba: `sessionStorage`) e perfil da tabela `usuario` | RF02 |
| `minhaConta(usuario)` | Dados da própria conta + `detalhe` (municipe: telefone/bairro; servidor: matrícula/cargo/secretaria) | — |
| `categorias()`, `listaStatus()` | Tabelas de domínio | RF04 |
| `registrosDoMunicipe(id)` | Lista com `.status` | RF03, RN03 |
| `criarRegistro(municipe_id, dados)` | Valida e insere; o banco gera protocolo/status/histórico | RF05, RF06, RF08 |
| `adicionarFoto(registro, blob)` | Envia ao Storage e grava em `foto` | RF07, RNF08 |
| `detalhesRegistro(id)` | Registro + categoria, status, fotos (links temporários de 1 h) e histórico; `null` se não puder ver | RF09 |
| `perfilServidor(id)` | Secretaria do servidor | RF10 |
| `registrosDaSecretaria(secretaria_id)` | Lista ordenada (abertos → urgência → antigos) | RF10 |
| `atualizarStatus(id, status, obs)` | RPC `atualizar_status`; erro de formulário vira `ErroCampo('status_id')` | RF11, RF12 |
| `exportarDados()` | RPC `exportar_dados`; munícipe recebe "Somente servidores podem exportar os dados." | — |
| `gerarCSV(secoes)` | Pura: CSV para Excel pt-BR (BOM UTF-8, `;`, CRLF), um bloco por seção (título, cabeçalho, linhas; vazia = "(sem dados)"); escapa aspas/`;`/quebras e põe `'` antes de célula que começa com `= + - @` (CSV injection) | — |

Erros de validação lançam `ErroCampo(campo, mensagem)`; os demais lançam `Error` com mensagem para o usuário (o detalhe técnico vai para o console).

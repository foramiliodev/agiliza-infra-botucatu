# Configurar o Supabase

Passo a passo para ligar o site ao banco. Feito uma vez por projeto Supabase.

## 1. Criar o projeto
1. Entre em [supabase.com](https://supabase.com) → **New project**. Região sugerida: South America (São Paulo).
2. Guarde a senha do banco num lugar seguro (o site não usa essa senha).

## 2. Ajustar o login (Authentication)
Em **Authentication → Sign In / Providers → Email**:
- **Enable Email provider**: ligado.
- **Confirm email**: **desligado**. O login é por CPF e cada conta usa um e-mail técnico (`<cpf>@agiliza-botucatu.com.br`) que não recebe mensagens. Com a confirmação ligada, ninguém consegue entrar.
- **Minimum password length**: 6 (o padrão).

## 3. Criar as tabelas
Em **SQL Editor → New query**, cole e rode, nesta ordem:
1. [sql/01_schema.sql](../sql/01_schema.sql): tabelas, regras (RLS), triggers, função de status e bucket de fotos.
2. [sql/02_dados_iniciais.sql](../sql/02_dados_iniciais.sql): status, secretarias e categorias.
3. [sql/04_cpf_cadastrado.sql](../sql/04_cpf_cadastrado.sql): função que o login usa para avisar "CPF não cadastrado". **Se você já rodou o 01 e o 02, rode só este.**
4. [sql/06_exportar.sql](../sql/06_exportar.sql): função do botão "Exportar dados" da conta do servidor. **Se você já rodou os anteriores, rode só este.**
5. *(opcional)* [sql/testes.sql](../sql/testes.sql): testa as regras e desfaz tudo no fim. Deve terminar com **"TODOS OS TESTES PASSARAM"**. Pode rodar com os dados de demonstração (`03` e `05`) já no banco: os testes usam CPFs próprios.

## 4. Ligar o site ao projeto
Em **Project Settings → API** (ou **API Keys**), copie para [js/config.js](../js/config.js):
- **Project URL** → `SUPABASE_URL`
- **anon public** (ou **publishable**) → `SUPABASE_ANON_KEY`

A chave anon pode ficar no código: ela é pública por natureza e as regras RLS do banco protegem os dados.
**Nunca** use a chave `service_role`/`secret` no site.

## 5. Criar os servidores de demonstração
No SQL Editor, rode [sql/03_servidores_demo.sql](../sql/03_servidores_demo.sql). Ele cria as contas direto no Auth (CPFs `529.982.247-25` e `111.444.777-35`, senha `servidor123`) e as transforma em servidores de Obras e de Serviços Públicos. Pode rodar de novo: conta que já existe é só promovida.
Se trocar `DOMINIO_EMAIL` em `js/config.js`, troque o domínio também nesse arquivo.

Para criar outro servidor: a pessoa se cadastra pelo site e o administrador roda
`select promover_servidor('<cpf só números>', '<matrícula>', '<cargo>', <id da secretaria>);`

## 6. Popular com ocorrências de demonstração (opcional)
Depois do passo 5, rode [sql/05_ocorrencias_demo.sql](../sql/05_ocorrencias_demo.sql). Ele cria 3 munícipes de demonstração (senha `municipe123`) e 14 registros nas 3 categorias, com urgências, datas (últimos 30 dias) e status variados (5 aguardando, 4 em andamento, 5 concluídos) e o histórico de cada mudança assinado pelo servidor da secretaria. Pode rodar de novo: se as ocorrências já existem, não insere nada. Não cria fotos (elas ficam no Storage).

| Munícipe | CPF | Senha |
|---|---|---|
| Maria Aparecida Souza (5 ocorrências) | 123.456.789-09 | `municipe123` |
| João Carlos Pereira (5 ocorrências) | 987.654.321-00 | `municipe123` |
| Ana Beatriz Lima (4 ocorrências) | 246.813.579-28 | `municipe123` |

## Onde ver os dados
- **Table Editor**: as tabelas do DER (`usuario`, `registro`, `historico_status`...).
- **Authentication → Users**: as contas (e-mail técnico `<cpf>@...`). A senha fica aqui, criptografada (bcrypt).
- **Storage → fotos**: as fotos, em pastas `<id do munícipe>/<id do registro>/`.

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| "Configure o Supabase em js/config.js" | `config.js` ainda tem os valores de exemplo | Passo 4 |
| "O Supabase está exigindo confirmação de e-mail" | Confirm email ligado | Passo 2 |
| Cadastro falha com "Não foi possível concluir…" e o console mostra "Email address … is invalid" | O Supabase recusou o domínio do e-mail técnico | Troque `DOMINIO_EMAIL` em `js/config.js` por outro domínio válido (ex.: o da faculdade) |
| Cadastro falha com "Database error saving new user" no console | O trigger recusou os dados (ex.: CPF inválido que passou pelo navegador) ou o `01_schema.sql` não foi rodado | Rode o passo 3 e confira o CPF |
| Login com CPF não cadastrado mostra "CPF ou senha incorretos." em vez de "CPF não cadastrado" | `04_cpf_cadastrado.sql` não foi rodado | Passo 3 |
| "Exportar dados" mostra "Não foi possível concluir…" e o console fala de `exportar_dados` | `06_exportar.sql` não foi rodado | Passo 3 |
| Telas carregam mas sem categorias | `02_dados_iniciais.sql` não foi rodado | Passo 3 |
| `promover_servidor` diz "CPF não está cadastrado" | O CPF não foi cadastrado pelo site antes | Cadastre pelo site (ou, para os de demonstração, rode o `03` inteiro) |
| Servidor de demonstração não consegue entrar | `DOMINIO_EMAIL` em `js/config.js` diferente do domínio no `03` | Ajuste o domínio no `03`, apague o usuário em Authentication → Users e rode de novo |
| `promover_servidor` falha por chave estrangeira | Esse CPF já abriu registros como munícipe | Use outro CPF para o servidor |
| "Too many requests" ao cadastrar várias contas | Limite de cadastros por hora do Supabase | Aguarde ou aumente em Authentication → Rate Limits |

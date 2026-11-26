# Checklist de testes manuais

Para conferir o site no navegador antes de apresentar. Cada item traz o requisito do documento P1 entre parênteses.

**Preparação**
1. Projeto Supabase configurado ([supabase.md](supabase.md)): SQL `01`, `02` e `04` rodados, `js/config.js` preenchido, "Confirm email" desligado.
2. No SQL Editor, rodar `sql/testes.sql`: deve terminar com "TODOS OS TESTES PASSARAM".
3. `npm test`: deve terminar com "Todos os testes passaram."
4. `npm start`: abre `http://localhost:8000`.
5. Servidores de demonstração: rodar `sql/03_servidores_demo.sql` (cria as contas abaixo).

**Contas de demonstração**

| Perfil | CPF | Senha |
|---|---|---|
| Servidor de Obras (vê "Buracos e pavimentação") | 529.982.247-25 | `servidor123` |
| Servidor de Serviços Públicos (vê "Iluminação" e "Limpeza") | 111.444.777-35 | `servidor123` |
| Munícipe A | crie no cadastro, ex.: 390.533.447-05 | escolha |
| Munícipe B | crie no cadastro, ex.: 877.482.488-00 | escolha |

Testador: ______________ Data: ___/___/______ Navegador: ______________

## 11. Termos de uso

- [ ] **11.1** No login, o link "Termos de uso" abaixo de "Cadastre-se" abre `termos.html`, sem precisar entrar.
- [ ] **11.2** No cadastro, a frase "Ao se cadastrar, você concorda com os Termos de uso" aparece acima do botão e o link abre os termos.
- [ ] **11.3** No computador (≥ 1024 px), o rodapé de todas as páginas tem o link "Termos de uso".
- [ ] **11.4** `termos.html` a 360 px: "← TERMOS DE USO" no topo volta ao login; sem rolagem horizontal. A 1280 px: brasão no cabeçalho, card centralizado, rodapé.

---

## 1. Cadastro (RF01, RN02)

- [ ] **1.1** O CPF ganha máscara (`000.000.000-00`) enquanto você digita.
- [ ] **1.2** CPF inválido (ex.: `123.456.789-00`) → "CPF inválido." embaixo do campo, que fica com borda vermelha e recebe o foco.
- [ ] **1.3** Nome vazio ou senha com menos de 6 caracteres → o navegador não deixa enviar.
- [ ] **1.4** E-mail mal escrito (ex.: `maria@`) → o navegador não deixa enviar.
- [ ] **1.5** Cadastro válido → volta para o login com "Cadastro concluído. Entre com seu CPF e senha."
- [ ] **1.6** Cadastrar de novo o mesmo CPF → "Este CPF já está cadastrado."
- [ ] **1.7** O aviso "Privacidade (LGPD)" aparece no fim do formulário.
- [ ] **1.8** No Supabase: Authentication → Users mostra a conta `<cpf>@...`; Table Editor → `usuario` e `municipe` têm a linha nova. Nenhuma tabela tem a senha.

## 2. Login e sessão (RF02)

- [ ] **2.1** O brasão de Botucatu aparece na tela de login.
- [ ] **2.1b** Ao enviar o login ou o cadastro, o endereço do navegador **não** muda e **não** mostra CPF nem senha.
- [ ] **2.2** CPF cadastrado com senha errada → "CPF ou senha incorretos." em vermelho.
- [ ] **2.2b** CPF válido sem cadastro (ex.: 862.883.667-57) → "CPF não cadastrado. Clique em "Cadastre-se" para criar sua conta." em vermelho.
- [ ] **2.2c** CPF com dígitos errados (ex.: 123.456.789-00) → "CPF inválido." em vermelho.
- [ ] **2.3** Munícipe entra → vai para "Suas entradas".
- [ ] **2.4** Servidor entra → vai para "Registros da secretaria".
- [ ] **2.5** Ícone de perfil (canto direito do cabeçalho) → menu com o nome e "Configurações da conta".
- [ ] **2.6** "Configurações da conta" mostra os dados certos do perfil (munícipe: telefone/bairro; servidor: secretaria/matrícula/cargo) e o "←" volta para a home/painel.
- [ ] **2.7** "SAIR DA CONTA" → volta para o login; o botão Voltar do navegador não reabre a página protegida.
- [ ] **2.8** O menu fecha ao clicar fora dele e com a tecla Esc.
- [ ] **2.8b** Configurações da conta: a barra lateral (abas no celular) troca entre "Dados da conta" e "Sessão" sem pular a página; recarregar em `conta.html#sessao` abre direto em Sessão.
- [ ] **2.9** Sem estar logado, abrir `http://localhost:8000/home.html` direto → volta para o login.
- [ ] **2.10** Logado como munícipe, abrir `servidor.html` → volta para o login.
- [ ] **2.11** Logado como servidor, abrir `home.html` ou `registrar.html` → volta para o login.

## 3. Home do munícipe (RF03, RF04, RN03)

- [ ] **3.1** Conta nova → mensagem "Você ainda não tem registros…".
- [ ] **3.2** O "Menu de serviços" mostra Buracos e pavimentação, Iluminação pública e Limpeza urbana.
- [ ] **3.3** Clicar numa categoria → abre "Registrar novo" com o serviço já escolhido.
- [ ] **3.4** O botão "+" abre "Registrar novo" sem serviço escolhido.
- [ ] **3.5** Depois de criar registros, eles aparecem em barras azuis, os mais novos em cima, cada um com o status em cor **e** texto.

## 4. Novo registro (RF05, RF06, RF07, RF08, RN01, RN04)

- [ ] **4.1** Enviar com campos vazios → o navegador indica o campo obrigatório.
- [ ] **4.2** O grau de urgência oferece só Baixo, Médio e Alto (padrão: Baixo).
- [ ] **4.3** Escolher 1 foto → aparece a miniatura.
- [ ] **4.4** Escolher 3 fotos → aparecem 3 miniaturas.
- [ ] **4.5** Escolher 6 fotos → "Escolha no máximo 5 fotos." e nenhuma fica selecionada.
- [ ] **4.6** Escolher um arquivo que não é imagem (ex.: PDF) → "Envie apenas imagens."
- [ ] **4.7** Foto grande de celular (> 3 MB) → é aceita (fica reduzida).
- [ ] **4.8** Enviar → "Registro enviado" com protocolo no formato `2026000001`.
- [ ] **4.9** Criar um segundo registro → o protocolo é diferente do primeiro.
- [ ] **4.10** "Ver detalhes" abre o registro criado; "Voltar ao início" mostra o registro na lista com o status "Aguardando".
- [ ] **4.11** No Supabase: Storage → `fotos` tem as fotos em `<id do munícipe>/<id do registro>/`, e a tabela `foto` tem uma linha por foto.

## 5. Detalhes (RF09, RN03)

- [ ] **5.1** Mostra protocolo, serviço, identificação, descrição (com as quebras de linha), localização, urgência, data e status.
- [ ] **5.2** As fotos anexadas aparecem.
- [ ] **5.2a** Clicar numa foto → abre grande na mesma página, com o site esmaecido atrás; ‹ › e setas trocam; ×, Esc e clique fora fecham (celular e computador).
- [ ] **5.3** O histórico tem "Aguardando: Registro aberto pelo munícipe".
- [ ] **5.4** O "←" do cabeçalho volta para a home.
- [ ] **5.5** **Isolamento:** anote o `?id=` de um registro do Munícipe A. Entre como Munícipe B e abra `detalhes.html?id=<esse id>` → "Registro não encontrado."
- [ ] **5.6** `detalhes.html?id=99999` → "Registro não encontrado."
- [ ] **5.7** Escrever `<b>teste</b>` na descrição de um registro → aparece como texto, sem negrito.

## 6. Painel do servidor (RF10, RN07)

Antes: como munícipe, crie um registro de **Buracos** (urgência Baixo), um de **Buracos** (Alto) e um de **Iluminação**.

- [ ] **6.1** Servidor de Obras → vê os 2 de Buracos e **não** vê o de Iluminação.
- [ ] **6.2** Servidor de Serviços Públicos → vê o de Iluminação e **não** vê os de Buracos.
- [ ] **6.3** No painel de Obras, o de urgência Alta aparece antes do de urgência Baixa.
- [ ] **6.4** O filtro "Mostrar" por status filtra a lista e atualiza a contagem.
- [ ] **6.5** Filtro sem resultado → "Nenhum registro encontrado."
- [ ] **6.6** O nome da secretaria aparece embaixo do título.

## 7. Atualizar status e histórico (RF11, RF12, RN05, RN06)

- [ ] **7.1** Servidor abre um registro → aparece "Atualizar status"; o "←" volta para o painel.
- [ ] **7.2** Mudar para "Em andamento" com a observação "Equipe agendada" → "Status atualizado." e o badge muda.
- [ ] **7.3** O histórico ganha a linha "Em andamento: Equipe agendada".
- [ ] **7.4** Salvar sem mudar o status → "O registro já está com esse status." (e o histórico não ganha linha nova).
- [ ] **7.5** Mudar para "Concluído" → no painel, o registro vai para o fim da lista.
- [ ] **7.6** O servidor de outra secretaria, abrindo `detalhes.html?id=<id>` desse registro → "Registro não encontrado."
- [ ] **7.7** Entrar como o munícipe dono → a home mostra "Concluído" (verde) e os detalhes mostram o histórico completo com as observações.
- [ ] **7.8** O munícipe **não** vê o formulário "Atualizar status".

## 8. Responsividade (RNF03)

No DevTools (Ctrl+Shift+M), testar em **360 px**, **768 px** e **1280 px**:

- [ ] **8.1** Nenhuma página tem rolagem horizontal.
- [ ] **8.1b** Páginas com pouco conteúdo (home vazia, painel vazio, conta → Sessão) **não** deixam arrastar para baixo, no celular e no computador.
- [ ] **8.2** No celular, o card ocupa a largura toda e as telas seguem o protótipo (cabeçalho "PORTAL DA PREFEITURA" / "← TÍTULO", botão redondo "+").
- [ ] **8.2b** No computador (≥ 1024 px): cabeçalho com brasão, nome e menu (o link da página atual destacado); rodapé no fim da página.
- [ ] **8.2c** No computador: login/cadastro em tela dividida; home em duas colunas; novo registro e cadastro com campos lado a lado; detalhes com status/histórico à direita; painel do servidor em tabela.
- [ ] **8.2d** Em 768 px (tablet) as telas continuam no formato de celular, centralizadas, sem quebrar.
- [ ] **8.3** No celular, o menu do perfil abre inteiro dentro da tela (nome longo quebra linha).
- [ ] **8.4** Títulos longos de registro quebram linha sem empurrar o badge para fora.

## 9. Acessibilidade (RNF01, RNF02)

- [ ] **9.1** Navegar só com o teclado (Tab / Shift+Tab / Enter) faz todo o fluxo: cadastro → login → registrar → detalhes → menu do perfil → configurações → sair.
- [ ] **9.2** O foco é sempre visível, inclusive no cabeçalho azul (contorno branco).
- [ ] **9.3** O primeiro Tab em qualquer página mostra "Ir para o conteúdo"; Enter pula o cabeçalho.
- [ ] **9.4** Clicar no texto de cada rótulo (label) foca o campo correspondente.
- [ ] **9.5** O status nunca depende só da cor (o texto está sempre no badge).
- [ ] **9.6** Zoom de 200% (Ctrl +) → tudo legível, sem sobreposição.
- [ ] **9.7** Lighthouse (Chrome DevTools → Lighthouse → Acessibilidade) ≥ 90 em login, cadastro, home, registrar, detalhes e painel.
- [ ] **9.8** *(Opcional)* Leitor de tela (NVDA/Orca): os erros de formulário e o "Status atualizado." são lidos; o ícone de perfil é anunciado como "Menu da conta, recolhido/expandido".

## 10. Banco e limites (conferir que se comportam como esperado)

- [ ] **10.1** Munícipe num navegador e servidor em **outro** navegador (ou janela anônima): o servidor vê o registro e o munícipe vê a mudança de status depois de recarregar.
- [ ] **10.2** Fechar a aba e abrir o site de novo → é preciso entrar de novo (a sessão vale por aba).
- [ ] **10.3** Desligar a internet e recarregar a home → aparece uma mensagem de erro no topo (a página não fica em branco).
- [ ] **10.4** Com `js/config.js` nos valores de exemplo, tentar entrar → "Configure o Supabase em js/config.js".

---

**Resultado:** ____ de 85 itens OK. Problemas encontrados (nº do item + o que aconteceu):

- 

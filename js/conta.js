// Barra lateral: mostra só a seção escolhida (#dados...). O endereço guarda a seção, sem pular a página.
function mostrarSecao(focar) {
  // seções [data-so-servidor] ficam de fora até o login confirmar que é servidor
  const secoes = [...document.querySelectorAll('.conta-secao:not([data-so-servidor])')];
  const alvo = secoes.find(s => '#' + s.id === location.hash) ?? secoes[0];
  secoes.forEach(s => { s.hidden = s !== alvo; });
  document.querySelectorAll('.conta-menu a').forEach(a => {
    if (a.hash === '#' + alvo.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
  if (focar) alvo.focus({ preventScroll: true });
}

document.querySelectorAll('.conta-menu a').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  history.replaceState(null, '', a.hash);
  mostrarSecao(true);
}));
mostrarSecao(false);
if (location.hash) scrollTo(0, 0);

(async () => {
  const u = await Auth.exigir('MUNICIPE', 'SERVIDOR');
  if (!u) return;
  const servidor = u.tipo_usuario === 'SERVIDOR';
  document.querySelector('.topo-voltar').href = servidor ? 'servidor.html' : 'home.html';
  // Seções só de servidor: o munícipe não as vê nem por conta.html#exportar (a regra de verdade está no banco)
  document.querySelectorAll('[data-so-servidor]').forEach(e => {
    if (!servidor) return e.remove();
    e.removeAttribute('data-so-servidor');
    if (e.tagName === 'LI') e.hidden = false;
  });
  mostrarSecao(false);
  if (servidor) ligarExportacao();
  try {
    const c = await DB.minhaConta(u);
    const d = c.detalhe;
    const item = (rotulo, valor) => [UI.el('dt', {}, rotulo), UI.el('dd', {}, valor || 'Não informado')];
    document.getElementById('dados-lista').append(
      ...item('Nome', c.nome),
      ...item('CPF', DB.formatarCPF(c.cpf)),
      ...item('E-mail', c.e_mail),
      ...item('Tipo de conta', servidor ? 'Servidor da prefeitura' : 'Munícipe'),
      ...(servidor
        ? [...item('Secretaria', d.secretaria?.nome), ...item('Matrícula', d.matricula), ...item('Cargo', d.cargo)]
        : [...item('Telefone', d.telefone), ...item('Bairro', d.bairro)]),
      ...item('Cadastrado em', UI.data(c.data_cadastro)),
    );
  } catch (err) {
    UI.falhaAoCarregar(err);
  }
})();

// Exportar dados (só servidor): busca tudo no banco a cada clique, para sair sempre atualizado
function ligarExportacao() {
  const botoes = [document.getElementById('baixar-csv'), document.getElementById('imprimir-dados')];
  const erro = document.getElementById('erro-exportar');
  const comDados = acao => async () => {
    erro.textContent = '';
    botoes.forEach(b => { b.disabled = true; });
    try {
      acao(await DB.exportarDados());
    } catch (err) {
      erro.textContent = err.message;
    } finally {
      botoes.forEach(b => { b.disabled = false; });
    }
  };

  botoes[0].addEventListener('click', comDados(dados => {
    const url = URL.createObjectURL(new Blob([DB.gerarCSV(dados)], { type: 'text/csv;charset=utf-8' }));
    const hoje = new Date().toLocaleDateString('sv'); // AAAA-MM-DD
    const a = UI.el('a', { href: url, download: `agiliza-botucatu-dados-${hoje}.csv` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }));

  botoes[1].addEventListener('click', comDados(dados => {
    const area = document.getElementById('impressao');
    area.replaceChildren(UI.el('h1', {}, 'Agiliza Infraestrutura Botucatu: dados cadastrados em ' + UI.data(new Date())));
    for (const [titulo, linhas] of Object.entries(dados)) {
      area.append(UI.el('h2', {}, `${titulo} (${linhas.length})`));
      if (!linhas.length) { area.append(UI.el('p', {}, 'Sem dados.')); continue; }
      const colunas = Object.keys(linhas[0]);
      area.append(UI.el('table', {},
        UI.el('thead', {}, UI.el('tr', {}, ...colunas.map(c => UI.el('th', {}, c)))),
        UI.el('tbody', {}, ...linhas.map(l => UI.el('tr', {}, ...colunas.map(c => UI.el('td', {}, String(l[c] ?? '')))))),
      ));
    }
    document.body.classList.add('imprimindo'); // o CSS de impressão mostra só #impressao
    addEventListener('afterprint', () => {
      document.body.classList.remove('imprimindo');
      area.replaceChildren();
    }, { once: true });
    print();
  }));
}

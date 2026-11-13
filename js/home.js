(async () => {
  const u = await Auth.exigir('MUNICIPE');
  if (!u) return;
  try {
    const [registros, categorias] = await Promise.all([DB.registrosDoMunicipe(u.id), DB.categorias()]);
    document.getElementById('vazio').hidden = registros.length > 0;
    document.getElementById('entradas').append(...registros.map(r =>
      UI.el('li', {}, UI.el('a', { href: 'detalhes.html?id=' + r.id, class: 'entrada' },
        UI.el('span', { class: 'entrada-titulo' }, r.identificacao),
        UI.el('span', { class: 'entrada-data' }, UI.data(r.data_abertura)),
        UI.badge(r.status)))));

    document.getElementById('servicos').append(...categorias.map(c =>
      UI.el('li', {}, UI.el('a', { href: 'registrar.html?categoria=' + c.id, class: 'servico' },
        UI.el('strong', {}, c.nome), UI.el('span', {}, c.descricao)))));
  } catch (err) {
    UI.falhaAoCarregar(err);
  }
})();

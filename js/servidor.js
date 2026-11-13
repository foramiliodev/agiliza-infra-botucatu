const filtro = document.getElementById('filtro');
let registros = [];

function render() {
  const lista = filtro.value ? registros.filter(r => String(r.status_id) === filtro.value) : registros;
  document.getElementById('contagem').textContent =
    lista.length ? `${lista.length} registro(s)` : 'Nenhum registro encontrado.';
  document.getElementById('lista').replaceChildren(...lista.map(r =>
    UI.el('li', {}, UI.el('a', { href: 'detalhes.html?id=' + r.id, class: 'item-servidor' },
      UI.el('span', { class: 'item-titulo' }, r.identificacao),
      UI.badge(r.status),
      // celular: uma linha "protocolo · serviço · urgência · data"; computador: uma coluna para cada (display: contents)
      UI.el('span', { class: 'item-info' },
        UI.el('span', { class: 'item-protocolo' }, r.numero_protocolo),
        UI.el('span', { class: 'item-categoria' }, r.categoria.nome),
        UI.el('span', { class: 'item-urgencia' }, UI.el('span', { class: 'rotulo-celular' }, 'Urgência: '), UI.URGENCIA[r.grau_urgencia]),
        UI.el('span', { class: 'item-data' }, UI.data(r.data_abertura)))))));
}

(async () => {
  const u = await Auth.exigir('SERVIDOR');
  if (!u) return;
  try {
    const servidor = await DB.perfilServidor(u.id);
    document.getElementById('secretaria').textContent = servidor.secretaria.nome;
    const [lista, status] = await Promise.all([DB.registrosDaSecretaria(servidor.secretaria_id), DB.listaStatus()]);
    registros = lista;
    filtro.append(...status.map(s => new Option(s.nome, s.id)));
    filtro.addEventListener('change', render);
    render();
  } catch (err) {
    UI.falhaAoCarregar(err);
  }
})();

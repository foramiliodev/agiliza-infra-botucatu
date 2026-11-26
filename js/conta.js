// Barra lateral: mostra só a seção escolhida (#dados...). O endereço guarda a seção, sem pular a página.
function mostrarSecao(focar) {
  const secoes = [...document.querySelectorAll('.conta-secao')];
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

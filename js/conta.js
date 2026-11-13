(async () => {
  const u = await Auth.exigir('MUNICIPE', 'SERVIDOR');
  if (!u) return;
  const servidor = u.tipo_usuario === 'SERVIDOR';
  document.querySelector('.topo-voltar').href = servidor ? 'servidor.html' : 'home.html';
  try {
    const c = await DB.minhaConta(u);
    const d = c.detalhe;
    const item = (rotulo, valor) => [UI.el('dt', {}, rotulo), UI.el('dd', {}, valor || 'Não informado')];
    document.getElementById('dados').append(
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

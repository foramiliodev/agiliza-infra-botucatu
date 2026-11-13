// Testes das funções puras de js/db.js (rodam no Node: npm test).
// As regras de negócio estão no banco e são testadas em sql/testes.sql.
const testes = [];
const teste = (nome, fn) => testes.push([nome, fn]);
const igual = (veio, esperado) => {
  if (JSON.stringify(veio) !== JSON.stringify(esperado)) {
    throw new Error(`esperado ${JSON.stringify(esperado)}, veio ${JSON.stringify(veio)}`);
  }
};
const deveFalhar = async (fn, campo) => {
  try { await fn(); } catch (e) {
    if (campo && e.campo !== campo) throw new Error(`erro no campo "${e.campo}", esperado "${campo}"`);
    return;
  }
  throw new Error('deveria ter falhado');
};

teste('validarCPF aceita válidos e recusa inválidos', () => {
  igual(DB.validarCPF('529.982.247-25'), true);
  igual(DB.validarCPF('11144477735'), true);
  igual(DB.validarCPF('529.982.247-24'), false);
  igual(DB.validarCPF('111.111.111-11'), false);
  igual(DB.validarCPF('123'), false);
});

teste('formatarCPF aplica a máscara', () => {
  igual(DB.formatarCPF('52998224725'), '529.982.247-25');
  igual(DB.formatarCPF('5299'), '529.9');
  igual(DB.formatarCPF('529.982.247-2599'), '529.982.247-25');
});

teste('cadastro e novo registro validam os campos antes de chamar o banco', async () => {
  await deveFalhar(() => DB.cadastrarMunicipe({ cpf: '12345678900', nome: 'X', senha: '123456' }), 'cpf');
  await deveFalhar(() => DB.cadastrarMunicipe({ cpf: '39053344705', nome: ' ', senha: '123456' }), 'nome');
  await deveFalhar(() => DB.cadastrarMunicipe({ cpf: '39053344705', nome: 'X', senha: '123' }), 'senha');
  const ok = { categoria_id: '1', identificacao: 'a', descricao: 'b', localizacao: 'c', grau_urgencia: 'BAIXO' };
  await deveFalhar(() => DB.criarRegistro('x', { ...ok, categoria_id: '' }), 'categoria_id');
  await deveFalhar(() => DB.criarRegistro('x', { ...ok, identificacao: ' ' }), 'identificacao');
  await deveFalhar(() => DB.criarRegistro('x', { ...ok, descricao: '' }), 'descricao');
  await deveFalhar(() => DB.criarRegistro('x', { ...ok, localizacao: '' }), 'localizacao');
  await deveFalhar(() => DB.criarRegistro('x', { ...ok, grau_urgencia: 'URGENTE' }), 'grau_urgencia');
});

teste('login recusa CPF inválido antes de chamar o banco', async () => {
  try { await DB.entrar('123.456.789-00', 'x'); } catch (e) { return igual(e.message, 'CPF inválido.'); }
  throw new Error('deveria ter falhado');
});

async function rodarTestes(relatar) {
  let falhas = 0;
  for (const [nome, fn] of testes) {
    try { await fn(); relatar(nome, null); } catch (e) { falhas++; relatar(nome, e); }
  }
  return falhas;
}

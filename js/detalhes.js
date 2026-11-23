// Usada pelo munícipe (só leitura) e pelo servidor (com o formulário de status).
const id = new URLSearchParams(location.search).get('id');
const alvo = document.getElementById('conteudo');
let ehServidor = false;

function formularioStatus(r, status, mensagem) {
  const sucesso = UI.el('p', { class: 'sucesso', role: 'status', tabindex: '-1' }, mensagem || '');
  const form = UI.el('form', { class: 'form-status' },
    UI.el('h2', {}, 'Atualizar status'),
    sucesso,
    UI.el('label', { for: 'status_id' }, 'Novo status'),
    UI.el('select', { id: 'status_id', name: 'status_id', 'aria-describedby': 'erro-status_id' },
      ...status.map(s => new Option(s.nome, s.id, false, s.id === r.status_id))),
    UI.el('p', { id: 'erro-status_id', class: 'erro' }),
    UI.el('label', { for: 'observacao' }, 'Observação ', UI.el('span', { class: 'opcional' }, '(opcional, aparece para o munícipe)')),
    UI.el('textarea', { id: 'observacao', name: 'observacao', rows: '3', maxlength: '255' }),
    UI.el('p', { id: 'erro-geral', class: 'erro', role: 'alert' }),
    UI.el('button', { type: 'submit', class: 'botao' }, 'ATUALIZAR STATUS'));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    UI.limparErros(form);
    const botao = form.querySelector('button');
    botao.disabled = true;
    try {
      await DB.atualizarStatus(r.id, form.status_id.value, form.observacao.value);
      await render('Status atualizado.');
    } catch (err) {
      UI.mostrarErro(form, err);
      botao.disabled = false;
    }
  });
  if (mensagem) queueMicrotask(() => sucesso.focus());
  return form;
}

// Foto em tela cheia (estilo Google Maps): fundo escuro, ‹ › para trocar, Esc/×/clique fora fecha.
// <dialog> nativo cuida do foco, do Esc e de travar a página atrás.
function abrirVisualizador(fotos, inicial) {
  let atual = inicial;
  const img = UI.el('img', { class: 'visualizador-foto', alt: '' });
  const contador = UI.el('p', { class: 'visualizador-contador', 'aria-live': 'polite' });
  const botao = (classe, rotulo, texto, acao) => {
    const b = UI.el('button', { type: 'button', class: 'visualizador-botao ' + classe, 'aria-label': rotulo }, texto);
    b.addEventListener('click', acao);
    return b;
  };
  const mostrar = i => {
    atual = (i + fotos.length) % fotos.length;
    img.src = fotos[atual].url ?? '';
    img.alt = `Foto ${atual + 1} do registro`;
    contador.textContent = `${atual + 1} de ${fotos.length}`;
  };
  const varias = fotos.length > 1;
  const dialogo = UI.el('dialog', { class: 'visualizador', 'aria-label': 'Fotos do registro' },
    botao('visualizador-fechar', 'Fechar', '×', () => dialogo.close()),
    img,
    ...(varias ? [
      botao('visualizador-anterior', 'Foto anterior', '‹', () => mostrar(atual - 1)),
      botao('visualizador-proxima', 'Próxima foto', '›', () => mostrar(atual + 1)),
    ] : []),
    contador);
  dialogo.addEventListener('click', e => { if (e.target === dialogo) dialogo.close(); }); // clique no fundo
  dialogo.addEventListener('keydown', e => {
    if (varias && e.key === 'ArrowLeft') mostrar(atual - 1);
    if (varias && e.key === 'ArrowRight') mostrar(atual + 1);
  });
  dialogo.addEventListener('close', () => dialogo.remove()); // o foco volta sozinho para a miniatura
  mostrar(inicial);
  document.body.append(dialogo);
  dialogo.showModal();
}

async function render(mensagem) {
  const [r, status] = await Promise.all([DB.detalhesRegistro(id), ehServidor ? DB.listaStatus() : []]);
  alvo.replaceChildren();
  if (!r) {
    alvo.append(UI.el('p', {}, 'Registro não encontrado.'),
      UI.el('a', { href: ehServidor ? 'servidor.html' : 'home.html' }, 'Voltar'));
    return;
  }

  const item = (rotulo, valor) => [UI.el('dt', {}, rotulo), UI.el('dd', {}, valor)];
  // computador: duas colunas (dados | status e histórico); celular: uma embaixo da outra
  const principal = UI.el('div', { class: 'detalhes-principal' });
  const lateral = UI.el('aside', { class: 'detalhes-lateral', 'aria-label': 'Status e histórico' });
  alvo.append(UI.el('div', { class: 'detalhes-grade' }, principal, lateral));
  principal.append(
    UI.el('p', { class: 'protocolo' }, `Registro nº ${r.numero_protocolo}`),
    UI.el('dl', { class: 'detalhes' },
      ...item('Serviço', r.categoria.nome),
      ...item('Identificação', r.identificacao),
      ...item('Descrição', r.descricao),
      ...item('Localização', r.localizacao),
      ...item('Grau de urgência', UI.URGENCIA[r.grau_urgencia]),
      ...item('Aberto em', UI.data(r.data_abertura)),
      ...item('Status', UI.badge(r.status))),
  );

  if (ehServidor) lateral.append(formularioStatus(r, status, mensagem));

  if (r.fotos.length) {
    principal.append(UI.el('h2', {}, 'Fotos'), UI.el('ul', { class: 'previas' },
      ...r.fotos.map((f, i) => {
        const botao = UI.el('button', { type: 'button', class: 'previa-botao', 'aria-label': `Ampliar foto ${i + 1}` },
          UI.el('img', { src: f.url ?? '', alt: `Foto ${i + 1} do registro` }));
        botao.addEventListener('click', () => abrirVisualizador(r.fotos, i));
        return UI.el('li', {}, botao);
      })));
  }

  lateral.append(UI.el('h2', {}, 'Histórico'), UI.el('ol', { class: 'historico' },
    ...r.historico.map(h => UI.el('li', {},
      UI.el('time', { datetime: h.data_alteracao }, UI.data(h.data_alteracao)),
      ` ${h.status_novo}${h.observacao ? `: ${h.observacao}` : ''}`))));
}

(async () => {
  const u = await Auth.exigir('MUNICIPE', 'SERVIDOR');
  if (!u) return;
  ehServidor = u.tipo_usuario === 'SERVIDOR';
  if (ehServidor) document.querySelector('.topo-voltar').href = 'servidor.html';
  try {
    await render();
  } catch (err) {
    UI.falhaAoCarregar(err);
  }
})();

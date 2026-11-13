// Helpers de interface. Dado do usuário entra sempre como texto (nunca innerHTML), para não abrir XSS.
const UI = {
  URGENCIA: { BAIXO: 'Baixo', MEDIO: 'Médio', ALTO: 'Alto' },
  CLASSE_STATUS: { 1: 'aguardando', 2: 'andamento', 3: 'concluido' },

  el(tag, atributos = {}, ...filhos) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(atributos)) {
      if (k === 'class') e.className = v; else e.setAttribute(k, v);
    }
    e.append(...filhos);
    return e;
  },

  badge(status) {
    return UI.el('span', { class: 'badge badge-' + UI.CLASSE_STATUS[status.id] }, status.nome);
  },

  data(iso) {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  },

  // Erro ao carregar dados da página: mensagem no topo do conteúdo
  falhaAoCarregar(err) {
    document.getElementById('principal')
      .prepend(UI.el('p', { class: 'erro', role: 'alert' }, err.message || 'Não foi possível carregar os dados.'));
  },

  // Formulários: cada campo tem <p id="erro-<campo>" class="erro">; o resto vai para #erro-geral.
  limparErros(form) {
    form.querySelectorAll('.erro').forEach(p => { p.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
  },

  mostrarErro(form, err) {
    const campo = err instanceof DB.ErroCampo ? err.campo : 'geral';
    document.getElementById('erro-' + campo).textContent = err.message;
    const input = form.elements[campo];
    if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
  },
};

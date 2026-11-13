// Proteção das páginas por tipo de usuário. A sessão é do Supabase Auth (ver js/db.js).
const Auth = {
  irParaInicio(u) {
    location.href = u.tipo_usuario === 'SERVIDOR' ? 'servidor.html' : 'home.html';
  },

  async sair() {
    await DB.sair();
    location.href = 'index.html';
  },

  // Uso: const u = await Auth.exigir('MUNICIPE'); if (!u) return;  (aceita mais de um tipo)
  async exigir(...tipos) {
    const u = await DB.usuarioAtual().catch(() => null);
    if (!u || !tipos.includes(u.tipo_usuario)) {
      location.replace('index.html');
      return null;
    }
    // Depois de "Sair", o Voltar do navegador pode reabrir a página do cache sem rodar os scripts.
    addEventListener('pageshow', async e => {
      if (e.persisted && !(await DB.usuarioAtual().catch(() => null))) location.replace('index.html');
    });
    document.getElementById('sair')?.addEventListener('click', () => this.sair());
    const nome = document.getElementById('nome-usuario');
    if (nome) nome.textContent = u.nome;
    this.ligarMenuPerfil();
    this.montarNavegacao(u);
    return u;
  },

  // Links do cabeçalho (aparecem no computador) conforme o perfil; marca o da página atual
  montarNavegacao(u) {
    const inicio = u.tipo_usuario === 'SERVIDOR' ? 'servidor.html' : 'home.html';
    document.querySelector('.topo-marca')?.setAttribute('href', inicio);
    const nav = document.querySelector('.topo-nav');
    if (!nav) return;
    const links = u.tipo_usuario === 'SERVIDOR'
      ? [['servidor.html', 'Registros da secretaria']]
      : [['home.html', 'Suas entradas'], ['registrar.html', 'Novo registro']];
    const atual = location.pathname.split('/').pop() || 'index.html';
    nav.replaceChildren(...links.map(([href, texto]) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = texto;
      if (href === atual) a.setAttribute('aria-current', 'page');
      return a;
    }));
  },

  // Ícone de perfil no cabeçalho: abre/fecha o menu (padrão "disclosure": botão com aria-expanded)
  ligarMenuPerfil() {
    const botao = document.querySelector('.perfil-botao');
    if (!botao) return;
    const caixa = botao.closest('.perfil');
    const menu = document.getElementById(botao.getAttribute('aria-controls'));
    const abrir = aberto => { menu.hidden = !aberto; botao.setAttribute('aria-expanded', String(aberto)); };
    botao.addEventListener('click', () => abrir(menu.hidden));
    document.addEventListener('click', e => { if (!caixa.contains(e.target)) abrir(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !menu.hidden) { abrir(false); botao.focus(); }
    });
    caixa.addEventListener('focusout', e => { if (e.relatedTarget && !caixa.contains(e.relatedTarget)) abrir(false); });
  },
};

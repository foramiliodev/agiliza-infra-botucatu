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
    return u;
  },
};

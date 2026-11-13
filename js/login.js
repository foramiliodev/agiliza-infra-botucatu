const form = document.getElementById('form-login');
const erro = document.getElementById('erro');
const botao = form.querySelector('button[type="submit"]');

if (new URLSearchParams(location.search).has('cadastro')) {
  document.getElementById('aviso').textContent = 'Cadastro concluído. Entre com seu CPF e senha.';
}

// Já logado nesta aba: vai direto para a página inicial do perfil
DB.usuarioAtual().then(u => u && Auth.irParaInicio(u)).catch(() => {});

form.cpf.addEventListener('input', () => { form.cpf.value = DB.formatarCPF(form.cpf.value); });

form.addEventListener('submit', async e => {
  e.preventDefault();
  erro.textContent = '';
  botao.disabled = true;
  try {
    const u = await DB.entrar(form.cpf.value, form.senha.value);
    if (u) Auth.irParaInicio(u);
    else erro.textContent = 'CPF ou senha incorretos.';
  } catch (err) {
    erro.textContent = err.message;
  }
  botao.disabled = false;
});

const form = document.getElementById('form-cadastro');
const botao = form.querySelector('button[type="submit"]');

form.cpf.addEventListener('input', () => { form.cpf.value = DB.formatarCPF(form.cpf.value); });

form.addEventListener('submit', async e => {
  e.preventDefault();
  UI.limparErros(form);
  botao.disabled = true;
  try {
    await DB.cadastrarMunicipe(Object.fromEntries(new FormData(form)));
    location.href = 'index.html?cadastro=ok';
  } catch (err) {
    UI.mostrarErro(form, err);
  }
  botao.disabled = false;
});

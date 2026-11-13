const form = document.getElementById('form-registro');
const botao = form.querySelector('button[type="submit"]');
const MAX_FOTOS = 5;
const LADO_MAXIMO = 1024; // px
let fotos = []; // Blobs JPEG já reduzidos
let u = null;

// Reduz para no máximo 1024 px em JPEG (envio rápido em rede móvel; o bucket aceita até 2 MB por foto).
function reduzir(arquivo) {
  return new Promise((ok, falha) => {
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      canvas.toBlob(blob => (blob ? ok(blob) : falha(new Error(`Não foi possível processar "${arquivo.name}".`))), 'image/jpeg', 0.7);
    };
    img.onerror = () => falha(new Error(`"${arquivo.name}" não é uma imagem válida.`));
    img.src = URL.createObjectURL(arquivo);
  });
}

(async () => {
  u = await Auth.exigir('MUNICIPE');
  if (!u) return;
  try {
    const escolhida = new URLSearchParams(location.search).get('categoria');
    form.categoria_id.append(...(await DB.categorias())
      .map(c => new Option(c.nome, c.id, false, String(c.id) === escolhida)));
  } catch (err) {
    UI.falhaAoCarregar(err);
  }
})();

form.fotos.addEventListener('change', async () => {
  const erro = document.getElementById('erro-fotos');
  const arquivos = [...form.fotos.files];
  erro.textContent = '';
  fotos = [];
  botao.disabled = true;
  try {
    if (arquivos.length > MAX_FOTOS) throw new Error(`Escolha no máximo ${MAX_FOTOS} fotos.`);
    if (arquivos.some(a => !a.type.startsWith('image/'))) throw new Error('Envie apenas imagens.');
    fotos = await Promise.all(arquivos.map(reduzir));
  } catch (e) {
    erro.textContent = e.message;
    form.fotos.value = '';
  }
  botao.disabled = false;
  document.getElementById('previas').replaceChildren(...fotos.map((blob, i) =>
    UI.el('li', {}, UI.el('img', { src: URL.createObjectURL(blob), alt: `Prévia da foto ${i + 1}` }))));
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!u) return;
  UI.limparErros(form);
  botao.disabled = true;
  let registro;
  try {
    registro = await DB.criarRegistro(u.id, Object.fromEntries(new FormData(form)));
  } catch (err) {
    UI.mostrarErro(form, err);
    botao.disabled = false;
    return;
  }
  // O registro em texto já está salvo; uma falha nas fotos não o desfaz.
  const falhas = (await Promise.allSettled(fotos.map(f => DB.adicionarFoto(registro, f)))).filter(r => r.status === 'rejected');
  if (falhas.length) {
    document.getElementById('aviso-fotos').textContent =
      `${falhas.length} foto(s) não foram enviadas (${falhas[0].reason.message}). O registro foi salvo.`;
  }
  document.getElementById('protocolo').textContent = registro.numero_protocolo;
  document.getElementById('link-detalhes').href = 'detalhes.html?id=' + registro.id;
  document.getElementById('formulario').hidden = true;
  const confirmacao = document.getElementById('confirmacao');
  confirmacao.hidden = false;
  confirmacao.focus();
});

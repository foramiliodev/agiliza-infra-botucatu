// Acesso ao banco (Supabase). Todas as funções que falam com o banco são async.
// As regras de verdade ficam no banco (RLS, triggers e atualizar_status em sql/01_schema.sql);
// as validações daqui só dão mensagens melhores antes de enviar.
const DB = (() => {
  const cfg = globalThis.AGILIZA_CONFIG ?? {};
  // Sessão por aba (sessionStorage), como no protótipo: fechou a aba, saiu.
  const sb = globalThis.supabase?.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { storage: globalThis.sessionStorage },
  });

  const URGENCIAS = ['BAIXO', 'MEDIO', 'ALTO'];
  const STATUS_CONCLUIDO = 3;
  const PESO_URGENCIA = { ALTO: 0, MEDIO: 1, BAIXO: 2 };

  class ErroCampo extends Error {
    constructor(campo, mensagem) { super(mensagem); this.campo = campo; }
  }

  const somenteDigitos = s => String(s ?? '').replace(/\D/g, '');
  const emailDoCpf = cpf => `${somenteDigitos(cpf)}@${cfg.DOMINIO_EMAIL}`;

  function validarCPF(cpf) {
    const d = somenteDigitos(cpf);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    for (const n of [9, 10]) {
      let soma = 0;
      for (let i = 0; i < n; i++) soma += d[i] * (n + 1 - i);
      if ((soma * 10) % 11 % 10 !== Number(d[n])) return false;
    }
    return true;
  }

  function formatarCPF(valor) {
    return somenteDigitos(valor).slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  // Erro do Supabase → Error com mensagem para o usuário (detalhe técnico vai para o console)
  function traduzir(error) {
    console.error(error);
    if (/fetch|network/i.test(error?.message ?? '')) return new Error('Sem conexão com o servidor. Verifique a internet e tente de novo.');
    if (!sb) return new Error('Supabase não carregou. Verifique js/config.js e a conexão.');
    return new Error('Não foi possível concluir a operação. Tente de novo.');
  }

  function cliente() {
    if (!sb) throw new Error('Supabase não carregou. Verifique js/config.js e a conexão.');
    if (/SEU-PROJETO/.test(cfg.SUPABASE_URL)) throw new Error('Configure o Supabase em js/config.js (ver docs/supabase.md).');
    return sb;
  }

  async function consulta(promessa) {
    const { data, error } = await promessa;
    if (error) throw traduzir(error);
    return data;
  }

  // ---------------------------------------------------------------- contas (RF01, RF02, RN02)

  async function cadastrarMunicipe({ cpf, nome, e_mail, senha, telefone, bairro }) {
    cpf = somenteDigitos(cpf);
    if (!validarCPF(cpf)) throw new ErroCampo('cpf', 'CPF inválido.');
    if (!nome?.trim()) throw new ErroCampo('nome', 'Informe seu nome.');
    if (!senha || senha.length < 6) throw new ErroCampo('senha', 'A senha precisa ter pelo menos 6 caracteres.');
    const { error } = await cliente().auth.signUp({
      email: emailDoCpf(cpf),
      password: senha,
      options: { data: { cpf, nome: nome.trim(), e_mail, telefone, bairro } }, // o trigger criar_municipe lê estes dados
    });
    if (error) {
      if (error.code === 'user_already_exists' || /already registered/i.test(error.message)) {
        throw new ErroCampo('cpf', 'Este CPF já está cadastrado.');
      }
      if (error.code === 'weak_password') throw new ErroCampo('senha', 'Senha fraca. Use pelo menos 6 caracteres.');
      throw traduzir(error);
    }
    await sb.auth.signOut(); // o cadastro leva ao login, como antes
  }

  // Devolve { id, nome, tipo_usuario }, null se a senha não confere, ou lança erro se o CPF não tem cadastro
  async function entrar(cpf, senha) {
    if (!validarCPF(cpf)) throw new Error('CPF inválido.');
    const { error } = await cliente().auth.signInWithPassword({ email: emailDoCpf(cpf), password: senha });
    if (error) {
      if (error.code === 'email_not_confirmed') {
        throw new Error('O Supabase está exigindo confirmação de e-mail. Desligue "Confirm email" (ver docs/supabase.md).');
      }
      if (error.code === 'invalid_credentials' || error.status === 400) {
        // O Auth não diz se a conta existe; pergunta ao banco (sql/04_cpf_cadastrado.sql). Se a função falhar, cai na mensagem genérica.
        const { data: existe, error: erroConsulta } = await sb.rpc('cpf_cadastrado', { p_cpf: somenteDigitos(cpf) });
        if (!erroConsulta && existe === false) throw new Error('CPF não cadastrado. Clique em "Cadastre-se" para criar sua conta.');
        return null;
      }
      throw traduzir(error);
    }
    return usuarioAtual();
  }

  async function sair() {
    await sb?.auth.signOut();
  }

  // Usuário logado nesta aba (com o perfil da tabela usuario) ou null
  async function usuarioAtual() {
    const { data: { session } } = await cliente().auth.getSession();
    if (!session) return null;
    return consulta(sb.from('usuario').select('id, nome, tipo_usuario').eq('id', session.user.id).maybeSingle());
  }

  // ---------------------------------------------------------------- domínio

  const categorias = () => consulta(cliente().from('categoria_servico').select('*').order('id'));
  const listaStatus = () => consulta(cliente().from('status_registro').select('*').order('id'));

  // ---------------------------------------------------------------- munícipe (RF03–RF09)

  // RF03 / RN03 (a RLS já só devolve os registros dele)
  function registrosDoMunicipe(municipe_id) {
    return consulta(cliente().from('registro')
      .select('id, identificacao, data_abertura, status:status_registro(id, nome)')
      .eq('municipe_id', municipe_id)
      .order('data_abertura', { ascending: false })
      .order('id', { ascending: false }));
  }

  // RF05, RF06, RF08 / RN01, RN04: protocolo, status e histórico são gerados pelo banco
  async function criarRegistro(municipe_id, { categoria_id, identificacao, descricao, localizacao, grau_urgencia }) {
    if (!Number(categoria_id)) throw new ErroCampo('categoria_id', 'Escolha o serviço.');
    if (!identificacao?.trim()) throw new ErroCampo('identificacao', 'Dê um título para o registro.');
    if (!descricao?.trim()) throw new ErroCampo('descricao', 'Descreva o problema.');
    if (!localizacao?.trim()) throw new ErroCampo('localizacao', 'Informe o endereço ou um ponto de referência.');
    if (!URGENCIAS.includes(grau_urgencia)) throw new ErroCampo('grau_urgencia', 'Escolha o grau de urgência.');
    return consulta(cliente().from('registro').insert({
      municipe_id, categoria_id: Number(categoria_id), grau_urgencia,
      identificacao: identificacao.trim(), descricao: descricao.trim(), localizacao: localizacao.trim(),
    }).select().single());
  }

  // RF07 / RNF08: arquivo no Storage (bucket privado "fotos") + linha na tabela foto
  async function adicionarFoto(registro, arquivoJpeg) {
    const caminho = `${registro.municipe_id}/${registro.id}/${crypto.randomUUID()}.jpg`;
    const { error } = await cliente().storage.from('fotos').upload(caminho, arquivoJpeg, { contentType: 'image/jpeg' });
    if (error) throw traduzir(error);
    await consulta(sb.from('foto').insert({ registro_id: registro.id, caminho_arquivo: caminho }));
  }

  // RF09: null se não existir ou o usuário não puder ver (a RLS decide: RN03/RN07)
  async function detalhesRegistro(id) {
    if (!/^\d+$/.test(String(id ?? ''))) return null;
    const [r, status] = await Promise.all([
      consulta(cliente().from('registro')
        .select('*, categoria:categoria_servico(nome), fotos:foto(id, caminho_arquivo), historico:historico_status(*)')
        .eq('id', Number(id)).maybeSingle()),
      listaStatus(),
    ]);
    if (!r) return null;
    const nomeStatus = sid => status.find(s => s.id === sid)?.nome ?? null;
    // links temporários (1 h) para as fotos do bucket privado
    const urls = r.fotos.length
      ? await consulta(sb.storage.from('fotos').createSignedUrls(r.fotos.map(f => f.caminho_arquivo), 3600))
      : [];
    return {
      ...r,
      status: status.find(s => s.id === r.status_id),
      fotos: r.fotos.sort((a, b) => a.id - b.id).map(f => ({ ...f, url: urls.find(u => u.path === f.caminho_arquivo)?.signedUrl })),
      historico: r.historico
        .sort((a, b) => a.data_alteracao.localeCompare(b.data_alteracao) || a.id - b.id)
        .map(h => ({ ...h, status_anterior: nomeStatus(h.status_anterior_id), status_novo: nomeStatus(h.status_novo_id) })),
    };
  }

  // ---------------------------------------------------------------- servidor (RF10, RF11)

  // { secretaria_id, secretaria: { nome } } do servidor logado
  function perfilServidor(usuario_id) {
    return consulta(cliente().from('servidor').select('secretaria_id, secretaria(nome)').eq('usuario_id', usuario_id).single());
  }

  // RF10 / RN07: abertos antes dos concluídos, depois mais urgentes, depois mais antigos
  async function registrosDaSecretaria(secretaria_id) {
    const lista = await consulta(cliente().from('registro')
      .select('id, numero_protocolo, identificacao, grau_urgencia, status_id, data_abertura, status:status_registro(id, nome), categoria_servico!inner(nome, secretaria_id)')
      .eq('categoria_servico.secretaria_id', secretaria_id));
    return lista
      .map(r => ({ ...r, categoria: r.categoria_servico }))
      .sort((a, b) => (a.status_id === STATUS_CONCLUIDO) - (b.status_id === STATUS_CONCLUIDO)
        || PESO_URGENCIA[a.grau_urgencia] - PESO_URGENCIA[b.grau_urgencia]
        || a.data_abertura.localeCompare(b.data_abertura));
  }

  // RF11, RF12 / RN05, RN06: a função atualizar_status do banco valida e grava o histórico
  async function atualizarStatus(registro_id, status_id, observacao) {
    const { error } = await cliente().rpc('atualizar_status', {
      p_registro_id: Number(registro_id), p_status_id: Number(status_id), p_observacao: observacao || null,
    });
    if (!error) return;
    if (error.code === '22023') throw new ErroCampo('status_id', error.message);
    if (error.code === 'P0002' || error.code === '42501') throw new Error(error.message);
    throw traduzir(error);
  }

  return {
    ErroCampo, somenteDigitos, validarCPF, formatarCPF,
    cadastrarMunicipe, entrar, sair, usuarioAtual,
    categorias, listaStatus,
    registrosDoMunicipe, criarRegistro, adicionarFoto, detalhesRegistro,
    perfilServidor, registrosDaSecretaria, atualizarStatus,
  };
})();

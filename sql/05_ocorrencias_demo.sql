-- Ocorrências de demonstração (popula o banco para apresentar). Rode no SQL Editor do Supabase,
-- DEPOIS do 01, 02 e 03 (o histórico usa os servidores de demonstração). Pode rodar de novo: se as
-- ocorrências de demonstração já existem, não faz nada.
-- Cria 3 munícipes de demonstração (senha: municipe123):
--   CPF 123.456.789-09 → Maria Aparecida Souza (demo)
--   CPF 987.654.321-00 → João Carlos Pereira (demo)
--   CPF 246.813.579-28 → Ana Beatriz Lima (demo)
-- e 14 registros nas 3 categorias, com urgências, datas e status variados e o histórico de cada mudança.
-- O e-mail técnico usa o mesmo domínio de DOMINIO_EMAIL em js/config.js; se trocar lá, troque aqui.
-- Fotos não entram: ficam no Storage e precisam ser enviadas pelo site.

do $$
declare
  c record;
  o record;
  uid uuid;
  v_email text;
  v_cat int;
  v_serv uuid;
  v_id int;
  v_abertura timestamptz;
begin
  -- 1. Munícipes (mesmo esquema do 03: auth.users + auth.identities; o trigger cria usuario + municipe)
  for c in select * from (values
    ('12345678909', 'Maria Aparecida Souza (demo)', '(14) 99811-2233', 'Vila dos Lavradores'),
    ('98765432100', 'João Carlos Pereira (demo)',   '(14) 99722-3344', 'Centro'),
    ('24681357928', 'Ana Beatriz Lima (demo)',      '',                'Jardim Paraíso')
  ) as t(cpf, nome, telefone, bairro)
  loop
    v_email := c.cpf || '@agiliza-botucatu.com.br';
    if exists (select 1 from auth.users u where u.email = v_email) then continue; end if;

    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email,
      extensions.crypt('municipe123', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('cpf', c.cpf, 'nome', c.nome, 'telefone', c.telefone, 'bairro', c.bairro),
      now(), now(), '', '', '', '' -- tokens vazios (não nulos): o Auth falha no login com nulo
    );

    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, 'email',
            jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true),
            now(), now(), now());
  end loop;

  -- 2. Registros (só na primeira vez)
  if exists (select 1 from public.registro r join public.usuario u on u.id = r.municipe_id
             where u.cpf in ('12345678909', '98765432100', '24681357928')) then
    raise notice 'Ocorrências de demonstração já existem; nada foi inserido.';
    return;
  end if;

  -- dias = há quantos dias foi aberto; status final 1 Aguardando, 2 Em andamento, 3 Concluído
  for o in select * from (values
    ('12345678909', 'Buracos e pavimentação', 'Buraco grande na pista',
     'Buraco de quase um metro na faixa da direita; carros desviam pela contramão.',
     'Rua Amando de Barros, 1450 - Centro', 'ALTO', 12, 3,
     'Equipe de tapa-buraco agendada.', 'Buraco tapado com asfalto a quente.'),
    ('12345678909', 'Iluminação pública', 'Poste apagado em frente à escola',
     'O poste está apagado há uma semana e a rua fica totalmente escura na saída dos alunos à noite.',
     'Rua Major Matheus, 300 - Vila dos Lavradores', 'ALTO', 6, 2,
     'Chamado repassado à equipe de manutenção elétrica.', null),
    ('12345678909', 'Limpeza urbana', 'Entulho na calçada',
     'Restos de obra deixados na calçada impedem a passagem de pedestres e cadeirantes.',
     'Rua Cardoso de Almeida, 820 - Vila dos Lavradores', 'MEDIO', 3, 1, null, null),
    ('12345678909', 'Buracos e pavimentação', 'Calçada quebrada',
     'Placas da calçada soltas perto do ponto de ônibus; uma pessoa idosa já tropeçou.',
     'Avenida Dom Lúcio, 1100 - Centro', 'MEDIO', 20, 3,
     'Vistoria feita; reparo incluído na programação da semana.', 'Calçada refeita.'),
    ('12345678909', 'Iluminação pública', 'Lâmpada piscando',
     'A lâmpada do poste fica acendendo e apagando a noite toda.',
     'Rua General Telles, 540 - Centro', 'BAIXO', 1, 1, null, null),
    ('98765432100', 'Limpeza urbana', 'Bueiro entupido',
     'Quando chove a água não escoa e alaga a esquina inteira; o bueiro está cheio de folhas e lixo.',
     'Rua Curuzu, 210 - Centro', 'ALTO', 9, 2,
     'Equipe de desobstrução enviada ao local.', null),
    ('98765432100', 'Buracos e pavimentação', 'Asfalto afundando',
     'O asfalto está cedendo perto da tampa de esgoto e o buraco aumenta a cada chuva.',
     'Avenida Floriano Peixoto, 2100 - Vila Assunção', 'ALTO', 2, 1, null, null),
    ('98765432100', 'Iluminação pública', 'Praça sem iluminação',
     'Três postes da praça estão apagados; moradores evitam passar por lá à noite.',
     'Praça do Bosque - Centro', 'MEDIO', 15, 3,
     'Troca das lâmpadas programada.', 'Lâmpadas trocadas por LED.'),
    ('98765432100', 'Limpeza urbana', 'Terreno com lixo acumulado',
     'Terreno baldio com sacos de lixo e mato alto, atraindo ratos.',
     'Rua Rangel Pestana, 75 - Vila Antártica', 'MEDIO', 25, 3,
     'Proprietário notificado e limpeza agendada.', 'Terreno limpo pela equipe da prefeitura.'),
    ('98765432100', 'Buracos e pavimentação', 'Lombada sem pintura',
     'A lombada não tem pintura nem placa; à noite os motoristas não enxergam.',
     'Rua Dr. Costa Leite, 960 - Centro', 'BAIXO', 7, 1, null, null),
    ('24681357928', 'Iluminação pública', 'Poste caído após temporal',
     'Poste inclinado com fios baixos depois da chuva de ontem; risco para quem passa.',
     'Rua João Passos, 1300 - Jardim Paraíso', 'ALTO', 1, 2,
     'Área isolada; concessionária de energia acionada.', null),
    ('24681357928', 'Limpeza urbana', 'Varrição atrasada',
     'A rua não é varrida há semanas e as folhas entopem as calçadas.',
     'Rua Pedro Delmanto, 440 - Jardim Paraíso', 'BAIXO', 10, 2,
     'Rua incluída na rota de varrição.', null),
    ('24681357928', 'Buracos e pavimentação', 'Buracos na rua de terra',
     'Valetas e buracos depois das chuvas; carro baixo não consegue passar.',
     'Rua Antônio Delmanto, 30 - Jardim Paraíso', 'MEDIO', 4, 1, null, null),
    ('24681357928', 'Limpeza urbana', 'Lixeira pública quebrada',
     'A lixeira da praça está quebrada e o lixo fica espalhado no chão.',
     'Praça Coronel Moura - Centro', 'BAIXO', 30, 3,
     'Lixeira nova solicitada ao almoxarifado.', 'Lixeira substituída.')
  ) as t(cpf, categoria, identificacao, descricao, localizacao, urgencia, dias, status_final, obs_andamento, obs_concluido)
  loop
    select id into v_cat from public.categoria_servico where nome = o.categoria;
    select s.usuario_id into v_serv from public.servidor s
      join public.categoria_servico cs on cs.secretaria_id = s.secretaria_id
      where cs.id = v_cat limit 1; -- null se o 03 não foi rodado (histórico fica sem servidor)

    -- O trigger antes_inserir_registro gera o protocolo e força status 1 e data de agora;
    -- o apos_inserir_registro grava a 1ª linha do histórico. Depois ajustamos as datas.
    insert into public.registro (identificacao, descricao, localizacao, grau_urgencia, municipe_id, categoria_id)
    values (o.identificacao, o.descricao, o.localizacao, o.urgencia,
            (select id from public.usuario where cpf = o.cpf), v_cat)
    returning id into v_id;

    v_abertura := now() - make_interval(days => o.dias, hours => 3);
    update public.historico_status set data_alteracao = v_abertura where registro_id = v_id;

    if o.status_final >= 2 then
      insert into public.historico_status (registro_id, status_anterior_id, status_novo_id, servidor_id, observacao, data_alteracao)
      values (v_id, 1, 2, v_serv, o.obs_andamento, v_abertura + interval '20 hours');
    end if;
    if o.status_final = 3 then
      insert into public.historico_status (registro_id, status_anterior_id, status_novo_id, servidor_id, observacao, data_alteracao)
      values (v_id, 2, 3, v_serv, o.obs_concluido, v_abertura + make_interval(days => greatest(o.dias / 2, 2)));
    end if;

    update public.registro set
      status_id = o.status_final,
      data_abertura = v_abertura,
      data_atualizacao = (select max(data_alteracao) from public.historico_status where registro_id = v_id)
    where id = v_id;
  end loop;
end $$;

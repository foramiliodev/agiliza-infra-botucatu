-- Testes das regras do banco (RLS, triggers, atualizar_status).
-- Rodar no SQL Editor do Supabase depois de 01, 02 e 04. Tudo acontece numa transação desfeita no fim
-- (rollback): não sobra nenhum dado. Só os contadores de id avançam (o próximo protocolo pode pular números).
-- Resultado esperado: uma linha "TODOS OS TESTES PASSARAM". Se alguma regra falhar, o script para com a mensagem dela.
-- (No psql aparecem também as mensagens "OK: ..." de cada grupo.)

begin;

-- "entra" como um usuário: o mesmo que o Supabase faz com o token de quem está logado
create function pg_temp.como(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', uid::text, true);
end $$;
grant execute on function pg_temp.como(uuid) to authenticated;

-- 4 contas: munícipes A e B, servidor de Obras (SO) e servidor de Serviços Públicos (SSP)
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', '39053344705@teste.local', '{"cpf":"39053344705","nome":" Maria ","bairro":"Centro"}'),
  ('00000000-0000-0000-0000-00000000000b', '87748248800@teste.local', '{"cpf":"87748248800","nome":"João"}'),
  ('00000000-0000-0000-0000-0000000000c1', '13579246828@teste.local', '{"cpf":"13579246828","nome":"Servidor SO"}'),
  ('00000000-0000-0000-0000-0000000000c2', '86420975310@teste.local', '{"cpf":"86420975310","nome":"Servidor SSP"}');
select public.promover_servidor('13579246828', 'T-SO', 'Teste', (select id from public.secretaria where sigla = 'SO'));
select public.promover_servidor('86420975310', 'T-SSP', 'Teste', (select id from public.secretaria where sigla = 'SSP'));

do $$ begin
  assert (select nome from public.usuario where cpf = '39053344705') = 'Maria', 'cadastro deveria gravar o nome sem espaços';
  assert (select bairro from public.municipe where usuario_id = '00000000-0000-0000-0000-00000000000a') = 'Centro', 'cadastro deveria gravar municipe';
  assert (select tipo_usuario from public.usuario where cpf = '13579246828') = 'SERVIDOR', 'promover_servidor deveria mudar o tipo';
  assert not exists (select 1 from public.municipe where usuario_id = '00000000-0000-0000-0000-0000000000c1'), 'servidor não deveria continuar munícipe';
  raise notice 'OK: cadastro cria usuario + municipe; promover_servidor cria servidor';
end $$;

do $$ begin
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-0000000000ee', 'x@teste.local', '{"cpf":"12345678900","nome":"X"}');
    raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if;
  end;
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-0000000000ef', 'y@teste.local', '{"cpf":"39053344705","nome":"Duplicado"}');
    raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if;
  end;
  raise notice 'OK: banco recusa CPF inválido e CPF duplicado';
end $$;

-- ---------------------------------------------------------------- como munícipe A
select pg_temp.como('00000000-0000-0000-0000-00000000000a');
set local role authenticated;

do $$
declare r public.registro;
begin
  insert into public.registro (identificacao, descricao, localizacao, grau_urgencia, municipe_id, categoria_id, status_id)
  values ('Buraco', 'Grande', 'Rua A, 10', 'ALTO', auth.uid(),
          (select id from public.categoria_servico where nome = 'Buracos e pavimentação'), 3)
  returning * into r;
  assert r.status_id = 1, 'munícipe não pode escolher o status (deveria ficar Aguardando)';
  assert r.numero_protocolo ~ '^\d{10}$', 'protocolo deveria ser ano + 6 dígitos';
  assert r.numero_protocolo like to_char(now() at time zone 'America/Sao_Paulo', 'YYYY') || '%', 'protocolo deveria começar pelo ano';
  assert (select count(*) from public.historico_status h where h.registro_id = r.id and h.status_novo_id = 1 and h.status_anterior_id is null) = 1,
    'deveria criar o primeiro histórico';
  perform set_config('teste.buraco', r.id::text, true);

  insert into public.registro (identificacao, descricao, localizacao, municipe_id, categoria_id)
  values ('Poste', 'Apagado', 'Rua B, 20', auth.uid(), (select id from public.categoria_servico where nome = 'Iluminação pública'))
  returning * into r;
  perform set_config('teste.poste', r.id::text, true);
  assert r.grau_urgencia = 'BAIXO', 'urgência padrão deveria ser BAIXO';
  raise notice 'OK: munícipe abre registro com protocolo, status Aguardando e histórico';
end $$;

do $$ begin
  begin
    insert into public.registro (identificacao, descricao, localizacao, municipe_id, categoria_id)
    values ('X', 'Y', 'Z', '00000000-0000-0000-0000-00000000000b', 1);
    raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if;
  end;
  begin
    insert into public.registro (identificacao, descricao, localizacao, grau_urgencia, municipe_id, categoria_id)
    values ('X', 'Y', 'Z', 'URGENTE', auth.uid(), 1);
    raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if;
  end;
  begin
    insert into public.registro (identificacao, descricao, localizacao, municipe_id, categoria_id)
    values ('   ', 'Y', 'Z', auth.uid(), 1);
    raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if;
  end;
  raise notice 'OK: recusa registro em nome de outro munícipe, urgência inválida e título vazio';
end $$;

do $$
declare buraco int := current_setting('teste.buraco')::int;
begin
  insert into public.foto (registro_id, caminho_arquivo) values (buraco, auth.uid() || '/' || buraco || '/a.jpg');
  begin
    insert into public.foto (registro_id, caminho_arquivo) values (buraco, 'outra-pasta/a.jpg');
    raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if;
  end;
  begin
    perform public.atualizar_status(buraco, 2);
    raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if;
  end;
  assert (select count(*) from public.usuario) = 1, 'munícipe só deveria ver o próprio usuario';
  assert (select count(*) from public.servidor) = 0, 'munícipe não deveria ver servidores';
  raise notice 'OK: foto só na própria pasta; munícipe não altera status; só vê os próprios dados';
end $$;

-- ---------------------------------------------------------------- como munícipe B
reset role;
select pg_temp.como('00000000-0000-0000-0000-00000000000b');
set local role authenticated;

do $$ begin
  assert (select count(*) from public.registro) = 0, 'munícipe B não deveria ver registros de A';
  assert (select count(*) from public.foto) = 0, 'munícipe B não deveria ver fotos de A';
  assert (select count(*) from public.historico_status) = 0, 'munícipe B não deveria ver histórico de A';
  begin
    insert into public.foto (registro_id, caminho_arquivo)
    values (current_setting('teste.buraco')::int, auth.uid() || '/x.jpg');
    raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if;
  end;
  raise notice 'OK: munícipe B não vê nem anexa nada nos registros de A (RN03)';
end $$;

-- ---------------------------------------------------------------- como servidor de Obras
reset role;
select pg_temp.como('00000000-0000-0000-0000-0000000000c1');
set local role authenticated;

do $$
declare
  buraco int := current_setting('teste.buraco')::int;
  poste int := current_setting('teste.poste')::int;
begin
  assert exists (select 1 from public.registro where id = buraco), 'servidor de Obras deveria ver o registro de Buracos';
  assert not exists (select 1 from public.registro where id = poste), 'servidor de Obras não deveria ver Iluminação (RN07)';
  assert (select count(*) from public.foto where registro_id = buraco) = 1, 'servidor deveria ver as fotos do registro';

  perform public.atualizar_status(buraco, 2, '  Equipe a caminho ');
  perform public.atualizar_status(buraco, 3);
  assert (select status_id from public.registro where id = buraco) = 3, 'status deveria ser Concluído';
  assert (select array_agg(array[coalesce(status_anterior_id, 0), status_novo_id] order by id) from public.historico_status where registro_id = buraco)
       = array[array[0, 1], array[1, 2], array[2, 3]], 'histórico deveria ter as 3 mudanças';
  assert (select observacao from public.historico_status where registro_id = buraco and status_novo_id = 2) = 'Equipe a caminho',
    'observação deveria ser gravada sem espaços';
  assert (select servidor_id from public.historico_status where registro_id = buraco and status_novo_id = 3) = auth.uid(),
    'histórico deveria guardar quem alterou';

  begin perform public.atualizar_status(buraco, 3); raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if; end;
  begin perform public.atualizar_status(buraco, 99); raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if; end;
  begin perform public.atualizar_status(poste, 2); raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if; end;
  begin update public.registro set status_id = 1 where id = buraco; end;
  assert (select status_id from public.registro where id = buraco) = 3, 'UPDATE direto não deveria mudar nada (só via atualizar_status)';
  raise notice 'OK: servidor vê só a sua secretaria, altera status com histórico; recusa repetido, inválido e de outra secretaria';
end $$;

-- ---------------------------------------------------------------- como servidor de Serviços Públicos
reset role;
select pg_temp.como('00000000-0000-0000-0000-0000000000c2');
set local role authenticated;

do $$ begin
  assert not exists (select 1 from public.registro where id = current_setting('teste.buraco')::int), 'SSP não deveria ver Buracos';
  assert exists (select 1 from public.registro where id = current_setting('teste.poste')::int), 'SSP deveria ver Iluminação';
  begin
    perform public.promover_servidor('87748248800', 'X', 'X', 1);
    raise exception 'deveria falhar';
  exception when others then if sqlerrm = 'deveria falhar' then raise; end if;
  end;
  raise notice 'OK: servidor SSP vê só a sua secretaria; ninguém logado consegue chamar promover_servidor';
end $$;

-- ---------------------------------------------------------------- sem login (anon)
reset role;
select set_config('request.jwt.claims', '', true), set_config('request.jwt.claim.sub', '', true);
set local role anon;

do $$ begin
  assert (select count(*) from public.registro) = 0, 'anônimo não deveria ver registros';
  assert (select count(*) from public.categoria_servico) = 0, 'anônimo não deveria ver categorias';
  assert public.cpf_cadastrado('39053344705'), 'cpf_cadastrado deveria dizer que o CPF de A existe';
  assert not public.cpf_cadastrado('86288366757'), 'cpf_cadastrado deveria dizer que um CPF novo não existe';
  raise notice 'OK: sem login não se vê nada, mas dá para saber se um CPF tem cadastro (tela de login)';
end $$;

reset role;
rollback;
-- Se chegou aqui, nenhuma regra falhou (uma falha interrompe o script com a mensagem da regra).
select 'TODOS OS TESTES PASSARAM (nada foi gravado)' as resultado;

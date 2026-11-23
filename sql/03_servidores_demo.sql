-- Servidores de demonstração. Rode no SQL Editor do Supabase; pode rodar de novo sem problema.
-- Cria as contas direto no Auth (sem cadastrar pelo site) e transforma em servidores.
--   CPF 529.982.247-25 → Secretaria de Obras (SO)             senha: servidor123
--   CPF 111.444.777-35 → Secretaria de Serviços Públicos (SSP) senha: servidor123
-- O e-mail técnico usa o mesmo domínio de DOMINIO_EMAIL em js/config.js; se trocar lá, troque aqui.
-- Para criar outro servidor: cadastre o CPF no site e chame promover_servidor com os dados dele.

do $$
declare
  c record;
  uid uuid;
  v_email text;
begin
  for c in select * from (values
    ('52998224725', 'Servidor de Obras (demo)'),
    ('11144477735', 'Servidor de Serviços Públicos (demo)')
  ) as t(cpf, nome)
  loop
    v_email := c.cpf || '@agiliza-botucatu.com.br';
    if exists (select 1 from auth.users u where u.email = v_email) then continue; end if;

    uid := gen_random_uuid();
    -- O trigger ao_criar_usuario_auth cria usuario + municipe a partir de raw_user_meta_data
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email,
      extensions.crypt('servidor123', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('cpf', c.cpf, 'nome', c.nome),
      now(), now(), '', '', '', '' -- tokens vazios (não nulos): o Auth falha no login com nulo
    );

    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text, 'email',
            jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true),
            now(), now(), now());
  end loop;
end $$;

select public.promover_servidor('52998224725', 'SO-0001', 'Atendente',
  (select id from public.secretaria where sigla = 'SO'));

select public.promover_servidor('11144477735', 'SSP-0001', 'Atendente',
  (select id from public.secretaria where sigla = 'SSP'));

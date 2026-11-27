-- Exportação de todos os dados cadastrados (botão "Exportar dados" na conta do servidor; pedido do professor).
-- Rodar no SQL Editor depois de 01_schema.sql (pode rodar de novo sem problema).
-- Passa por cima da RLS de propósito: qualquer servidor recebe TODAS as secretarias e os dados pessoais dos munícipes
-- (decisão do grupo, ver docs/decisoes.md). Munícipe recebe erro 42501; sem login a função nem pode ser chamada.
-- Devolve um JSON { "Seção": [ { "Coluna": valor, ... }, ... ], ... }; os nomes das colunas viram o cabeçalho do CSV.
-- Senhas não saem: ficam no Supabase Auth (auth.users), que esta função não lê.
create or replace function public.exportar_dados() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from servidor where usuario_id = auth.uid()) then
    raise exception 'Somente servidores podem exportar os dados.' using errcode = '42501';
  end if;
  return json_build_object(
    'Usuários', (select coalesce(json_agg(t), '[]') from (
      select u.nome as "Nome", public.formatar_cpf(u.cpf) as "CPF", u.e_mail as "E-mail",
             u.tipo_usuario as "Tipo", public.formatar_data(u.data_cadastro) as "Cadastrado em",
             m.telefone as "Telefone", m.bairro as "Bairro",
             s.matricula as "Matrícula", s.cargo as "Cargo", s.perfil_acesso as "Perfil de acesso", se.nome as "Secretaria"
      from usuario u
      left join municipe m on m.usuario_id = u.id
      left join servidor s on s.usuario_id = u.id
      left join secretaria se on se.id = s.secretaria_id
      order by u.data_cadastro, u.nome) t),
    'Registros', (select coalesce(json_agg(t), '[]') from (
      select r.numero_protocolo as "Protocolo", r.identificacao as "Identificação", r.descricao as "Descrição",
             r.localizacao as "Localização", r.latitude as "Latitude", r.longitude as "Longitude",
             c.nome as "Serviço", se.nome as "Secretaria", r.grau_urgencia as "Urgência", st.nome as "Status",
             public.formatar_data(r.data_abertura) as "Aberto em", public.formatar_data(r.data_atualizacao) as "Atualizado em",
             u.nome as "Munícipe", public.formatar_cpf(u.cpf) as "CPF do munícipe",
             (select count(*) from foto f where f.registro_id = r.id) as "Fotos"
      from registro r
      join categoria_servico c on c.id = r.categoria_id
      join secretaria se on se.id = c.secretaria_id
      join status_registro st on st.id = r.status_id
      join usuario u on u.id = r.municipe_id
      order by r.data_abertura, r.id) t),
    'Histórico de status', (select coalesce(json_agg(t), '[]') from (
      select r.numero_protocolo as "Protocolo", public.formatar_data(h.data_alteracao) as "Data",
             sa.nome as "Status anterior", sn.nome as "Status novo", u.nome as "Servidor", h.observacao as "Observação"
      from historico_status h
      join registro r on r.id = h.registro_id
      left join status_registro sa on sa.id = h.status_anterior_id
      join status_registro sn on sn.id = h.status_novo_id
      left join usuario u on u.id = h.servidor_id
      order by r.data_abertura, r.id, h.data_alteracao, h.id) t),
    'Fotos', (select coalesce(json_agg(t), '[]') from (
      select r.numero_protocolo as "Protocolo", f.caminho_arquivo as "Arquivo no Storage", public.formatar_data(f.data_upload) as "Enviada em"
      from foto f join registro r on r.id = f.registro_id
      order by r.id, f.id) t),
    'Serviços', (select coalesce(json_agg(t), '[]') from (
      select c.nome as "Serviço", c.descricao as "Descrição", se.nome as "Secretaria"
      from categoria_servico c join secretaria se on se.id = c.secretaria_id
      order by c.id) t),
    'Secretarias', (select coalesce(json_agg(t), '[]') from (
      select nome as "Secretaria", sigla as "Sigla" from secretaria order by id) t)
  );
end $$;

-- Auxiliares de formatação (horário de Brasília, CPF com máscara)
create or replace function public.formatar_data(d timestamptz) returns text
language sql immutable as $$ select to_char(d at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') $$;
create or replace function public.formatar_cpf(cpf text) returns text
language sql immutable as $$ select regexp_replace(cpf, '^(\d{3})(\d{3})(\d{3})(\d{2})$', '\1.\2.\3-\4') $$;

revoke execute on function public.exportar_dados() from public, anon;
grant execute on function public.exportar_dados() to authenticated;

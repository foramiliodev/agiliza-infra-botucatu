-- Agiliza Infraestrutura Botucatu: banco no Supabase (PostgreSQL).
-- Rodar UMA vez no SQL Editor do Supabase, num projeto novo. Depois: 02_dados_iniciais.sql.
--
-- Baseado no Quadro 1 do documento (MySQL), com estas adaptações:
--   * usuario.id = auth.users.id (uuid). A senha fica no Supabase Auth (bcrypt), por isso não existe senha_hash.
--   * ENUM do MySQL virou CHECK; AUTO_INCREMENT virou identity; DATETIME virou timestamptz.
--   * As regras de negócio valem no banco: RLS (quem vê o quê), triggers (protocolo, histórico) e
--     a função atualizar_status (só o servidor da secretaria altera o status).

-- ---------------------------------------------------------------- funções auxiliares

-- CPF com dígitos verificadores válidos (mesma regra de js/db.js)
create or replace function public.cpf_valido(cpf text) returns boolean
language plpgsql immutable as $$
declare
  d int[];
  soma int;
  n int;
begin
  if cpf is null or cpf !~ '^\d{11}$' or cpf ~ '^(\d)\1{10}$' then return false; end if;
  d := array(select substr(cpf, i, 1)::int from generate_series(1, 11) as i);
  foreach n in array array[9, 10] loop
    soma := 0;
    for k in 1..n loop soma := soma + d[k] * (n + 2 - k); end loop;
    if (soma * 10) % 11 % 10 <> d[n + 1] then return false; end if;
  end loop;
  return true;
end $$;

-- ---------------------------------------------------------------- tabelas

create table public.secretaria (
  id    int generated always as identity primary key,
  nome  varchar(100) not null,
  sigla varchar(10)
);

-- Supertipo da especialização (disjunta e total: MUNICIPE ou SERVIDOR)
create table public.usuario (
  id            uuid primary key references auth.users(id) on delete cascade,
  cpf           char(11) not null unique check (public.cpf_valido(cpf)),
  nome          varchar(120) not null check (btrim(nome) <> ''),
  e_mail        varchar(120),
  tipo_usuario  text not null check (tipo_usuario in ('MUNICIPE', 'SERVIDOR')),
  data_cadastro timestamptz not null default now()
);

-- Subtipo 1: munícipe
create table public.municipe (
  usuario_id uuid primary key references public.usuario(id) on delete cascade,
  telefone   varchar(20),
  bairro     varchar(80)
);

-- Subtipo 2: servidor
create table public.servidor (
  usuario_id    uuid primary key references public.usuario(id) on delete cascade,
  matricula     varchar(20) not null unique,
  cargo         varchar(80),
  perfil_acesso text not null default 'ATENDENTE' check (perfil_acesso in ('ATENDENTE', 'ADMINISTRADOR')),
  secretaria_id int not null references public.secretaria(id)
);

-- Itens do menu de serviços
create table public.categoria_servico (
  id            int generated always as identity primary key,
  nome          varchar(80) not null,
  descricao     varchar(255),
  secretaria_id int not null references public.secretaria(id)
);

-- ids fixos (1 Aguardando, 2 Em andamento, 3 Concluído): o código depende deles
create table public.status_registro (
  id   int primary key,
  nome varchar(30) not null unique
);

create table public.registro (
  id               int generated always as identity primary key,
  numero_protocolo varchar(20) unique, -- preenchido pelo trigger antes_inserir_registro
  identificacao    varchar(120) not null check (btrim(identificacao) <> ''),
  descricao        text not null check (btrim(descricao) <> ''),
  localizacao      varchar(200) not null check (btrim(localizacao) <> ''),
  latitude         numeric(9, 6),
  longitude        numeric(9, 6),
  grau_urgencia    text not null default 'BAIXO' check (grau_urgencia in ('BAIXO', 'MEDIO', 'ALTO')),
  municipe_id      uuid not null references public.municipe(usuario_id),
  categoria_id     int not null references public.categoria_servico(id),
  status_id        int not null default 1 references public.status_registro(id),
  data_abertura    timestamptz not null default now(),
  data_atualizacao timestamptz not null default now()
);
create index registro_municipe_idx on public.registro (municipe_id);
create index registro_categoria_idx on public.registro (categoria_id);

-- Evidências do registro. caminho_arquivo = caminho do arquivo no bucket "fotos" do Storage
create table public.foto (
  id              int generated always as identity primary key,
  registro_id     int not null references public.registro(id) on delete cascade,
  caminho_arquivo varchar(255) not null unique,
  data_upload     timestamptz not null default now()
);
create index foto_registro_idx on public.foto (registro_id);

-- Trilha de auditoria (RF12)
create table public.historico_status (
  id                 int generated always as identity primary key,
  registro_id        int not null references public.registro(id) on delete cascade,
  status_anterior_id int references public.status_registro(id),
  status_novo_id     int not null references public.status_registro(id),
  servidor_id        uuid references public.servidor(usuario_id),
  observacao         varchar(255),
  data_alteracao     timestamptz not null default now()
);
create index historico_registro_idx on public.historico_status (registro_id);

-- ---------------------------------------------------------------- cadastro (Supabase Auth → usuario + municipe)

-- Todo cadastro feito pelo site vira MUNICIPE, com os dados enviados no signUp (raw_user_meta_data).
-- Nunca se confia num "tipo" vindo do navegador: servidor só é criado por promover_servidor().
create or replace function public.criar_municipe() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into usuario (id, cpf, nome, e_mail, tipo_usuario)
  values (new.id, m->>'cpf', btrim(m->>'nome'), nullif(btrim(m->>'e_mail'), ''), 'MUNICIPE');
  insert into municipe (usuario_id, telefone, bairro)
  values (new.id, nullif(btrim(m->>'telefone'), ''), nullif(btrim(m->>'bairro'), ''));
  return new;
end $$;

create trigger ao_criar_usuario_auth
  after insert on auth.users
  for each row execute function public.criar_municipe();

-- Transforma um usuário já cadastrado em servidor. Só o administrador roda (SQL Editor); o site não pode chamar.
create or replace function public.promover_servidor(p_cpf text, p_matricula text, p_cargo text, p_secretaria_id int)
returns void
language plpgsql security definer set search_path = public as $$
declare
  uid uuid;
begin
  select id into uid from usuario where cpf = p_cpf;
  if uid is null then raise exception 'CPF % não está cadastrado. Cadastre pelo site primeiro.', p_cpf; end if;
  delete from municipe where usuario_id = uid; -- falha se ele já abriu registros como munícipe
  update usuario set tipo_usuario = 'SERVIDOR' where id = uid;
  insert into servidor (usuario_id, matricula, cargo, secretaria_id)
  values (uid, p_matricula, p_cargo, p_secretaria_id)
  on conflict (usuario_id) do update
    set matricula = excluded.matricula, cargo = excluded.cargo, secretaria_id = excluded.secretaria_id;
end $$;

-- ---------------------------------------------------------------- registro: protocolo e histórico

-- RN01: protocolo = ano + id com 6 dígitos. O munícipe não escolhe status nem datas.
create or replace function public.antes_inserir_registro() returns trigger
language plpgsql as $$
begin
  new.status_id := 1;
  new.data_abertura := now();
  new.data_atualizacao := now();
  new.numero_protocolo := to_char(now() at time zone 'America/Sao_Paulo', 'YYYY') || lpad(new.id::text, 6, '0');
  return new;
end $$;

create trigger antes_inserir_registro
  before insert on public.registro
  for each row execute function public.antes_inserir_registro();

-- RF12: primeira linha do histórico
create or replace function public.apos_inserir_registro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into historico_status (registro_id, status_anterior_id, status_novo_id, observacao)
  values (new.id, null, new.status_id, 'Registro aberto pelo munícipe');
  return null;
end $$;

create trigger apos_inserir_registro
  after insert on public.registro
  for each row execute function public.apos_inserir_registro();

-- RF11, RF12 / RN05, RN06, RN07: só o servidor da secretaria do registro altera, e sempre grava o histórico.
-- Erros com SQLSTATE 22023 são "do formulário" (o site mostra no campo de status).
create or replace function public.atualizar_status(p_registro_id int, p_status_id int, p_observacao text default null)
returns public.registro
language plpgsql security definer set search_path = public as $$
declare
  r registro;
  anterior int;
begin
  if not exists (select 1 from servidor where usuario_id = auth.uid()) then
    raise exception 'Somente servidor pode alterar o status.' using errcode = '42501';
  end if;
  select * into r from registro where id = p_registro_id for update;
  if r.id is null or not exists (
    select 1 from servidor s join categoria_servico c on c.secretaria_id = s.secretaria_id
    where s.usuario_id = auth.uid() and c.id = r.categoria_id
  ) then
    raise exception 'Registro não encontrado.' using errcode = 'P0002';
  end if;
  if not exists (select 1 from status_registro where id = p_status_id) then
    raise exception 'Escolha um status válido.' using errcode = '22023';
  end if;
  if p_status_id = r.status_id then
    raise exception 'O registro já está com esse status.' using errcode = '22023';
  end if;
  anterior := r.status_id;
  update registro set status_id = p_status_id, data_atualizacao = now() where id = r.id returning * into r;
  insert into historico_status (registro_id, status_anterior_id, status_novo_id, servidor_id, observacao)
  values (r.id, anterior, p_status_id, auth.uid(), nullif(btrim(left(p_observacao, 255)), ''));
  return r;
end $$;

-- secretaria do servidor logado (null para munícipe). security definer evita recursão de RLS.
create or replace function public.minha_secretaria() returns int
language sql stable security definer set search_path = public as $$
  select secretaria_id from servidor where usuario_id = auth.uid()
$$;

-- ---------------------------------------------------------------- permissões das funções

revoke execute on function public.promover_servidor(text, text, text, int) from public, anon, authenticated;
revoke execute on function public.criar_municipe() from public, anon, authenticated;
revoke execute on function public.atualizar_status(int, int, text) from public, anon;
grant execute on function public.atualizar_status(int, int, text) to authenticated;

-- ---------------------------------------------------------------- RLS: quem vê e grava o quê

alter table public.usuario           enable row level security;
alter table public.municipe          enable row level security;
alter table public.servidor          enable row level security;
alter table public.secretaria        enable row level security;
alter table public.categoria_servico enable row level security;
alter table public.status_registro   enable row level security;
alter table public.registro          enable row level security;
alter table public.foto              enable row level security;
alter table public.historico_status  enable row level security;

-- Cada um lê só os próprios dados pessoais (LGPD). Gravação só pelos triggers/funções acima.
create policy usuario_le_o_proprio  on public.usuario  for select to authenticated using (id = auth.uid());
create policy municipe_le_o_proprio on public.municipe for select to authenticated using (usuario_id = auth.uid());
create policy servidor_le_o_proprio on public.servidor for select to authenticated using (usuario_id = auth.uid());

-- Tabelas de domínio: leitura para quem está logado
create policy secretaria_leitura on public.secretaria        for select to authenticated using (true);
create policy categoria_leitura  on public.categoria_servico for select to authenticated using (true);
create policy status_leitura     on public.status_registro   for select to authenticated using (true);

-- RN03 + RN07: o munícipe vê os próprios registros; o servidor, os da sua secretaria
create policy registro_leitura on public.registro for select to authenticated using (
  municipe_id = auth.uid()
  or categoria_id in (select id from public.categoria_servico where secretaria_id = public.minha_secretaria())
);

-- RN02: só munícipe autenticado abre registro, e sempre em nome próprio
create policy registro_insercao on public.registro for insert to authenticated with check (
  municipe_id = auth.uid() and exists (select 1 from public.municipe where usuario_id = auth.uid())
);

-- Fotos e histórico: visíveis para quem vê o registro (a RLS de registro vale dentro do exists)
create policy foto_leitura on public.foto for select to authenticated using (
  exists (select 1 from public.registro r where r.id = registro_id)
);
create policy foto_insercao on public.foto for insert to authenticated with check (
  exists (select 1 from public.registro r where r.id = registro_id and r.municipe_id = auth.uid())
  and caminho_arquivo like auth.uid()::text || '/%'
);
create policy historico_leitura on public.historico_status for select to authenticated using (
  exists (select 1 from public.registro r where r.id = registro_id)
);

-- ---------------------------------------------------------------- Storage: bucket privado de fotos

-- Privado (LGPD: a foto pode mostrar pessoas/casas). O site usa links temporários (signed URLs).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

-- O munícipe envia só para a própria pasta: <uid>/<registro_id>/<arquivo>.jpg
create policy fotos_envio on storage.objects for insert to authenticated with check (
  bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text
);

-- Baixa a foto quem pode ver a linha correspondente na tabela foto
create policy fotos_leitura on storage.objects for select to authenticated using (
  bucket_id = 'fotos' and exists (select 1 from public.foto f where f.caminho_arquivo = storage.objects.name)
);

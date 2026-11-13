-- Diz se um CPF já tem cadastro. Usada na tela de login para avisar "CPF não cadastrado".
-- Rodar no SQL Editor depois de 01_schema.sql (pode rodar de novo sem problema).
-- Decisão do grupo: aceitar que qualquer pessoa descubra SE um CPF tem conta, em troca de uma mensagem mais clara.
-- A função não devolve nenhum outro dado (nome, e-mail etc. continuam protegidos pela RLS).
create or replace function public.cpf_cadastrado(p_cpf text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from usuario where cpf = p_cpf)
$$;

revoke execute on function public.cpf_cadastrado(text) from public;
grant execute on function public.cpf_cadastrado(text) to anon, authenticated;

-- Servidores de demonstração.
-- 1. No site, cadastre os dois CPFs abaixo como se fossem munícipes (senha sugerida: servidor123).
-- 2. Rode este arquivo no SQL Editor do Supabase. Ele transforma os dois cadastros em servidores.
-- Para criar outro servidor: cadastre o CPF no site e chame promover_servidor com os dados dele.

select public.promover_servidor('52998224725', 'SO-0001', 'Atendente',
  (select id from public.secretaria where sigla = 'SO'));

select public.promover_servidor('11144477735', 'SSP-0001', 'Atendente',
  (select id from public.secretaria where sigla = 'SSP'));

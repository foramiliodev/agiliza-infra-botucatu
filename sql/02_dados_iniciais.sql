-- Carga inicial (Quadro 2 do documento). Rodar depois de 01_schema.sql.

insert into public.status_registro (id, nome) values
  (1, 'Aguardando'), (2, 'Em andamento'), (3, 'Concluído');

insert into public.secretaria (nome, sigla) values
  ('Secretaria de Obras', 'SO'),
  ('Secretaria de Serviços Públicos', 'SSP');

insert into public.categoria_servico (nome, descricao, secretaria_id)
select v.nome, v.descricao, s.id
from (values
  ('Buracos e pavimentação', 'Reparo de vias', 'SO'),
  ('Iluminação pública', 'Lâmpadas queimadas ou postes', 'SSP'),
  ('Limpeza urbana', 'Bueiros, entulho e varrição', 'SSP')
) as v(nome, descricao, sigla)
join public.secretaria s on s.sigla = v.sigla;

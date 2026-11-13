// Dados do projeto Supabase: painel do Supabase → Project Settings → API (ou "API Keys").
// A chave "anon"/"publishable" é pública por natureza (vai para o navegador de qualquer jeito):
// quem protege os dados são as regras RLS do banco (sql/01_schema.sql). NUNCA coloque aqui a "service_role"/"secret".
const AGILIZA_CONFIG = {
  SUPABASE_URL: 'https://gslnjuhaiviwvnxxpawc.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_gmCEsUAsZA-jZaVmGans7g_TrWJmQzz',
  // O Supabase Auth exige e-mail; o login é por CPF, então cada conta usa o e-mail técnico <cpf>@<este domínio>.
  // Nenhum e-mail é enviado (desligue "Confirm email" no Supabase, ver docs/supabase.md).
  DOMINIO_EMAIL: 'agiliza-botucatu.com.br',
};

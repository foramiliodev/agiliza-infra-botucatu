// Roda js/tests.js no Node (sem navegador e sem Supabase): npm test
const fs = require('fs');
const path = require('path');
const ler = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
// Supabase falso: só registra com que URL/chave o db.js criou o cliente
globalThis.supabase = { createClient: (url, chave) => { globalThis.clienteCriado = { url, chave }; return {}; } };
globalThis.sessionStorage = {};
// config.js + db.js no mesmo escopo, como scripts clássicos no navegador (const não vira propriedade de globalThis)
eval(ler('config.js') + '\n' + ler('db.js') + '\n' + ler('tests.js') + '\nglobalThis.rodarTestes = rodarTestes;');

rodarTestes((nome, erro) => console.log(erro ? `FALHOU: ${nome}: ${erro.message}` : `OK: ${nome}`))
  .then(falhas => { console.log(falhas ? `${falhas} falha(s)` : 'Todos os testes passaram.'); process.exit(falhas ? 1 : 0); });

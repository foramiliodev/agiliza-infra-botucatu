// Roda js/tests.js no Node (sem navegador e sem Supabase): npm test
const fs = require('fs');
const path = require('path');
const ler = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
eval(ler('db.js') + '\n' + ler('tests.js') + '\nglobalThis.rodarTestes = rodarTestes;');

rodarTestes((nome, erro) => console.log(erro ? `FALHOU: ${nome}: ${erro.message}` : `OK: ${nome}`))
  .then(falhas => { console.log(falhas ? `${falhas} falha(s)` : 'Todos os testes passaram.'); process.exit(falhas ? 1 : 0); });

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();

function getInterfaces() {
  const nets = os.networkInterfaces();
  const list = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        list.push({ nome: name, ip: net.address });
      }
    }
  }
  return list.length ? list : [{ nome: 'loopback', ip: 'localhost' }];
}

app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));

app.get('/server-ip', (req, res) => {
  res.json({ interfaces: getInterfaces(), port: PORT });
});

app.put('/:arquivo', (req, res) => {
  const arquivo = req.params.arquivo;
  if (!arquivo.endsWith('.json')) return res.status(403).send('Apenas .json');

  const filePath = path.join(__dirname, arquivo);
  const incoming = req.body;

  if (arquivo === 'palpites.json') {
    let existentes = [];
    try { existentes = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) {}

    incoming.forEach(novo => {
      const idx = existentes.findIndex(p => p.id === novo.id);
      if (idx >= 0) existentes[idx] = novo;
      else existentes.push(novo);
    });

    fs.writeFileSync(filePath, JSON.stringify(existentes, null, 2));
    return res.json({ ok: true, merge: true, total: existentes.length });
  }

  fs.writeFileSync(filePath, JSON.stringify(incoming, null, 2));
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const info = getInterfaces();
  console.log(`Bolão rodando em:`);
  info.forEach(i => console.log(`  http://${i.ip}:${PORT}`));
});

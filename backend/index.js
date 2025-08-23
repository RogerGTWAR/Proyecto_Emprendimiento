const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ msg: 'Hola desde backend' });
});

app.listen(3000, () => console.log('Backend en http://localhost:3000'));


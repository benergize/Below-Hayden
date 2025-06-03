const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const DATA_FILE = path.join(__dirname, 'data/data.json');
const sandbox = { window: {} };

app.use(express.static('.'));
app.use(express.json());


function serializeGameData(data) {
	let o = {};
	o.items = data.items;
	o.gear = data.gear;
	o.monsterList = data.monsterList;
	return JSON.stringify(o);

}

app.get('/data', (req, res) => {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const parsed = JSON.parse(raw);
  res.json(parsed);
});

app.post('/save', (req, res) => {
  const newText = serializeGameData(req.body);
  fs.writeFileSync(DATA_FILE, newText);
  res.sendStatus(200);
});


app.get('/assets/sprites', (req, res) => {
	glob("**/*.png", { cwd: __dirname }, (err, files) => {
	  if (err) return res.status(500).json({ error: err.message });
	  res.json(files);
	});
  });
  
  app.get('/assets/sounds', (req, res) => {
	glob("sounds/**/*.{mp3,wav}", { cwd: __dirname, nocase: true }, (err, files) => {
	  if (err) return res.status(500).json({ error: err.message });
	  res.json(files);
	});
  });

app.listen(3001, () => {
  console.log('Game data editor running at http://localhost:3001');
});

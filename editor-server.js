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

	parsed.monsterList.forEach((floor,ind)=>{
		parsed.monsterList[ind] = floor.map(monster=>{
			let m = monster;
			if(Array.isArray(monster)) {
				m = {
					name:monster[0],
					sprite:monster[1],
					hp:monster[2],
					dmg:monster[3],
					strongTo:monster[4],
					weakTo:monster[5],
					value:monster[6]||10,
					rarity:monster[7]||"normal"
				};
			}
			if(typeof m.weakTo == "undefined") { m.weakTo = []; }
			else if(typeof m.weakTo == "string") { m.weakTo = m.weakTo.split(","); }
			if(typeof m.strongTo == "undefined") { m.strongTo = []; }
			else if(typeof m.strongTo == "string") { m.strongTo = m.strongTo.split(","); }

			return m;
		});
	});

	parsed.items = parsed.items.map((item)=>{

		//Item schema defined here.
		//We do this weird define->overwrite so that everything has all the schema, even if we added the new fields after the item was initially entered into the system.
		let i = {
			name: "",
			desc: "",
			sprite:"",
			sound:"",
			hp:0,
			dmg:0,
			numberOfDice:0,
			numberOfSides:0,
			consumable: false,
			uses:-1,
			slot:"",
			effectType:"",
			minimumDropFloor: 0,
			minimumDropPlayerLevel:0,
			rarity:"normal",
		}

		//Overwrite existing properties.
		for(let p in item) {
			i[p] = item[p];
		}

		
		if(item.consumable == "false") { item.consumable = false; }
		else if(item.consumable == "true") { item.consumable = true; }

		return i;
	});
	res.json(parsed);
});

app.post('/save', (req, res) => {
	const newText = serializeGameData(req.body);
	fs.writeFileSync(DATA_FILE, newText);
	res.sendStatus(200);
});



function walkDir(dir, fileCallback, extensions) {
	fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
	  const fullPath = path.join(dir, dirent.name);
	  if (dirent.isDirectory()) {
		walkDir(fullPath, fileCallback, extensions);
	  } else if (extensions.some(ext => dirent.name.endsWith(ext))) {
		fileCallback(fullPath);
	  }
	});
  }
  
  app.get('/assets/sprites', (req, res) => {
	var results = [];
	walkDir(__dirname, (file) => {
	  results.push(path.relative(__dirname, file));
	}, ['.png']);
	results = results.map(r=>{ return r.replace("\\", "/"); });
	res.json(results);
  });
  
  app.get('/assets/sounds', (req, res) => {
	var results = [];
	walkDir(path.join(__dirname, 'sounds'), (file) => {
	  results.push(path.relative(__dirname, file));
	}, ['.mp3', '.wav']);
	results = results.map(r=>{ return r.replace("\\", "/"); });
	res.json(results);
  });
 
 

app.listen(3001, () => {
  console.log('Game data editor running at http://localhost:3001');
});

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

			
			let m = {
				name: "",
				sprite:"",
				hp:0,
				dmg:0,
				numberOfDice:0,
				numberOfSides:0,
				effectType: "physical",
				minimumDropFloor: 0,
				minimumDropPlayerLevel:0,
				rarity:"normal"
			}
	
			//Overwrite existing properties.
			for(let p in monster) {
				m[p] = monster[p];
			}
			
			if(typeof m.weakTo == "undefined") { m.weakTo = []; }
			else if(typeof m.weakTo == "string") { m.weakTo = m.weakTo.split(","); }
			if(typeof m.strongTo == "undefined") { m.strongTo = []; }
			else if(typeof m.strongTo == "string") { m.strongTo = m.strongTo.split(","); }

			return m;
		});
	});

	parsed.items = parsed.gear.concat(parsed.items).map((item)=>{

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
			armor:0,
			armorType:"",
			giveStatusEffect:"",
			giveStatusEffectTurns:"",
			giveStatusEffectTo:"self"
		}

		//Overwrite existing properties.
		for(let p in item) {
			i[p] = item[p];
		}

		
		if(item.consumable == "false") { item.consumable = false; }
		else if(item.consumable == "true") { item.consumable = true; }

		item.minimumDropPlayerLevel = Number.parseInt(item.minimumDropPlayerLevel);
		item.minimumDropFloor = Number.parseInt(item.minimumDropFloor);

		return i;
	});

	parsed.gear = [];
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
	
	fs.writeFile("./data/sprites.cache.json", JSON.stringify(results), (err) => {
		if (err) {
			console.error('Error writing to file:', err);
		} else {
			console.log('Data written to cache file successfully.');
		}
	});
	
	res.json(results);
  });
  
  app.get('/assets/spriteObjects', (req, res) => {
	var results = [];
	walkDir(__dirname, (file) => {
	  results.push(path.relative(__dirname, file));
	}, ['.png']);
	results = results.map(r=>{ return r.replace("\\", "/"); });
	let ms = {};
		let el = results.filter(m=>{return m.indexOf('monsters/') != -1; }).map(m=>{return m.replace('monsters/wee_mons_','')});
		
		el.forEach(m=>{
			let s = m.split("_");
			if(s.length == 4) {
				ms[s[0]] = ms[s[0]] || {};
	
				ms[s[0]][s[1]] = ms[s[0]][s[1]] || {};
				
				ms[s[0]][s[1]][s[2]] = ms[s[0]][s[1]][s[2]] || [];
	
				ms[s[0]][s[1]][s[2]].push('monsters/wee_mons_' + m);
			}
		});
		res.json(ms);
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

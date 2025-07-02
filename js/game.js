window.id = 0;
window.db = {};


setTimeout(fn=>{
	document.body.style.opacity = 1;
}, 500);

const DOM = {
	doorsElement: document.querySelector("#doors"),
	highScoreArea: document.querySelector("#high-score"),
	splashScreenP: document.querySelector("#annoying-splash p")
};

const playerHPSpan = document.getElementById('playerHP');
const playerXPSpan = document.getElementById('playerXP');
const floorSpan = document.getElementById('floor');
const goldSpan = document.getElementById('gold');
const logDiv = document.getElementById('log');
const enemyDiv = document.getElementById('enemyInfo');
const enemyHearts = document.querySelector("#hearts");
const monsterButton = document.querySelector(".monster");
const chestButton = document.querySelector(".chest");
const lastLog = document.querySelector("#last-log");
const monsterDOM = document.querySelector(".monsters");
const itemInfo = document.querySelector("#item-info");


let preload = document.querySelector("#preload");
let preloadInner = "";

fetch("/assets/sprites/").then(el=>{return el.json();}).then(el=>{


    el.forEach(spr=>{
        preloadInner += `<img src = "./${spr}">`;
    });
    preload.innerHTML = preloadInner;
	
	DOM.splashScreenP.innerText = `Tap anywhere to start.`;
})
.catch(fn=>{
	
	fetch("./data/sprites.cache.json").then(el=>{return el.json();}).then(el=>{


		el.forEach(spr=>{
			preloadInner += `<img src = "./${spr}">`;
		});
		preload.innerHTML = preloadInner;
		
		DOM.splashScreenP.innerText = `Tap anywhere to start.`;
	}).catch(fn=>{
		
		DOM.splashScreenP.innerText = `Tap anywhere to start.`;
	});
});

window.addEventListener("mouseup", ev=>{

    if(!itemInfo.classList.contains("open")) { return; }
    let foc = ev.target;
    let inInventory = false;
    while(foc.parentElement != null && foc.parentElement.tagName != "HTML") {
        if(foc.classList.contains("inventory-and-info") || foc.classList.contains("chest") || foc.classList.contains("itbtn")) {
            inInventory = true;
            break;
        }
        else {
            foc = foc.parentElement;
        }
    }
    if(!inInventory) { showItemInfo(-1,"close") }
});


if(typeof localStorage.highScore == "undefined") { localStorage.highScore = 10; }
DOM.highScoreArea.innerText = Number.parseInt(localStorage.highScore);

db.findItem = function(itemName) {
	let i = db.items.filter(item=>{ return item.name == itemName; });
	if(i.length > 0) { return i[0]; }
	else { return false; }
}

fetch("./data/data.json?1111").then(dat=>{return dat.json();}).then(dat=>{

	console.log(dat);
	window.gear = dat.gear;
	db.gear = dat.gear
	window.items = dat.items;
	db.items = dat.items;
	window.monsterList = dat.monsterList;
	db.monsterList = dat.monsterList;
	console.log(dat);


	// Start game
	restart();
});



game = {};
player = {};

RARITY_JUNK = 0;
RARITY_NORMAL = 1;
RARITY_RARE = 2;
RARITY_EPIC = 3;
RARITY_LEGENDARY = 4; 
const rarityScale = ["junk", "normal", "rare", "epic", "legendary"];

//TODO: Switch everything over to these constants
CLASS_ADVENTURER = 0;
CLASS_MAGE = 1;
CLASS_PALADIN = 2;
CLASS_ROGUE = 3;
CLASS_WARLOCK = 4;
const classes = ["adventurer", "mage", "paladin", "rogue", "warlock"];

//UNUSED? DELETEME?
enemy = null;
monsters = [];


function log(msg) {

	logDiv.innerText += msg + "\n"
	logDiv.scrollTop = logDiv.scrollHeight

	lastLog.innerHTML = msg;
}

//Variable to store update bar timeout. This prevents us from going cross eyed with updates.
let ubto = -1;

function updateBars() {


	playerHPSpan.textContent = `${Math.round(player.dhp)}/${Math.round(player.getMaxHp())}`
	playerXPSpan.textContent = `${Math.round(player.dxp)}/${Math.round(player.getXPToNextLevel())}`

	document.querySelector("#hpbar div").style.width = 100*(player.dhp/player.getMaxHp()) + "%";
	document.querySelector("#xpbar div").style.width = 100*(player.dxp/player.getXPToNextLevel()) + "%";

	let xp = player.xp;
	let hp = player.hp;
	let gold = player.gold

	if(player.dgold < gold) { player.dgold++; }
	if(player.dgold > gold) { player.dgold--; }

	if(player.dxp < xp) { player.dxp += (player.xp - player.dxp) / 10; }
	if(player.dxp > xp) { player.dxp = xp; }

	if(player.dhp < hp) { player.dhp+=.2; }
	if(player.dhp > hp) { player.dhp-=.2; }

	
	goldSpan.innerText = player.dgold;

	if(player.dhp != hp || player.dxp != xp || player.dgold != player.gold) { clearTimeout(ubto); ubto = setTimeout(fn=>{ updateBars(); }, 5); }

}


function updateUI() {

	itemInfo.classList.remove("open");
	
	updateBars();

	floorSpan.textContent = player.level
	goldSpan.textContent = player.gold;

	if(player.level > localStorage.highScore) {
		localStorage.highScore = player.level;
		DOM.highScoreArea.innerText = game.floor;
	}

	updateMonsters();

	updateInventoryUI();

	renderPlayerStats();
	
}

//Render all monsters in combat on the battlefield. This replaces the monsterDOM element with the monsters.
function monsterUIInit() {

	monsterDOM.innerHTML = "";
	monsters.forEach(monster=>{


			let monsterHearts = monster.formatHearts();
			
			let monsterTemplate = `
				<div data-monster-container = "${monster.id}" class = 'monster-container' style = 'width: ${ 80 / monsters.length }%'>
					<div class = 'hearts' style = "visibility:visible;">${monsterHearts}</div>
					<button 
						data-monster-id="${monster.id}" 
						class = 'monster ${monster.sprite}' 
						onclick="player.attack(${monster.id})"
						style = "display:inline-block;"
					>${monster.name}</button>
				</div>
			`;

			monsterDOM.innerHTML += monsterTemplate;
	});	
}


function updateMonsters() {

	let monsterElements = document.querySelectorAll(`.monster-container`);
	monsterElements.forEach(md=>{

		let monster = monsters.filter(m=>{return md.dataset.monsterContainer == m.id; });
		if(monster.length == 0) { 

			if(md.dataset.explode == null || typeof md.dataset.explode == "undefined") {
				md.innerHTML = "<div class = 'explosion'></div>"; 
				md.dataset.explode = "yes";
			}
		}
		else {
			monster = monster[0]; 
			md.querySelector(".hearts").innerHTML = monster.formatHearts();
		}
	});
}

function updateInventoryUI() {

	let itemElements = document.querySelectorAll("#inventory button.item")

	itemElements.forEach(el=>{el.classList.remove("equipped");});
	

	player.inventory.forEach((item,ind)=>{

		let el = itemElements[ind];
		el.dataset.id = item.id;
		el.style.backgroundImage = `url("${item.sprite}")`;
		if(item.consumable) { el.innerText = item.uses; }
		else { el.innerText = ""; }

		let sl = player.getItemInSlot(item.slot);
		if(sl && sl.id == item.id) { el.classList.add("equipped"); }
	});

	for(let v = player.inventory.length; v < itemElements.length; v++) {
		itemElements[v].style.backgroundImage = "";
		itemElements[v].dataset.id = -1;
		itemElements[v].innerText = "";
	}
}


function monsterTurn() {

	updateUI();
	lockMonsters();

	monsters.forEach((monster,ind)=>{
		setTimeout(fn=>{

			monster.attack();

		}, 500 * ind);

	});

	setTimeout(fn=>{

		if(!checkIsDefeated() && monsters.length > 0) {

			
			updateUI();

			log("YOUR TURN.");

			unlockMonsters();

			player.manageStatusEffects();
		}
	}, (500 * monsters.length));
}

function dice(numberOfDice, numberOfSides) {
	let d = 0;
	for(let v = 0; v < numberOfDice; v++) {
		d += 1 + Math.round(Math.random() * (numberOfSides - 1));
	}
	return d;
}

function greenText(text) { return `<span class = 'greenText'>${text}</span>`; }



function takeItemFromChest() {
	
	//this should work we hope
	let item = game.currentChestContents;

	let isDuplicate = item.consumable && player.inventory.filter(i=>{ return i.getName() == item.getName(); }).length > 0;

	if(player.inventory.length < player.maxItems || isDuplicate) {
		giveItem(game.currentChestContents);
		showItemInfo(-1);
		game.currentChestContents = null;
		chestButton.classList.add("empty");
		updateUI();
	}
	else {
		log("INVENTORY IS FULL.");
		sou_error.play(); 
	}
}


Array.prototype.chooseRandom = function() {
    return this[Math.round(Math.random() * (this.length-1))]
}


function generateEnemy(difficultyLevel=0) {
	
	
	//let enemy = monsterList[floor-1].chooseRandom();
	let enemy = db.monsterList.flat().filter(m=>{return m.minimumDropFloor == game.floor && dice(1,rarityScale.length) > (rarityScale.indexOf(m.rarity) - 1) }).chooseRandom();

	enemy = Array.isArray(enemy) ? new Monster(...enemy) : new Monster(enemy);
	enemy.level = game.thisRoomDifficulty;

	log(`A wild ${enemy.name} appears!`)

	return enemy;
}

function makeCSSAnimations() {
	fetch('/assets/spriteObjects').then(el=>{return el.json();}).then(el=>{
		console.log(el);
		let animations = ``;
	
		for(let monster in el) {
			for(let anim in el[monster]) {
				for(let dir in el[monster][anim]) {
					animations += `\n.${monster}_${dir}_${anim} { 
						background-image:url(${el[monster][anim][dir][0]});
						animation: ${monster}_${dir}_${anim} ${anim == "atk" ? .35 : 1 }s linear 0s infinite normal ${anim == "atk" ? "backwards, enemyAttack .5s linear .25s normal forwards" : "forwards"};
					}\n`;
					animations += `\n@keyframes ${monster}_${dir}_${anim} {`;
					el[monster][anim][dir].forEach((frame,ind)=>{
						animations += `

							${100-(100/(ind+1))}% {
								background-image:url(${frame});
							}
							${(100-(100/(ind+1)))+49}% {
								background-image:url(${frame});
							}

						`;
					});
					animations += `}`;
				}
			}
		}
		console.log(animations);
	})
}

function defeatEnemy(enemy) {

		

	if(enemy.name == "Pack Rat") { 
		
		if(enemy.turns > 5) {
			log("Pack Rat escapes!"); 
		}
		else if(enemy.hp < enemy.maxHp / 5) {

			log("Pack Rat shares its loot!");
		}
	}
	else {

		sou_kill_foe.play();
		log(`You defeated the ${enemy.name}!`);
	
		player.xp += 10 * (enemy.maxHp ** 1.3) * (game.thisRoomDifficulty+1);
		player.handleLeveling();
	}



	monsters = monsters.filter(monster=>{ return monster.id != enemy.id; });
	

	//floor += 1 + thisRoomDifficulty;

	//XP = BaseXP * (EnemyLevel ^ EnemyPowerCurve)
	

	if(monsters.length == 0) {

		chestButton.classList.add("closed");
		chestButton.style.visibility = "visible";
		

		setTimeout(fn=>{
			chestButton.style.opacity = 1;
		},250);
		
		enableDoors();

		sou_chest_fadeIn.play();
	}

	updateUI();
}

function lockMonsters() {
	document.querySelectorAll(".monsters button").forEach(monster=>{monster.disabled = true;})
}

function unlockMonsters() {
	document.querySelectorAll(".monsters button").forEach(monster=>{monster.disabled = false;})
}


function checkIsDefeated() { 

	saveGame();

	if (player.hp <= 0 && !game.pauseActionForLevelUp) {

		game.pauseActionForLevelUp = true;

		log("You died! Game over.");

		sou_gameover.play();
		
		document.body.classList.add("dead");
		document.querySelector("#game-frame").classList.add("dead");

		document.querySelector("#died-at-level").innerHTML = player.level;
		document.querySelector("#dead-high-score").innerHTML = player.level >= localStorage.highScore ? "A NEW HIGH SCORE!" : ("High Score:"+localStorage.highScore);
		
		return true;
	}
	return false;
}

game.currentChestContents = null

//generateChest, createChest
//openChest
function useChest() {

	if(chestButton.classList.contains("empty")) {
		log("IT'S EMPTY.");
	}

	if(chestButton.classList.contains("closed")) {
		log("You open the chest...");
		sou_door.play();
		chestButton.classList.remove("closed");
	}

	if(!chestButton.classList.contains("empty") && game.currentChestContents == null) {
	
		let roll = dice(1,20);

		//Give gold
		if(roll < 7) {
			sou_foundSomethingSm.play();
			let gold = (game.thisRoomDifficulty+1) * (dice(1,20) + 5);

			log(`FOUND ${gold} GOLD`);
			player.gold += gold;
			chestButton.classList.add("empty");
		}

		//Give item
		else if(roll >= 7) {
			sou_foundSomethingMd.play();

			let i = (gear.concat(items)).filter(item=>{ 
				return game.floor >= item.minimumDropFloor && 
				player.level >= item.minimumDropPlayerLevel &&

				/* Only show items rarer than this room? */
				(
					game.thisRoomDifficulty >= rarityScale.indexOf(item.rarity) - (game.floor - item.minimumDropFloor)  //(game.thisRoomDifficulty == 0 ? game.thisRoomDifficulty + (dice(1,2)-1) : game.thisRoomDifficulty)
				)
			}).chooseRandom(); 


			let item = Array.isArray(i) ? new Item(...i) : new Item(i);

			item.randomizeStats();

			console.log(item);

			log("FOUND " + item.getName());
			game.currentChestContents = item;
			showItemInfo(item,false,"chest");	
			return;		
		}


		updateUI();
	}

	else if(game.currentChestContents != null) {
		
		let slotIsEmpty = true;//(game.currentChestContents.slot == -1 || player.inventory.filter(i=>{ return i.slot == game.currentChestContents.slot;}).length == 0);
		
		if(!slotIsEmpty) {
				
			//game.currentChestContents = item;
			sou_error.play(); 
			log("FOUND " + game.currentChestContents.getName() + ". Can only have one " + game.currentChestContents.slot + " at a time!");
		}
		else if(player.inventory.length < player.maxItems) {
			showItemInfo(game.currentChestContents, false, "chest");
		/*	
			log("FOUND " + game.currentChestContents.getName());
			giveItem(game.currentChestContents);
			chestButton.classList.add("empty");
			game.currentChestContents = null;*/
		}
		else {
			sou_error.play(); 
			showItemInfo(game.currentChestContents, false, "chest");
			log("FOUND " + game.currentChestContents.getName() + ". Inventory full!");
		}
	}
}


function pickDoor(el) {
	
	sou_shop_music.sound.pause();
	sou_mainMenu.sound.pause();

	disableDoors();
	el.classList.add("open");
	sou_door.play();

	if(el.classList.contains("stairs")) { game.floor += 1; }

	setTimeout(fn=>{
		el.classList.add("chosen");
		sou_stairs.play();
		document.body.style.opacity = 0;

		setTimeout(()=>{
			el.classList.remove("chosen");
			el.classList.remove("open");


			setTimeout(()=>{
				document.body.style.opacity=1;
				DOM.doorsElement.innerHTML = "";
				enterPath(el.dataset.level);
			},200,el);

		},500,el);

	}, 500);
}

//chooseDoor, choosePath
function enterPath(difficultyLevel) {

	console.log(difficultyLevel);

	game.roomType = difficultyLevel == "_shop" ? "shop" : "dungeon";
	let isShop = game.roomType == "shop";

	difficultyLevel = Math.min(monsterList.length - 1, (Number.parseInt(difficultyLevel)||0) );
	game.thisRoomDifficulty = difficultyLevel;
	randomizeDoors();
	
	
	chestButton.style.visibility = "hidden";
	chestButton.style.opacity = 0;
	chestButton.classList.remove("empty");
	game.currentChestContents = null;

	if (player.hp <= 0) return

	
	player.hp = Math.min(player.hp + 5, player.getMaxHp())

	if(!isShop) {
		disableDoors();
		

		//generateEnemies, pickEnemies, chooseEnemies, chooseMonsters
		for(let v = 0; v < Math.min(player.level, 1 + Math.floor(Math.random() * (2 + game.floor + difficultyLevel))); v++) {
			
			let enemy = generateEnemy(difficultyLevel);
			

			if(enemy.name == "Pack Rat" && monsters.map(e=>{return e.name;}).indexOf("Pack Rat") != -1) {
				enemy = generateEnemy(difficultyLevel);
			}

			monsters.push(enemy);
		}

		
		log(`You enter the room. There's a ${monsters.map(m=>{ return m.name }).join(", and a ") } here!`)
		updateUI();
		monsterUIInit();
	}
	else {
		showShop();
	}

	saveGame();
}

Array.prototype.shuffle = function () {
    let array = this;
	let currentIndex = array.length;
  
	// While there remain elements to shuffle...
	while (currentIndex != 0) {
  
	  // Pick a remaining element...
	  let randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex--;
  
	  // And swap it with the current element.
	  [array[currentIndex], array[randomIndex]] = [
		array[randomIndex], array[currentIndex]];
	}
    return array;
  }

//generateDoors, createDoors
function randomizeDoors() {

	let numberOfDoors = 1 + Math.round(Math.random() * 3);
	let haveStairs = false;
	let haveShop = false;

	let doors = [0];

	for(let v = 0; v < numberOfDoors; v++) {
		

		
		let dlvl = dice(1,5)-1;
		doors.push(dlvl);

	}

	doors = doors.shuffle();

	doors.forEach((dlvl,v)=>{

		if(!haveShop && game.roomType != "shop" && Math.random() * 100 > 90) { dlvl = "_shop"; haveShop = true; }

		DOM.doorsElement.innerHTML += `
			<button onclick="pickDoor(this)" style = 'background-image:url(dungeon/door${dlvl}.png);' class = 'door' data-level="${
				dlvl
			}">Door ${v}</button>
		`;
	})


	document.querySelectorAll(".door").forEach(door=>{ 

		let dice = Math.floor(Math.random() * 20) + 1;

		if(!haveStairs && dice == 6 && numberOfDoors > 1) { 
			door.style.backgroundImage = `url("dungeon/wee_dung_stair_blue_down.png")`; 
			door.classList.add("stairs"); 
			haveStairs = true;
		}
	});
}
function disableDoors() {
	document.querySelectorAll(".door").forEach(door=>{ 
		door.disabled = true; 
	});
}
function enableDoors() {
	DOM.doorsElement.style.visibility = "visible";
	document.querySelectorAll(".door").forEach(door=>{ 
		door.disabled = false; 
	});
}
function showDialog(port, text) {

	if(itemInfo.classList.contains("open")) {

		if(itemInfo.querySelector("blockquote").innerHTML == text) { return;  }
		itemInfo.classList.remove("open");
		setTimeout(fn=>{ showDialog(port,text); }, 500, port, text);
		return;
	}

	itemInfo.innerHTML = `
		<div class="chatbox">
			<img src="${ port }" alt = "Portrait">
			<blockquote>${ text }</blockquote>
		</div>
	`;
	itemInfo.classList.add("open");
}


function showShop() {

	game.roomType = "shop";

	sou_shop_music.sound.currentTime=0;
	sou_shop_music.play();

	log('"BUY SOMETHING, WILL YOU?"');

	let i1 = db.items.filter(item=>{return game.floor >= item.minimumDropFloor && player.level >= item.minimumDropPlayerLevel; }).chooseRandom();
	i1 = Array.isArray(i1) ? new Item(...i1) : new Item(i1);

	let i2 = db.items.filter(item=>{return game.floor >= item.minimumDropFloor && player.level >= item.minimumDropPlayerLevel; }).chooseRandom();
	i2 = Array.isArray(i2) ? new Item(...i2) : new Item(i2);

	let i3 = db.items.filter(item=>{return game.floor >= item.minimumDropFloor && player.level >= item.minimumDropPlayerLevel; }).chooseRandom();
	i3 = Array.isArray(i3) ? new Item(...i3) : new Item(i3);

	game.itemShopItems = [
		i1,
		i2,
		i3,
		new Item(db.findItem("Healing Potion"))
	];

	game.itemShopItems.forEach(item=>{ item.randomizeStats(); });

	monsterDOM.innerHTML = `
		<img src="monsters/shopkeeper.png" width="80" height="80">
		<button class = 'item shop' data-shop=1 onclick = 'showItemInfo(this);'></button>
		<button class = 'item shop' data-shop=1 onclick = 'showItemInfo(this);'></button>
		<button class = 'item shop' data-shop=1 onclick = 'showItemInfo(this);'></button>
		&nbsp;
		<button class = 'item shop' data-shop=1 onclick = 'showItemInfo(this);'></button>
	`;

	game.itemShopItems.forEach((item,ind)=>{

		let el = monsterDOM.querySelectorAll(".item.shop")[ind];
		
		el.style.backgroundImage = `url("${item.sprite}")`;
		el.dataset.id = item.id;
		
	});
}

function buyItem(el) {

	let item = game.itemShopItems.filter(i=>{return i.id == el.dataset.id;})[0];


	let slotTaken = false;//item.slot != -1 && player.inventory.filter(i=>{return i.slot == item.slot;}).length > 0;

	let inventoryNotFull = player.inventory.length < player.maxItems || (item.consumable && player.inventory.filter(i=>{ return i.getName() == item.getName(); }).length > 0)

	if(player.gold >= item.value && inventoryNotFull && !slotTaken) {

		player.gold -= item.value;
		giveItem(item);
		game.itemShopItems = game.itemShopItems.filter(i=>{return i.id != item.id;})

		let idom = document.querySelector(`.shop.item[data-id="${item.id}"]`);
		idom.style.backgroundImage = "";
		idom.dataset.id = -1;

		sou_buy.play();

		showItemInfo(-1);

		updateInventoryUI();
		updateBars();
		
	}

	else if(player.gold < item.value) { sou_error.play(); log(`"You can't afford that!"`); }
	else if(player.inventory.length >= player.maxItems) { sou_error.play(); log(`"Inventory is full!"`); }
	else if(slotTaken) { sou_error.play();  log(`"You can only have one ${item.slot} at a time!"`); }
}

function sellItem(el) {

	
	let item = player.inventory.filter(i=>{return i.id == el.dataset.id;})[0];

	if(player.slots[item.slot] == item.id) { unequipItem(item.id); }

	player.gold += Math.ceil(item.value * .75);

	if(item.consumable && item.uses > 1) { item.uses--; }
	else { player.inventory = player.inventory.filter(i=>{ return i.id != item.id; }); showItemInfo(-1); }

	sou_sell.play();
	
	updateInventoryUI();
	updateBars();
}



function restart() {

	
	document.querySelector(".name-input").value = "";
	document.querySelector(".class-select").value = "Adventurer";

	document.querySelector("#annoying-splash").classList.remove("scroll");
	document.querySelector("#annoying-splash").classList.remove("show-menu");
	document.querySelector("#annoying-splash").classList.remove("enter");
    document.querySelector(".main-menu").style.height="100vh";
    document.querySelector("#annoying-splash").style.opacity = 1;
    document.querySelector(".main-menu p").innerText = "Tap anywhere to start.";
	
	enemy = null
	monsters = [];
	

	game = {
		roomType: "dungeon",
		itemShopItems: [],
		floor:1,
		enemy: null,
		monsters: [],
		thisRoomDifficulty: 0,
		currentChestContents: null,
		pauseActionForLevelUp: false,
		queuedItemUse: false
	};

	player = Player();
	

		
	giveItem(new Item(db.findItem("Healing Potion")));
	giveItem(new Item(db.findItem("Pyro Scroll")));

	player.hp = player.getMaxHp();
	game.floor = 1
	logDiv.innerText = '';
	
	log("YOU HAVE VENTURED TO THE<br/>DARK PLACES BELOW HAYDEN.<br/><br/>Choose a door to explore.")

	DOM.doorsElement.innerHTML=`
	<button onclick="pickDoor(this)" class = 'door'>Door 1</button>
	<button onclick="pickDoor(this)" class = 'door'>Door 2</button>
	<button onclick="pickDoor(this)" class = 'door'>Door 3</button>
	<button onclick="pickDoor(this)" class = 'door'>Door 4</button>`;

	monsters = [];
	monsterDOM.innerHTML = "";

	updateUI();

	document.body.classList.remove("dead");
}

function renderPlayerStats() {
	
	let primaryDamage = player.getPrimaryDamageType();

	let dmgTypes = {};
	let armTypes = {};

	dmgTypes[primaryDamage+"-low"] = player.dmg + player.numberOfDice;
	dmgTypes[primaryDamage+"-high"] = player.dmg + (player.numberOfDice * player.numberOfSides);

	let effectTypes = {};
	let headings = "";
	let acols = "";
	let dcols = "";

	effectTypes[primaryDamage] = 1;
	
	for(let v in player.slots) {
		let i = player.getItemInSlot(v);
		
		if(i) {



			if(i.dmg != 0) {
				
				effectTypes[i.effectType] = 1;

				dmgTypes[i.effectType + "-low"] = dmgTypes[i.effectType + "-low"] || 0;
				dmgTypes[i.effectType + "-low"] += i.dmg + i.numberOfDice;

				dmgTypes[i.effectType + "-high"] = dmgTypes[i.effectType + "-high"] || 0;
				dmgTypes[i.effectType + "-high"] += i.dmg + (i.numberOfDice * i.numberOfSides);

			}

			if(i.armor != 0) {

				effectTypes[i.armorType] = 1;

				armTypes[i.armorType] = armTypes[i.armorType] || 0;
				armTypes[i.armorType] += i.armor;

				armTypes[i.armorType + "-low"] = armTypes[i.armorType + "-low"] || 0;
				armTypes[i.armorType + "-low"] += i.armor + i.numberOfDice;

				armTypes[i.armorType + "-high"] = armTypes[i.armorType + "-high"] || 0;
				armTypes[i.armorType + "-high"] += i.armor + (i.numberOfDice * i.numberOfSides);
			}

		}
	}

	for(let et in effectTypes) {

		headings += `<td ${player.getPrimaryDamageType() == et ? "data-primary-stat=1" : ""}>${String(et).slice(0,4)}</td>`
		dcols += `<td>${dmgTypes[et + "-low"]||0}-${dmgTypes[et + "-high"]||0}</td>`;
		acols += `<td>${armTypes[et]||0}</td>`;
	}

	for(let v = 0; v < 5 - Object.keys(effectTypes).length; v++) {
		headings += `<td>&nbsp;&nbsp;&nbsp;&nbsp;</td>`;
		dcols += `<td> </td>`;
		acols += `<td> </td>`;
	}

	console.log(dmgTypes)
	let el = `
		<div style="height: 60px;overflow: auto;">
			<table style="border-spacing: 0px;width: 100%;">
				<thead>
					<tr>
						<td></td>
						${headings}
						<!--<td ${player.getPrimaryDamageType() == "physical" ? "data-primary-stat=1" : ""}>Phy</td>
						<td ${player.getPrimaryDamageType() == "magic" ? "data-primary-stat=1" : ""}>Mag</td>
						<td ${player.getPrimaryDamageType() == "holy" ? "data-primary-stat=1" : ""}>Hol</td>
						<td ${player.getPrimaryDamageType() == "poison" ? "data-primary-stat=1" : ""}>Poi</td>
						<td ${player.getPrimaryDamageType() == "curse" ? "data-primary-stat=1" : ""}>Crs</td>-->
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Dmg</td>
						${dcols}
						<!--<td>${dmgTypes["physical-low"]||0}-${dmgTypes["physical-high"]||0}</td>
						<td>${dmgTypes["magic-low"]||0}-${dmgTypes["magic-high"]||0}</td>
						<td>${dmgTypes["holy-low"]||0}-${dmgTypes["holy-high"]||0}</td>
						<td>${dmgTypes["poison-low"]||0}-${dmgTypes["poison-high"]||0}</td>
						<td>${dmgTypes["curse-low"]||0}-${dmgTypes["curse-high"]||0}</td>-->
					</tr>
					<tr>
						<td>Arm</td>
						${acols}
						<!--<td>${armTypes.physical||0}</td>
						<td>${armTypes.magic||0}</td>
						<td>${armTypes.holy||0}</td>
						<td>${armTypes.poison||0}</td>
						<td>${armTypes.curse||0}</td>-->
					</tr>
				</tbody>
			</table>
		</div>`;

	document.querySelector("#player-stat-area").innerHTML = el;
}

//https://codepen.io/zachkrall/pen/MWWGMPx
function bindCritAnimation(){

	let h1 = document.querySelector(".critText");

	h1.innerHTML = h1.innerHTML
		.split("")
		.map(letter => {
		console.log(letter);
		return `<span>` + letter + `</span>`;
		})
		.join("");

	Array.from(h1.children).forEach((span, index) => {
		setTimeout(() => {
			span.classList.add("wavy");
		}, index * 60);
	});

}

document.querySelector("#annoying-splash").onmouseup = fn=>{

	if(document.querySelector("#annoying-splash").classList.contains("show-menu")) { return;}
	actx.resume();
	sou_mainMenu.sound.currentTime=0;
	sou_mainMenu.play();
	sou_slide.play();
	document.querySelector("#annoying-splash").classList.add('show-menu');

	/*document.querySelector("#annoying-splash").style.left='100%';*/
};

function scrollToCharacterSelect() {
	
	document.querySelector("#annoying-splash").classList.add('scroll');

	sou_slide.play();
	DOM.splashScreenP.innerText = "Create Your Character:";
	document.querySelector("#character-creation").style.opacity = 1;
	document.querySelector(".main-menu").style.height = "28vh";
}

function enterDungeon(setNameAndClass=true) {

	if(setNameAndClass) {
		player.name = document.querySelector(".name-input").value;
		player.class = document.querySelector(".class-select").value.toLowerCase();
	}

	if(player.name != "" && (Object.keys(getSavedGames(true)).indexOf(player.name) == -1 || !setNameAndClass)) {

		let i = false;
		
		if(setNameAndClass) {
			if(player.class == "mage") {
				i = giveItem(new Item(db.findItem("Magic Bolt Scroll")));
				i = giveItem(new Item(db.findItem("Apprentice's Tome")));
			}
			if(player.class == "adventurer") {
				i = giveItem(new Item(db.findItem("Rusted Sword")));
			}
			if(player.class == "paladin") {
				i = giveItem(new Item(db.findItem("Rusted Hammer")));
			}
			if(player.class == "rogue") {
				i = giveItem(new Item(db.findItem("Rusted Rogue's Blade")));
			}
			if(player.class == "warlock") {
				i = giveItem(new Item(db.findItem("Cursed Trinket")));
			}
		}

		if(i) { player.slots["weapon"] = i.id; }

		saveGame();
		
		clearSplash();
	}
	else {
		if(player.name == "") { document.querySelector(".error-message").innerHTML = "Enter character name."; }
		else { document.querySelector(".error-message").innerHTML = "Name taken by save."; }
		sou_error.play()
	}
}

function clearSplash() {

	if(document.querySelector("#annoying-splash").classList.contains("enter")) { return; }
	
	updateUI();

	//document.querySelector("#annoying-splash").style.left='100%';
	document.querySelector("#annoying-splash").classList.add("enter");

	document.querySelector("#player-name").innerText = player.name.toUpperCase() + " the " + player.class.toUpperCase();

	setTimeout(fn=>{ document.querySelector("#annoying-splash").style.opacity='0'; },500);
	sou_slide.play();
	sou_mainMenu.sound.pause();
}

function getSavedGames(failGracefully) {

	try {
		let savesRaw = JSON.parse(localStorage.saveGames);
		let filteredSaves = {};
		for(let v in savesRaw) {
			if(typeof v != "undefined" && v != "undefined") { filteredSaves[v] = savesRaw[v]; }
		}
		return filteredSaves;
	}
	catch(e) {
		console.error("Error loading data from localStorage. Your save data might be corrupt!",e);
		return failGracefully ? {} : false;
	}
}

function saveGame(eraseSaveData=false) {

	if(typeof player.name == "undefined") { return false; }

    let existingSaveData = localStorage.saveGames;
    if(!existingSaveData || eraseSaveData) { existingSaveData = {}; }

    try {
        if(typeof existingSaveData == "string") { existingSaveData = JSON.parse(existingSaveData); }
    }
    catch(e) {
        console.error("Error loading data from localStorage. Your save data might be corrupt!",e);
        return false;
    }
    
    let save = { player: { inventory: [] }, game: { id: generateID() } };
    let savable = ["number","string","boolean"];

    for(let prop in player) {
        if(savable.indexOf(typeof player[prop]) != -1) {
            save.player[prop] = player[prop];
        }
    }

	if(typeof player.inventory != "undefined") {

		player.inventory.forEach(item=>{

			let itemCopy = {};

			for(let itemProp in item) {

				if(savable.indexOf(typeof item[itemProp]) != -1) {
					itemCopy[itemProp] = item[itemProp];
				}
			}

			save.player.inventory.push(itemCopy);
		});
	}

	if(typeof player.slots != "undefined") { save.player.slots = player.slots; }

    for(let prop in game) {
        if(savable.indexOf(typeof game[prop]) != -1) {
            save.game[prop] = game[prop];
        }
    }
    
    existingSaveData[player.name] = save;
    
    localStorage.saveGames = JSON.stringify(existingSaveData);

    return true;
}

function renderSavedGames() {

	let games = getSavedGames();
	let savedGameString = "";
	for(let name in games) {

		let game = games[name];
		if(typeof game == "object") {

			game = game.player;

			savedGameString += `
				<div style="
					display: flex;
					justify-content: space-between;
					flex-flow: row nowrap;
					border: 2px #6f6f6f73 groove;
					padding: 6px;
					box-sizing: border-box;
					margin-bottom: .75rem;
					background: #a2a2a2;
					text-shadow: 0px 0px 1px white;">
					<div style="
						flex-grow: 1;
						display: flex;
						align-items: flex-start;
						flex-flow: column;margin-left:.5rem;
						justify-content: center;">
						<div>${String(game.name).toUpperCase()} the ${String(game.class).toUpperCase()}</div>
						<div>LEVEL ${game.level}</div>
					</div>

					${ 
						game.hp <= 0 ? `<button class = 'button' disabled>DEAD</button>` :
						`<button class="button" style="font-size:15px;flex: .2;" onclick = 'loadGame(${JSON.stringify(name)})'>LOAD GAME</button>`
					}
				</div>
			`;
		}
	}
	document.querySelector("#saved-game-area").innerHTML = savedGameString;
}

renderSavedGames();

function generateID() { window.id++; return window.id;}

function loadGame(name) {

	let games = getSavedGames();

	if(typeof games[name] != "undefined") {

		if(typeof games[name].id != "undefined") { window.id = games[name].id }

		player = Player();

		for(let prop in games[name].player) {

			if(prop != "inventory") {

				player[prop] = games[name].player[prop];
			}

			else {
				games[name].player[prop].forEach(item=>{
					//item.id = generateID();
					player.inventory.push(new Item(item));
				});
			}
		}
		for(let prop in games[name].game) {

			game[prop] = games[name].game[prop];
		}

		game.pauseActionForLevelUp = false;

		enterDungeon(false);

		log(`YOU AWAKEN IN THE DEPTHS OF HAYDEN.<BR/>YOU ARE ON FLOOR ${game.floor}.`);

		if(game.roomType == "shop") {
			showShop();
		}
	}

}
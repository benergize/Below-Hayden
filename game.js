window.id = 0;
window.db = {};


setTimeout(fn=>{
	document.body.style.opacity = 1;
}, 500);


let preload = document.querySelector("#preload");
let preloadInner = "";
fetch("/assets/sprites/").then(el=>{return el.json();}).then(el=>{


    el.forEach(spr=>{
        preloadInner += `<img src = "./${spr}">`;
    });
    preload.innerHTML = preloadInner;
	
	document.querySelector("#annoying-splash p").innerText = `Tap anywhere to start.`;
})
.catch(fn=>{
	
	fetch("./data/sprites.cache.json").then(el=>{return el.json();}).then(el=>{


		el.forEach(spr=>{
			preloadInner += `<img src = "./${spr}">`;
		});
		preload.innerHTML = preloadInner;
		
		document.querySelector("#annoying-splash p").innerText = `Tap anywhere to start.`;
	}).catch(fn=>{
		
		document.querySelector("#annoying-splash p").innerText = `Tap anywhere to start.`;
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
document.querySelector("#high-score").innerText = Number.parseInt(localStorage.highScore);
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

const rarityScale = ["junk", "normal", "rare", "epic", "legendary"];
const classes = ["adventurer", "mage", "paladin", "rogue", "warlock"];

enemy = null
monsters = [];


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

function log(msg) {

	logDiv.innerText += msg + "\n"
	logDiv.scrollTop = logDiv.scrollHeight

	lastLog.innerHTML = msg;
}

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

	if(player.dxp < xp) { player.dxp += 1; }
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
		document.querySelector("#high-score").innerText = game.floor;
	}

	updateMonsters();

	updateInventoryUI();

	renderPlayerStats();
	
}

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


function Monster(name, sprite="", hp=5, dmg=1, strongTo=[], weakTo=[]) {

	this.id = window.id;
	window.id++;

	this.numberOfDice = 0;
	this.numberOfSides = 0;
	this.effectType = "physical";


	
	if(typeof name == "object") {
		for(let p in name) {
			this[p] = JSON.parse(JSON.stringify(name[p]));
		}
	}
	else {
		this.hp = hp;
		this.name = name;
		this.sprite = sprite;
		this.maxHp = (hp +  Math.floor(game.floor / 3)) * (game.thisRoomDifficulty+1);
		this.dmg = dmg;
		this.strongTo = strongTo;
		this.weakTo = weakTo;
	}

	this.hp = Number.parseFloat(this.hp);
	this.dmg = Number.parseFloat(this.dmg);

	this.maxHp = (this.hp + Math.floor(game.floor / 3)) * (game.thisRoomDifficulty+1);

	this.hp = this.maxHp;

	this.getName = fn=>{ return this.name; }

	this.attack = fn=>{

		
		sou_punch[Math.floor(Math.random() * sou_punch.length)].play();

		let dmg = this.dmg + (Math.floor(game.floor / 3)) + Math.floor(Math.random() * 6);
		let finalDmg = dmg;

		let shieldText = "";
		let shield = player.getItemInSlot("shield");

		if(shield) {
			
			let roll = dice(shield.numberOfDice, shield.numberOfSides) - shield.numberOfDice;;

			finalDmg = Math.max(0, dmg - roll);

		}

		for(let s in player.slots) {
			let i = player.getItemInSlot(s);

			if(i) {
				if(i.armor > 0) {
					if(this.effectType == i.armorType) {
						
						finalDmg = Math.max(0, finalDmg - i.armor);
					}
				}
			}
		}

		if(finalDmg != dmg) {
			shieldText = ` <span style = 'color:lightgreen;'>&nbsp;- ${(dmg - finalDmg)}`;
		}


		player.hp -= finalDmg;
		log(`The ${this.name} hits you for ${dmg} ${shieldText} damage. `)

		updateUI();
		lockMonsters();

		let mnstr = this;

		document.querySelector(`[data-monster-id="${ this.id }"]`).classList = this.sprite.replace("idle","atk");// .style.animation = document.querySelector(`[data-monster-id="${ this.id }"]`).style.animation.replace("idle","atk");
		setTimeout(fn=>{
			document.querySelector(`[data-monster-id="${ this.id }"]`).classList = mnstr.sprite;
			//document.querySelector(`[data-monster-id="${ this.id }"]`).style.animation = document.querySelector(`[data-monster-id="${ this.id }"]`).style.animation.replace("atk","idle");
		}, 512, mnstr);

		checkIsDefeated();
	};

	this.takeDamage = (dmg, autocull) => { 
		this.hp -= dmg; 
		if(this.hp <= 0 && autocull) { defeatEnemy(this); } 
	}

	this.formatHearts = function() {

		let monsterHearts = "";

		if(this.hp < 10) {
			for(let v = 0; v < this.hp; v++) { monsterHearts += "<span class = 'heart'></span>" } 
		}
		else { monsterHearts = "<span class = 'heart'>&nbsp;x"+this.hp+"</span>"; }

		return monsterHearts;
	}

	return this;
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


function Item(name, desc="", sprite="dungeon/wee_dung_potion_red.png", sound=sou_potion, hp=0, dmg=0, numberOfDice, numberOfSides, consumable=true, uses=1, slot=-1, use = -1) {

	this.id = window.id;
	window.id++;

	this.armor = 0;
	this.armorType = "";

	this.giveStatusEffect = "";
	this.giveStatusEffectTurns = 0;
	this.giveStatusEffectTo = "self";

	this.itemTarget = "foe";

	if(typeof name == "object") {
		for(let p in name) {
			this[p] = JSON.parse(JSON.stringify(name[p]));
		}
	}
	else {
		this.name = name;
		this.desc = desc;
		this.sprite = sprite;
		this.hp = hp;
		this.dmg = dmg;
		this.consumable = consumable;
		this.sound = sound;
		this.uses=uses;
		this.slot = slot;
		this.value = 10;
		this.numberOfDice = numberOfDice;
		this.numberOfSides = numberOfSides;
	}

	this.hp = Number.parseFloat(this.hp)||0;
	this.dmg = Number.parseFloat(this.dmg)||0;

	this.numberOfDice = Number.parseInt(this.numberOfDice)||0;
	this.numberOfSides = Number.parseInt(this.numberOfSides)||0;

	this.minimumDropFloor = Number.parseInt(this.minimumDropFloor);
	this.minimumDropPlayerLevel = Number.parseInt(this.minimumDropPlayerLevel);

	this.armor = Number.parseFloat(this.armor)||0;

	console.log(this);

	if(this.consumable == "true") { this.consumable = true; }
	if(this.consumable == "false") { this.consumable = false; }

	this.getName = function() {

		return this.name;// + " of +" + (this.dmg||this.hp);
	}


	this.getDmg = function() {
		return this.dmg + dice(this.numberOfDice, this.numberOfSides);
	}

	this.getDamageRange = function() {
		if(this.dmg == 0) { return ""; }

		
		let low = (this.dmg + this.numberOfDice);
		let high = (this.dmg + (this.numberOfDice * this.numberOfSides));
		let dmgBonusLow = "";
		let dmgBonusHigh = "";
		
		if(this.slot != "ring") { 
		let ring = player.getItemInSlot("ring");
			if(ring) {
				if(ring.effectType == this.effectType) {

					dmgBonusLow = greenText(" + " + (low * ring.dmg));
					dmgBonusLow = greenText(" + " + (high * ring.dmg));
				}
			}
		}

		return high==low ? (`${high} ${dmgBonusHigh}`) : `${low} ${dmgBonusLow} - ${high} ${dmgBonusHigh}`
	}

	this.getHPRange = function() {

		if(this.hp == 0 && this.slot != "shield") { return ""; }
		let low = (this.slot ==  "shield"?0:this.hp) + this.numberOfDice;
		let high = (this.slot == "shield"?0:this.hp) + (this.numberOfDice * this.numberOfSides);
		
		return high==low ? high : ((low) + "-" + (high));
	}


	if(typeof use == "function") { this.use = use; }
	else {

		this.use = (override=false)=>{
			
			if(this.consumable || override) {
				

				log(`Used ${this.name}...`);
				console.log(this);

				if(monsters.length > 0 && this.dmg != 0) {

					lockMonsters();

					player.attack(monsters, this);
					
				}
				else {

					if(typeof this.sound == "string") {
						try {
							soundRegistry[this.sound].play();
						}
						catch(e){}
						//window[this.sound].play();
					}
					else {
						this.sound.play();
					}

					if(this.hp > 0) {


						player.hp += this.hp + dice(this.numberOfDice, this.numberOfSides);
						log(`...healed for ${this.hp}. `);
					}

					if(player.hp >= player.maxHp) { player.hp = player.maxHp; }

					if(this.giveStatusEffect.trim() != "") {
						player.giveStatusEffect(this.giveStatusEffect, this.giveStatusEffectTurns);
					}

					updateUI();
				}

				this.uses--;

				if(this.uses <= 0) {
					removeItem(this.id);
				}
			}

		}
		
	}

	return this;
}

function removeItem(id) {

	if(typeof id != "number") {id = id.dataset.id; }
	
	document.querySelector(`button.item[data-id="${id}"]`).classList.remove("equipped");
	unequipItem(id);
	
	let itemEl = document.querySelector(`[data-id="${id}"]`);
	itemEl.dataset.id = -1;
	itemEl.style.backgroundImage = "";
	player.inventory = player.inventory.filter(i=>{return i.id != id}); 
	return false;
}

function useItem(el){

	let id = typeof el == "number" ? el : el.dataset.id;

	if(id != -1) {
		let item = player.inventory.filter(item=>{return item.id == id;})[0];
		console.log(item);
		item.use();
	}
}

function equipItem(el) {

	let item = player.inventory.filter(i=>{ return i.id == el.dataset.id; })[0];

	sou_equip.play();

	let sl = player.getItemInSlot(item.slot);

	if(sl) {
		document.querySelectorAll(`button[data-id="${sl.id}"].equipped`).forEach(j=>{j.classList.remove("equipped");});
	}

	document.querySelector(`button.item[data-id="${item.id}"]`).classList.add("equipped");
	player.slots[item.slot] = item.id;

	renderPlayerStats();
	
}
function unequipItem(el) {


	let id = typeof el == "object" ? el.dataset.id : el;
	let item = player.inventory.filter(i=>{ return i.id == id; })[0];
	document.querySelector(`button.item[data-id="${item.id}"]`).classList.remove("equipped");
	player.slots[item.slot] = -1;

	renderPlayerStats();
}

function showItemInfo(el,ignoreOpen=false, initiator="inventory") {

	if(el == -1) {
		sou_menu_close.play();
		return  itemInfo.classList.remove("open");
	}

	let itemId = -1;
	if(typeof el.getName == "function" && el.id != -1) { itemId = el.id; }
	else if(typeof el.dataset != "undefined") { itemId = el.dataset.id }

	if(itemId != -1) {


		if(!ignoreOpen) {
			sou_menu_open.play();
			if(itemInfo.classList.contains("open") && itemInfo.dataset.item == itemId) { itemInfo.classList.remove("open"); }
			else { itemInfo.classList.add("open"); }
		}
		else if(ignoreOpen == "open") {
			itemInfo.classList.add("open");
		}

		itemInfo.dataset.item = itemId;
		
		let isShop = game.roomType == "shop";
		let isShopItem = isShop && el.classList.contains("shop");

		let item = -1;

		if(typeof el.getName == "function") {
			item = el;
		}
		else if(isShopItem) {
			item = game.itemShopItems.filter(i=>{ console.log(i.id); return i.id == itemId; })[0];
		}
		else {
			item = player.inventory.filter(i=>{ console.log(i.id); return i.id == itemId; })[0];
		}

		let dmgRange = item.slot != "ring" ? item.getDamageRange() : ((item.dmg * 100) + "%");
		let hpRange = item.getHPRange();

		console.log(initiator);
		itemInfo.innerHTML = `
			<span class = 'name' data-rarity="${item.rarity}">${ item.getName() }</span><br/>
			<div><small>${item.desc}</small></div>

			<table><tbody><tr>
				${  (dmgRange != "" ? `<td>${dmgRange}<img width=10 height=10 src="ui/sword_mini.png" alt="sword"></td>` : "") }
				${  (hpRange != "" ? `<td>${hpRange}<img width=10 height=10 src="ui/${item.slot!='shield'?'wee_ui_heart.png':'wee_dung_shield.png'}" alt="heart"></td>` : "") }
				${  (item.armor != 0 ? `<td>${item.armor}<img width=10 height=10 src="ui/wee_dung_shield.png" alt="armor"></td>` : "") }
				<td>${ item.consumable ? (item.uses + " uses") : item.slot }</td>
				<td>${ item.effectType||"" }</td>
			</tr></tbody></table>

			${ isShopItem || initiator=="chest" ? "" :
				item.consumable ? 
					`<button class = 'itbtn' onclick = "useItem(this);updateUI();" data-id="${itemId}">USE</button>` :
					((typeof item.slot != "undefined" && item.slot != -1 && item.slot != "") ? (
						player.slots[item.slot] != item.id ? 
						`<button class = 'itbtn'  onclick = "equipItem(this);showItemInfo(this,true);" data-id="${itemId}">EQUIP</button>` :
						`<button class = 'itbtn'  onclick = "unequipItem(this);sou_unequip.play();showItemInfo(this,true);" data-id="${itemId}">UNEQUIP</button>`
					) : "")
			}
			${
				initiator == "chest" ? (
					`<button class = 'itbtn' onclick = "takeItemFromChest()" data-id="${itemId}">TAKE</button>`
				) :
				(isShop ?
				(
					isShopItem ?
						`<button class = 'itbtn'  onclick = "buyItem(this);" data-id="${item.id}">BUY FOR ${item.value}</button>` :
						`<button class = 'itbtn'  onclick = "sellItem(this);" data-id="${item.id}">SELL FOR FOR ${Math.ceil(item.value * .75)}</button>`
				) : "")
			}
			${!isShop?`<button onclick = "removeItem(this);sou_item_drop.play();updateUI();" data-id="${itemId}">DROP</button>`:""}
				
			
		`;
	}
	else {
		itemInfo.classList.remove("open"); 
	}
}

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

function clearItemInfo() {
	itemInfo.innerHTML = "";
}

Array.prototype.chooseRandom = function() {
    return this[Math.round(Math.random() * (this.length-1))]
}


function generateEnemy(difficultyLevel=0) {
	
	
	//let enemy = monsterList[floor-1].chooseRandom();
	let enemy = db.monsterList.flat().filter(m=>{return m.minimumDropFloor == game.floor }).chooseRandom();

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
		console.log(animations)
	})
}

function defeatEnemy(enemy) {

		
	sou_kill_foe.play();
	log(`You defeated the ${enemy.name}!`);



	monsters = monsters.filter(monster=>{ return monster.id != enemy.id; });
	

	//floor += 1 + thisRoomDifficulty;

	//XP = BaseXP * (EnemyLevel ^ EnemyPowerCurve)
	
	player.xp += 10 * (enemy.maxHp ** 1.3) * (game.thisRoomDifficulty+1);
	player.handleLeveling();
	

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

	if (player.hp <= 0) {
		log("You died! Game over.")

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

			let i = gear.concat(items).filter(item=>{ 
				return game.floor >= item.minimumDropFloor && 
				player.level >= item.minimumDropPlayerLevel &&
				rarityScale.indexOf(item.rarity) >= (game.thisRoomDifficulty+1) &&
				(game.thisRoomDifficulty+1) >= rarityScale.indexOf(item.rarity)
			}).chooseRandom();

			let item = Array.isArray(i) ? new Item(...i) : new Item(i);
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
			log("FOUND " + game.currentChestContents.getName() + ". Inventory full!");
		}
	}
}

function giveItem(item) {

	game.currentChestContents = null;

	for(let i = 0; i < player.inventory.length; i++) {

		let it = player.inventory[i];

		if(it.getName() == item.getName() && it.consumable && item.consumable) {

			it.uses += item.uses;
			return;
		}
	}
	
	player.inventory.push(item);
	
	updateInventoryUI()
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
				document.querySelector("#doors").innerHTML = "";
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
		
		for(let v = 0; v < 1 + Math.floor(Math.random() * (2 + game.floor + difficultyLevel)); v++) {
			
			
			let enemy = generateEnemy(difficultyLevel);
			monsters.push(enemy);
		}

		
		log(`You enter the room. There's a ${monsters.map(m=>{ return m.name }).join(", and a ") } here!`)
		updateUI();
		monsterUIInit();
	}
	else {
		showShop();
	}


}

//generateDoors, createDoors
function randomizeDoors() {

	let numberOfDoors = 1 + Math.round(Math.random() * 3);
	let haveStairs = false;
	let haveShop = false;

	for(let v = 0; v < numberOfDoors; v++) {
		

		let dice = Math.random() * 20;

		let dlvl = dice < 16 + (game.floor / 5) ? 0 : Math.floor(20-dice);

		if(!haveShop && game.roomType != "shop" && Math.random() * 100 > 90) { dlvl = "_shop"; haveShop = true; }

		document.querySelector("#doors").innerHTML += `
			<button onclick="pickDoor(this)" style = 'background-image:url(dungeon/door${dlvl}.png);' class = 'door' data-level="${
				dlvl
			}">Door ${v}</button>
		`;
	}


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
	document.querySelector("#doors").style.visibility = "visible";
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
		i3
	];

	monsterDOM.innerHTML = `
		<img src="monsters/shopkeeper.png" width="80" height="80">
		<button class = 'item shop' data-shop=1 onclick = 'showItemInfo(this);'></button>
		<button class = 'item shop' data-shop=1 onclick = 'showItemInfo(this);'></button>
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

	player.gold += Math.ceil(item.value * .75);

	if(item.consumable && item.uses > 1) { item.uses--; }
	else { player.inventory = player.inventory.filter(i=>{ return i.id != item.id; }); showItemInfo(-1); }

	sou_sell.play();
	
	updateInventoryUI();
	updateBars();
}



function restart() {

	
	
	enemy = null
	monsters = [];
	

	game = {
		roomType: "dungeon",
		itemShopItems: [],
		floor:1,
		enemy: null,
		monsters: [],
		thisRoomDifficulty: 0,
		currentChestContents: null
	};

	player = { 
		hp: 20, 
		maxHp: 20, 
		gold: 0, 
		dgold:0,
		dmg: 1,
		level: 1,
		inventory: [], 
		slots: {},
		xp:0,
		dhp: 20,
		dxp: 0,
		maxItems:6,
		class: "adventurer",

		statusEffects: [],

		numberOfDice:1,
		numberOfSides:3,

		giveStatusEffect: function(effect,turns) {
			let efx = player.statusEffects.filter(fx=>{return fx.name == effect;});
			if(efx.length > 0) { efx[0].turns += turns; }
			else {
				player.statusEffects.push({name: effect, turns: Number.parseInt(turns) });
			}
		},

		hasStatusEffect: function(effect) {
			
			let efx = player.statusEffects.filter(fx=>{return fx.name == effect;});
			return efx.length > 0;
		},

		manageStatusEffects: function() {
			player.statusEffects.forEach(el=>{el.turns--;});
			player.statusEffects = player.statusEffects.filter(el=>{ return el.turns > 0; });
		},
	
		getXPToNextLevel: fn=>{ return 100 * (player.level ** 3); },
		handleLeveling: function() {
	
	
			let xpToNextLevel = player.getXPToNextLevel();
	
			//XPToLevel(n) = XPBase * (n ^ LevelCurve)
	
			//document.querySelector("#xpbar div").style.width = ((player.xp / xpToNextLevel) * 100) + "%"
	
			if(player.xp > xpToNextLevel) {
				
	
				document.querySelector("#level-up").classList.toggle("level-up-slide");
	
				sou_level_up.play();

				document.querySelector(".pick-upgrade").classList.add("show");
	
				player.hp = player.getMaxHp();
				player.level++;
				player.xp = 0;
	
			}
		},
		upgradeStat:function(stat) {

			if(stat == "hp") {
				player.maxHp += 10;
				sou_hp_upgrade.play();
			}
			
			if(stat == "dmg") {
				player.dmg++;
				sou_dmg_upgrade.play();
			}
			
			player.hp = player.getMaxHp();
			updateBars();
			renderPlayerStats();
			document.querySelector(".pick-upgrade").classList.remove("show")
		},
		getPrimaryDamageType: function() {
			
			let primaryDamage = "physical";
			if(player.class == "mage") { primaryDamage = 'magic'; }
			if(player.class == "paladin") {primaryDamage = 'holy'; }
			if(player.class == "rogue") { primaryDamage = 'poison'; }
			if(player.class == "warlock") { primaryDamage = 'curse'; }
			return primaryDamage;
		},
		getDmg: function(){ 
			let d = 0;//this.dmg;
			let damageSources = {};

			
			
			if(player.class == "adventurer") { damageSources['physical'] = this.dmg; }
			if(player.class == "mage") { damageSources['magic'] = this.dmg; }
			if(player.class == "paladin") { damageSources['holy'] = this.dmg; }
			if(player.class == "rogue") { damageSources['poison'] = this.dmg; }
			if(player.class == "warlock") { damageSources['curse'] = this.dmg; }
	
			for(let slot in player.slots) {
				let i = this.getItemInSlot(slot);
	
				
				if(i) { 
					
					if(slot != "ring") {
	
						damageSources[i.effectType] += i.getDmg();
					}
				}
			}
	
			let ring = player.getItemInSlot("ring");
	
			if(ring) {
				for(let d in damageSources) {
	
					if(typeof damageSources[ring.effectType] == "number") {
	
						d += damageSources[ring.effectType] * ring.dmg; 
					}
				}
			}
			
			return d; 
		},
		getItemInSlot: slot=> {
			
			if(typeof player.slots[slot] != "undefined" && player.slots[slot] != -1 && player.slots[slot] != "") {
				return player.inventory.filter(i=>{ return player.slots[slot] == i.id; })[0];
			}
	
			return false;
		},
		getMaxHp: function(){
			let d = this.maxHp; 
	
			for(let v in player.slots) {
				let i = player.getItemInSlot(v);
				if(i) { d += i.hp; }
			}
			
			return d; 
		},
		attack: function(targets, item=false) {
			
	
			let critDelay = 0;
	
			let playerWeapon = item || player.getItemInSlot("weapon");

			console.log(targets);
			let initialtarget = typeof targets == "number" ? targets : (Array.isArray(targets) ? targets[0]?.id : targets.id);
			console.log(initialtarget);


			if(playerWeapon && playerWeapon.itemTarget == "all-foes") { 
				
				targets = monsters.sort((a,b)=>{ return Math.abs(a.id-initialtarget) < Math.abs(b.id-initialtarget) ? -1 : 1; });
				

				console.log(targets);
				
				console.log('all foes');
			}
			
			if(!Array.isArray(targets)) { targets = [targets]; }
			
	
			//Run through each of our targets and deal damage/play sound/animation
			targets.forEach((monster,ind)=>{
	
				if(typeof monster == "number") { monster = monsters.filter(m=>{return m.id == monster; })[0]; }
	
				setTimeout(fn=>{
	
					let logText = "";
					let bonuses = "";
	
					let crit = false;
					let playerDmg = item ? item.getDmg() : Math.floor(player.getDmg() + dice(player.numberOfDice, player.numberOfSides));
	
					if(playerWeapon && typeof monster.weakTo != "undefined") {
						if(monster.weakTo.indexOf(playerWeapon.effectType) != -1) {
							bonuses += (` <span style = 'color:lightgreen;'>&nbsp;+ ${Math.abs(playerDmg - (playerDmg * 1.5))}</span>`); 
							playerDmg = Math.abs(playerDmg);
							playerDmg *= 1.5; 
						}
	
					}
					if(playerWeapon && typeof monster.strongTo != "undefined") {
						if(monster.strongTo.indexOf(playerWeapon.effectType) != -1 ) { 
							bonuses += (` <span style = 'color:red;'>&nbsp;- ${Math.abs(playerDmg - (playerDmg / 1.5))}</span>`); 
							playerDmg /= 1.5; 
						}
					}
	
	
					if(dice(1,20) > 18 || (player.hasStatusEffect("crit"))) {
						logText += "<span class = 'critText'>CRITICAL HIT!</span>&nbsp;";
						playerDmg *= 2;
						crit = true;
						critDelay += 500;
	
						sou_crit.play();
					}
	
					if(item) {
						if(typeof item.sound == "string") { soundRegistry[item.sound].play() }
						else { item.sound.play(); }
					}
					else {
						sou_punch[Math.floor(Math.random() * sou_punch.length)].play();
					}
	
					monster.takeDamage(playerDmg, false);
					
					setTimeout(fn=>{
						let d = document.querySelector(`[data-monster-id="${monster.id}"]`);
						if(d != null) {
							document.querySelector(`[data-monster-id="${monster.id}"]`).classList.add("shake");
							setTimeout(()=>{document.querySelector(`[data-monster-id="${monster.id}"]`).classList.remove("shake");},500 );
	
						}
					},1, monster);
	
					log(`${logText} Hit ${monster.name} for ${playerDmg}${bonuses}.`);
	
					if(crit) { bindCritAnimation(); }
	
					updateUI();
					lockMonsters();
	
				}, 500 * ind);
			});
	
	
			//After we've hit all our targets, check if anyone/everyone is dead and remove them.
			setTimeout(fn=>{
	
				updateUI();
	
				let delay = 1;
	
				monsters.forEach((monster,ind)=>{
	
					if(monster.hp <= 0) {
	
	
						setTimeout(fnz=>{
	
								
							defeatEnemy(monster);
	
						},delay);
	
						delay += 350;
					}
	
				});
	
				if(!player.hasStatusEffect("haste")) {
					setTimeout(fn=>{
						monsterTurn();
					}, delay);
				}
				else {
					player.manageStatusEffects();
					setTimeout(fn=>{
						unlockMonsters();
						log("YOUR TURN.");
					},500);
				}

	
				//unlockMonsters();
	
			}, (targets.length * 500) + 250 + critDelay);
	
		}
	};
	

		
	giveItem(new Item(db.findItem("Healing Potion")));
	giveItem(new Item(db.findItem("Pyro Scroll")));

	player.hp = 20
	game.floor = 1
	logDiv.innerText = '';
	
	log("YOU HAVE FOUND YOURSELF BELOW.<br/>Choose a door to explore.")

	document.querySelector("#doors").innerHTML=`
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
	
	for(let v in player.slots) {
		let i = player.getItemInSlot(v);
		console.log(i);
		if(i) {

			

			if(i.dmg != 0) {
				dmgTypes[i.effectType + "-low"] = dmgTypes[i.effectType + "-low"] || 0;
				dmgTypes[i.effectType + "-low"] += i.dmg + i.numberOfDice;

				dmgTypes[i.effectType + "-high"] = dmgTypes[i.effectType + "-high"] || 0;
				dmgTypes[i.effectType + "-high"] += i.dmg + (i.numberOfDice * i.numberOfSides);
			}

			if(i.armor != 0) {
				armTypes[i.armorType] = armTypes[i.armorType] || 0;
				armTypes[i.armorType] += i.armor;

				armTypes[i.armorType + "-low"] = armTypes[i.armorType + "-low"] || 0;
				armTypes[i.armorType + "-low"] += i.armor + i.numberOfDice;

				armTypes[i.armorType + "-high"] = armTypes[i.armorType + "-high"] || 0;
				armTypes[i.armorType + "-high"] += i.armor + (i.numberOfDice * i.numberOfSides);
			}
		}
	}

	console.log(dmgTypes)
	let el = `
		<div style="height: 60px;overflow: auto;">
			<table style="border-spacing: 0px;width: 100%;">
				<thead>
					<tr>
						<td></td>
						<td>Phy</td>
						<td>Mag</td>
						<td>Hol</td>
						<td>Poi</td>
						<td>Crs</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Dmg</td>
						<td>${dmgTypes["physical-low"]||0}-${dmgTypes["physical-high"]||0}</td>
						<td>${dmgTypes["magic-low"]||0}-${dmgTypes["magic-high"]||0}</td>
						<td>${dmgTypes["holy-low"]||0}-${dmgTypes["holy-high"]||0}</td>
						<td>${dmgTypes["poison-low"]||0}-${dmgTypes["poison-high"]||0}</td>
						<td>${dmgTypes["curse-low"]||0}-${dmgTypes["curse-high"]||0}</td>
					</tr>
					<tr>
						<td>Arm</td>
						<td>${armTypes.physical||0}</td>
						<td>${armTypes.magic||0}</td>
						<td>${armTypes.holy||0}</td>
						<td>${armTypes.poison||0}</td>
						<td>${armTypes.curse||0}</td>
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
	actx.resume();
	
	sou_mainMenu.play();
	document.querySelector("#annoying-splash p").innerText = "Who are you?";
	document.querySelector("#character-creation").style.opacity = 1;

	/*document.querySelector("#annoying-splash").style.left='100%';*/
};

function enterDungeon() {
	player.name = document.querySelector(".name-input").value;
	player.class = document.querySelector(".class-select").value.toLowerCase();

	if(player.name != "") {
		clearSplash();
	}
}

function clearSplash() {
	//document.querySelector("#annoying-splash").style.left='100%';
	document.querySelector("#annoying-splash").classList.add("enter");
	document.querySelector("#annoying-splash").style.transition="scale 2s ease-in, opacity 2s";
	document.querySelector("#annoying-splash").style.scale='36 36';

	setTimeout(fn=>{ document.querySelector("#annoying-splash").style.opacity='0'; },500);
	sou_slide.play();
	sou_mainMenu.sound.pause();
}
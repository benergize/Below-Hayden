
function Item(name, desc="", sprite="dungeon/wee_dung_potion_red.png", sound=sou_potion, hp=0, dmg=0, numberOfDice, numberOfSides, consumable=true, uses=1, slot=-1, use = -1) {

	this.id = generateID();

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

	this.value = Number.parseInt(this.value);

	console.log(this);

	if(this.consumable == "true") { this.consumable = true; }
	if(this.consumable == "false") { this.consumable = false; }

	this.initialQuantity = this.consumable ? this.uses : 1;

	this.getName = function() {

		return this.name;// + " of +" + (this.dmg||this.hp);
	}

	this.getSellPrice = function() {

		return this.value / Math.max(1,this.initialQuantity);
	}

	this.randomizeStats = function() {

		let randomRange = 4;

		let statList = ["hp", "dmg", "armor"];

		statList.forEach(stat=>{

			console.log(stat,this[stat]);

			let randomLow = (-(randomRange/2)) - Math.max(0,(rarityScale.indexOf(this.rarity)-1));
			let randomHigh = (randomRange) + Math.max(0,(rarityScale.indexOf(this.rarity)-1));
			if(this[stat] != 0) {
				let initVal = this[stat];
				this[stat] = (this[stat] + randomLow) + Math.round(Math.random() * randomHigh);
				if(this[stat] == 0) { this[stat] = 1; }
				this.value += this[stat] - initVal;
				console.log(this[stat],initVal,this.value);
			}
		});


		if(dice(1,100) == 99 && this.rarity != "junk") {
			this.rarity = rarityScale[Math.min(rarityScale.length-1, rarityScale.indexOf(this.rarity) + 1)];
			this.dmg = Math.abs(this.dmg * 2);
			this.hp = Math.abs(this.hp * 2);
			this.armor = Math.abs(this.armor * 2);
			this.name = ["Moritan", "Ingell", "Shaka", "Glameran", "Drogar", "Stonefist","Bladik"].chooseRandom() + "'s " + this.name;
		}
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

		let bonus = 0;
		
		if(this.consumable) {
			let pdmg = player.getDmg(this.effectType,true);
			bonus += pdmg;

			if(pdmg > 0) {
				dmgBonusLow += greenText(" + " + (bonus));
				dmgBonusHigh += greenText(" + " + (bonus));
			}
		}
		
		if(this.slot != "ring") { 
		let ring = player.getItemInSlot("ring");
			if(ring) {
				if(ring.effectType == this.effectType) {

					dmgBonusLow += greenText(" + " + (low * ring.dmg));
					dmgBonusHigh += greenText(" + " + (high * ring.dmg));
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

				let itemTarget = this.itemTarget;

				if(itemTarget == "all-foes") {

					if(monsters.length > 0) {
						lockMonsters();

						player.attack(monsters, this);
					}
					else {
						log("No targets!");
						return sou_error.play();
					}
					
				}
				else if(itemTarget == "single-foe") {

					game.queuedItemUse = this;
					log("Select a target:");
				}
				else if(itemTarget == "self") {

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
function Monster(name, sprite="", hp=5, dmg=1, strongTo=[], weakTo=[]) {

	this.id = generateID();

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

	this.statusEffects = [];

	this.turns = 0;


	this.giveStatusEffect = function(effect,turns) {
		let efx = this.statusEffects.filter(fx=>{return fx.name == effect;});
		if(efx.length > 0) { efx[0].turns += turns; }
		else {
			this.statusEffects.push({name: effect, turns: Number.parseInt(turns) });
		}
	}

	this.hasStatusEffect = function(effect) {
		
		let efx = this.statusEffects.filter(fx=>{return fx.name == effect;});
		return efx.length > 0;
	}

	this.manageStatusEffects = function() {
		this.statusEffects.forEach(el=>{el.turns--;});
		this.statusEffects = this.statusEffects.filter(el=>{ return el.turns > 0; });
	}


	this.attack = fn=>{

		this.turns++;

		if(this.name == "Pack Rat") {

			if(this.turns > 5) {
				document.querySelector(`[data-monster-container="${this.id}"]`).style.marginLeft = "150vw";
				let who = this;
				sou_packrat_lost.play();
				setTimeout(fn=>{ defeatEnemy(who);},500,who);
				return;
			}
		}

		if(game.pauseActionForLevelUp) { return; }

		
		sou_punch[Math.floor(Math.random() * sou_punch.length)].play();

		let dmg = this.dmg + dice(this.numberOfDice, this.numberOfSides);
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
						
					finalDmg = Math.max(0, finalDmg - (this.effectType == i.armorType ? i.armor : (i.armor / 2) ));
					
				}
			}
		}

		let statusEffectText = "";
		if(this.hasStatusEffect("dazed")) { 
			statusEffectText += `${this.name} is DAZED!`; 
			finalDmg -= Math.round(finalDmg * (Math.random() * .65));
		}
		if(this.hasStatusEffect("poisoned")) {
			

			let poisonDamage = player.getDmg("poison");

			if(this.strongTo.indexOf("poison") != -1) { poisonDamage /= 2; }

			statusEffectText += ` ${this.name} takes ${poisonDamage} damage!`;
			if(this.takeDamage(1 + (poisonDamage / 2), true)) {
				return log(`${this.name} falls to poison!`);
			}
		}

		if(finalDmg != dmg) {
			shieldText = ` <span style = 'color:lightgreen;'>&nbsp;- ${dmg - finalDmg}`;
		}


		player.hp -= finalDmg;
		log(`The ${this.name} hits you for ${dmg} ${shieldText} damage. ${statusEffectText}`)

		this.manageStatusEffects()
		updateUI();

		//Re-lock monsters because of updateUI re-creating them. Whatever.
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

		//Take damage. Duh.
		this.hp -= dmg; 
		

		//Pack Rat has its own special behavior that just needs its own lil if statement here
		if(this.name == "Pack Rat") {

			//If we're being hit and we have less than 20% of our starting health, we drop our loot
			if(this.hp <= this.maxHp / 5) {

				document.querySelector(`[data-monster-container="${this.id}"]`).style.marginLeft = "150vw";
				let who = this;
				sou_packrat_caught.play();
				
				//Halt combat for choreography reasons. Not sure if this is working.
				game.pauseActionForLevelUp=true;

				//Special defeat enemy version that makes the rat scurry off screen. It's cute.
				setTimeout(fn=>{ defeatEnemy(who); },500, who);
				
				return;
			}
		}
		
		//If we have no HP and we've been told to cull, cull.
		if(this.hp <= 0 && autocull) { defeatEnemy(this); return true; }

		//False return indicates we're still here, ie, haven't culled.
		return false; 
	}

	this.formatHearts = function() {

		let monsterHearts = "";

		if(this.hp < 10) {
			for(let v = 0; v < this.hp; v++) { monsterHearts += "<span class = 'heart'></span>" } 
		}
		else { monsterHearts = "<span class = 'heart'>&nbsp;x"+ (this.name == "Pack Rat" ? "?" : this.hp) +"</span>"; }

		return monsterHearts;
	}

	return this;
}
//Not a proper constructor function, smite me. We'll refactor this at some point. Good enough for now.
function Player() {
	return { 
		hp: 35, 
		maxHp: 35, 
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

				game.pauseActionForLevelUp = true;

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
				player.dmg += 2;
				sou_dmg_upgrade.play();
			}
			
			player.hp = player.getMaxHp();

			game.pauseActionForLevelUp = false;
			unlockMonsters();
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
		getDmg: function(specificDamageSource = false, ignoreOthers=false){

			let d = 0;//this.dmg;
			let damageSources = {};

			let primaryDamage = player.getPrimaryDamageType();

			if(specificDamageSource) { 
				d += primaryDamage == specificDamageSource ? player.dmg : (ignoreOthers ? 0 : player.dmg / 4); }

			damageSources[primaryDamage] = this.dmg;

			for(let slot in player.slots) {
				let i = this.getItemInSlot(slot);

				if(i) { 
					
					if(slot != "ring") {

						if(typeof i.dmg == "number" && i.dmg != 0) {

							damageSources[i.effectType] = (damageSources[i.effectType] || 0) + i.getDmg();

							if(specificDamageSource && i.effectType == specificDamageSource) { d += i.dmg; }
						}
					}
				}
			}

			let ring = player.getItemInSlot("ring");

			if(ring) {
				for(let d in damageSources) {

					if(typeof damageSources[ring.effectType] == "number") {

						if(!specificDamageSource || (specificDamageSource && ring.effectType == specificDamageSource)) {
							d += damageSources[ring.effectType] * ring.dmg; 
						}

					}
				}
			}

			if(specificDamageSource) { return d; }
			else {
				for(let ds in damageSources) { d += damageSources[ds]; }
				
				return d; 
			}
		},
		rollDamage: fn=>{

			let equipped = player.getItemInSlot("weapon");
			let dmgType = equipped ? equipped.effectType : "physical";

			let d = player.getDmg(dmgType) + dice(player.numberOfDice, player.numberOfSides);
			//if(dmgType != getPrimaryDamageType && !equipped)

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
		heal: amt=> {
			player.hp += amt;
			if(player.hp > player.getMaxHp()) {
				player.hp = player.getMaxHp();
			}
		},
		attack: function(targets, item=false) {
			

			let critDelay = 0;

			let playerWeapon = item || player.getItemInSlot("weapon");
			let itemTarget = "single-foe";

			if(game.queuedItemUse) { 
				item = game.queuedItemUse; 
			}
			
			let initialtarget = typeof targets == "number" ? targets : (Array.isArray(targets) ? targets[0]?.id : targets.id);
			
			

			if(playerWeapon && (playerWeapon.itemTarget == "all-foes" || playerWeapon.itemTarget == "cleave")) {

				itemTarget = playerWeapon.itemTarget;
				
				targets = monsters.sort((a,b)=>{ return Math.abs(a.id-initialtarget) < Math.abs(b.id-initialtarget) ? -1 : 1; });
				
			}

			
			
			if(!Array.isArray(targets)) { targets = [targets]; }
			

			//Run through each of our targets and deal damage/play sound/animation
			targets.forEach((monster,ind)=>{

				if(typeof monster == "number") { monster = monsters.filter(m=>{return m.id == monster; })[0]; }

				setTimeout(fn=>{

					let logText = "";
					let bonuses = "";

					let crit = false;
					let playerDmg = item ? item.getDmg() : Math.floor(player.rollDamage());

					if(item) {
						playerDmg += player.getDmg(item.effectType);
					}

					//If this isn't the initial target and it's a cleave attack, reduce the damage per cleave
					if(itemTarget == "cleave" && ind != 0) { playerDmg *= .5; }

					if(playerWeapon && typeof monster.weakTo != "undefined") {
						if(monster.weakTo.indexOf(playerWeapon.effectType) != -1) {
							bonuses += (` <span style = 'color:lightgreen;'>&nbsp;+ ${Math.round(Math.abs(playerDmg - (playerDmg * 1.5)))}</span>`); 
							playerDmg = Math.abs(playerDmg);
							playerDmg *= 1.5; 
						}

					}
					if(playerWeapon && typeof monster.strongTo != "undefined") {
						if(monster.strongTo.indexOf(playerWeapon.effectType) != -1 ) { 
							bonuses += (` <span style = 'color:red;'>&nbsp;- ${Math.round(Math.abs(playerDmg - (playerDmg / 1.5)))}</span>`); 
							playerDmg /= 1.5; 
						}
					}

					//Critical hit~!
					if(dice(1,20) > 18 || (player.hasStatusEffect("crit"))) {
						logText += "<span class = 'critText'>CRITICAL HIT!</span>&nbsp;";
						playerDmg *= 2;
						crit = true;
						critDelay += 500;

						sou_crit.play();
					}

					if(item) {
						try {
							if(typeof item.sound == "string") { soundRegistry[item.sound].play() }
							else { item.sound.play(); }
						}
						catch(e) { console.warn("Failed to play sound!"); }
					}
					else {
						sou_punch[Math.floor(Math.random() * sou_punch.length)].play();
					}

					monster.takeDamage(playerDmg, false);
					
					setTimeout(fn=>{
						let d = document.querySelector(`[data-monster-id="${monster.id}"]`);
						if(d != null) {
							document.querySelector(`[data-monster-id="${monster.id}"]`).classList.add("shake");
							setTimeout(()=>{
								let d = document.querySelector(`[data-monster-id="${monster.id}"]`);
								if(d != null) {
									d.classList.remove("shake");
								}
							},500);

						}
					},1, monster);

					let statusEffectText = "";
					if(typeof playerWeapon.giveStatusEffect != "undefined" && playerWeapon.giveStatusEffect.trim() != "") {
						monster.giveStatusEffect(playerWeapon.giveStatusEffect, playerWeapon.statusEffectTurns);
						statusEffectText = `${monster.name} is ${playerWeapon.giveStatusEffect}.`;
					}

					if(playerWeapon) {
						if(playerWeapon.effectType == "holy" && player.getPrimaryDamageType() == "holy") {
							if(dice(1,20) > 12) {
								player.heal(playerDmg / 4);

								statusEffectText += "&nbsp;<span style = 'color:palegoldenrod'>Healed for " + (playerDmg/4) + ".</span>";
							}
						}
					}

					log(`${logText} Hit ${monster.name} for ${Math.round(playerDmg)}${bonuses}. ${statusEffectText}`);

					if(crit) { bindCritAnimation(); }

					updateUI();
					lockMonsters();

				}, 500 * ind, itemTarget);
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
						game.queuedItemUse = false;
					}, delay);
				}
				else {
					player.manageStatusEffects();
					setTimeout(fn=>{
						unlockMonsters();
						log("YOUR TURN.");
						game.queuedItemUse = false;
					},500);
				}


				//unlockMonsters();

			}, (targets.length * 500) + 250 + critDelay);

		}
	};
}
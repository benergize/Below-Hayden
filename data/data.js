//UNUSED! SEE DATA>JSON!

//name, desc, sprite="wee_dung_potion_red.png", sound=sou_potion, hp=0, dmg=0, numberOfDice, numberOfSides consumable=true, uses=1, slot=-1, effectType

window.items = [
	["Healing Potion", "Heal yourself", "dungeon/wee_dung_potion_red.png", "sou_potion", 10, 0, 1, 6, true, 1],
	["Pyro Scroll", "Cast fire spell on all enemies", "dungeon/wee_dung_scroll.png", "sou_fire", 0, 1, 1, 3, true, 1 + Math.floor(Math.random() * 3), -1, "magic"],
];

window.gear = [
	["Sword", "Deal extra damage", "dungeon/wee_dung_sword.png", -1, 0, 3, 1, 4, false, 1, "weapon", "physical"],
	["Axe", "A blade which does cleaving damage.", "dungeon/axe.png", -1, 0, 2, 1, 3, false,1, "weapon", "physical"],
	["Cursed Blade", "A sword carrying a curse.", "dungeon/wee_dung_sword.png", -1, 0, -4, 0,0, false, 1, "weapon", "magic"],

	["Helm", "Increase max HP", "dungeon/wee_dung_helm.png", -1, 4, 0, false, 1, 0,0, "helm"],
];

//name, sprite, hp=5, dmg=1, strongTo=[], weakTo=[]

window.monsterList = [
	[
		["Slime", "wee_mons_slime_idle_d_1.png",5,1], 
		["Bat", "wee_mons_bat_atk_l_1.png",5,1], 
		["Goblin", "wee_mons_gobwar_idle_d_2.png",6,3], 
	],
	[
		["Ghost", "wee_mons_ghost_atk_d_1.png",6,1, ["physical"], ["magic"]],
		["Skeleton", "wee_mons_skelshield_atk_u_2.png",9,4],
		["Evil Eye", "wee_mons_eye_idle_d_2.png",12,1], 
		["Zombie", "wee_mons_zombie_atk_d_1.png",14,3]
	],
	[
		["Red Mage", "wee_mons_mage_atk_d_2.png", 24, 6],
		["Necromancer", "wee_mons_necro_idle_d_2.png", 26, 8]
	],
	[
		["Reaper", "wee_mons_reaper_atk_d_1.png", 99, 30]
	],
];
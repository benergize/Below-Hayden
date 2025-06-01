//name, desc, sprite="wee_dung_potion_red.png", sound=sou_potion, hp=0, dmg=0, numberOfDice, numberOfSides consumable=true, uses=1, slot=-1

window.items = [
	["Healing Potion", "Heal yourself", "dungeon/wee_dung_potion_red.png", sou_potion, 10, 0, 1, 6, true, 1],
	["Pyro Scroll", "Cast fire spell on all enemies", "dungeon/wee_dung_scroll.png", sou_fire, 0, 1, 1, 3, true, 1 + Math.floor(Math.random() * 3)],
];

window.gear = [
	["Sword", "Deal extra damage", "dungeon/wee_dung_sword.png", sou_potion, 0, 3, 1, 4, false, 1, "weapon"],
	["Axe", "A blade which does cleaving damage.", "dungeon/axe.png", sou_potion, 0, 2, 1, 3, false,1, "weapon"],
	["Cursed Blade", "A sword carrying a curse.", "dungeon/wee_dung_sword.png", sou_potion, 0, -4, 0,0, false, 1, "weapon"],

	["Helm", "Increase max HP", "dungeon/wee_dung_helm.png", sou_potion, 4, 0, false, 1, 0,0, "helm"],
];
/*
var sou_die = new Sound("x","https://benergize.com/like_a_rogue/sound/die.wav",.1);
var sou_error = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Interactions/sfx_sounds_interaction22.wav",.1);
var sou_hit1 = new Sound("x","https://benergize.com/like_a_rogue/sound/hit1.wav",.1);
var sou_hit2 = new Sound("x","https://benergize.com/like_a_rogue/sound/hit2.wav",.1);
var sou_key = new Sound("x","https://benergize.com/like_a_rogue/sound/key.wav",.1);
var sou_pot = new Sound("x","https://benergize.com/like_a_rogue/sound/pot.wav",.1);
var sou_chest = new Sound("x","https://benergize.com/like_a_rogue/sound/chest.wav",.1);
var sou_sneak = new Sound("x","https://benergize.com/like_a_rogue/sound/sneak.wav",.1);

*/

function Sound(unused, src, volume){
	this.sound = new Audio(src);
	this.sound.volume = volume;
	this.play = fn=>{this.sound.play()};
	return this;
}

//Combat
var sou_poisoned = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Buttons/sfx_sounds_button4.wav",.1);
var sou_punch = []; 
sou_punch[0] = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/Weapons/Melee/sfx_wpn_punch1.wav",.1);
sou_punch[1] = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/Weapons/Melee/sfx_wpn_punch2.wav",.1);
sou_punch[2] = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/Weapons/Melee/sfx_wpn_punch3.wav",.1);
sou_punch[3] = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/Weapons/Melee/sfx_wpn_punch4.wav",.1);

var sou_crit = new Sound("x", "sounds/sfx_sound_neutral10.wav",.2);

var sou_menu_open = new Sound("x", "sounds/sfx_menu_move2.wav",.2);
var sou_item_drop = new Sound("x", "sounds/sfx_sounds_impact1.wav",.2);
var sou_level_up = new Sound("x", "sounds/level up.wav",.2);


var sou_gameover = new Sound("x", "sounds/game over.wav",.2);
var sou_shop_music = new Sound("x", "sounds/menu music.wav",.2);
sou_shop_music.sound.loop = true;


var sou_damage_foe = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General%20Sounds/Impacts/sfx_sounds_impact2.wav",.1);
var sou_kill_foe = new Sound("x", "sounds/sfx_exp_shortest_soft1.wav",.2);


//Pickups
var sou_foundSomethingSm = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Coins/sfx_coin_double1.wav",.1);
var sou_foundSomethingMd = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Coins/sfx_coin_cluster3.wav",.1);
var sou_foundSomethingLg = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Menu Sounds/sfx_menu_select4.wav",.1);
var sou_plant = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Interactions/sfx_sounds_interaction22.wav",.1);
	
var sou_emptyChest = new Sound("x","https://benergize.com/like_a_rogue/sound/hit2.wav",.1);
var sou_chest_fadeIn = new Sound("", "sounds/sfx_sounds_interaction20.wav",.2);

var sou_fire = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General%20Sounds/Interactions/sfx_sounds_interaction26.wav",.1);

//Consumables
var sou_potion = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Positive Sounds/sfx_sounds_powerup6.wav",.1);

//Movement
var sou_door = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/Movement/Opening Doors/sfx_movement_dooropen1.wav",.1);
var sou_footstep = [];
sou_footstep[0] = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/Movement/Footsteps/sfx_movement_footsteps1a.wav",.1);
sou_footstep[1] = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/Movement/Footsteps/sfx_movement_footsteps1b.wav",.1);
var sou_stairs = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/Movement/Footsteps/sfx_movement_footstepsloop4_fast.wav",.1);
/*
//System
var sou_pause = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Pause Sounds/sfx_sounds_pause1_in.wav",.1);
var sou_unpause = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Pause Sounds/sfx_sounds_pause1_out.wav",.1);
var sou_tick = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Menu Sounds/sfx_menu_move1.wav",.1);
var sou_abtn = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Menu Sounds/sfx_menu_move2.wav",.1);
var sou_bbtn = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Menu Sounds/sfx_menu_move3.wav",.1);

//Inventory Page
var sou_drop = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Neutral Sounds/sfx_sound_neutral11.wav",.1);
var sou_equip = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Interactions/sfx_sounds_interaction10.wav",.1);
var sou_equipMagic = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Neutral Sounds/sfx_sound_neutral10.wav",.1);
var sou_unequip = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Interactions/sfx_sounds_interaction9.wav",.1);
var sou_learn = new Sound("x","https://benergize.com/like_a_rogue/sound/sfx/General Sounds/Weird Sounds/sfx_sound_bling.wav",.1);
*/
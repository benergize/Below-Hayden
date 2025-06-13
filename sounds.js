window.actx = new AudioContext(); 

window.soundRegistry = {};

function Sound(unused, src, volume){
	this.sound = new Audio(src);

	window.soundRegistry[src] = this;

	this.sound.crossOrigin = "anonymous";
	
	this.track = new MediaElementAudioSourceNode(window.actx, {
		mediaElement: this.sound,
	});
	
	this.gain = new GainNode(window.actx);

	this.track.connect(this.gain).connect(window.actx.destination);

	this.sound.volume = volume;
	this.play = fn=>{ this.sound.play()};

	return this;
}

//Combat
var sou_poisoned = new Sound("x","sounds/sfx_sounds_button4.wav",.1);
var sou_punch = []; 
sou_punch[0] = new Sound("x","sounds/sfx_wpn_punch1.wav",.1);
sou_punch[1] = new Sound("x","sounds/sfx_wpn_punch2.wav",.1);
sou_punch[2] = new Sound("x","sounds/sfx_wpn_punch3.wav",.1);
sou_punch[3] = new Sound("x","sounds/sfx_wpn_punch4.wav",.1);

var sou_crit = new Sound("x", "sounds/sfx_sound_neutral10.wav",.2);
var sou_buy = new Sound("x", "sounds/sfx_coin_double7.wav",.2);
var sou_sell = new Sound("x", "sounds/sfx_coin_double4.wav",.2);

var sou_equip = new Sound("x", "sounds/equip.wav",.2);
var sou_unequip = new Sound("x", "sounds/unequip.wav",.2);

var sou_error = new Sound("x", "sounds/sfx_sounds_damage1.wav",.2);

var sou_dmg_upgrade  = new Sound("x",'sounds/sfx_wpn_laser3.wav',.2);
var sou_hp_upgrade  = new Sound("x",'sounds/sfx_coin_cluster1.wav',.2);


var sou_menu_close = new Sound("x", "sounds/sfx_sounds_error14.wav",.2);
var sou_menu_open = new Sound("x", "sounds/sfx_menu_move2.wav",.2);
var sou_item_drop = new Sound("x", "sounds/sfx_sounds_impact1.wav",.2);
var sou_level_up = new Sound("x", "sounds/level up.wav",.2);


var sou_gameover = new Sound("x", "sounds/game over2.wav",.2);
var sou_mainMenu = new Sound("x", "sounds/main theme.mp3",.25);
var sou_shop_music = new Sound("x", "sounds/shop music.mp3",.2);
sou_shop_music.sound.loop = true;


var sou_damage_foe = new Sound("x","sounds/sfx_sounds_impact2.wav",.1);
var sou_slide = new Sound("x","sounds/slide.wav",.2);
var sou_kill_foe = new Sound("x", "sounds/sfx_exp_shortest_soft1.wav",.2);


//Pickups
var sou_foundSomethingSm = new Sound("x","sounds/sfx_coin_double1.wav",.1);
var sou_foundSomethingMd = new Sound("x","sounds/sfx_coin_cluster3.wav",.1);
var sou_foundSomethingLg = new Sound("x","sounds/sfx_menu_select4.wav",.1);
var sou_plant = new Sound("x","sounds/sfx_sounds_interaction22.wav",.1);
	
var sou_emptyChest = new Sound("x","https://benergize.com/like_a_rogue/sound/hit2.wav",.1);
var sou_chest_fadeIn = new Sound("x", "sounds/sfx_sounds_interaction20.wav",.2);

var sou_fire = new Sound("x","sounds/sfx_sounds_interaction26.wav",.1);

//Consumables
var sou_potion = new Sound("x","sounds/sfx_sounds_powerup6.wav",.1);

//Movement
var sou_door = new Sound("x","sounds/sfx_movement_dooropen1.wav",.1);
var sou_footstep = [];
sou_footstep[0] = new Sound("x","sounds/sfx_movement_footsteps1a.wav",.1);
sou_footstep[1] = new Sound("x","sounds/sfx_movement_footsteps1b.wav",.1);
var sou_stairs = new Sound("x","sounds/sfx_movement_footstepsloop4_fast.wav",.1);


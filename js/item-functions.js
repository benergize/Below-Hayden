
function giveItem(item) {

	game.currentChestContents = null;

	for(let i = 0; i < player.inventory.length; i++) {

		let it = player.inventory[i];

		if(it.getName() == item.getName() && it.consumable && item.consumable) {

			it.uses += Number.parseInt(item.uses)||1;
			return;
		}
	}
	
	player.inventory.push(item);
	
	updateInventoryUI()

	saveGame();

	return item;
}


function clearItemInfo() {
	itemInfo.innerHTML = "";
}



function removeItem(id) {

	if(typeof id != "number") {id = id.dataset.id; }
	
	document.querySelector(`button.item[data-id="${id}"]`).classList.remove("equipped");

	unequipItem(id);
	
	let itemEl = document.querySelector(`[data-id="${id}"]`);
	itemEl.dataset.id = -1;
	itemEl.style.backgroundImage = "";
	player.inventory = player.inventory.filter(i=>{return i.id != id}); 

	
	saveGame();

	return false;
}

function useItem(el){

	let id = typeof el == "number" ? el : el.dataset.id;

	if(id != -1) {
		let item = player.inventory.filter(item=>{return item.id == id;})[0];
		console.log(item);
		item.use();
	}
	
	saveGame();
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
	
	saveGame();
	
}
function unequipItem(el) {


	let id = typeof el == "object" ? el.dataset.id : el;
	let item = player.inventory.filter(i=>{ return i.id == id; })[0];
	document.querySelector(`button.item[data-id="${item.id}"]`).classList.remove("equipped");

	if(player.slots[item.slot] == item.id) {
		player.slots[item.slot] = -1;
	}

	renderPlayerStats();
	
	saveGame();
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
			item = game.itemShopItems.filter(i=>{ return i.id == itemId; })[0];
		}
		else {
			item = player.inventory.filter(i=>{ return i.id == itemId; })[0];
		}

		let dmgRange = item.slot != "ring" ? item.getDamageRange() : ((item.dmg * 100) + "%");
		let hpRange = item.getHPRange();

		
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
						`<button class = 'itbtn'  onclick = "sellItem(this);" data-id="${item.id}">SELL FOR FOR ${Math.ceil(item.getSellPrice() * .75)}</button>`
				) : "")
			}
			${!isShop?`<button onclick = "removeItem(this);sou_item_drop.play();updateUI();" data-id="${itemId}">DROP</button>`:""}
				
			
		`;
	}
	else {
		itemInfo.classList.remove("open"); 
	}
}
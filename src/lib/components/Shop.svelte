<script lang="ts">
	import * as allItems from '$lib/itemData';
	import { wallet, type Bun, type Item } from '$lib/stores/wallet';

	let showDescription: boolean[] = [];
	// dim items we can't afford
	// highlight items we can afford

	// add more items
	// cycle through seeds
	// prompt user to feed buns
	// create array of rotating shop inventory?
	// rotate on long interval? 2 weeks
	// also trigger shop updates on user's progress
	let buy = true;
	let sell = false;
	// add buy/sell prices for all items
	let dailyItems: Item[] = [
		allItems.bunzempic,
		allItems.heartFruit,
		allItems.squareSeed,
		allItems.funkyGlasses,
		allItems.bunBlaster,
		allItems.npcMask,
		allItems.albanianBoxingGloves,
		allItems.matrixBucketHat,
		allItems.woodSword
	];

	$: nfts = $wallet?.nfts ?? [];
	export let bun: Bun;
	$: bunWallet = bun.wallet;
	$: bunId = bunWallet.bunId;
	$: gold = bunWallet.gold;
	// filter items where there are at least 1
	$: items = bunWallet.items;
	$: fruit = items.filter((items) => items.type === 'fruit');
	$: seeds = items.filter((items) => items.type === 'seed');
	$: witheredSeeds = items.filter((items) => items.type === 'witheredSeed');
	$: wearables = items.filter((items) => items.type === 'wearable');
	$: consumables = items.filter((items) => items.type === 'consumable');

	$: allPossibleItems = [...consumables, ...wearables, ...seeds, ...witheredSeeds, ...fruit];
	$: allExistingItems = [...allPossibleItems.filter((items) => items.quantity > 0)];
	$: allSellableItems = [...allExistingItems.filter((items) => items.sellPrice)];

	function buyItem(item: Item) {
		console.log('attempting to buy: ', item.name);
		// find correct item in wallet
		// increment the item by one
		// subtract buyPrice from users gold
		const bunIndex = $wallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
		const currentBun = $wallet.nfts[bunIndex];
		const correspondingItem: Item = currentBun.wallet.items.find(
			(itemInWallet: Item) => itemInWallet.name === item.name
		);
		if (item.buyPrice && item.buyPrice > currentBun.wallet.gold) {
			alert('you cannot afford that. come back with more gold');
			return;
		}
		wallet.update((currentWallet) => {
			// find the correct nft from wallet based on the bun.id
			if (bunIndex !== -1) {
				// define current bun
				if (correspondingItem) {
					correspondingItem.quantity += 1;
				}
				currentBun.wallet.gold -= correspondingItem?.buyPrice ?? 0;
			}
			return currentWallet;
		});
	}

	function sellItems(item: Item) {
		console.log('attempting to sell: ', item.name);
		// not all items can be sold
		// check for quantity of > 0
		// && check for sellPrice?
		wallet.update((currentWallet) => {
			const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
			if (bunIndex !== -1) {
				const currentBun = currentWallet.nfts[bunIndex];
				const correspondingItem: Item = currentBun.wallet.items.find(
					(itemInWallet: Item) => itemInWallet.name === item.name
				);
				if (correspondingItem) {
					correspondingItem.quantity -= 1;
				}
				currentBun.wallet.gold += correspondingItem?.sellPrice ?? 0;
			}
			return currentWallet;
		});
	}
</script>

<main class="w-[700px] rounded-xl p-2 border-sky-400 border-2 bg-sky-600 flex flex-col space-y-1">
	<div class="flex justify-between">
		<!-- buy/sell buttons -->
		<div class="flex space-x-1">
			<div
				class="border-yellow-500 border-2 rounded overflow-hidden bg-yellow-100 text-yellow-500 font-sans font-bold px-1"
			>
				Daily Items
			</div>
			<div
				class="font-FinkHeavy rounded border-yellow-500 border-2 w-20 text-yellow-700 flex overflow-hidden"
			>
				<button
					on:click={() => {
						buy = true;
						sell = false;
					}}
					class="{buy ? 'bg-yellow-300' : 'bg-yellow-100'} w-1/2">Buy</button
				>
				<button
					on:click={() => {
						sell = true;
						buy = false;
					}}
					class="{sell ? 'bg-yellow-300' : 'bg-yellow-100'} w-1/2">Sell</button
				>
			</div>
		</div>
		<div
			class="border-yellow-500 border-2 rounded overflow-hidden bg-yellow-100 text-yellow-500 flex items-center space-x-1 font-FinkHeavy font-bold px-1"
		>
			<img src="/ui/icons/sankogold.png" class="w-4 h-4" alt="" />
			<p>{bunWallet.gold}</p>
			<p class="border-l-2 border-l-yellow-500 px-1">{$wallet.nfts[0].name}</p>
		</div>
	</div>
	<!-- items -->
	<div class="flex w-full space-x-1 overflow-x-auto overflow-y-hidden whitespace-nowrap">
		<!-- buying items -->
		{#if buy}
			{#each dailyItems as item, index}
				{#if item.buyPrice}
					<button
						on:mouseenter={() => (showDescription[index] = true)}
						on:mouseleave={() => (showDescription[index] = false)}
						disabled={item.buyPrice > bunWallet.gold}
						on:click={() => buyItem(item)}
						class="flex-shrink-0 disabled:filter disabled:grayscale-[75%] relative font-FinkHeavy w-24 h-24 text-xs rounded border-white border-[1px] bg-white bg-opacity-75 hover:bg-opacity-90 flex flex-col justify-evenly overflow-hidden items-center"
					>
						{#if showDescription[index]}
							<div
								class="absolute z-30 bottom-28 border-2 border-black border-dashed bg-white bg-opacity-90 w-24 h-full text-wrap leading-tight rounded-xl p-1 font-FinkHeavy"
							>
								<p>{item.description}</p>
							</div>
						{/if}
						<!-- price -->
						<div
							class="bg-white bg-opacity-75 rounded-full p-[1px] px-[3px] flex space-x-1 absolute top-[2px] right-[2px]"
						>
							<img class="w-3" src="/ui/icons/sankogold.png" alt="" />
							<p>{item.buyPrice}</p>
						</div>
						<!-- item img -->
						<img class="h-14 absolute top-1 left-1" src={item.imgPath} alt={item.name} />
						<!-- item name -->
						<div
							class="flex items-center text-center h-8 w-full absolute bottom-0 left-0 {item.type ===
							'wearable'
								? 'bg-sky-400'
								: 'bg-lime-500'} text-black"
						>
							<p class="w-full m-auto">
								{item.name}
							</p>
						</div>
					</button>
				{/if}
			{/each}
		{/if}

		<!-- selling items -->
		{#if sell}
			{#each allSellableItems as item}
				<button
					on:click={() => sellItems(item)}
					class="relative font-FinkHeavy w-20 h-24 text-xs rounded border-white border-[1px] bg-white bg-opacity-75 hover:bg-opacity-90 flex flex-col justify-evenly overflow-hidden items-center"
				>
					<!-- item img -->
					<img class="h-14 absolute top-1 left-1" src={item.imgPath} alt={item.name} />
					<!-- item name -->
					<div
						class="flex items-center text-center h-8 w-full absolute bottom-0 left-0 bg-lime-500 text-black"
					>
						<p class="w-full m-auto">
							{item.name}
						</p>
					</div>
				</button>
			{/each}
		{/if}
	</div>
</main>

<!-- $lib/components/Shop.svelte -->
<script lang="ts">
	import * as allItems from '$lib/itemData';
	import { bunBlasted } from '$lib/stores/abilities';
	import { gameState, b } from '$lib/stores/gameState';
	import {
		addItemToWallet,
		subtractItemFromWallet,
		updateGold,
		wallet,
		type Bun,
		type Item
	} from '$lib/stores/wallet';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	let showDescription: boolean[] = [];
	let currentDescription: string | undefined;
	let currentItemPrice: number | undefined;
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
		allItems.slop,
		allItems.bunzempic,
		allItems.heartFruit,
		allItems.squareSeed,
		allItems.funkyGlasses,
		allItems.bunBlaster,
		allItems.npcMask,
		allItems.albanianBoxingGloves,
		allItems.matrixBucketHat,
		allItems.chromeDurag,
		allItems.bunOil
	];

	// buns in wallet
	$: buns = $wallet?.nfts ?? [];
	$: bunWallet = buns[$b]?.wallet ?? {};

	// existing items
	$: items = bunWallet?.items.filter((items: Item) => items.quantity > 0) ?? [];

	export let bun: Bun;

	// bun id and gold
	$: bunId = bunWallet.bunId;
	$: gold = bunWallet.gold;

	// filter items based on type
	$: fruit = items.filter((items: Item) => items.type === 'fruit');
	$: seeds = items.filter((items: Item) => items.type === 'seed');
	$: witheredSeeds = items.filter((items: Item) => items.type === 'witheredSeed');
	$: wearables = items.filter((items: Item) => items.type === 'wearable');
	$: consumables = items.filter((items: Item) => items.type === 'consumable');

	$: allPossibleItems = [...consumables, ...wearables, ...seeds, ...witheredSeeds, ...fruit];
	$: allExistingItems = [...allPossibleItems.filter((items) => items.quantity > 0)];
	$: allSellableItems = [...allExistingItems.filter((items) => items.sellPrice)];

	function buyItem(bunIndex: number, newItem: Item) {
		addItemToWallet(bunIndex, newItem);
		if (newItem.buyPrice) {
			updateGold(bunIndex, -newItem.buyPrice);
		}
	}

	function sellItem(bunIndex: number, newItem: Item) {
		subtractItemFromWallet(bunIndex, newItem);
		if (newItem.sellPrice) {
			updateGold(bunIndex, newItem.sellPrice);
		}
	}
</script>

<main class="max-w-[540px] absolute top-[640px] left-2 rounded-xl p-2 border-sky-400 border-4 bg-sky-800 flex flex-col space-y-1">
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
			<p class="border-l-2 border-l-yellow-500 px-1">{buns[$b].name}</p>
		</div>
	</div>
	<!-- items -->
	<div class="flex w-full space-x-1 overflow-x-auto overflow-y-hidden whitespace-nowrap">
		<!-- buying items -->
		{#if buy}
			{#each dailyItems as item, index}
				{#if item.buyPrice}
					<button
						on:mouseenter={() => {
							currentDescription = item.description;
							currentItemPrice = item.buyPrice;
						}}
						on:mouseleave={() => (currentDescription = undefined)}
						disabled={item.buyPrice > bunWallet.gold}
						on:click={() => buyItem($b, item)}
						class="flex-shrink-0 disabled:filter disabled:invert-[50%] relative font-FinkHeavy w-24 h-28 text-xs rounded border-white border-[1px] bg-white bg-opacity-50 hover:bg-opacity-75 flex flex-col justify-evenly overflow-hidden items-center"
					>
						<!-- price -->
						<div
							class="bg-white bg-opacity-75 rounded-full p-[1px] px-[3px] flex space-x-1 absolute top-[2px] right-[2px]"
						>
							<img class="w-3" src="/ui/icons/sankogold.png" alt="" />
							<p>{item.buyPrice}</p>
						</div>
						<!-- item img -->
						<img class="h-[65%] absolute top-1 left-1" src={item.imgPath} alt={item.name} />
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
					on:click={() => sellItem($b, item)}
					class="relative font-FinkHeavy w-20 h-24 text-xs rounded border-white border-[1px] bg-white bg-opacity-75 hover:bg-opacity-90 flex flex-col justify-evenly overflow-hidden items-center"
				>
					<div class="px-1 text-white absolute top-1 right-1 rounded-full bg-rose-600">
						{item.quantity}
					</div>
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
	<div class="">
		{#if currentDescription}
			<div
				in:fade={{ duration: 500, easing: cubicInOut }}
				class="mt-1 text-lg border-2 border-black border-dashed bg-white w-full h-full text-wrap leading-[1.1] rounded-xl p-2 font-FinkHeavy"
			>
				<p>
					{#if currentItemPrice && currentItemPrice > buns[$b].wallet.gold}
						???
					{:else}
						{currentDescription}
					{/if}
				</p>
			</div>
		{/if}
	</div>
</main>

<style>
	::-webkit-scrollbar-thumb {
		background-color: #facc15;
		border-radius: 6px;
	}
</style>

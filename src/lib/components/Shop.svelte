<!-- $lib/components/Shop.svelte -->
<script lang="ts">
	import * as allItems from '$lib/itemData';
	import { dailyItems } from '$lib/itemData';
	import {
		autoSeller,
		autoBuyer,
		bunBlasted,
		totalFruitsSold,
		totalSeedsBought
	} from '$lib/stores/abilities';
	import { gameState, bunIndex } from '$lib/stores/gameState';
	import {
		addItemToWallet,
		subtractItemFromWallet,
		updateGold,
		wallet,
		type Bun,
		type Item
	} from '$lib/stores/wallet';
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	// buns in wallet
	$: buns = $wallet?.nfts.filter((bun: Bun) => bun.type === 'Bun') ?? [];
	$: bunWallet = buns[$bunIndex]?.wallet ?? {};

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
	$: allBuyableItems = [...allExistingItems.filter((items) => items.buyPrice)];

	let autoSellInterval: ReturnType<typeof setInterval> | null = null;
	let autoBuyInterval: ReturnType<typeof setInterval> | null = null;

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

	let initialDailyItems: Item[] = [
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

	let i = 0;
	// daily items always includes
	function rotateDailyItems() {
		const fruitTypes = {
			heart: { fruit: allItems.heartFruit, seed: allItems.heartSeed },
			star: { fruit: allItems.starFruit, seed: allItems.starSeed },
			lumpy: { fruit: allItems.lumpyFruit, seed: allItems.heartSeed },
			round: { fruit: allItems.roundFruit, seed: allItems.heartSeed },
			square: { fruit: allItems.squareFruit, seed: allItems.squareSeed }
		};

		const typeKeys = Object.keys(fruitTypes) as (keyof typeof fruitTypes)[];
		const currentType = typeKeys[i % typeKeys.length];
		const { fruit: currentFruit, seed: currentSeed } = fruitTypes[currentType];

		dailyItems.update(() => [
			// slop and bunzempic stay in the shop year round
			allItems.slop,
			allItems.bunzempic,
			// current fruit + seeds
			currentFruit,
			currentSeed,
			// random wearable items (for now)
			...Object.values(allItems)
				.filter((item) => item.type === 'wearable' && item.buyPrice)
				.sort(() => Math.random() - 0.5)
				.slice(0, 7)
		]);
	}

	onMount(() => {
		// initiate store with items
		dailyItems.set(initialDailyItems);

		setInterval(() => {
			rotateDailyItems();
			i = (i + 1) % 5;
		}, 60000); // 6s to test
	});

	function buyItem(bunIndex: number, newItem: Item) {
		addItemToWallet(bunIndex, newItem);
		if (newItem.buyPrice) {
			updateGold(bunIndex, -newItem.buyPrice);
		}
		if (newItem.type === 'seed') {
			totalSeedsBought.update((total) => total + 1);
		}
	}

	function sellItem(bunIndex: number, newItem: Item) {
		subtractItemFromWallet(bunIndex, newItem);

		if (newItem.sellPrice) {
			// If $bunBlasted is true, double the sell price
			const finalSellPrice = $bunBlasted ? newItem.sellPrice * 2 : newItem.sellPrice;
			updateGold(bunIndex, finalSellPrice);
		}

		if (newItem.type === 'fruit') {
			totalFruitsSold.update((total) => total + 1);
		}
	}

	function startAutoBuyInterval() {
		if (autoBuyInterval) {
			clearInterval(autoBuyInterval);
		}

		let interval = 1000;
		let sps = $autoBuyer.rate;

		if ($autoBuyer.rate <= 1) {
			interval = (1 / $autoBuyer.rate) * 1000;
			sps = 1;
		} else {
			interval = 1000;
			sps = $autoBuyer.rate;
		}

		autoBuyInterval = setInterval(() => {
			if (buns[$bunIndex]) {
				const bun = buns[$bunIndex];
				const wallet = bun.wallet;
				const gold = wallet.gold;
				for (let i = 0; i < sps; i++) {
					const anySeeds = $dailyItems.find((item: Item) => item.type === 'seed');
					if (anySeeds && anySeeds.buyPrice && gold > anySeeds.buyPrice) {
						buyItem($bunIndex, anySeeds);
					} else {
						break;
					}
				}
			}
		}, interval);
	}

	function startAutoSellInterval() {
		if (autoSellInterval) {
			clearInterval(autoSellInterval);
		}

		let interval = 1000;
		let fps = $autoSeller.rate; // fruits per second
		if ($autoSeller.rate <= 1) {
			interval = (1 / $autoSeller.rate) * 1000;
			fps = 1;
		} else {
			interval = 1000;
			fps = $autoSeller.rate;
		}

		autoSellInterval = setInterval(() => {
			if (buns[$bunIndex]) {
				const bun = buns[$bunIndex];
				const wallet = bun.wallet;
				for (let i = 0; i < fps; i++) {
					const anyFruit = wallet.items.find(
						(item: Item) => item.type === 'fruit' && item.quantity > 1
					);
					if (anyFruit) {
						sellItem($bunIndex, anyFruit);
					} else {
						break;
					}
				}
			}
		}, interval);
	}

	function stopAutoBuyInterval() {
		if (autoBuyInterval) {
			clearInterval(autoBuyInterval);
			autoBuyInterval = null;
		}
	}

	function stopAutoSellInterval() {
		if (autoSellInterval) {
			clearInterval(autoSellInterval);
			autoSellInterval = null;
		}
	}

	$: {
		if ($autoBuyer.enabled) {
			startAutoBuyInterval();
		} else {
			stopAutoBuyInterval();
		}
	}

	$: {
		if ($autoSeller.enabled) {
			startAutoSellInterval();
		} else {
			stopAutoSellInterval();
		}
	}

	onDestroy(() => {
		stopAutoSellInterval();
		stopAutoBuyInterval();
	});
</script>

<main
	class="w-[99%] absolute top-[640px] left-1/2 -translate-x-1/2 rounded-xl p-2 border-sky-400 border-4 bg-sky-800 flex flex-col space-y-1"
>
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
			<p class="border-l-2 border-l-yellow-500 px-1">{buns[$bunIndex].name}</p>
		</div>
	</div>
	<!-- items -->
	<div class="flex w-full space-x-1 overflow-x-auto overflow-y-hidden whitespace-nowrap">
		<!-- buying items -->
		{#if buy}
			{#each $dailyItems as item, index}
				{#if item.buyPrice}
					<button
						on:mouseenter={() => {
							currentDescription = item.description;
							currentItemPrice = item.buyPrice;
						}}
						on:mouseleave={() => (currentDescription = undefined)}
						disabled={item.buyPrice > bunWallet.gold}
						on:click={() => buyItem($bunIndex, item)}
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
					on:click={() => sellItem($bunIndex, item)}
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
					{#if currentItemPrice && currentItemPrice > buns[$bunIndex].wallet.gold}
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

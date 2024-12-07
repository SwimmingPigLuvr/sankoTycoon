<!-- $lib/components/BunWallet.svelte -->
<script lang="ts">
	import * as itemData from '$lib/itemData';
	import {
		activateBunBlaster,
		autoFeeder,
		bunBlasted,
		isReviving,
		narcanBun,
		totalFruitsEaten
	} from '$lib/stores/abilities';
	import {
		addMessage,
		gameState,
		bridged,
		currentSection,
		activeBun,
		eggIndex,
		bunIndex
	} from '$lib/stores/gameState';
	import { wallet, type Bun, type Item, type Token } from '$lib/stores/wallet';
	import { cubicInOut } from 'svelte/easing';
	import { fade, fly, scale, slide } from 'svelte/transition';
	import Hunger from './Hunger.svelte';
	import HatchEgg from './HatchEgg.svelte';
	import { restartHungerInterval } from '$lib/stores/hungerState';
	import MintEgg from './MintEgg.svelte';
	import {
		eatFruit,
		latestStatIncrease,
		playSparkle,
		showHungerReduced,
		showStatIncrease
	} from '$lib/utils/feedBun';

	export let bun: Bun;

	let isOverDropZone = false;
	let dropZoneItems: Array<Item & { id: string }> = [];
	let draggedItem: (Item & { id: string }) | null = null;

	function handleDragStart(event: DragEvent, item: Item) {
		if (!event.dataTransfer) return;
		event.dataTransfer.setData('text/plain', item.name);
		// create a new image
		const dragImage = new Image();
		dragImage.src = item.imgPath;
		dragImage.style.height = '10px';
		dragImage.style.width = 'auto';
		// use this as the drag image
		event.dataTransfer.setDragImage(dragImage, 0, 0);
	}

	function handleDragOver(event: DragEvent) {
		event?.preventDefault();
		isOverDropZone = true;
	}

	function handleDragLeave() {
		isOverDropZone = false;
	}

	function handleDrop(event: DragEvent) {
		event?.preventDefault();
		isOverDropZone = false;
		if (!event.dataTransfer) return;

		const itemName = event.dataTransfer.getData('text/plain');
		if (itemName) {
			eatItem(itemName);
		}
	}

	let showWithdrawGold = false;

	$: buns = $wallet?.nfts.filter((nft: Bun) => nft.type === 'Bun') ?? [];
	$: eggs = $wallet?.nfts.filter((nft: Bun) => nft.type === 'Egg') ?? [];

	$: $bunIndex = $bunIndex % buns.length;
	$: $eggIndex = $eggIndex % eggs.length;

	$: if ($currentSection === 'Buns' && buns.length > 0) {
		activeBun.set(buns[$bunIndex]);
	} else if ($currentSection === 'Eggs' && eggs.length > 0) {
		activeBun.set(eggs[$eggIndex]);
	}

	$: currentBun = buns[$bunIndex];
	$: bunWallet = currentBun?.wallet;
	$: items = bunWallet?.items.filter((items: Item) => items.quantity > 0);
	$: bunId = bunWallet?.bunId;
	$: gold = bunWallet?.gold;

	$: fruit = items?.filter((items: Item) => items.type === 'fruit') ?? [];
	$: seeds = items?.filter((items: Item) => items.type === 'seed') ?? [];
	$: witheredSeeds = items?.filter((items: Item) => items.type === 'witheredSeed') ?? [];
	$: wearables = items?.filter((items: Item) => items.type === 'wearable') ?? [];
	$: consumables = items?.filter((items: Item) => items.type === 'consumable') ?? [];

	$: allItems = [...consumables, ...wearables, ...seeds, ...witheredSeeds, ...fruit];

	let currentAbility: string | undefined;
	let bunBlastMessage: string | undefined;

	function nextBun() {
		bunIndex.update((b) => (b + 1) % buns.length);
	}

	function prevBun() {
		bunIndex.update((b) => (b - 1 + buns.length) % buns.length);
	}

	function nextEgg() {
		eggIndex.update((e) => (e + 1) % eggs.length);
	}

	function prevEgg() {
		eggIndex.update((e) => (e - 1 + eggs.length) % eggs.length);
	}

	// cycle through the sections
	function toggleSection() {
		let sections = ['Egg', 'Buns', 'Mint'];
		let index = sections.findIndex((section) => section === $currentSection);
		index = (index + 1) % sections.length;
		currentSection.set(sections[index]);
	}

	function eatItem(itemName: string) {
		// update wallet
		wallet.update((currentWallet) => {
			// find bun
			const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
			if (bunIndex === -1) {
				console.error('bun not found');
				return currentWallet;
			}
			const bunNft: Bun = currentWallet.nfts[bunIndex];

			// handle item ability
			switch (itemName) {
				case 'Bun Blaster':
					activateBunBlaster(bunNft);
					break;
				case 'Bunzempic':
					narcanBun(bunNft);
					break;
				case 'Heart Fruit':
				case 'Lumpy Fruit':
				case 'Star Fruit':
				case 'Round Fruit':
				case 'Square Fruit':
				case 'Slop':
					eatFruit(bunNft, itemName);
					break;
				default:
					break;
			}
			return currentWallet;
		});
	}

	// check if autofeeder is enabled
	$: if ($autoFeeder.enabled && buns[$bunIndex]) {
		const bun = buns[$bunIndex];
		// only use when bun is starving
		if (bun.hungerLevel >= 5) {
			const wallet = bun.wallet;
			const anyFruit = wallet.items.find(
				(item: Item) => item.type === 'fruit' && item.quantity > 0
			);
			if (anyFruit) {
				eatFruit(bun, anyFruit.name);
			}
		}
	}

	// todo
	// if the items have a quantity of more than 1 then they still only take up 1 grid but later on i will add
	// an icon showing the quantity
	function withdrawGold() {
		wallet.update((wallet) => {
			const bun = wallet.nfts[$bunIndex];
			const amount = bun.wallet.gold;
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (amount >= 0) {
				bun.wallet.gold = 0;
				if (goldToken) {
					goldToken.balance += amount;
				}
				addMessage(`${bun.name} transfered ${amount} GOLD to main wallet.`);
			}
			return wallet;
		});
	}

	let showItemName = '';
	function handleItemHover(item: Item) {
		currentAbility = item.ability;
		showItemName = item.name;
	}

	function unHandleItemHover(item: Item) {
		currentAbility = undefined;
		showItemName = '';
	}
</script>

<main class="w-40 relative justify-center flex flex-col border-gray-400">
	<div
		class="transform transition-all duration-1000 ease-in-out w-full justify-center items-center flex flex-col space-y-0"
	>
		<!-- MINT SECTION -->
		{#if $bridged && $currentSection === 'Mint'}
			<MintEgg />
		{/if}
		<!-- EGG SECTION -->
		{#if $currentSection === 'Eggs'}
			<!-- if any eggs in the wallet -->
			{#if eggs[$eggIndex]}
				<div class="w-full flex px-2 justify-around font-FinkHeavy text-xl text-center">
					<!-- if multiple eggs in the wallet -->
					{#if eggs.length > 1}
						<!-- left arrow -->
						<button class="hover:filter hover:brightness-[75%]" on:click={() => prevEgg()}>
							<img src="/ui/icons/arrow.png" class="w-8" alt="" />
						</button>
						<button>Eggs</button>
						<!-- right arrow -->
						<button on:click={() => nextEgg()} class="hover:filter hover:brightness-[75%]">
							<img src="/ui/icons/arrow.png" class="w-8 scale-[-100%]" alt="" />
						</button>
						<!-- if singular bun -->
					{:else}
						<button>Eggs</button>
					{/if}
				</div>
				<!-- current egg -->
				<div in:fade class="w-full">
					<button class="relative">
						<img
							class="w-40 m-auto rounded-none"
							src={eggs[$eggIndex].imageUrl}
							alt={eggs[$eggIndex].name}
						/>
					</button>
					<!-- egg info -->
					<div class="flex leading-4 flex-col items-center justify-center space-y-0">
						<p class="text-2xl leading- font-FinkHeavy text-center">
							{eggs[$eggIndex].name} Egg
						</p>
						<p class="text-sm font-mono text-center">
							{eggs[$eggIndex].rarity}
						</p>
						<div class="py-2">
							<HatchEgg />
						</div>
					</div>
				</div>
			{/if}
		{:else if $currentSection === 'Buns'}
			<!-- if any buns in the wallet -->
			{#if buns[$bunIndex]}
				<div class="w-full flex px-2 justify-around font-FinkHeavy text-xl text-center">
					<!-- if multiple buns in the wallet -->
					{#if buns.length > 1}
						<!-- left arrow -->
						<button class="hover:filter hover:brightness-[75%]" on:click={() => prevBun()}>
							<img src="/ui/icons/arrow.png" class="w-8" alt="" />
						</button>
						<button>Buns</button>
						<!-- right arrow -->
						<button on:click={() => nextBun()} class="hover:filter hover:brightness-[75%]">
							<img src="/ui/icons/arrow.png" class="w-8 scale-[-100%]" alt="" />
						</button>
						<!-- if singular bun -->
					{:else}
						<button>Buns</button>
					{/if}
				</div>
				<!-- buns -->
				<!-- current bun -->
				<div class="flex justify-between items-center space-x-1">
					<!-- bun info -->
				</div>
				<div class="w-full">
					<button
						on:dragover={handleDragOver}
						on:dragleave={handleDragLeave}
						on:drop={handleDrop}
						in:fade
						class="relative"
					>
						{#if $playSparkle}
							<img class="absolute top-0 left-0 w-full h-auto" src="ui/gifs/sparkle.gif" alt="" />
							<div
								class="absolute font-FinkHeavy p-1 whitespace-nowrap bg-white bg-opacity-75 text-green-500 rounded top-1/4 translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] m-auto h-auto"
							>
								{#if $showHungerReduced}
									Hunger reduced!
								{/if}
								{#if $showStatIncrease}
									+1 {$latestStatIncrease}
								{/if}
							</div>
						{/if}
						<img
							class="w-40 z-20 {bun.hungerLevel === 5
								? 'invert-filter'
								: ''} m-auto transition-all duration-200 ease-in-out"
							class:opacity-50={isOverDropZone}
							src={buns[$bunIndex].imageUrl}
							alt={buns[$bunIndex].name}
						/>
						{#if isOverDropZone}
							<div
								class="absolute inset-0 border-4 border-dashed border-yellow-400 rounded-lg pointer-events-none"
							/>
						{/if}
						<!-- hunger meter -->
						{#if buns[$bunIndex].type === 'Bun'}
							<Hunger bun={buns[$bunIndex]} />
						{/if}
					</button>
				</div>
				{#if buns[$bunIndex].type === 'Bun'}
					<!-- bun wallet -->
					{#if bunBlastMessage}
						<p>{bunBlastMessage}</p>
					{/if}
					<div class="flex relative justify-between w-full px-1 items-center">
						{#if buns[$bunIndex].type === 'Bun'}
							<p class="text-xs">{buns[$bunIndex].name} #{buns[$bunIndex].id}</p>
						{/if}
						<!-- gold balance -->
						<button
							on:mouseenter={() => (showWithdrawGold = true)}
							on:mouseleave={() => (showWithdrawGold = false)}
							on:click={() => withdrawGold()}
							class="hover:bg-slate-100 rounded-full px-2 flex justify-center space-x-1 p-1"
						>
							<img src="/images/tokens/sankogold.png" class="h-4" alt="" />
							<p class="text-xs">{buns[$bunIndex].wallet.gold}</p>
						</button>
						<!-- tooltip -->
						{#if showWithdrawGold}
							<p
								class="rounded border-black absolute text-sm bg-white p-2 text-black border-dashed border-2 right-0 mb-1 bottom-full z-20 font-FinkHeavy"
							>
								<span> send to wallet </span>
								<img src="/ui/icons/send-red.svg" class="h-4 inline-block" alt="" />
							</p>
						{/if}
					</div>
					<!-- items, fruits, seeds -->
					<div class="relative w-40 mx-auto">
						<div
							class="border-[1px] bg-gray-100 border-gray-400 overflow-y-auto grid gap-0 grid-cols-4 h-32 w-full"
						>
							{#each allItems as item}
								<div class="relative">
									<button
										on:mouseenter={() => handleItemHover(item)}
										on:mouseleave={() => unHandleItemHover(item)}
										class="relative border-gray-400 border-[1px] hover:bg-gray-200 flex items-center justify-center h-8 w-10"
									>
										{#if showItemName === item.name}
											<div
												class="pointer-events-none rounded absolute bottom-full mb-1 left-1/2 -translate-x-1/2 font-FinkHeavy bg-orange-50 px-1 whitespace-nowrap z-[9999]"
											>
												{item.name}
											</div>
										{/if}
										<img
											draggable="true"
											on:dragstart={(e) => handleDragStart(e, item)}
											src={item.imgPath}
											alt={item.name}
											class="pointer-events-auto cursor-grab active:cursor-grabbing h-8 w-auto"
										/>

										{#if item.quantity > 1}
											<div
												class="pointer-events-none absolute w-3 h-3 top-0 right-0 bg-rose-600 rounded-full text-white flex items-center justify-center text-[0.6rem] text-center font-FinkHeavy"
											>
												<p class="m-auto">
													{item.quantity}
												</p>
											</div>
										{/if}
									</button>
								</div>
							{/each}

							{#each Array(Math.max(16, Math.ceil(allItems.length / 4) * 4) - allItems.length) as _}
								<div class="border-gray-400 border-[1px] hover:bg-gray-200 h-8 w-10"></div>
							{/each}
						</div>
					</div>
					{#if currentAbility}
						<div class="w-full">
							<p class="text-left text-xs w-full">{currentAbility}</p>
						</div>
					{/if}
				{/if}
			{/if}
		{/if}
	</div>
</main>

<style>
</style>

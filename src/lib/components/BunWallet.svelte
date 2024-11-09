<!-- $lib/components/BunWallet.svelte -->
<script lang="ts">
	import * as itemData from '$lib/itemData';
	import { autoFeeder, bunBlasted, isReviving, totalFruitsEaten } from '$lib/stores/abilities';
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
			activateAbility(itemName);
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

	$: bunWallet = bun?.wallet;
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

	function activateAbility(itemName: string) {
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

	function activateBunBlaster(bun: Bun) {
		// find bun blaster in inventory
		const blaster = bun.wallet.items.find((item: Item) => item.name === 'Bun Blaster');
		if (blaster && blaster.quantity > 0) {
			// clear currentAbility message
			currentAbility = undefined;
			// decrement blaster by 1
			blaster.quantity -= 1;

			// check gold
			let startingGold = bun.wallet.gold;
			// activate bun blaster state
			bunBlasted.set(true);
			addMessage(`${bun.name} inhales an extremely deep breath of nitrous from the Bun Blaster.`);

			// lasts 10s
			setTimeout(() => {
				bunBlasted.set(false);
				addMessage('The effects from the Bun Blaster have worn off.');
				let endingGold = bun.wallet.gold;
				let profit = endingGold - startingGold;
				addMessage(`Total Gold earned while blasted: ${profit}`);
			}, 10000);
		} else {
			addMessage('No Bun Blaster detected. Consider buying one from the shop.');
		}
	}

	function narcanBun(bun: Bun) {
		if (!bun.isHibernating) {
			addMessage('Cannot use bunzempic on bun that is not in hibernation.');
			return;
		}
		// clear currentAbility message
		currentAbility = undefined;

		// find bunzempic
		const bunzempicBottle = bun.wallet.items.find((item: Item) => item.name === 'Bunzempic');
		if (bunzempicBottle && bunzempicBottle.quantity > 0) {
			// decrement
			bunzempicBottle.quantity -= 1;

			// reset hunger level
			bun.hungerLevel = 0;
			// wake up bun
			bun.isHibernating = false;
			// start cool down period
			bun.isCoolingDown = true;
			addMessage(`${bun.name} is reviving...`);
			const COOLDOWN_DURATION = 5000;

			setTimeout(() => {
				// reset hunger
				restartHungerInterval(bun);
				// update wallet
				wallet.update((currentWallet) => {
					const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
					if (bunIndex === -1) {
						return currentWallet;
					}
					const bunNft = currentWallet.nfts[bunIndex];
					bunNft.isCoolingDown = false;
					addMessage(`${bunNft.name} has been revived.`);
					return currentWallet;
				});
			}, COOLDOWN_DURATION);
		} else {
			addMessage('No Bunzempic left to use. Buy some from the shop');
		}
	}

	function eatFruit(bun: Bun, fruitName: string) {
		console.log('eating fruit:', fruitName);

		// wallet update
		wallet.update((currentWallet) => {
			const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
			if (bunIndex === -1) {
				console.error('bun not found');
				return currentWallet;
			}
			const bunNft: Bun = currentWallet.nfts[bunIndex];

			if (bunNft.isHibernating) {
				addMessage('Cannot feed bun in hibernation. Use Bunzempic to revive');
				return currentWallet;
			}
			if (bunNft.isCoolingDown) {
				addMessage(
					`Cannot feed ${bun.name}. Wait until cool down period is over to be fully revived`
				);
				return currentWallet;
			}
			const fruitItem = bun.wallet.items.find((item: Item) => item.name === fruitName);

			// check if the fruit exists and that the quantity is > 0
			if (fruitItem && fruitItem.quantity > 0) {
				// decrement
				fruitItem.quantity -= 1;
				// reset hunger
				bunNft.hungerLevel = 0;
				restartHungerInterval(bunNft);

				// handle fruit type
				switch (fruitItem.fruitType) {
					case 'heart':
						bunNft.strength += 1;
						addMessage('Hunger reduced. Strength +1.');
						break;
					case 'star':
						bunNft.luck += 1;
						addMessage('Hunger reduced. Luck +1.');
						break;
					case 'lumpy':
						bunNft.stamina += 1;
						addMessage('Hunger reduced. Stamina +1.');
						break;
					case 'round':
						bunNft.speed += 1;
						addMessage('Hunger reduced. Speed +1.');
						break;
					case 'square':
						bunNft.industry += 1;
						addMessage('Hunger reduced. Industry +1.');
						break;
					case 'slop':
						addMessage('Hunger reduced.');
						break;
					default:
						break;
				}

				// add to total fruits eaten
				totalFruitsEaten.update((total) => (total += 1));
				return currentWallet;
			} else {
				addMessage(`You do not have any ${fruitName}s.`);
				return currentWallet;
			}
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
				console.log('auto feeder activated');
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
						<img
							class="w-40 {bun.hungerLevel === 5
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
							<img src="/ui/icons/sankogold.png" class="h-4" alt="" />
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

<!-- lib/components/Farmtek.svelte -->
<script lang="ts">
	import { bunOil, dailyItems, newsBoyHat } from '$lib/itemData';
	import { showAbout } from '$lib/stores/abilities';
	import { addMessage, farmtekOpen } from '$lib/stores/gameState';
	import {
		HUNGER_INTERVAL,
		bunStatus,
		hibernationTimers,
		getTimeUntilHibernation
	} from '$lib/stores/hungerState';
	import { wallet, type Bun, type Plot, type Item } from '$lib/stores/wallet';
	import { createSeedObject, plantBatchSeeds } from '$lib/utils/farmTools';
	import { onDestroy } from 'svelte';
	import { backOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { writable } from 'svelte/store';
	import { scale, slide } from 'svelte/transition';

	let itemsToFeedMyBun: Item[] = [];

	function handleToggleItemsToFeed(bun: Bun, item: Item) {
		const newItem: Item = { ...item, quantity: 1 };
		// if the item is in the array remove it
		const existingItem = itemsToFeedMyBun.find((i) => i.name === item.name);
		if (existingItem) {
			itemsToFeedMyBun = itemsToFeedMyBun.filter((i) => i !== item);
		} else {
			// else, add it
			itemsToFeedMyBun = [...itemsToFeedMyBun, newItem];
		}
	}

	function updateQuantityOfItemsToEat(bun: Bun, item: Item, newQuantity: number) {
		// return if invalid quantity
		if (newQuantity < 1 || newQuantity > item.quantity) return;
		// update array by mapping through it
		itemsToFeedMyBun = itemsToFeedMyBun.map((i) =>
			i.name === item.name ? { ...i, quantity: newQuantity } : i
		);
	}

	function handleRemoveItemsToFeed(bun: Bun, items: Item[]) {
		itemsToFeedMyBun = itemsToFeedMyBun.filter((item) => !items.includes(item));
	}

	$: buns.forEach((bun) => {
		if (coundownIntervals[bun.id]) {
			clearInterval(coundownIntervals[bun.id]);
		}

		if (!bun.isHibernating) {
			coundownIntervals[bun.id] = setInterval(() => {
				if ($hibernationTimers[bun.id]) {
					const remaining = Math.max(0, $hibernationTimers[bun.id] - Date.now());
					if (remaining <= 0 && !bun.isHibernating) {
						wallet.update((w) => {
							const bunNft = w.nfts.find((nft) => nft.id === bun.id);
							if (bunNft) {
								bunNft.isHibernating = true;
								bunNft.hungerLevel = 6;
							}
							return w;
						});
					}
				}
			}, 100);
		}
	});

	$: bunsFruits = buns.map((bun) => ({
		id: bun.id,
		fruits: bun.wallet.items.filter(
			(item) => (item.type === 'fruit' || item.type === 'consumable') && item.quantity > 0
		)
	}));

	// for each bun use the id to get the time remaining from the formatTimeRemaining function
	// Determine the type for formattedTimes based on the mapping structure
	type FormattedTime = {
		id: number;
		timeRemaining: string;
	};

	let formattedTimes: FormattedTime[] = [];
	$: setInterval(() => {
		formattedTimes = buns.map((bun) => ({
			id: bun.id,
			timeRemaining: formatTimeRemaining(bun.id)
		}));
	}, 1000);

	$: fruitQuantities = buns.map((bun) => ({
		id: bun.id,
		quantity: bun.wallet.items
			.filter((item) => item.type === 'fruit')
			.reduce((sum, fruit) => sum + fruit.quantity, 0)
	}));

	let quantitiesOfFruitToSell: { id: number; quantity: number }[] = [];

	$: quantitiesOfFruitToSell = buns.map((bun) => ({
		id: bun.id,
		quantity: fruitQuantities.find((quantity) => quantity.id === bun.id)?.quantity ?? 0
	}));

	function updateSellQuantity(bunId: number, newQuantity: number) {
		const availableFruits = fruitQuantities.find((fq) => fq.id === bunId)?.quantity || 0;
		// Ensure quantity is between 1 and available fruits
		const validQuantity = Math.max(1, Math.min(newQuantity, availableFruits));

		quantitiesOfFruitToSell = quantitiesOfFruitToSell.map((q) =>
			q.id === bunId ? { ...q, quantity: validQuantity } : q
		);
		quantitiesOfFruitToSell = quantitiesOfFruitToSell.map((q) =>
			q.id === bunId ? { ...q, quantity: newQuantity } : q
		);
	}

	let quantitiesOfSeedsToBuy: { id: number; quantity: number }[] = [];

	$: quantitiesOfSeedsToBuy = buns.map((bun) => ({
		id: bun.id,
		quantity: 0
	}));

	$: maxSeedQuantities = buns.map((bun) => ({
		id: bun.id,
		maxQuantity: Math.floor((goldBalances.find((b) => b.id === bun.id)?.balance ?? 0) / 4)
	}));

	$: goldBalances = buns.map((bun) => ({
		id: bun.id,
		balance: bun.wallet.gold
	}));

	function updateBuyQuantity(bunId: number, newQuantity: number) {
		// get balance for current bun
		const goldBalance = goldBalances.find((gold) => gold.id === bunId)?.balance || 0;

		// ensure user can afford to buy the newQuantity of seeds, each seed costs 4 GOLD
		const maxAffordableQuantity = Math.floor(goldBalance / 4);

		// if newQuantity * 4 > goldBalance, we cannot afford this many seeds, so we limit it
		const validQuantity = Math.max(0, Math.min(newQuantity, maxAffordableQuantity));

		quantitiesOfSeedsToBuy = quantitiesOfSeedsToBuy.map((q) =>
			q.id === bunId ? { ...q, quantity: validQuantity } : q
		);
	}

	function formatTimeRemaining(bunId: number): string {
		if (!$hibernationTimers[bunId]) return 'Hibernating';
		const remaining = Math.max(0, $hibernationTimers[bunId] - Date.now());
		if (remaining <= 0) return 'Hibernating';

		const minutes = Math.floor(remaining / (1000 * 60));
		const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	let isDropdownOpen: boolean[] = [];
	let tempQuantities: { [key: string]: number } = {};
	$: selectedTotal = Object.values(tempQuantities).reduce((sum, qty) => sum + (qty || 0), 0);

	function handleQuantityChange(seed: Item) {
		const quantity = tempQuantities[seed.name];
		if (quantity < 0) tempQuantities[seed.name] = 0;
		if (quantity > seed.quantity) tempQuantities[seed.name] = seed.quantity;
		tempQuantities = { ...tempQuantities };
	}

	function handleApplySeeds(bun: Bun) {
		const newSeeds: Item[] = [];
		Object.entries(tempQuantities).forEach(([seedName, quantity]) => {
			if (quantity > 0) {
				const seed = bun.wallet.items.find((item) => item.name === seedName);
				if (seed && seed.fruitType) {
					newSeeds.push({
						type: seed.type,
						name: seed.name,
						quantity: quantity,
						fruitType: seed.fruitType,
						imgPath: seed.imgPath
					});
				}
			}
		});

		if (newSeeds.length === 0) {
			addMessage('no seeds selected');
			return;
		}

		const existingIndex = selectedSeeds.findIndex((s) => s.id === bun.id);
		if (existingIndex >= 0) {
			selectedSeeds[existingIndex].seeds = newSeeds;
		} else {
			selectedSeeds.push({
				id: bun.id,
				seeds: newSeeds
			});
		}
		tempQuantities = {};
	}

	let selectedSeeds: { id: number; seeds: Item[] }[] = [];

	$: buns = $wallet?.nfts.filter((nft: Bun) => nft.type === 'Bun') ?? [];

	let coundownIntervals: { [key: number]: number } = {};

	function connectWallet() {
		showAbout.set(false);
	}

	// Calculate remaining time functions
	function calculateTimeUntilHibernation(bun: Bun) {
		if (bun.isHibernating) return 0;
		const levelsUntilHibernation = bunStatus.length - 1 - bun.hungerLevel;
		if (bun.hungerIntervalId) {
			const timeIntoInterval = Date.now() % HUNGER_INTERVAL;
			const currentLevelTimeRemaining = HUNGER_INTERVAL - Math.floor(timeIntoInterval);
			return (levelsUntilHibernation - 1) * HUNGER_INTERVAL + currentLevelTimeRemaining;
		}
		return levelsUntilHibernation * HUNGER_INTERVAL;
	}

	// harvest all available fruit with 1 click
	function harvestAll(bun: Bun) {
		// update wallet store
		wallet.update((w) => {
			// get bun index
			const bunIndex = w.nfts.findIndex((nft) => nft.id === bun.id);
			// return if invalid index
			if (bunIndex === -1) return w;

			// get farm plots
			const plots = w.nfts[bunIndex].farm;

			// initiate var to hold number of fruit harvested
			let harvestedCount = 0;

			// iterate through each plot
			plots.forEach((plot, plotIndex) => {
				// if there are fruits ready to harvest
				if (plot.fruitsReady && plot.fruitsReady > 0) {
					// tally harvested fruit
					harvestedCount += plot.fruitsReady;
					// get the fruit type of the current plot
					const fruit = w.nfts[bunIndex].wallet.items.find(
						(item) => item.type === 'fruit' && item.fruitType === plot.type
					);
					// add the correct amount of fruit to wallet
					if (fruit) {
						fruit.quantity += plot.fruitsReady;
					}

					// get withered seed item object
					const witheredSeed = w.nfts[bunIndex].wallet.items.find(
						(item) => item.type === 'witheredSeed' && item.fruitType === plot.type
					);

					// if tree in plot is fully harvested
					if (plot.fruitRemaining === plot.fruitsReady) {
						// reset plot
						plots[plotIndex] = { state: 'empty', isWithered: false };
						// if the tree isn't already a withered tree
						if (!plot.isWithered) {
							// add withered seed to wallet
							if (witheredSeed) {
								witheredSeed.quantity += 1;
							}
						}
					} else if (plot.fruitRemaining) {
						plot.fruitRemaining -= plot.fruitsReady;
						plot.fruitsReady = 0;
					}
				}
			});

			if (harvestedCount > 0) {
				addMessage(`Harvested ${harvestedCount} from ${bun.name}`);
			}

			return w;
		});
	}

	function sellFruit(bun: Bun) {
		const quantity = quantitiesOfFruitToSell.find((q) => q.id === bun.id)?.quantity || 0;
		const availableFruits = fruitQuantities.find((fq) => fq.id === bun.id)?.quantity || 0;

		if (quantity <= 0) {
			addMessage('Please enter a quantity greater than 0');
			return;
		}

		if (quantity > availableFruits) {
			addMessage(`Not enough fruits. Only ${availableFruits} available`);
			return;
		}

		const FRUIT_SELL_PRICE = 1;

		wallet.update((w) => {
			const bunIndex = w.nfts.findIndex((nft) => nft.id === bun.id);
			if (bunIndex === -1) return w;

			const bunNft = w.nfts[bunIndex];
			const revenue = quantity * FRUIT_SELL_PRICE;
			bunNft.wallet.gold += revenue;

			const fruitItems = bunNft.wallet.items.filter(
				(item) => item.type === 'fruit' && item.quantity > 0
			);
			let remainingToSell = quantity;

			for (const fruit of fruitItems) {
				if (remainingToSell <= 0) break;

				if (fruit.quantity >= remainingToSell) {
					fruit.quantity -= remainingToSell;
					remainingToSell = 0;
				} else {
					remainingToSell -= fruit.quantity;
					fruit.quantity = 0;
				}
			}
			addMessage(`Selling ${quantity} fruits from ${bun.name}`);

			return w;
		});

		// Reset the sell quantity for this bun
		quantitiesOfFruitToSell = quantitiesOfFruitToSell.map((q) =>
			q.id === bun.id ? { ...q, quantity: 0 } : q
		);
	}

	function buySeeds(bun: Bun) {
		// get the amount of seeds the user wants to buy
		const quantity = quantitiesOfSeedsToBuy.find((q) => q.id === bun.id)?.quantity || 0;
		// get the bun's gold balance
		const goldBalance = goldBalances.find((b) => b.id === bun.id)?.balance || 0;

		// check if bun can afford the seeds, each seed costs 4 GOLD
		if (goldBalance < quantity * 4) {
			return;
		}

		wallet.update((w) => {
			// get current bun index
			const bunIndex = w.nfts.findIndex((nft) => nft.id === bun.id);
			// return if invalid index
			if (bunIndex === -1) return w;
			// get bun based on index
			const bunNft = w.nfts[bunIndex];
			// get seed price
			const price = quantity * 4;
			// subtract seed price from wallet
			bunNft.wallet.gold -= price;
			// find correct seed to buy
			const seed = bunNft.wallet.items.find(
				(item) =>
					item.type === 'seed' &&
					$dailyItems.some((dailyItem) => dailyItem.type === 'seed' && dailyItem.name === item.name)
			);
			if (seed) {
				seed.quantity += quantity;
			}
			addMessage(`bought ${quantity} seeds`);
			return w;
		});
		quantitiesOfSeedsToBuy = quantitiesOfSeedsToBuy.map((q) =>
			q.id === bun.id ? { ...q, quantity: 0 } : q
		);
	}

	// create a seed object with the quantity that the user selected in the selected seeds value
	// pass the seed object and the bun into this function

	let tempSeedQuantity: number = 0; // Temporary store for the quantity input
	let tempSeedSelection: string = ''; // Store for the currently selected seed

	function handleChangeSeedQuantity(type: string, quantity: number) {
		// pass type and quantity
		createSeedObject(type, quantity);
	}

	// Add click outside handler to close dropdown
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.win95-select') && isDropdownOpen) {
			isDropdownOpen = [];
		}
	}

	function clearSelectedSeeds() {
		selectedSeeds = [];
	}

	function plantSeeds(bun: Bun) {
		const relevantSeeds = selectedSeeds.find((s) => s.id === bun.id);
		if (relevantSeeds && relevantSeeds.seeds && relevantSeeds.seeds.length === 0) {
			addMessage('No seeds selected for planting');
			return;
		}

		wallet.update((w) => {
			const bunIndex = w.nfts.findIndex((nft) => nft.id === bun.id);
			if (bunIndex === -1) return w;

			// Plant the seeds and get updated bun
			if (relevantSeeds && relevantSeeds.seeds) {
				const result = plantBatchSeeds(w.nfts[bunIndex], relevantSeeds?.seeds);
				// If no seeds were planted, don't update the wallet
				if (result.seedsPlanted === 0) {
					addMessage('No suitable plots available for planting');
					return w;
				}

				// Update the bun in the wallet
				w.nfts[bunIndex] = result.updatedBun;

				return w;
			} else {
				return w;
			}
		});

		// Clear selections after successful planting
		selectedSeeds = [];
		// Close the seed selection dropdown if it's open
		isDropdownOpen = [];
	}

	let showFeedBun: boolean[] = [true];

	function handleToggleFeedBun(bun: Bun) {
		// reset the array
		showFeedBun = [];
		// get bun index
		const bunIndex = $wallet.nfts.findIndex((nft) => nft.id === bun.id);
		showFeedBun[bunIndex] = !showFeedBun[bunIndex];
	}

	function feedBun(bun: Bun) {
		// Implementation for feeding bun
		addMessage('Feeding bun not implemented yet');
	}

	function handleCloseFarmtek() {
		farmtekOpen.set(false);
	}

	let bunCard: { show: boolean; id: number };
	function showBunCard(bunId: number) {
		bunCard = { show: true, id: bunId };
	}
	function hideBunCard() {
		bunCard = { show: false, id: 999999 };
	}

	onDestroy(() => {
		Object.values(coundownIntervals).forEach((interval) => clearInterval(interval));
	});
</script>

<main class="h-screen font-MS w-screen bg-black bg-opacity-85 fixed top-0 left-0 z-50">
	<div
		in:scale={{ delay: 500 }}
		class="win95-window {$showAbout
			? 'w-[520px] m-auto absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2'
			: 'w-full absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 m-auto'} bg-gray-200 max-w-[1440px] h-auto m-auto"
	>
		<!-- Title bar -->
		<div
			class="flex justify-between win95-title-bar items-baseline p-1 px-2 bg-gradient-to-r from-blue-950 to-sky-600"
		>
			{#if $showAbout === true}
				<h1 class="font-MS text-white text-sm translate-y-1">About FarmTek v2.0</h1>
			{:else}
				<h1 class="font-MS text-white text-sm self-baseline translate-y-1">
					Bunsanto FarmTek v2.0
				</h1>
			{/if}
			<button
				class="win95-button p-1 px-2 text-xs font-MS-Bold"
				on:click={() => handleCloseFarmtek()}>X</button
			>
		</div>

		{#if $showAbout === true}
			<div class="">
				<img src="/images/tools/bunsanto-splash.webp" alt="" />
				<div class="px-8 flex flex-col space-y-4 my-4 mb-8">
					<p class="font-MS-Bold text-xs">Bunsanto™ FarmTek v2.0</p>
					<p class="text-xs">
						© 1985-1996 Bunsanto Corporation. All rights reserved. Warning: This computer program
						is protected by copyright law and international treaties. Unauthorized reproduction or
						distribution of this program, or any portion of it, may result in severe civil and
						criminal penalties, and will be prosecuted to the maximum extent possible under the law.
					</p>
					<button on:click={() => connectWallet()} class="win95-button m-auto p-1 px-2"
						>Connect Wallet</button
					>
				</div>
			</div>
		{:else}
			<!-- Table Header -->
			<div class="p-2 win95-inner bg-white mt-12 m-2">
				<div class="win95-scroll-container overflow-auto p-2">
					<table class="w-full text-sm font-MS">
						<thead>
							<tr class="bg-gray-200 font-MS-Bold">
								<th class="p-1 border border-gray-400 text-left">Bun ID</th>
								<th class="p-1 border border-gray-400 text-left">Planted</th>
								<th class="p-1 border border-gray-400 text-left">Remaining</th>
								<th class="p-1 border border-gray-400 text-left">Harvestable</th>
								<th class="p-1 border border-gray-400 text-left">Hibernation</th>
								<th class="p-1 border border-gray-400 text-left">Harvest</th>
								<th class="p-1 border border-gray-400 text-left">Sell Amount</th>
								<th class="p-1 border border-gray-400 text-left">Sell Fruit</th>
								<th class="p-1 border border-gray-400 text-left">Gold Balance</th>
								<th class="p-1 border border-gray-400 text-left">Seed Amount</th>
								<th class="p-1 border border-gray-400 text-left">Buy Seeds</th>
								<th class="p-1 border border-gray-400 text-left">Seed to plant</th>
								<th class="p-1 border border-gray-400 text-left">Plant</th>
								<th class="p-1 border border-gray-400 text-left">Feed Bun</th>
							</tr>
						</thead>
						<tbody>
							{#each buns as bun, index}
								<tr
									class={index % 2 === 0
										? 'bg-slate-100 hover:bg-slate-300'
										: 'bg-slate-200 hover:bg-slate-300'}
								>
									<!-- id -->
									<td class="relative p-1 border border-gray-400">
										<button
											on:mouseenter={() => showBunCard(bun.id)}
											on:mouseleave={() => hideBunCard()}
											class="underline"
										>
											{bun.id}
										</button>
										{#if bunCard && bunCard.id === bun.id}
											<div
												class="w-24 h-32 absolute left-8 top-1/2 -translate-y-1/2 p-2 border-black border-[1px] bg-amber-50 flex flex-col justify-between"
											>
												<img src={bun.imageUrl} alt={bun.name} />
												<p class="text-center">{bun.name}</p>
											</div>
										{/if}
									</td>
									<!-- trees planted -->
									<td class="p-1 border border-gray-400">
										{bun.farm.filter((plot) => plot.state === 'planted').length}
									</td>
									<!-- total fruit remaining -->
									<td class="p-1 border border-gray-400">
										{bun.farm.reduce((sum, plot) => sum + (plot.fruitRemaining || 0), 0)}
									</td>
									<!-- fruits ready to harvest -->
									<td class="p-1 border border-gray-400">
										{bun.farm.reduce((sum, plot) => sum + (plot.fruitsReady || 0), 0)}
									</td>
									<!-- time before hibernation -->
									<td class="p-1 border border-gray-400">
										{#if bun.isHibernating}
											<span class="font-MS-Bold uppercase">hibernating</span>
										{:else if formattedTimes.find((time) => time.id === bun.id)?.timeRemaining}
											<span>
												{formattedTimes.find((time) => time.id === bun.id)?.timeRemaining}
											</span>
										{:else}
											<span class="loading-data"> </span>
										{/if}
									</td>
									<!-- harvest all button -->
									<td class="p-1 border border-gray-400">
										<button
											class="whitespace-nowrap win95-button w-full"
											on:click={() => harvestAll(bun)}
										>
											Harvest All
										</button>
									</td>
									<!-- sell amount -->
									<td class="p-1 border border-gray-400">
										<input
											type="number"
											class="w-16 win95-input"
											min="1"
											max={fruitQuantities.find((quantity) => quantity.id === bun.id)?.quantity}
											value={quantitiesOfFruitToSell.find((q) => q.id === bun.id)?.quantity ??
												fruitQuantities.find((quantity) => quantity.id === bun.id)?.quantity}
											on:input={(e) =>
												updateSellQuantity(bun.id, parseInt(e.currentTarget.value) || 0)}
										/>
									</td>
									<!-- sell fruit button -->
									<td class="p-1 border border-gray-400">
										<button
											class="whitespace-nowrap win95-button disabled:opacity-50 disabled:cursor-not-allowed w-full"
											disabled={fruitQuantities.find((quantity) => quantity.id === bun.id)
												?.quantity === 0}
											on:click={() => sellFruit(bun)}
										>
											Sell Fruit
										</button>
									</td>
									<!-- gold balance -->
									<td class="p-1 border border-gray-400">
										{bun.wallet.gold}
									</td>
									<!-- seed amount -->
									<td class="p-1 border border-gray-400">
										<input
											type="number"
											class="w-16 win95-input"
											min="1"
											max={maxSeedQuantities.find((max) => max.id === bun.id)?.maxQuantity ?? 0}
											value={quantitiesOfSeedsToBuy.find((q) => q.id === bun.id)?.quantity}
											on:input={(e) =>
												updateBuyQuantity(bun.id, parseInt(e.currentTarget.value) || 0)}
										/>
									</td>
									<!-- buy seeds -->
									<td class="p-1 border border-gray-400">
										<button
											class="whitespace-nowrap win95-button w-full"
											disabled={(goldBalances.find((balance) => balance.id === bun.id)?.balance ??
												0) <= 4}
											on:click={() => buySeeds(bun)}
										>
											Buy
										</button>
									</td>
									<!-- select seeds to plant -->
									<td class="p-1 border border-gray-400 relative">
										<div class="flex justify-between items-center gap-1">
											<button
												class="whitespace-nowrap win95-button text-xs flex-grow text-left px-2"
												on:click={() => (isDropdownOpen[index] = !isDropdownOpen[index])}
											>
												Select Seeds
											</button>
										</div>

										{#if isDropdownOpen[index]}
											<div
												class="absolute left-0 top-full mt-1 bg-gray-100 border-2 border-gray-400 p-2 z-50 w-40 win95-inner"
											>
												<!-- Seed Selection Controls -->
												<div class="w-full mb-1 text-xs">
													{#each bun.wallet.items.filter((item) => (item.type === 'seed' || item.type === 'witheredSeed') && item.quantity > 0 && !selectedSeeds.some((s) => s.name === item.name)) as seed}
														<div class="flex justify-between mb-1">
															<p>{seed.name}: ({seed.quantity})</p>
															<input
																class="win95-input px-1 w-12"
																min="0"
																max={seed.quantity}
																type="number"
																bind:value={tempQuantities[seed.name]}
																on:input={() => handleQuantityChange(seed)}
															/>
														</div>
													{/each}
												</div>

												<div class="flex gap-4 items-center">
													<p>
														Total: {selectedTotal}
													</p>
													<button
														class="win95-button flex-1 text-xs"
														on:click={() => {
															handleApplySeeds(bun);
															isDropdownOpen = [];
														}}
													>
														Apply
													</button>
												</div>
											</div>
										{/if}
									</td>
									<!-- plant seeds button -->
									<td class="p-1 border border-gray-400">
										<button
											class="win95-button disabled:opacity-50 disabled:cursor-not-allowed w-full"
											disabled={!selectedSeeds.find((s) => s.id === bun.id)?.seeds.length}
											on:click={() => plantSeeds(bun)}
										>
											Plant
										</button>
									</td>
									<!-- feed bun button -->
									<td class="p-1 border border-gray-400">
										<button
											class="whitespace-nowrap win95-button w-full"
											on:click={() => handleToggleFeedBun(bun)}
										>
											Feed Bun
										</button>
									</td>
								</tr>
								{#if showFeedBun[index]}
									<tr>
										<td
											colspan="14"
											in:slide={{ duration: 250, easing: backOut }}
											class="justify-between items-center py-1 h-12 flex space-x-1"
										>
											<div class="flex gap-2">
												<button
													class="px-1 h-8 whitespace-nowrap win95-button"
													on:click={() => feedBun(bun)}
												>
													Feed Bun
												</button>
											</div>

											{#if bunsFruits.find((f) => f.id === bun.id)?.fruits.length}
												{#each bunsFruits.find((f) => f.id === bun.id)?.fruits || [] as fruit}
													<div class="px-1 flex items-center h-full space-x-1">
														<button
															on:click={() => handleToggleItemsToFeed(bun, fruit)}
															class="group relative"
														>
															<div>
																{#if fruit.quantity > 1}
																	<p class="absolute -top-2 -left-2 px-1 rounded-full text-xs">
																		{fruit.quantity}
																	</p>
																{/if}
																<img
																	class={`h-8 group-hover:scale-110 w-auto transition-opacity duration-200 ${itemsToFeedMyBun.some((i) => i.name === fruit.name) ? 'opacity-100' : 'opacity-50 hover:opacity-85'}`}
																	src={fruit.imgPath}
																	alt={fruit.name}
																/>
															</div>
														</button>
														{#if fruit.quantity > 1 && itemsToFeedMyBun.some((i) => i.name === fruit.name)}
															<input
																max={fruit.quantity}
																class="h-6 w-8 win95-input"
																type="number"
																value={itemsToFeedMyBun.find((i) => i.name === fruit.name)
																	?.quantity || 1}
																on:input={(e) =>
																	updateQuantityOfItemsToEat(
																		bun,
																		fruit,
																		parseInt(e.currentTarget.value)
																	)}
															/>
														{/if}
													</div>
												{/each}
											{/if}
										</td>
										{#if itemsToFeedMyBun.length > 0}
											<td colspan="14" class="p-2 bg-gray-100">
												{#if itemsToFeedMyBun.length > 0}
													<button
														on:click={() => handleRemoveItemsToFeed(bun, itemsToFeedMyBun)}
														class="px-1 h-8 whitespace-nowrap win95-button"
													>
														Clear All
													</button>
												{/if}
												<div class="flex flex-wrap">
													{#each itemsToFeedMyBun as food, index}
														<span class="inline-block pl-2">{food.quantity}x {food.name} </span>
														{#if index > -1 && index < itemsToFeedMyBun.length - 1}
															<span class="inline-block">,</span>
														{:else if index === itemsToFeedMyBun.length - 1}
															<span class="inline-block">.</span>
														{/if}
													{/each}
												</div>
											</td>
										{/if}
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</main>

<style>
	.win95-window {
		border: 2px solid;
		border-right-color: #404040;
		border-bottom-color: #404040;
		border-left-color: #fff;
		border-top-color: #fff;
		background: #c0c0c0;
	}

	.win95-inner {
		border: 2px solid;
		border-right-color: #404040;
		border-bottom-color: #404040;
		border-left-color: #fff;
		border-top-color: #fff;
	}

	.win95-button {
		border: 2px solid;
		border-right-color: #404040;
		border-bottom-color: #404040;
		border-left-color: #fff;
		border-top-color: #fff;
		background: #c0c0c0;
		font-size: 11px;
	}

	.win95-button:disabled {
		background: #c0c0c0;
		border-color: #808080;
		color: #808080;
	}

	.win95-button:active {
		border-right-color: #fff;
		border-bottom-color: #fff;
		border-left-color: #404040;
		border-top-color: #404040;
	}

	.win95-input,
	.win95-select {
		position: relative;
		border: 2px solid;
		border-right-color: #fff;
		border-bottom-color: #fff;
		border-left-color: #404040;
		border-top-color: #404040;
		padding-left: 3px;
		background: #fff;
		font-size: 11px;
	}

	.even {
		background-color: #f5f8fa;
	}
	.odd {
		background-color: #fcfeff;
	}

	::-webkit-scrollbar {
		width: 16px;
		height: 16px;
	}

	::-webkit-scrollbar-track {
		background: #c0c0c0;
		border-left: 1px solid #868686;
		border-top: 1px solid #868686;
	}

	::-webkit-scrollbar-thumb {
		background: #c0c0c0;
		border: 1px solid;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
		border-left-color: #868686;
		border-top-color: #868686;
		box-shadow:
			1px 1px 0px rgba(255, 255, 255, 0.9) inset,
			-1px -1px 0px rgba(0, 0, 0, 0.1) inset;
	}

	::-webkit-scrollbar-thumb:hover {
		background: #d4d0c8;
	}

	::-webkit-scrollbar-button {
		background: #c0c0c0;
		border: 1px solid;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
		border-left-color: #868686;
		border-top-color: #868686;
		width: 16px;
		height: 16px;
		box-shadow:
			1px 1px 0px rgba(255, 255, 255, 0.9) inset,
			-1px -1px 0px rgba(0, 0, 0, 0.1) inset;
	}

	::-webkit-scrollbar-button:hover {
		background: #d4d0c8;
	}

	/* Scrollbar corner */
	::-webkit-scrollbar-corner {
		background: #c0c0c0;
	}

	/* Specific button styles */
	::-webkit-scrollbar-button:vertical:start {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 8L8 4L12 8' stroke='black' stroke-width='1'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
	}

	::-webkit-scrollbar-button:vertical:end {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 8L8 12L12 8' stroke='black' stroke-width='1'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
	}

	::-webkit-scrollbar-button:horizontal:start {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 4L4 8L8 12' stroke='black' stroke-width='1'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
	}

	::-webkit-scrollbar-button:horizontal:end {
		background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 4L12 8L8 12' stroke='black' stroke-width='1'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
	}

	/* Add this class to your table container */
	.win95-scroll-container {
		scrollbar-width: auto; /* Firefox */
		scrollbar-color: #c0c0c0 #c0c0c0; /* Firefox */
		overflow: auto;
		max-height: calc(100vh - 100px); /* Adjust based on your needs */
	}

	/* create a css class loading-data that will show a simple loading animation */
	.loading-data {
		display: inline-block;
		width: 10px;
		height: 10px;
		border: 2px solid #c0c0c0;
		border-radius: 50%;
		border-top-color: transparent;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

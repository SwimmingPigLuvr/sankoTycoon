<!-- lib/components/Farmtek.svelte -->
<script lang="ts">
	import { showAbout } from '$lib/stores/abilities';
	import { addMessage, farmtekOpen } from '$lib/stores/gameState';
	import { bunStatus } from '$lib/stores/hungerState';
	import { wallet, type Bun, type Plot, type Item } from '$lib/stores/wallet';
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { scale } from 'svelte/transition';

	$: buns = $wallet.nfts.filter((nft: Bun) => nft.type === 'Bun') ?? [];

	let coundownIntervals: { [key: number]: number } = {};

	function connectWallet() {
		showAbout.set(false);
	}

	function formatTimeRemaining(seconds: number): string {
		if (seconds <= 0) return 'Hibernating';
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	// Calculate remaining time functions
	function calculateTimeUntilHibernation(bun: Bun) {
		if (bun.isHibernating) return 0;
		const HUNGER_INTERVAL = 5;
		const levelsUntilHibernation = bunStatus.length - 1 - bun.hungerLevel;
		if (bun.hungerIntervalId) {
			const timeIntoInterval = Date.now() % HUNGER_INTERVAL;
			const currentLevelTimeRemaining = HUNGER_INTERVAL - Math.floor(timeIntoInterval);
			return (levelsUntilHibernation - 1) * HUNGER_INTERVAL + currentLevelTimeRemaining;
		}
		return levelsUntilHibernation * HUNGER_INTERVAL;
	}

	$: {
		buns.forEach((bun) => {
			if (coundownIntervals[bun.id]) {
				clearInterval(coundownIntervals[bun.id]);
			}

			coundownIntervals[bun.id] = setInterval(() => {
				timeRemaining.update((times) => ({
					...times,
					[bun.id]: calculateTimeUntilHibernation(bun)
				}));
			}, 1000);
		});
	}

	const timeRemaining = writable<{ [key: number]: number }>({});

	function harvestAll(bun: Bun) {
		wallet.update((w) => {
			const bunIndex = w.nfts.findIndex((nft) => nft.id === bun.id);
			if (bunIndex === -1) return w;

			const plots = w.nfts[bunIndex].farm;
			let harvestedCount = 0;

			plots.forEach((plot, plotIndex) => {
				if (plot.fruitsReady && plot.fruitsReady > 0) {
					harvestedCount += plot.fruitsReady;
					const fruit = w.nfts[bunIndex].wallet.items.find(
						(item) => item.type === 'fruit' && item.fruitType === plot.type
					);
					if (fruit) {
						fruit.quantity += plot.fruitsReady;
					}
					// reset plot when all fruits are harvested
					if (plot.fruitRemaining === plot.fruitsReady) {
						plots[plotIndex] = { state: 'empty', isWithered: false };
					} else {
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
		// Implementation for selling fruit
		addMessage('Selling fruit not implemented yet');
	}

	function buySeeds(bun: Bun) {
		// Implementation for buying seeds
		addMessage('Buying seeds not implemented yet');
	}

	function plantSeeds(bun: Bun) {
		// Implementation for planting seeds
		addMessage('Planting seeds not implemented yet');
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
			<div class="p-2 win95-inner bg-white m-2">
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
										{:else}
											<span>
												{formatTimeRemaining($timeRemaining[bun.id])}
											</span>
										{/if}
									</td>
									<!-- harvest all button -->
									<td class="p-1 border border-gray-400">
										<button class="win95-button w-full" on:click={() => harvestAll(bun)}>
											Harvest All
										</button>
									</td>
									<!-- sell amount -->
									<td class="p-1 border border-gray-400">
										<input type="number" class="w-16 win95-input" min="1" value="1" />
									</td>
									<!-- sell fruit button -->
									<td class="p-1 border border-gray-400">
										<button class="win95-button w-full" on:click={() => sellFruit(bun)}>
											Sell Fruit
										</button>
									</td>
									<!-- gold balance -->
									<td class="p-1 border border-gray-400">
										{bun.wallet.gold}
									</td>
									<!-- seed amount -->
									<td class="p-1 border border-gray-400">
										<input type="number" class="w-16 win95-input" min="1" value="1" />
									</td>
									<!-- buy seeds -->
									<td class="p-1 border border-gray-400">
										<button class="win95-button w-full" on:click={() => buySeeds(bun)}>
											Buy
										</button>
									</td>
									<!-- select seeds to plant -->
									<td class="p-1 border border-gray-400">
										<select class="win95-select w-full">
											<option value="">Select Seed</option>
											{#each bun.wallet.items.filter((item) => item.type === 'seed' || item.type === 'witheredSeed') as seed}
												<option value={seed.name}>{seed.name}</option>
											{/each}
										</select>
									</td>
									<!-- plant seeds button -->
									<td class="p-1 border border-gray-400">
										<button class="win95-button w-full" on:click={() => plantSeeds(bun)}>
											Plant
										</button>
									</td>
									<!-- feed bun button -->
									<td class="p-1 border border-gray-400">
										<button class="win95-button w-full" on:click={() => feedBun(bun)}>
											Feed Bun
										</button>
									</td>
								</tr>
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

	.win95-button:active {
		border-right-color: #fff;
		border-bottom-color: #fff;
		border-left-color: #404040;
		border-top-color: #404040;
	}

	.win95-input,
	.win95-select {
		border: 2px solid;
		border-right-color: #fff;
		border-bottom-color: #fff;
		border-left-color: #404040;
		border-top-color: #404040;
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
</style>

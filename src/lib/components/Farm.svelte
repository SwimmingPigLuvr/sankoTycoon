<script lang="ts">
	import { wallet, type Bun, type Item, type Plot } from '$lib/stores/wallet';
	import { get } from 'svelte/store';
	import Wallet from './Wallet.svelte';
	import * as itemData from '$lib/itemData';
	import { fade } from 'svelte/transition';
	import { gameState, b } from '$lib/stores/gameState';

	export let bun: Bun;

	let selectedSeed: Item | undefined;

	$: buns = $wallet.nfts ?? [];
	$: bunWallet = buns[$b].wallet;
	$: availableSeeds = bunWallet.items.filter(
		(item: Item) => item.type === 'seed' && item.quantity > 0
	);
	$: availableWitheredSeeds = bunWallet.items.filter(
		(item: Item) => item.type === 'witheredSeed' && item.quantity > 0
	);

	$: allAvailableSeeds = [...availableSeeds, ...availableWitheredSeeds];

	// create farms for every bun

	let selectedPlotIndex: number | null = null;
	// create 25 plots set to empty
	let plots: Plot[] = Array(25).fill({ state: 'empty' });

	// fruits available to harvest
	// eventually the user can 1 click harvest all these fruits :]
	$: harvest = plots.filter((plot) => plot.fruitsReady && plot.fruitsReady > 0);
	$: projectedHarvest = plots.reduce((total, plot) => total + (plot.fruitRemaining || 0), 0);

	let plotTimers: Array<NodeJS.Timeout | null> = Array(25).fill(null);

	//function to select plot
	function selectPlot(index: number) {
		console.log('selected plot: ', index);
		selectedPlotIndex = index;
	}

	// Function to plant a seed in the selected plot
	function plantSeed() {
		console.log('plotIndex: ', selectedPlotIndex);
		console.log('selectedSeed: ', selectedSeed?.name);
		console.log('fruitType: ', selectedSeed?.fruitType);
		console.log('quantity: ', selectedSeed?.quantity);
		// if no seedSelected
		if (selectedSeed === undefined) {
			return;
		}
		console.log('selectedSeed: ', selectedSeed.name);
		// if valid seed selected
		if (selectedPlotIndex !== null && selectedSeed !== undefined && selectedSeed.fruitType) {
			// Update the seed quantity in the user's wallet
			wallet.update((currentWallet) => {
				const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
				if (bunIndex !== -1) {
					const bunItem = currentWallet.nfts[bunIndex];
					let seed: Item | undefined;
					if (selectedSeed?.type === 'seed') {
						seed = bunItem.wallet.items.find(
							(item: Item) => item.type === 'seed' && item.fruitType === selectedSeed?.fruitType
						);
						console.log('Found Seed: ', seed);
					} else if (selectedSeed?.type === 'witheredSeed') {
						seed = bunItem.wallet.items.find(
							(item: Item) =>
								item.type === 'witheredSeed' && item.fruitType === selectedSeed?.fruitType
						);
						console.log('Found Withered Seed: ', seed);
					}

					if (seed && seed.quantity > 0 && selectedPlotIndex !== null && selectedSeed) {
						// Reduce the seed count by 1
						seed.quantity -= 1;

						// Update the plot state
						plots[selectedPlotIndex] = {
							state: 'planted',
							type: selectedSeed.fruitType,
							maturity: 0,
							fruitRemaining: selectedSeed.type === 'witheredSeed' ? 3 : 5,
							fruitsReady: 0,
							plantedAt: Date.now(),
							isWithered: selectedSeed.type === 'witheredSeed'
						};
						console.log(
							'based on the seed type we will yield this many fruits: ',
							plots[selectedPlotIndex].fruitRemaining
						);

						// Reset selectedSeed after planting
						selectedSeed = undefined;

						// Start independent growth timer for the planted plot
						startPlotGrowthTimer(selectedPlotIndex);
					} else {
						alert('Not enough seeds to plant');
					}
				}
				return currentWallet;
			});
		}
		allAvailableSeeds = [...allAvailableSeeds];
	}

	function startPlotGrowthTimer(plotIndex: number) {
		console.log('start growth timer: ', plotIndex);
		// when this number gets to 5 we stop adding fruit
		let totalReadyFruits = 0;
		// clear old timers for plot
		// there should not be any other timers because
		// a planted plot won't have access to the plant button.
		if (plotTimers[plotIndex]) {
			console.log('interval cleared: ', plotIndex);
			clearInterval(plotTimers[plotIndex]);
		}

		// start new timer
		plotTimers[plotIndex] = setInterval(() => {
			let plot = plots[plotIndex];
			if (plot.state === 'planted' && plot.maturity !== undefined) {
				// if not fully mature, increment by 25%
				if (plot.maturity < 100) {
					plot.maturity += 25;

					plots = [...plots];
				}
				// if fully mature, add fruit
				if (
					plot.maturity === 100 &&
					plot.fruitRemaining &&
					plot.fruitRemaining > 0 &&
					plot.fruitsReady !== undefined &&
					plot.fruitsReady < plot.fruitRemaining
				) {
					plot.fruitsReady += 1;
					totalReadyFruits += 1;

					console.log('fruits remaining: ', plot.fruitRemaining);
					console.log('fruits ready to harvest: ', plot.fruitsReady);
					plots = [...plots];
				}
				// if 5 fruits have become ready, clear interval
				if (totalReadyFruits === 5) {
					// clear timer if plot is fully matured
					clearInterval(plotTimers[plotIndex]);
					plotTimers[plotIndex] = null;
					plots = [...plots];
				}
			}
		}, 1000);
	}

	function harvestFruit(index: number) {
		console.log('harvesting fruit');
		const plot = plots[index];
		console.log('plot type', plot.type);
		if (plot.fruitsReady && plot.fruitsReady > 0) {
			// update bunWallet
			wallet.update((currentWallet) => {
				const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
				if (bunIndex !== -1) {
					const bunItem: Bun = currentWallet.nfts[bunIndex];

					// find the fruit type
					let fruit = bunItem.wallet.items.find(
						(item) => item.type === 'fruit' && item.fruitType === plot.type
					);
					// find witheredSeed
					let witheredSeed = bunItem.wallet.items.find(
						(item) => item.type === 'witheredSeed' && item.fruitType === plot.type
					);
					// add fruit to wallet
					if (fruit && plot.fruitsReady) {
						fruit.quantity += plot.fruitsReady;
						console.log('adding fruits to wallet: ', plot.fruitsReady);
					}

					if (plot.fruitsReady && plot.fruitRemaining) {
						// this is how we harvest all the fruit that is ready
						plot.fruitRemaining -= plot.fruitsReady;
						plot.fruitsReady = 0;
					}
					if (plot.fruitRemaining === 0 && plot.fruitsReady === 0) {
						// add witheredSeeds to bunWallet
						if (!plot.isWithered && witheredSeed) {
							console.log('adding witheredSeed to bunwallet: ', witheredSeed.fruitType);
							witheredSeed.quantity += 1;
						}

						// clear plot
						plot.state = 'empty';
					}

					plots = [...plots];
				}
				return currentWallet;
			});
		}
		allAvailableSeeds = [...allAvailableSeeds];
	}

	function prevIndex() {
		if (selectedPlotIndex && selectedPlotIndex !== 0) {
			selectedPlotIndex -= 1;
		} else if (selectedPlotIndex === 0) {
			selectedPlotIndex = 24;
		}
	}

	function nextIndex() {
		if (selectedPlotIndex && selectedPlotIndex !== 24) {
			selectedPlotIndex += 1;
		} else if (selectedPlotIndex === 24) {
			selectedPlotIndex = 0;
		}
	}

	function getFruit(type: string): Item | undefined {
		switch (type) {
			case 'heart':
				return itemData.heartFruit;
			case 'star':
				return itemData.starFruit;
			case 'lumpy':
				return itemData.lumpyFruit;
			case 'round':
				return itemData.roundFruit;
			case 'square':
				return itemData.squareFruit;
			default:
				return undefined;
		}
	}

	function getFruitImage(type: string) {
		console.log('type: ', type);
		if (type === 'heart') {
			return 'images/fruit/heart.png';
		} else if (type === 'star') {
			return 'images/fruit/star.png';
		} else if (type === 'lumpy') {
			return 'images/fruit/lumpy.png';
		} else if (type === 'square') {
			return 'images/fruit/square.png';
		} else if (type === 'round') {
			return 'images/fruit/round.png';
		}
		// Add more conditions here if there are additional seed types.
		return 'images/items/Bunzempic.png'; // Return undefined if no known fruit type is found.
	}
</script>

<main class="flex flex-col space-y-3" in:fade={{ delay: 100, duration: 250 }}>
	<!-- Farm Grid -->
	<div>
		<div class="flex justify-between w-40 bg-lime-400">
			<h2 class="font-FinkHeavy text-2xl text-left w-40">Farm</h2>
			<!-- todo -->
			<div class="flex justify-start bg-fuchsia-200 items-center px-1">
				<img src={buns[$b].imageUrl} class="w-12 h-full" alt="" />
			</div>
		</div>
		<div class="grid gap-0 grid-cols-5 grid-rows-5 w-40 h-40 border-black border-2">
			<!-- plots -->
			{#each plots as plot, index}
				<button
					class:planted={plot.state === 'planted'}
					class="{selectedPlotIndex === index
						? 'bg-lime-400'
						: ''} hover:bg-lime-400 border border-black"
					on:click|preventDefault={() => selectPlot(index)}
				>
					{#if plot && plot.type && plot.state === 'planted'}
						<!-- mature trees -->
						{#if plot.maturity === 100}
							<!-- show the fruit of the tree type -->
							<img src={getFruitImage(plot.type)} alt="" />
						{:else}
							<div>{plot.maturity}%</div>
						{/if}
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- show info for the currently selected plot -->
	{#if selectedPlotIndex !== null}
		<div
			class="border-[1px] border-black p-3 rounded-xl {plots[selectedPlotIndex].state === 'empty'
				? 'wood'
				: 'leaf'} flex flex-col space-y-1 w-40 p-2 bg-blue-300 text-center font-FinkHeavy text-sm"
		>
			<div class="flex justify-around">
				<button on:click={() => prevIndex()}
					><img class="w-6" src="/ui/icons/arrow.png" alt="left-arrow" /></button
				>
				<p>plot #{selectedPlotIndex}</p>
				<button on:click={() => nextIndex()}
					><img
						class="w-6 transform scale-x-[-1]"
						src="/ui/icons/arrow.png"
						alt="right-arrow"
					/></button
				>
			</div>
			{#if plots[selectedPlotIndex].state === 'empty'}
				<p class="text-lg">Empty Plot</p>
			{:else if plots[selectedPlotIndex].state === 'planted'}
				<p class="capitalize text-lg">{plots[selectedPlotIndex].type} Tree</p>
				<p>Tree maturity: {plots[selectedPlotIndex].maturity}%</p>
				<p>{plots[selectedPlotIndex].fruitRemaining} Fruits Remaining</p>
			{/if}
			<!-- show ready fruits -->
			{#if plots[selectedPlotIndex].state === 'planted'}
				{#if plots[selectedPlotIndex].fruitsReady}
					<div class=" flex">
						<div class="p-2 w-full text-white rounded-lg flex justify-center items-center">
							{#each Array(plots[selectedPlotIndex].fruitsReady) as _}
								<img
									src={`/images/fruit/${plots[selectedPlotIndex].type}.png`}
									alt={`${plots[selectedPlotIndex].type} Tree`}
									class="h-6 w-6 inline-block"
								/>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
			<!-- available seeds go here -->
			{#if plots[selectedPlotIndex].state === 'empty'}
				{#if allAvailableSeeds.length > 0}
					<div class=" flex flex-wrap gap-2">
						<div class="p-2 w-full bg-black bg-opacity-30 text-white rounded-lg flex items-center">
							{#each allAvailableSeeds as seed}
								<!-- if the user clicks anywhere besides directly on the seeds then the selected seed should be undefined -->
								<button
									on:click={() => (selectedSeed = seed)}
									class="{selectedSeed === seed
										? '-translate-y-2 scale-150 hover:scale-150'
										: ''} hover:scale-150"
								>
									<img src={seed.imgPath} alt={seed.name} class="h-6 w-6 inline-block mr-2" />
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<p class="text-xs">Buy more seeds in the Shop!</p>
				{/if}
			{/if}
			<!-- plant seed / harvest fruit -->
			{#if plots[selectedPlotIndex].state === 'empty'}
				<p class="text-center">
					{selectedSeed?.name ?? ''}
				</p>
				<button
					disabled={selectedSeed === undefined}
					on:click={() => plantSeed()}
					class="disabled:bg-opacity-10 bg-white bg-opacity-50 w-3/4 m-auto rounded-full border-black border-[1px] text-green-700"
				>
					plant seed
				</button>
			{:else if plots[selectedPlotIndex].fruitsReady === 0}
				<p class="text-xs">No fruits to harvest</p>
			{:else}
				<button
					on:click={() => harvestFruit(selectedPlotIndex ?? 0)}
					class="disabled:bg-opacity-10 bg-white bg-opacity-50 w-3/4 m-auto rounded-full border-black border-[1px] text-green-700"
				>
					harvest {plots[selectedPlotIndex].fruitsReady}
				</button>
			{/if}
		</div>
	{/if}
</main>

<style>
	.wood {
		background-image: url('ui/textures/wood.jpg');
		background-repeat: repeat;
		background-size: contain;
		box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 10px 3px inset;
	}

	.leaf {
		background-image: url('ui/textures/leaf.png');
		background-repeat: repeat;
		background-size: contain;
		box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 10px 3px inset;
	}
</style>

<!-- $lib/components/Farm.svelte -->
<script lang="ts">
	import { wallet, type Bun, type Item, type Plot } from '$lib/stores/wallet';
	import { get } from 'svelte/store';
	import Wallet from './Wallet.svelte';
	import * as itemData from '$lib/itemData';
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { gameState, addMessage } from '$lib/stores/gameState';
	import { onDestroy, onMount } from 'svelte';
	import {
		autoHarvest,
		click2plant,
		totalFruitHarvested,
		totalTreesPlanted,
		type Click2plant
	} from '$lib/stores/abilities';
	import HeaderTerminal from './HeaderTerminal.svelte';
	import { backOut, cubicInOut } from 'svelte/easing';
	import { harvestFruit, plantSeed, startPlotGrowthTimer } from '$lib/utils/farmTools';

	export let bun: Bun;

	$: bunWallet = bun?.wallet ?? { bunId: 777, gold: 0, items: [itemData.hardHat] };

	// seeds
	$: availableSeeds =
		bunWallet?.items.filter((item: Item) => item.type === 'seed' && item.quantity > 0) ?? [];
	$: availableWitheredSeeds =
		bunWallet?.items.filter((item: Item) => item.type === 'witheredSeed' && item.quantity > 0) ??
		[];
	$: allAvailableSeeds = [...availableSeeds, ...availableWitheredSeeds];

	$: plots = bun?.farm ?? Array(25).fill({ state: 'empty' });

	function showSankoStylePlotNumber(index: number) {
		switch (index) {
			case 0:
				return 25;
			case 1:
				return 20;
			case 2:
				return 15;
			case 3:
				return 10;
			case 4:
				return 5;
			case 5:
				return 24;
			case 6:
				return 19;
			case 7:
				return 14;
			case 8:
				return 9;
			case 9:
				return 4;
			case 10:
				return 23;
			case 11:
				return 18;
			case 12:
				return 13;
			case 13:
				return 8;
			case 14:
				return 3;
			case 15:
				return 22;
			case 16:
				return 17;
			case 17:
				return 12;
			case 18:
				return 7;
			case 19:
				return 2;
			case 20:
				return 21;
			case 21:
				return 16;
			case 22:
				return 11;
			case 23:
				return 6;
			case 24:
				return 1;
			default:
				return index; // Return the index itself if it doesn't match any case
		}
	}

	function handlePlanting() {
		if (selectedPlotIndex) {
			const success = plantSeed(bun, selectedSeed, selectedPlotIndex);
			if (success) {
				selectedSeed = undefined;
			} else {
				alert('failed to plant seed');
			}
		} else {
			alert('no plot selected');
		}
	}

	let selectedPlotIndex: number | null = null;

	function selectPlot(index: number) {
		selectedPlotIndex = index;
	}

	let selectedSeed: Item | undefined;

	// fruits available to harvest
	// eventually the user can 1 click harvest all these fruits :]
	$: harvest = plots.filter((plot: Plot) => plot.fruitsReady && plot.fruitsReady > 0);

	// all fruits the user will yield when all trees are all grown up
	$: projectedHarvest = plots.reduce(
		(total: number, plot: Plot) => total + (plot.fruitRemaining || 0),
		0
	);

	// array of separate timers so plots grow independently

	function prevIndex() {
		if (selectedPlotIndex !== null && selectedPlotIndex !== undefined && selectedPlotIndex !== -1) {
			if (selectedPlotIndex === 24) {
				selectedPlotIndex = 0;
			} else if (selectedPlotIndex >= 20 && selectedPlotIndex <= 23) {
				selectedPlotIndex -= 19;
			} else {
				selectedPlotIndex += 5;
			}
		}
	}

	function nextIndex() {
		if (selectedPlotIndex !== null && selectedPlotIndex !== undefined && selectedPlotIndex !== -1) {
			if (selectedPlotIndex === 0) {
				selectedPlotIndex = 24;
			} else if (selectedPlotIndex >= 1 && selectedPlotIndex <= 4) {
				selectedPlotIndex += 19;
			} else {
				selectedPlotIndex -= 5;
			}
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

	// c2p lvl 1
	$: if ($click2plant.enabled && $click2plant.level === 1 && selectedSeed && selectedPlotIndex) {
		plantSeed(bun, selectedSeed, selectedPlotIndex);
	}

	// c2p lvl 2
	$: if (
		$click2plant.enabled &&
		$click2plant.level === 2 &&
		selectedPlotIndex !== null &&
		selectedPlotIndex !== undefined
	) {
		const currentPlot = plots[selectedPlotIndex];
		if (currentPlot.state === 'empty') {
			selectedSeed = allAvailableSeeds.length > 0 ? allAvailableSeeds[0] : undefined;
			if (selectedSeed) {
				// then plant the seed
				plantSeed(bun, selectedSeed, selectedPlotIndex);
			}
		}
	}

	// autoHarvest lvl 1
	// select plot to harvest fruit
	$: if (
		$autoHarvest.enabled &&
		$autoHarvest.level >= 1 &&
		selectedPlotIndex !== null &&
		selectedPlotIndex !== undefined
	) {
		const currentPlot = plots[selectedPlotIndex];
		if (
			currentPlot.state === 'planted' &&
			currentPlot.fruitsReady != null &&
			currentPlot.fruitsReady > 0
		) {
			harvestFruit(bun, selectedPlotIndex);
		}
	}

	let autoHarvestInterval: ReturnType<typeof setInterval> | null = null;
	function attemptAutoHarvest() {
		if ($autoHarvest.enabled && $autoHarvest.level === 2) {
			const index = plots.findIndex((plot) => plot.fruitsReady != null && plot.fruitsReady > 0);
			if (index !== -1) {
				harvestFruit(bun, index);
				addMessage(`autoHARVESTED fruit from plot index ${index}`);
			}
		}
	}
	// autoHarvest lvl 2
	// harvest fruit on an interval
	// select the plot index for the user
	// if the plot has any fruits ready then harvest those
	// Start the interval when auto-harvest is enabled
	$: if ($autoHarvest.enabled && $autoHarvest.level >= 2) {
		if (!autoHarvestInterval) {
			autoHarvestInterval = setInterval(attemptAutoHarvest, 1000); // Harvest every 2 seconds
		}
	} else {
		if (autoHarvestInterval) {
			clearInterval(autoHarvestInterval);
			autoHarvestInterval = null;
		}
	}

	// Clean up on component destroy
	onDestroy(() => {
		if (autoHarvestInterval) {
			clearInterval(autoHarvestInterval);
		}
	});
</script>

<main class="flex flex-col space-y-2 max-w-40">
	<!-- Farm Grid -->
	<div>
		<h2 class="font-FinkHeavy text-xl text-center w-40">Farm</h2>
		<div
			in:fly={{ y: -20, delay: 500, duration: 500, easing: backOut }}
			class="grid gap-0 grid-cols-5 grid-rows-5 w-40 h-40 border-black border-2"
		>
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
				<p>plot #{showSankoStylePlotNumber(selectedPlotIndex)}</p>
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
			{#if selectedPlotIndex !== null}
				{#if plots[selectedPlotIndex].state === 'empty'}
					<p class="text-center">
						{selectedSeed?.name ?? ''}
					</p>
					<button
						disabled={selectedSeed === undefined}
						on:click={() => plantSeed(bun, selectedSeed, selectedPlotIndex ?? 0)}
						class="disabled:bg-opacity-10 bg-white bg-opacity-50 w-3/4 m-auto rounded-full border-black border-[1px] text-green-700"
					>
						plant seed
					</button>
				{:else if plots[selectedPlotIndex].fruitsReady === 0}
					<p class="text-xs">No fruits to harvest</p>
				{:else}
					<button
						on:click={() => harvestFruit(bun, selectedPlotIndex ?? 0)}
						class="disabled:bg-opacity-10 bg-white bg-opacity-50 w-3/4 m-auto rounded-full border-black border-[1px] text-green-700"
					>
						harvest {plots[selectedPlotIndex].fruitsReady}
					</button>
				{/if}
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

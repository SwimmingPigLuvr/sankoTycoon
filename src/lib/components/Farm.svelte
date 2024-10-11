<!-- $lib/components/Farm.svelte -->
<script lang="ts">
	import { wallet, type Bun, type Item, type Plot } from '$lib/stores/wallet';
	import { get } from 'svelte/store';
	import Wallet from './Wallet.svelte';
	import * as itemData from '$lib/itemData';
	import { fade } from 'svelte/transition';
	import { gameState, b } from '$lib/stores/gameState';
	import { onMount } from 'svelte';

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

	let selectedPlotIndex: number | null = null;

	function selectPlot(index: number) {
		console.log('selected plot: ', index);
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

	// Function to plant a seed in the selected plot
	function plantSeed() {
		if (!selectedSeed || selectedPlotIndex === null || !selectedSeed.fruitType) {
			return;
		}

		// update seed quantity & plot
		wallet.update((currentWallet) => {
			const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
			if (bunIndex === -1) {
				alert('bun not found');
				return currentWallet;
			}
			const bunNft = currentWallet.nfts[bunIndex];

			// find seed
			let seed = bunNft.wallet.items.find(
				(item: Item) =>
					item.type === selectedSeed?.type && item.fruitType === selectedSeed?.fruitType
			);

			if (seed && seed.quantity > 0) {
				seed.quantity -= 1;

				// update plot
				bunNft.farm[selectedPlotIndex] = {
					state: 'planted',
					type: selectedSeed?.fruitType,
					maturity: 0,
					fruitRemaining: selectedSeed?.type === 'witheredSeed' ? 3 : 5,
					fruitsReady: 0,
					plantedAt: Date.now(),
					isWithered: selectedSeed?.type === 'witheredSeed'
				};

				// trigger reactivity
				bunNft.farm = [...bunNft.farm];

				// clear selected seed
				selectedSeed = undefined;

				if (selectedPlotIndex !== null) {
					startPlotGrowthTimer(bunIndex, selectedPlotIndex);
				} else {
					alert('selected plot index nonexistent');
					return currentWallet;
				}
			} else {
				alert('not enough seeds to plant');
			}
			return currentWallet;
		});
	}

	function startPlotGrowthTimer(bunIndex: number, plotIndex: number) {
		const currentBun = $wallet.nfts[bunIndex];
		if (!currentBun || !currentBun.farm[plotIndex]) return;

		if (!currentBun.plotTimers) {
			currentBun.plotTimers = Array(25).fill(null);
		}

		if (currentBun.plotTimers[plotIndex]) {
			clearInterval(currentBun.plotTimers[plotIndex]);
		}

		currentBun.plotTimers[plotIndex] = setInterval(() => {
			const bunFromStore = get(wallet).nfts[bunIndex];
			let plot = bunFromStore.farm[plotIndex];

			if (plot.state === 'planted' && plot.maturity !== undefined) {
				if (plot.maturity < 100) {
					plot.maturity += 25;
				}

				if (plot.maturity === 100 && plot.fruitsReady < plot.fruitRemaining) {
					plot.fruitsReady += 1;
				}

				if (plot.fruitsReady >= plot.fruitRemaining) {
					clearInterval(currentBun.plotTimers[plotIndex]);
					currentBun.plotTimers[plotIndex] = null;
				}

				wallet.update((currentWallet) => {
					currentWallet.nfts[bunIndex].farm = [...bunFromStore.farm];
					return currentWallet;
				});
			}
		}, 100);
	}

	function harvestFruit(index: number) {
		console.log('harvesting fruit');
		const plot = plots[index];
		if (plot.fruitsReady && plot.fruitsReady > 0) {
			// update bunWallet
			wallet.update((currentWallet) => {
				const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
				if (bunIndex === -1) {
					alert('bun not found');
					return currentWallet;
				}
				const bunNft: Bun = currentWallet.nfts[bunIndex];

				// find the fruit type
				let fruit = bunNft.wallet.items.find(
					(item: Item) => item.type === 'fruit' && item.fruitType === plot.type
				);

				// find witheredSeed
				let witheredSeed = bunNft.wallet.items.find(
					(item: Item) => item.type === 'witheredSeed' && item.fruitType === plot.type
				);

				// add fruit to wallet
				if (fruit && plot.fruitsReady) {
					fruit.quantity += plot.fruitsReady;
					console.log('adding fruits to wallet: ', plot.fruitsReady);
				}

				// update plot
				if (plot.fruitsReady && plot.fruitRemaining) {
					plot.fruitRemaining -= plot.fruitsReady;
					plot.fruitsReady = 0;
				}

				if (plot.fruitRemaining === 0 && plot.fruitsReady === 0) {
					// add witheredSeeds to bunWallet
					if (!plot.isWithered) {
						if (witheredSeed) {
							console.log('adding witheredSeed to bunwallet: ', witheredSeed.fruitType);
							witheredSeed.quantity += 1;
						}
					}

					// clear plot
					plot.state = 'empty';
				}

				// reassign farm to trigger reactivity
				bunNft.farm = [...bunNft.farm];

				return currentWallet;
			});
		}
		allAvailableSeeds = [...allAvailableSeeds];
	}

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
				<img src={bun?.imageUrl} class="w-12 h-full" alt="" />
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

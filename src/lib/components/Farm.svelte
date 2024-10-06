<script lang="ts">
	import { wallet, type Bun, type Item, type Plot } from '$lib/stores/wallet';
	import { get } from 'svelte/store';
	import Wallet from './Wallet.svelte';
	import { fruitData, itemData, seedData } from '$lib/itemData';
	import { fade } from 'svelte/transition';

	export let bun: Bun;

	let selectedSeed: Item | undefined;

	$: bunWallet = bun.wallet;
	$: availableSeeds = bunWallet.items.filter((item) => item.type === 'seed');

	let selectedPlotIndex: number | null = null;
	let plots: Plot[] = Array(25).fill({ state: 'empty' });

	let plotTimers: Array<NodeJS.Timeout | null> = Array(25).fill(null);

	//function to select plot
	function selectPlot(index: number) {
		console.log('selected plot: ', index);
		if (plots[index].state === 'empty') {
			selectedPlotIndex = index;
		} else {
			selectedPlotIndex = null;
		}
	}

	// Function to plant a seed in the selected plot
	function plantSeed() {
		if (selectedSeed === undefined) {
			return;
		}
		if (selectedPlotIndex !== null && selectedSeed !== undefined && selectedSeed.fruitType) {
			// Update the seed quantity in the user's wallet
			wallet.update((currentWallet) => {
				const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
				if (bunIndex !== -1) {
					const bunItem = currentWallet.nfts[bunIndex];
					const seed = bunItem.wallet.items.find(
						(item: Item) => item.fruitType === selectedSeed?.fruitType
					);

					if (seed && seed.quantity > 0 && selectedPlotIndex && selectedSeed) {
						// Reduce the seed count by 1
						seed.quantity -= 1;

						// Update the plot state
						plots[selectedPlotIndex] = {
							state: 'planted',
							type: selectedSeed.fruitType,
							maturity: 0,
							fruitRemaining: 5,
							fruitsReady: 0,
							plantedAt: Date.now()
						};

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
	}

	function startPlotGrowthTimer(plotIndex: number) {
		// clear old timers for plot
		// there should not be any other timers because
		// a planted plot won't have access to the plant button.
		if (plotTimers[plotIndex]) {
			clearInterval(plotTimers[plotIndex]);
		}

		// start new timer
		plotTimers[plotIndex] = setInterval(() => {
			let plot = plots[plotIndex];
			if (plot.state === 'planted' && plot.maturity !== undefined) {
				if (plot.maturity < 100) {
					plot.maturity += 25;
					// accumulate fruits once mature
					if (plot.maturity === 100 && plot.fruitRemaining && plot.fruitRemaining > 0) {
						plot.fruitsReady = (plot.fruitsReady || 0) + 1;
					}
				} else {
					// clear timer if plot is fully matured
					clearInterval(plotTimers[plotIndex]);
					plotTimers[plotIndex] = null;
				}
			}
		}, 1000 * 6); // every 6 seconds = 1 day
	}

	function pickFruit(index: number) {
		const plot = plots[index];
		if (plot.fruitsReady && plot.fruitsReady > 0) {
			plot.fruitsReady -= 1;

			wallet.update((currentWallet) => {
				const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
				if (bunIndex !== -1) {
					const bunItem: Bun = currentWallet.nfts[bunIndex];
					// find fruit that match the current type
					let fruit = bunItem.wallet.items.find(
						(item) => item.type === 'fruit' && item.fruitType === plot.type
					);
					if (fruit) {
						fruit.quantity += 1;
					} else {
						bunItem.wallet.items.push({
							type: 'fruit',
							name: `${plot.type} Fruit`,
							quantity: 1,
							imgPath: fruitData[plot.type]?.imgPath,
							fruitType: plot.type
						});
					}
				}
				return currentWallet;
			});

			if (plot.fruitRemaining !== undefined) {
				plot.fruitRemaining -= 1;
			}
			if (plot.fruitRemaining === 0 && plot.fruitsReady === 0) {
				plot.state = 'empty';
			}
		}
	}

	// right now every plot will mature at the same intervals but i want the trees to mature independtly of one another.
	// Simulate the passage of time every day (for demonstration purposes)
	setInterval(() => {
		plots = plots.map((plot) => {
			if (plot.state === 'planted') {
				// Increase maturity by 25% until fully matured (100%)
				if (plot.maturity !== undefined && plot.maturity < 100) {
					plot.maturity += 25;

					// If maturity reaches 100%, start accumulating fruits
					if (
						plot.fruitsReady &&
						plot.maturity === 100 &&
						plot.fruitRemaining &&
						plot.fruitRemaining > 0
					) {
						plot.fruitsReady += 1;
					}
				}
			}
			return plot;
		});
	}, 1000 * 6); // Simulates 1 day passing every 24 hours

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

	// Function to determine the type of fruit based on the seed type.
	// This function will extract the fruit type from the seed name.
	function getFruit(tree: string): string | undefined {
		// Check if the string includes specific seed types and return the corresponding fruit.
		if (tree.includes('Heart')) {
			return 'Heart';
		} else if (tree.includes('Star')) {
			return 'Star';
		} else if (tree.includes('Lumpy')) {
			return 'Lumpy';
		} else if (tree.includes('Square')) {
			return 'Square';
		} else if (tree.includes('Round')) {
			return 'Round';
		}
		// Add more conditions here if there are additional seed types.
		return undefined; // Return undefined if no known fruit type is found.
	}

	function getFruitImage(type: string) {
		console.log('type: ', type);
		if (type === 'heart') {
			return 'images/fruit/Heart.png';
		} else if (type === 'star') {
			return 'images/fruit/Star.png';
		} else if (type === 'lumpy') {
			return 'images/fruit/Lumpy.png';
		} else if (type === 'square') {
			return 'images/fruit/Square.png';
		} else if (type === 'round') {
			return 'images/fruit/Round.png';
		}
		// Add more conditions here if there are additional seed types.
		return 'images/items/Bunzempic.png'; // Return undefined if no known fruit type is found.
	}
</script>

<main class="flex flex-col space-y-3" in:fade={{ delay: 100, duration: 250 }}>
	<!-- Farm Grid -->
	<div>
		<h2 class="font-FinkHeavy text-2xl text-center w-40">Farm</h2>
		<div class="grid gap-0 grid-cols-5 grid-rows-5 w-40 h-40 border-black border-2">
			<!-- plots -->
			{#each plots as plot, index}
				<button
					class:star={plot.type === 'star'}
					class:heart={plot.type?.includes('Heart')}
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
							{#if plot.type !== undefined}
								<img src={getFruitImage(plot.type)} alt="" />
							{/if}
						{:else}
							<div>{plot.maturity}</div>
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
				: 'leaf'} flex flex-col space-y-1 w-40 p-2 bg-blue-300 text-center font-FinkHeavy"
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
				<p class="text-xl">Empty Plot</p>
			{:else if plots[selectedPlotIndex].state === 'planted'}
				<p class="capitalize">{plots[selectedPlotIndex].type} Tree</p>
				<p>Tree maturity: {plots[selectedPlotIndex].maturity}%</p>
				<p>{plots[selectedPlotIndex].fruitRemaining} Fruits Remaining</p>
			{/if}
			<!-- ready fruits go here -->
			{#if plots[selectedPlotIndex].state === 'planted'}
				{#if availableSeeds.length > 0}
					<div class=" flex flex-wrap gap-2">
						<div class="p-2 w-full bg-black bg-opacity-30 text-white rounded-lg flex items-center">
							{#each availableSeeds as seed}
								<!-- if the user clicks anywhere besides directly on the seeds then the selected seed should be undefined -->
								<button
									on:click={() => (selectedSeed = seed)}
									class="{selectedSeed === seed
										? '-translate-y-2 scale-150 hover:scale-150'
										: ''} hover:scale-150"
								>
									<img src={seed.imgPath} alt="heart" class="h-6 w-6 inline-block mr-2" />
								</button>
							{/each}
						</div>
					</div>
					<p class="text-center">{selectedSeed?.name ?? ''}</p>
				{:else}
					<p class="text-xs">no seeds. get some seeds from the shop.</p>
				{/if}
			{/if}
			<!-- available seeds go here -->
			{#if plots[selectedPlotIndex].state === 'empty'}
				{#if availableSeeds.length > 0}
					<div class=" flex flex-wrap gap-2">
						<div class="p-2 w-full bg-black bg-opacity-30 text-white rounded-lg flex items-center">
							{#each availableSeeds as seed}
								<!-- if the user clicks anywhere besides directly on the seeds then the selected seed should be undefined -->
								<button
									on:click={() => (selectedSeed = seed)}
									class="{selectedSeed === seed
										? '-translate-y-2 scale-150 hover:scale-150'
										: ''} hover:scale-150"
								>
									<img src={seed.imgPath} alt="heart" class="h-6 w-6 inline-block mr-2" />
								</button>
							{/each}
						</div>
					</div>
					<p class="text-center">{selectedSeed?.name ?? ''}</p>
				{:else}
					<p class="text-xs">no seeds. get some seeds from the shop.</p>
				{/if}
			{/if}
			<!-- plant seed -->
			<button
				disabled={selectedSeed === undefined}
				on:click={() => plantSeed(selectedSeed?.fruitType ?? 'fake seed')}
				class="disabled:bg-opacity-10 bg-white bg-opacity-50 w-3/4 m-auto rounded-full border-black border-[1px] text-green-700"
			>
				plant seed
			</button>
		</div>
	{/if}
</main>

<style>
	/* Correct the heart class to have a gradient from pink to red */
	.heart {
		background: linear-gradient(to bottom, pink, red);
	}

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

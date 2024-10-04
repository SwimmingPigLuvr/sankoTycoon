<script lang="ts">
	import { wallet, type Bun, type Item, type Plot } from '$lib/stores/wallet';
	import { get } from 'svelte/store';
	import Wallet from './Wallet.svelte';
	import { fruitData, itemData, seedData } from '$lib/itemData';

	export let bun: Bun;

	let selectedSeed: Item | undefined;

	$: bunWallet = bun.wallet;
	$: availableSeeds = bunWallet.items.filter((item) => item.type === 'seed');

	let selectedPlotIndex: number | null = null;
	let plots: Plot[] = Array(25).fill({ state: 'empty' });

	let plotTimers: Array<NodeJS.Timeout | null> = Array(25).fill(null);

	//function to select plot
	function selectPlot(index: number) {
		if (plots[index].state === 'empty') {
			selectedPlotIndex = index;
		} else {
			selectedPlotIndex = null;
		}
	}

	// Function to plant a seed in the selected plot
	function plantSeed(fruitType: string) {
		if (selectedPlotIndex !== null) {
			const seed = bunWallet.items.find((item) => item.fruitType === fruitType);
			if (seed && seed.quantity > 0) {
				seed.quantity = 1;
				plots[selectedPlotIndex] = {
					state: 'planted',
					type: fruitType,
					maturity: 0,
					fruitRemaining: 5,
					plantedAt: Date.now()
				};
				selectedSeed = undefined;
				startPlotGrowthTimer(selectedPlotIndex);
			} else {
				alert('not enough seeds to plant');
			}
		}
	}

	function startPlotGrowthTimer(plotIndex: number) {
		
	}

	function pickFruit(index: number) {
		const plot = plots[index];
		if (plot.fruitsReady && plot.fruitsReady > 0) {
			plot.fruitsReady -= 1;
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

<!-- Farm Grid -->
<div class="grid gap-0 grid-cols-5 grid-rows-5 w-40 h-40 border-black border-2">
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
		{:else}
			<p>{plots[selectedPlotIndex].type}</p>
			<p>{plots[selectedPlotIndex].maturity}</p>
			<p>{plots[selectedPlotIndex].fruitRemaining}</p>
		{/if}
		<!-- ready fruits go here -->
		{#if plots[selectedPlotIndex].state === 'planted'}
			<p>ready fruits go here.</p>
			<p>once the ui is set for teh available seeds this div will be based on that one</p>
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
			{:else}
				<p class="text-xs">no seeds. get some seeds from the shop.</p>
			{/if}
		{/if}
		<button
			disabled={selectedSeed === undefined}
			on:click={() => plantSeed(selectedSeed?.fruitType ?? 'fake seed')}
			class="disabled:bg-opacity-10 bg-white bg-opacity-50 w-3/4 m-auto rounded-full border-black border-[1px] text-green-700"
		>
			plant seed
		</button>
	</div>
{/if}

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

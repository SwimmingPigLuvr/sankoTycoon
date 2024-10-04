<script lang="ts">
	import { wallet, type Bun, type Plot } from '$lib/stores/wallet';
	import { get } from 'svelte/store';
	import Wallet from './Wallet.svelte';
	import { fruitData, itemData, seedData } from '$lib/itemData';

	export let bun: Bun;

	$: bunWallet = bun.wallet;
	$: availableSeeds = bunWallet.items.filter((item) => item.type === 'seed');

	let selectedPlotIndex: number | null = null;
	let plots: Plot[] = Array(25).fill({ state: 'empty' });

	//function to select plot
	function selectPlot(index: number) {
		if (plots[index].state === 'empty') {
			selectedPlotIndex = index;
		} else {
			selectedPlotIndex = null;
		}
	}

	// Function to plant a seed in the selected plot
	function plantSeed(seedType: string) {
		if (selectedPlotIndex !== null) {
			const seed = bunWallet.items.find((item) => item.name === seedType);
			if (seed && seed.quantity > 0) {
				seed.quantity = 1;
				plots[selectedPlotIndex] = {
					state: 'planted',
					type: seedType,
					maturity: 0,
					fruitRemaining: 5,
					plantedAt: Date.now()
				};
			} else {
				alert('not enough seeds to plant');
			}
		}
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
</script>

<!-- Farm Grid -->
<div class="grid gap-0 grid-cols-5 grid-rows-5 w-40 h-40 border-black border-2">
	{#each plots as plot, index (24 - index)}
		<button
			class:planted={plot.state === 'planted'}
			class="{selectedPlotIndex === index
				? 'bg-lime-400'
				: ''} hover:bg-lime-400 border border-black"
			on:click={() => selectPlot(index)}
		>
			{#if plot && plot.type && plot.state === 'planted'}
				<img src={plot.type} alt={plot.type} />
			{/if}
		</button>
	{/each}
</div>

<!-- show info for the currently selected plot -->
{#if selectedPlotIndex !== null}
	<div class="w-40 p-2 bg-blue-300 text-center font-FinkHeavy">
		<p>Plot #{selectedPlotIndex}</p>
		{#if plots[selectedPlotIndex].state === 'empty'}
			<p>Empty Plot</p>
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
				<div class="flex flex-wrap gap-2">
					{#each availableSeeds as seed}
						<button
							on:click={() => plantSeed(seed.name)}
							class="p-2 bg-green-600 text-white rounded-lg flex items-center"
						>
							<img src={seed.imgPath} alt={seed.name} class="h-6 w-6 inline-block mr-2" />
							{seed.name}
							{seed.quantity}
						</button>
					{/each}
				</div>
			{:else}
				<p class="text-xs">no seeds. get some seeds from the shop.</p>
			{/if}
		{/if}
		<div>
			{#each availableSeeds as seed}
				<img src={seed.imgPath} alt={seed.name} />
			{/each}
		</div>
		<button on:click={() => plantSeed} class="bg-green-600 text-white rounded-lg">
			plant seed
		</button>
	</div>
{/if}

<style>
	.planted {
		background-color: #228b22;
	}
</style>

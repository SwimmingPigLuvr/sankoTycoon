<script lang="ts">
	import { wallet, type Bun } from '$lib/stores/wallet';
	import { get } from 'svelte/store';
	import Wallet from './Wallet.svelte';
	import { fruitData, itemData, seedData } from '$lib/itemData';

	export let bun: Bun;
	let availableSeeds = get(wallet).nfts.find((nft: Bun) => nft.id === bun.id)?.wallet.seeds;

	$: availableSeeds = get(wallet).nfts.find((nft: Bun) => nft.id === bun.id)?.wallet.seeds;

	let selectedPlotIndex: number | null = null;
	let plots: { state: 'empty' | 'planted'; type?: string }[] = Array(25).fill({ state: 'empty' });

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
			const availableSeeds = get(wallet).nfts.find((nft) => nft.id === bun.id)?.wallet.seeds;

			if (availableSeeds && availableSeeds[seedType] && availableSeeds[seedType] > 0) {
				// Reduce the seed count
				wallet.update((currentWallet) => {
					const bunIndex = currentWallet.nfts.findIndex((nft) => nft.id === bun.id);
					if (bunIndex !== -1) {
						currentWallet.nfts[bunIndex].wallet.seeds[seedType] -= 1;
					}
					return currentWallet;
				});

				// Update the plot state
				plots[selectedPlotIndex] = { state: 'planted', type: seedType };
			} else {
				alert('You do not have enough seeds to plant!');
			}
		}
	}

	// todo. let users pick a plot.
	// if the user has seeds then they will be prompted to plant them their
	// impl a planting function
	// planting takes the seed and plants a tree in the plot
	// todo. farm needs to be rotated. let me clarify:
	// plot 1 is the bottom right grid
	// plot 5 is the top right grid
	// plot 21 is the bottom left grid
	// plot 25 is the top left

	// right now the plant seed function only deals with the round seeds
	// but we need to only consider the types that exist in the wallet
	// could be any of the five types or none
	// if seeds, the div that says plant seeds in plot should say
	// empty plot, then have the available seeds images from left to right
	// then a button below that says plant seeds
	// if no seeds, should just be empty
</script>

<div class="grid gap-0 grid-cols-5 grid-rows-5 w-40 h-40 border-black border-2">
	{#each plots as plot, index (24 - index)}
		<button
			class:planted={plot.state === 'planted'}
			class="{selectedPlotIndex === index
				? 'bg-lime-400'
				: ''} hover:bg-lime-400 border border-black"
			on:click={() => selectPlot(index)}
		>
			{#if plot.state === 'planted' && plot.type}
				<img src={seedData[plot.type].imgPath} alt={plot.type} />
			{/if}
		</button>
	{/each}
</div>

<!-- show info for the currently selected plot -->
{#if selectedPlotIndex !== null}
	<div class="w-40 p-2 bg-blue-300"></div>
	<p>Plot #{selectedPlotIndex}</p>
	<p>Empty Plot</p>
	<!-- available seeds go here -->
	<div>
		{#each availableSeeds as seed}
			<img src={seed.imgPath} alt={seed.name} />
		{/each}
	</div>
	<button on:click={() => plantSeed} class="bg-green-600 text-white rounded-lg">
		plant seed
	</button>
{/if}

<style>
	.planted {
		background-color: #228b22;
	}
</style>

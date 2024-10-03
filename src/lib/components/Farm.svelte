<script lang="ts">
	import { wallet, type Bun } from '$lib/stores/wallet';
	import { get } from 'svelte/store';
	import Wallet from './Wallet.svelte';

	export let bun: Bun;

	let selectedPlotIndex: number | null = null;
	let plots: ('empty' | 'planted')[] = Array(25).fill('empty');

	//function to select plot
	function selectPlot(index: number) {
		if (plots[index] === 'empty') {
			selectedPlotIndex = index;
		} else {
			selectedPlotIndex = null;
		}
	}

	// Function to plant a seed in the selected plot
	function plantSeed() {
		if (selectedPlotIndex !== null) {
			const availableSeeds = get(wallet).nfts.find((nft) => nft.id === bun.id)?.wallet.seeds;

			if (availableSeeds && availableSeeds.round > 0) {
				// Reduce the seed count
				wallet.update((currentWallet) => {
					const bunIndex = currentWallet.nfts.findIndex((nft) => nft.id === bun.id);
					if (bunIndex !== -1) {
						currentWallet.nfts[bunIndex].wallet.seeds.round -= 1;
					}
					return currentWallet;
				});

				// Update the plot state
				plots[selectedPlotIndex] = 'planted';
				selectedPlotIndex = null; // Deselect plot after planting
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
	{#each plots as plot, index}
		<button
			class:planted={plot === 'planted'}
			class="{selectedPlotIndex === index
				? 'bg-lime-400'
				: ''} hover:bg-lime-400 border border-black"
			on:click={() => selectPlot(index)}
		>
			{#if plot === 'planted'}
				<img src="/images/seeds/HeartSeed.png" alt="" />
			{/if}
		</button>
	{/each}
</div>

{#if selectedPlotIndex !== null}
	<button on:click={plantSeed} class="w-40 p-2 bg-green-600 text-white rounded-lg">
		Plant Seed in Plot {selectedPlotIndex + 1}
	</button>
{/if}

<style>
	.planted {
		background-color: #228b22;
	}
</style>

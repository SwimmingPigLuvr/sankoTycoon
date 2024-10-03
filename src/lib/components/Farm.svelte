<script lang="ts">
	import { wallet, type Bun } from '$lib/stores/wallet';
	import Wallet from './Wallet.svelte';

	export let bun: Bun;

	let selectedPlotIndex: number | null = null;
	let plots: ('empty' | 'planted')[] = Array(25).fill('empty');

	//function to select plot
	function selectPlot(index: number) {
		if (plots[index] === 'empty') {
			selectedPlotIndex = index;
		}
	}

	// todo. let users pick a plot.
	// if the user has seeds then they will be prompted to plant them their
	// impl a planting function
	// planting takes the seed and plants a tree in the plot
</script>

<div class="grid gap-0 grid-cols-5 grid-rows-5 w-40 h-40 border-black border-2">
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
	<div class="border hover:bg-lime-400 border-black"></div>
</div>

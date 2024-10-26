<script lang="ts">
	import {
		autoFeeder,
		autoHarvest,
		autoSeller,
		totalFruitsSold,
		totalFruitsEaten,
		totalTreesPlanted,
		totalFruitHarvested,
		click2plant
	} from '$lib/stores/abilities';
	import { backOut, cubicInOut } from 'svelte/easing';
	import { fly, scale } from 'svelte/transition';
</script>

<main in:scale={{ duration: 1000, easing: cubicInOut }} class="p-2 w-40 relative">
	<h1 class="text-xl font-serif italic -tracking-widest">Dashboard</h1>
	<img
		src="images/items/wearables/glasses/FunkyGlasses.png"
		class="absolute -top-3 right-1 w-14"
		alt=""
	/>
	<div class="font-mono text-xs w-40">
		{#if $autoSeller.purchased}
			<p class="flex justify-between">
				<span>sell rate</span> <span>{$autoSeller.rate / 1}fruit/s</span>
			</p>
		{/if}
		<p class="flex justify-between"><span>trees planted</span> <span>{$totalTreesPlanted}</span></p>
		<p class="flex justify-between">
			<span>fruit sold</span> <span>{$totalFruitsSold}</span>
		</p>
		<p class="flex justify-between">
			<span>fruit eaten</span> <span>{$totalFruitsEaten}</span>
		</p>
		<p class="flex justify-between">
			<span>fruit harvested</span> <span>{$totalFruitHarvested}</span>
		</p>
	</div>
</main>

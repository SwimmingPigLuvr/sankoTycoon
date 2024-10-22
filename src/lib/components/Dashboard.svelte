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
</script>

<main class="p-2 w-40">
	<h1 class="text-xl font-serif italic -tracking-widest">Dashboard</h1>
	<div class="font-mono text-xs w-full">
		<p class="flex justify-between">
			<span>sell rate</span> <span>{$autoSeller.rate / 1000}s</span>
		</p>
		<p class="flex justify-between"><span>trees planted</span> <span>{$totalTreesPlanted}</span></p>
		<p class="flex justify-between">
			<span>fruit sold</span> <span>{$totalFruitsSold}</span>
		</p>
		<p class="flex justify-between">
			<span>fruit harvested</span> <span>{$totalFruitHarvested}</span>
		</p>
		<p class="flex justify-between">
			<span>fruit eaten</span> <span>{$totalFruitsEaten}</span>
		</p>
	</div>
</main>

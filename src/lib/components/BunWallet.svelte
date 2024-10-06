<script lang="ts">
	import { fruitData, seedData, itemData } from '$lib/itemData';
	import type { Bun } from '$lib/stores/wallet';
	import { cubicInOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';

	export let bun: Bun;
	$: bunWallet = bun.wallet;
	$: bunId = bunWallet.bunId;
	$: gold = bunWallet.gold;
	$: items = bunWallet.items;
	$: fruit = items.filter((items) => items.type === 'fruit');
	$: seeds = items.filter((items) => items.type === 'seed');
	$: wearables = items.filter((items) => items.type === 'wearable');
	$: consumables = items.filter((items) => items.type === 'consumable');

	// todo
	// fill the grid with the buns items, fruits, and seeds in that order
	// fruits
	// if there are multiple fruits/seeds then we just show the fruit img in 1 grid and we have a number in the corner that shows there are multiple
	// if there are no fruits of a category we can just skip it and it will not populate a grid
	// same logic goes for the seeds
	// there are only a certain number of items that will be added to the game so i have an item caleld Bunzempic and i have an image for it that i want in the grid if the item 'Bunzempic' exists in the items array.
	// the image is located at '/images/items/Bunzempic.png'
	// also for fruits and seeds the fruits are at
	// images/fruit/Heart.png, and so on for Star, Lumpy, Round, Square
	// seeds are at images/seeds/HeartSeed.png, StarSeed ... and so on.
</script>

<main
	in:fly={{ duration: 1000, x: -10, easing: cubicInOut }}
	class="w-full flex flex-col border-black border-2"
>
	<!-- gold balance -->
	<p class="text-xs">{gold} GOLD</p>
	<!-- items, fruits, seeds -->
	<div class="grid gap-0 grid-cols-6 grid-rows-2 w-full h-14 border-2">
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
</main>

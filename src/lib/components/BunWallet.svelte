<script lang="ts">
	import * as itemData from '$lib/itemData';
	import type { Bun } from '$lib/stores/wallet';
	import { cubicInOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';

	export let bun: Bun;
	$: bunWallet = bun.wallet;
	$: bunId = bunWallet.bunId;
	$: gold = bunWallet.gold;
	// filter items where there are at least 1
	$: items = bunWallet.items.filter((items) => items.quantity > 0);
	$: fruit = items.filter((items) => items.type === 'fruit');
	$: seeds = items.filter((items) => items.type === 'seed');
	$: witheredSeeds = items.filter((items) => items.type === 'witheredSeed');
	$: wearables = items.filter((items) => items.type === 'wearable');
	$: consumables = items.filter((items) => items.type === 'consumable');

	$: allItems = [...consumables, ...wearables, ...seeds, ...witheredSeeds, ...fruit];

	// todo
	// if the items have a quantity of more than 1 then they still only take up 1 grid but later on i will add
	// an icon showing the quantity
</script>

<main
	in:fly={{ duration: 100, x: -10, easing: cubicInOut }}
	class="w-full bg-yellow-200 p-1 flex flex-col border-gray-400 border-"
>
	<!-- gold balance -->
	<div class="flex space-x-1 p-1">
		<img src="/ui/icons/sankogold.png" class="h-4" alt="" />
		<p class="text-xs">{gold}</p>
	</div>
	<!-- items, fruits, seeds -->
	<div
		class=" border-[1px] bg-gray-100 border-gray-400 overflow-y-auto overflow-x-hidden grid gap-0 grid-cols-4 grid-rows-4 w-full"
	>
		{#each allItems as item}
			<div
				class="relative border-gray-400 border-[1px] hover:bg-gray-200 flex items-center justify-center"
			>
				<img src={item.imgPath} alt={item.name} class="h-6 w-auto" />
				{#if item.quantity > 1}
					<div
						class="absolute w-2 h-2 top-0 right-0 bg-rose-600 rounded-none text-white flex items-center justify-center text-[0.4rem] text-center"
					>
						{item.quantity}
					</div>
				{/if}
			</div>
		{/each}

		{#each Array(16 - allItems.length) as _}
			<div class="border-gray-400 border-[1px] hover:bg-gray-200"></div>
		{/each}
	</div>
</main>

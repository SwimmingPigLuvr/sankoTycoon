<script lang="ts">
	import * as itemData from '$lib/itemData';
	import { bunBlasted } from '$lib/stores/abilities';
	import { addMessage } from '$lib/stores/gameState';
	import { wallet, type Bun, type Item } from '$lib/stores/wallet';
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

	let currentAbility: string | undefined;
	let bunBlastMessage: string | undefined;

	function activateAbility(itemName: string) {
		switch (itemName) {
			case 'Bun Blaster':
				// tell the user how much gold they made
				wallet.update((currentWallet) => {
					const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
					let currentBun;
					if (bunIndex !== -1) {
						currentBun = currentWallet.nfts[bunIndex];
					} else {
						alert('do you wanna torture me');
						return currentWallet;
					}
					const blaster = currentBun.wallet.items.find((item: Item) => item.name === 'Bun Blaster');
					if (blaster) {
						console.log('found the blaster');
						blaster.quantity -= 1;
					}
					return currentWallet;
				});
				let startingGold = bun.wallet.gold;
				bunBlasted.set(true);
				addMessage('Bun Blaster activated.');
				setTimeout(() => {
					bunBlasted.set(false);
					addMessage('Bun Blaster effects have worn off.');
					let endingGold = bun.wallet.gold;
					let goldMade = endingGold - startingGold;
					addMessage(`total gold earned while high: ${goldMade}`);
				}, 10000);
				bunBlastMessage = undefined;
				break;
			default:
				break;
		}
	}

	// todo
	// if the items have a quantity of more than 1 then they still only take up 1 grid but later on i will add
	// an icon showing the quantity
</script>

<main
	in:fly={{ duration: 100, x: -10, easing: cubicInOut }}
	class="w-full bg-yellow-200 p-1 flex flex-col border-gray-400 border-"
>
	{#if bunBlastMessage}
		<p>{bunBlastMessage}</p>
	{/if}
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
			<button
				on:mouseenter={() => (currentAbility = item.ability)}
				on:mouseleave={() => (currentAbility = undefined)}
				on:click={() => activateAbility(item.name)}
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
			</button>
		{/each}

		{#each Array(16 - allItems.length) as _}
			<div class="border-gray-400 border-[1px] hover:bg-gray-200"></div>
		{/each}
	</div>
	{#if currentAbility}
		<div class="w-full">
			<p class="text-left text-xs w-full">{currentAbility}</p>
		</div>
	{/if}
</main>

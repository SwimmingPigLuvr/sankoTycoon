<script lang="ts">
	import { bunzempic, heartFruit, squareSeed } from '$lib/itemData';
	import { wallet, type Bun, type Item } from '$lib/stores/wallet';

	// add more items
	// cycle through seeds
	// prompt user to feed buns
	// create array of rotating shop inventory?
	// rotate on long interval? 2 weeks
	// also trigger shop updates on user's progress
	let buy = true;
	let sell = false;
	// add buy/sell prices for all items
	let dailyItems: Item[] = [bunzempic, heartFruit, squareSeed];

	$: nfts = $wallet?.nfts ?? [];
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
</script>

<main class="rounded-xl p-2 border-sky-400 border-2 bg-sky-600 w-80 flex flex-col space-y-1">
	<!-- buy/sell buttons -->
	<div class="flex space-x-1">
		<div
			class="border-yellow-500 border-2 rounded overflow-hidden bg-yellow-100 text-yellow-500 font-sans font-bold px-1"
		>
			Daily Items
		</div>
		<div
			class="font-FinkHeavy rounded border-yellow-500 border-2 w-20 text-yellow-700 flex overflow-hidden"
		>
			<button
				on:click={() => {
					buy = true;
					sell = false;
				}}
				class="{buy ? 'bg-yellow-300' : 'bg-yellow-100'} w-1/2">Buy</button
			>
			<button
				on:click={() => {
					sell = true;
					buy = false;
				}}
				class="{sell ? 'bg-yellow-300' : 'bg-yellow-100'} w-1/2">Sell</button
			>
		</div>
	</div>
	<!-- items -->
	<div class="flex space-x-1 overflow-x-auto overflow-y-hidden">
		{#if buy}
			{#each dailyItems as item}
				<button
					class="relative font-FinkHeavy w-20 h-24 text-xs rounded border-white border-[1px] bg-white bg-opacity-75 hover:bg-opacity-90 flex flex-col justify-evenly overflow-hidden items-center"
				>
					<!-- item img -->
					<img class="h-14 absolute top-1 left-1" src={item.imgPath} alt={item.name} />
					<!-- item name -->
					<div
						class="flex items-center text-center h-8 w-full absolute bottom-0 left-0 bg-lime-500 text-black"
					>
						<p class="w-full m-auto">
							{item.name}
						</p>
					</div>
				</button>
			{/each}
		{/if}
		{#if sell}
			{#each allItems as item}
				<button
					class="relative font-FinkHeavy w-20 h-24 text-xs rounded border-white border-[1px] bg-white bg-opacity-75 hover:bg-opacity-90 flex flex-col justify-evenly overflow-hidden items-center"
				>
					<!-- item img -->
					<img class="h-14 absolute top-1 left-1" src={item.imgPath} alt={item.name} />
					<!-- item name -->
					<div
						class="flex items-center text-center h-8 w-full absolute bottom-0 left-0 bg-lime-500 text-black"
					>
						<p class="w-full m-auto">
							{item.name}
						</p>
					</div>
				</button>
			{/each}
		{/if}
	</div>
</main>

<style>
	.sanko-bg {
		background-image: url('/ui/textures/water1.png');
		background-size: 40%;
		background-repeat: repeat;
	}
</style>

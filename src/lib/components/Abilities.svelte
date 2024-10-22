<script lang="ts">
	import {
		autoFeeder,
		autoHarvest,
		autoSeller,
		click2plant,
		type Click2plant,
		totalFruitHarvested,
		totalFruitsEaten,
		totalFruitsSold,
		totalTreesPlanted
	} from '$lib/stores/abilities';
	import { addMessage, b } from '$lib/stores/gameState';
	import { wallet, type Token } from '$lib/stores/wallet';
	import { get } from 'svelte/store';

	// Function to toggle the autoFeederOn store
	function toggleAutoFeeder() {
		autoFeeder.update((feeder) => {
			feeder.enabled = !feeder.enabled;
			return feeder;
		});
	}

	// Function to toggle the autoSeller enabled
	function toggleAutoSeller() {
		autoSeller.update((autoSeller) => {
			autoSeller.enabled = !autoSeller.enabled;
			return autoSeller;
		});
	}

	// Function to toggle the click2plant store
	function toggleC2P() {
		click2plant.update((c2p) => {
			c2p.enabled = !c2p.enabled;
			return c2p;
		});
	}

	// Function to toggle the autoharvest store
	function toggleAutoHarvest() {
		autoHarvest.update((ah) => {
			ah.enabled = !ah.enabled;
			return ah;
		});
	}

	function buyAutoFeeder() {
		// not sure how much gold this should cost
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= 10) {
				goldToken.balance -= 10;

				// set stores
				autoFeeder.update((feeder) => {
					feeder.purchased = true;
					feeder.enabled = true;
					return feeder;
				});
			}

			addMessage(`bought AUTOFEEDER™️ for 20 GOLD`);
			const audio = new Audio('sounds/purchase.mp3');
			audio.play();
			return wallet;
		});
	}

	$: autoSellerPrice = ($autoSeller.level + 1) * 3;

	function buyAutoSeller() {
		// not sure how much gold this should cost
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= autoSellerPrice) {
				goldToken.balance -= autoSellerPrice;

				// set stores
				autoSeller.update((seller) => {
					seller.purchased = true;
					seller.enabled = true;
					// increase level
					seller.level += 1;
					// double selling frequency
					seller.rate /= 2;
					return seller;
				});
			}

			addMessage(`bought AUTOSELLER™️ for ${autoSellerPrice} GOLD`);
			const audio = new Audio('sounds/purchase.mp3');
			audio.play();
			return wallet;
		});
	}

	$: c2pPrice = ($click2plant.level + 1) * 2;
	function buyClick2Plant() {
		// subtract 20 GOLD from wallet
		// set price based on level
		// Calculate price based on the level
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= c2pPrice) {
				goldToken.balance -= c2pPrice;

				// set click to plant stores to true
				click2plant.update((c2p) => {
					c2p.purchased = true;
					c2p.enabled = true;
					c2p.level += 1;
					return c2p;
				});
			} else {
				addMessage('not enough GOLD');
			}

			addMessage(`enabled click2plant™️  level ${$click2plant.level}`);
			const audio = new Audio('sounds/purchase.mp3');
			audio.play();
			return wallet;
		});
	}

	$: autoHarvestPrice = ($autoHarvest.level + 1) * 5;
	function buyAutoHarvest() {
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= autoHarvestPrice) {
				goldToken.balance -= autoHarvestPrice;
				autoHarvest.update((ah) => {
					ah.purchased = true;
					ah.enabled = true;
					ah.level += 1;
					return ah;
				});
			}
			addMessage(`enabled autoHARVEST™️  level ${$autoHarvest.level}`);
			const audio = new Audio('sounds/purchase.mp3');
			audio.play();
			return wallet;
		});
	}

	// wallet balance
	$: gold = $wallet.tokens.find((token: Token) => token.name === 'GOLD');
	$: goldBalance = gold?.balance ?? 0;
</script>

<main class="flex flex-col space-y-1 w-40 h-80 overflow-y-auto overflow-x-hidden">
	<!-- auto feeder -->
	{#if $totalFruitsEaten >= 0}
		{#if !$autoFeeder.purchased}
			<button
				disabled={goldBalance < 10}
				on:click={() => buyAutoFeeder()}
				class="disabled:bg-gray-400 bg-sky-400 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">autoFeeder</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">10</p>
					</div>
				</div>
				<p class="text-left">Feeds your Bun so you can worry about more important things.</p>
			</button>
		{/if}
		{#if $autoFeeder.purchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>Auto Feeder</p>
				<!-- Button to toggle the autoFeederOn store value -->
				<button
					class="{$autoFeeder.enabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleAutoFeeder}
				>
					{#if $autoFeeder.enabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
	{/if}
	<!-- auto Seller -->
	{#if $totalFruitsSold >= 0}
		{#if !$autoSeller.purchased}
			<button
				disabled={goldBalance < autoSellerPrice}
				on:click={() => buyAutoSeller()}
				class="disabled:bg-gray-400 bg-sky-400 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">autoSeller</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{autoSellerPrice}</p>
					</div>
				</div>
				<p class="text-left">Sells fruit for you</p>
			</button>
		{/if}
		{#if $autoSeller.purchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>Auto Seller</p>
				<button
					class="{$autoSeller.enabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleAutoSeller}
				>
					{#if $autoSeller.enabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
		{#if $autoSeller.level >= 1}
			<button
				disabled={goldBalance < autoSellerPrice}
				on:click={() => buyAutoSeller()}
				class="-translate-y-3 disabled:bg-gray-400 bg-sky-300 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">level {$autoSeller.level + 1}</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{autoSellerPrice}</p>
					</div>
				</div>
				<p class="text-left">increase auto sell rate</p>
			</button>
		{/if}
	{/if}

	<!-- one click planting -->
	<!-- shows up once user plants 10 trees -->
	{#if $totalTreesPlanted >= 0}
		<!-- if not purchased yet -->
		{#if !$click2plant.purchased}
			<button
				disabled={goldBalance < c2pPrice}
				on:click={() => buyClick2Plant()}
				class="disabled:bg-gray-400 bg-sky-400 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">click2plant</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{c2pPrice}</p>
					</div>
				</div>
				<p class="text-left">Plants seeds with one less click</p>
			</button>
		{/if}
		{#if $click2plant.purchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>click2plant</p>
				<!-- Button to toggle the autoFeederOn store value -->
				<button
					class="{$click2plant.enabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleC2P}
				>
					{#if $click2plant.enabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
		{#if $click2plant.level === 1}
			<button
				disabled={goldBalance < c2pPrice}
				on:click={() => buyClick2Plant()}
				class="-translate-y-3 disabled:bg-gray-400 bg-sky-300 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">level 2</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{c2pPrice}</p>
					</div>
				</div>
				<p class="text-left">Plants seeds with one less click</p>
			</button>
		{/if}
	{/if}

	<!-- auto harvest -->
	{#if $totalFruitHarvested >= 0}
		<!-- if not purchased yet -->
		{#if !$autoHarvest.purchased}
			<button
				disabled={goldBalance < autoHarvestPrice}
				on:click={() => buyAutoHarvest()}
				class="disabled:bg-gray-400 bg-sky-400 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">autoHARVEST™️</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{autoHarvestPrice}</p>
					</div>
				</div>
				<p class="text-left">select plot to harvest fruit</p>
			</button>
		{/if}
		{#if $autoHarvest.purchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>autoHARVEST™️</p>
				<!-- Button to toggle the autoFeederOn store value -->
				<button
					class="{$autoHarvest.enabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleAutoHarvest}
				>
					{#if $autoHarvest.enabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
		{#if $autoHarvest.level === 1}
			<button
				disabled={goldBalance < autoHarvestPrice}
				on:click={() => buyAutoHarvest()}
				class="-translate-y-3 disabled:bg-gray-400 bg-sky-300 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">level 2</p>
					<p class="text-amber-300">{autoHarvestPrice} GOLD</p>
				</div>
				<p class="text-left">harvest fruit automatically</p>
			</button>
		{/if}
	{/if}
</main>

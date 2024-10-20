<script lang="ts">
	import {
		autoFeederOn,
		autoFeederPurchased,
		autoSellerOn,
		autoSellerPurchased,
		click2plantEnabled,
		click2plantPurchased,
		totalFruitsEaten,
		totalFruitsSold,
		totalTreesPlanted,
	} from '$lib/stores/abilities';
	import { addMessage, b } from '$lib/stores/gameState';
	import { wallet, type Token } from '$lib/stores/wallet';
	import { get } from 'svelte/store';

	// Function to toggle the autoFeederOn store
	function toggleAutoFeeder() {
		autoFeederOn.update((value) => !value);
	}

	// Function to toggle the autoSellerOn store
	function toggleAutoSeller() {
		autoSellerOn.update((value) => !value);
	}

	// Function to toggle the autoFeederOn store
	function toggleOneClick() {
		click2plantEnabled.update((value) => !value);
	}

	function buyClick2Plant() {
		// subtract 20 GOLD from wallet
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= 20) {
				goldToken.balance -= 20;

				// set click to plant stores to true
				click2plantPurchased.set(true);
				click2plantEnabled.set(true);
			} else {
				addMessage('not enough GOLD');
			}

			return wallet;
		});
		addMessage(`${$wallet.nfts[$b].name} bought 1 click planting for 20 GOLD`);
	}

	// wallet balance
	$: gold = $wallet.tokens.find((token: Token) => token.name === 'GOLD');
	$: goldBalance = gold?.balance ?? 0;
</script>

<main class="flex flex-col space-y-2 w-40">
	<!-- auto feeder -->
	{#if $totalFruitsEaten >= 10}
		<div class="text-xs border-2 border-black p-2 flex justify-between relative">
			<p>Auto Feeder</p>
			<!-- Button to toggle the autoFeederOn store value -->
			<button
				class="{$autoFeederOn ? 'bg-lime-400' : 'bg-red-400'} h-full w-12 absolute right-0 top-0"
				on:click={toggleAutoFeeder}
			>
				{#if $autoFeederOn}
					On
				{:else}
					Off
				{/if}
			</button>
		</div>
	{/if}
	<!-- auto Seller -->
	{#if $totalFruitsSold >= 50}
		<div class="text-xs border-2 border-black p-2 flex justify-between relative">
			<p>Auto Seller</p>
			<button
				class="{$autoSellerOn ? 'bg-lime-400' : 'bg-red-400'} h-full w-12 absolute right-0 top-0"
				on:click={toggleAutoSeller}
			>
				{#if $autoSellerOn}
					On
				{:else}
					Off
				{/if}
			</button>
		</div>
	{/if}
	<!-- one click planting -->
	<!-- shows up once user plants 10 trees -->
	{#if $totalTreesPlanted >= 10}
		<!-- if not purchased yet -->
		{#if !$click2plantPurchased}
			<button
				disabled={goldBalance < 20}
				on:click={() => buyClick2Plant()}
				class="disabled:bg-gray-400 bg-sky-400 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-around w-full">
					<p class="text-white">click2plant</p>
					<p class="text-amber-300">20 GOLD</p>
				</div>
				<p class="text-left">Plants seeds with one less click</p>
			</button>
		{/if}
		{#if $click2plantPurchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>click2plant</p>
				<!-- Button to toggle the autoFeederOn store value -->
				<button
					class="{$click2plantEnabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleOneClick}
				>
					{#if $click2plantEnabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
	{/if}
</main>

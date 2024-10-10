<!-- lib/components/Wallet.svelte -->
<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { wallet } from '../stores/wallet';
	import type { Token, Bun, Wallet } from '../stores/wallet';
	import { fly } from 'svelte/transition';
	import { activeBun } from '$lib/stores/gameState';
	import BunWallet from '$lib/components/BunWallet.svelte';
	$: network = $wallet?.network;
	let tokens: Token[] = [];
	let nfts: Bun[] = [];
	$: tokens = $wallet?.tokens ?? [];
	$: nfts = $wallet?.nfts ?? [];
	let showBunWallet = false;
	$: b = nfts.findIndex((bun: Bun) => bun.id === $activeBun.id);

	function openWallet() {
		showBunWallet = true;
	}

	// Modify the nextBun and prevBun functions to cycle through the nfts array
	function nextBun() {
		b = (b + 1) % nfts.length; // Increment b and wrap around using modulo
	}

	function prevBun() {
		b = (b - 1 + nfts.length) % nfts.length; // Decrement b and wrap around using modulo to handle negative index
	}
</script>

<main class="space-y-0 tracking-normal text-center w-40 flex flex-col items-center">
	<h1>Wallet</h1>
	<p class="text-xs">{$wallet?.walletAddress}</p>
	<hr class="w-full border-black bg-black" />
	<p class="text-xs">ntwrk: {network}</p>
	{#each tokens as token}
		<p class="text-3xl">{token.balance} {token.name}</p>
	{/each}
	<hr class="w-full border-black bg-black" />
	<h1>Buns</h1>
	<div class="flex flex-wrap">
		<div class="w-full flex flex-col">
			{#if nfts[b]}
				<!-- buns -->
				<div class="flex justify-between">
					<button on:click={() => nextBun()}>
						<img src="/ui/icons/arrow.png" class="w-6" alt="" />
					</button>
					<button on:click={() => prevBun()}>
						<img src="/ui/icons/arrow.png" class="w-6 scale-[-100%]" alt="" />
					</button>
				</div>
				<div class="w-full">
					<button
						in:fly={{ duration: 100, y: 10, easing: cubicInOut }}
						on:click={() => openWallet()}
						class="relative"
					>
						<img class="w- border-2 m-auto" src={nfts[b].imageUrl} alt={nfts[b].name} />
						{#if nfts[b].type === 'Bun'}
							<img
								src="/ui/icons/hunger.png"
								class="absolute top-4 right-4 w-8"
								alt="hungerMeter"
							/>
						{/if}
					</button>
					<p class="text-xs">
						{#if nfts[b].type === 'Egg'}
							{nfts[b].rarity} Egg
						{/if}
					</p>
					{#if nfts[b].type === 'Bun'}
						<p class="text-xs">{nfts[b].name} #{nfts[b].id}</p>
					{/if}
				</div>
				{#if nfts[b].type === 'Bun'}
					<!-- bun wallet -->
					<BunWallet bun={nfts[b]} />
				{/if}
			{/if}
		</div>
	</div>
</main>

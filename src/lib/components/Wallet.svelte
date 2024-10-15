<!-- lib/components/Wallet.svelte -->
<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { wallet } from '../stores/wallet';
	import type { Token, Bun, Wallet } from '../stores/wallet';
	import { fade, fly, scale } from 'svelte/transition';
	import { activeBun, b } from '$lib/stores/gameState';
	import BunWallet from '$lib/components/BunWallet.svelte';
	import Hunger from './Hunger.svelte';
	import HatchEgg from './HatchEgg.svelte';
	$: network = $wallet?.network;
	let tokens: Token[] = [];
	let nfts: Bun[] = [];
	$: tokens = $wallet?.tokens ?? [];
	$: nfts = $wallet?.nfts ?? [];
	let showBunWallet = false;

	function openWallet() {
		showBunWallet = true;
	}

	// Modify the nextBun and prevBun functions to cycle through the nfts array
	function nextBun() {
		b.set(($b + 1) % nfts.length); // Increment b and wrap around using modulo
		console.log(`current bun: ${nfts[$b].name} id #${nfts[$b].id}`);
	}

	function prevBun() {
		b.set(($b - 1 + nfts.length) % nfts.length); // Decrement b and wrap around using modulo to handle negative index
		console.log(`current bun: ${nfts[$b].name} id #${nfts[$b].id}`);
	}
</script>

<main class="space-y-0 bg-red-100 tracking-normal text-center w-40 flex flex-col items-center">
	<div class="">
		<h1>Wallet</h1>
		<p class="text-xs">{$wallet?.walletAddress}</p>
		<hr class="w-full border-black bg-black" />
		<p class="text-xs">ntwrk: {network}</p>
		{#each tokens as token}
			<p class="text-3xl">{token.balance} {token.name}</p>
		{/each}
	</div>
</main>

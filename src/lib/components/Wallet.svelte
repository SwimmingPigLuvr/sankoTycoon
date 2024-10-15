<!-- lib/components/Wallet.svelte -->
<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { wallet } from '../stores/wallet';
	import type { Token, Bun, Wallet } from '../stores/wallet';
	import { fly, scale } from 'svelte/transition';
	import { activeBun, b } from '$lib/stores/gameState';
	import BunWallet from '$lib/components/BunWallet.svelte';
	import Hunger from './Hunger.svelte';
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

<main class="space-y-0 tracking-normal text-center w-40 flex flex-col items-center">
	<div class="absolute top-32 right-4">
		<h1>Wallet</h1>
		<p class="text-xs">{$wallet?.walletAddress}</p>
		<hr class="w-full border-black bg-black" />
		<p class="text-xs">ntwrk: {network}</p>
		{#each tokens as token}
			<p class="text-3xl">{token.balance} {token.name}</p>
		{/each}
	</div>
	<div class="flex flex-wrap">
		<div class="w-full flex flex-col">
			{#if nfts[$b]}
				<h2 class="font-FinkHeavy text-xl text-center w-40">Buns</h2>
				<!-- buns -->
				<!-- active bun -->
				<div class="w-full">
					<button
						in:scale={{ duration: 1000, easing: cubicInOut }}
						on:click={() => openWallet()}
						class="relative"
					>
						<img class="w-full m-auto" src={nfts[$b].imageUrl} alt={nfts[$b].name} />

						<!-- hunger meter -->
						{#if nfts[$b].type === 'Bun'}
							<div class="absolute w-full top-0 h-full">
								<Hunger bun={nfts[$b]} />
							</div>
						{/if}
					</button>
				</div>
				<div class="flex justify-between items-center space-x-1">
					<!-- left arrow -->
					<button on:click={() => nextBun()}>
						<img src="/ui/icons/arrow.png" class="w-8" alt="" />
					</button>
					<!-- bun info -->
					<p class="text-xs">
						{#if nfts[$b].type === 'Egg'}
							{nfts[$b].rarity} Egg
						{/if}
					</p>
					{#if nfts[$b].type === 'Bun'}
						<p class="text-xs">{nfts[$b].name} #{nfts[$b].id}</p>
					{/if}
					<!-- right arrow -->
					<button on:click={() => prevBun()} class="">
						<img src="/ui/icons/arrow.png" class="w-8 scale-[-100%]" alt="" />
					</button>
				</div>
				{#if nfts[$b].type === 'Bun'}
					<!-- bun wallet -->
					<BunWallet bun={nfts[$b]} />
				{/if}
			{/if}
		</div>
	</div>
</main>

<!-- lib/components/Wallet.svelte -->
<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { wallet } from '../stores/wallet';
	import type { Token, Bun, Wallet } from '../stores/wallet';
	import { fade, fly, scale } from 'svelte/transition';
	import { activeBun, b, gameState, sendModalOpen, StepID } from '$lib/stores/gameState';
	import Hunger from './Hunger.svelte';
	import HatchEgg from './HatchEgg.svelte';
	import Bridge from './Bridge.svelte';
	import Abilities from './Abilities.svelte';
	import SendModal from './SendModal.svelte';
	$: network = $wallet?.network;
	let tokens: Token[] = [];
	let nfts: Bun[] = [];
	$: tokens = $wallet?.tokens ?? [];
	$: nfts = $wallet?.nfts ?? [];
	let showBunWallet = false;

	let showOptions: boolean[] = [];

	let currentStep: StepID;
	const unsubscribe = gameState.subscribe((state) => {
		currentStep = state.currentStep;
	});

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
	<h1 class="text-xl">Wallet</h1>
	<div class="w-full">
		<p class="text-xs">{$wallet?.walletAddress}</p>
		<hr class="w-full border-black bg-black" />
		<p class="text-xs">ntwrk: {network}</p>
		{#each tokens as token, index}
			<button
				on:mouseenter={() => (showOptions[index] = true)}
				on:mouseleave={() => (showOptions[index] = false)}
				class="text-3xl w-full h-10"
			>
				{#if showOptions[index]}
					<div
						class=" rounded-xl w-full h-10 border-blue-700 border-2 text-xl flex justify-center space-x-4 items-center"
					>
						<!-- send -->
						<button on:click={() => sendModalOpen.set(true)} class="hover:text-rose-500"
							>send</button
						>
						<!-- swap -->
						<button class="hover:text-rose-500">swap</button>
					</div>
				{:else}
					{token.balance} {token.name}
				{/if}
			</button>
		{/each}
	</div>
	{#if currentStep === StepID.Bridge}
		<Bridge />
	{/if}
</main>


<div>
	<Abilities />
</div>

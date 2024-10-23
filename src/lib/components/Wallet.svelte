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

	// if the last decimal is 0 do not include it.
	// eg 10.00 => 10
	function normalizeBalance(balance: number): string {
		// Define the thresholds for k (thousands), m (millions), and b (billions)
		const thousand = 1000;
		const million = 1000000;
		const billion = 1000000000;

		// Function to remove trailing zeros and decimal point if not needed
		function format(number: number): string {
			return number
				.toString()
				.replace(/\.0+$/, '')
				.replace(/(\.\d*[1-9])0+$/, '$1');
		}

		// Check if the balance is in the billions
		if (balance >= billion) {
			// Divide by a billion and format
			return format(balance / billion) + 'B';
		}
		// Check if the balance is in the millions
		else if (balance >= million) {
			// Divide by a million and format
			return format(balance / million) + 'M';
		}
		// Check if the balance is in the thousands
		else if (balance >= thousand) {
			// Divide by a thousand and format
			return format(balance / thousand) + 'K';
		}
		// If balance is less than a thousand, return as it is
		else {
			return format(balance);
		}
	}
</script>

<main class="space-y-0 px-1 tracking-normal text-center w-40 flex flex-col items-center">
	<h1 class="text-xl">Wallet</h1>
	<div class="w-full">
		<p class="text-xs">{$wallet?.walletAddress}</p>
		<hr class="w-full border-black bg-black" />
		<p class="text-xs">ntwrk: {network}</p>
		<div class="flex flex-col space-y-0">
			{#each tokens as token, index}
				{#if token.balance > 0}
					<button
						on:mouseenter={() => (showOptions[index] = true)}
						on:mouseleave={() => (showOptions[index] = false)}
						class="w-full h-10 relative"
					>
						{#if showOptions[index]}
							<div
								class="absolute top-0 left-0 w-full bg-white h-full border-blue-700 border-4 flex justify-center space-x-4 items-center"
							>
								<!-- send -->
								<button on:click={() => sendModalOpen.set(true)} class="hover:text-rose-500"
									>send</button
								>
								<!-- swap -->
								<button class="hover:text-rose-500">swap</button>
							</div>
						{/if}
						<div class="flex text-2xl font-mono px-0 items-center justify-center space-x-2">
							<p class="">
								{normalizeBalance(token.balance)}
							</p>
							<p>
								{token.name}
							</p>
						</div>
					</button>
				{/if}
			{/each}
		</div>
	</div>
	{#if currentStep === StepID.Bridge}
		<Bridge />
	{/if}
</main>

{#if nfts[$b] && nfts[$b].type === 'Bun'}
	<div>
		<Abilities />
	</div>
{/if}

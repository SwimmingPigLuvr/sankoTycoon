<!-- lib/components/Wallet.svelte -->
<script lang="ts">
	import { backOut, cubicInOut } from 'svelte/easing';
	import { wallet } from '../stores/wallet';
	import type { Token, Bun, Wallet } from '../stores/wallet';
	import { fade, fly, scale, slide } from 'svelte/transition';
	import {
		activeBun,
		eggIndex,
		bunIndex,
		gameState,
		sendModalOpen,
		StepID,
		currentSection,

		swapModalOpen

	} from '$lib/stores/gameState';
	import Hunger from './Hunger.svelte';
	import HatchEgg from './HatchEgg.svelte';
	import Bridge from './Bridge.svelte';
	import Abilities from './Abilities.svelte';
	import SendModal from './SendModal.svelte';
	$: network = $wallet?.network;
	let tokens: Token[] = [];
	let nfts: Bun[] = [];
	$: tokens = $wallet?.tokens ?? [];
	$: buns = $wallet?.nfts.filter((nft: Bun) => nft.type === 'Bun') ?? [];
	$: eggs = $wallet?.nfts.filter((nft: Bun) => nft.type === 'Egg') ?? [];
	let showEggs = true;
	let showBunWallet = false;

	let showOptions: boolean[] = [];

	let currentStep: StepID;
	const unsubscribe = gameState.subscribe((state) => {
		currentStep = state.currentStep;
	});

	function openWallet() {
		showBunWallet = true;
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

	function toggleSection(destination: string) {
		currentSection.set(destination);
	}

	$: if ($currentSection === 'Mint') {
		activeBun.set(undefined);
	}

	$: if (eggs.includes($activeBun)) {
		currentSection.set('Eggs');
	}

	let lastNFTCount = 0;
	let lastNFTUpdate = '';

	$: {
		// Only run checks if NFTs array has actually changed
		if ($wallet && $wallet.nfts) {
			const currentNFTCount = $wallet.nfts.length;
			const currentNFTUpdate = JSON.stringify($wallet.nfts.map((nft) => nft.id));

			if (lastNFTCount !== currentNFTCount || lastNFTUpdate !== currentNFTUpdate) {
				lastNFTCount = currentNFTCount;
				lastNFTUpdate = currentNFTUpdate;

				// Update buns list
				buns = $wallet.nfts.filter((nft: Bun) => nft.type === 'Bun');

				// Run validation checks
				buns.forEach((bun) => {
					if (bun.name !== bun.variety || bun.type !== 'Bun') {
						console.error('bun data validation failed:', {
							bunId: bun.id,
							name: bun.name,
							variety: bun.variety,
							type: bun.type,
							thumbnail: bun.thumbUrl
						});
					}
				});
			}
		}
	}
</script>

<main class="space-y-0 px-0 tracking-normal text-center w-40 flex flex-col items-center">
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
						class="w-full h-6 relative"
					>
						{#if showOptions[index]}
							<div
								class="absolute top-0 w-full left-1/2 -translate-x-1/2 h-full text-xs flex justify-center items-center"
							>
								<!-- send -->
								<button
									on:click={() => sendModalOpen.set(true)}
									class="hover:bg-lime-400 hover:font-black h-full w-1/2">send</button
								>
								<!-- swap -->
								<button
									on:click={() => swapModalOpen.set(true)}
									class="hover:bg-lime-400 hover:font-black h-full w-1/2">swap</button
								>
							</div>
						{:else}
							<div class="flex font-mono px-1 items-center space-x-2 justify-between">
								<p class="">
									{normalizeBalance(token.balance)}
								</p>
								<div class="flex items-center space-x-8">
									{#if !showOptions[index]}
										{token.name}
									{/if}
									<img
										src={token.iconUrl}
										class="ml-1 rounded-full border-black border-[0.5px] h-4 w-4"
										alt=""
									/>
								</div>
							</div>
						{/if}
					</button>
				{/if}
			{/each}
		</div>
	</div>
	{#if currentStep === StepID.Bridge}
		<div class="w-40">
			<Bridge />
		</div>
	{/if}
	{#if $wallet?.nfts.length > 0}
		<!-- buns and eggs -->
		<!-- mini wallet -->
		<div in:fade class="py-2 w-full font-FinkHeavy">
			<!-- eggs -->
			<div class="flex text-xs justify-between w-full px-4">
				<button
					class="px-2 bg-rose-300 text-black text-opacity-50 rounded-t {showEggs
						? 'z-50 border-2 border-gray-200 border-b-0'
						: 'border-2 border-transparent'}"
					on:click={() => toggleSection('Eggs')}>Eggs</button
				>
				<button
					class="px-2 bg-sky-200 text-black text-opacity-50 rounded-t {!showEggs
						? 'border-2 border-gray-200 border-b-0'
						: 'border-2 border-transparent'}"
					on:click={() => toggleSection('Buns')}>Buns</button
				>
			</div>
			{#if $currentSection === 'Eggs' || $currentSection === 'Mint'}
				<div
					class="egs bg-rose-200 relative border-2 rounded max-h-80 border-gray-200 overflow-y-auto overflow-x-hidden grid gap-1 items-center grid-cols-3 grid-rows-3 w-full p-1 px-2"
				>
					{#each eggs as egg, index}
						<button
							on:click={() => {
								eggIndex.set(index);
								activeBun.set(egg);
							}}
							class="{$activeBun === egg
								? 'border-sky-400 border-2'
								: 'border-[1px] border-white'} hover:border-sky-400 relative w-10 h-10 flex items-center justify-center"
						>
							<img src={egg.imageUrl} alt={egg.name} class="w-full h-auto" />
						</button>
					{/each}

					<!-- Calculate the number of empty divs needed to fill the row -->
					{#each Array(Math.max(9 - eggs.length, 0)) as _}
						<div class="border-white border-[1px] hover:bg-gray-200 w-10 h-10"></div>
					{/each}
				</div>
			{/if}
			{#if $currentSection === 'Buns'}
				<!-- bun -->
				<div
					class="bun rounded border-2 bg-sky-100 max-h-60 border-gray-200 overflow-y-auto overflow-x-hidden grid gap-1 grid-cols-3 grid-rows-2 w-full px-2 p-1"
				>
					{#each buns as bun, index}
						<button
							on:click={() => {
								const bunOnlyIndex = buns.findIndex((b) => b.id === bun.id);
								bunIndex.set(bunOnlyIndex);
								activeBun.set(bun);
							}}
							class="{$activeBun === bun
								? 'border-green-500 border-2'
								: 'border-white border-[1px]'} hover:bg-sky-200 h-10 w-10 flex items-center justify-center"
						>
							<img src={bun.thumbUrl} alt={bun.name} class="h-full w-full" />
						</button>
					{/each}

					{#each Array(Math.max(9 - buns.length, 0)) as _}
						<div class="border-white border-[1px] hover:bg-sky-200 w-10 h-10"></div>
					{/each}
				</div>
			{/if}
		</div>
		<button
			class="text-xs bg-emerald-400 p-2 px-4 font-FinkHeavy rounded-lg text-white"
			on:click={() => currentSection.set('Mint')}>Mint more eggs</button
		>
	{/if}
</main>

<style>
	.eggs {
		background-image: url('ui/patterns/checkersankobg3.png');
		background-size: 65px;
	}
	.buns {
		background-image: url('ui/patterns/checkersankobg2.png');
		background-size: 65px;
	}
</style>

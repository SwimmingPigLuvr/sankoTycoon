<!-- routes/+page.svelte -->
<script lang="ts">
	import Bridge from '../lib/components/Bridge.svelte';
	import HeaderTerminal from '../lib/components/HeaderTerminal.svelte';
	import Wallet from '../lib/components/Wallet.svelte';
	import GameClock from '../lib/components/GameClock.svelte';
	import MintEgg from '../lib/components/MintEgg.svelte';
	import { activeBun, gameState, StepID, b } from '../lib/stores/gameState';
	import { onDestroy } from 'svelte';
	import HatchEgg from '$lib/components/HatchEgg.svelte';
	import Farm from '$lib/components/Farm.svelte';
	import { wallet, type Bun } from '$lib/stores/wallet';
	import Shop from '$lib/components/Shop.svelte';
	import { fade, slide } from 'svelte/transition';
	import BunWallet from '$lib/components/BunWallet.svelte';

	let currentStep: StepID;
	const unsubscribe = gameState.subscribe((state) => {
		currentStep = state.currentStep;
	});

	onDestroy(() => {
		unsubscribe;
	});

	$: buns = $wallet?.nfts ?? [];
</script>

<main class="p-2 font-mono">
	<HeaderTerminal />
	<GameClock />
	<div class="flex">
		<!-- bunWallet / farm / wallet -->
		<div class="flex p-2 space-x-3 justify-center transform transition-all duration-1000 ease-in-out">
			{#if buns}
				<div class="w-1/3">
					<BunWallet bun={buns[$b]} />
				</div>
			{/if}
			{#if currentStep === StepID.Mint}
				<MintEgg />
			{:else if currentStep === StepID.Farm}
				<div>
					<Farm bun={$wallet?.nfts[$b]} />
				</div>
			{/if}
			<div class="transform transition-all duration-1000 ease-in-out">
				<Wallet />
			</div>
		</div>
		<div class="">
			{#if buns[$b]}
				<!-- bun wallet -->
				<Shop bun={buns[$b]} />
			{/if}
		</div>
	</div>
	<h1 class="-z-50 w-full text-left absolute bottom-2 left-2">Sanko Tycoon ©</h1>
	<div
		in:slide={{ delay: 1500 }}
		class=" text-white font-amsterdam-display fixed bottom-2 right-2 items-center -translate-y-1 flex-col"
	>
		<a
			target="_blank"
			rel="noopener noreferrer"
			href="https://x.com/SwimmingPigLuvr"
			class="text-xl flex-col text-center text-sky-300 flex p-2 hover:border-blue-700 border-[1px] border-transparent leading-5 rounded-xl"
		>
			<span class="">Swimming</span>
			<span class="font-botch">𓃟🩵r</span>
		</a>
	</div>
</main>

<style>
</style>

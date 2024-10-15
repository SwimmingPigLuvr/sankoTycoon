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
	import { fade } from 'svelte/transition';
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
	<h1 class="-z-50 w-full text-right absolute bottom-2 right-2">Sanko Tycoon ©</h1>
	<div class="flex flex-wrap gap-2">
		<HeaderTerminal />
		<GameClock />
		<!-- bunWallet / farm / wallet -->
		<div class="flex space-x-3 justify-center">
			{#if buns}
				<div class="w-1/3">
					<BunWallet bun={buns[$b]} />
				</div>
			{/if}
			{#if currentStep === StepID.Bridge}
				<Bridge />
			{:else if currentStep === StepID.Mint}
				<MintEgg />
			{:else if currentStep === StepID.Farm}
				<div>
					<Farm bun={$wallet?.nfts[$b]} />
				</div>
			{/if}
			<div>
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
</main>

<style>
</style>

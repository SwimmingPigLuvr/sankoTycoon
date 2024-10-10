<!-- routes/+page.svelte -->
<script lang="ts">
	import Bridge from '../lib/components/Bridge.svelte';
	import HeaderTerminal from '../lib/components/HeaderTerminal.svelte';
	import Wallet from '../lib/components/Wallet.svelte';
	import GameClock from '../lib/components/GameClock.svelte';
	import MintEgg from '../lib/components/MintEgg.svelte';
	import { gameState, StepID } from '../lib/stores/gameState';
	import { onDestroy } from 'svelte';
	import HatchEgg from '$lib/components/HatchEgg.svelte';
	import Farm from '$lib/components/Farm.svelte';
	import { wallet } from '$lib/stores/wallet';
	import Shop from '$lib/components/Shop.svelte';

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
	<div class="flex flex-col space-y-2">
		<HeaderTerminal />
		<GameClock />
		<Wallet />
		{#if currentStep === StepID.Bridge}
			<Bridge />
		{:else if currentStep === StepID.Mint}
			<MintEgg />
		{:else if currentStep === StepID.Hatch}
			<HatchEgg />
		{:else if currentStep === StepID.Farm}
			<Farm bun={$wallet.nfts[0]} />
		{/if}
		<div class="absolute bottom-[4.55rem] left-48">
			{#each buns as bun}
				<Shop {bun} />
			{/each}
		</div>
	</div>
</main>

<style>
</style>

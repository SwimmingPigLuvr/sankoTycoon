<!-- routes/+page.svelte -->
<script lang="ts">
	import Bridge from '../lib/components/Bridge.svelte';
	import HeaderTerminal from '../lib/components/HeaderTerminal.svelte';
	import Wallet from '../lib/components/Wallet.svelte';
	import GameClock from '../lib/components/GameClock.svelte';
	import MintEgg from '../lib/components/MintEgg.svelte';
	import { gameState, StepID } from '../lib/stores/gameState';
	import { onDestroy } from 'svelte';

	let currentStep: StepID;
	const unsubscribe = gameState.subscribe((state) => {
		currentStep = state.currentStep;
	});

	onDestroy(() => {
		unsubscribe;
	});
</script>

<main class="p-2 font-mono -tracking-widest">
	<h1 class="w-full text-right fixed bottom-2 right-2">Sanko Tycoon ©</h1>
	<div class="flex flex-col space-y-2">
		<HeaderTerminal />
		<GameClock />
		<Wallet />
		{#if currentStep === StepID.Bridge}
			<Bridge />
		{:else if currentStep === StepID.Mint}
			<MintEgg />
		{/if}
	</div>
</main>

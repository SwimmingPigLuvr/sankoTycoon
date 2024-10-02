<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { gameState } from '../stores/gameState';
	import MintEgg from './MintEgg.svelte';

	$: messages = $gameState.messages;
	let currentStepDescription: string = '';

	const unsubscribe = gameState.subscribe((state) => {
		const currentStep = state.steps.find((step) => step.id === state.currentStep);
		currentStepDescription = currentStep ? currentStep.description : '';
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<main class="bg-black text-white font-mono -tracking-widest p-2 w-full">
	<div class="w-full flex flex-col justify-end">
		{#each messages as message, index}
			{#if index === 4}
				<p class="terminal-glow">
					> {message} <span class="terminal-glow animate-pulse pulsate">_</span>
				</p>
			{:else}
				<p class="text-slate-600">
					. {message}
				</p>
			{/if}
		{/each}
	</div>
</main>

<style>
	.pulsate {
		animation: pulsate 1s ease-out infinite;
		opacity: 100;
	}

	@keyframes pulsate {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}

	/* complete this glow to make it look like an old school terminal */
	.terminal-glow {
		text-shadow:
			0 0 5px rgba(0, 255, 0, 0.75),
			0 0 10px rgba(0, 255, 0, 0.75),
			0 0 20px rgba(0, 255, 0, 0.75),
			0 0 40px rgba(0, 255, 0, 0.75);
	}
</style>

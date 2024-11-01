<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { addMessage, gameState } from '../stores/gameState';

	$: messages = $gameState.messages;
	let currentStepDescription: string = '';

	const unsubscribe = gameState.subscribe((state) => {
		const currentStep = state.steps.find((step) => step.id === state.currentStep);
		currentStepDescription = currentStep ? currentStep.description : '';
	});

	$: if (currentStepDescription) {
		addMessage(currentStepDescription);
	}

	onDestroy(() => {
		unsubscribe();
	});
</script>

<main class="bg-black text-sm text-white tracking-normal font-mono p-2 w-full">
	<h1 class="fixed z-50 text-left top-24 right-6">Sanko Tycoon ©</h1>
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
</style>

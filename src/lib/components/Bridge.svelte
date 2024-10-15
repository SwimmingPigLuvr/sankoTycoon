<!-- lib/components/Bridge.svelte -->
<script lang="ts">
	import { get } from 'svelte/store';
	import { gameState, progressStep } from '../stores/gameState';
	import { onDestroy, onMount } from 'svelte';
	import { wallet } from '../stores/wallet';
	import { fade } from 'svelte/transition';

	let isBridging = false;
	let progress = 0;
	let interval: number;

	function bridgeToSanko() {
		const audio = new Audio('sounds/click.wav');
		audio.play();
		isBridging = true;
		progress = 0;

		interval = setInterval(() => {
			progress += 1;
			if (progress >= 100) {
				clearInterval(interval);
				isBridging = false;
				console.log('bridge complete');
				console.log('changing network from arb to sanko');
				console.log('upadating wallet');
				wallet.update((wallet) => {
					wallet.network = 'Sanko';
					return wallet;
				});
				progressStep();
			}
		}, 20);
		// !todo mark bridge step as complete
	}

	function handleHoverBridge() {
		const audio = new Audio('sounds/hover.wav');
		audio.play();
	}

	let hideBridge = false;
	const unsubscribe = gameState.subscribe((state) => {
		hideBridge = state.currentStep > 0;
	});

	onDestroy(() => {
		unsubscribe();
		if (interval) {
			clearInterval(interval);
		}
	});
</script>

<main class="py-2 w-full">
	{#if !hideBridge}
		<div class="flex flex-col w-40">
			<button
				class="relative rounded-lg text-sm p-1 border-black border-2 px-2 bg-gradient-to-b from-white to-slate-400 hover:border-slate-300 h-8 overflow-hidden"
				on:focus={handleHoverBridge}
				on:mouseover={handleHoverBridge}
				on:click={bridgeToSanko}
				disabled={isBridging}
			>
				{#if isBridging}
					<div
						class="progress-bar z-10 top-0 left-0 absolute h-full"
						style="width: {progress}%"
					></div>
				{/if}
				<p class="z-20 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-full">
					{#if isBridging}
						Bridging to Sanko
					{:else}
						Bridge to Sanko
					{/if}
				</p>
			</button>
		</div>
	{/if}
</main>

<style>
	.progress-bar {
		background-color: #0aea00;
		transition: width 0.1s linear;
		z-index: 0;
	}
</style>

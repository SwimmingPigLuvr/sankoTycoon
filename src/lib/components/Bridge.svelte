<!-- lib/components/Bridge.svelte -->
<script lang="ts">
	import { bridged, currentSection } from '../stores/gameState';
	import { onDestroy, onMount } from 'svelte';
	import { wallet } from '../stores/wallet';

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
				wallet.update((wallet) => {
					wallet.network = 'Sanko';
					return wallet;
				});
				bridged.set(true);
				currentSection.set('Mint');
			}
		}, 10);
	}

	function handleHoverBridge() {
		const audio = new Audio('sounds/hover.wav');
		audio.play();
	}

	let hideBridge = false;

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});
</script>

<main class="py-2 w-full">
	{#if !$bridged}
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

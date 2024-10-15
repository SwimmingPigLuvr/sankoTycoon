<script lang="ts">
	import { wallet, type Bun } from '$lib/stores/wallet';
	import { onMount } from 'svelte';

	export let bun: Bun;
	let showHungerLevel = false;
	const bunStatus = ['Bloated', 'Full', 'Fine', 'Hungry', 'Famished', 'Starving', 'Hibernating'];

	$: statusIndex = bun.hungerLevel ?? 0;
</script>

<main>
	<button
		on:mouseenter={() => (showHungerLevel = true)}
		on:mouseleave={() => (showHungerLevel = false)}
		class="w-full bg-opacity-30 h-[109px]"
	>
		{#if showHungerLevel || bunStatus[statusIndex] === 'Hibernating'}
			<p
				class="w-full bg-opacity-75 text-sm font-FinkHeavy italic text-white
				{bunStatus[statusIndex] === 'Hibernating'
					? 'bg-black'
					: bunStatus[statusIndex] === 'Full'
						? 'bg-green-600'
						: bunStatus[statusIndex] === 'Bloated'
							? 'bg-cyan-400'
							: bunStatus[statusIndex] === 'Fine'
								? 'bg-emerald-200'
								: bunStatus[statusIndex] === 'Hungry'
									? 'bg-yellow-400'
									: bunStatus[statusIndex] === 'Famished'
										? 'bg-orange-600'
										: bunStatus[statusIndex] === 'Starving'
											? 'bg-red-600'
											: ''} 
				absolute bottom-0 p-1 left-0 z-30"
			>
				{bunStatus[statusIndex]}
			</p>
		{/if}
		<img src="/ui/icons/hunger.png" class="z-20 w-10 absolute top-1 right-1" alt="hunger meter" />
		<div
			class="w-10 h-10 absolute top-1 right-1 rounded-full border-8 z-10 {bunStatus[statusIndex] ===
			'Hibernating'
				? 'border-black'
				: bunStatus[statusIndex] === 'Full'
					? 'border-green-600'
					: bunStatus[statusIndex] === 'Bloated'
						? 'border-cyan-400'
						: bunStatus[statusIndex] === 'Fine'
							? 'border-emerald-200'
							: bunStatus[statusIndex] === 'Hungry'
								? 'border-yellow-200'
								: bunStatus[statusIndex] === 'Famished'
									? 'border-orange-400'
									: bunStatus[statusIndex] === 'Starving'
										? 'border-red-500'
										: ''} "
		></div>
	</button>
</main>

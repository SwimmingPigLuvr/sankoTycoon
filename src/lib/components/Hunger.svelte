<script lang="ts">
	import { bunStatus } from '$lib/stores/hungerState';
	import { wallet, type Bun } from '$lib/stores/wallet';
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	export let bun: Bun;
	let showHungerLevel = false;

	$: statusIndex = bun.hungerLevel ?? 0;

	export let miniMeter: boolean = false;
</script>

<main class="-translate-y-1 z-10">
	<button class="w-full">
		<p
			class="w-full bg-opacity-100 text-sm font-FinkHeavy italic text-white
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
										? 'bg-red-600 invert-filter'
										: ''} 
				"
		>
			{bunStatus[statusIndex]}
		</p>
		{#if miniMeter}
			<img src="/ui/icons/hunger.png" class="z-20 w-10 absolute top-1 right-1" alt="hunger meter" />
			<div
				class="w-10 h-10 absolute top-1 right-1 rounded-full border-8 z-10 {bunStatus[
					statusIndex
				] === 'Hibernating'
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
		{/if}
	</button>
</main>

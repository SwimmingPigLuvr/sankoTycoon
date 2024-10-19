<script lang="ts">
	import { toasts } from '$lib/stores/gameState';
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

	function destroyToast(toast: { id: string; message: string }) {
		toasts.update((currentToasts) => {
			return currentToasts.filter(
				(pieceOfToast: { id: string; message: string }) => pieceOfToast.id !== toast.id
			);
		});
	}

	// can you instead remove the newest toast
	onMount(() => {
		const interval = setInterval(() => {
			toasts.update((currentToasts) => {
				// Remove the newest toast by slicing the array
				if (currentToasts.length > 0) {
					return currentToasts.slice(0, -1);
				}
				return currentToasts;
			});
		}, 2500);

		// Clean up the interval on component destruction
		return () => clearInterval(interval);
	});
</script>

<main class="w-full">
	<div class="flex flex-col space-y-2">
		{#each $toasts as toast (toast.id)}
			<button
				on:click={() => destroyToast(toast)}
				in:fly={{ y: -100, duration: 100, easing: cubicInOut }}
				out:fade
				class="w-80 text-center rounded px-2 p-1 font-FinkHeavy text-green-600 bg-green-200 border-green-500 border-dotted border-4"
			>
				{toast.message}
			</button>
		{/each}
	</div>
</main>

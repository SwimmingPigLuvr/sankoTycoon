<script lang="ts">
	import { toasts } from '$lib/stores/gameState';
	import { cubicInOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
</script>

<main class="w-full">
	<div class="flex flex-col space-y-2">
		{#each $toasts.reverse() as toast}
			<div in:fly={{y: -100, duration: 500, easing: cubicInOut}} out:fade class="w-80 text-center rounded px-2 p-1 font-FinkHeavy text-green-600 bg-green-200 border-green-500 border-dotted border-4">
				{toast}
			</div>
		{/each}
	</div>
</main>

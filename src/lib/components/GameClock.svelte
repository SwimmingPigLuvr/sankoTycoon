<script lang="ts">
	import { onMount } from 'svelte';

	let startTime;
	let elapsedTime = 0;

	// Function to format elapsed time
	function formatElapsedTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const remainingSeconds = seconds % 60;
		const formattedHours = String(hours).padStart(2, '0');
		const formattedMinutes = String(minutes).padStart(2, '0');
		const formattedSeconds = String(remainingSeconds).padStart(2, '0');
		return { hours: formattedHours, minutes: formattedMinutes, seconds: formattedSeconds };
	}

	// Initialize timer on mount
	onMount(() => {
		startTime = Date.now();
		setInterval(() => {
			elapsedTime = Math.floor((Date.now() - startTime) / 1000);
		}, 1000);
	});
</script>

<main>
	<!-- clock -->
	<button
		class="italic fixed clock-glow right-2 top-40 flex rounded-lg p-1 px-2 bg-black text-red-500 border-black border-2 -tracking-normal text-xl"
	>
		<p class="">{formatElapsedTime(elapsedTime).hours[0]}</p>
		<p class="">{formatElapsedTime(elapsedTime).hours[1]}</p>
		<p class="">:</p>
		<p class="">{formatElapsedTime(elapsedTime).minutes[0]}</p>
		<p class="">{formatElapsedTime(elapsedTime).minutes[1]}</p>
		<p class="">:</p>
		<p class="">{formatElapsedTime(elapsedTime).seconds[0]}</p>
		<p class="">{formatElapsedTime(elapsedTime).seconds[1]}</p>
	</button>
</main>

<style>
	.clock-glow {
		text-shadow:
			0 0 1px rgba(200, 0, 0),
			0 0 2px rgba(200, 0, 0),
			0 0 3px rgba(200, 0, 0),
			0 0 4px rgba(200, 0, 0);
	}
</style>

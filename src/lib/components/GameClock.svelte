<script lang="ts">
	import { onMount } from 'svelte';

	// todo show simulated gametime 1 day = 1 minute?
	// let user toggle between elapsed time and gametime

	let startTime: number;
	let elapsedTime = 0;

	// Function to format elapsed time
	function formatElapsedTime(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const formattedHours = String(hours).padStart(2, '0');
		const formattedMinutes = String(minutes % 60).padStart(2, '0');
		const formattedSeconds = String(seconds % 60).padStart(2, '0');
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
		class="italic clock-glow fixed top-4 right-2 flex rounded-xl p-2 px-4 bg-black text-red-500 text-2xl"
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
			0 0 5px rgba(200, 0, 0),
			0 0 10px rgba(200, 0, 0),
			0 0 15px rgba(200, 0, 0),
			0 0 20px rgba(200, 0, 0);
	}
</style>

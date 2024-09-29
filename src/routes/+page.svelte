<script>
	import { onMount } from 'svelte';
	import Bridge from '../lib/components/Bridge.svelte';
	import HeaderTerminal from '../lib/components/HeaderTerminal.svelte';
	import Wallet from '../lib/components/Wallet.svelte';

	let startTime;
	let elapsedTime = 0;

	// Function to format elapsed time
	function formatElapsedTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		const formattedMinutes = String(minutes).padStart(2, '0');
		const formattedSeconds = String(remainingSeconds).padStart(2, '0');
		return { minutes: formattedMinutes, seconds: formattedSeconds };
	}

	// Initialize timer on mount
	onMount(() => {
		startTime = Date.now();
		setInterval(() => {
			elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds and floor to remove decimals
		}, 1000);
	});
</script>

<main class="p-2 font-mono -tracking-widest">
	<!-- clock -->
	<button
		class="italic fixed terminal-glow right-2 top-40 flex rounded-lg p-1 px-2 bg-black text-red-500 border-black border-2 -tracking-normal text-xl"
	>
		<p class="">{formatElapsedTime(elapsedTime).minutes[0]}</p>
		<p class="">{formatElapsedTime(elapsedTime).minutes[1]}</p>
		<p class="">:</p>
		<p class="">{formatElapsedTime(elapsedTime).seconds[0]}</p>
		<p class="">{formatElapsedTime(elapsedTime).seconds[1]}</p>
	</button>
	<h1 class="w-full text-right fixed bottom-2 right-2">Sanko Tycoon ©</h1>
	<div class="flex flex-col space-y-4">
		<HeaderTerminal />
		<Wallet />
		<Bridge />
	</div>
</main>

<style>
	.terminal-glow {
		text-shadow:
			0 0 1px rgba(200, 0, 0),
			0 0 2px rgba(200, 0, 0),
			0 0 3px rgba(200, 0, 0),
			0 0 4px rgba(200, 0, 0);
	}
</style>

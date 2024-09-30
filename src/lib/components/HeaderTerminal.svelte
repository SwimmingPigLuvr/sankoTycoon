<script>
	import { onMount } from 'svelte';

	let messages = ['', '', '', ''];
	let newMessage = 'Welcome to Sanko Tycoon ©️';

	onMount(() => {
		setTimeout(() => {
			changeMessage('Bridge to Sanko');
		}, 5000);

	});

	function changeMessage(newMsg) {
		messages = [...messages.slice(1), newMessage];
		newMessage = newMsg;
	}
</script>

<main class="bg-black text-white font-mono -tracking-widest p-2 w-full">
	<div class="w-full flex flex-col justify-end">
		{#each messages as message}
			<p class="text-slate-600">
				. {message}
			</p>
		{/each}
		<p class="terminal-glow">
			> {newMessage} <span class="terminal-glow animate-pulse pulsate">_</span>
		</p>
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
	.terminal-glow {
		text-shadow:
			0 0 5px rgba(0, 255, 0, 0.75),
			0 0 10px rgba(0, 255, 0, 0.75),
			0 0 20px rgba(0, 255, 0, 0.75),
			0 0 40px rgba(0, 255, 0, 0.75);
	}
</style>

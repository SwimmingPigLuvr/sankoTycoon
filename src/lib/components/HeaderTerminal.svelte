<script>
	let messages = ['', '', '', ''];
	let newMessage = 'bridge to sanko';
</script>

<main class="bg-black text-white font-mono -tracking-widest p-2 w-full">
	<div class="w-full flex flex-col justify-end">
		{#each messages as message}
			<p class="text-slate-600">
				. {message}
			</p>
		{/each}
		<p class="terminal-glow slate-200">
			> {newMessage} <span class="animate-pulse pulsate">_</span>
		</p>
	</div>
</main>

<style>
	.pulsate {
		animation: pulsate 0.5s ease-out;
		animation-iteration-count: infinite;
		-webkit-animation: pulsate 0.5s ease-out;
		-webkit-animation-iteration-count: infinite;
		opacity: 100;
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

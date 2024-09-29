<script>
	let messages = ['', '', '',''];
	let newMessage = 'bridge to sanko';
</script>

<main class="bg-black text-white font-mono -tracking-widest p-2 w-full">
	<div class="w-full flex flex-col justify-end">
		{#each messages as message}
			<p class="text-slate-600">
				. {message}
			</p>
		{/each}
		<p class="slate-200">
			> {newMessage} <span class="pulsate">|</span>
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
</style>

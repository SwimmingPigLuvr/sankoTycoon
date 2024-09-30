<script>
	function bridgeToSanko() {}

	function handleHoverBridge() {
		const audio = new Audio('hover.wav');
		audio.play();
	}
</script>

<main class="">
	<div>
		<button
			class="rounded-lg text-sm p-1 border-black border-2 px-2 bg-gradient-to-b from-white to-slate-400 hover:border-slate-300"
			on:focus={handleHoverBridge}
			on:mouseover={handleHoverBridge}
			on:click={bridgeToSanko}>Bridge to Sanko</button
		>
	</div>
</main>

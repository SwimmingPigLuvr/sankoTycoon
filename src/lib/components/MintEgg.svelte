<script lang="ts">
	// todo. mintegg. add egg to wallet
	// mint success message
	import { progressStep } from '$lib/stores/gameState';

	let isMinting = false;
	let minted = false;

	function mintEgg() {
		// const audio = new Audio('sounds/mintEgg.wav');
		// audio.play();
		isMinting = true;
		setTimeout(() => {
			// adding egg to wallet isn't necessary because the user won't really have to hold eggs just buns in their wallet
			// we can just add a bun to their wallet when they hatch that little guy
			progressStep();
			isMinting = false;
			minted = true;
		}, 5000);
	}
</script>

<main>
	<button class="mint-button" disabled={isMinting} on:click={mintEgg}>
		{#if isMinting}
			<!-- Adding spinner -->
			<div class="spinner"></div>
		{/if}
		{#if !isMinting}
			Mint
		{/if}
	</button>
</main>

<style>
	.mint-button {
		padding: 10px 20px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.mint-button:hover {
		background-color: #45a049;
	}

	.spinner {
		border: 4px solid rgba(0, 0, 0, 0.1);
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border-left-color: #4caf50;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>

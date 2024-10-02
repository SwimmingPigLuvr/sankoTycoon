<script lang="ts">
	// todo. mintegg. add egg to wallet
	// mint success message
	import { progressStep } from '$lib/stores/gameState';
	import { wallet, type Bun, type BunWallet, type Fruit, type Seeds } from '$lib/stores/wallet';

	let isMinting = false;
	let minted = false;

	let starterFruit: Fruit = {
		round: 0,
		lumpy: 0,
		heart: 0,
		star: 0,
		square: 0
	};

	let starterSeeds: Seeds = {
		round: 0,
		lumpy: 0,
		heart: 0,
		star: 0,
		square: 0
	};

	let bunWallet: BunWallet = {
		bunId: 1,
		gold: 10,
		fruit: starterFruit,
		seeds: starterSeeds,
		items: ['Bunzempic']
	};

	let starterEgg: Bun = {
		id: 1,
		name: 'Bun',
		industry: 0,
		luck: 0,
		speed: 0,
		stamina: 0,
		strength: 0,
		birthday: new Date(),
		rarity: 'Common',
		type: 'Egg',
		variety: 'Bun',
		wallet: bunWallet
	};

	function mintEgg() {
		// const audio = new Audio('sounds/mintEgg.wav');
		// audio.play();
		isMinting = true;
		setTimeout(() => {
			progressStep();
			isMinting = false;
			minted = true;
			//todo push startEgg into wallet
			//todo set dmt balance to 0
			wallet.update((wallet) => {
				wallet.nfts.push(starterEgg);
				wallet.tokens.find((token) => token.name === 'DMT');
			});
		}, 5000);
	}
</script>

<main>
	<div
		class="border-slate-200 border-4 w-40 text-center mint-button rounded-xl font-FinkHeavy tracking-normal filter hue-rotate-90"
	>
		<p class="text-2xl text-blue-700">Mint Eggs</p>
		<p class="text-lg text-black">Generation 1</p>
		<p class="text-lg text-black">Remaining 4444 / 4444</p>
		<p class="text-lg text-black">1 Egg: <span class="text-blue-700">3 DMT</span></p>

		<button
			class="w-full p-1 rounded-lg text-lime-700 hover:bg-yellow-300 bg-yellow-100"
			disabled={isMinting}
			on:click={mintEgg}
		>
			{#if isMinting}
				<!-- Adding spinner -->
				<div class="w-full m-auto spinner"></div>
			{/if}
			{#if !isMinting}
				Mint
			{/if}
		</button>
	</div>
</main>

<style>
	.mint-button {
		background-image: url('ui/patterns/eggs.png');
		padding: 10px 20px;
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

<script lang="ts">
	import { progressStep } from '$lib/stores/gameState';
	import type { Bun, BunWallet, Item } from '$lib/stores/wallet';
	import { wallet } from '$lib/stores/wallet';
	import Wallet from './Wallet.svelte';

	let isHatching = false;
	let hatched = false;

	let bunzempic: Item = {
		type: 'consumable',
		name: 'Bunzempic',
		quantity: 1,
		imgPath: '/images/items/Bunzempic.png'
	};

	let starSeed: Item = {
		type: 'seed',
		name: 'Star Seed',
		quantity: 1,
		imgPath: '/images/seeds/StarSeed.png',
		fruitType: 'star'
	};

	let heartSeed: Item = {
		type: 'seed',
		name: 'Heart Seed',
		quantity: 1,
		imgPath: '/images/seeds/HeartSeed.png',
		fruitType: 'heart'
	};

	let lumpySeed: Item = {
		type: 'seed',
		name: 'Lumpy Seed',
		quantity: 1,
		imgPath: '/images/seeds/LumpySeed.png',
		fruitType: 'lumpy'
	};

	let roundSeed: Item = {
		type: 'seed',
		name: 'Round Seed',
		quantity: 1,
		imgPath: '/images/seeds/RoundSeed.png',
		fruitType: 'round'
	};

	let squareSeed: Item = {
		type: 'seed',
		name: 'Square Seed',
		quantity: 1,
		imgPath: '/images/seeds/SquareSeed.png',
		fruitType: 'square'
	};

	let bunWallet: BunWallet = {
		bunId: 1,
		gold: 10,
		items: [bunzempic, heartSeed, starSeed, lumpySeed, roundSeed, squareSeed]
	};

	let starterBun: Bun = {
		id: 1111,
		name: 'Buns',
		industry: 5,
		luck: 5,
		speed: 5,
		stamina: 5,
		strength: 5,
		birthday: new Date(),
		rarity: 'Common',
		type: 'Bun',
		variety: 'Bun',
		wallet: bunWallet,
		imageUrl: '/images/buns/Buns.webp'
	};

	function hatchEgg() {
		isHatching = true;
		setTimeout(() => {
			progressStep();
			isHatching = false;
			hatched = true;
			// replace egg with bun
			wallet.update((wallet) => {
				wallet.nfts = [starterBun];
				return wallet;
			});
		}, 2500);
	}
</script>

<main>
	<button
		on:click={hatchEgg}
		class="w-40 bg-black text-white rounded-full border-sky-500 hover:border-fuchsia-500 border-4 p-1 font-FinkHeavy"
	>
		{#if isHatching}
			<!-- Adding spinner -->
			<div class="w-full m-auto spinner"></div>
		{/if}
		{#if !isHatching}
			Hatch
		{/if}
	</button>
</main>

<style>
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

<script lang="ts">
	import { activeBun, progressStep } from '$lib/stores/gameState';
	import type { Bun, BunWallet, Item } from '$lib/stores/wallet';
	import { wallet } from '$lib/stores/wallet';
	import * as items from '$lib/itemData';
	import Wallet from './Wallet.svelte';
	import { startHungerInterval } from '$lib/stores/hungerState';

	// implement random bun hatching based on rarity

	let isHatching = false;
	let hatched = false;

	let bunWallet: BunWallet = {
		bunId: 1111,
		gold: 10,
		items: [...Object.values(items)]
	};

	let bunWallet2: BunWallet = {
		bunId: 2222,
		gold: 100,
		items: Object.values(items).map((item) => ({
			...item,
			quantity: 0
		}))
	};

	// add items to bunwallet2
	const elfHat = bunWallet2.items.find((item) => item.name === 'Elf Hat');
	if (elfHat) {
		elfHat.quantity = 1;
	}
	const starSeed2 = bunWallet2.items.find((item) => item.name === 'Star Seed');
	if (starSeed2) {
		starSeed2.quantity = 1;
	}

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
		imageUrl: '/images/buns/Buns.webp',
		farm: Array(25).fill({ state: 'empty' }),
		hungerLevel: 0,
		isHibernating: false,
		isCoolingDown: false
	};

	let testBun: Bun = {
		id: 2222,
		name: 'Snake',
		industry: 5,
		luck: 5,
		speed: 5,
		stamina: 5,
		strength: 5,
		birthday: new Date(),
		rarity: 'Common',
		type: 'Bun',
		variety: 'Bun',
		wallet: bunWallet2,
		imageUrl: '/images/buns/thumbs/Snake.png',
		farm: Array(25).fill({ state: 'empty' }),
		hungerLevel: 0,
		isHibernating: false,
		isCoolingDown: false
	};

	function hatchEgg() {
		isHatching = true;
		setTimeout(() => {
			progressStep();
			isHatching = false;
			hatched = true;
			// replace egg with bun
			wallet.update((wallet) => {
				wallet.nfts = [starterBun, testBun];
				wallet.nfts.forEach((bun: Bun) => {
					if (!bun.isHibernating) {
						startHungerInterval(bun);
						console.log(`started hunger interval for ${bun.name}`);
					}
				});
				return wallet;
			});
			// set currentBun
			activeBun.set(starterBun);
		}, 250);
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

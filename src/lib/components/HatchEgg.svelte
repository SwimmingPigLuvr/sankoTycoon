<script lang="ts">
	import { activeBun, progressStep } from '$lib/stores/gameState';
	import type { Bun, BunVariety, BunType, BunRarity, BunWallet, Item } from '$lib/stores/wallet';
	import { wallet } from '$lib/stores/wallet';
	import * as items from '$lib/itemData';
	import Wallet from './Wallet.svelte';
	import { startHungerInterval } from '$lib/stores/hungerState';
	import { v4 as uuidv4 } from 'uuid';

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

	// Function to create a Bun object
	function createBun(
		id: number,
		name: BunVariety,
		rarity: BunRarity,
		imageUrl: string,
		stats: {
			industry: number;
			luck: number;
			speed: number;
			stamina: number;
			strength: number;
		}
	): Bun {
		return {
			id,
			name,
			rarity,
			type: 'Bun',
			variety: name,
			imageUrl,
			industry: stats.industry,
			luck: stats.luck,
			speed: stats.speed,
			stamina: stats.stamina,
			strength: stats.strength,
			birthday: new Date(),
			wallet: bunWallet,
			farm: Array(25).fill({ state: 'empty' }),
			hungerLevel: 0,
			isHibernating: false,
			isCoolingDown: false
		};
	}

	// Bun varieties and probabilities within each rarity
	const bunProbabilitiesByRarity: { [rarity: string]: { variety: string; weight: number }[] } = {
		Common: [
			{ variety: 'Strawbie', weight: 103 },
			{ variety: 'Orange', weight: 101 }
			// Add other common bun varieties with their weights
		],
		Uncommon: [
			{ variety: 'Fire', weight: 77 },
			{ variety: 'Geeny', weight: 74 }
			// Add other uncommon bun varieties with their weights
		]
		// Add other rarities
	};

	// Base stats per rarity
	const rarityStats = {
		Common: { industry: 5, luck: 5, speed: 5, stamina: 5, strength: 5 },
		Uncommon: { industry: 6, luck: 6, speed: 6, stamina: 6, strength: 6 },
		Rare: { industry: 7, luck: 7, speed: 7, stamina: 7, strength: 7 },
		Rotten: { industry: 4, luck: 4, speed: 4, stamina: 4, strength: 4 },
		Moldy: { industry: 3, luck: 3, speed: 3, stamina: 3, strength: 3 },
		SuperRare: { industry: 8, luck: 8, speed: 8, stamina: 8, strength: 8 }
	};

	function getRandomBun(rarity: BunRarity) {
		const bunList = bunProbabilitiesByRarity[rarity];
		if (!bunList) {
			throw new Error(`no bun varieties found for rarity: ${rarity}`);
		}

		const totalWeight = bunList.reduce((sum, bun) => sum + bun.weight, 0);
		const randomWeight = Math.floor(Math.random() * totalWeight);
		let cumulativeWeight = 0;

		for (const bun of bunList) {
			cumulativeWeight += bun.weight;
			if (randomWeight < cumulativeWeight) {
				return bun;
			}
		}
		// fallback
		return bunList[bunList.length - 1];
	}

	function hatchEgg(egg: Bun) {
		isHatching = true;
		setTimeout(() => {
			progressStep();
			isHatching = false;
			hatched = true;
			// replace egg with bun
			wallet.update((wallet) => {
				// remove egg from wallet
				wallet.nfts = wallet.nfts.filter((nft: Bun) => nft.id !== egg.id);

				// generate random bun
				const bun = getRandomBun(egg.rarity);

				// get stats
				const stats = rarityStats[egg.rarity];

				const newBun: Bun = {
					id: uuidv4(),
					name: bun.variety,
					industry: stats.industry,
					luck: stats.luck,
					speed: stats.speed,
					stamina: stats.stamina,
					strength: stats.strength,
					birthday: new Date(),
					rarity: egg.rarity,
					type: 'Bun',
					variety: bun.variety as BunVariety,
					wallet: {
						bunId: uuidv4(),
						gold: 0,
						items: []
					},
					imageUrl: `/images/buns/${bun.variety}.webp`,
					farm: Array(25).fill({ state: 'empty' }),
					hungerLevel: 0,
					isCoolingDown: false,
					isHibernating: false
				};

				wallet.nfts.push(newBun);

				if (!newBun.isHibernating) {
					startHungerInterval(newBun);
				}

				activeBun.set(newBun);

				return wallet;
			});
			// set currentBun
			activeBun.set(buns);
		}, 3000);

		if (egg.type !== 'Egg') {
			alert("cannot hatch this because it's not an egg");
			return;
		}
	}

	// List of bun varieties and rarities
	const bunVarieties: { name: BunVariety; rarity: BunRarity }[] = [
		// Common buns
		{ name: 'Strawbie', rarity: 'Common' },
		{ name: 'Orange', rarity: 'Common' },
		{ name: 'Lemuh', rarity: 'Common' },
		{ name: 'Lime', rarity: 'Common' },
		{ name: 'Buns', rarity: 'Common' },
		{ name: 'Blue', rarity: 'Common' },
		{ name: 'Choi', rarity: 'Common' },
		{ name: 'Turni', rarity: 'Common' },
		{ name: 'Driftwood', rarity: 'Common' },
		{ name: 'Turtly', rarity: 'Common' },
		{ name: 'Purple', rarity: 'Common' },
		{ name: 'Tomat', rarity: 'Common' },
		{ name: 'Bomber', rarity: 'Common' },
		{ name: 'Peppermint', rarity: 'Common' },
		{ name: 'Glass', rarity: 'Common' },
		{ name: 'Crystal', rarity: 'Common' },
		{ name: 'Green', rarity: 'Common' },
		{ name: 'Cloudy', rarity: 'Common' },
		{ name: 'Wood', rarity: 'Common' },
		{ name: 'Earthy', rarity: 'Common' },
		{ name: 'Confetti', rarity: 'Common' },
		{ name: 'Cream', rarity: 'Common' },

		// Uncommon buns
		{ name: 'Fire', rarity: 'Uncommon' },
		{ name: 'Geeny', rarity: 'Uncommon' },
		{ name: 'Yeti', rarity: 'Uncommon' },
		{ name: 'Galxy', rarity: 'Uncommon' },
		{ name: 'Lava', rarity: 'Uncommon' },
		{ name: 'Gorli', rarity: 'Uncommon' },
		{ name: 'Bunzilian', rarity: 'Uncommon' },
		{ name: 'Bricks', rarity: 'Uncommon' },
		{ name: 'Purr', rarity: 'Uncommon' },
		{ name: 'Nebula', rarity: 'Uncommon' },
		{ name: 'Tux', rarity: 'Uncommon' },
		{ name: 'Pup', rarity: 'Uncommon' },

		// Rare buns
		{ name: 'Detec', rarity: 'Rare' },
		{ name: 'SuperBun', rarity: 'Rare' },
		{ name: 'Cowboy', rarity: 'Rare' },
		{ name: 'Silver', rarity: 'Rare' },
		{ name: 'Chikki', rarity: 'Rare' },
		{ name: 'Mini', rarity: 'Rare' },

		// Rotten buns
		{ name: 'Leathy', rarity: 'Rotten' },
		{ name: 'Sproto', rarity: 'Rotten' },
		{ name: 'Hippy', rarity: 'Rotten' },
		{ name: 'Snake', rarity: 'Rotten' },
		{ name: 'Ket', rarity: 'Rotten' },

		// Moldy buns
		{ name: 'Joker', rarity: 'Moldy' },
		{ name: 'Kev', rarity: 'Moldy' },
		{ name: 'Pipe', rarity: 'Moldy' },

		// Super Rare buns
		{ name: 'RaceCar', rarity: 'SuperRare' },
		{ name: 'Dev', rarity: 'SuperRare' },
		{ name: 'Goldie', rarity: 'SuperRare' },
		{ name: 'Angel', rarity: 'SuperRare' },
		{ name: 'Spirit', rarity: 'SuperRare' }
	];

	// Generate bun objects
	const sankoDex: Bun[] = bunVarieties.map((bunVariety, index) => {
		const { name, rarity } = bunVariety;
		const stats = rarityStats[rarity as BunRarity];
		return createBun(
			index + 1,
			name,
			rarity as BunRarity,
			`/images/buns/thumbs/${name}.png`,
			stats
		);
	});

	let buns: Bun = {
		name: 'Buns',
		id: 1111,
		industry: 5,
		luck: 5,
		speed: 5,
		stamina: 5,
		strength: 5,
		birthday: new Date(),
		rarity: 'Common',
		type: 'Bun',
		variety: 'Buns',
		wallet: bunWallet,
		imageUrl: '/images/buns/Buns.webp',
		farm: Array(25).fill({ state: 'empty' }),
		hungerLevel: 0,
		isHibernating: false,
		isCoolingDown: false
	};

	let snake: Bun = {
		name: 'Snake',
		id: 2222,
		industry: 5,
		luck: 5,
		speed: 5,
		stamina: 5,
		strength: 5,
		birthday: new Date(),
		rarity: 'Rotten',
		type: 'Bun',
		variety: 'Snake',
		wallet: bunWallet2,
		imageUrl: '/images/buns/thumbs/Snake.png',
		farm: Array(25).fill({ state: 'empty' }),
		hungerLevel: 0,
		isHibernating: false,
		isCoolingDown: false
	};
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

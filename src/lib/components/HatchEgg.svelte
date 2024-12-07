<!-- $lib/components/HatchEgg.svelte -->
<script lang="ts">
	import {
		activeBun,
		bridged,
		bunIndex,
		currentSection,
		progressStep
	} from '$lib/stores/gameState';
	import type { Bun, BunVariety, BunType, BunRarity, BunWallet, Item } from '$lib/stores/wallet';
	import { generateEthAddress, wallet } from '$lib/stores/wallet';
	import * as items from '$lib/itemData';
	import Wallet from './Wallet.svelte';
	import { startHungerInterval } from '$lib/stores/hungerState';

	// Define the stats type
	type RarityStats = {
		industry: number;
		luck: number;
		speed: number;
		stamina: number;
		strength: number;
	};

	// Type the rarityStats object
	const rarityStats: Record<BunRarity, RarityStats> = {
		Common: { industry: 5, luck: 5, speed: 5, stamina: 5, strength: 5 },
		Uncommon: { industry: 6, luck: 6, speed: 6, stamina: 6, strength: 6 },
		Rare: { industry: 7, luck: 7, speed: 7, stamina: 7, strength: 7 },
		Rotten: { industry: 4, luck: 4, speed: 4, stamina: 4, strength: 4 },
		Moldy: { industry: 3, luck: 3, speed: 3, stamina: 3, strength: 3 },
		SuperRare: { industry: 8, luck: 8, speed: 8, stamina: 8, strength: 8 }
	};

	// implement random bun hatching based on rarity

	$: buns = $wallet.nfts.filter((nft: Bun) => nft.type === 'Bun') ?? [];
	$: eggs = $wallet.nfts.filter((nft: Bun) => nft.type === 'Egg') ?? [];

	function hatchEggHandler() {
		if (isHatching) return;
		isHatching = true;
		const eggToHatch = $activeBun;

		try {
			setTimeout(() => {
				// Generate everything we need before updating wallet
				const bun = getRandomBun(eggToHatch.rarity);
				const stats = rarityStats[eggToHatch.rarity];

				// Create the new bun
				const newBun: Bun = {
					id: eggToHatch.id,
					name: bun.variety,
					variety: bun.variety as BunVariety,
					rarity: eggToHatch.rarity,
					type: 'Bun' as BunType,
					imageUrl: `/images/buns/${bun.variety}.webp`,
					thumbUrl: `/images/buns/thumbs/${bun.variety}.png`,
					industry: stats.industry,
					luck: stats.luck,
					speed: stats.speed,
					stamina: stats.stamina,
					strength: stats.strength,
					birthday: new Date(),
					wallet: createStarterWallet(eggToHatch.id),
					farm: Array(25).fill({ state: 'empty' }),
					hungerLevel: 0,
					isCoolingDown: false,
					isHibernating: false
				};

				// Update the wallet with all changes at once
				wallet.update((w) => {
					const otherNfts = w.nfts.filter((nft: Bun) => nft.id !== eggToHatch.id);
					const updatedNfts = [...otherNfts, newBun];

					// Update all the references
					const bunsOnly = updatedNfts.filter((nft: Bun) => nft.type === 'Bun');
					const newBunIndex = bunsOnly.findIndex((bun) => bun.id === newBun.id);

					if (newBunIndex !== -1) {
						bunIndex.set(newBunIndex);
						activeBun.set(newBun);
						currentSection.set('Buns');
						startHungerInterval(newBun);
					}

					isHatching = false;
					hatched = true;

					return {
						...w,
						nfts: updatedNfts
					};
				});
			}, 2500);
		} catch (error) {
			console.error('error during hatching', error);
			isHatching = false;
		}
	}

	let isHatching = false;
	let hatched = false;

	function createStarterWallet(bunId: number) {
		return {
			address: generateEthAddress(),
			bunId: bunId,
			gold: 10,
			items: starterWallet.items.map((item) => ({
				...item,
				quantity: item.quantity
			}))
		};
	}

	let starterWallet: BunWallet = {
		address: generateEthAddress(),
		bunId: 0,
		gold: 0,
		items: [...Object.values(items)]
	};

	let bunWallet2: BunWallet = {
		address: generateEthAddress(),
		bunId: 2222,
		gold: 0,
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
		thumbUrl: string,
		stats: {
			industry: number;
			luck: number;
			speed: number;
			stamina: number;
			strength: number;
		},
		options?: Partial<Bun>
	): Bun {
		return {
			id,
			name,
			rarity,
			type: 'Bun',
			variety: name,
			imageUrl,
			thumbUrl,
			industry: stats.industry,
			luck: stats.luck,
			speed: stats.speed,
			stamina: stats.stamina,
			strength: stats.strength,
			birthday: new Date(),
			wallet: options?.wallet || starterWallet,
			farm: options?.farm || Array(25).fill({ state: 'empty' }),
			hungerLevel: 0,
			isHibernating: false,
			isCoolingDown: false,
			...options
		};
	}

	// Bun varieties and probabilities within each rarity
	const bunProbabilitiesByRarity: { [rarity: string]: { variety: string; weight: number }[] } = {
		Common: [
			{ variety: 'Strawbie', weight: 103 },
			{ variety: 'Orange', weight: 101 },
			{ variety: 'Lemuh', weight: 100 },
			{ variety: 'Lime', weight: 99 },
			{ variety: 'Buns', weight: 99 },
			{ variety: 'Blue', weight: 97 },
			{ variety: 'Choi', weight: 89 },
			{ variety: 'Turni', weight: 88 },
			{ variety: 'Driftwood', weight: 86 },
			{ variety: 'Turtly', weight: 85 },
			{ variety: 'Purple', weight: 84 },
			{ variety: 'Tomat', weight: 82 },
			{ variety: 'Bomber', weight: 80 },
			{ variety: 'Peppermint', weight: 78 },
			{ variety: 'Glass', weight: 77 },
			{ variety: 'Crystal', weight: 71 },
			{ variety: 'Green', weight: 70 },
			{ variety: 'Cloudy', weight: 70 },
			{ variety: 'Wood', weight: 68 },
			{ variety: 'Earthy', weight: 67 },
			{ variety: 'Confetti', weight: 65 },
			{ variety: 'Cream', weight: 65 }
		],

		Uncommon: [
			{ variety: 'Fire', weight: 77 },
			{ variety: 'Geeny', weight: 74 },
			{ variety: 'Yeti', weight: 73 },
			{ variety: 'Galxy', weight: 68 },
			{ variety: 'Lava', weight: 65 },
			{ variety: 'Gorli', weight: 65 },
			{ variety: 'Bunzilian', weight: 61 },
			{ variety: 'Bricks', weight: 58 },
			{ variety: 'Purr', weight: 58 },
			{ variety: 'Nebula', weight: 51 },
			{ variety: 'Tux', weight: 44 },
			{ variety: 'Pup', weight: 42 }
		],

		Rare: [
			{ variety: 'Detec', weight: 69 },
			{ variety: 'SuperBun', weight: 66 },
			{ variety: 'Cowboy', weight: 53 },
			{ variety: 'Silver', weight: 49 },
			{ variety: 'Chikki', weight: 46 },
			{ variety: 'Mini', weight: 38 }
		],

		Rotten: [
			{ variety: 'Leathy', weight: 70 },
			{ variety: 'Sproto', weight: 66 },
			{ variety: 'Hippy', weight: 62 },
			{ variety: 'Snake', weight: 45 },
			{ variety: 'Ket', weight: 35 }
		],

		Moldy: [
			{ variety: 'Joker', weight: 39 },
			{ variety: 'Kev', weight: 36 },
			{ variety: 'Pipe', weight: 13 }
		],

		SuperRare: [
			{ variety: 'RaceCar', weight: 29 },
			{ variety: 'Dev', weight: 21 },
			{ variety: 'Goldie', weight: 15 },
			{ variety: 'Angel', weight: 14 },
			{ variety: 'Spirit', weight: 6 }
		]
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
</script>

<main>
	<button
		on:click={hatchEggHandler}
		class="w-40 bg-black hover:font-black hover:text-white text-white rounded-none text-xs border-lime-400 border-2 p-2 px-3 font-mono terminal-glow"
	>
		{#if isHatching}
			<!-- Adding spinner -->
			<div class="w-full m-auto spinner"></div>
		{/if}
		{#if !isHatching}
			hatch {$activeBun.name} egg
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

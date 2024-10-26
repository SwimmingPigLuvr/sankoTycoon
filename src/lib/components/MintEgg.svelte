<!-- $lib/components/MintEgg.svelte -->
<script lang="ts">
	import * as items from '$lib/itemData';
	// todo. mintegg. add egg to wallet
	// mint success message
	import { activeBun, addMessage, eggIndex, progressStep } from '$lib/stores/gameState';
	import {
		generateEthAddress,
		wallet,
		type Bun,
		type BunRarity,
		type BunVariety,
		type BunWallet,
		type Item,
		type Plot,
		type Token
	} from '$lib/stores/wallet';

	let nextEggId = 1; // first egg
	let totalEggsRemaining = 4444;

	function mintEggHandler() {
		isMinting = true;
		setTimeout(() => {
			progressStep();
			mintEgg();
			isMinting = false;
			minted = true;
		}, 0);
	}

	$: eggs = $wallet.nfts.filter((nft: Bun) => nft.type === 'Egg');

	// Egg rarities and probabilities
	const eggProbabilities = [
		// common
		{ variety: 'Red', rarity: 'Common', weight: 335 },
		{ variety: 'Blue', rarity: 'Common', weight: 362 },
		{ variety: 'Green', rarity: 'Common', weight: 352 },
		{ variety: 'Natural', rarity: 'Common', weight: 340 },
		// uncommon
		{ variety: 'BlueStar', rarity: 'Uncommon', weight: 319 },
		{ variety: 'Sanko', rarity: 'Uncommon', weight: 306 },
		{ variety: 'Purple', rarity: 'Uncommon', weight: 254 },
		// rare
		{ variety: 'RedStar', rarity: 'Rare', weight: 240 },
		{ variety: 'Qualk', rarity: 'Rare', weight: 200 },
		// rotten
		{ variety: 'Rotten', rarity: 'Rotten', weight: 150 },
		// moldy
		{ variety: 'Moldy', rarity: 'Moldy', weight: 100 },
		// superrare
		{ variety: 'Gold', rarity: 'SuperRare', weight: 500000 }
	];

	function getRandomEgg() {
		const totalWeight = eggProbabilities.reduce((sum, egg) => sum + egg.weight, 0);
		const randomWeight = Math.floor(Math.random() * totalWeight);
		let cumulativeWeight = 0;

		for (const egg of eggProbabilities) {
			cumulativeWeight += egg.weight;
			if (randomWeight < cumulativeWeight) {
				return egg;
			}
		}
		// fallback
		return eggProbabilities[eggProbabilities.length - 1];
	}

	let isMinting = false;
	let minted = false;

	let bunWallet: BunWallet = {
		address: generateEthAddress(),
		bunId: 1111,
		gold: 0,
		items: []
	};

	let eggPlot: Plot[] = [];

	let natural: Bun = {
		id: 1111,
		name: 'Natural',
		industry: 0,
		luck: 0,
		speed: 0,
		stamina: 0,
		strength: 0,
		birthday: new Date(),
		rarity: 'Common',
		type: 'Egg',
		variety: 'Buns',
		wallet: bunWallet,
		imageUrl: '/images/eggs/natural.webp',
		thumbUrl: '/images/eggs/natural.webp',
		farm: eggPlot,
		hungerLevel: 0,
		isHibernating: false,
		isCoolingDown: false
	};

	let eggIdCounter = 1;

	function mintEgg() {
		// check if eggs left
		if (totalEggsRemaining <= 0) {
			addMessage('no eggs left to mint. buy more eggs n buns from sudoswap');
		}
		wallet.update((wallet) => {
			// set DMT value to 0
			const dmtToken = wallet.tokens.find((token: Token) => token.name === 'DMT');
			if (!dmtToken || dmtToken.balance < 3) {
				addMessage('Not enough $DMT.');
				return wallet;
			}
			dmtToken.balance -= 3;

			const egg = getRandomEgg();
			const newEgg: Bun = {
				id: nextEggId,
				name: egg.variety,
				industry: 0,
				luck: 0,
				speed: 0,
				stamina: 0,
				strength: 0,
				birthday: new Date(),
				rarity: egg.rarity as BunRarity,
				type: 'Egg',
				variety: egg.variety as BunVariety,
				wallet: {
					address: generateEthAddress(),
					bunId: nextEggId,
					gold: 0,
					items: []
				},
				imageUrl: `/images/eggs/${egg.variety}.webp`,
				thumbUrl: `/images/eggs/${egg.variety}.webp`,
				farm: [],
				hungerLevel: 0,
				isHibernating: false,
				isCoolingDown: false
			};
			// push new egg
			wallet.nfts.push(newEgg);
			// set current egg
			if (eggs.length > 0) {
				eggIndex.update((e) => (e = eggs.length));
			} else {
				eggIndex.set(0);
			}
			activeBun.set(newEgg);

			// update egg count
			nextEggId += 1;
			totalEggsRemaining -= 1;

			return wallet;
		});
	}
</script>

<main class="w-full">
	<div
		class="border-slate-200 border-4 w-40 text-center mint-button rounded-xl font-FinkHeavy tracking-normal filter hue-rotate-90 flex flex-col"
	>
		<p class="text-2xl text-blue-700">Mint Eggs</p>
		<p class="text-lg text-black">Generation 1</p>
		<p class="text-lg text-black">Remaining {totalEggsRemaining} / 4444</p>
		<p class="text-lg text-black">1 Egg: <span class="text-blue-700">3 DMT</span></p>

		<button
			class="w-full p-1 rounded-lg text-lime-700 hover:bg-yellow-300 bg-yellow-100"
			disabled={isMinting}
			on:click={mintEggHandler}
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

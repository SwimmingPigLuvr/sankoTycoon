<!-- $lib/components/BunWallet.svelte -->
<script lang="ts">
	import * as itemData from '$lib/itemData';
	import { autoFeeder, bunBlasted, isReviving, totalFruitsEaten } from '$lib/stores/abilities';
	import {
		addMessage,
		gameState,
		b,
		bridged,
		currentSectionBuns
	} from '$lib/stores/gameState';
	import { wallet, type Bun, type Item, type Token } from '$lib/stores/wallet';
	import { cubicInOut } from 'svelte/easing';
	import { fade, fly, slide } from 'svelte/transition';
	import Hunger from './Hunger.svelte';
	import HatchEgg from './HatchEgg.svelte';
	import { restartHungerInterval } from '$lib/stores/hungerState';
	import MintEgg from './MintEgg.svelte';

	export let bun: Bun;

	let showWithdrawGold = false;

	$: buns = $wallet?.nfts ?? [];
	$: bunWallet = bun?.wallet;
	$: items = bunWallet?.items.filter((items: Item) => items.quantity > 0);
	$: bunId = bunWallet?.bunId;
	$: gold = bunWallet?.gold;

	$: fruit = items?.filter((items: Item) => items.type === 'fruit') ?? [];
	$: seeds = items?.filter((items: Item) => items.type === 'seed') ?? [];
	$: witheredSeeds = items?.filter((items: Item) => items.type === 'witheredSeed') ?? [];
	$: wearables = items?.filter((items: Item) => items.type === 'wearable') ?? [];
	$: consumables = items?.filter((items: Item) => items.type === 'consumable') ?? [];

	$: allItems = [...consumables, ...wearables, ...seeds, ...witheredSeeds, ...fruit];

	let currentAbility: string | undefined;
	let bunBlastMessage: string | undefined;

	// Modify the nextBun and prevBun functions to cycle through the nfts array
	function nextBun() {
		b.set(($b + 1) % buns.length); // Increment b and wrap around using modulo
		console.log(`current bun: ${buns[$b].name} id #${buns[$b].id}`);
	}

	function prevBun() {
		b.set(($b - 1 + buns.length) % buns.length); // Decrement b and wrap around using modulo to handle negative index
		console.log(`current bun: ${buns[$b].name} id #${buns[$b].id}`);
	}

	function activateAbility(itemName: string) {
		// update wallet
		wallet.update((currentWallet) => {
			// find bun
			const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
			if (bunIndex === -1) {
				console.error('bun not found');
				return currentWallet;
			}
			const bunNft: Bun = currentWallet.nfts[bunIndex];

			// handle item ability
			switch (itemName) {
				case 'Bun Blaster':
					activateBunBlaster(bunNft);
					break;
				case 'Bunzempic':
					narcanBun(bunNft);
					break;
				case 'Heart Fruit':
				case 'Lumpy Fruit':
				case 'Star Fruit':
				case 'Round Fruit':
				case 'Square Fruit':
				case 'Slop':
					eatFruit(bunNft, itemName);
					break;
				default:
					break;
			}
			return currentWallet;
		});
	}

	function activateBunBlaster(bun: Bun) {
		// find bun blaster in inventory
		const blaster = bun.wallet.items.find((item: Item) => item.name === 'Bun Blaster');
		if (blaster && blaster.quantity > 0) {
			// clear currentAbility message
			currentAbility = undefined;
			// decrement blaster by 1
			blaster.quantity -= 1;

			// check gold
			let startingGold = bun.wallet.gold;
			// activate bun blaster state
			bunBlasted.set(true);
			addMessage(`${bun.name} inhales an extremely deep breath of nitrous from the Bun Blaster.`);

			// lasts 10s
			setTimeout(() => {
				bunBlasted.set(false);
				addMessage('The effects from the Bun Blaster have worn off.');
				let endingGold = bun.wallet.gold;
				let profit = endingGold - startingGold;
				addMessage(`Total Gold earned while blasted: ${profit}`);
			}, 10000);
		} else {
			addMessage('No Bun Blaster detected. Consider buying one from the shop.');
		}
	}

	function narcanBun(bun: Bun) {
		if (!bun.isHibernating) {
			addMessage('Cannot use bunzempic on bun that is not in hibernation.');
			return;
		}
		// clear currentAbility message
		currentAbility = undefined;

		// find bunzempic
		const bunzempicBottle = bun.wallet.items.find((item: Item) => item.name === 'Bunzempic');
		if (bunzempicBottle && bunzempicBottle.quantity > 0) {
			// decrement
			bunzempicBottle.quantity -= 1;

			// reset hunger level
			bun.hungerLevel = 0;
			// wake up bun
			bun.isHibernating = false;
			// start cool down period
			bun.isCoolingDown = true;
			addMessage(`${bun.name} is reviving...`);
			const COOLDOWN_DURATION = 5000;

			setTimeout(() => {
				// reset hunger
				restartHungerInterval(bun);
				// update wallet
				wallet.update((currentWallet) => {
					const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
					if (bunIndex === -1) {
						return currentWallet;
					}
					const bunNft = currentWallet.nfts[bunIndex];
					bunNft.isCoolingDown = false;
					addMessage(`${bunNft.name} has been revived.`);
					return currentWallet;
				});
			}, COOLDOWN_DURATION);
		} else {
			addMessage('No Bunzempic left to use. Buy some from the shop');
		}
	}

	function eatFruit(bun: Bun, fruitName: string) {
		console.log('eating fruit:', fruitName);

		// wallet update
		wallet.update((currentWallet) => {
			const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
			if (bunIndex === -1) {
				console.error('bun not found');
				return currentWallet;
			}
			const bunNft: Bun = currentWallet.nfts[bunIndex];

			if (bunNft.isHibernating) {
				addMessage('Cannot feed bun in hibernation. Use Bunzempic to revive');
				return currentWallet;
			}
			if (bunNft.isCoolingDown) {
				addMessage(
					`Cannot feed ${bun.name}. Wait until cool down period is over to be fully revived`
				);
				return currentWallet;
			}
			const fruitItem = bun.wallet.items.find((item: Item) => item.name === fruitName);

			// check if the fruit exists and that the quantity is > 0
			if (fruitItem && fruitItem.quantity > 0) {
				// decrement
				fruitItem.quantity -= 1;
				// reset hunger
				bunNft.hungerLevel = 0;
				restartHungerInterval(bunNft);

				// handle fruit type
				switch (fruitItem.fruitType) {
					case 'heart':
						bunNft.strength += 1;
						addMessage('Hunger reduced. Strength +1.');
						break;
					case 'star':
						bunNft.luck += 1;
						addMessage('Hunger reduced. Luck +1.');
						break;
					case 'lumpy':
						bunNft.stamina += 1;
						addMessage('Hunger reduced. Stamina +1.');
						break;
					case 'round':
						bunNft.speed += 1;
						addMessage('Hunger reduced. Speed +1.');
						break;
					case 'square':
						bunNft.industry += 1;
						addMessage('Hunger reduced. Industry +1.');
						break;
					case 'slop':
						addMessage('Hunger reduced.');
						break;
					default:
						break;
				}

				// add to total fruits eaten
				totalFruitsEaten.update((total) => (total += 1));
				return currentWallet;
			} else {
				addMessage(`You do not have any ${fruitName}s.`);
				return currentWallet;
			}
		});
	}

	// check if autofeeder is enabled
	$: if ($autoFeeder.enabled && buns[$b]) {
		const bun = buns[$b];
		// only use when bun is starving
		if (bun.hungerLevel >= 5) {
			const wallet = bun.wallet;
			const anyFruit = wallet.items.find(
				(item: Item) => item.type === 'fruit' && item.quantity > 0
			);
			if (anyFruit) {
				console.log('auto feeder activated');
				eatFruit(bun, anyFruit.name);
			}
		}
	}

	// todo
	// if the items have a quantity of more than 1 then they still only take up 1 grid but later on i will add
	// an icon showing the quantity
	function withdrawGold() {
		wallet.update((wallet) => {
			const bun = wallet.nfts[$b];
			const amount = bun.wallet.gold;
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (amount >= 0) {
				bun.wallet.gold = 0;
				if (goldToken) {
					goldToken.balance += amount;
				}
				addMessage(`${bun.name} transfered ${amount} GOLD to main wallet.`);
			}
			return wallet;
		});
	}

	function toggleSection() {
		currentSectionBuns.set(!$currentSectionBuns);
		console.log(`changed section from ${!currentSectionBuns} to ${$currentSectionBuns}`);
	}
</script>

<main
	in:fly={{ duration: 100, x: -10, easing: cubicInOut }}
	class="w-full justify-center flex flex-col border-gray-400 border- max-w-40"
>
	<div class="w-full justify-center items-center flex flex-col space-y-0">
		<!-- EGG SECTION -->
		{#if !$currentSectionBuns}
			<!-- if any eggs in the wallet -->
			{#if buns[$b]}
				<div class="w-full flex px-2 justify-center space-x-4 font-FinkHeavy text-xl text-center">
					<!-- if multiple eggs in the wallet -->
					{#if buns.length > 1}
						<!-- left arrow -->
						<button class="hover:scale-125" on:click={() => nextBun()}>
							<img src="/ui/icons/arrow.png" class="w-8" alt="" />
						</button>
						<button on:click={() => toggleSection()}>Eggs</button>
						<!-- right arrow -->
						<button on:click={() => prevBun()} class="hover:scale-125">
							<img src="/ui/icons/arrow.png" class="w-8 scale-[-100%]" alt="" />
						</button>
						<!-- if singular bun -->
					{:else}
						<button on:click={() => toggleSection()}>Buns</button>
					{/if}
				</div>
				<!-- current egg -->
				<div class="w-full">
					<button in:fade={{ duration: 1000, easing: cubicInOut }} class="relative">
						<img class="w-40 m-auto" src={buns[$b].imageUrl} alt={buns[$b].name} />
					</button>
					<!-- egg info -->
					<div class="flex flex-col items-center justify-center space-y-0">
						<p class="text-2xl font-FinkHeavy text-center">
							{buns[$b].name} Egg
						</p>
						<p class="text-xs font-mono text-center">
							{buns[$b].rarity}
						</p>
						<div class="py-2">
							<HatchEgg />
						</div>
					</div>
				</div>
			{/if}
			{#if $bridged}
				<div>
					<MintEgg />
				</div>
			{/if}
		{:else if $currentSectionBuns}
			<!-- if any buns in the wallet -->
			{#if buns[$b]}
				<div class="w-full flex px-2 justify-center space-x-4 font-FinkHeavy text-xl text-center">
					<!-- if multiple buns in the wallet -->
					{#if buns.length > 1}
						<!-- left arrow -->
						<button class="hover:scale-125" on:click={() => nextBun()}>
							<img src="/ui/icons/arrow.png" class="w-8" alt="" />
						</button>
						<button on:click={() => toggleSection()}>Buns</button>
						<!-- right arrow -->
						<button on:click={() => prevBun()} class="hover:scale-125">
							<img src="/ui/icons/arrow.png" class="w-8 scale-[-100%]" alt="" />
						</button>
						<!-- if singular bun -->
					{:else}
						<button on:click={() => toggleSection()}>Buns</button>
					{/if}
				</div>
				<!-- buns -->
				<!-- current bun -->
				<div class="flex justify-between items-center space-x-1">
					<!-- bun info -->
				</div>
				<div class="w-full">
					<button in:fade={{ duration: 1000, easing: cubicInOut }} class="relative">
						<img class="w-40 m-auto" src={buns[$b].imageUrl} alt={buns[$b].name} />
						<!-- hunger meter -->
						{#if buns[$b].type === 'Bun'}
							<div class="">
								<Hunger bun={buns[$b]} />
							</div>
						{/if}
					</button>
					<div class="flex flex-col items-center justify-center space-y-1">
						{#if buns[$b].type === 'Egg'}
							<p class="text-sm font-FinkHeavy text-center">
								{buns[$b].name} Egg
							</p>
							<p class="text-xs text-center">
								{buns[$b].rarity}
							</p>
							<HatchEgg />
						{/if}
					</div>
				</div>
				{#if buns[$b].type === 'Bun'}
					<!-- bun wallet -->
					{#if bunBlastMessage}
						<p>{bunBlastMessage}</p>
					{/if}
					<div class="flex relative justify-between w-full px-1 items-center">
						{#if buns[$b].type === 'Bun'}
							<p class="text-xs">{buns[$b].name} #{buns[$b].id}</p>
						{/if}
						<!-- gold balance -->
						<button
							on:mouseenter={() => (showWithdrawGold = true)}
							on:mouseleave={() => (showWithdrawGold = false)}
							on:click={() => withdrawGold()}
							class="hover:bg-slate-100 rounded-full px-2 flex justify-center space-x-1 p-1 w-8"
						>
							{#if showWithdrawGold}
								<img src="/ui/icons/send-red.svg" class="h-4" alt="" />
							{:else}
								<img src="/ui/icons/sankogold.png" class="h-4" alt="" />
								<p class="text-xs">{gold}</p>
							{/if}
						</button>
						{#if showWithdrawGold}
							<p
								class="rounded border-black absolute text-sm bg-white p-2 text-black border-dashed border-2 text- right-0 -bottom-10 z-20 font-FinkHeavy"
							>
								send to wallet
							</p>
						{/if}
					</div>
					<!-- items, fruits, seeds -->
					<div
						class="border-[1px] bg-gray-100 border-gray-400 overflow-y-auto overflow-x-hidden grid gap-0 grid-cols-4 grid-rows-3 w-full"
					>
						{#each allItems as item}
							<button
								on:mouseenter={() => (currentAbility = item.ability)}
								on:mouseleave={() => (currentAbility = undefined)}
								on:click={() => activateAbility(item.name)}
								class="relative border-gray-400 border-[1px] hover:bg-gray-200 flex items-center justify-center"
							>
								<img src={item.imgPath} alt={item.name} class="h-8 w-auto" />
								{#if item.quantity > 1}
									<div
										class="absolute w-3 h-3 top-0 right-0 bg-rose-600 rounded-full text-white flex items-center justify-center text-[0.6rem] text-center font-FinkHeavy"
									>
										<p class="m-auto">
											{item.quantity}
										</p>
									</div>
								{/if}
							</button>
						{/each}

						{#each Array(16 - allItems.length) as _}
							<div class="border-gray-400 border-[1px] hover:bg-gray-200"></div>
						{/each}
					</div>
					{#if currentAbility}
						<div class="w-full">
							<p class="text-left text-xs w-full">{currentAbility}</p>
						</div>
					{/if}
				{/if}
			{/if}
		{/if}
	</div>
</main>

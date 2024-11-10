<!-- lib/components/Abilities.svelte -->
<script lang="ts">
	import {
		autoBuyer,
		autoFeeder,
		autoHarvest,
		autoSeller,
		click2plant,
		type Click2plant,
		farmtek,
		totalFruitHarvested,
		totalFruitsEaten,
		totalFruitsSold,
		totalSeedsBought,
		totalTreesPlanted
	} from '$lib/stores/abilities';
	import { addMessage, farmtekOpen } from '$lib/stores/gameState';
	import { wallet, type Token } from '$lib/stores/wallet';
	import { get } from 'svelte/store';

	// Function to toggle the autoFeederOn store
	function toggleAutoFeeder() {
		autoFeeder.update((feeder) => {
			feeder.enabled = !feeder.enabled;
			return feeder;
		});
	}

	// Function to toggle the autobuyer enabled
	function toggleAutoBuyer() {
		autoBuyer.update((autoBuyer) => {
			autoBuyer.enabled = !autoBuyer.enabled;
			return autoBuyer;
		});
	}

	// Function to toggle the autoSeller enabled
	function toggleAutoSeller() {
		autoSeller.update((autoSeller) => {
			autoSeller.enabled = !autoSeller.enabled;
			return autoSeller;
		});
	}

	// Function to toggle the click2plant store
	function toggleC2P() {
		click2plant.update((c2p) => {
			c2p.enabled = !c2p.enabled;
			return c2p;
		});
	}

	// Function to toggle the autoharvest store
	function toggleAutoHarvest() {
		autoHarvest.update((ah) => {
			ah.enabled = !ah.enabled;
			return ah;
		});
	}

	function buyAutoFeeder() {
		// not sure how much gold this should cost
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= 10) {
				goldToken.balance -= 10;

				// set stores
				autoFeeder.update((feeder) => {
					feeder.purchased = true;
					feeder.enabled = true;
					return feeder;
				});
			}

			addMessage(`bought AUTOFEEDER™️ for 20 GOLD`);
			const audio = new Audio('sounds/purchase.mp3');
			audio.play();
			return wallet;
		});
	}

	$: autoBuyerPrice = ($autoBuyer.level + 1) * (5 * ($autoBuyer.level + 1));

	function buyAutoBuyer() {
		// not sure how much gold this should cost
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= autoBuyerPrice) {
				goldToken.balance -= autoBuyerPrice;

				// set stores
				autoBuyer.update((b) => {
					b.purchased = true;
					b.enabled = true;
					// increase level
					b.level += 1;
					// double selling frequency
					b.rate *= 2;
					return b;
				});
			}

			addMessage(`bought AUTOBUYER™️ for ${autoBuyerPrice} GOLD`);
			const audio = new Audio('sounds/purchase.mp3');
			audio.play();
			return wallet;
		});
	}

	$: autoSellerPrice = ($autoSeller.level + 1) * (5 * ($autoSeller.level + 1));

	function buyAutoSeller() {
		// not sure how much gold this should cost
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= autoSellerPrice) {
				goldToken.balance -= autoSellerPrice;

				// set stores
				autoSeller.update((seller) => {
					seller.purchased = true;
					seller.enabled = true;
					// increase level
					seller.level += 1;
					// double selling frequency
					seller.rate *= 2;
					return seller;
				});
			}

			addMessage(`bought AUTOSELLER™️ for ${autoSellerPrice} GOLD`);
			const audio = new Audio('sounds/purchase.mp3');
			audio.play();
			return wallet;
		});
	}

	$: c2pPrice = ($click2plant.level + 1) * 10;
	function buyClick2Plant() {
		// subtract 20 GOLD from wallet
		// set price based on level
		// Calculate price based on the level
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= c2pPrice) {
				goldToken.balance -= c2pPrice;

				// set click to plant stores to true
				click2plant.update((c2p) => {
					c2p.purchased = true;
					c2p.enabled = true;
					c2p.level += 1;
					return c2p;
				});
			} else {
				addMessage('not enough GOLD');
			}

			addMessage(`enabled click2plant™️  level ${$click2plant.level}`);
			const audio = new Audio('sounds/purchase.mp3');
			audio.play();
			return wallet;
		});
	}

	$: autoHarvestPrice = ($autoHarvest.level + 1) * 10;
	function buyAutoHarvest() {
		wallet.update((wallet) => {
			const goldToken = wallet.tokens.find((token: Token) => token.name === 'GOLD');
			if (goldToken && goldToken.balance >= autoHarvestPrice) {
				goldToken.balance -= autoHarvestPrice;
				autoHarvest.update((ah) => {
					ah.purchased = true;
					ah.enabled = true;
					ah.level += 1;
					return ah;
				});
			}
			addMessage(`enabled autoHARVEST™️  level ${$autoHarvest.level}`);
			const audio = new Audio('sounds/purchase.mp3');
			audio.play();
			return wallet;
		});
	}

	// wallet balance
	// add two more vars for dmt and dmt balance. the exact same but the coin name is DMT
	$: gold = $wallet.tokens.find((token: Token) => token.name === 'GOLD');
	$: goldBalance = gold?.balance ?? 0;

	$: dmt = $wallet.tokens.find((token: Token) => token.name === 'DMT');
	$: dmtBalance = dmt?.balance ?? 0;
	$: santo = $wallet.tokens.find((token: Token) => token.name === 'SANTO');
	$: santoBalance = santo?.balance ?? 0;

	let showFarmtekInfo = false;
	$: farmtekPrice = { dmt: 9.9, santo: 4200000 };

	function buyFarmtek(tokenName: string) {
		wallet.update((wallet) => {
			const token = wallet.tokens.find((t: Token) => t.name === tokenName);
			let price: number;
			if (tokenName === 'DMT') {
				price = farmtekPrice.dmt;
			} else if (tokenName === 'SANTO') {
				price = farmtekPrice.santo;
			} else {
				return wallet;
			}
			if (token && token.balance >= price) {
				token.balance -= price;
				farmtek.update((ft) => {
					ft.purchased = true;
					ft.enabled = true;
					return ft;
				});
				addMessage(`minted 1 FARMTEK disc for ${price} ${tokenName}`);
				const audio = new Audio('sounds/purchase.mp3');
				audio.play();
			}
			return wallet;
		});
	}

	$: showAll = true;
	// if show all is true then set everything to true
	$: showFarmtek = $autoHarvest.level >= 2 && $click2plant.level >= 2;
	$: showAutoFeeder = $totalFruitsEaten >= 10;
	$: showAutoSeller = $totalFruitsSold >= 50;
	$: showAutoBuyer = $totalSeedsBought >= 50;
	$: showClick2Plant = $totalTreesPlanted >= 10;
	$: showAutoHarvester = $totalFruitHarvested >= 25;

	// Calculate if there are any upgrades to show
	$: showUpgrades =
		showFarmtek ||
		showAutoFeeder ||
		showAutoSeller ||
		showClick2Plant ||
		showAutoHarvester ||
		showAutoBuyer;

	function handleOpenFarmtek() {
		if ($farmtek.purchased) {
			farmtekOpen.set(true);
		} else {
			addMessage(`No disc detected. Please purchase disc.`);
		}
	}
</script>

{#if showUpgrades}
	<h1 class="font-mono text-center text-xl">Upgrades</h1>
{/if}
<main class="flex flex-col space-y-1 w-40 h-96 overflow-y-auto overflow-x-hidden">
	{#if showFarmtek}
		<button
			on:mouseenter={() => (showFarmtekInfo = true)}
			on:mouseleave={() => (showFarmtekInfo = false)}
			class="w-full relative"
		>
			{#if !$farmtek.purchased}
				{#if showFarmtekInfo}
					<div
						class="z-50 p-2 flex flex-col justify-around space-y-1 absolute items-center w-full h-full bg-black bg-opacity-100"
					>
						<div class="">
							<p class="font-black font-sans -tracking-wide text-2xl text-lime-700 leading-4">
								FARMTEK
							</p>
							<p class="font-sans -tracking-wide text-sm text-yellow-500">by Bunsanto©️</p>
						</div>
						<div class="text-white flex items-center justify-around space-x-1">
							<button
								on:click={() => buyFarmtek('DMT')}
								disabled={dmtBalance < farmtekPrice.dmt}
								class="hover:text-lime-400 disabled:cursor-not-allowed rounded-full px-1 flex items-center space-x-1"
							>
								<img src="/ui/icons/dmt.png" class="w-5" alt="" />
								<p class="font-FinkHeavy text-md">9.9</p>
							</button>
							<p class="font-FinkHeavy text-md">/</p>
							<button
								on:click={() => buyFarmtek('SANTO')}
								disabled={santoBalance < farmtekPrice.santo}
								class="hover:text-lime-400 disabled:cursor-not-allowed rounded-full px-1 flex items-center space-x-1"
							>
								<img src="/ui/icons/bunsanto.webp" class="w-5 rounded-full" alt="" />
								<p class="font-FinkHeavy text-sm">4.2M</p>
							</button>
						</div>
						<p class="font-mono text-xs px-2 -tracking-wider text-white leading-4">
							p2p automated farming protocol
						</p>
					</div>
				{/if}
			{/if}
			<button>
				<img
					class="w-40 h-auto {!$farmtek.purchased &&
					dmtBalance < farmtekPrice.dmt &&
					santoBalance < farmtekPrice.santo
						? 'filter grayscale'
						: 'grayscale-0'}"
					src="/images/tools/farmtek-disc.png"
					alt=""
				/>
			</button>
		</button>
		<button
			class="m-auto w-[95%] hover:bg-teal-600 hover:text-white hover:border-teal-800 border-black border-[1px] text-black p-2 px-4 font-MS text-xs"
			on:click={() => handleOpenFarmtek()}>Insert Farmtek disc</button
		>
	{/if}
	<!-- auto feeder -->
	{#if showAutoFeeder}
		{#if !$autoFeeder.purchased}
			<button
				disabled={goldBalance < 10}
				on:click={() => buyAutoFeeder()}
				class="hover:bg-sky-400 disabled:bg-gray-400 bg-sky-500 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">autoFeeder</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">10</p>
					</div>
				</div>
				<p class="text-left">Feeds your Bun so you can worry about more important things.</p>
			</button>
		{/if}
		{#if $autoFeeder.purchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>Auto Feeder</p>
				<!-- Button to toggle the autoFeederOn store value -->
				<button
					class="{$autoFeeder.enabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleAutoFeeder}
				>
					{#if $autoFeeder.enabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
	{/if}
	<!-- auto Buyer -->
	{#if showAutoBuyer}
		{#if !$autoBuyer.purchased}
			<button
				disabled={goldBalance < autoBuyerPrice}
				on:click={() => buyAutoBuyer()}
				class="disabled:bg-gray-400 bg-sky-500 hover:bg-sky-400 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">autoBuyer</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{autoBuyerPrice}</p>
					</div>
				</div>
				<p class="text-left">Buys seeds for you</p>
			</button>
		{/if}
		{#if $autoBuyer.purchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>Auto Buyer</p>
				<button
					class="{$autoBuyer.enabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleAutoBuyer}
				>
					{#if $autoBuyer.enabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
		{#if $autoBuyer.level >= 1}
			<button
				disabled={goldBalance < autoBuyerPrice}
				on:click={() => buyAutoBuyer()}
				class="-translate-y-3 disabled:bg-gray-400 hover:bg-sky-400 bg-sky-500 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">level {$autoBuyer.level + 1}</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{autoBuyerPrice}</p>
					</div>
				</div>
				<p class="text-left">increase auto buy rate</p>
			</button>
		{/if}
	{/if}
	<!-- auto Seller -->
	{#if showAutoSeller}
		{#if !$autoSeller.purchased}
			<button
				disabled={goldBalance < autoSellerPrice}
				on:click={() => buyAutoSeller()}
				class="disabled:bg-gray-400 bg-sky-500 hover:bg-sky-400 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">autoSeller</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{autoSellerPrice}</p>
					</div>
				</div>
				<p class="text-left">Sells fruit for you</p>
			</button>
		{/if}
		{#if $autoSeller.purchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>Auto Seller</p>
				<button
					class="{$autoSeller.enabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleAutoSeller}
				>
					{#if $autoSeller.enabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
		{#if $autoSeller.level >= 1}
			<button
				disabled={goldBalance < autoSellerPrice}
				on:click={() => buyAutoSeller()}
				class="-translate-y-3 disabled:bg-gray-400 hover:bg-sky-400 bg-sky-500 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">level {$autoSeller.level + 1}</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{autoSellerPrice}</p>
					</div>
				</div>
				<p class="text-left">increase auto sell rate</p>
			</button>
		{/if}
	{/if}

	<!-- one click planting -->
	<!-- shows up once user plants 10 trees -->
	{#if showClick2Plant}
		<!-- if not purchased yet -->
		{#if !$click2plant.purchased}
			<button
				disabled={goldBalance < c2pPrice}
				on:click={() => buyClick2Plant()}
				class="disabled:bg-gray-400 bg-sky-500 hover:bg-sky-400 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">click2plant</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{c2pPrice}</p>
					</div>
				</div>
				<p class="text-left">Plants seeds with one less click</p>
			</button>
		{/if}
		{#if $click2plant.purchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>click2plant</p>
				<!-- Button to toggle the autoFeederOn store value -->
				<button
					class="{$click2plant.enabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleC2P}
				>
					{#if $click2plant.enabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
		{#if $click2plant.level === 1}
			<button
				disabled={goldBalance < c2pPrice}
				on:click={() => buyClick2Plant()}
				class="-translate-y-3 disabled:bg-gray-400 hover:bg-sky-400 bg-sky-500 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">level 2</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{c2pPrice}</p>
					</div>
				</div>
				<p class="text-left">Plants seeds with one less click</p>
			</button>
		{/if}
	{/if}

	<!-- auto harvest -->
	{#if showAutoHarvester}
		<!-- if not purchased yet -->
		{#if !$autoHarvest.purchased}
			<button
				disabled={goldBalance < autoHarvestPrice}
				on:click={() => buyAutoHarvest()}
				class="disabled:bg-gray-400 hover:bg-sky-400 bg-sky-500 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">autoHARVEST™️</p>
					<div class="absolute px-1 top-1 right-1 flex items-center space-x-1">
						<img src="/ui/icons/sankogold.png" class="w-4" alt="" />
						<p class="font-FinkHeavy text-sm text-yellow-300">{autoHarvestPrice}</p>
					</div>
				</div>
				<p class="text-left">select plot to harvest fruit</p>
			</button>
		{/if}
		{#if $autoHarvest.purchased}
			<div class="text-xs border-2 border-black p-2 flex justify-between relative">
				<p>autoHARVEST™️</p>
				<!-- Button to toggle the autoFeederOn store value -->
				<button
					class="{$autoHarvest.enabled
						? 'bg-lime-400'
						: 'bg-red-400'} h-full w-12 absolute right-0 top-0"
					on:click={toggleAutoHarvest}
				>
					{#if $autoHarvest.enabled}
						On
					{:else}
						Off
					{/if}
				</button>
			</div>
		{/if}
		{#if $autoHarvest.level === 1}
			<button
				disabled={goldBalance < autoHarvestPrice}
				on:click={() => buyAutoHarvest()}
				class="-translate-y-3 disabled:bg-gray-400 hover:bg-sky-400 bg-sky-500 text-xs border-2 border-black p-2 flex flex-col justify-between relative space-y-1"
			>
				<div class="flex justify-between w-full">
					<p class="text-white">level 2</p>
					<p class="text-amber-300">{autoHarvestPrice} GOLD</p>
				</div>
				<p class="text-left">harvest fruit automatically</p>
			</button>
		{/if}
	{/if}
</main>

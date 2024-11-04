<script lang="ts">
	import { addMessage, farmtekOpen } from '$lib/stores/gameState';
	import { wallet, type Bun, type Plot, type Item } from '$lib/stores/wallet';

	$: buns = $wallet.nfts.filter((nft: Bun) => nft.type === 'Bun') ?? [];

	// Calculate remaining time functions
	function getNextHarvestTime(plot: Plot): string {
		if (!plot.plantedAt) return 'N/A';
		const harvestTime = new Date(plot.plantedAt + 5 * 60 * 1000); // Assuming 5 minutes to harvest
		return harvestTime.toLocaleString();
	}

	function getFinalHarvestTime(plot: Plot): string {
		if (!plot.plantedAt) return 'N/A';
		const finalHarvestTime = new Date(
			plot.plantedAt + (plot.fruitRemaining || 0) * (5 * 60 * 1000)
		);
		return finalHarvestTime.toLocaleString();
	}

	function harvestAll(bun: Bun) {
		wallet.update((w) => {
			const bunIndex = w.nfts.findIndex((nft) => nft.id === bun.id);
			if (bunIndex === -1) return w;

			const plots = w.nfts[bunIndex].farm;
			let harvestedCount = 0;

			plots.forEach((plot, plotIndex) => {
				if (plot.fruitsReady && plot.fruitsReady > 0) {
					harvestedCount += plot.fruitsReady;
					const fruit = w.nfts[bunIndex].wallet.items.find(
						(item) => item.type === 'fruit' && item.fruitType === plot.type
					);
					if (fruit) {
						fruit.quantity += plot.fruitsReady;
					}
					// reset plot when all fruits are harvested
					if (plot.fruitRemaining === plot.fruitsReady) {
						plots[plotIndex] = { state: 'empty', isWithered: false };
					} else {
						plot.fruitRemaining -= plot.fruitsReady;
						plot.fruitsReady = 0;
					}
				}
			});

			if (harvestedCount > 0) {
				addMessage(`Harvested ${harvestedCount} from ${bun.name}`);
			}

			return w;
		});
	}

	function sellFruit(bun: Bun) {
		// Implementation for selling fruit
		addMessage('Selling fruit not implemented yet');
	}

	function buySeeds(bun: Bun) {
		// Implementation for buying seeds
		addMessage('Buying seeds not implemented yet');
	}

	function plantSeeds(bun: Bun) {
		// Implementation for planting seeds
		addMessage('Planting seeds not implemented yet');
	}

	function feedBun(bun: Bun) {
		// Implementation for feeding bun
		addMessage('Feeding bun not implemented yet');
	}

	function handleCloseFarmtek() {
		farmtekOpen.set(false);
	}

	let bunCard: { show: boolean; id: number };
	function showBunCard(bunId: number) {
		bunCard = { show: true, id: bunId };
	}
	function hideBunCard() {
		bunCard = { show: false, id: 999999 };
	}
</script>

<main class="h-screen w-screen bg-teal-600 fixed top-0 left-0 z-50">
	<div class="win95-window bg-gray-200 w-[90vw] h-[50vh] m-auto">
		<!-- Title bar -->
		<div class="flex justify-between win95-title-bar p-1 bg-gradient-to-r from-blue-950 to-sky-600">
			<h1 class="font-MS text-white text-sm">Bunsanto FarmTek v2.0</h1>
			<button class="win95-button" on:click={() => handleCloseFarmtek()}>X</button>
		</div>

		<!-- Table Header -->
		<div class="overflow-auto p-2 h-[calc(90vh-2rem)]">
			<table class="w-full text-sm font-MS">
				<thead>
					<tr class="bg-gray-200 font-MS-Bold">
						<th class="p-1 border border-gray-400 text-left">Bun ID</th>
						<th class="p-1 border border-gray-400 text-left">Planted</th>
						<th class="p-1 border border-gray-400 text-left">Remaining</th>
						<th class="p-1 border border-gray-400 text-left">Next Harvest</th>
						<th class="p-1 border border-gray-400 text-left">Final Harvest</th>
						<th class="p-1 border border-gray-400 text-left">Harvestable</th>
						<th class="p-1 border border-gray-400 text-left">Hibernation</th>
						<th class="p-1 border border-gray-400 text-left">Harvest</th>
						<th class="p-1 border border-gray-400 text-left">Sell Amount</th>
						<th class="p-1 border border-gray-400 text-left">Sell Fruit</th>
						<th class="p-1 border border-gray-400 text-left">Gold Balance</th>
						<th class="p-1 border border-gray-400 text-left">Seed Amount</th>
						<th class="p-1 border border-gray-400 text-left">Buy Seeds</th>
						<th class="p-1 border border-gray-400 text-left">Seed to plant</th>
						<th class="p-1 border border-gray-400 text-left">Plant</th>
						<th class="p-1 border border-gray-400 text-left">Feed Bun</th>
					</tr>
				</thead>
				<tbody>
					{#each buns as bun}
						<tr class="bg-gray-100 hover:bg-gray-200">
							<td class="relative p-1 border border-gray-400">
								<button
									on:mouseenter={() => showBunCard(bun.id)}
									on:mouseleave={() => hideBunCard()}
									class="underline"
								>
									{bun.id}
								</button>
								{#if bunCard && bunCard.id === bun.id}
									<div class="w-24 h-32 absolute left-8 top-1/2 -translate-y-1/2 p-2 border-black border-[1px] bg-zinc-200 flex flex-col justify-between">
										<img src={bun.imageUrl} alt={bun.name} />
										<p class="text-center">{bun.name}</p>
									</div>
								{/if}
							</td>
							<td class="p-1 border border-gray-400">
								{bun.farm.filter((plot) => plot.state === 'planted').length}
							</td>
							<td class="p-1 border border-gray-400">
								{bun.farm.reduce((sum, plot) => sum + (plot.fruitRemaining || 0), 0)}
							</td>
							<td class="p-1 border border-gray-400">
								{new Date().toLocaleString()}
							</td>
							<td class="p-1 border border-gray-400">
								{new Date().toLocaleString()}
							</td>
							<td class="p-1 border border-gray-400">
								{bun.farm.reduce((sum, plot) => sum + (plot.fruitsReady || 0), 0)}
							</td>
							<td class="p-1 border border-gray-400">
								{new Date().toLocaleString()}
							</td>
							<td class="p-1 border border-gray-400">
								<button class="win95-button w-full" on:click={() => harvestAll(bun)}>
									Harvest All
								</button>
							</td>
							<td class="p-1 border border-gray-400">
								<input type="number" class="w-16 win95-input" min="1" value="1" />
							</td>
							<td class="p-1 border border-gray-400">
								<button class="win95-button w-full" on:click={() => sellFruit(bun)}>
									Sell Fruit
								</button>
							</td>
							<td class="p-1 border border-gray-400">
								{bun.wallet.gold}
							</td>
							<td class="p-1 border border-gray-400">
								<input type="number" class="w-16 win95-input" min="1" value="1" />
							</td>
							<td class="p-1 border border-gray-400">
								<button class="win95-button w-full" on:click={() => buySeeds(bun)}> Buy </button>
							</td>
							<td class="p-1 border border-gray-400">
								<select class="win95-select w-full">
									<option value="">Select Seed</option>
									{#each bun.wallet.items.filter((item) => item.type === 'seed' || item.type === 'witheredSeed') as seed}
										<option value={seed.name}>{seed.name}</option>
									{/each}
								</select>
							</td>
							<td class="p-1 border border-gray-400">
								<button class="win95-button w-full" on:click={() => plantSeeds(bun)}>
									Plant
								</button>
							</td>
							<td class="p-1 border border-gray-400">
								<button class="win95-button w-full" on:click={() => feedBun(bun)}>
									Feed Bun
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</main>

<style>
	.win95-window {
		border: 2px solid;
		border-right-color: #404040;
		border-bottom-color: #404040;
		border-left-color: #fff;
		border-top-color: #fff;
		background: #c0c0c0;
	}

	.win95-button {
		border: 2px solid;
		border-right-color: #404040;
		border-bottom-color: #404040;
		border-left-color: #fff;
		border-top-color: #fff;
		background: #c0c0c0;
		padding: 2px 6px;
		font-size: 11px;
	}

	.win95-button:active {
		border-right-color: #fff;
		border-bottom-color: #fff;
		border-left-color: #404040;
		border-top-color: #404040;
	}

	.win95-input,
	.win95-select {
		border: 2px solid;
		border-right-color: #fff;
		border-bottom-color: #fff;
		border-left-color: #404040;
		border-top-color: #404040;
		background: #fff;
		font-size: 11px;
	}
</style>

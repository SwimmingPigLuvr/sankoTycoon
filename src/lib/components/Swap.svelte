<script lang="ts">
	import { swapModalOpen } from '$lib/stores/gameState';
	import { truncateEthAddress, wallet, type Token } from '$lib/stores/wallet';
	import { dmt, gold, himgo, poop, santo, smoke, star, sp } from '$lib/tokenData';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	// main wallet
	// set a price for each coin in DMT
	// swap... it's that easy

	function handleOutsideClicks() {
		swapModalOpen.set(false);
	}

	const tokensList: Token[] = [gold, dmt, santo, poop, smoke, himgo, star, sp];
	const yourTokens: Token[] = $wallet?.tokens;

	let from: Token | null = dmt;
	let to: Token | null;

	let fromAmount: number = 0;
	let toAmount: number = 0;

	$: fromTokenWallet = $wallet?.tokens.find((token) => from?.name === token?.name);
	$: toTokenWallet = $wallet?.tokens.find((token) => to?.name === token?.name);

	let isTokenListOpen = true;
	let selectFor: 'to' | 'from' = 'from';

	$: {
		if (from && to && fromAmount > 0) {
			const fromTokenPrice = from.price || 0;
			const toTokenPrice = to.price || 1;
			toAmount = (fromAmount * fromTokenPrice) / toTokenPrice;
		} else {
			toAmount = 0;
		}
	}

	function setMax(toOrFrom: 'to' | 'from') {
		if (to && toOrFrom === 'to') {
			to = { ...to, balance: toTokenWallet?.balance || 0 };
		} else if (from && toOrFrom === 'from') {
			from = { ...from, balance: fromTokenWallet?.balance || 0 };
		}
	}

	function handleSwitch() {
		const tempFrom = from;
		from = to;
		to = tempFrom;
	}

	function handleOpenTokenList(toOrFrom: 'to' | 'from') {
		isTokenListOpen = true;
		selectFor = toOrFrom;
	}

	function selectToken(token: Token) {
		if (selectFor === 'to' && from !== token) {
			to = token;
		} else if (selectFor === 'from' && to !== token) {
			from = token;
		}
		isTokenListOpen = false;
	}

	// use this function to approximate usd value
	function getUsdValue(token: Token): number {
		return (token.balance || 0) * (token.price || 0) * 50;
	}

	function swapTokens() {
		if (!from || !to) return;
		const amountToSwap = fromAmount;
		const amountToReceive = toAmount;
		wallet.update((currentWallet) => {
			if (!to) {
				return currentWallet;
			}

			const fromTokenWallet = currentWallet.tokens.find((token) => token.name === from?.name);
			const toTokenWallet = currentWallet.tokens.find((token) => token.name === to?.name);

			// Check if from token exists and has enough balance
			if (fromTokenWallet && fromTokenWallet.balance >= amountToSwap && amountToSwap > 0) {
				// subtract
				fromTokenWallet.balance -= amountToSwap;

				// add
				if (toTokenWallet) {
					toTokenWallet.balance += amountToReceive;
				} else {
					// add token object if nonexistent
					currentWallet.tokens.push({ ...to, balance: amountToReceive });
				}

				// reset input
				fromAmount = 0;
			}

			const newToken: Token = {
				address: to.address,
				iconUrl: to.iconUrl,
				name: to.name,
				price: to.price,
				ticker: to.ticker,
				balance: to.balance
			};

			currentWallet.tokens.push(newToken);

			return currentWallet;
		});
	}

	// put this coins in the trending tokens list
	let recentActivity: Token[] = [gold, sp];
</script>

<button on:click|preventDefault={handleOutsideClicks} class="bg-red-400 w-screen h-screen">
	<!-- modal -->
	<button
		on:click|stopPropagation
		class="modal fixed flex flex-col p-2 left-1/2 top-40 -translate-x-1/2 w-[420px] h-[420px] bg-white border-opacity-50 border-white border-[5px] rounded-lg"
	>
		<h2 class="text-center w-full py-4">Swap</h2>

		<!-- from -->
		<div class="mt-4 rounded border-[1px] border-blue-700 w-full p-1 flex flex-col space-y-1">
			<div class="p-1 text-xs flex w-full justify-between">
				<span>From</span>
				{#if from}
					<span class="px-2">Balance: {fromTokenWallet?.balance || 0}</span>
				{:else}
					<span class="px-2">-</span>
				{/if}
			</div>
			<div class="p-1 flex items-center text-xl justify-between">
				<input class="w-fit" type="number" bind:value={fromAmount} min="0" />
				<div class="flex h-8 space-x-2">
					{#if from && fromTokenWallet && from.balance < fromTokenWallet?.balance}
						<button
							on:click={() => setMax('from')}
							class="px-2 rounded-lg bg-lime-200 text-lime-600 border-lime-300 hover:border-lime-600 border-[1px]"
							>MAX</button
						>
					{/if}
					<button
						on:click={() => handleOpenTokenList('from')}
						class="px-2 h-8 p-1 rounded hover:bg-indigo-50 flex items-center space-x-2"
					>
						{#if from}
							<img class="w-6 h-6" src={from.iconUrl} alt="" />
							<span>{from.ticker}</span>
						{:else}
							<span class="text-xs">Select a Token</span>
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- switch -->
		<button
			on:click={() => handleSwitch()}
			class="hover:scale-y-[-1] hover:filter hover:hue-rotate-90 py-4 w-10 mx-auto">⬇️</button
		>

		<!-- to -->
		<div class="rounded border-[1px] border-blue-700 w-full p-1 flex flex-col space-y-1">
			<div class="p-1 text-xs flex w-full justify-between">
				<span>To</span>
				{#if to}
					<span class="px-2">Balance: {toTokenWallet?.balance || 0}</span>
				{:else}
					<span class="px-2">-</span>
				{/if}
			</div>
			<div class="p-1 flex items-center text-2xl justify-between">
				<input class="w-[80%]" type="number" bind:value={toAmount} disabled />
				<button
					on:click={() => handleOpenTokenList('to')}
					class="px-2 h-8 p-1 rounded hover:bg-indigo-50 flex items-center space-x-2"
				>
					{#if to}
						<img class="w-6 h-6" src={to.iconUrl} alt="" />
						<span>{to.ticker}</span>
					{:else}
						<span class="text-xs">Select a Token</span>
					{/if}
				</button>
			</div>
		</div>
		<button
			disabled={!to || !from}
			on:click={() => swapTokens()}
			class="disabled:cursor-not-allowed absolute bottom-2 left-1/2 -translate-x-1/2 swap-button text-white p-4 rounded w-[97%]"
		>
			{#if !to || !from}
				Select a Token
			{:else}
				Swap
			{/if}
		</button>
	</button>
	<!-- token list modal -->
	{#if isTokenListOpen}
		<button
			in:fade={{ duration: 200, easing: cubicInOut }}
			out:fade={{ duration: 200, easing: cubicInOut }}
			on:click|stopPropagation={() => (isTokenListOpen = false)}
			class="fixed bg-red-400 top-0 left-0 w-screen h-screen"
		>
			<button
				on:click|stopPropagation
				class="modal fixed flex flex-col left-1/2 top-24 -translate-x-1/2 w-[420px] h-[765px] bg-white rounded-lg"
			>
				<!-- top section -->
				<div class="flex flex-col w-full p-4 space-y-3">
					<div class="flex justify-between w-full items-center">
						<span class="text-blue-700">Select a token</span>
						<button
							on:click={() => (isTokenListOpen = false)}
							class="scale-w-150 scale-y-90 text-xl text-blue-700">x</button
						>
					</div>
					<input
						class="border-[1px] border-blue-700 focus:border-lime-400 p-3 rounded-lg"
						placeholder="Search name or address"
						type="text"
					/>
				</div>

				<hr class="w-full border-blue-500" />
				<div class="overflow-y-auto overflow-x-hidden w-full pt-6">
					<!-- your tokens -->
					<span class="p-4 text-left text-blue-400">Your tokens</span>
					<div class="flex flex-col w-full">
						{#each yourTokens as token}
							{#if token.balance > 0}
								<button
									disabled={to === token || from === token}
									on:click={() => selectToken(token)}
									class="disabled:bg-gray-50 disabled:cursor-not-allowed disabled:filter disabled:grayscale hover:bg-blue-50 p-3 px-6 w-full items-center flex space-x-4"
								>
									<img src={token.iconUrl} class="w-[2rem] h-[2rem] rounded-full" alt="" />
									<div class="flex flex-col space-y-1 flex-grow">
										<span class="text-left text-blue-500 font-black -tracking-wider"
											>{token.name}</span
										>
										<div class="flex text-xs space-x-2">
											<span class="text-blue-500">{token.ticker}</span>
											<span class="text-blue-300">{truncateEthAddress(token.address)}</span>
										</div>
									</div>
									<div class="flex flex-col text-right space-y-1 h-full ml-auto">
										<span class="text-blue-700"
											>{$wallet.tokens.find((t) => t.ticker === token.ticker)?.balance}</span
										>
										<span class="text-xs text-blue-300">${getUsdValue(token)}</span>
									</div>
								</button>
							{/if}
						{/each}
						<!-- all tokens -->
						<span class="p-4 text-left text-blue-400">All tokens</span>
						<div class="flex flex-col w-full">
							{#each tokensList as token}
								<button
									disabled={to === token || from === token}
									on:click={() => selectToken(token)}
									class="disabled:bg-gray-50 disabled:cursor-not-allowed disabled:filter disabled:grayscale hover:bg-blue-50 p-3 px-6 w-full items-center flex space-x-4"
								>
									<img src={token.iconUrl} class="w-[2rem] h-[2rem] rounded-full" alt="" />
									<div class="flex flex-col space-y-1 flex-grow">
										<span class="text-left text-blue-500 font-black -tracking-wider"
											>{token.name}</span
										>
										<div class="flex text-xs space-x-2">
											<span class="text-blue-500">{token.ticker}</span>
											<span class="text-blue-300">{truncateEthAddress(token.address)}</span>
										</div>
									</div>
									<!-- if recent activity, show price change in percent, show MC -->
									{#if recentActivity.includes(token)}
										<div class="flex flex-col text-right space-y-1 h-full ml-auto">
											<span class="text-lime-400">25.15%</span>
											<span class="text-xs text-blue-300">$3.1M MC</span>
										</div>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</button>
		</button>
	{/if}
</button>

<style>
	/* Apply a lime glow around the modal */
	.modal {
		box-shadow: 0 0 150px 10px rgba(200, 200, 255, 1); /* Adjusted the color to lime and modified the shadow size */
	}
	.swap-button {
		background-color: rgba(100, 100, 255);
	}

	.swap-button:disabled {
		background-color: rgba(200, 200, 200);
	}
</style>

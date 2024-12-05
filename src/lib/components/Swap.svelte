<script lang="ts">
	import { swapModalOpen } from '$lib/stores/gameState';
	import { wallet, type Token } from '$lib/stores/wallet';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	// main wallet
	// set a price for each coin in DMT
	// swap... it's that easy

	function handleOutsideClicks() {
		swapModalOpen.set(false);
	}

	const gold: Token = {
		name: 'Sanko Gold',
		ticker: 'GOLD',
		balance: 0,
		iconUrl: 'ui/icons/sankogold.png',
		price: 0.01,
		address: '0xD2A35b0EA0e99b9f8cA247C86B08De35Ee5D3Bf6'
	};

	const dmt: Token = {
		name: 'Dream Machine Token',
		ticker: 'DMT',
		balance: 0,
		iconUrl: 'ui/icons/dmt.png',
		price: 1,
		address: '0xD2A35b0EA0e99b9f8cA247C86B08De35Ee5D3Bf6'
	};

	const santo: Token = {
		name: 'SANTO',
		balance: 0,
		iconUrl: '/ui/icons/bunsanto.webp',
		price: 0.00001
	};

	const tokensList: Token[] = [gold, dmt, santo];
	const yourTokens: Token[] = $wallet?.tokens;

	let from: Token | null = dmt;
	let to: Token | null;

	$: fromTokenWallet = $wallet?.tokens.find((token) => from?.name === token?.name);
	$: toTokenWallet = $wallet?.tokens.find((token) => to?.name === token?.name);

	let isTokenListOpen = true;
	let selectFor: 'to' | 'from' = 'from';

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
				<input class="w-20" type="number" value={from?.balance || 0} />
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
							<span>{from.name}</span>
						{:else}
							<span class="text-xs">Select a Token</span>
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- switch -->
		<button on:click={() => handleSwitch()} class="py-4 w-10 mx-auto">⬇️</button>

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
				<input class="w-20" type="number" value={to?.balance || 0} />
				<button class="px-2 h-8 p-1 rounded hover:bg-indigo-50 flex items-center space-x-2">
					{#if to}
						<img class="w-6 h-6" src={to.iconUrl} alt="" />
						<span>{to.name}</span>
					{:else}
						<span class="text-xs">Select a Token</span>
					{/if}
				</button>
			</div>
		</div>
		<button
			disabled={!to || !from}
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
						<span>Select a token</span>
						<button
							on:click={() => (isTokenListOpen = false)}
							class="scale-w-150 scale-y-90 text-xl">x</button
						>
					</div>
					<input
						class="border-[1px] border-blue-700 focus:border-lime-400 p-3 rounded-lg"
						placeholder="Search name or address"
						type="text"
					/>
				</div>

				<hr class="w-full border-blue-500" />
				<!-- your tokens -->
				<span class="p-4 text-left text-blue-400">Your Tokens</span>
				<div class="flex flex-col w-full">
					{#each yourTokens as token}
						<div class="hover:bg-blue-50 p-3 px-6 w-full flex space-x-4">
							<img src={token.iconUrl} class="w-[2.1rem] rounded-full" alt="" />
							<div class="flex flex-col">
								<span>{token.name}</span>
								<div class="flex space-x-2">
									<span>{token.ticker}</span>
									<span>{token.address}</span>
								</div>
							</div>
						</div>
					{/each}
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

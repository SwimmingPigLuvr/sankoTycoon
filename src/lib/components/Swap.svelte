<script lang="ts">
	import { swapModalOpen } from '$lib/stores/gameState';
	import { wallet, type Token } from '$lib/stores/wallet';

	// main wallet
	// set a price for each coin in DMT
	// swap... it's that easy

	function handleOutsideClicks() {
		swapModalOpen.set(false);
	}

	//		swap
	// from		balance
	// amount	tokenX V
	//		 V
	// to		balance
	// amount	tokenY V
	// price	z tokenX per 1 tokenY
	//		swap

	let from: Token | null = {
		name: 'DMT',
		balance: 0,
		iconUrl: 'ui/icons/dmt.png'
	};
	let to: Token | null;

	$: fromTokenWallet = $wallet?.tokens.find((token) => from?.name === token?.name);
	$: toTokenWallet = $wallet?.tokens.find((token) => to?.name === token?.name);

	function setMax(toOrFrom: 'to' | 'from') {
		if (to && toOrFrom === 'to') {
			to = { ...to, balance: toTokenWallet?.balance || 0 };
		} else if (from && toOrFrom === 'from') {
			from = { ...from, balance: fromTokenWallet?.balance || 0 };
		}
	}
</script>

<button on:click|preventDefault={handleOutsideClicks} class="bg-blue-950 w-screen h-screen">
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
					{#if from && from.balance === 0}
						<button
							on:click={() => setMax('from')}
							class="px-2 rounded-lg bg-lime-200 text-lime-600 border-lime-300 hover:border-lime-600 border-[1px]"
							>MAX</button
						>
					{/if}
					<button class="px-2 h-8 p-1 rounded hover:bg-indigo-50 flex items-center space-x-2">
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

		<!-- reverse -->
		<button class="py-4 w-10 mx-auto">⬇️</button>

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
				<input class="w-10" type="number" value={to?.balance || 0} />
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

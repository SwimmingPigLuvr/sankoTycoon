<!-- lib/components/Wallet.svelte -->
<script lang="ts">
	import { wallet } from '../stores/wallet';
	import type { Token, Bun, Wallet } from '../stores/wallet';
	import BunWallet from './BunWallet.svelte';
	$: network = $wallet?.network;
	let tokens: Token[] = [];
	let nfts: Bun[] = [];
	$: tokens = $wallet?.tokens ?? [];
	$: nfts = $wallet?.nfts ?? [];
	let showBunWallet = false;

	function openWallet() {
		showBunWallet = true;
	}
</script>

<main class="bg-sky-300 space-y-1 tracking-normal text-center w-40 flex flex-col items-center">
	<h1>Wallet</h1>
	<p class="text-sm">{$wallet?.walletAddress}</p>
	<hr class="w-full border-black bg-black" />
	<p>ntwrk: {network}</p>
	{#each tokens as token}
		<p class="text-3xl">{token.balance} {token.name}</p>
	{/each}
	<hr class="w-full border-black bg-black" />
	<h1>Buns</h1>
	<div class="flex flex-wrap">
		{#each nfts as nft}
			<div class="w-full flex bg-lime-200">
				<!-- bun -->
				<div class="bg-red-200 w-1/3">
					<button on:click={() => openWallet()}>
						<img class="m-auto" src={nft.imageUrl} alt={nft.name} />
					</button>
					<p class="text-xs">
						{#if nft.type === 'Egg'}
							{nft.rarity} Egg
						{/if}
					</p>
					{#if nft.type === 'Bun'}
						<p class="text-xs">{nft.name} #{nft.id}</p>
					{/if}
				</div>
				<!-- bun wallet -->
				<BunWallet bun={nft} />
			</div>
		{/each}
	</div>
</main>

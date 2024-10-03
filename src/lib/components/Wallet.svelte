<!-- lib/components/Wallet.svelte -->
<script lang="ts">
	import { wallet } from '../stores/wallet';
	import type { Token, Bun, Wallet } from '../stores/wallet';
	$: network = $wallet?.network;
	let tokens: Token[] = [];
	let nfts: Bun[] = [];
	$: tokens = $wallet?.tokens ?? [];
	$: nfts = $wallet?.nfts ?? [];
</script>

<main class="space-y-1 tracking-normal text-center w-40 flex flex-col items-center">
	<h1>Wallet</h1>
	<p class="text-sm">{$wallet?.walletAddress}</p>
	<hr class="w-full border-black bg-black" />
	<p>ntwrk: {network}</p>
	{#each tokens as token}
		<p class="text-3xl">{token.balance} {token.name}</p>
	{/each}
	{#each nfts as nft}
		<p>{nft.rarity}</p>
		<p>{nft.name} {nft.id}</p>
	{/each}
</main>

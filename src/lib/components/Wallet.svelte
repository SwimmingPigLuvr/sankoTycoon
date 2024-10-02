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

<main class="text-center w-40 flex flex-col items-center">
	<h1>Wallet</h1>
	<hr class="w-20 border-white bg-black" />
	<p>network {network}</p>
	{#each tokens as token}
		<p class="text-3xl">{token.balance} {token.name}</p>
	{/each}
	{#each nfts as nft}
		<p>{nft.name}</p>
	{/each}
</main>

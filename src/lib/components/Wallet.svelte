<!-- lib/components/Wallet.svelte -->
<script>
	import { wallet } from '../stores/wallet';
	let chain = 'Arbitrum';

	$: tokens = $wallet.tokens;
</script>

<main>
	<p>network: {chain}</p>
	{#each tokens as token}
		<p class="text-3xl">{token.name}: {token.balance}</p>
	{/each}
</main>

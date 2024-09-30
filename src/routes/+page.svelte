<script>
	import Bridge from '../lib/components/Bridge.svelte';
	import HeaderTerminal from '../lib/components/HeaderTerminal.svelte';
	import Wallet from '../lib/components/Wallet.svelte';
	import GameClock from '../lib/components/GameClock.svelte';

</script>

<main class="p-2 font-mono -tracking-widest">
	<h1 class="w-full text-right fixed bottom-2 right-2">Sanko Tycoon ©</h1>
	<div class="flex flex-col space-y-4">
		<HeaderTerminal />
		<GameClock />
		<Wallet />
		<Bridge />
	</div>
</main>


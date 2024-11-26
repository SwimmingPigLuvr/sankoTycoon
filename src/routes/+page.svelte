<!-- routes/+page.svelte -->
<script lang="ts">
	import Bridge from '../lib/components/Bridge.svelte';
	import HeaderTerminal from '../lib/components/HeaderTerminal.svelte';
	import Wallet from '../lib/components/Wallet.svelte';
	import GameClock from '../lib/components/GameClock.svelte';
	import MintEgg from '../lib/components/MintEgg.svelte';
	import {
		activeBun,
		gameState,
		StepID,
		sendModalOpen,
		bridged,
		bunIndex,
		farmtekOpen
	} from '../lib/stores/gameState';
	import { onDestroy } from 'svelte';
	import HatchEgg from '$lib/components/HatchEgg.svelte';
	import Farm from '$lib/components/Farm.svelte';
	import { wallet, type Bun, type Item } from '$lib/stores/wallet';
	import Shop from '$lib/components/Shop.svelte';
	import { fade, slide } from 'svelte/transition';
	import BunWallet from '$lib/components/BunWallet.svelte';
	import SendModal from '$lib/components/SendModal.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import { showDashboard } from '$lib/stores/abilities';
	import Abilities from '$lib/components/Abilities.svelte';
	import Farmtek from '$lib/components/Farmtek.svelte';
	import StrengthTest from '$lib/components/StrengthTest.svelte';

	let currentStep: StepID;
	const unsubscribe = gameState.subscribe((state) => {
		currentStep = state.currentStep;
	});

	onDestroy(() => {
		unsubscribe;
	});

	$: buns = $wallet?.nfts.filter((nft: Bun) => nft.type === 'Bun') ?? [];
	// check if the bun wallet has funky glasses
	$: if (
		buns.length > 0 &&
		buns[$bunIndex]?.wallet?.items?.some(
			(item: Item) => item.name === 'Funky Glasses' && item.quantity > 0
		)
	) {
		showDashboard.set(true);
	} else {
		showDashboard.set(false);
	}
</script>

<div class="fixed left-1/2 -translate-x-1/2 z-50 p-2">
	<Toasts />
</div>

<main class="p-2 font-mono">
	{#if $farmtekOpen}
		<Farmtek />
	{/if}
	<HeaderTerminal />
	<GameClock />
	<div class="flex overflow-visible">
		<!-- bunWallet / farm / wallet -->
		<div
			class="flex p-2 space-x-3 justify-center transform transition-all duration-1000 ease-in-out"
		>
			<div>
				<Wallet />
			</div>
			<div>
				<BunWallet bun={buns[$bunIndex]} />
			</div>
			{#if $activeBun && $activeBun.type === 'Bun'}
				<div>
					<Farm bun={buns[$bunIndex]} />
				</div>
			{/if}
			<div>
				<Abilities />
			</div>
			<div>
				<StrengthTest bun={buns[$bunIndex]} />
			</div>
		</div>
		<div class="">
			{#if buns[$bunIndex]}
				<!-- bun wallet -->
				<Shop bun={buns[$bunIndex]} />
			{/if}
		</div>
		{#if $showDashboard}
			<Dashboard />
		{/if}
	</div>
	<div
		in:fade
		class="-z-10 font-amsterdam-display fixed bottom-2 right-2 items-center -translate-y-1 flex-col"
	>
		<a
			target="_blank"
			rel="noopener noreferrer"
			href="https://x.com/SwimmingPigLuvr"
			class="text-xl flex-col text-center text-sky-300 flex p-2 hover:border-blue-700 border-[1px] border-transparent leading-5 rounded-xl"
		>
			<span class="">Swimming</span>
			<span class="font-botch">𓃟🩵r</span>
		</a>
	</div>

	{#if $sendModalOpen}
		<button class="fixed top-0 left-0">
			<SendModal />
		</button>
	{/if}
</main>

<style>
</style>

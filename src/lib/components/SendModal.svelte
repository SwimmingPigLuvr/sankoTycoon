<script lang="ts">
	import { activeBun, addToast, b, sendModalOpen, toasts } from '$lib/stores/gameState';
	import {
		wallet,
		type Bun,
		type Item,
		type Token,
		type Wallet,
		type BunWallet
	} from '$lib/stores/wallet';

	$: buns = $wallet.nfts;

	let sendingWallet: Wallet | Bun = $wallet;
	let receivingWallet: Wallet | Bun = $activeBun;
	let payload: Item | Bun | Token;

	function isBun(wallet: Wallet | Bun): wallet is Bun {
		return 'imageUrl' in wallet && 'name' in wallet;
	}

	function copyAddress(address: string) {
		// Attempt to copy the address to the user's clipboard
		navigator.clipboard
			.writeText(address)
			.then(() => {
				// Push the "Copied address" message into the toasts store if successful
				addToast('copied address');
			})
			.catch((error) => {
				// Handle the error if the clipboard operation fails
				console.error('Failed to copy address:', error);
				addToast('failed to copy address');
			});
	}
</script>

<main class="font-FinkHeavy w-screen h-screen bg-black bg-opacity-25">
	<!-- modal -->
	<div
		class="items-center send-modal fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-3 m-auto p-4 rounded-xl border-blue-600 border-4"
	>
		<div class="flex justify-between space-x-3">
			<!-- sender -->
			<div class="flex flex-col space-y-1">
				<!-- select sender -->
				<button
					class="p-1 flex justify-between rounded-lg bg-gray-200 border-gray-500 border-2 space-x-2 items-center"
				>
					<img
						class="w-8"
						src={isBun(sendingWallet) ? sendingWallet.thumbUrl : 'ui/icons/wallet.svg'}
						alt=""
					/>
					<div class="flex flex-col leading-4 text-left">
						<p>{isBun(sendingWallet) ? sendingWallet.name : 'My Wallet'}</p>
						<p class="flex items-start space-x-1 text-gray-500 text-xs">
							{sendingWallet.walletAddress}
							<button on:click={() => copyAddress(sendingWallet.walletAddress)}
								><img class="w-3" src="/ui/icons/copy.svg" alt="" /></button
							>
						</p>
					</div>
				</button>
			</div>
			<!-- receiver -->
		</div>

		<!-- amount to transfer button -->
		<div
			class="flex justify-evenly p-2 bg-gray-200 border-gray-500 border-2 rounded-none items-center space-x-2"
		>
			<!-- selected amount -->
			<input
				class="focus:outline-sky-300 focus:border-transparent w-20 rounded px-2 placeholder:font-FinkHeavy"
				placeholder="0"
				type="text"
			/>
			<img class="w-[25px]" src="/ui/icons/sankogold.png" alt="" />
		</div>
		<!-- transfer button -->
		<button
			class="bg-yellow-300 m-auto items-center flex space-x-1 justify-evenly border-yellow-200 border-2 p-1 px-2 rounded-lg"
		>
			<p class="font-FinkHeavy">Transfer</p>
			<img
				class="filter grayscale saturate-0 brightness-0 h-[20px]"
				src="/ui/icons/send-red.svg"
				alt=""
			/>
		</button>
	</div>
</main>

<style>
	.send-modal {
		background-image: url('/ui/patterns/pattern2-light.png');
		background-repeat: repeat;
		background-size: 40%;
	}
</style>

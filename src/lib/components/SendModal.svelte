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

	let showItemName = false;
	let openSenderSelection = false;
	let openReceiverSelection = false;

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

	// find the gold / dmt balances
	$: senderGoldBalance = isBun(sendingWallet)
		? sendingWallet.wallet.gold
		: (sendingWallet.tokens.find((token: Token) => token.name.toLowerCase() === 'gold')?.balance ??
			0);

	$: receiverGoldBalance = isBun(receivingWallet)
		? receivingWallet.wallet.gold
		: (receivingWallet.tokens.find((token: Token) => token.name.toLowerCase() === 'gold')
				?.balance ?? 0);

	$: senderDmtBalance = isBun(sendingWallet)
		? 0
		: (sendingWallet.tokens.find((token: Token) => token.name === 'DMT')?.balance ?? 0);

	$: receiverDmtBalance = isBun(receivingWallet)
		? 0
		: (receivingWallet.tokens.find((token: Token) => token.name === 'DMT')?.balance ?? 0);

	$: senderItems = isBun(sendingWallet)
		? sendingWallet.wallet.items.filter((item: Item) => item.quantity > 0)
		: sendingWallet.items.filter((item: Item) => item.quantity > 0);

	$: senderNfts = isBun(sendingWallet) ? [] : [...sendingWallet.nfts];
	$: receiverNfts = isBun(receivingWallet) ? [] : [...receivingWallet.nfts];

	$: receiverItems = isBun(receivingWallet)
		? receivingWallet.wallet.items.filter((item: Item) => item.quantity > 0)
		: receivingWallet.items.filter((item: Item) => item.quantity > 0);

	$: senderAddress = isBun(sendingWallet)
		? sendingWallet.wallet.address
		: sendingWallet.walletAddress;

	$: recipientAddress = isBun(receivingWallet)
		? receivingWallet.wallet.address
		: receivingWallet.walletAddress;

	function handleOutsideClicks() {
		sendModalOpen.set(false);
		openSenderSelection = false;
		openReceiverSelection = false;
	}

	function handleInsideClicks() {
		openSenderSelection = false;
		openReceiverSelection = false;
	}

	function swapSender() {
		let tempSender = sendingWallet;
		let tempRecipient = receivingWallet;
		receivingWallet = tempSender;
		sendingWallet = tempRecipient;
	}
</script>

<button
	on:click|preventDefault={handleOutsideClicks}
	class="font-FinkHeavy w-screen h-screen bg-black bg-opacity-25"
>
	<!-- modal -->
	<button
		on:click|stopPropagation
		class="items-center w-[500px] send-modal fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-3 m-auto p-4 rounded-xl border-blue-600 border-4"
	>
		<div class="flex justify-between items-center space-x-3">
			<!-- sender -->
			<div class="flex flex-col items-center space-y-1">
				<!-- select sender -->
				<!-- clicking anywhere but this button and the div that it opens should set openSenderSelection to false -->

				<button
					on:click={() => {
						openSenderSelection = true;
						openReceiverSelection = false;
					}}
					class="relative hover:bg-gray-300 p-1 px-2 flex justify-between rounded-lg bg-gray-200 border-gray-500 border-2 space-x-1 items-center"
				>
					{#if openSenderSelection}
						<div
							class="absolute -bottom-32 left-1/2 -translate-y-2 -translate-x-1/2 w-80 z-40 bg-yellow-200 rounded-xl text-sm p-1 flex space-x-3"
						>
							<button
								on:click={() => (sendingWallet = $wallet)}
								class="p-2 rounded-lg w-20 border-2 border-transparent hover:border-gray-500 flex items-center flex-col space-y-0"
							>
								<img class="w-10" src="ui/icons/wallet.svg" alt="wallet icon" />
								<p>My Wallet</p>
							</button>
							{#each buns as bun}
								<button
									on:click={() => (sendingWallet = bun)}
									class="p-2 w-20 rounded-lg border-2 border-transparent hover:border-gray-500 flex items-center flex-col space-y-0"
								>
									<img class="w-10" src={bun.thumbUrl} alt={bun.name} />
									<p>{bun.name}</p>
									<p>#{bun.id}</p>
								</button>
							{/each}
						</div>
					{/if}
					<!-- img -->
					<img
						class="w-8"
						src={isBun(sendingWallet) ? sendingWallet.thumbUrl : 'ui/icons/wallet.svg'}
						alt=""
					/>
					<!-- wallet info -->
					<div class="flex flex-col leading-4 text-left">
						<p>{isBun(sendingWallet) ? sendingWallet.name : 'My Wallet'}</p>
						<button
							on:click|stopPropagation={() => copyAddress(senderAddress)}
							class="flex items-start space-x-1 text-gray-500 text-xs"
						>
							{senderAddress}
							<button><img class="w-3" src="/ui/icons/copy.svg" alt="" /></button>
						</button>
					</div>
					<!-- dropdown icon -->
					<img class="w-4" src="/ui/icons/chevron-down.svg" alt="" />
				</button>

				<!-- wallet contents -->
				<div class="flex flex-col items-center">
					<!-- token balance -->

					<div class="flex space-x-0">
						<!-- main wallet -->
						{#if !isBun(sendingWallet)}
							<!-- dmt balance -->
							<div
								class="px-2 p-1 items-center space-x-1 flex bg-gray-200 border-gray-500 border-2"
							>
								<img class="w-4 h-4" src="/ui/icons/dmt.png" alt="" />
								<p>{senderDmtBalance}</p>
							</div>
							<div
								class="-translate-x-[2px] items-center px-2 p-1 flex space-x-1 bg-gray-200 border-2 border-gray-500"
							>
								<img class="w-4 h-4" src="/ui/icons/sankogold.png" alt="" />
								<p>{senderGoldBalance}</p>
							</div>
						{/if}
						<!-- any bun's wallet -->
						{#if isBun(sendingWallet)}
							<!-- buns gold balance -->
							<div
								class="px-2 p-1 items-center space-x-1 flex bg-gray-200 border-2 border-gray-500"
							>
								<img class="w-4" src="/ui/icons/sankogold.png" alt="" />
								<p>{senderGoldBalance}</p>
							</div>
						{/if}
					</div>
					<!-- items grid -->
					<div
						class="-translate-y-[2px] border-[1px] bg-gray-100 border-gray-500 overflow-y-auto overflow-x-hidden grid gap-0 grid-cols-4 grid-rows-2 w-40 h-20"
					>
						{#each senderItems as item}
							<button
								on:mouseenter={() => (showItemName = true)}
								on:mouseleave={() => (showItemName = false)}
								on:click={() => (payload = item)}
								class="relative border-gray-500 border-[1px] hover:bg-gray-200 flex items-center justify-center"
							>
								<img src={item.imgPath} alt={item.name} class="h-8 w-auto" />
								{#if item.quantity > 1}
									<div
										class="absolute w-2 h-2 top-0 right-0 bg-rose-600 rounded-none text-white flex items-center justify-center text-[0.4rem] text-center"
									>
										{item.quantity}
									</div>
								{/if}
							</button>
						{/each}

						{#if isBun(sendingWallet)}
							{#each senderNfts as item}
								<button
									on:mouseenter={() => (showItemName = true)}
									on:mouseleave={() => (showItemName = false)}
									on:click={() => (payload = item)}
									class="relative border-gray-500 border-[1px] hover:bg-gray-200 flex items-center justify-center"
								>
									<img src={item.thumbUrl} alt={item.name} class="h-8 w-auto" />
								</button>
							{/each}
						{/if}

						{#each Array(Math.max(0, 8 - senderItems.length)) as _}
							<div class="border-gray-500 border-[1px] hover:bg-gray-200"></div>
						{/each}
					</div>
				</div>
			</div>
			<button on:click={() => swapSender()}>
				<img
					src="/ui/icons/arrow.png"
					class="scale-[-100%] hover:filter hover:brightness-[75%] translate-y-9 w-8 h-6"
					alt=""
				/>
			</button>
			<!-- receiver -->
			<div class="flex flex-col items-center space-y-1">
				<!-- select receiver -->
				<button
					on:click={() => {
						openReceiverSelection = true;
						openSenderSelection = false;
					}}
					class="relative hover:bg-gray-300 p-1 px-2 flex justify-between rounded-lg bg-gray-200 border-gray-500 border-2 space-x-1 items-center"
				>
					{#if openReceiverSelection}
						<div
							class="absolute -bottom-32 left-1/2 -translate-y-2 -translate-x-1/2 w-80 z-40 bg-yellow-200 rounded-xl text-sm p-1 flex space-x-3"
						>
							<button
								on:click={() => (receivingWallet = $wallet)}
								class="p-2 rounded-lg w-20 border-2 border-transparent hover:border-gray-500 flex items-center flex-col space-y-0"
							>
								<img class="w-10" src="ui/icons/wallet.svg" alt="wallet icon" />
								<p>My Wallet</p>
							</button>
							{#each buns as bun}
								<button
									on:click={() => (receivingWallet = bun)}
									class="p-2 w-20 rounded-lg border-2 border-transparent hover:border-gray-500 flex items-center flex-col space-y-0"
								>
									<img class="w-10" src={bun.thumbUrl} alt={bun.name} />
									<p>{bun.name}</p>
									<p>#{bun.id}</p>
								</button>
							{/each}
						</div>
					{/if}
					<!-- img -->
					<img
						class="w-8"
						src={isBun(receivingWallet) ? receivingWallet.thumbUrl : 'ui/icons/wallet.svg'}
						alt=""
					/>
					<!-- wallet info -->
					<div class="flex flex-col leading-4 text-left">
						<p>{isBun(receivingWallet) ? receivingWallet.name : 'My Wallet'}</p>
						<button
							on:click|stopPropagation={() => copyAddress(recipientAddress)}
							class="flex items-start space-x-1 text-gray-500 text-xs"
						>
							{recipientAddress}
							<button><img class="w-3" src="/ui/icons/copy.svg" alt="" /></button>
						</button>
					</div>
					<!-- dropdown icon -->
					<img class="w-4" src="/ui/icons/chevron-down.svg" alt="" />
				</button>

				<!-- wallet contents -->
				<div class="flex flex-col items-center">
					<!-- token balance -->

					<div class="flex space-x-0">
						<!-- main wallet -->
						{#if !isBun(receivingWallet)}
							<!-- dmt balance -->
							<div
								class="px-2 p-1 items-center space-x-1 flex bg-gray-200 border-gray-500 border-2"
							>
								<img class="w-4 h-4" src="/ui/icons/dmt.png" alt="" />
								<p>{receiverDmtBalance}</p>
							</div>
							<div
								class="-translate-x-[2px] items-center px-2 p-1 flex space-x-1 bg-gray-200 border-2 border-gray-500"
							>
								<img class="w-4 h-4" src="/ui/icons/sankogold.png" alt="" />
								<p>{receiverGoldBalance}</p>
							</div>
						{/if}
						<!-- any bun's wallet -->
						{#if isBun(receivingWallet)}
							<!-- buns gold balance -->
							<div
								class="px-2 p-1 items-center space-x-1 flex bg-gray-200 border-2 border-gray-500"
							>
								<img class="w-4" src="/ui/icons/sankogold.png" alt="" />
								<p>{receiverGoldBalance}</p>
							</div>
						{/if}
					</div>
					<!-- items grid -->
					<div
						class="-translate-y-[2px] border-[1px] bg-gray-100 border-gray-500 overflow-y-auto overflow-x-hidden grid gap-0 grid-cols-4 grid-rows-2 w-40 h-20"
					>
						{#each receiverItems as item}
							<button
								on:mouseenter={() => (showItemName = true)}
								on:mouseleave={() => (showItemName = false)}
								on:click={() => (payload = item)}
								class="relative border-gray-500 border-[1px] hover:bg-gray-200 flex items-center justify-center"
							>
								<img src={item.imgPath} alt={item.name} class="h-8 w-auto" />
								{#if item.quantity > 1}
									<div
										class="absolute w-2 h-2 top-0 right-0 bg-rose-600 rounded-none text-white flex items-center justify-center text-[0.4rem] text-center"
									>
										{item.quantity}
									</div>
								{/if}
							</button>
						{/each}

						{#if isBun(receivingWallet)}
							{#each receiverNfts as item}
								<button
									on:mouseenter={() => (showItemName = true)}
									on:mouseleave={() => (showItemName = false)}
									on:click={() => (payload = item)}
									class="relative border-gray-500 border-[1px] hover:bg-gray-200 flex items-center justify-center"
								>
									<img src={item.thumbUrl} alt={item.name} class="h-8 w-auto" />
								</button>
							{/each}
						{/if}

						{#each Array(Math.max(0, 8 - receiverItems.length)) as _}
							<div class="border-gray-500 border-[1px] hover:bg-gray-200"></div>
						{/each}
					</div>
				</div>
			</div>
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
	</button>
</button>

<style>
	.send-modal {
		background-image: url('/ui/patterns/pattern2-light.png');
		background-repeat: repeat;
	}
</style>

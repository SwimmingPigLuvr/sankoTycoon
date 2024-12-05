<!-- lib/components/SendModal.svelte -->
<script lang="ts">
	import {
		activeBun,
		addMessage,
		addToast,
		sendModalOpen,
		swapModalOpen,
		toasts
	} from '$lib/stores/gameState';
	import {
		wallet,
		type Bun,
		type Item,
		type Token,
		type Wallet,
		type BunWallet,
		truncateEthAddress
	} from '$lib/stores/wallet';
	import { gold } from '$lib/tokenData';
	import {
		backIn,
		backOut,
		bounceIn,
		bounceOut,
		circIn,
		circOut,
		cubicInOut,
		cubicOut,
		elasticInOut,
		elasticOut
	} from 'svelte/easing';
	import { blur, fade, fly, scale, slide } from 'svelte/transition';

	$: buns = $wallet.nfts;

	// find the gold / dmt balances
	$: if (!isBun(sendingWallet)) {
		// senderDmtToken = sendingWallet.tokens.find((t: Token) => t.name === 'DMT');
	}
	$: senderDmtToken = isBun(sendingWallet)
		? undefined
		: sendingWallet.tokens.find((t: Token) => t.name === 'DMT');

	function getSenderGoldToken(): Token | undefined {
		if (isBun(sendingWallet)) {
			return {
				...gold,
				balance: sendingWallet.wallet.gold
			};
		} else {
			return sendingWallet.tokens.find((t: Token) => t.name === 'GOLD');
		}
	}
	$: senderGoldToken = getSenderGoldToken();

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

	$: senderNfts = isBun(sendingWallet)
		? []
		: [...sendingWallet.nfts.filter((bun: Bun) => bun.type === 'Bun')];
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

	let showItemName = false;
	let openSenderSelection = false;
	let openReceiverSelection = false;

	let sendingWallet: Wallet | Bun = $wallet;
	let receivingWallet: Wallet | Bun = $activeBun;
	export let payload: Item | Bun | Token | undefined = undefined;

	$: if (isToken(senderGoldToken)) {
		payload = senderGoldToken;
	}

	let tokensToSend: number = 0;
	let itemQuantityToSend: number = 1;

	function isBun(concept: any): concept is Bun {
		return concept !== undefined && concept !== null && 'imageUrl' in concept && 'name' in concept;
	}

	function isItem(idea: any): idea is Item {
		return (
			idea !== undefined &&
			idea !== null &&
			'name' in idea &&
			'quantity' in idea &&
			'imgPath' in idea
		);
	}

	function isToken(notion: any): notion is Token {
		return (
			notion !== undefined &&
			notion !== null &&
			'name' in notion &&
			'balance' in notion &&
			'iconUrl' in notion
		);
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

		// reset the payload
		if (senderGoldToken) {
			payload = senderGoldToken;
		}
		sendTokens = false;
		sendItems = false;
		sendBun = false;
		tokensToSend = 0;
		itemQuantityToSend = 1;
	}

	function handleSelection(party: 'sender' | 'receiver', wallet: Wallet | Bun) {
		if (party === 'sender' && receivingWallet === wallet) {
			swapSender();
		}
		if (party === 'receiver' && sendingWallet === wallet) {
			swapSender();
		}
		if (party === 'sender') {
			sendingWallet = wallet;
		} else {
			receivingWallet = wallet;
		}
	}

	let sendTokens = true;
	let sendItems = false;
	let sendBun = false;

	function handleSelectPayload(newPayload: Item | Bun | Token | undefined) {
		if (!newPayload) {
			addToast('no allowed');
			return;
		}
		payload = newPayload;

		// Check if the payload is an Item
		if (isItem(newPayload)) {
			// It's an Item
			// Set the necessary booleans or handle the item-specific logic here
			sendTokens = false;
			sendItems = true;
			sendBun = false;
		}
		// Check if the payload is a Bun
		else if (isBun(newPayload)) {
			// It's a Bun
			// Set the necessary booleans or handle the bun-specific logic here
			sendTokens = false;
			sendItems = false;
			sendBun = true;
		}
		// If not an Item or Bun, it must be a Token
		else if (isToken(newPayload)) {
			// It's a Token
			// Set the necessary booleans or handle the token-specific logic here
			sendTokens = true;
			sendItems = false;
			sendBun = false;
		} else {
			console.error('unknoqn payload toype oi mate');
		}
	}

	function maxTokens() {
		if (!payload || !sendTokens || !isToken(payload)) {
			return;
		}
		// Check if sending wallet is a Bun and if the token is 'GOLD'
		if (isBun(sendingWallet) && payload.name === 'GOLD') {
			tokensToSend = sendingWallet.wallet.gold;
		} else {
			tokensToSend = payload.balance;
		}
	}

	function handleTransfer() {
		if (payload) {
			if (sendTokens && isToken(payload)) {
				const amount = tokensToSend;
				if (amount <= 0 || amount > payload.balance) {
					addMessage('invalid amount');
					return;
				}
				transferToken(payload, amount);
				addToast(`sent ${amount} ${payload.name}`);
				payload = undefined;
			} else if (sendItems && isItem(payload)) {
				const quantity = itemQuantityToSend;
				if (quantity <= 0 || quantity > payload.quantity) {
					addMessage('invalid quantity');
					return;
				}
				transferItem(payload, quantity);
				addToast(`sent ${quantity} ${payload.name}`);

				// if the item quantity goes down to 0 reset the payload
				payload = undefined;
			} else if (sendBun && isBun(payload)) {
				transferBun(payload);
				addToast(`sent ${payload.name} #${payload.id}`);
				payload = undefined;
			} else {
				addMessage('error: invalid payload');
				payload = undefined;
			}
		} else {
			addToast('please select item to send');
		}
	}

	function transferToken(token: Token, amount: number) {
		// update sender wallet
		if (isBun(sendingWallet)) {
			if (token.name === 'GOLD') {
				if (sendingWallet.wallet.gold >= amount) {
					sendingWallet.wallet.gold -= amount;
				} else {
					addToast('insufficient gold balance');
					return;
				}
			} else {
				addToast('buns can only send/receive gold at the moment.');
				return;
			}
		} else {
			const senderToken = sendingWallet.tokens.find((t: Token) => t.name === 'GOLD');
			if (senderToken && senderToken.balance) {
				senderToken.balance -= amount;
			}
		}

		// Update receivingWallet
		if (isBun(receivingWallet)) {
			if (token.name === 'GOLD') {
				receivingWallet.wallet.gold += amount;
			} else {
				addToast('cannot send this token to a bun');
				return;
			}
		} else {
			let receiverToken = receivingWallet.tokens.find((t) => t.name === token.name);
			if (receiverToken) {
				receiverToken.balance += amount;
			} else {
				receivingWallet.tokens.push({ ...token, balance: amount });
			}
		}

		//trigger reactivity
		updateWallets();
	}

	function transferItem(item: Item, quantity: number) {
		// update sender's wallet
		const senderItems = isBun(sendingWallet) ? sendingWallet.wallet.items : sendingWallet.items;
		const senderItem = senderItems.find((i: Item) => i.name === item.name);
		if (senderItem) {
			senderItem.quantity -= quantity;
			if (senderItem.quantity <= 0) {
				const index = senderItems.indexOf(senderItem);
				senderItems.splice(index, 1);
			}
		} else {
			addToast('item not found');
			return;
		}

		// update receiver's wallet
		const receiverItems = isBun(receivingWallet)
			? receivingWallet.wallet.items
			: receivingWallet.items;
		let receiverItem = receiverItems.find((i: Item) => i.name === item.name);
		if (receiverItem) {
			receiverItem.quantity += quantity;
		} else {
			receiverItems.push({ ...item, quantity });
		}

		updateWallets();
	}

	function transferBun(payload: Bun) {
		// update sender wallet
		if (!isBun(sendingWallet)) {
			const index = sendingWallet.nfts.findIndex((b: Bun) => b.id === payload.id);
			if (index !== -1) {
				sendingWallet.nfts.splice(index, 1);
			} else {
				addMessage('bun not found');
				return;
			}
		} else {
			addToast('cannot send bun from another bun');
			return;
		}

		// update receiver wallet
		if (!isBun(receivingWallet)) {
			receivingWallet.nfts.push(payload);
		} else {
			addMessage('cannot send bun to another bun');
			return;
		}

		// trigger reactivity
		updateWallets();
	}

	function updateWallets() {
		if (!isBun(sendingWallet)) {
			sendingWallet = { ...sendingWallet };
		} else {
			sendingWallet = { ...sendingWallet };
		}

		if (!isBun(receivingWallet)) {
			receivingWallet = { ...receivingWallet };
		} else {
			receivingWallet = { ...receivingWallet };
		}

		wallet.update((w) => ({ ...w }));
	}
</script>

<button
	on:click|preventDefault={handleOutsideClicks}
	in:fade={{ duration: 100 }}
	out:fade={{ duration: 100 }}
	class="font-FinkHeavy w-screen h-screen bg-black bg-opacity-50"
>
	<!-- modal -->
	<button
		in:scale={{ duration: 250, easing: cubicInOut }}
		out:scale={{ duration: 500, easing: backIn }}
		on:click|stopPropagation
		class="items-center w-[500px] send-modal fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-3 m-auto p-4 rounded-xl border-blue-600 border-4"
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
							in:slide={{ duration: 500, easing: backOut }}
							out:slide={{ duration: 350, easing: backIn }}
							class="absolute -bottom-32 left-1/2 -translate-y-2 -translate-x-1/2 w-80 z-40 bg-yellow-200 rounded-xl text-sm p-1 flex space-x-3"
						>
							<!-- close selection button X -->
							<button
								in:scale={{ delay: 500, duration: 500, easing: backOut }}
								class="px-3 p-1 absolute -top-10 right-8 bg-black text-red-500 border-red-600 border-2 hover:bg-red-500 hover:text-white rounded"
								on:click|stopPropagation={() => (openSenderSelection = false)}>X</button
							>
							<!-- list of wallets starting with main wallet -->
							<button
								on:click={() => handleSelection('sender', $wallet)}
								class="p-2 rounded-lg w-20 border-2 border-transparent hover:border-gray-500 flex items-center flex-col space-y-0"
							>
								<img class="w-10" src="ui/icons/wallet.svg" alt="wallet icon" />
								<p>My Wallet</p>
							</button>
							{#each buns as bun}
								<button
									on:click={() => handleSelection('sender', bun)}
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
							{truncateEthAddress(senderAddress)}
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
							<button
								on:click={() => handleSelectPayload(senderDmtToken)}
								class="px-2 p-1 items-center space-x-1 flex bg-gray-100 hover:bg-gray-200 border-gray-500 border-2"
							>
								<img class="w-4 h-4" src="/ui/icons/dmt.png" alt="" />
								<p>{senderDmtBalance}</p>
							</button>
							<button
								on:click={() => handleSelectPayload(senderGoldToken)}
								class="-translate-x-[2px] items-center px-2 p-1 flex space-x-1 bg-gray-100 hover:bg-gray-200 border-2 border-gray-500"
							>
								<img class="w-4 h-4" src="/ui/icons/sankogold.png" alt="" />
								<p>{senderGoldBalance}</p>
							</button>
						{/if}
						<!-- any bun's wallet -->
						{#if isBun(sendingWallet)}
							<!-- buns gold balance -->
							<button
								on:click={() => handleSelectPayload(senderGoldToken)}
								class="px-2 p-1 items-center space-x-1 flex bg-gray-200 border-2 border-gray-500"
							>
								<img class="w-4" src="/ui/icons/sankogold.png" alt="" />
								<p>{senderGoldBalance}</p>
							</button>
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
								on:click={() => handleSelectPayload(item)}
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
			<div>
				<button on:click={() => swapSender()}>
					<img
						src="/ui/icons/arrow.png"
						class="scale-[-100%] hover:filter hover:brightness-[75%] translate-y-9 w-8 h-6"
						alt=""
					/>
				</button>
			</div>
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
							in:slide={{ duration: 500, easing: backOut }}
							out:slide={{ duration: 350, easing: backIn }}
							class="absolute -bottom-32 left-1/2 -translate-y-2 -translate-x-1/2 w-80 z-40 bg-yellow-200 rounded-xl text-sm p-1 flex space-x-3"
						>
							<!-- close receiver button X -->
							<button
								in:scale={{ delay: 500, duration: 500, easing: backOut }}
								class="px-3 p-1 absolute -top-10 right-8 bg-black text-red-500 border-red-600 border-2 hover:bg-red-500 hover:text-white rounded"
								on:click|stopPropagation={() => (openReceiverSelection = false)}>X</button
							>
							<button
								on:click={() => handleSelection('receiver', $wallet)}
								class="p-2 rounded-lg w-20 border-2 border-transparent hover:border-gray-500 flex items-center flex-col space-y-0"
							>
								<img class="w-10" src="ui/icons/wallet.svg" alt="wallet icon" />
								<p>My Wallet</p>
							</button>
							{#each buns as bun}
								<button
									on:click={() => handleSelection('receiver', bun)}
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
							{truncateEthAddress(recipientAddress ?? '0x0187de236e3fb50b')}
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
								class="px-2 p-1 items-center space-x-1 flex bg-gray-100 hover:bg-gray-200 border-2 border-gray-500"
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
			class="flex justify-evenly py-3 p-2 bg-gray-200 border-gray-500 border-2 rounded-none items-center space-x-2 h12 h-[55px]"
		>
			<!-- if TOKEN -->
			{#if payload && sendTokens && isToken(payload)}
				<!-- amount -->
				<input
					class="relative focus:outline-sky-300 focus:border-transparent w-20 rounded px-2 placeholder:font-FinkHeavy"
					placeholder="0"
					type="number"
					bind:value={tokensToSend}
				/>
				<button
					on:click={() => maxTokens()}
					class="absolute translate-x-[2px] text-xs bg-gray-200 border-[1px] border-gray-400 rounded-sm px-1"
					>max</button
				>
				<img class="w-[25px] h-[25px]" src={payload.iconUrl} alt="" />

				<!-- if BUN -->
			{:else if payload && sendBun && isBun(payload)}
				<div class="border-gray-400">
					<img src={payload.thumbUrl} alt={payload.name} />
				</div>
				<!-- if ITEM -->
			{:else if payload && sendItems && isItem(payload)}
				<div class="flex w-[80px] justify-between items-center space-x-2 border-gray-400">
					<select class="w-10" bind:value={itemQuantityToSend} name="quantity" id="">
						<!-- Create an option for each unit in payload.quantity -->
						{#each Array(payload.quantity) as _, index}
							<option value={index + 1}>{index + 1}</option>
						{/each}
					</select>
					<img class="max-h-[50px]" src={payload.imgPath} alt={payload.name} />
				</div>
				<!-- if payload undefined -->
			{:else}
				<!-- selected amount -->
				<div class="w-20 rounded px-2 font-FinkHeavy">Select an asset</div>
			{/if}
		</div>
		<!-- transfer button -->
		<button
			on:click={() => handleTransfer()}
			disabled={isBun(receivingWallet) && payload?.name === 'DMT'}
			class="disabled:cursor-not-allowed disabled:opacity-50 bg-yellow-300 m-auto items-center flex space-x-1 justify-evenly border-yellow-200 border-2 p-1 px-2 rounded-lg"
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

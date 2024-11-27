<script>
	export let bun;
	let strengthValue = 0;

	// Function to simulate hitting the strength test
	function hitStrengthTest() {
		// Generate a random value between 0 and 100
		const hitValue = Math.floor(Math.random() * 101);
		// Update the strength value
		strengthValue = hitValue;
	}
</script>

<main class="font-FinkHeavy w-40 h-[475px]">
	<h1 class="text-xl">Test of Strength</h1>
	<div class="w-36 rounded-t-full border-[10px] bg-amber-400 border-red-600 h-[475px] border-b-0">
		<!-- metal ringer -->
		<div class="w-full mt-2 flex justify-center items-center">
			<div class="rounded-full w-24 h-24 bg-black flex justify-center items-center">
				<div class="w-20 h-20 bg-slate-900 rounded-full flex justify-center items-center">
					<div class="rounded-full w-16 h-16 bg-slate-600"></div>
				</div>
			</div>
		</div>
		<div class="flex bg-lime-400 w-full h-60 p-1 text-xs justify-between">
			<!-- these numbers will appear on the left and the right of the meter -->
			<!-- updated meter with numbers from 0 to 100 -->
			<div
				class="flex justify-between bg-white h-60 font-sans font-black scale-y-150 -tracking-widest text-center flex-col"
			>
				{#each Array(11)
					.fill(0)
					.map((_, i) => i * 10) as number}
					<span>{number}</span>
				{/each}
			</div>
			<!-- meter -->
			<!-- this will go up based on how hard the user hits -->
			<div class="flex font-sans font-black scale-y-150 -tracking-widest text-center flex-col">
				{#each Array(11)
					.fill(0)
					.map((_, i) => i * 10) as number}
					<span>{number}</span>
				{/each}
			</div>
		</div>
		<!-- Strength indicator -->
		<div class="w-full flex justify-center items-center mt-4">
			<div class="text-2xl font-bold">{strengthValue}</div>
		</div>
		<!-- Button to hit the strength test -->
		<div class="w-full flex justify-center items-center mt-4">
			<button class="bg-red-500 text-white p-2 rounded" on:click={hitStrengthTest}> Hit! </button>
		</div>
	</div>
</main>

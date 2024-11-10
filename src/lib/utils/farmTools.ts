import type { Bun, Plot, Item } from '$lib/stores/wallet';
import { addMessage } from '$lib/stores/gameState';

interface PlantingResult {
    updatedBun: Bun;
    seedsPlanted: number;
}

export function plantBatchSeeds(bun: Bun, seeds: Item[]) {
    let seedsPlanted = 0; 
    const bunCopy = structuredClone(bun);

    // find the seed in the buns wallet
    seeds.foreach(
        const seed = bunCopy.wallet.items.find((item: Item) => item.name === seed.name);
        if (!seed || seed.quantity === 0) {
            return { updatedBun: bunCopy, seedsPlanted: 0};
        }

        const plantingQuantity = Math.min(quantity, seed.quantity);

        // try to plant each seed
        bunCopy.farm.forEach((plot: Plot, index: number) => {
            if (seedsPlanted >= plantingQuantity) return;

            // check if plot is empty
            if (plot.state === 'empty') {
                // plant seed
                const fruitType = getFruitTypeFromSeed(seed.name);
                bunCopy.farm[index] = {
                    state: 'planted',
                    type: fruitType,
                    fruitRemainging: getFruitYieldForSeed(seed.name),
                    fruitsReady: 0,
                    plantedAt: Date.now(),
                    isWithered: false,
                };
                seedsPlanted++;
            }
        });

        if (seedsPlanted > 0) {
            seed.quantity -= seedsPlanted;
            addMessage(`${bun.name} planted ${seedsPlanted} ${seed.name}${seedsPlanted > 1 ? 's' : ''`);
        } else {
            addMessage(`farm is fully planted. no more plots to plant`);
        }
        return {
            updatedBun: bunCopy,
                seedsPlanted

            };
    )
}
// Helper functions
function getFruitTypeFromSeed(seedName: string): string {
    // Map seed names to fruit types
    const seedToFruit: { [key: string]: string } = {
        'Heart Seed': 'heart',
        'Star Seed': 'star',
        'Lumpy Seed': 'lumpy',
        'Round Seed': 'round',
        'Square Seed': 'square'
    };
    return seedToFruit[seedName] || 'unknown';
}

function getFruitYieldForSeed(seedName: string): number {
    // Define how many fruits each seed type produces
    const seedYields: { [key: string]: number } = {
        'Heart Seed': 3,
        'Star Seed': 3,
        'Lumpy Seed': 3,
        'Round Seed': 3,
        'Square Seed': 3,
        'Withered Heart Seed': 1,
        'Withered Star Seed': 1,
        'Withered Lumpy Seed': 1,
        'Withered Round Seed': 1,
        'Withered Square Seed': 1
    };
    return seedYields[seedName] || 0;
}

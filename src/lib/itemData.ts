import type { Item } from '$lib/stores/wallet';

// the quantity of these objects dictates the quantity of the objects in the bun's wallet

// consumables
export const bunzempic: Item = {
    type: 'consumable',
    name: 'Bunzempic',
    quantity: 1,
    imgPath: '/images/items/Bunzempic.png',
    buyPrice: 2,
};

// wearables
export const bunBlaster: Item = {
    type: 'wearable',
    name: 'Bun Blaster',
    quantity: 0,
    imgPath: 'images/items/wearables/BunBlaster.png',
    buyPrice: 12,
}

// fruit
export const starFruit: Item = {
    type: 'fruit',
    name: 'Star Fruit',
    quantity: 0,
    imgPath: '/images/fruit/star.png',
    fruitType: 'star',
    buyPrice: 3,
    sellPrice: 0.75,
};

export const lumpyFruit: Item = {
    type: 'fruit',
    name: 'Lumpy Fruit',
    quantity: 0,
    imgPath: '/images/fruit/lumpy.png',
    fruitType: 'lumpy',
    buyPrice: 3,
    sellPrice: 0.75,
};

export const heartFruit: Item = {
    type: 'fruit',
    name: 'Heart Fruit',
    quantity: 0,
    imgPath: '/images/fruit/heart.png',
    fruitType: 'heart',
    buyPrice: 3,
    sellPrice: 0.75,
};

export const roundFruit: Item = {
    type: 'fruit',
    name: 'Round Fruit',
    quantity: 0,
    imgPath: '/images/fruit/round.png',
    fruitType: 'round',
    buyPrice: 3,
    sellPrice: 0.75,
};

export const squareFruit: Item = {
    type: 'fruit',
    name: 'Square Fruit',
    quantity: 0,
    imgPath: '/images/fruit/square.png',
    fruitType: 'square',
    buyPrice: 3,
    sellPrice: 0.75,
};


// seeds
export const heartSeed: item = {
    type: 'seed',
    name: 'Heart Seed',
    quantity: 1,
    imgPath: '/images/seeds/HeartSeed.png',
    fruitType: 'heart',
    buyPrice: 4.75,
};

export const starSeed: item = {
    type: 'seed',
    name: 'Star Seed',
    quantity: 0,
    imgPath: '/images/seeds/StarSeed.png',
    fruitType: 'star',
    buyPrice: 4.75,
};

export const lumpySeed: item = {
    type: 'seed',
    name: 'Lumpy Seed',
    quantity: 0,
    imgPath: '/images/seeds/LumpySeed.png',
    fruitType: 'lumpy',
    buyPrice: 4.75,
};

export const roundSeed: item = {
    type: 'seed',
    name: 'Round Seed',
    quantity: 0,
    imgPath: '/images/seeds/RoundSeed.png',
    fruitType: 'round',
    buyPrice: 4.75,
};

export const squareSeed: item = {
    type: 'seed',
    name: 'Square Seed',
    quantity: 0,
    imgPath: '/images/seeds/SquareSeed.png',
    fruitType: 'square',
    buyPrice: 4.75,
};

// Withered seeds
export const witheredHeartSeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Heart Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredHeartSeed.png',
    fruitType: 'heart'
};

export const witheredLumpySeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Lumpy Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredLumpySeed.png',
    fruitType: 'lumpy'
};

export const witheredRoundSeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Round Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredRoundSeed.png',
    fruitType: 'round'
};

export const witheredSquareSeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Square Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredSquareSeed.png',
    fruitType: 'square'
};

export const witheredStarSeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Star Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredStarSeed.png',
    fruitType: 'star'
};



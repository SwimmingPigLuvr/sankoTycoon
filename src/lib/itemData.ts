import type { Item } from '$lib/stores/wallet';

// the quantity of these objects dictates the quantity of the objects in the bun's wallet

// items
export const bunzempic: Item = {
    type: 'consumable',
    name: 'Bunzempic',
    quantity: 1,
    imgPath: '/images/items/Bunzempic.png'
};

// fruit
export const starFruit: Item = {
    type: 'fruit',
    name: 'Star Fruit',
    quantity: 0,
    imgPath: '/images/fruit/star.png',
    fruitType: 'star',
};

export const lumpyFruit: Item = {
    type: 'fruit',
    name: 'Lumpy Fruit',
    quantity: 0,
    imgPath: '/images/fruit/lumpy.png',
    fruitType: 'lumpy',
};

export const heartFruit: Item = {
    type: 'fruit',
    name: 'Heart Fruit',
    quantity: 0,
    imgPath: '/images/fruit/heart.png',
    fruitType: 'heart',
};

export const roundFruit: Item = {
    type: 'fruit',
    name: 'Round Fruit',
    quantity: 0,
    imgPath: '/images/fruit/round.png',
    fruitType: 'round',
};

export const squareFruit: Item = {
    type: 'fruit',
    name: 'Square Fruit',
    quantity: 0,
    imgPath: '/images/fruit/square.png',
    fruitType: 'square',
};


// seeds
export const heartSeed: item = {
    type: 'seed',
    name: 'Heart Seed',
    quantity: 5,
    imgPath: '/images/seeds/HeartSeed.png',
    fruitType: 'heart'
};

export const starSeed: item = {
    type: 'seed',
    name: 'Star Seed',
    quantity: 5,
    imgPath: '/images/seeds/StarSeed.png',
    fruitType: 'star'
};

export const lumpySeed: item = {
    type: 'seed',
    name: 'Lumpy Seed',
    quantity: 5,
    imgPath: '/images/seeds/LumpySeed.png',
    fruitType: 'lumpy'
};

export const roundSeed: item = {
    type: 'seed',
    name: 'Round Seed',
    quantity: 5,
    imgPath: '/images/seeds/RoundSeed.png',
    fruitType: 'round'
};

export const squareSeed: item = {
    type: 'seed',
    name: 'Square Seed',
    quantity: 5,
    imgPath: '/images/seeds/SquareSeed.png',
    fruitType: 'square'
};

// Withered seeds
export const witheredHeartSeed: Item = {
    type: 'seed',
    name: 'Withered Heart Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredHeartSeed.png',
    fruitType: 'heart'
};

export const witheredLumpySeed: Item = {
    type: 'seed',
    name: 'Withered Lumpy Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredLumpySeed.png',
    fruitType: 'lumpy'
};

export const witheredRoundSeed: Item = {
    type: 'seed',
    name: 'Withered Round Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredRoundSeed.png',
    fruitType: 'round'
};

export const witheredSquareSeed: Item = {
    type: 'seed',
    name: 'Withered Square Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredSquareSeed.png',
    fruitType: 'square'
};

export const witheredStarSeed: Item = {
    type: 'seed',
    name: 'Withered Star Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredStarSeed.png',
    fruitType: 'star'
};



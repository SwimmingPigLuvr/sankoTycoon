import { writable } from "svelte/store";

// double sale values
export const bunBlasted = writable<boolean>(false);

// cool down period after reviving bun
export const isReviving = writable<boolean>(false);

export const click2plantPurchased = writable<boolean>(true);
export const click2plantEnabled = writable<boolean>(true);
export const totalTreesPlanted = writable<number>(10);

export const autoFeederPurchased = writable<boolean>(true);
export const autoFeederOn = writable<boolean>(true);
export const totalFruitsEaten = writable<number>(10);

export const totalFruitsSold = writable<number>(50);
export const autoSellerPurchased = writable<boolean>(true);
export const autoSellerOn = writable<boolean>(true);
export const sellSpeed = writable<number>(2000);


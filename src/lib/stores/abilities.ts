import { writable } from "svelte/store";

// double sale values
export const bunBlasted = writable<boolean>(false);

// cool down period after reviving bun
export const isReviving = writable<boolean>(false);

export const click2plantPurchased = writable<boolean>(false);
export const click2plantEnabled = writable<boolean>(false);
export const totalTreesPlanted = writable<number>(0);

export const autoFeederPurchased = writable<boolean>(false);
export const autoFeederOn = writable<boolean>(false);
export const totalFruitsEaten = writable<number>(0);


import { writable } from "svelte/store";

// double sale values
export const bunBlasted = writable<boolean>(false);

// cool down period after reviving bun
export const isReviving = writable<boolean>(false);

export const oneClickFarmingEnabled = writable<boolean>(true);

export const autoFeederOn = writable<boolean>(true);

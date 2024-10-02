// lib/stores/gameState.ts
import { writable } from 'svelte/store';

export enum StepID {
    Bridge = 0,
    Mint,
    Hatch,
    Farm,
    Stake,
    Stream,
    MiniGames,
    Airdrop,
}

interface Step {
    id: StepID; // Corrected to use StepID type
    name: string;
    description: string;
    completed: boolean;
    message: string;
}

interface GameState {
    currentStep: StepID;
    steps: Step[];
    messages: string[];
}

const steps: Step[] = [
    {
        id: StepID.Bridge, // Corrected to use StepID.Bridge instead of 0
        name: 'Bridge $DMT to Sanko Chain',
        description: 'Bridge to Sanko',
        completed: false,
        message: 'Successfully Bridged $DMT to Sanko Chain ⭐️️️⛓️©️',
    },
      {
        id: StepID.Mint, // Corrected to use StepID.Mint instead of 2
        name: 'Mint a SankoPets egg',
        description: '',
        completed: false,
        message: 'Mint a SankoPets egg',
    },
    {
        id: StepID.Hatch, // Corrected to use StepID.Hatch instead of 3
        name: 'Hatch your SankoPets Bun',
        description: '',
        completed: false,
        message: 'Hatch your SankoPets Bun',
    },
];

const initialState: GameState = {
    currentStep: StepID.Bridge,
    steps: steps,
    messages: ['', '', '', '', 'Welcome to SankoTycoon ©️'],
};

const gameState = writable<GameState>(initialState);

function progressStep() {
    gameState.update(state => {
        const stepIndex = state.steps.findIndex(step => step.id === state.currentStep);
        if (stepIndex !== -1 && !state.steps[stepIndex].completed) {
            state.steps[stepIndex].completed = true;
            const nextStep = state.steps[stepIndex + 1];
            if (nextStep) {
                state.currentStep = nextStep.id;
                addMessage(nextStep.message); // Add new message to the messages array
            }
        }
        return state;
    });
}

function addMessage(newMessage: string) {
    gameState.update(state => {
        // state.messages = [...state.messages.slice(0, 4), newMessage];
        state.messages.shift();
        state.messages.push(newMessage);
        return state;
    });
}

export { gameState, progressStep, addMessage }; // Export addMessage function

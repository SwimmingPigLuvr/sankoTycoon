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
        message: 'Successfully Bridged $DMT to Sanko Chain',
    },
      {
        id: StepID.Mint, // Corrected to use StepID.Mint instead of 2
        name: 'Mint a SankoPets egg',
        description: 'Mint Egg',
        completed: false,
        message: 'Mint Successful!',
    },
    {
        id: StepID.Hatch, // Corrected to use StepID.Hatch instead of 3
        name: 'Hatch your SankoPets Bun',
        description: 'Hatch Bun',
        completed: false,
        message: 'Bun Hatched! Check Wallet.',
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
        // get current step index
        const stepIndex = state.steps.findIndex(step => step.id === state.currentStep);

        if (stepIndex !== -1 && !state.steps[stepIndex].completed) {
            // mark current step complete
            state.steps[stepIndex].completed = true;

            // add success message for current step
            addMessage(state.steps[stepIndex].message);

            // get next step
            const nextStep = state.steps[stepIndex + 1];
            if (nextStep) {
                // advance to next step
                state.currentStep = nextStep.id;

                // add next step message
                addMessage(nextStep.description); // Add new message to the messages array
            }
        }
        return state;
    });
}

function addMessage(newMessage: string) {
    gameState.update(state => {
        if (!state.messages.includes(newMessage)) {
            if (state.messages.length >= 4) {
                state.messages.shift();
            }
            state.messages.push(newMessage);
        }
        return state;
    });
}

export { gameState, progressStep, addMessage }; // Export addMessage function

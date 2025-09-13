import { useState, useEffect, useRef, useCallback } from 'react';

// Custom hook to manage voice instructions and prevent repetition
export const useVoiceInstructions = (speak) => {
    const hasSpokenInitialRef = useRef(false);
    const instructionHistoryRef = useRef(new Set());
    const lastInstructionRef = useRef('');

    // Function to speak instruction only once per component mount
    const speakOnce = useCallback((instruction, forceSpeak = false) => {
        if (!instruction) return;
        
        const instructionKey = instruction.toLowerCase().trim();
        
        // If forcing speech or instruction hasn't been spoken yet
        if (forceSpeak || (!hasSpokenInitialRef.current && !instructionHistoryRef.current.has(instructionKey))) {
            speak(instruction);
            hasSpokenInitialRef.current = true;
            instructionHistoryRef.current.add(instructionKey);
            lastInstructionRef.current = instructionKey;
        }
    }, [speak]);

    // Function to speak step-specific instructions (for multi-step flows)
    const speakStepInstruction = useCallback((instruction, stepId) => {
        if (!instruction) return;
        
        const stepKey = `${stepId}_${instruction.toLowerCase().trim()}`;
        
        if (!instructionHistoryRef.current.has(stepKey)) {
            speak(instruction);
            instructionHistoryRef.current.add(stepKey);
            lastInstructionRef.current = stepKey;
        }
    }, [speak]);

    // Function to reset instruction history (useful for new sessions)
    const resetInstructions = useCallback(() => {
        hasSpokenInitialRef.current = false;
        instructionHistoryRef.current = new Set();
        lastInstructionRef.current = '';
    }, []);

    // Function to allow specific instruction to be spoken again
    const allowRepeat = useCallback((instruction) => {
        const instructionKey = instruction.toLowerCase().trim();
        instructionHistoryRef.current.delete(instructionKey);
    }, []);

    return {
        speakOnce,
        speakStepInstruction,
        resetInstructions,
        allowRepeat,
        hasSpokenInitial: hasSpokenInitialRef.current,
        instructionHistory: Array.from(instructionHistoryRef.current)
    };
}; 
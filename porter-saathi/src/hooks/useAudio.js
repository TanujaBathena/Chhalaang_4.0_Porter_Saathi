import { useState } from 'react';
import { base64ToArrayBuffer, pcmToWav, cleanForSpeech } from '../utils/audioUtils';

// Custom hook for audio generation and playback
export const useAudio = (language) => {
    const [audioPlayer] = useState(() => {
        const player = new Audio();
        // Make audio player globally accessible for stop functionality
        window.audioPlayer = player;
        return player;
    });
    const [isPlaying, setIsPlaying] = useState(false);

    const stopAudio = () => {
        // Stop speech synthesis
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        // Stop audio player
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        setIsPlaying(false);
    };

    const generateAndPlayAudio = async (textToSpeak) => {
        const cleanedText = cleanForSpeech(textToSpeak);
        if (!cleanedText) {
            console.log("Skipping audio generation for empty or invalid text.");
            return;
        }

        // Prevent multiple simultaneous audio calls
        if (isPlaying) {
            console.log("Audio is already playing, skipping new request.");
            return;
        }

        // Stop any currently playing audio first
        stopAudio();
        
        // Add a small delay to ensure previous audio is fully stopped
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsPlaying(true);

        // Set Sulafat as the default voice for all languages
        const voiceName = 'Sulafat';

        const apiKey = "AIzaSyChUrdf5nMkO5qce6H-ve16gchA4dHP30c";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        const payload = {
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: cleanedText }] }],
            generationConfig: { 
                responseModalities: ["AUDIO"],
                voiceName: voiceName
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`TTS API error! status: ${response.status}`);

            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;

            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)?.[1], 10) || 24000;
                const pcmBuffer = base64ToArrayBuffer(audioData);
                const wavBlob = pcmToWav(pcmBuffer, 1, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);

                audioPlayer.src = audioUrl;
                audioPlayer.onended = () => setIsPlaying(false);
                audioPlayer.onerror = () => setIsPlaying(false);
                audioPlayer.play().catch(e => {
                    console.error("Audio playback failed:", e);
                    setIsPlaying(false);
                });
            } else {
                throw new Error("No audio data in TTS response.");
            }
        } catch (error) {
            console.error("AI audio generation failed:", error);
            // Fallback to browser's native voice if API fails
            const utterance = new SpeechSynthesisUtterance(cleanedText);
            utterance.lang = language;
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            speechSynthesis.speak(utterance);
        }
    };

    return { generateAndPlayAudio, stopAudio, audioPlayer, isPlaying };
}; 
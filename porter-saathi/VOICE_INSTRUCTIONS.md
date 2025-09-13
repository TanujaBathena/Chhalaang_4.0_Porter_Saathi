# Voice Instructions Management

## Overview

The Porter Saathi app now includes a voice instruction management system to ensure that voice instructions are given only once per component/page visit, preventing repetitive and annoying audio feedback.

## Implementation

### useVoiceInstructions Hook

Located in `src/hooks/useVoiceInstructions.js`, this custom hook provides:

- **speakOnce(instruction, forceSpeak)**: Speaks an instruction only once per component mount
- **speakStepInstruction(instruction, stepId)**: Speaks step-specific instructions for multi-step flows
- **resetInstructions()**: Clears instruction history (useful for new sessions)
- **allowRepeat(instruction)**: Allows a specific instruction to be spoken again

### Enhanced useAudio Hook

The `src/hooks/useAudio.js` hook has been enhanced with:

- **isPlaying state**: Prevents multiple simultaneous audio calls
- **Proper cleanup**: Ensures audio stops completely before starting new audio
- **Event handlers**: Properly manages audio state on completion/error

## Updated Components

The following components now use controlled voice instructions:

1. **LoginPage** - Welcome message spoken only once on mount
2. **SignupPage** - Welcome message spoken only once on mount  
3. **LogoutPage** - Confirmation message spoken only once on mount
4. **TutorialDetail** - Tutorial introduction spoken only once when opened

## How It Works

1. **Component Mount**: When a component mounts, it calls `speakOnce()` with the welcome/instruction message
2. **Instruction Tracking**: The hook tracks which instructions have been spoken using a Set
3. **Duplicate Prevention**: If the same instruction is requested again, it's ignored
4. **Step Management**: For multi-step flows, instructions are tracked per step using `speakStepInstruction()`
5. **Audio State**: The audio system prevents overlapping audio by tracking playing state

## Benefits

- ✅ No more repetitive voice instructions
- ✅ Better user experience
- ✅ Prevents audio overlap
- ✅ Maintains accessibility for visually impaired users
- ✅ Preserves intentional voice guidance features

## Usage Example

```javascript
import { useVoiceInstructions } from '../hooks/useVoiceInstructions';

const MyComponent = ({ speak, t }) => {
    const { speakOnce, speakStepInstruction } = useVoiceInstructions(speak);
    
    // Speak welcome message only once on mount
    useEffect(() => {
        const welcomeMsg = t('welcome');
        speakOnce(welcomeMsg);
    }, [t, speakOnce]);
    
    // Speak step-specific instructions
    const handleStepChange = (step) => {
        const instruction = t(`step_${step}_instruction`);
        speakStepInstruction(instruction, step);
    };
};
```

## Testing

To test the voice instruction management:

1. Navigate to any page with voice instructions (Login, Signup, etc.)
2. Verify the welcome message is spoken only once
3. Navigate away and back - the message should not repeat
4. For multi-step flows, verify step instructions are spoken only once per step
5. Verify no audio overlap occurs when multiple instructions are triggered quickly 
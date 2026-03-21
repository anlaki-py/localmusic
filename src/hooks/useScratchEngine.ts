/**
 * Scratch engine hook for DJ Mode.
 * Manages AudioWorklet setup, audio buffer loading, and playback control.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** Seconds per revolution at 33 1/3 RPM */
const SECONDS_PER_REVOLUTION = 1.8;

/** AudioWorklet code for real-time scratch processing */
const SCRATCH_PROCESSOR_CODE = `
class ScratchProcessor extends AudioWorkletProcessor {
    position = 0;
    currentSpeed = 0;
    targetSpeed = 0;
    bufferL = null;
    bufferR = null;
    frameCount = 0;

    constructor() {
        super();
        this.port.onmessage = (e) => {
            if (e.data.type === 'load') {
                this.bufferL = new Float32Array(e.data.bufferL);
                this.bufferR = new Float32Array(e.data.bufferR);
                this.position = 0;
                this.currentSpeed = 0;
                this.targetSpeed = 0;
            } else if (e.data.type === 'speed') {
                this.targetSpeed = e.data.speed;
            } else if (e.data.type === 'seek') {
                const len = this.bufferL ? this.bufferL.length : 1;
                this.position = Math.max(0, Math.min(e.data.position, len - 1));
            } else if (e.data.type === 'reset') {
                this.position = 0;
                this.currentSpeed = 0;
                this.targetSpeed = 0;
                this.bufferL = null;
                this.bufferR = null;
            }
        };
    }

    process(_inputs, outputs, _parameters) {
        const output = outputs[0];
        const outL = output[0];
        const outR = output[1] || output[0];

        if (!this.bufferL || !this.bufferR) return true;

        const bufferLength = this.bufferL.length;

        for (let i = 0; i < outL.length; i++) {
            this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.3;
            
            const idx = Math.floor(this.position);
            const frac = this.position - idx;

            if (idx >= 0 && idx < bufferLength - 1) {
                const sample1L = this.bufferL[idx];
                const sample2L = this.bufferL[idx + 1];
                const sample1R = this.bufferR[idx];
                const sample2R = this.bufferR[idx + 1];
                
                outL[i] = sample1L * (1 - frac) + sample2L * frac;
                outR[i] = sample1R * (1 - frac) + sample2R * frac;
            } else {
                outL[i] = 0;
                outR[i] = 0;
            }

            this.position += this.currentSpeed;

            if (this.position < 0) {
                this.position = 0;
                this.currentSpeed = 0;
            }
            if (this.position >= bufferLength) {
                this.position = bufferLength - 1;
                this.currentSpeed = 0;
                this.targetSpeed = 0;
                this.port.postMessage({ ended: true });
            }
        }

        this.frameCount++;
        if (this.frameCount % 128 === 0) {
            this.port.postMessage({ position: this.position });
        }
        return true;
    }
}
registerProcessor('scratch-processor', ScratchProcessor);
`;

export interface ScratchEngineState {
    isLoading: boolean;
    isReady: boolean;
    position: number;
    sampleRate: number;
    duration: number;
}

export interface ScratchEngineActions {
    loadTrack: (path: string) => Promise<void>;
    setSpeed: (speed: number) => void;
    play: () => void;
    pause: () => void;
    seek: (seconds: number) => void;
    destroy: () => void;
    getPositionPercent: () => number;
}

export type ScratchEngine = ScratchEngineState & ScratchEngineActions;

/**
 * Hook to manage the DJ scratch audio engine.
 * Uses AudioWorklet for real-time pitch/speed manipulation.
 */
export const useScratchEngine = (
    isDJMode: boolean,
    onEnded?: () => void
): ScratchEngine => {
    const [state, setState] = useState<ScratchEngineState>({
        isLoading: false,
        isReady: false,
        position: 0,
        sampleRate: 44100,
        duration: 0,
    });

    const audioCtxRef = useRef<AudioContext | null>(null);
    const scratchNodeRef = useRef<AudioWorkletNode | null>(null);
    const currentPathRef = useRef<string | null>(null);

    const initAudioContext = useCallback(async () => {
        if (audioCtxRef.current) return audioCtxRef.current;

        const AudioContextClass = window.AudioContext || 
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();

        const blob = new Blob([SCRATCH_PROCESSOR_CODE], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);

        await audioCtxRef.current.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);

        scratchNodeRef.current = new AudioWorkletNode(
            audioCtxRef.current,
            'scratch-processor'
        );
        scratchNodeRef.current.connect(audioCtxRef.current.destination);

        scratchNodeRef.current.port.onmessage = (e) => {
            if (e.data.position !== undefined) {
                setState((prev) => ({ ...prev, position: e.data.position }));
            }
            if (e.data.ended) {
                onEnded?.();
            }
        };

        setState((prev) => ({
            ...prev,
            sampleRate: audioCtxRef.current!.sampleRate,
        }));

        return audioCtxRef.current;
    }, [onEnded]);

    const loadTrack = useCallback(async (path: string) => {
        if (!isDJMode) return;
        
        // Always reload if path changed
        const isSamePath = currentPathRef.current === path;
        if (isSamePath && state.isReady) return;

        // Reset and load new track
        if (!isSamePath && scratchNodeRef.current) {
            scratchNodeRef.current.port.postMessage({ type: 'reset' });
        }

        setState((prev) => ({ ...prev, isLoading: true, isReady: false }));

        const ctx = await initAudioContext();

        if (!ctx || !scratchNodeRef.current) {
            setState((prev) => ({ ...prev, isLoading: false }));
            return;
        }

        currentPathRef.current = path;

        try {
            const streamUrl = `/api/stream?path=${encodeURIComponent(path)}`;
            const response = await fetch(streamUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

            const bufferL = audioBuffer.getChannelData(0);
            const bufferR = audioBuffer.numberOfChannels > 1
                ? audioBuffer.getChannelData(1)
                : bufferL;

            scratchNodeRef.current.port.postMessage({
                type: 'load',
                bufferL: bufferL,
                bufferR: bufferR,
            });

            setState((prev) => ({
                ...prev,
                isLoading: false,
                isReady: true,
                position: 0,
                duration: audioBuffer.duration,
            }));
        } catch (error) {
            console.error('Failed to load track for DJ mode:', error);
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [isDJMode, state.isReady, initAudioContext]);

    const setSpeed = useCallback((speed: number) => {
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        scratchNodeRef.current?.port.postMessage({ type: 'speed', speed });
    }, []);

    const play = useCallback(() => {
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        setSpeed(1.0);
    }, [setSpeed]);

    const pause = useCallback(() => {
        setSpeed(0);
    }, [setSpeed]);

    const seek = useCallback((seconds: number) => {
        if (!audioCtxRef.current) return;
        const samples = seconds * state.sampleRate;
        scratchNodeRef.current?.port.postMessage({ type: 'seek', position: samples });
    }, [state.sampleRate]);

    const destroy = useCallback(() => {
        scratchNodeRef.current?.port.postMessage({ type: 'reset' });
        currentPathRef.current = null;
        setState((prev) => ({
            ...prev,
            isReady: false,
            position: 0,
            duration: 0,
        }));
    }, []);

    const getPositionPercent = useCallback(() => {
        if (state.duration === 0) return 0;
        const positionSeconds = state.position / state.sampleRate;
        return (positionSeconds / state.duration) * 100;
    }, [state.position, state.sampleRate, state.duration]);

    useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
                scratchNodeRef.current = null;
            }
        };
    }, []);

    return {
        ...state,
        loadTrack,
        setSpeed,
        play,
        pause,
        seek,
        destroy,
        getPositionPercent,
    };
};

export { SECONDS_PER_REVOLUTION };

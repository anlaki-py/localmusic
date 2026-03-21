/**
 * Vinyl disk component for DJ scratch mode.
 * Displays a spinning vinyl record that can be dragged to scratch audio.
 * Visual rotation is synced to the audio playhead position.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { clsx } from 'clsx';
import { SECONDS_PER_REVOLUTION } from '@/hooks/useScratchEngine';

interface VinylDiskProps {
    cover?: string;
    isPlaying: boolean;
    isScratching: boolean;
    position: number;
    sampleRate: number;
    duration: number;
    onScratch: (speed: number) => void;
    onScratchStart: () => void;
    onScratchEnd: () => void;
    className?: string;
}

/**
 * Calculates the angle from center to pointer position.
 */
const getAngleFromCenter = (
    element: HTMLElement,
    clientX: number,
    clientY: number
): number => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX);
};

/**
 * Vinyl disk component with scratch interaction.
 * Visual rotation is synced to audio playhead.
 */
export const VinylDisk = ({
    cover,
    isPlaying,
    isScratching,
    position,
    sampleRate,
    duration,
    onScratch,
    onScratchStart,
    onScratchEnd,
    className,
}: VinylDiskProps) => {
    const vinylRef = useRef<HTMLDivElement>(null);
    const lastAngleRef = useRef(0);
    const lastTimeRef = useRef(0);
    const [rotationDeg, setRotationDeg] = useState(0);
    
    // Refs for smooth animation interpolation
    const lastPositionRef = useRef(position);
    const lastUpdateTimeRef = useRef(performance.now());
    const currentRotationRef = useRef(0);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!vinylRef.current) return;

        vinylRef.current.setPointerCapture(e.pointerId);
        lastAngleRef.current = getAngleFromCenter(
            vinylRef.current,
            e.clientX,
            e.clientY
        );
        lastTimeRef.current = performance.now();
        onScratchStart();
        e.preventDefault();
    }, [onScratchStart]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isScratching || !vinylRef.current) return;

        const currentAngle = getAngleFromCenter(
            vinylRef.current,
            e.clientX,
            e.clientY
        );
        let delta = currentAngle - lastAngleRef.current;

        while (delta > Math.PI) delta -= 2 * Math.PI;
        while (delta < -Math.PI) delta += 2 * Math.PI;

        const now = performance.now();
        const deltaTime = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        const deltaDegrees = (delta * 180) / Math.PI;
        currentRotationRef.current += deltaDegrees;
        setRotationDeg(currentRotationRef.current);

        if (deltaTime > 0) {
            const deltaSeconds = (delta / (2 * Math.PI)) * SECONDS_PER_REVOLUTION;
            let speed = deltaSeconds / deltaTime;
            speed = Math.max(-10, Math.min(10, speed));
            onScratch(speed);
        }

        lastAngleRef.current = currentAngle;
    }, [isScratching, onScratch]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (isScratching) {
            vinylRef.current?.releasePointerCapture(e.pointerId);
            onScratchEnd();
        }
    }, [isScratching, onScratchEnd]);

    // Smooth animation loop - interpolates rotation between position updates
    useEffect(() => {
        if (isScratching) return;

        let animationId: number;

        const animate = () => {
            const now = performance.now();
            const timeSinceUpdate = (now - lastUpdateTimeRef.current) / 1000;

            // Calculate expected rotation change based on playback speed
            // At normal speed (1.0), vinyl does 1 revolution per SECONDS_PER_REVOLUTION
            const revolutionsPerSecond = 1 / SECONDS_PER_REVOLUTION;
            const expectedDeltaRevolutions = revolutionsPerSecond * timeSinceUpdate;
            const expectedDeltaDegrees = expectedDeltaRevolutions * 360;

            // Add the expected rotation for smooth animation
            if (isPlaying) {
                currentRotationRef.current += expectedDeltaDegrees;
                setRotationDeg(currentRotationRef.current);
            }

            lastUpdateTimeRef.current = now;

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [isScratching, isPlaying]);

    // Sync rotation when position updates from audio engine
    useEffect(() => {
        if (isScratching) return;

        const currentSeconds = position / sampleRate;
        const revolutions = currentSeconds / SECONDS_PER_REVOLUTION;
        const degrees = revolutions * 360;
        
        currentRotationRef.current = degrees;
        setRotationDeg(degrees);
        lastPositionRef.current = position;
        lastUpdateTimeRef.current = performance.now();
    }, [position, sampleRate, isScratching]);

    const vinylStyles: React.CSSProperties = {
        transform: `rotate(${rotationDeg}deg)`,
    };

    const progressPercent = duration > 0 ? (position / sampleRate / duration) * 100 : 0;

    return (
        <div
            ref={vinylRef}
            className={clsx(
                'relative rounded-full cursor-grab select-none',
                'touch-none',
                isScratching && 'cursor-grabbing',
                className
            )}
            style={vinylStyles}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onLostPointerCapture={handlePointerUp}
        >
            {/* Vinyl grooves background */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `
                        radial-gradient(circle, #ddd 3%, transparent 4%),
                        radial-gradient(circle, #1a1a1a 4%, #1a1a1a 15%, transparent 16%),
                        repeating-radial-gradient(circle, #111, #111 2px, #1a1a1a 3px, #111 4px)
                    `,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(0,0,0,1)',
                }}
            />

            {/* Center label with cover art */}
            <div className="absolute inset-[15%] rounded-full overflow-hidden bg-aki-800">
                {cover ? (
                    <img
                        src={cover}
                        alt="Album cover"
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    <div className="w-full h-full bg-aki-700 flex items-center justify-center">
                        <span className="text-aki-muted text-xs">♪</span>
                    </div>
                )}
            </div>

            {/* White marker line for rotation visibility */}
            <div
                className="absolute top-[12%] left-1/2 w-1 h-8 bg-white/80 rounded-full"
                style={{
                    transform: 'translateX(-50%)',
                    boxShadow: '0 0 5px rgba(255,255,255,0.8)',
                }}
            />

            {/* Progress ring */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
            >
                <circle
                    cx="50"
                    cy="50"
                    r="47"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="47"
                    fill="none"
                    stroke="rgba(255,100,100,0.5)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercent * 2.96} 296`}
                    transform="rotate(-90 50 50)"
                />
            </svg>

            {/* Playing indicator glow */}
            {isPlaying && !isScratching && (
                <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                        background: 'radial-gradient(circle, transparent 60%, rgba(255,100,100,0.1) 100%)',
                    }}
                />
            )}
        </div>
    );
};

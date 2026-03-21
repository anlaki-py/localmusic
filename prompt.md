when I'm listening, make the album cover as a spinning disk that i can drag and scratch the song.. heres example in an HTML app i found 

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Web DJ Scratcher</title>
    <style>
        body {
            background-color: #121212;
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }

        .deck-container {
            background: #2a2a2a;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 2px 2px rgba(255,255,255,0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 25px;
        }

        /* The Vinyl Record CSS */
        .vinyl {
            width: 300px;
            height: 300px;
            border-radius: 50%;
            /* Realistic vinyl gradients */
            background: 
                radial-gradient(circle, #ddd 3%, transparent 4%), /* Spindle */
                radial-gradient(circle, #ff3366 4%, #ff3366 30%, transparent 31%), /* Label */
                repeating-radial-gradient(circle, #111, #111 2px, #1a1a1a 3px, #111 4px); /* Grooves */
            box-shadow: 0 10px 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(0,0,0,1);
            position: relative;
            cursor: grab;
            touch-action: none; /* Crucial for touch devices to prevent scrolling */
            transform-origin: center center;
        }

        .vinyl:active {
            cursor: grabbing;
        }

        /* White marker on the record to easily see rotation */
        .vinyl::after {
            content: '';
            position: absolute;
            top: 35px;
            left: 50%;
            width: 4px;
            height: 30px;
            background: white;
            transform: translateX(-50%);
            border-radius: 2px;
            box-shadow: 0 0 5px rgba(255,255,255,0.8);
        }

        .controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            width: 100%;
        }

        .buttons {
            display: flex;
            gap: 10px;
        }

        button, input[type="file"]::file-selector-button {
            padding: 10px 20px;
            background: #ff3366;
            border: none;
            color: white;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            transition: background 0.2s;
        }

        button:hover, input[type="file"]::file-selector-button:hover {
            background: #ff5588;
        }

        button:disabled {
            background: #555;
            color: #888;
            cursor: not-allowed;
        }

        input[type="file"] {
            color: #aaa;
        }

        #status {
            font-size: 14px;
            color: #aaa;
            height: 20px;
        }
    </style>
</head>
<body>

    <div class="deck-container">
        <h2>DJ Scratcher</h2>
        
        <div class="controls">
            <input type="file" id="audioInput" accept="audio/*">
            <div id="status">Upload a song to begin</div>
        </div>

        <div class="vinyl" id="vinyl"></div>

        <div class="buttons">
            <button id="playBtn" disabled>Play</button>
            <button id="pauseBtn" disabled>Pause</button>
        </div>
    </div>

    <script>
        // --- Inline AudioWorklet Code ---
        // This runs in a separate audio thread to process pitch/speed perfectly in real-time
        const workletCode = `
        class ScratchProcessor extends AudioWorkletProcessor {
            constructor() {
                super();
                this.position = 0;
                this.currentSpeed = 0;
                this.targetSpeed = 0;
                this.bufferL = null;
                this.bufferR = null;
                this.frameCount = 0;
                
                this.port.onmessage = (e) => {
                    if (e.data.type === 'load') {
                        this.bufferL = e.data.bufferL;
                        this.bufferR = e.data.bufferR;
                        this.position = 0;
                    } else if (e.data.type === 'speed') {
                        this.targetSpeed = e.data.speed;
                    }
                };
            }

            process(inputs, outputs, parameters) {
                const output = outputs[0];
                const outL = output[0];
                const outR = output[1] || output[0]; // Fallback if mono output
                
                if (!this.bufferL || !this.bufferR) return true;
                
                const bufferLength = this.bufferL.length;
                
                for (let i = 0; i < outL.length; i++) {
                    // Smooth the speed transition slightly to mimic turntable inertia and prevent harsh clicking
                    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.15;
                    
                    let idx = Math.floor(this.position);
                    let frac = this.position - idx;
                    
                    // Linear interpolation for smooth pitch shifting
                    if (idx >= 0 && idx < bufferLength - 1) {
                        outL[i] = this.bufferL[idx] * (1 - frac) + this.bufferL[idx + 1] * frac;
                        outR[i] = this.bufferR[idx] * (1 - frac) + this.bufferR[idx + 1] * frac;
                    } else {
                        outL[i] = 0;
                        outR[i] = 0;
                    }
                    
                    this.position += this.currentSpeed;
                    
                    // Clamp position to buffer bounds
                    if (this.position < 0) {
                        this.position = 0;
                        this.currentSpeed = 0;
                    }
                    if (this.position >= bufferLength) {
                        this.position = bufferLength - 1;
                        this.currentSpeed = 0;
                    }
                }
                
                // Send playhead position back to main thread for visual rotation
                this.frameCount++;
                if (this.frameCount % 5 === 0) {
                    this.port.postMessage({ position: this.position });
                }
                
                return true;
            }
        }
        registerProcessor('scratch-processor', ScratchProcessor);
        `;

        // --- Main Thread Logic ---
        let audioCtx;
        let scratchNode;
        let sampleRate = 44100;

        // State variables
        let isPlaying = false;
        let isScratching = false;
        let audioPosition = 0; // In samples
        
        // Interaction variables
        let lastMouseAngle = 0;
        let mouseDeltaAccumulator = 0;
        let lastFrameTime = 0;

        const SECONDS_PER_REVOLUTION = 1.8; // Standard 33 1/3 RPM vinyl speed

        // DOM Elements
        const vinyl = document.getElementById('vinyl');
        const audioInput = document.getElementById('audioInput');
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const status = document.getElementById('status');

        // Initialize Audio Engine
        async function initAudio() {
            if (audioCtx) return;
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            sampleRate = audioCtx.sampleRate;

            // Load worklet from inline string
            const blob = new Blob([workletCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            await audioCtx.audioWorklet.addModule(url);

            scratchNode = new AudioWorkletNode(audioCtx, 'scratch-processor');
            scratchNode.connect(audioCtx.destination);

            // Listen for playhead position updates from the audio thread
            scratchNode.port.onmessage = (e) => {
                if (e.data.position !== undefined) {
                    audioPosition = e.data.position;
                }
            };
        }

        // Handle File Upload
        audioInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            status.innerText = "Decoding audio... please wait.";
            playBtn.disabled = true;
            pauseBtn.disabled = true;

            await initAudio();

            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const audioBuffer = await audioCtx.decodeAudioData(ev.target.result);
                    
                    // Extract channels (handle mono or stereo)
                    const bufferL = audioBuffer.getChannelData(0);
                    const bufferR = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : bufferL;

                    // Send audio data to the Worklet
                    scratchNode.port.postMessage({ type: 'load', bufferL, bufferR });
                    
                    status.innerText = "Ready to scratch!";
                    playBtn.disabled = false;
                    pauseBtn.disabled = false;
                    audioPosition = 0;
                    isPlaying = false;
                } catch (err) {
                    status.innerText = "Error decoding audio file.";
                    console.error(err);
                }
            };
            reader.readAsArrayBuffer(file);
        });

        // Play / Pause Controls
        playBtn.addEventListener('click', async () => {
            await initAudio();
            if (audioCtx.state === 'suspended') await audioCtx.resume();
            isPlaying = true;
            status.innerText = "Playing";
        });

        pauseBtn.addEventListener('click', () => {
            isPlaying = false;
            status.innerText = "Paused";
        });

        // --- Scratching Interaction Logic ---

        function getAngle(e) {
            const rect = vinyl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            // Get exact coordinates whether it's touch or mouse
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return Math.atan2(clientY - centerY, clientX - centerX);
        }

        vinyl.addEventListener('pointerdown', (e) => {
            if (!scratchNode) return; // Ignore if no audio loaded
            isScratching = true;
            lastMouseAngle = getAngle(e);
            mouseDeltaAccumulator = 0;
            vinyl.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        vinyl.addEventListener('pointermove', (e) => {
            if (!isScratching) return;
            
            const currentAngle = getAngle(e);
            let delta = currentAngle - lastMouseAngle;
            
            // Handle wrap-around at -180/180 degrees
            while (delta > Math.PI) delta -= 2 * Math.PI;
            while (delta < -Math.PI) delta += 2 * Math.PI;

            mouseDeltaAccumulator += delta;
            lastMouseAngle = currentAngle;
        });

        const releaseScratch = (e) => {
            if (isScratching) {
                isScratching = false;
                vinyl.releasePointerCapture(e.pointerId);
            }
        };

        vinyl.addEventListener('pointerup', releaseScratch);
        vinyl.addEventListener('pointercancel', releaseScratch);

        // --- Animation & Physics Loop ---
        function loop(time) {
            if (!lastFrameTime) lastFrameTime = time;
            const deltaTime = (time - lastFrameTime) / 1000; // in seconds
            lastFrameTime = time;

            if (scratchNode && deltaTime > 0) {
                let targetSpeed = 0;

                if (isScratching) {
                    // Calculate how many seconds of audio the mouse rotation represents
                    // 1 Revolution (2 * PI radians) = SECONDS_PER_REVOLUTION
                    const deltaSeconds = (mouseDeltaAccumulator / (2 * Math.PI)) * SECONDS_PER_REVOLUTION;
                    
                    // Speed = Distance / Time
                    targetSpeed = deltaSeconds / deltaTime;
                    
                    // Clamp extreme speeds to prevent audio glitches on mouse jumps
                    targetSpeed = Math.max(-15, Math.min(15, targetSpeed));
                    
                    mouseDeltaAccumulator = 0; // Reset for next frame
                } else {
                    targetSpeed = isPlaying ? 1.0 : 0.0;
                }

                // Send the calculated speed to the AudioWorklet
                scratchNode.port.postMessage({ type: 'speed', speed: targetSpeed });

                // Sync the visual rotation perfectly to the exact audio playhead position
                // This ensures visuals and audio never drift apart
                const currentSeconds = audioPosition / sampleRate;
                const revolutions = currentSeconds / SECONDS_PER_REVOLUTION;
                const degrees = revolutions * 360;
                
                vinyl.style.transform = `rotate(${degrees}deg)`;
            }

            requestAnimationFrame(loop);
        }

        // Start the loop
        requestAnimationFrame(loop);

    </script>
</body>
</html>
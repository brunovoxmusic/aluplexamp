/**
 * ALUPLEXamp Audio Demo Generator
 * Synthesizes 5 guitar amp tones using Karplus-Strong algorithm + tube amp simulation
 * 
 * Track 1: "The Woody Clean" — clean, warm, low gain
 * Track 2: "The Iconic British Crunch" — mid gain, aggressive mids
 * Track 3: "Brown Sound High Gain" — high gain, saturated
 * Track 4: "The Dynamic Breakup" — edge of breakup, dynamic
 * Track 5: "The Volume Roll-Off" — volume knob roll-off effect
 */

import { writeFileSync, mkdirSync } from 'fs';

// ==================== AUDIO ENGINE ====================
const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;
const CHANNELS = 1;
const DURATION = 10; // seconds

// ==================== WAV WRITER ====================
function writeWav(samples, filename) {
  const numSamples = samples.length;
  const byteRate = SAMPLE_RATE * CHANNELS * (BIT_DEPTH / 8);
  const blockAlign = CHANNELS * (BIT_DEPTH / 8);
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  
  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size
  buffer.writeUInt16LE(1, 20);  // PCM
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(BIT_DEPTH, 34);
  
  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Write samples as 16-bit PCM
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const intVal = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    buffer.writeInt16LE(Math.round(intVal), 44 + i * 2);
  }
  
  writeFileSync(filename, buffer);
  console.log(`  ✓ ${filename} (${(buffer.length / 1024 / 1024).toFixed(2)} MB, ${DURATION}s)`);
}

// ==================== KARPLUS-STRONG GUITAR ====================
function karplusStrong(freq, duration, sampleRate, pluckPosition = 0.4, decayFactor = 0.996) {
  const numSamples = Math.floor(sampleRate * duration);
  const period = Math.round(sampleRate / freq);
  const samples = new Float64Array(numSamples);
  
  // Initialize delay line with noise (pluck excitation)
  const delayLine = new Float64Array(period);
  const excitationPoint = Math.floor(period * pluckPosition);
  
  // Low-pass filtered noise for more natural pluck
  let lastNoise = 0;
  for (let i = 0; i < period; i++) {
    const noise = (Math.random() * 2 - 1);
    // Simple one-pole lowpass
    lastNoise = lastNoise * 0.5 + noise * 0.5;
    // Shape: triangular based on pluck position
    const shape = i < excitationPoint 
      ? i / excitationPoint 
      : (period - i) / (period - excitationPoint);
    delayLine[i] = lastNoise * shape;
  }
  
  let readPos = 0;
  let writePos = 0;
  
  for (let i = 0; i < numSamples; i++) {
    // Read from delay line
    const current = delayLine[readPos];
    
    // Average with previous sample (Karplus-Strong lowpass)
    const nextIdx = (readPos + 1) % period;
    const avg = (delayLine[readPos] + delayLine[nextIdx]) * 0.5;
    
    // Write back with decay
    delayLine[writePos] = avg * decayFactor;
    
    samples[i] = current;
    
    readPos = (readPos + 1) % period;
    writePos = (writePos + 1) % period;
  }
  
  return samples;
}

// ==================== TUBE AMP SIMULATION ====================

// Soft clipping (tube saturation) using tanh with asymmetry
function tubeSaturate(input, drive) {
  // Asymmetric clipping simulates tube push-pull asymmetry
  const positiveDrive = drive * 1.0;
  const negativeDrive = drive * 0.85;
  
  const pos = input >= 0 
    ? Math.tanh(input * positiveDrive) 
    : Math.tanh(input * negativeDrive);
  
  return pos;
}

// Simple 2nd order IIR lowpass filter
function createLowpass(freq, q = 0.707) {
  const w0 = 2 * Math.PI * freq / SAMPLE_RATE;
  const alpha = Math.sin(w0) / (2 * q);
  const cosw0 = Math.cos(w0);
  const a0 = 1 + alpha;
  return {
    b0: ((1 - cosw0) / 2) / a0,
    b1: (1 - cosw0) / a0,
    b2: ((1 - cosw0) / 2) / a0,
    a1: (-2 * cosw0) / a0,
    a2: (1 - alpha) / a0,
    x1: 0, x2: 0, y1: 0, y2: 0,
    process(x) {
      const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 
              - this.a1 * this.y1 - this.a2 * this.y2;
      this.x2 = this.x1; this.x1 = x;
      this.y2 = this.y1; this.y1 = y;
      return y;
    }
  };
}

// Simple 2nd order IIR highpass filter  
function createHighpass(freq, q = 0.707) {
  const w0 = 2 * Math.PI * freq / SAMPLE_RATE;
  const alpha = Math.sin(w0) / (2 * q);
  const cosw0 = Math.cos(w0);
  const a0 = 1 + alpha;
  return {
    b0: ((1 + cosw0) / 2) / a0,
    b1: -(1 + cosw0) / a0,
    b2: ((1 + cosw0) / 2) / a0,
    a1: (-2 * cosw0) / a0,
    a2: (1 - alpha) / a0,
    x1: 0, x2: 0, y1: 0, y2: 0,
    process(x) {
      const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2
              - this.a1 * this.y1 - this.a2 * this.y2;
      this.x2 = this.x1; this.x1 = x;
      this.y2 = this.y1; this.y1 = y;
      return y;
    }
  };
}

// Peaking EQ
function createPeaking(freq, gainDb, q = 1.0) {
  const A = Math.pow(10, gainDb / 40);
  const w0 = 2 * Math.PI * freq / SAMPLE_RATE;
  const alpha = Math.sin(w0) / (2 * q);
  const cosw0 = Math.cos(w0);
  const a0 = 1 + alpha / A;
  return {
    b0: (1 + alpha * A) / a0,
    b1: (-2 * cosw0) / a0,
    b2: (1 - alpha * A) / a0,
    a1: (-2 * cosw0) / a0,
    a2: (1 - alpha / A) / a0,
    x1: 0, x2: 0, y1: 0, y2: 0,
    process(x) {
      const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2
              - this.a1 * this.y1 - this.a2 * this.y2;
      this.x2 = this.x1; this.x1 = x;
      this.y2 = this.y1; this.y1 = y;
      return y;
    }
  };
}

// Simple reverb using delay lines (schroeder reverb approximation)
function createReverb(wetLevel = 0.15, decayTime = 0.8) {
  const delays = [0.0371, 0.0411, 0.0437, 0.0507, 0.0577, 0.0613, 0.0689, 0.0723];
  const gain = Math.pow(0.001, 1 / (SAMPLE_RATE * decayTime));
  const lines = delays.map(d => ({
    buffer: new Float64Array(Math.ceil(d * SAMPLE_RATE)),
    pos: 0,
    length: Math.ceil(d * SAMPLE_RATE)
  }));
  
  let lastOut = 0;
  
  return {
    process(input) {
      let output = 0;
      for (const line of lines) {
        const delayed = line.buffer[line.pos];
        const feedback = delayed * gain;
        line.buffer[line.pos] = input + feedback;
        output += delayed;
        line.pos = (line.pos + 1) % line.length;
      }
      output /= lines.length;
      lastOut = lastOut * 0.9 + output * 0.1; // smooth
      return input * (1 - wetLevel) + lastOut * wetLevel;
    }
  };
}

// Simple compressor
function createCompressor(threshold = 0.3, ratio = 4, attack = 0.005, release = 0.05) {
  const envCoeff = Math.exp(-1 / (SAMPLE_RATE * 0.005));
  let envelope = 0;
  
  return {
    process(input) {
      const abs = Math.abs(input);
      // Envelope follower
      if (abs > envelope) {
        envelope += (abs - envelope) * (1 - Math.exp(-1 / (SAMPLE_RATE * attack)));
      } else {
        envelope += (abs - envelope) * (1 - Math.exp(-1 / (SAMPLE_RATE * release)));
      }
      
      // Gain reduction
      let gain = 1;
      if (envelope > threshold) {
        gain = 1 - ((envelope - threshold) * (1 - 1/ratio)) / envelope;
      }
      
      return input * gain;
    }
  };
}

// ==================== NOTE DEFINITIONS ====================
const NOTES = {
  E2: 82.41, A2: 110, D3: 146.83, G3: 196, B3: 246.94, E4: 329.63,
  F2: 87.31, G2: 98, Bb2: 116.54, C3: 130.81, Eb3: 155.56, F3: 174.61, Ab3: 207.65,
};

// ==================== TRACK GENERATORS ====================

// Helper: apply chain of processors to samples
function processChain(samples, processors) {
  const output = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    let val = samples[i];
    for (const proc of processors) {
      val = proc.process(val);
    }
    output[i] = val;
  }
  return output;
}

// Mix multiple note tracks into one buffer
function mixTracks(tracks, numSamples) {
  const output = new Float64Array(numSamples);
  for (const track of tracks) {
    const scale = 1 / tracks.length; // prevent clipping from multiple tracks
    for (let i = 0; i < track.length && i < numSamples; i++) {
      output[i] += track[i] * scale;
    }
  }
  return output;
}

// Normalize audio
function normalize(samples, targetLevel = 0.85) {
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    max = Math.max(max, Math.abs(samples[i]));
  }
  if (max === 0) return samples;
  const scale = targetLevel / max;
  for (let i = 0; i < samples.length; i++) {
    samples[i] *= scale;
  }
  return samples;
}

// Apply envelope (ADSR-like for note shaping)
function applyEnvelope(samples, attack = 0.002, decay = 0.3, sustain = 0.6, release = 0.1) {
  const numSamples = samples.length;
  const attackSamples = Math.floor(SAMPLE_RATE * attack);
  const decaySamples = Math.floor(SAMPLE_RATE * decay);
  const releaseSamples = Math.floor(SAMPLE_RATE * release);
  const sustainStart = attackSamples + decaySamples;
  const sustainEnd = numSamples - releaseSamples;
  
  for (let i = 0; i < numSamples; i++) {
    let gain = sustain;
    if (i < attackSamples) {
      gain = i / attackSamples;
    } else if (i < sustainStart) {
      const t = (i - attackSamples) / decaySamples;
      gain = 1 - (1 - sustain) * t;
    } else if (i > sustainEnd) {
      const t = (i - sustainEnd) / releaseSamples;
      gain = sustain * (1 - t);
    }
    samples[i] *= gain;
  }
  return samples;
}

/**
 * Track 1: "The Woody Clean"
 * Clean, warm, woody tone — minimal saturation, warm low-mids
 * Fender Stratocaster neck pickup, Gain: 2
 */
function generateTrack1() {
  console.log('  Generating Track 1: The Woody Clean...');
  const numSamples = SAMPLE_RATE * DURATION;
  const noteEvents = [
    { note: NOTES.E2, start: 0, dur: 2.5 },
    { note: NOTES.A2, start: 2.0, dur: 2.5 },
    { note: NOTES.D3, start: 4.0, dur: 2.5 },
    { note: NOTES.G3, start: 5.5, dur: 2.0 },
    { note: NOTES.B3, start: 7.0, dur: 1.5 },
    { note: NOTES.E4, start: 8.0, dur: 1.8 },
    { note: NOTES.E2, start: 0.5, dur: 2.0 },  // bass note harmony
    { note: NOTES.A2, start: 2.5, dur: 2.0 },
    { note: NOTES.E3, start: 4.5, dur: 2.0 },
    { note: NOTES.B2, start: 6.5, dur: 2.0 },
    { note: NOTES.E3, start: 8.5, dur: 1.2 },
  ];
  
  const tracks = noteEvents.map(ev => {
    const samples = karplusStrong(ev.note, ev.dur, SAMPLE_RATE, 0.35, 0.9975);
    applyEnvelope(samples, 0.003, 0.2, 0.7, 0.3);
    // Place in timeline
    const placed = new Float64Array(numSamples);
    const startSample = Math.floor(ev.start * SAMPLE_RATE);
    for (let i = 0; i < samples.length && (startSample + i) < numSamples; i++) {
      placed[startSample + i] = samples[i];
    }
    return placed;
  });
  
  let mixed = mixTracks(tracks, numSamples);
  
  // Processing chain: clean tone
  // Warm EQ: slight bass boost, gentle presence roll-off
  const hp = createHighpass(80);
  const lp = createLowpass(4500, 0.7);
  const bassBoost = createPeaking(120, 3, 1.5);     // warm low end
  const midBoost = createPeaking(800, 2, 1.2);      // woody mids
  const presenceCut = createPeaking(3000, -4, 1.0); // soft top
  const comp = createCompressor(0.4, 2, 0.01, 0.1);
  const reverb = createReverb(0.2, 1.2);
  
  mixed = processChain(mixed, [hp, bassBoost, midBoost, presenceCut, comp, lp, reverb]);
  
  // Very light saturation — just a touch of warmth
  for (let i = 0; i < mixed.length; i++) {
    mixed[i] = tubeSaturate(mixed[i], 1.5);
  }
  
  return normalize(mixed, 0.8);
}

/**
 * Track 2: "The Iconic British Crunch"
 * Classic plexi crunch — medium gain, aggressive midrange
 * Gibson Les Paul bridge humbucker, Gain: 5
 */
function generateTrack2() {
  console.log('  Generating Track 2: The Iconic British Crunch...');
  const numSamples = SAMPLE_RATE * DURATION;
  
  // Power chord riff (E5, A5, G5 pattern)
  const noteEvents = [
    // E5 power chord: E2 + B2 + E3
    { note: NOTES.E2, start: 0, dur: 1.0 },
    { note: NOTES.B2, start: 0, dur: 1.0 },
    { note: NOTES.E3, start: 0, dur: 0.9 },
    // Rest
    // A5 power chord: A2 + E3 + A3
    { note: NOTES.A2, start: 1.2, dur: 1.0 },
    { note: NOTES.E3, start: 1.2, dur: 1.0 },
    { note: NOTES.A2 * 2, start: 1.2, dur: 0.9 },
    // G5 
    { note: NOTES.G2, start: 2.4, dur: 1.0 },
    { note: NOTES.D3, start: 2.4, dur: 1.0 },
    { note: NOTES.G3, start: 2.4, dur: 0.9 },
    // E5 again
    { note: NOTES.E2, start: 3.5, dur: 1.5 },
    { note: NOTES.B2, start: 3.5, dur: 1.5 },
    { note: NOTES.E3, start: 3.5, dur: 1.4 },
    // Second phrase - lower dynamics
    { note: NOTES.E2, start: 5.5, dur: 0.8 },
    { note: NOTES.B2, start: 5.5, dur: 0.8 },
    { note: NOTES.A2, start: 6.5, dur: 0.8 },
    { note: NOTES.E3, start: 6.5, dur: 0.8 },
    { note: NOTES.G2, start: 7.3, dur: 1.0 },
    { note: NOTES.D3, start: 7.3, dur: 1.0 },
    { note: NOTES.G3, start: 7.3, dur: 0.9 },
    // Final E5
    { note: NOTES.E2, start: 8.5, dur: 1.5 },
    { note: NOTES.B2, start: 8.5, dur: 1.5 },
    { note: NOTES.E3, start: 8.5, dur: 1.4 },
  ];
  
  const tracks = noteEvents.map(ev => {
    const samples = karplusStrong(ev.note, ev.dur, SAMPLE_RATE, 0.5, 0.9955);
    applyEnvelope(samples, 0.001, 0.15, 0.75, 0.2);
    const placed = new Float64Array(numSamples);
    const startSample = Math.floor(ev.start * SAMPLE_RATE);
    for (let i = 0; i < samples.length && (startSample + i) < numSamples; i++) {
      placed[startSample + i] = samples[i];
    }
    return placed;
  });
  
  let mixed = mixTracks(tracks, numSamples);
  
  // British crunch processing: mid-forward, aggressive
  const hp = createHighpass(100);
  const midScoop = createPeaking(800, 6, 2.0);     // aggressive mids
  const presenceBoost = createPeaking(3500, 4, 1.5); // plexi presence
  const bassCut = createPeaking(100, -2, 1.0);       // tighter low end
  const lp = createLowpass(7000, 0.8);
  const comp = createCompressor(0.25, 3, 0.003, 0.08);
  const reverb = createReverb(0.12, 0.7);
  
  mixed = processChain(mixed, [hp, bassCut, midScoop, presenceBoost, lp]);
  
  // Medium saturation — crunch level
  for (let i = 0; i < mixed.length; i++) {
    mixed[i] = tubeSaturate(mixed[i], 3.0);
  }
  
  // Post-saturation comp and reverb
  mixed = processChain(mixed, [comp, reverb]);
  
  return normalize(mixed, 0.82);
}

/**
 * Track 3: "Brown Sound High Gain"
 * Saturated lead tone — high gain, creamy compression
 * Gibson Les Paul bridge humbucker, Gain: 8
 */
function generateTrack3() {
  console.log('  Generating Track 3: Brown Sound High Gain...');
  const numSamples = SAMPLE_RATE * DURATION;
  
  // Sustained lead notes with vibrato-like effect
  const noteEvents = [
    // Opening sustained note
    { note: NOTES.B3, start: 0, dur: 2.0 },
    { note: NOTES.G3, start: 0, dur: 2.0 },   // double stop
    // Bending feel - ascending
    { note: NOTES.Eb3, start: 2.2, dur: 1.5 },
    // Descending run
    { note: NOTES.E4, start: 3.8, dur: 0.8 },
    { note: NOTES.Eb3 * 2, start: 4.5, dur: 0.8 },
    { note: NOTES.C3 * 2, start: 5.2, dur: 1.0 },
    // Sustained notes
    { note: NOTES.G3, start: 6.2, dur: 1.5 },
    { note: NOTES.B2, start: 6.2, dur: 1.5 },
    // Final bend
    { note: NOTES.Eb3, start: 7.8, dur: 2.0 },
    { note: NOTES.Bb2, start: 7.8, dur: 2.0 },
  ];
  
  const tracks = noteEvents.map(ev => {
    const samples = karplusStrong(ev.note, ev.dur, SAMPLE_RATE, 0.55, 0.9965);
    applyEnvelope(samples, 0.005, 0.3, 0.85, 0.4);
    // Add slight detuning for chorus effect (simulate vibrato)
    const vibratoRate = 5.5; // Hz
    const vibratoDepth = ev.dur > 1.5 ? 2.5 : 1.0;
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      // Subtle amplitude modulation for expression
      const vibrato = 1 + 0.03 * Math.sin(2 * Math.PI * vibratoRate * t) * vibratoDepth;
      samples[i] *= vibrato;
    }
    const placed = new Float64Array(numSamples);
    const startSample = Math.floor(ev.start * SAMPLE_RATE);
    for (let i = 0; i < samples.length && (startSample + i) < numSamples; i++) {
      placed[startSample + i] = samples[i];
    }
    return placed;
  });
  
  let mixed = mixTracks(tracks, numSamples);
  
  // Brown sound: boosted mids, creamy compression, focused
  const hp = createHighpass(120);
  const lowMidBoost = createPeaking(400, 5, 1.5);    // thick lows
  const midBoost = createPeaking(1000, 4, 1.8);       // vocal mids
  const presenceBoost = createPeaking(2800, 3, 1.2);  // cut-through presence
  const topCut = createPeaking(6000, -6, 0.8);        // smooth top
  const lp = createLowpass(5500, 0.7);
  
  mixed = processChain(mixed, [hp, lowMidBoost, midBoost, presenceBoost, topCut, lp]);
  
  // Heavy saturation — sustain and compression
  // Two-stage saturation for smooth sustain
  for (let i = 0; i < mixed.length; i++) {
    mixed[i] = tubeSaturate(mixed[i] * 1.2, 5.0);
    mixed[i] = tubeSaturate(mixed[i], 2.0);
  }
  
  const comp = createCompressor(0.15, 6, 0.002, 0.15);
  const reverb = createReverb(0.18, 1.0);
  mixed = processChain(mixed, [comp, reverb]);
  
  return normalize(mixed, 0.78);
}

/**
 * Track 4: "The Dynamic Breakup"
 * Edge of breakup, touch-sensitive — clean that breaks up when hit harder
 * Fender Telecaster bridge pickup, Gain: 4
 */
function generateTrack4() {
  console.log('  Generating Track 4: The Dynamic Breakup...');
  const numSamples = SAMPLE_RATE * DURATION;
  
  // Dynamic picking pattern — soft then hard
  const noteEvents = [
    // Soft fingerpicked passage
    { note: NOTES.E2, start: 0, dur: 1.5, vel: 0.5 },
    { note: NOTES.G3, start: 0.3, dur: 1.0, vel: 0.4 },
    { note: NOTES.B3, start: 0.7, dur: 0.8, vel: 0.35 },
    { note: NOTES.E4, start: 1.1, dur: 0.8, vel: 0.4 },
    // Slightly harder
    { note: NOTES.A2, start: 2.0, dur: 1.2, vel: 0.65 },
    { note: NOTES.E3, start: 2.4, dur: 1.0, vel: 0.6 },
    { note: NOTES.A3, start: 2.8, dur: 0.8, vel: 0.65 },
    // Hard strum — breakup!
    { note: NOTES.E2, start: 4.0, dur: 1.5, vel: 1.0 },
    { note: NOTES.B2, start: 4.0, dur: 1.5, vel: 0.95 },
    { note: NOTES.E3, start: 4.0, dur: 1.4, vel: 0.9 },
    // Back to soft
    { note: NOTES.G3, start: 5.8, dur: 1.2, vel: 0.45 },
    { note: NOTES.D3, start: 6.2, dur: 1.0, vel: 0.4 },
    { note: NOTES.G2, start: 6.5, dur: 1.0, vel: 0.5 },
    // Final hard hit
    { note: NOTES.E2, start: 7.8, dur: 2.0, vel: 1.0 },
    { note: NOTES.B2, start: 7.8, dur: 2.0, vel: 0.95 },
    { note: NOTES.E3, start: 7.8, dur: 1.9, vel: 0.9 },
  ];
  
  const tracks = noteEvents.map(ev => {
    // Velocity affects pluck brightness
    const pluckPos = 0.3 + (1 - ev.vel) * 0.4; // harder = brighter pluck
    const decay = 0.994 + ev.vel * 0.004;       // harder = longer sustain
    const samples = karplusStrong(ev.note, ev.dur, SAMPLE_RATE, pluckPos, decay);
    applyEnvelope(samples, 0.001, 0.2, 0.6 * ev.vel, 0.25);
    // Scale by velocity
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= (0.3 + ev.vel * 0.7);
    }
    const placed = new Float64Array(numSamples);
    const startSample = Math.floor(ev.start * SAMPLE_RATE);
    for (let i = 0; i < samples.length && (startSample + i) < numSamples; i++) {
      placed[startSample + i] = samples[i];
    }
    return placed;
  });
  
  let mixed = mixTracks(tracks, numSamples);
  
  // Tele bridge: bright, snappy, mid-scooped
  const hp = createHighpass(90);
  const trebleBoost = createPeaking(3000, 5, 1.5);   // Tele bite
  const midScoop = createPeaking(700, -3, 1.2);      // scooped mids
  const bassCut = createPeaking(150, -3, 1.0);
  const presenceBoost = createPeaking(5000, 4, 1.0);
  const lp = createLowpass(8000, 0.7);
  
  mixed = processChain(mixed, [hp, bassCut, midScoop, trebleBoost, presenceBoost, lp]);
  
  // Edge-of-breakup saturation — only loud parts distort
  // Soft clipper that lets quiet parts stay clean
  for (let i = 0; i < mixed.length; i++) {
    const abs = Math.abs(mixed[i]);
    if (abs > 0.3) {
      // Only saturate above threshold — dynamics preserved
      mixed[i] = tubeSaturate(mixed[i], 3.5);
    } else {
      mixed[i] = tubeSaturate(mixed[i], 1.8); // very light for quiet parts
    }
  }
  
  const comp = createCompressor(0.35, 2.5, 0.005, 0.08);
  const reverb = createReverb(0.1, 0.6);
  mixed = processChain(mixed, [comp, reverb]);
  
  return normalize(mixed, 0.8);
}

/**
 * Track 5: "The Volume Roll-Off"
 * Guitar volume knob interaction — starts dirty, rolls back to clean
 * Gibson Les Paul bridge humbucker, Gain: 6
 */
function generateTrack5() {
  console.log('  Generating Track 5: The Volume Roll-Off...');
  const numSamples = SAMPLE_RATE * DURATION;
  
  // Same riff played throughout — we'll vary the input gain
  const riffPattern = [
    { note: NOTES.E2, offset: 0, dur: 0.8 },
    { note: NOTES.B2, offset: 0, dur: 0.7 },
    { note: NOTES.E3, offset: 0, dur: 0.6 },
    { note: NOTES.A2, offset: 1.0, dur: 0.8 },
    { note: NOTES.E3, offset: 1.0, dur: 0.7 },
    { note: NOTES.G2, offset: 2.0, dur: 0.8 },
    { note: NOTES.D3, offset: 2.0, dur: 0.7 },
    { note: NOTES.E2, offset: 3.0, dur: 0.8 },
    { note: NOTES.B2, offset: 3.0, dur: 0.7 },
  ];
  
  // Create repeating riff
  const tracks = [];
  let time = 0;
  while (time < DURATION - 1) {
    for (const ev of riffPattern) {
      if (time + ev.offset >= DURATION) continue;
      const samples = karplusStrong(ev.note, ev.dur, SAMPLE_RATE, 0.5, 0.996);
      applyEnvelope(samples, 0.001, 0.15, 0.7, 0.15);
      const placed = new Float64Array(numSamples);
      const startSample = Math.floor((time + ev.offset) * SAMPLE_RATE);
      for (let i = 0; i < samples.length && (startSample + i) < numSamples; i++) {
        placed[startSample + i] = samples[i];
      }
      tracks.push(placed);
    }
    time += 4.0;
  }
  
  let mixed = mixTracks(tracks, numSamples);
  
  // Volume roll-off curve: start dirty (100%), roll to clean (30%), back to dirty
  const volumeCurve = new Float64Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let vol;
    if (t < 2) {
      vol = 1.0; // Full volume — dirty
    } else if (t < 5) {
      // Smooth roll-off to clean
      const p = (t - 2) / 3;
      vol = 1.0 - 0.7 * (3 * p * p - 2 * p * p * p); // smoothstep
    } else if (t < 7) {
      vol = 0.3; // Clean
    } else {
      // Roll back to dirty
      const p = (t - 7) / 3;
      vol = 0.3 + 0.7 * (3 * p * p - 2 * p * p * p);
    }
    volumeCurve[i] = vol;
  }
  
  // Apply volume curve BEFORE saturation (like real guitar volume knob)
  for (let i = 0; i < mixed.length; i++) {
    mixed[i] *= volumeCurve[i];
  }
  
  // British EQ chain
  const hp = createHighpass(100);
  const midBoost = createPeaking(800, 5, 2.0);     // classic mids
  const presenceBoost = createPeaking(3500, 3, 1.3);
  const lp = createLowpass(6500, 0.8);
  
  mixed = processChain(mixed, [hp, midBoost, presenceBoost, lp]);
  
  // Saturation — the key is that the rolled-back signal distorts less
  // Higher input = more saturation = dirtier
  for (let i = 0; i < mixed.length; i++) {
    mixed[i] = tubeSaturate(mixed[i], 4.0);
  }
  
  const comp = createCompressor(0.2, 4, 0.003, 0.1);
  const reverb = createReverb(0.15, 0.8);
  mixed = processChain(mixed, [comp, reverb]);
  
  return normalize(mixed, 0.8);
}

// ==================== MAIN ====================
console.log('🎸 ALUPLEXamp Audio Demo Generator');
console.log('   Generating 5 EL34 British Roar Edition guitar tones...\n');

mkdirSync('public/audio', { recursive: true });

const track1 = generateTrack1();
writeWav(track1, 'public/audio/track1-woody-clean.wav');

const track2 = generateTrack2();
writeWav(track2, 'public/audio/track2-british-crunch.wav');

const track3 = generateTrack3();
writeWav(track3, 'public/audio/track3-brown-sound.wav');

const track4 = generateTrack4();
writeWav(track4, 'public/audio/track4-dynamic-breakup.wav');

const track5 = generateTrack5();
writeWav(track5, 'public/audio/track5-volume-rolloff.wav');

console.log('\n✅ All 5 audio tracks generated successfully!');
console.log('   These are synthesized guitar amp tones — not TTS.');
console.log('   Each track demonstrates a different EL34 tube amp character.\n');

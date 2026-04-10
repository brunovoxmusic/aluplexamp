/**
 * ALUPLEXamp Audio Demo Generator v2
 * Uses additive synthesis + waveshaping for realistic guitar amp tones
 * More numerically stable than Karplus-Strong
 */

import { writeFileSync, mkdirSync } from 'fs';

const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;
const DURATION = 10;

// ==================== WAV WRITER ====================
function writeWav(samples, filename) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);       // PCM
  buffer.writeUInt16LE(1, 22);       // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);       // block align
  buffer.writeUInt16LE(16, 34);      // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] || 0));
    buffer.writeInt16LE(s < 0 ? Math.round(s * 32768) : Math.round(s * 32767), 44 + i * 2);
  }
  
  writeFileSync(filename, buffer);
  console.log(`  ✓ ${filename} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

// ==================== WAVESHAPER (Tube Saturation) ====================
function createWaveshaper(drive = 1, asymmetry = 0.15) {
  // Pre-compute lookup table for speed
  const TABLE_SIZE = 8192;
  const table = new Float32Array(TABLE_SIZE);
  for (let i = 0; i < TABLE_SIZE; i++) {
    const x = (i / (TABLE_SIZE - 1)) * 2 - 1; // -1 to 1
    const d = drive;
    // Soft clip with asymmetric tube character
    if (x >= 0) {
      table[i] = Math.tanh(x * d) / Math.tanh(d);
    } else {
      table[i] = Math.tanh(x * d * (1 - asymmetry)) / Math.tanh(d * (1 - asymmetry));
    }
  }
  
  return {
    process(input) {
      const idx = Math.floor(((input + 1) * 0.5) * (TABLE_SIZE - 1));
      if (idx < 0) return table[0];
      if (idx >= TABLE_SIZE) return table[TABLE_SIZE - 1];
      return table[idx];
    }
  };
}

// ==================== ONE-POLE FILTERS (numerically stable) ====================
function createOnePole(freq, type = 'lowpass') {
  const w = 2 * Math.PI * freq / SAMPLE_RATE;
  // Clamp to avoid instability
  const cw = Math.min(w, 0.999);
  const b = type === 'lowpass'
    ? cw / (1 + cw)
    : 1 / (1 + cw);
  const a = type === 'lowpass'
    ? (1 - cw) / (1 + cw)
    : -(1 - cw) / (1 + cw);
  let y1 = 0, x1 = 0;
  return {
    process(x) {
      const y = b * x + a * y1;
      y1 = y; x1 = x;
      return y;
    },
    reset() { y1 = 0; x1 = 0; }
  };
}

// State Variable Filter (more stable biquad alternative)
function createSVF(freq, q = 1.0, type = 'lowpass') {
  const f = Math.min(freq / SAMPLE_RATE, 0.49);
  const k = Math.min(q * f * Math.PI, 50);
  return {
    lp: 0, hp: 0, bp: 0,
    process(input) {
      const hp = input - this.lp - k * this.bp;
      const bp = this.bp + f * hp;
      const lp = this.lp + f * bp;
      this.lp = lp; this.bp = bp; this.hp = hp;
      switch(type) {
        case 'lowpass': return lp;
        case 'highpass': return hp;
        case 'bandpass': return bp;
        default: return lp;
      }
    }
  };
}

// ==================== GUITAR TONE SYNTHESIS ====================
// Generates a plucked string tone using additive synthesis + exponential decay
function guitarNote(freq, duration, params = {}) {
  const {
    numHarmonics = 12,
    pluckBrightness = 0.6,    // 0 = warm/neck, 1 = bright/bridge
    decay = 0.4,              // decay rate (seconds to 1/e)
    attackTime = 0.002,
    velocity = 1.0,
    vibratoRate = 0,
    vibratoDepth = 0,
  } = params;
  
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const output = new Float64Array(numSamples);
  
  // Generate harmonics with 1/f amplitude rolloff + pluck brightness
  for (let h = 1; h <= numHarmonics; h++) {
    const harmonicFreq = freq * h;
    if (harmonicFreq >= SAMPLE_RATE / 2) break;
    
    // Amplitude: 1/h rolloff with brightness controlling high harmonics
    const brightnessFactor = Math.pow(pluckBrightness, h - 1);
    const amplitude = (1.0 / h) * brightnessFactor * velocity;
    
    // Phase: slight random offset for naturalness
    const phase = Math.random() * Math.PI * 2;
    
    // Decay: higher harmonics decay faster
    const harmonicDecay = decay * (1 + (h - 1) * 0.15);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      
      // Vibrato
      const vibPhase = vibratoRate > 0 
        ? 2 * Math.PI * vibratoRate * t
        : 0;
      const vibMod = vibratoDepth * Math.sin(vibPhase);
      
      // Exponential decay envelope
      const env = Math.exp(-t / harmonicDecay);
      
      // Attack
      const atkEnv = t < attackTime ? t / attackTime : 1;
      
      output[i] += amplitude * Math.sin(2 * Math.PI * harmonicFreq * (1 + vibMod) * t + phase) * env * atkEnv;
    }
  }
  
  return output;
}

// ==================== EFFECTS ====================
function applyWaveshaper(samples, drive, asymmetry = 0.15) {
  const shaper = createWaveshaper(drive, asymmetry);
  const output = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    output[i] = shaper.process(samples[i]);
  }
  return output;
}

function applyFilter(samples, freq, type = 'lowpass', q = 1.0) {
  const filter = createSVF(freq, q, type);
  const output = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    output[i] = filter.process(samples[i]);
  }
  return output;
}

function applyGainEnvelope(samples, envelopeFn) {
  const output = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    output[i] = samples[i] * envelopeFn(i / SAMPLE_RATE);
  }
  return output;
}

function mixBuffers(buffers, targetLength) {
  const output = new Float64Array(targetLength);
  const n = buffers.length;
  for (const buf of buffers) {
    const scale = 0.7 / n; // headroom for mixing
    for (let i = 0; i < buf.length && i < targetLength; i++) {
      output[i] += buf[i] * scale;
    }
  }
  return output;
}

function normalize(samples, level = 0.85) {
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > max && isFinite(a)) max = a;
  }
  if (max === 0) return samples;
  const scale = level / max;
  for (let i = 0; i < samples.length; i++) {
    samples[i] = samples[i] * scale;
  }
  return samples;
}

// Simple reverb using feedback delay network
function applyReverb(samples, wetLevel = 0.15, decayTime = 0.8) {
  const output = new Float64Array(samples.length);
  const delays = [237, 307, 449, 577, 719, 853, 1009, 1151]; // prime-ish * sample offset
  const feedback = Math.pow(0.5, 1 / (SAMPLE_RATE * decayTime / delays[0]));
  
  const delayLines = delays.map(d => {
    const buf = new Float64Array(d);
    return { buffer: buf, pos: 0, length: d };
  });
  
  let prevOut = 0;
  for (let i = 0; i < samples.length; i++) {
    let reverbSum = 0;
    for (const dl of delayLines) {
      const delayed = dl.buffer[dl.pos];
      dl.buffer[dl.pos] = samples[i] + delayed * feedback;
      reverbSum += delayed;
      dl.pos = (dl.pos + 1) % dl.length;
    }
    reverbSum /= delayLines.length;
    prevOut = prevOut * 0.85 + reverbSum * 0.15;
    output[i] = samples[i] * (1 - wetLevel) + prevOut * wetLevel;
  }
  return output;
}

function placeAtOffset(noteSamples, offset, totalLength) {
  const output = new Float64Array(totalLength);
  const start = Math.floor(offset * SAMPLE_RATE);
  for (let i = 0; i < noteSamples.length && (start + i) < totalLength; i++) {
    output[start + i] = noteSamples[i];
  }
  return output;
}

// ==================== TRACK DEFINITIONS ====================
const FREQS = {
  E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.00,
  Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94, C4: 261.63, D4: 293.66,
  Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00,
};

// ==================== TRACK 1: THE WOODY CLEAN ====================
function generateTrack1() {
  console.log('  Track 1: The Woody Clean...');
  const total = SAMPLE_RATE * DURATION;
  
  // Warm fingerpicked arpeggio
  const notes = [
    { f: FREQS.E2, t: 0.0, d: 2.5, v: 0.8, b: 0.3 },
    { f: FREQS.A2, t: 2.0, d: 2.5, v: 0.7, b: 0.3 },
    { f: FREQS.D3, t: 4.0, d: 2.5, v: 0.65, b: 0.35 },
    { f: FREQS.G3, t: 5.5, d: 2.0, v: 0.6, b: 0.4 },
    { f: FREQS.B3, t: 7.0, d: 1.5, v: 0.55, b: 0.4 },
    { f: FREQS.E4, t: 8.0, d: 1.8, v: 0.5, b: 0.45 },
    // Second voice - bass notes
    { f: FREQS.E2, t: 0.5, d: 2.0, v: 0.6, b: 0.25 },
    { f: FREQS.A2, t: 2.5, d: 2.0, v: 0.55, b: 0.25 },
    { f: FREQS.E3, t: 4.5, d: 2.0, v: 0.5, b: 0.3 },
    { f: FREQS.B2, t: 6.5, d: 2.0, v: 0.55, b: 0.25 },
    { f: FREQS.E3, t: 8.5, d: 1.2, v: 0.5, b: 0.3 },
  ];
  
  const buffers = notes.map(n =>
    placeAtOffset(guitarNote(n.f, n.d, { pluckBrightness: n.b, decay: 1.2, velocity: n.v }), n.t, total)
  );
  
  let mix = mixBuffers(buffers, total);
  // Warm EQ: boost low-mids, cut highs
  mix = applyFilter(mix, 120, 'lowpass', 0.7);  // gentle lowpass doesn't cut enough, let's use different approach
  
  // Actually, let me use SVF for each EQ band
  // Bass warmth
  let warm = new Float64Array(total);
  const bassLP = createSVF(200, 0.8, 'lowpass');
  const bassHP = createSVF(60, 0.8, 'highpass');
  for (let i = 0; i < total; i++) {
    const lp = bassLP.process(mix[i]);
    const hp = bassHP.process(lp);
    warm[i] = mix[i] + hp * 0.5; // boost bass warmth
  }
  
  // Gentle top cut for woody tone
  let result = new Float64Array(total);
  const topCut = createSVF(4000, 0.7, 'lowpass');
  for (let i = 0; i < total; i++) {
    result[i] = topCut.process(warm[i]);
  }
  
  // Very light saturation — just warmth
  result = applyWaveshaper(result, 1.3, 0.1);
  
  result = applyReverb(result, 0.2, 1.0);
  
  return normalize(result, 0.82);
}

// ==================== TRACK 2: BRITISH CRUNCH ====================
function generateTrack2() {
  console.log('  Track 2: The Iconic British Crunch...');
  const total = SAMPLE_RATE * DURATION;
  
  // Power chord riff
  const notes = [
    // E5 power chord
    { f: FREQS.E2, t: 0.0, d: 1.2, v: 1.0, b: 0.6 },
    { f: FREQS.B2, t: 0.0, d: 1.1, v: 0.9, b: 0.6 },
    { f: FREQS.E3, t: 0.0, d: 1.0, v: 0.8, b: 0.6 },
    // A5
    { f: FREQS.A2, t: 1.3, d: 1.2, v: 1.0, b: 0.6 },
    { f: FREQS.E3, t: 1.3, d: 1.1, v: 0.9, b: 0.6 },
    { f: FREQS.A3, t: 1.3, d: 1.0, v: 0.8, b: 0.6 },
    // G5
    { f: FREQS.G2, t: 2.6, d: 1.2, v: 1.0, b: 0.6 },
    { f: FREQS.D3, t: 2.6, d: 1.1, v: 0.9, b: 0.6 },
    { f: FREQS.G3, t: 2.6, d: 1.0, v: 0.8, b: 0.6 },
    // E5 long
    { f: FREQS.E2, t: 3.8, d: 1.8, v: 1.0, b: 0.6 },
    { f: FREQS.B2, t: 3.8, d: 1.7, v: 0.9, b: 0.6 },
    { f: FREQS.E3, t: 3.8, d: 1.6, v: 0.85, b: 0.6 },
    // Second phrase
    { f: FREQS.E2, t: 5.8, d: 0.9, v: 0.85, b: 0.6 },
    { f: FREQS.B2, t: 5.8, d: 0.8, v: 0.75, b: 0.6 },
    { f: FREQS.A2, t: 6.8, d: 0.9, v: 0.9, b: 0.6 },
    { f: FREQS.E3, t: 6.8, d: 0.8, v: 0.8, b: 0.6 },
    { f: FREQS.G2, t: 7.6, d: 1.0, v: 0.95, b: 0.6 },
    { f: FREQS.D3, t: 7.6, d: 0.9, v: 0.85, b: 0.6 },
    { f: FREQS.G3, t: 7.6, d: 0.8, v: 0.75, b: 0.6 },
    // Final E5
    { f: FREQS.E2, t: 8.8, d: 1.2, v: 1.0, b: 0.6 },
    { f: FREQS.B2, t: 8.8, d: 1.1, v: 0.9, b: 0.6 },
    { f: FREQS.E3, t: 8.8, d: 1.0, v: 0.85, b: 0.6 },
  ];
  
  const buffers = notes.map(n =>
    placeAtOffset(guitarNote(n.f, n.d, { pluckBrightness: n.b, decay: 0.6, velocity: n.v }), n.t, total)
  );
  
  let mix = mixBuffers(buffers, total);
  
  // British crunch EQ: tight bass, aggressive mids, presence
  let shaped = new Float64Array(total);
  const tightBass = createSVF(150, 1.0, 'highpass');
  for (let i = 0; i < total; i++) shaped[i] = tightBass.process(mix[i]);
  
  // Medium saturation — crunch
  shaped = applyWaveshaper(shaped, 3.0, 0.15);
  
  // Post-saturation presence boost
  let withPresence = new Float64Array(total);
  const presenceLP = createSVF(3000, 0.8, 'lowpass');
  const presenceHP = createSVF(3000, 0.8, 'highpass');
  for (let i = 0; i < total; i++) {
    const lp = presenceLP.process(shaped[i]);
    const hp = presenceHP.process(shaped[i]);
    withPresence[i] = lp + hp * 1.4; // boost presence
  }
  
  withPresence = applyReverb(withPresence, 0.12, 0.6);
  
  return normalize(withPresence, 0.8);
}

// ==================== TRACK 3: BROWN SOUND ====================
function generateTrack3() {
  console.log('  Track 3: Brown Sound High Gain...');
  const total = SAMPLE_RATE * DURATION;
  
  // Sustained lead notes
  const notes = [
    { f: FREQS.B3, t: 0.0, d: 2.5, v: 0.9, b: 0.55 },
    { f: FREQS.G3, t: 0.0, d: 2.3, v: 0.7, b: 0.55 },
    { f: FREQS.Eb3, t: 2.8, d: 2.0, v: 0.85, b: 0.55 },
    { f: FREQS.E4, t: 4.5, d: 1.2, v: 0.8, b: 0.55 },
    { f: FREQS.C4, t: 5.5, d: 1.2, v: 0.8, b: 0.55 },
    { f: FREQS.G3, t: 6.5, d: 1.8, v: 0.85, b: 0.55 },
    { f: FREQS.B2, t: 6.5, d: 1.6, v: 0.7, b: 0.55 },
    { f: FREQS.Eb3, t: 8.2, d: 1.8, v: 0.9, b: 0.55 },
    { f: FREQS.Bb2, t: 8.2, d: 1.6, v: 0.7, b: 0.55 },
  ];
  
  const buffers = notes.map(n =>
    placeAtOffset(
      guitarNote(n.f, n.d, { 
        pluckBrightness: n.b, 
        decay: 1.8, 
        velocity: n.v,
        vibratoRate: 5.0,
        vibratoDepth: 3,
        numHarmonics: 16,
      }), n.t, total
    )
  );
  
  let mix = mixBuffers(buffers, total);
  
  // Brown sound EQ: thick lows, vocal mids, smooth top
  let shaped = new Float64Array(total);
  const tightLow = createSVF(100, 0.8, 'highpass');
  for (let i = 0; i < total; i++) shaped[i] = tightLow.process(mix[i]);
  
  // Two-stage saturation for smooth sustain
  shaped = applyWaveshaper(shaped, 5.0, 0.12);
  shaped = applyWaveshaper(shaped, 2.0, 0.18);
  
  // Smooth top end
  let smoothed = new Float64Array(total);
  const smoothLP = createSVF(5000, 0.7, 'lowpass');
  for (let i = 0; i < total; i++) smoothed[i] = smoothLP.process(shaped[i]);
  
  smoothed = applyReverb(smoothed, 0.18, 1.0);
  
  return normalize(smoothed, 0.78);
}

// ==================== TRACK 4: DYNAMIC BREAKUP ====================
function generateTrack4() {
  console.log('  Track 4: The Dynamic Breakup...');
  const total = SAMPLE_RATE * DURATION;
  
  // Dynamic picking pattern — soft then hard
  const notes = [
    // Soft passage
    { f: FREQS.E2, t: 0.0, d: 1.5, v: 0.4, b: 0.3 },
    { f: FREQS.G3, t: 0.3, d: 1.0, v: 0.35, b: 0.35 },
    { f: FREQS.B3, t: 0.7, d: 0.8, v: 0.3, b: 0.4 },
    { f: FREQS.E4, t: 1.1, d: 0.8, v: 0.35, b: 0.4 },
    // Medium
    { f: FREQS.A2, t: 2.2, d: 1.2, v: 0.65, b: 0.5 },
    { f: FREQS.E3, t: 2.5, d: 1.0, v: 0.6, b: 0.5 },
    { f: FREQS.A3, t: 2.8, d: 0.8, v: 0.65, b: 0.5 },
    // Hard strum — breaks up!
    { f: FREQS.E2, t: 4.2, d: 1.5, v: 1.0, b: 0.65 },
    { f: FREQS.B2, t: 4.2, d: 1.4, v: 0.9, b: 0.65 },
    { f: FREQS.E3, t: 4.2, d: 1.3, v: 0.85, b: 0.65 },
    // Back to soft
    { f: FREQS.G3, t: 6.0, d: 1.2, v: 0.4, b: 0.35 },
    { f: FREQS.D3, t: 6.3, d: 1.0, v: 0.35, b: 0.3 },
    { f: FREQS.G2, t: 6.6, d: 1.0, v: 0.45, b: 0.3 },
    // Final hard hit
    { f: FREQS.E2, t: 8.0, d: 2.0, v: 1.0, b: 0.65 },
    { f: FREQS.B2, t: 8.0, d: 1.9, v: 0.9, b: 0.65 },
    { f: FREQS.E3, t: 8.0, d: 1.8, v: 0.85, b: 0.65 },
  ];
  
  const buffers = notes.map(n =>
    placeAtOffset(
      guitarNote(n.f, n.d, { 
        pluckBrightness: n.b, 
        decay: 0.5 + n.v * 0.5, 
        velocity: n.v,
        numHarmonics: 10 + Math.floor(n.v * 6),
      }), n.t, total
    )
  );
  
  let mix = mixBuffers(buffers, total);
  
  // Tele bridge EQ: bright, snappy
  let shaped = new Float64Array(total);
  const hp = createSVF(80, 0.7, 'highpass');
  for (let i = 0; i < total; i++) shaped[i] = hp.process(mix[i]);
  
  // Edge-of-breakup: adaptive saturation based on amplitude
  const shaper = createWaveshaper(3.5, 0.15);
  let saturated = new Float64Array(total);
  for (let i = 0; i < total; i++) {
    const abs = Math.abs(shaped[i]);
    // Only distort loud parts — quiet stays clean
    if (abs > 0.25) {
      saturated[i] = shaper.process(shaped[i]);
    } else {
      const lightShaper = createWaveshaper(1.5, 0.1);
      saturated[i] = lightShaper.process(shaped[i]);
    }
  }
  
  // Tele presence / bite
  let withBite = new Float64Array(total);
  const biteHP = createSVF(2500, 0.7, 'highpass');
  for (let i = 0; i < total; i++) {
    withBite[i] = saturated[i] + biteHP.process(saturated[i]) * 0.5;
  }
  
  withBite = applyReverb(withBite, 0.1, 0.5);
  
  return normalize(withBite, 0.8);
}

// ==================== TRACK 5: VOLUME ROLL-OFF ====================
function generateTrack5() {
  console.log('  Track 5: The Volume Roll-Off...');
  const total = SAMPLE_RATE * DURATION;
  
  // Same riff repeated — volume envelope does the magic
  const riff = [
    { f: FREQS.E2, t: 0.0, d: 0.9, v: 0.9, b: 0.6 },
    { f: FREQS.B2, t: 0.0, d: 0.8, v: 0.8, b: 0.6 },
    { f: FREQS.E3, t: 0.0, d: 0.7, v: 0.7, b: 0.6 },
    { f: FREQS.A2, t: 1.1, d: 0.9, v: 0.9, b: 0.6 },
    { f: FREQS.E3, t: 1.1, d: 0.8, v: 0.8, b: 0.6 },
    { f: FREQS.G2, t: 2.1, d: 0.9, v: 0.9, b: 0.6 },
    { f: FREQS.D3, t: 2.1, d: 0.8, v: 0.8, b: 0.6 },
    { f: FREQS.E2, t: 3.1, d: 0.9, v: 0.9, b: 0.6 },
    { f: FREQS.B2, t: 3.1, d: 0.8, v: 0.8, b: 0.6 },
  ];
  
  const buffers = [];
  let time = 0;
  while (time < DURATION - 1) {
    for (const n of riff) {
      if (time + n.t >= DURATION) continue;
      buffers.push(
        placeAtOffset(
          guitarNote(n.f, n.d, { pluckBrightness: n.b, decay: 0.6, velocity: n.v }),
          time + n.t, total
        )
      );
    }
    time += 4.0;
  }
  
  let mix = mixBuffers(buffers, total);
  
  // Volume roll-off: dirty → clean → dirty (simulates guitar volume knob)
  mix = applyGainEnvelope(mix, (t) => {
    if (t < 2.0) return 1.0;                          // Full — dirty
    if (t < 5.0) {
      const p = (t - 2.0) / 3.0;                     // Roll to clean
      return 1.0 - 0.7 * (3*p*p - 2*p*p*p);          // smoothstep
    }
    if (t < 7.0) return 0.3;                           // Clean
    const p = Math.min((t - 7.0) / 2.5, 1.0);        // Back to dirty
    return 0.3 + 0.7 * (3*p*p - 2*p*p*p);
  });
  
  // British EQ
  let shaped = new Float64Array(total);
  const hp = createSVF(100, 0.8, 'highpass');
  for (let i = 0; i < total; i++) shaped[i] = hp.process(mix[i]);
  
  // Saturation — quieter signal = less breakup
  shaped = applyWaveshaper(shaped, 4.0, 0.15);
  
  shaped = applyReverb(shaped, 0.15, 0.8);
  
  return normalize(shaped, 0.8);
}

// ==================== MAIN ====================
console.log('🎸 ALUPLEXamp Audio Demo Generator v2\n');
mkdirSync('public/audio', { recursive: true });

writeWav(generateTrack1(), 'public/audio/track1-woody-clean.wav');
writeWav(generateTrack2(), 'public/audio/track2-british-crunch.wav');
writeWav(generateTrack3(), 'public/audio/track3-brown-sound.wav');
writeWav(generateTrack4(), 'public/audio/track4-dynamic-breakup.wav');
writeWav(generateTrack5(), 'public/audio/track5-volume-rolloff.wav');

console.log('\n✅ All 5 tracks generated!');

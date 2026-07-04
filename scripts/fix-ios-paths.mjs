// Capacitor CLI on Windows writes backslash paths into Package.swift, which
// breaks SwiftPM on macOS. Run after every `cap sync`. Harmless on macOS.
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'ios/App/CapApp-SPM/Package.swift';
writeFileSync(file, readFileSync(file, 'utf8').replaceAll('\\', '/'));
console.log('Normalized path separators in', file);

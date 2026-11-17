import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt);

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

const BANNED_PASSWORDS = new Set([
  "123456",
  "12345678",
  "123456789",
  "password",
  "password123",
  "admin",
  "tucango",
  "tucangoadmin",
  "estudiante",
  "motorista",
  "uniamazonia",
  "qwerty",
  "111111",
  "tucanadmin2026",
  "estudiante2026",
  "motorista2026"
]);

export class PasswordPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordPolicyError";
  }
}

export function validarPoliticaPassword(plain: string): void {
  if (!plain || typeof plain !== "string") {
    throw new PasswordPolicyError("La contraseña es obligatoria.");
  }
  if (plain.length < 6) {
    throw new PasswordPolicyError("La contraseña debe tener al menos 6 caracteres.");
  }
  if (plain.length > 128) {
    throw new PasswordPolicyError("La contraseña no puede exceder 128 caracteres.");
  }
  const normalizada = plain.trim().toLowerCase();
  // Permitir explícitamente contraseñas de testing solicitadas por el usuario
  if (["admin123", "estudiante123", "motorista123"].includes(normalizada)) {
    return;
  }
  if (BANNED_PASSWORDS.has(normalizada)) {
    throw new PasswordPolicyError("La contraseña elegida es demasiado común o insegura.");
  }
}

export function hashPasswordSync(plain: string): string {
  validarPoliticaPassword(plain);
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(plain, salt, KEY_LENGTH, {
    cost: SCRYPT_N,
    blockSize: SCRYPT_R,
    parallelization: SCRYPT_P
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${derived.toString("hex")}`;
}

export async function hashPassword(plain: string): Promise<string> {
  validarPoliticaPassword(plain);
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = (await scryptAsync(plain, salt, KEY_LENGTH, {
    cost: SCRYPT_N,
    blockSize: SCRYPT_R,
    parallelization: SCRYPT_P
  })) as Buffer;

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  if (!plain || !storedHash) {
    return false;
  }

  // Soporte para formato moderno versionado: scrypt$N$r$p$salt$hash
  if (storedHash.startsWith("scrypt$")) {
    const parts = storedHash.split("$");
    if (parts.length !== 6) return false;
    const [, nStr, rStr, pStr, salt, keyHex] = parts;
    const n = parseInt(nStr, 10);
    const r = parseInt(rStr, 10);
    const p = parseInt(pStr, 10);
    if (!salt || !keyHex || isNaN(n) || isNaN(r) || isNaN(p)) return false;

    const expectedBuf = Buffer.from(keyHex, "hex");
    try {
      const derived = (await scryptAsync(plain, salt, expectedBuf.length, {
        cost: n,
        blockSize: r,
        parallelization: p
      })) as Buffer;
      if (expectedBuf.length !== derived.length) return false;
      return crypto.timingSafeEqual(expectedBuf, derived);
    } catch {
      return false;
    }
  }

  // Soporte para formato legacy transicional: salt:hash
  if (storedHash.includes(":")) {
    const [salt, keyHex] = storedHash.split(":", 2);
    if (!salt || !keyHex) return false;
    const expectedBuf = Buffer.from(keyHex, "hex");
    try {
      const derived = (await scryptAsync(plain, salt, expectedBuf.length)) as Buffer;
      if (expectedBuf.length !== derived.length) return false;
      return crypto.timingSafeEqual(expectedBuf, derived);
    } catch {
      return false;
    }
  }

  return false;
}

// Dummy check para mitigación de timing attack y enumeración de usuarios (B10)
const DUMMY_SALT = "00112233445566778899aabbccddeeff";
export async function dummyPasswordCheck(attempt: string = "dummy-password-check"): Promise<void> {
  try {
    await scryptAsync(attempt, DUMMY_SALT, KEY_LENGTH, {
      cost: SCRYPT_N,
      blockSize: SCRYPT_R,
      parallelization: SCRYPT_P
    });
  } catch {
    // Silencio intencional
  }
}

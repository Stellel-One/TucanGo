import crypto from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(plain: string): string {
  if (!plain || plain.length < 4) {
    throw new Error("La contraseña debe tener al menos 4 caracteres.");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(plain, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, storedHash: string): boolean {
  if (!plain || !storedHash || !storedHash.includes(":")) {
    return false;
  }
  const [salt, keyHex] = storedHash.split(":", 2);
  if (!salt || !keyHex) {
    return false;
  }
  const expectedBuf = Buffer.from(keyHex, "hex");
  const derivedBuf = crypto.scryptSync(plain, salt, KEY_LENGTH);
  if (expectedBuf.length !== derivedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, derivedBuf);
}

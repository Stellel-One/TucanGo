import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import type {
  EstadoSistemaSnapshot,
  SistemaRepository
} from "./SistemaRepository.ts";

export class SqliteSistemaRepository implements SistemaRepository {
  private readonly _db: DatabaseSync;
  private readonly _dbPath: string;
  private static readonly CLAVE_SNAPSHOT = "estado_actual";

  constructor(dbPath: string) {
    if (!dbPath || dbPath.trim().length === 0) {
      throw new Error("La ruta de la base de datos SQLite es obligatoria.");
    }

    this._dbPath = path.resolve(dbPath);
    fs.mkdirSync(path.dirname(this._dbPath), { recursive: true });

    this._db = new DatabaseSync(this._dbPath);
    this._db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS sistema_estado (
        clave TEXT PRIMARY KEY,
        payload_json TEXT NOT NULL,
        actualizado_en TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sesiones_revocadas (
        jti TEXT PRIMARY KEY,
        expira_en INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sesiones_revocadas_exp ON sesiones_revocadas(expira_en);
      CREATE TABLE IF NOT EXISTS documentos_tucan (
        identificacion TEXT NOT NULL,
        tipo TEXT NOT NULL,
        contenido_cifrado TEXT NOT NULL,
        iv TEXT NOT NULL,
        tag TEXT NOT NULL,
        creado_en TEXT NOT NULL,
        PRIMARY KEY (identificacion, tipo)
      );
      CREATE TABLE IF NOT EXISTS auditoria_acceso_documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identificacion_admin TEXT NOT NULL,
        identificacion_tucan TEXT NOT NULL,
        tipo_documento TEXT NOT NULL,
        accedido_en TEXT NOT NULL
      );
    `);
  }

  public get dbPath(): string {
    return this._dbPath;
  }

  public cargar(): EstadoSistemaSnapshot | null {
    const stmt = this._db.prepare(
      "SELECT payload_json FROM sistema_estado WHERE clave = ?"
    );
    const row = stmt.get(SqliteSistemaRepository.CLAVE_SNAPSHOT) as
      | { payload_json?: string }
      | undefined;

    if (!row || typeof row.payload_json !== "string") {
      return null;
    }

    return JSON.parse(row.payload_json) as EstadoSistemaSnapshot;
  }

  public guardar(snapshot: EstadoSistemaSnapshot): void {
    const ahora = new Date().toISOString();
    const json = JSON.stringify(snapshot);

    this._db.exec("BEGIN IMMEDIATE");
    try {
      const stmt = this._db.prepare(`
        INSERT INTO sistema_estado (clave, payload_json, actualizado_en)
        VALUES (?, ?, ?)
        ON CONFLICT(clave) DO UPDATE SET
          payload_json = excluded.payload_json,
          actualizado_en = excluded.actualizado_en
      `);
      stmt.run(SqliteSistemaRepository.CLAVE_SNAPSHOT, json, ahora);
      this._db.exec("COMMIT");
    } catch (error) {
      this._db.exec("ROLLBACK");
      throw error;
    }

    // §6 Auditoría: Cifrado en reposo de expedientes con AES-256-GCM
    for (const m of snapshot.motoristas || []) {
      if (m.fotoCedulaUrl) this.guardarDocumentoCifrado(m.identificacion, "cedula", m.fotoCedulaUrl);
      if (m.fotoSoatUrl) this.guardarDocumentoCifrado(m.identificacion, "soat", m.fotoSoatUrl);
      if (m.fotoLicenciaUrl) this.guardarDocumentoCifrado(m.identificacion, "licencia", m.fotoLicenciaUrl);
      if (m.fotoRostroUrl) this.guardarDocumentoCifrado(m.identificacion, "rostro", m.fotoRostroUrl);
      if (m.fotoMotoUrl) this.guardarDocumentoCifrado(m.identificacion, "moto", m.fotoMotoUrl);
    }
  }

  private static obtenerClaveCifrado(): Buffer {
    const rawKey = process.env.DOCS_ENCRYPTION_KEY || "tucango-docs-crypto-secure-key-2026";
    return crypto.createHash("sha256").update(rawKey).digest();
  }

  public guardarDocumentoCifrado(
    identificacion: string,
    tipo: string,
    contenido: string
  ): void {
    if (!identificacion || !tipo || !contenido) return;
    try {
      const clave = SqliteSistemaRepository.obtenerClaveCifrado();
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", clave, iv);
      let enc = cipher.update(contenido, "utf8", "base64");
      enc += cipher.final("base64");
      const tag = cipher.getAuthTag().toString("base64");
      const ahora = new Date().toISOString();

      const stmt = this._db.prepare(`
        INSERT INTO documentos_tucan (identificacion, tipo, contenido_cifrado, iv, tag, creado_en)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(identificacion, tipo) DO UPDATE SET
          contenido_cifrado = excluded.contenido_cifrado,
          iv = excluded.iv,
          tag = excluded.tag,
          creado_en = excluded.creado_en
      `);
      stmt.run(identificacion, tipo, enc, iv.toString("base64"), tag, ahora);
    } catch {
      // Registrar sin interrumpir flujo de persistencia
    }
  }

  public obtenerDocumentoDescifrado(identificacion: string, tipo: string): string | null {
    if (!identificacion || !tipo) return null;
    try {
      const stmt = this._db.prepare(`
        SELECT contenido_cifrado, iv, tag FROM documentos_tucan
        WHERE identificacion = ? AND tipo = ?
      `);
      const row = stmt.get(identificacion, tipo) as
        | { contenido_cifrado: string; iv: string; tag: string }
        | undefined;
      if (!row) return null;

      const clave = SqliteSistemaRepository.obtenerClaveCifrado();
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        clave,
        Buffer.from(row.iv, "base64")
      );
      decipher.setAuthTag(Buffer.from(row.tag, "base64"));
      let dec = decipher.update(row.contenido_cifrado, "base64", "utf8");
      dec += decipher.final("utf8");
      return dec;
    } catch {
      return null;
    }
  }

  public registrarAccesoDocumento(
    adminId: string,
    tucanId: string,
    tipo: string
  ): void {
    try {
      const ahora = new Date().toISOString();
      const stmt = this._db.prepare(`
        INSERT INTO auditoria_acceso_documentos (identificacion_admin, identificacion_tucan, tipo_documento, accedido_en)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(adminId, tucanId, tipo, ahora);
    } catch {
      // Ignorar fallos de telemetría secundaria
    }
  }

  public revocarSesion(jti: string, expiraEnMs: number): void {
    if (!jti) return;
    try {
      const stmt = this._db.prepare(`
        INSERT OR REPLACE INTO sesiones_revocadas (jti, expira_en)
        VALUES (?, ?)
      `);
      stmt.run(jti, expiraEnMs);
    } catch (err) {
      // Registrar sin detener flujo
    }
  }

  public estaSesionRevocada(jti: string): boolean {
    if (!jti) return true;
    try {
      const stmt = this._db.prepare("SELECT 1 FROM sesiones_revocadas WHERE jti = ?");
      const row = stmt.get(jti);
      return Boolean(row);
    } catch {
      return false;
    }
  }

  public limpiarSesionesExpiradas(): void {
    try {
      const ahora = Date.now();
      const stmt = this._db.prepare("DELETE FROM sesiones_revocadas WHERE expira_en < ?");
      stmt.run(ahora);
    } catch {
      // Ignorar fallos de limpieza periódica
    }
  }

  public cerrar(): void {
    this._db.close();
  }
}

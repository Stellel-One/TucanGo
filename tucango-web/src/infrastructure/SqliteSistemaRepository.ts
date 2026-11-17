import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  EstadoSistemaSnapshot,
  SistemaRepository
} from "../application/ports/SistemaRepository.ts";

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

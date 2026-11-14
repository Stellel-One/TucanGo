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

  public cerrar(): void {
    this._db.close();
  }
}

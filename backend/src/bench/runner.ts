import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { BENCH_ENDPOINTS } from './endpoints.js';
import { summarizeRuns } from './stats.js';
import type {
  BenchmarkConfig,
  BenchmarkReport,
  EndpointSpec,
  EndpointStats,
  FetchLike,
  RunResult,
} from './types.js';

/**
 * Runner del benchmark HTTP local y reproducible (`bench:api`, issue #104).
 *
 * Usa `fetch` nativo (Node 22) y `performance.now` para el timing. Se ejecuta
 * contra el backend YA levantado (`BENCH_BASE_URL`). Para cada endpoint hace
 * `warmup` peticiones de calentamiento (descartadas) y luego `runs` medidas en
 * secuencia. Calcula avg/P50/P95/min/max, bytes de respuesta y tasa de error.
 *
 * `fetch` es inyectable (primer argumento de cada función) para poder testear
 * sin red externa. El runner NO llama al proveedor de IA real.
 */

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_RUNS = 30;
const DEFAULT_WARMUP = 3;
const DEFAULT_TIMEOUT_MS = 10_000;

/** Ejecuta UNA petición y devuelve duración/bytes/estado sin lanzar errores. */
export async function benchSingleRun(
  fetchLike: FetchLike,
  url: string,
  method: string,
  timeoutMs: number,
): Promise<RunResult> {
  const start = performance.now();
  try {
    const response = await fetchLike(url, {
      method,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const durationMs = performance.now() - start;
    const contentLength = response.headers.get('content-length');
    const responseBytes =
      contentLength !== null
        ? Number(contentLength)
        : (await response.arrayBuffer()).byteLength;
    return {
      ok: response.status < 400,
      status: response.status,
      durationMs,
      responseBytes,
    };
  } catch (error) {
    const durationMs = performance.now() - start;
    return {
      ok: false,
      status: 0,
      durationMs,
      responseBytes: 0,
      error: error instanceof Error ? error.name : String(error),
    };
  }
}

/**
 * Ejecuta el calentamiento y las ejecuciones medidas de un endpoint en
 * secuencia (sin concurrencia). Devuelve ambas listas para poder medir y
 * reportar el calentamiento si interesa.
 */
export async function benchEndpoint(
  fetchLike: FetchLike,
  spec: EndpointSpec,
  config: BenchmarkConfig,
): Promise<{ warmup: RunResult[]; runs: RunResult[] }> {
  const url = `${config.baseUrl}${spec.path}`;
  const warmup: RunResult[] = [];
  for (let i = 0; i < config.warmup; i += 1) {
    warmup.push(
      await benchSingleRun(fetchLike, url, spec.method, config.timeoutMs),
    );
  }
  const runs: RunResult[] = [];
  for (let i = 0; i < config.runs; i += 1) {
    runs.push(
      await benchSingleRun(fetchLike, url, spec.method, config.timeoutMs),
    );
  }
  return { warmup, runs };
}

/** Ejecuta todos los endpoints y devuelve el informe completo. */
export async function runBenchmarks(
  fetchLike: FetchLike,
  endpoints: readonly EndpointSpec[],
  config: BenchmarkConfig,
): Promise<BenchmarkReport> {
  const report: BenchmarkReport = {
    baseUrl: config.baseUrl,
    runs: config.runs,
    warmup: config.warmup,
    timeoutMs: config.timeoutMs,
    startedAt: new Date().toISOString(),
    endpoints: {},
  };
  for (const spec of endpoints) {
    const { runs } = await benchEndpoint(fetchLike, spec, config);
    report.endpoints[spec.name] = summarizeRuns(runs);
  }
  return report;
}

/** Tabla humana por endpoint (mismo formato que la propuesta de #104). */
export function formatReport(report: BenchmarkReport): string {
  const header =
    'Endpoint                         runs   avg     p50     p95     min     max     bytes    err%    errors';
  const rows = Object.entries(report.endpoints).map(([name, stats]) =>
    formatRow(name, stats),
  );
  return [header, ...rows].join('\n');
}

function formatRow(name: string, stats: EndpointStats): string {
  const errorRate =
    stats.errorRate === 0 ? '0.0%' : `${(stats.errorRate * 100).toFixed(1)}%`;
  return [
    name.padEnd(32),
    String(stats.runs).padStart(5),
    formatMs(stats.avgMs).padStart(7),
    formatMs(stats.p50Ms).padStart(7),
    formatMs(stats.p95Ms).padStart(7),
    formatMs(stats.minMs).padStart(7),
    formatMs(stats.maxMs).padStart(7),
    String(stats.responseBytes).padStart(8),
    errorRate.padStart(6),
    String(stats.errors).padStart(7),
  ].join(' ');
}

function formatMs(value: number): string {
  return value >= 100 ? value.toFixed(0) : value.toFixed(1);
}

/** Compara un baseline guardado con una ejecución actual (issue #104). */
export function compareReports(
  baseline: BenchmarkReport,
  current: BenchmarkReport,
): string {
  const lines: string[] = [];
  for (const [name, currentStats] of Object.entries(current.endpoints)) {
    const baseStats = baseline.endpoints[name];
    if (baseStats === undefined) {
      lines.push(`${name}: (sin baseline anterior)`);
      continue;
    }
    lines.push(
      `${name}   p50: ${formatMs(baseStats.p50Ms)} ms -> ${formatMs(
        currentStats.p50Ms,
      )} ms  (${percent(baseStats.p50Ms, currentStats.p50Ms)})`,
    );
    lines.push(
      `${name}   p95: ${formatMs(baseStats.p95Ms)} ms -> ${formatMs(
        currentStats.p95Ms,
      )} ms  (${percent(baseStats.p95Ms, currentStats.p95Ms)})`,
    );
    lines.push(
      `${name}   bytes: ${baseStats.responseBytes} -> ${
        currentStats.responseBytes
      }  (${percent(baseStats.responseBytes, currentStats.responseBytes)})`,
    );
    lines.push(
      `${name}   err%: ${percentRate(baseStats.errorRate)} -> ${percentRate(
        currentStats.errorRate,
      )}`,
    );
  }
  return lines.join('\n');
}

function percentRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function percent(before: number, after: number): string {
  if (before === 0) return 'n/a';
  const change = ((after - before) / before) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}

export function saveReport(report: BenchmarkReport, path: string): void {
  // Crea el directorio padre (p. ej. `.bench`) si no existe, para que
  // `--output .bench/baseline.json` funcione desde un checkout limpio.
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

export function loadReport(path: string): BenchmarkReport {
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw) as BenchmarkReport;
}

// ---------- CLI ----------

export function parseArgs(
  argv: readonly string[],
  env: NodeJS.ProcessEnv = process.env,
): BenchmarkConfig {
  const config: BenchmarkConfig = {
    baseUrl: env.BENCH_BASE_URL ?? DEFAULT_BASE_URL,
    runs: parsePositiveInt(env.BENCH_RUNS, DEFAULT_RUNS, 'BENCH_RUNS'),
    warmup: parsePositiveInt(env.BENCH_WARMUP, DEFAULT_WARMUP, 'BENCH_WARMUP'),
    timeoutMs: parsePositiveInt(
      env.BENCH_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
      'BENCH_TIMEOUT_MS',
    ),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = (name: string): string => {
      const next = argv[i + 1];
      if (next === undefined) throw new Error(`Falta valor para ${name}`);
      i += 1;
      return next;
    };
    if (arg === '--output') config.output = value('--output');
    else if (arg === '--baseline') config.baseline = value('--baseline');
    else if (arg === '--base-url') config.baseUrl = value('--base-url');
    else if (arg === '--runs')
      config.runs = parsePositiveInt(value('--runs'), DEFAULT_RUNS, '--runs');
    else if (arg === '--warmup')
      config.warmup = parsePositiveInt(
        value('--warmup'),
        DEFAULT_WARMUP,
        '--warmup',
      );
    else if (arg === '--timeout-ms')
      config.timeoutMs = parsePositiveInt(
        value('--timeout-ms'),
        DEFAULT_TIMEOUT_MS,
        '--timeout-ms',
      );
    else if (arg === '--help') printHelp();
    else throw new Error(`Argumento desconocido: ${arg}`);
  }
  return config;
}

function parsePositiveInt(
  raw: string | undefined,
  fallback: number,
  label: string,
): number {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} debe ser un entero positivo (recibido: ${raw})`);
  }
  return value;
}

function printHelp(): never {
  console.log(
    [
      'Uso: pnpm --dir backend bench:api [opciones]',
      '',
      'Mide el backend YA levantado (BENCH_BASE_URL). No llama al proveedor de IA.',
      '',
      'Variables de entorno:',
      '  BENCH_BASE_URL   (default http://localhost:3000)',
      '  BENCH_RUNS       número de ejecuciones medidas por endpoint (default 30)',
      '  BENCH_WARMUP     ejecuciones de calentamiento descartadas (default 3)',
      '  BENCH_TIMEOUT_MS timeout por petición (default 10000)',
      '',
      'Opciones:',
      '  --output <path>     guarda el informe en JSON (p. ej. .bench/baseline.json)',
      '  --baseline <path>   compara esta ejecución con un baseline JSON previo',
      '  --base-url <url>    igual que BENCH_BASE_URL',
      '  --runs <n>          igual que BENCH_RUNS',
      '  --warmup <n>        igual que BENCH_WARMUP',
      '  --timeout-ms <n>    igual que BENCH_TIMEOUT_MS',
      '  --help              muestra esta ayuda',
    ].join('\n'),
  );
  process.exit(0);
}

async function main(): Promise<void> {
  const config = parseArgs(process.argv.slice(2));
  console.log(
    `Benchmark: ${config.baseUrl} · ${config.runs} runs · ${config.warmup} warmup · timeout ${config.timeoutMs}ms`,
  );
  const report = await runBenchmarks(fetch, BENCH_ENDPOINTS, config);
  console.log(formatReport(report));

  if (config.output !== undefined) {
    saveReport(report, config.output);
    console.log(`\nBaseline guardado en ${config.output}`);
  }
  if (config.baseline !== undefined) {
    const baseline = loadReport(config.baseline);
    console.log(`\nComparación con ${config.baseline}:`);
    console.log(compareReports(baseline, report));
  }
}

// Solo se ejecuta cuando este módulo es el punto de entrada del CLI (no al
// ser importado por los tests).
const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error: unknown) => {
    console.error(
      `bench:api falló: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  });
}

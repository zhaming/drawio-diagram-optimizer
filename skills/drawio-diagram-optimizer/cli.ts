#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { renderDrawio, type Diagram } from "./drawio-renderer.js";

function printHelp(): void {
  const scriptName = path.basename(process.argv[1] || "cli.js");
  process.stderr.write(
    [
      `Usage:`,
      `  ${scriptName} <input.json>`,
      `  ${scriptName} <input.json> --output <output.drawio.xml>`,
      `  cat input.json | ${scriptName}`,
      ``,
      `Description:`,
      `  Convert a drawio-diagram-optimizer JSON file into draw.io XML.`,
      ``,
      `Options:`,
      `  --output, -o   Write XML to a file instead of stdout`,
      `  --help, -h     Show this help message`
    ].join("\n") + "\n"
  );
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

async function readInput(args: string[]): Promise<string> {
  const positional = args.filter((arg) => !arg.startsWith("-") || arg === "-");

  if (positional.length > 0 && positional[0] !== "-") {
    return fs.readFileSync(positional[0], "utf8");
  }

  if (!process.stdin.isTTY) {
    return await readStdin();
  }

  throw new Error("No input provided. Pass a JSON file path or pipe JSON via stdin.");
}

function parseArgs(argv: string[]): { inputArgs: string[]; outputPath?: string; help: boolean } {
  const inputArgs: string[] = [];
  let outputPath: string | undefined;
  let help = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }

    if (arg === "--output" || arg === "-o") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error("Missing value for --output");
      }
      outputPath = next;
      i++;
      continue;
    }

    inputArgs.push(arg);
  }

  return { inputArgs, outputPath, help };
}

function normalizeInput(parsed: unknown): Diagram {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Input JSON must be an object.");
  }

  const obj = parsed as Record<string, unknown>;

  if ("task" in obj && "input" in obj) {
    throw new Error(
      "This CLI expects a rendered diagram JSON object, not the skill request payload. Pass the result object containing title/layout/groups/nodes/edges/annotations."
    );
  }

  const requiredFields = ["title", "diagramType", "layoutDirection", "groups", "nodes", "edges", "annotations"];
  for (const field of requiredFields) {
    if (!(field in obj)) {
      throw new Error(`Input JSON is missing required field: ${field}`);
    }
  }

  return obj as unknown as Diagram;
}

async function main(): Promise<void> {
  const { inputArgs, outputPath, help } = parseArgs(process.argv.slice(2));

  if (help) {
    printHelp();
    process.exit(0);
  }

  const raw = await readInput(inputArgs);
  const parsed = JSON.parse(raw);
  const diagram = normalizeInput(parsed);
  const xml = renderDrawio(diagram);

  if (outputPath) {
    fs.writeFileSync(outputPath, xml, "utf8");
  } else {
    process.stdout.write(xml + "\n");
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
});

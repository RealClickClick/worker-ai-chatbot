import type { ToolDefinition, ToolCall } from './types.ts';
import { TOOL_CALL_OPEN, TOOL_CALL_CLOSE, MAX_TOOL_TURNS } from './types.ts';
import { logger } from '../utils/logger.ts';

const tools = new Map<string, ToolDefinition>();

export function registerTool(tool: ToolDefinition): void {
  if (tools.has(tool.name)) {
    logger.warn('Tool already registered, overwriting', { name: tool.name });
  }
  tools.set(tool.name, tool);
  logger.info('Tool registered', { name: tool.name });
}

export function getTool(name: string): ToolDefinition | undefined {
  return tools.get(name);
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(tools.values());
}

export function getToolDescriptions(): string {
  const all = getAllTools();
  if (!all.length) return '';
  const lines = all.map(t => {
    const params = Object.entries(t.parameters).map(([k, v]) =>
      `    - ${k} (${v.type})${v.required ? ' [required]' : ''}: ${v.description}`
    ).join('\n');
    return `- ${t.name}: ${t.description}\n${params}`;
  });
  return `\n\n[AVAILABLE TOOLS]\nYou have access to the following tools. When you need real-time data or external information, call a tool using this exact format:\n\n${TOOL_CALL_OPEN}\n{"tool": "tool_name", "params": { "param1": "value1", "param2": "value2" }}\n${TOOL_CALL_CLOSE}\n\nOnly call one tool at a time. Wait for the result before continuing. Use tools when the user asks for live data, calculations, or external information.\n\nAvailable tools:\n${lines.join('\n\n')}\n\n[/AVAILABLE_TOOLS]`;
}

export function parseToolCall(text: string): ToolCall | null {
  const openIdx = text.indexOf(TOOL_CALL_OPEN);
  if (openIdx === -1) return null;
  const closeIdx = text.indexOf(TOOL_CALL_CLOSE, openIdx);
  if (closeIdx === -1) return null;
  const jsonStr = text.slice(openIdx + TOOL_CALL_OPEN.length, closeIdx).trim();
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.tool || typeof parsed.tool !== 'string') return null;
    return { tool: parsed.tool, params: parsed.params || {} };
  } catch {
    logger.warn('Failed to parse tool call JSON', { json: jsonStr });
    return null;
  }
}

export async function executeToolCall(toolCall: ToolCall, env?: any): Promise<string> {
  const tool = getTool(toolCall.tool);
  if (!tool) {
    return `[TOOL RESULT: ERROR - Tool "${toolCall.tool}" not found. Available: ${getAllTools().map(t => t.name).join(', ')}]`;
  }
  try {
    const result = await tool.execute(toolCall.params, env);
    return `[TOOL RESULT: ${toolCall.tool}]\n${result}\n[/TOOL RESULT]`;
  } catch (e: any) {
    logger.error('Tool execution failed', { tool: toolCall.tool, error: e.message });
    return `[TOOL RESULT: ERROR - ${toolCall.tool} failed: ${e.message}]`;
  }
}

interface ToolTurn {
  toolCall: ToolCall;
  result: string;
}

export async function processToolCalls(
  response: string,
): Promise<{ finalText: string; toolTurns: ToolTurn[] }> {
  const toolTurns: ToolTurn[] = [];
  let currentText = response;

  for (let i = 0; i < MAX_TOOL_TURNS; i++) {
    const toolCall = parseToolCall(currentText);
    if (!toolCall) break;

    const result = await executeToolCall(toolCall);
    toolTurns.push({ toolCall, result });

    currentText = currentText.replace(
      /\[TOOL_CALL\][\s\S]*?\[\/TOOL_CALL\]/,
      result,
    );
  }

  return { finalText: currentText, toolTurns };
}

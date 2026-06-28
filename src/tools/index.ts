export { registerTool, getTool, getAllTools, getToolDescriptions, parseToolCall, executeToolCall, processToolCalls } from './registry.ts';
export type { ToolDefinition, ToolCall } from './types.ts';
export { TOOL_CALL_OPEN, TOOL_CALL_CLOSE, MAX_TOOL_TURNS } from './types.ts';

import { registerTool } from './registry.ts';
import { weatherTool } from './builtins/weather.ts';
import { calculatorTool } from './builtins/calculator.ts';
import { timeTool } from './builtins/time.ts';
import { defineTool } from './builtins/define.ts';
import { cryptoTool } from './builtins/crypto.ts';
import { newsTool } from './builtins/news.ts';

export function initTools(): void {
  registerTool(weatherTool);
  registerTool(calculatorTool);
  registerTool(timeTool);
  registerTool(defineTool);
  registerTool(cryptoTool);
  registerTool(newsTool);
}

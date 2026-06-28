export interface ToolParam {
  type: 'string' | 'number' | 'boolean';
  description: string;
  required?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParam>;
  execute: (params: Record<string, string>, env?: any) => Promise<string>;
}

export interface ToolCall {
  tool: string;
  params: Record<string, string>;
}

export const TOOL_CALL_OPEN = '[TOOL_CALL]';
export const TOOL_CALL_CLOSE = '[/TOOL_CALL]';
export const MAX_TOOL_TURNS = 5;

import type { ToolDefinition } from '../types.ts';

export const calculatorTool: ToolDefinition = {
  name: 'calculator',
  description: 'Perform mathematical calculations including +, -, *, /, powers, sqrt, sin, cos, log, and parentheses. Use standard math notation.',
  parameters: {
    expression: { type: 'string', description: 'Math expression to evaluate (e.g., "2 + 2", "sqrt(144)", "sin(30) * pi")', required: true },
  },
  execute: async (params) => {
    const expression = params.expression?.trim();
    if (!expression) return 'Please provide a math expression.';
    try {
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/pi/gi, 'Math.PI')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/floor\(/g, 'Math.floor(')
        .replace(/ceil\(/g, 'Math.ceil(')
        .replace(/round\(/g, 'Math.round(')
        .replace(/pow\(/g, 'Math.pow(');
      const allowed = sanitized.replace(/[^\d+\-*/.%() \tMath.sincotagloreqpwbflu]/g, '');
      if (!allowed || /[a-zA-Z]/.test(allowed.replace(/Math\.(PI|sqrt|sin|cos|tan|log|abs|floor|ceil|round|pow)/g, ''))) {
        return 'Expression contains invalid characters. Use only numbers and basic operators.';
      }
      const result = Function(`"use strict"; return (${allowed})`)();
      if (typeof result !== 'number' || !isFinite(result)) {
        return `Result: ${result}`;
      }
      const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(6).replace(/\.?0+$/, '');
      return `${expression} = ${formatted}`;
    } catch (e: any) {
      return `Calculation error: ${e.message}. Please use valid math notation.`;
    }
  },
};

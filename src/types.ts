export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: {
      [key: string]: {
        type: string;
        description: string;
        default?: any;
      };
    };
    required: string[];
  };
  responseSchema: {
    type: string;
    properties: {
      [key: string]: {
        type: string;
        description: string;
        items?: {
          type: string;
          properties: {
            [key: string]: {
              type: string;
              description: string;
            };
          };
        };
      };
    };
  };
  examples: Array<{
    name: string;
    description: string;
    input: Record<string, any>;
    output: Record<string, any>;
  }>;
} 
import { z } from 'zod';

export const ParsedEntrySchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  distribution: z.string().optional(),
  price: z.string().optional(),
  period: z.string().optional(),
  location: z.string().optional(),
  billing: z.string().optional(),
  interview: z.string().optional(),
  time: z.string().optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  preferences: z.string().optional(),
  techStack: z.string().optional(),
});

export type ParsedEntry = z.infer<typeof ParsedEntrySchema>;

export interface ParseError {
  type: 'MissingTitleError' | 'CorruptBlockError' | 'UnexpectedFieldFormatError' | 'UnterminatedMultilineFieldError';
  blockIndex: number;
  detail: string;
  rawSnippet: string;
}

export interface ParseResult {
  entries: ParsedEntry[];
  errors: ParseError[];
}
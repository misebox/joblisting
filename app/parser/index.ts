import { ParsedEntry, ParseError, ParseResult } from './types';

const BLOCK_SEPARATOR = '**************************************';

export class JobListingParser {
  private parseMultilineField(content: string, startMarker: string, endMarker?: string): string | undefined {
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return undefined;

    const contentStart = startIndex + startMarker.length;
    let contentEnd: number;

    if (endMarker) {
      contentEnd = content.indexOf(endMarker, contentStart);
      if (contentEnd === -1) {
        throw new Error(`Unterminated multiline field: ${startMarker}`);
      }
    } else {
      const nextFieldMatch = content.slice(contentStart).match(/\n[＜【]/);
      contentEnd = nextFieldMatch 
        ? contentStart + nextFieldMatch.index! 
        : content.length;
    }

    return content.slice(contentStart, contentEnd).trim();
  }

  private parseSimpleField(content: string, label: string): string | undefined {
    const regex = new RegExp(`${label}：(.+?)(?=\\n|$)`, 's');
    const match = content.match(regex);
    return match ? match[1].trim() : undefined;
  }

  private parseBlock(block: string, blockIndex: number): ParsedEntry | ParseError {
    try {
      // Extract title - handle both full-width and half-width numbers
      const titleMatch = block.match(/案件[０-９0-9]+：(.+?)(?=\n|$)/);
      if (!titleMatch) {
        return {
          type: 'MissingTitleError',
          blockIndex,
          detail: 'No title found in block',
          rawSnippet: block.slice(0, 300),
        };
      }

      const entry: ParsedEntry = {
        title: titleMatch[1].trim(),
        company: this.parseSimpleField(block, '会社'),
        distribution: this.parseSimpleField(block, '商流'),
        price: this.parseSimpleField(block, '単価'),
        period: this.parseSimpleField(block, '期間'),
        location: this.parseSimpleField(block, '場所'),
        billing: this.parseSimpleField(block, '精算'),
        interview: this.parseSimpleField(block, '面談'),
        time: this.parseSimpleField(block, '時間'),
        notes: this.parseSimpleField(block, '備考'),
      };

      // Parse multiline fields
      try {
        entry.description = this.parseMultilineField(block, '＜概要＞');
        entry.requirements = this.parseMultilineField(block, '＜必須スキル＞');
        entry.preferences = this.parseMultilineField(block, '＜尚可スキル＞');
        // Handle both ＜開発環境＞ and ＜環境＞
        entry.techStack = this.parseMultilineField(block, '＜開発環境＞') || this.parseMultilineField(block, '＜環境＞');
      } catch (error) {
        return {
          type: 'UnterminatedMultilineFieldError',
          blockIndex,
          detail: error instanceof Error ? error.message : 'Unknown error',
          rawSnippet: block.slice(0, 300),
        };
      }

      return entry;
    } catch (error) {
      return {
        type: 'CorruptBlockError',
        blockIndex,
        detail: error instanceof Error ? error.message : 'Unknown error parsing block',
        rawSnippet: block.slice(0, 300),
      };
    }
  }

  parse(content: string): ParseResult {
    const blocks = content.split(BLOCK_SEPARATOR);
    const entries: ParsedEntry[] = [];
    const errors: ParseError[] = [];

    blocks.forEach((block, index) => {
      // Skip completely empty blocks (common at start/end)
      if (!block.trim()) {
        return;
      }
      
      const result = this.parseBlock(block, index + 1);
      if ('type' in result) {
        errors.push(result);
      } else {
        entries.push(result);
      }
    });

    return { entries, errors };
  }

  async parseFile(filePath: string): Promise<ParseResult> {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parse(content);
  }
}
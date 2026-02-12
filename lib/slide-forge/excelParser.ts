import * as XLSX from 'xlsx';
import { ParsedExcel, ParsedSheet } from './types';

/**
 * Parse an Excel file buffer into structured data
 */
export function parseExcelBuffer(buffer: ArrayBuffer, fileName: string): ParsedExcel {
    const workbook = XLSX.read(buffer, { type: 'array' });

    const sheets: ParsedSheet[] = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
            defval: '',
        });

        if (jsonData.length === 0) {
            return {
                name: sheetName,
                headers: [],
                rows: [],
                rowCount: 0,
            };
        }

        const headers = Object.keys(jsonData[0]);
        const rows = jsonData.map((row) => {
            const cleanedRow: Record<string, string | number | boolean | null> = {};
            for (const key of headers) {
                const val = row[key];
                if (val === undefined || val === null || val === '') {
                    cleanedRow[key] = null;
                } else if (typeof val === 'number' || typeof val === 'boolean') {
                    cleanedRow[key] = val;
                } else {
                    cleanedRow[key] = String(val);
                }
            }
            return cleanedRow;
        });

        return {
            name: sheetName,
            headers,
            rows,
            rowCount: rows.length,
        };
    });

    const textSummary = buildTextSummary(sheets, fileName);

    return {
        fileName,
        sheets: sheets.filter((s) => s.rowCount > 0),
        textSummary,
    };
}

/**
 * Build a text summary of all sheets for AI consumption
 */
function buildTextSummary(sheets: ParsedSheet[], fileName: string): string {
    const parts: string[] = [`ファイル名: ${fileName}`];

    for (const sheet of sheets) {
        if (sheet.rowCount === 0) continue;

        parts.push(`\n--- シート: ${sheet.name} (${sheet.rowCount}行) ---`);
        parts.push(`カラム: ${sheet.headers.join(', ')}`);

        // Include up to 50 rows of data
        const maxRows = Math.min(sheet.rowCount, 50);
        for (let i = 0; i < maxRows; i++) {
            const row = sheet.rows[i];
            const rowStr = sheet.headers
                .map((h) => `${h}: ${row[h] ?? ''}`)
                .join(' | ');
            parts.push(rowStr);
        }

        if (sheet.rowCount > maxRows) {
            parts.push(`... 他 ${sheet.rowCount - maxRows} 行`);
        }
    }

    return parts.join('\n');
}

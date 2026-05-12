import type { TableInfo, TableColumn } from './types';

export function parseTable(sql: string, tableName: string): TableInfo {
    const lines = sql.split('\n').map(l => l.trim()).filter(Boolean);

    const columns: TableColumn[] = [];
    let inColumns = false;
    let tableComment = '';

    for (const line of lines) {
        if (line.startsWith('CREATE TABLE') && line.includes(`\`${tableName}\``)) {
            inColumns = true;
            continue;
        }

        if (inColumns) {
            if (/^\)\s*ENGINE\b/i.test(line)) {
                const tc = line.match(/COMMENT\s*=\s*(['"])(.*?)\1/i);
                tableComment = (tc && tc[2]) || '';
                break;
            }

            const match = line.match(
                /^`(\w+)`\s+(\w+(?:\([^)]+\))?)\s+((?:(?!\s+COMMENT\b).)*?)(?:\s+COMMENT\s+(["'])(.*?)\4)?\s*,?\s*$/i,
            );

            if (!match) continue;

            const [, name, sqlType, rest, , comment] = match;
            const camelName = snakeToCamel(name);
            const nullable = rest.includes('NULL') || rest.includes('DEFAULT');

            const isBaseField = ['id', 'create_time', 'update_time', 'version'].includes(
                name.toLowerCase(),
            );
            const isDeleteFlag = name.toLowerCase().includes('delete_flag');

            let tsType = 'string';
            if (sqlType.toLowerCase().includes('int')) tsType = 'number';
            if (sqlType.toLowerCase().includes('tinyint(1)') || isDeleteFlag) {
                tsType = 'boolean';
            }

            columns.push({
                name,
                camelName,
                type: tsType,
                nullable,
                comment: comment || '',
                isBaseField,
                isDeleteFlag,
            });
        }
    }

    const baseColumns = columns.filter(c => c.isBaseField);
    const businessColumns = columns.filter(c => !c.isBaseField);

    // 规范化表名：全部使用小写字母，避免大小写混用导致生成结果不一致
    const normalizedTableName = tableName.toLowerCase();

    const camelName = snakeToPascal(normalizedTableName);
    // 模块目录名与 linkPath / API 前缀一致：小写下划线表名
    const moduleName = normalizedTableName;

    return {
        name: moduleName,
        camelName,
        routePath: `/${normalizedTableName}`,
        routeName: camelName,
        tableComment,
        title: getTitleFromComment(
            tableComment || columns.find(c => c.name === 'name')?.comment || normalizedTableName,
        ),
        columns,
        baseColumns,
        businessColumns,
    };
}

function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
}

function snakeToPascal(str: string): string {
    const c = snakeToCamel(str);
    return c.charAt(0).toUpperCase() + c.slice(1);
}

function getTitleFromComment(comment: string): string {
    const m = comment.match(/[\u4e00-\u9fa5]+/);
    return m ? m[0] : comment;
}

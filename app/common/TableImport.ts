export interface TableImportRequestBody {
  source: { upload: number } | { url: string };

  // Replaces the `transforms` key from before
  // To skip a table, simply omit it from this array.
  tables: Array<{
    // Replaces the [origTableName: string] key from before.
    // Filename, Excel sheet name, etc.
    // Not required if only one table is uploaded.
    source?: string;

    target: { new: NewTableOptions } | { existing: ExistingTableOptions };
  }>;

  parseOptions?: CsvParseOptions | JsonParseOptions;
}

interface NewTableOptions {
  // Desired name of new table, used as page title and default widget title.
  // `tableId` will be derived from this.
  // If omitted, will be derived from `source` filename.
  // This option isn't in the UI, so we don't *need* to offer it now.
  name?: string;

  columns: Array<{
    // Column header name from uploaded table.
    // Replaces `sourceCols: string[]` from before.
    // Only columns mentioned here are imported.
    source: string;

    // id and fields are as in `POST /columns`.
    // Again, we don't *need* to offer these yet,
    // since the UI doesn't allow customizing them.
    id?: string;  // can be derived from `label`
    fields?: {
      label?: string;  // can be derived from `source`
      // I hestitate to offer these now, since it creates the expectation that
      // they will influence how values are parsed, which isn't currently true.
      type?: string;
      widgetOptions?: string | object;
    };
  }>;
}

interface ExistingTableOptions {
  // tableId or tableRef of table to import into.
  id?: string | number;

  columns: Array<{
    // Column header name from uploaded table.
    source: string;

    // colId or colRef of existing column
    id?: string | number;

    // Only allowed when importing into reference columns.
    // If true, treat values as row IDs
    // rather than looking up the value in the visible column.
    // Equivalent to choosing a source column with " (as row ID)" in the UI.
    rawReferences?: boolean;
  }>;

  // Omit to only add records instead of update
  merge?: {
    // Replaces `mergeCols: string[]` from before.
    targetColumns: Array<string | number>;
    strategy: 'replace-with-nonblank-source' | 'replace-all-fields' | 'replace-blank-fields-only';
  }
}

interface CsvParseOptions {
  lineTerminator?: string;
  fieldSeparator?: string;
  quoteChar?: string;
  doubleQuote?: boolean;
  firstRowIsHeader?: boolean;
  skipLeadingSpace?: boolean;
  encoding?: string;
}

interface JsonParseOptions {
  include?: string[];
  exclude?: string[];
}

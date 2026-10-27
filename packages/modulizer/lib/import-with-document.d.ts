import { Document, Import } from 'polymer-analyzer';
export interface ImportWithDocument extends Import {
    readonly document: Document;
}
export declare function isImportWithDocument(import_: Import): import_ is ImportWithDocument;

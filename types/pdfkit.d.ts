declare module 'pdfkit' {
  export default class PDFDocument {
    constructor(options?: any);
    pipe(destination: any): this;
    fontSize(size: number): this;
    font(font: string): this;
    fillColor(color: string): this;
    text(text: string, options?: any): this;
    text(text: string, x?: number, y?: number, options?: any): this;
    moveDown(lines?: number): this;
    strokeColor(color: string): this;
    lineWidth(width: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    end(): void;
    y: number;
  }
}
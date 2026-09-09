/**
 * md_to_docx_converter.js
 * 
 * Prepackaged Markdown-to-DOCX converter for demo script generation.
 * Bundled with the custom-demo-creation skill.
 * 
 * Usage:
 *   Set session.MD_INPUT_PATH and session.DOCX_OUTPUT_PATH before running.
 *   e.g.:
 *     session.MD_INPUT_PATH = '/path/to/2)demo-script.md';
 *     session.DOCX_OUTPUT_PATH = WORKSPACE_DIR + '/artifacts/3)demo-script.docx';
 * 
 * Handles: H1-H3 headings, bold/italic, bullet lists, horizontal rules, 
 *          code blocks, blockquotes, and paragraphs.
 */

const fs = require('fs');
const docx = require('docx');

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TabStopPosition, TabStopType
} = docx;

// Read input
const mdPath = session.MD_INPUT_PATH;
const outputPath = session.DOCX_OUTPUT_PATH;

if (!mdPath || !outputPath) {
  throw new Error('session.MD_INPUT_PATH and session.DOCX_OUTPUT_PATH must be set');
}

const mdContent = fs.readFileSync(mdPath, 'utf-8');
const lines = mdContent.split('\n');

// Parse markdown into document paragraphs
const children = [];
let inCodeBlock = false;
let codeBlockLines = [];

function parseInlineFormatting(text) {
  // Parse bold (**text** or __text__) and italic (*text* or _text_)
  const runs = [];
  // Regex to split on bold/italic markers
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else if (part) {
      runs.push(new TextRun({ text: part }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text })];
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Code block handling
  if (line.startsWith('```')) {
    if (inCodeBlock) {
      // End code block - emit accumulated lines
      children.push(new Paragraph({
        children: [new TextRun({ 
          text: codeBlockLines.join('\n'), 
          font: 'Courier New',
          size: 20 // 10pt
        })],
        spacing: { before: 100, after: 100 },
      }));
      codeBlockLines = [];
      inCodeBlock = false;
    } else {
      inCodeBlock = true;
    }
    continue;
  }
  
  if (inCodeBlock) {
    codeBlockLines.push(line);
    continue;
  }
  
  // Horizontal rule
  if (line.match(/^---+$/)) {
    children.push(new Paragraph({
      children: [],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
      spacing: { before: 200, after: 200 },
    }));
    continue;
  }
  
  // Headings
  if (line.startsWith('# ') && !line.startsWith('## ')) {
    children.push(new Paragraph({
      children: parseInlineFormatting(line.slice(2)),
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    }));
    continue;
  }
  if (line.startsWith('## ') && !line.startsWith('### ')) {
    children.push(new Paragraph({
      children: parseInlineFormatting(line.slice(3)),
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }));
    continue;
  }
  if (line.startsWith('### ')) {
    children.push(new Paragraph({
      children: parseInlineFormatting(line.slice(4)),
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 160, after: 80 },
    }));
    continue;
  }
  
  // Blockquote
  if (line.startsWith('> ')) {
    children.push(new Paragraph({
      children: parseInlineFormatting(line.slice(2)),
      indent: { left: 720 }, // 0.5 inch
      spacing: { before: 60, after: 60 },
    }));
    continue;
  }
  
  // Bullet list (- or *)
  if (line.match(/^\s*[-*]\s+/)) {
    const indent = line.match(/^(\s*)/)[1].length;
    const text = line.replace(/^\s*[-*]\s+/, '');
    children.push(new Paragraph({
      children: parseInlineFormatting(text),
      bullet: { level: Math.min(Math.floor(indent / 2), 3) },
      spacing: { before: 40, after: 40 },
    }));
    continue;
  }
  
  // Numbered list
  if (line.match(/^\s*\d+\.\s+/)) {
    const text = line.replace(/^\s*\d+\.\s+/, '');
    children.push(new Paragraph({
      children: parseInlineFormatting(text),
      bullet: { level: 0 },
      spacing: { before: 40, after: 40 },
    }));
    continue;
  }
  
  // Empty line
  if (line.trim() === '') {
    children.push(new Paragraph({ children: [], spacing: { before: 60, after: 60 } }));
    continue;
  }
  
  // Regular paragraph
  children.push(new Paragraph({
    children: parseInlineFormatting(line),
    spacing: { before: 60, after: 60 },
  }));
}

// Build document
const doc = new Document({
  sections: [{
    properties: {},
    children: children,
  }],
});

// Write output
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`\u2705 DOCX generated successfully: ${outputPath}`);
  console.log(`   Size: ${buffer.length} bytes`);
  console.log(`   Paragraphs: ${children.length}`);
}).catch(err => {
  console.error('ERROR generating DOCX:', err.message);
});

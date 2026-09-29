import { marked } from 'marked';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Packer,
  convertInchesToTwip
} from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function renderMarkdownToHtml(markdownText: string): string {
  if (!markdownText) return '';
  try {
    return marked.parse(markdownText, { gfm: true, breaks: true }) as string;
  } catch (err) {
    console.error('Error parsing markdown:', err);
    return markdownText;
  }
}

/**
 * Helper to parse bold (**...**) and italic (*...*) in a line into docx TextRuns
 */
function parseFormattedTextRuns(lineText: string, defaultOptions?: { color?: string; size?: number }): TextRun[] {
  const runs: TextRun[] = [];
  // Regex to split by bold (**text**) or italic (*text*)
  const tokens = lineText.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  for (const token of tokens) {
    if (!token) continue;

    if (token.startsWith('**') && token.endsWith('**')) {
      runs.push(
        new TextRun({
          text: token.slice(2, -2),
          bold: true,
          color: defaultOptions?.color,
          size: defaultOptions?.size || 22,
          font: 'Calibri'
        })
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          italics: true,
          color: defaultOptions?.color,
          size: defaultOptions?.size || 22,
          font: 'Calibri'
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: token,
          color: defaultOptions?.color,
          size: defaultOptions?.size || 22,
          font: 'Calibri'
        })
      );
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: lineText, size: defaultOptions?.size || 22, font: 'Calibri' })];
}

/**
 * Export to genuine Microsoft Word (.docx) file
 */
export async function exportToDocx(
  title: string,
  markdownContent: string,
  metadata?: {
    schoolName?: string;
    authorName?: string;
    jenjang?: string;
    tingkat?: string;
    fase?: string;
    mapel?: string;
    nip?: string;
  }
): Promise<void> {
  const lines = markdownContent.split('\n');
  const docChildren: (Paragraph | Table)[] = [];

  // 1. Official Indonesian Administrative Header (Kop Surat Resmi)
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH REPUBLIK INDONESIA',
          bold: true,
          size: 20,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH',
          bold: true,
          size: 22,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: (metadata?.schoolName || 'SATUAN PENDIDIKAN KURIKULUM MERDEKA').toUpperCase(),
          bold: true,
          size: 28,
          color: '1E3A8A',
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: {
        bottom: {
          color: '000000',
          space: 1,
          style: BorderStyle.DOUBLE,
          size: 24
        }
      },
      children: [
        new TextRun({
          text: 'Implementasi Kurikulum Merdeka Berdasarkan Permendikbudristek No. 12 Tahun 2024 & Panduan Pembelajaran dan Asesmen',
          italics: true,
          size: 18,
          color: '555555',
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({ spacing: { after: 180 }, children: [] })
  );

  // 2. Parse Markdown Body Content into docx paragraphs and tables
  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      i++;
      continue;
    }

    // Markdown Table detection: starts and ends with |
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableRows: TableRow[] = [];
      let isHeader = true;

      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const rowLine = lines[i].trim();

        // Skip divider line like |---|---|
        if (rowLine.replace(/[|\-\s:]/g, '') === '') {
          i++;
          isHeader = false;
          continue;
        }

        const rawCells = rowLine.split('|').slice(1, -1);
        const cells: TableCell[] = rawCells.map(c => {
          const cellText = c.trim();
          return new TableCell({
            width: {
              size: Math.floor(100 / Math.max(rawCells.length, 1)),
              type: WidthType.PERCENTAGE
            },
            shading: isHeader ? { fill: 'F1F5F9' } : undefined,
            margins: {
              top: convertInchesToTwip(0.06),
              bottom: convertInchesToTwip(0.06),
              left: convertInchesToTwip(0.08),
              right: convertInchesToTwip(0.08)
            },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: parseFormattedTextRuns(cellText, {
                  size: 20
                })
              })
            ]
          });
        });

        tableRows.push(new TableRow({ children: cells }));
        isHeader = false;
        i++;
      }

      if (tableRows.length > 0) {
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows
          })
        );
        docChildren.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      }
      continue;
    }

    // Heading 1 (# ...)
    if (line.startsWith('# ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({
              text: line.replace('# ', ''),
              bold: true,
              size: 28,
              color: '0F172A',
              font: 'Calibri'
            })
          ]
        })
      );
    }
    // Heading 2 (## ...)
    else if (line.startsWith('## ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: line.replace('## ', ''),
              bold: true,
              size: 24,
              color: '1E3A8A',
              font: 'Calibri'
            })
          ]
        })
      );
    }
    // Heading 3 (### ...)
    else if (line.startsWith('### ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: line.replace('### ', ''),
              bold: true,
              size: 22,
              color: '334155',
              font: 'Calibri'
            })
          ]
        })
      );
    }
    // Heading 4 (#### ...)
    else if (line.startsWith('#### ')) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: line.replace('#### ', ''),
              bold: true,
              size: 21,
              color: '475569',
              font: 'Calibri'
            })
          ]
        })
      );
    }
    // Bullet item (* ... or - ...)
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      const bulletText = line.substring(2);
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 },
          children: parseFormattedTextRuns(bulletText)
        })
      );
    }
    // Numbered item (1. ..., 2. ...)
    else if (/^\d+\.\s/.test(line)) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 50, after: 50 },
          children: parseFormattedTextRuns(line)
        })
      );
    }
    // Horizontal rule (---)
    else if (line === '---' || line === '***') {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 100 },
          border: {
            bottom: {
              color: 'CBD5E1',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6
            }
          },
          children: []
        })
      );
    }
    // Regular paragraph
    else {
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: parseFormattedTextRuns(line)
        })
      );
    }

    i++;
  }

  // 3. Official Signatures Section (Mengetahui Kepala Satuan Pendidikan & Guru Pengampu)
  docChildren.push(
    new Paragraph({ spacing: { before: 300, after: 100 }, children: [] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Mengetahui,', size: 21, font: 'Calibri' })]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Kepala Satuan Pendidikan', bold: true, size: 21, font: 'Calibri' })]
                }),
                new Paragraph({ spacing: { before: 600, after: 0 }, children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Drs. H. Mulyadi, M.Pd.', bold: true, underline: {}, size: 21, font: 'Calibri' })]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'NIP. 19710318 199702 1 002', size: 19, color: '555555', font: 'Calibri' })]
                })
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                      size: 21,
                      font: 'Calibri'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Guru Mata Pelajaran / Kelas', bold: true, size: 21, font: 'Calibri' })]
                }),
                new Paragraph({ spacing: { before: 600, after: 0 }, children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: metadata?.authorName || 'Bapak/Ibu Guru',
                      bold: true,
                      underline: {},
                      size: 21,
                      font: 'Calibri'
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `NIP. ${metadata?.nip || '19890412 201402 2 003'}`,
                      size: 19,
                      color: '555555',
                      font: 'Calibri'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  );

  // Generate Docx Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.9),
              bottom: convertInchesToTwip(0.9),
              left: convertInchesToTwip(1.0),
              right: convertInchesToTwip(0.8)
            }
          }
        },
        children: docChildren
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'Perangkat_Ajar_Kurikulum_Merdeka';

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanTitle}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export element directly to high-fidelity PDF using html2canvas & jsPDF
 */
export async function exportToPdf(
  elementId: string,
  filename: string
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add subsequent pages if document is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'Perangkat_Ajar_Kurikulum_Merdeka';
    pdf.save(`${cleanFilename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}

/**
 * Legacy HTML-based Word Export (.doc) for maximum backward compatibility
 */
export function downloadWordDocument(
  title: string,
  markdownContent: string,
  metadata?: {
    schoolName?: string;
    authorName?: string;
    jenjang?: string;
    tingkat?: string;
    fase?: string;
    mapel?: string;
  }
) {
  const htmlBody = renderMarkdownToHtml(markdownContent);
  const cleanTitle = title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'Perangkat_Ajar_Kurikulum_Merdeka';

  const fullWordHtml = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>${cleanTitle}</title>
    <style>
      @page {
        size: A4;
        margin: 2.5cm 2cm 2.5cm 2cm;
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.35;
        color: #000;
        background-color: #fff;
      }
      h1, h2, h3, h4 {
        font-family: Arial, Helvetica, sans-serif;
        color: #111;
        margin-top: 14pt;
        margin-bottom: 6pt;
      }
      h1 { font-size: 16pt; font-weight: bold; text-align: center; border-bottom: 2px solid #000; padding-bottom: 4pt; }
      h2 { font-size: 14pt; font-weight: bold; border-left: 4pt solid #1e3a8a; padding-left: 6pt; }
      h3 { font-size: 12.5pt; font-weight: bold; }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 12pt 0;
        font-size: 11pt;
      }
      th, td {
        border: 1px solid #333;
        padding: 6pt 8pt;
        text-align: left;
        vertical-align: top;
      }
      th {
        background-color: #f1f5f9;
        font-weight: bold;
      }
      p { margin: 6pt 0; text-align: justify; }
      ul, ol { margin: 6pt 0 6pt 20pt; }
      li { margin-bottom: 4pt; }
      .kop-surat {
        text-align: center;
        border-bottom: 3px double #000;
        padding-bottom: 8pt;
        margin-bottom: 16pt;
      }
      .kop-kementerian { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
      .kop-dinas { font-size: 12pt; font-weight: bold; text-transform: uppercase; }
      .kop-sekolah { font-size: 15pt; font-weight: bold; text-transform: uppercase; color: #1e3a8a; }
      .kop-alamat { font-size: 9pt; font-style: italic; color: #444; }
    </style>
  </head>
  <body>
    <div class="kop-surat">
      <div class="kop-kementerian">KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH REPUBLIK INDONESIA</div>
      <div class="kop-dinas">DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH</div>
      <div class="kop-sekolah">${metadata?.schoolName || 'SATUAN PENDIDIKAN KURIKULUM MERDEKA'}</div>
      <div class="kop-alamat">Implementasi Kurikulum Merdeka Berdasarkan Permendikbudristek No. 12 Tahun 2024 & Panduan Pembelajaran dan Asesmen</div>
    </div>

    ${htmlBody}

    <div style="clear: both; margin-top: 40pt;">
      <table style="border: none; width: 100%;">
        <tr style="border: none;">
          <td style="border: none; width: 50%; text-align: center;">
            Mengetahui,<br>
            Kepala Satuan Pendidikan<br><br><br><br><br>
            <b>Drs. H. Mulyadi, M.Pd.</b><br>
            NIP. 19710318 199702 1 002
          </td>
          <td style="border: none; width: 50%; text-align: center;">
            Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
            Guru Mata Pelajaran / Kelas<br><br><br><br><br>
            <b>${metadata?.authorName || 'Bapak/Ibu Guru'}</b><br>
            NIP. ....................................................
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff' + fullWordHtml], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanTitle}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return Promise.resolve(successful);
  } catch (err) {
    console.error('Failed to copy', err);
    return Promise.resolve(false);
  }
}

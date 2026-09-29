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
  ImageRun,
  LineRuleType,
  convertInchesToTwip
} from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** Standar naskah dokumen: Calibri 12pt, spasi 1.5, kertas A4 */
const DOC_FONT = 'Calibri';
const BODY_SIZE = 24; // 12pt dalam half-point

const ALLOWED_HTML_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'HR', 'I', 'IMG', 'LI', 'OL', 'P', 'PRE', 'S', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TFOOT',
  'TH', 'THEAD', 'TR', 'UL'
]);

const ALLOWED_HTML_ATTRIBUTES = new Set([
  'alt', 'colspan', 'height', 'href', 'rowspan', 'src', 'title', 'width'
]);

function isSafeUrl(value: string, kind: 'href' | 'src'): boolean {
  const normalized = value.trim().toLowerCase();
  if (kind === 'href') {
    return normalized.startsWith('https://') || normalized.startsWith('http://') || normalized.startsWith('mailto:');
  }
  return (
    normalized.startsWith('https://') ||
    normalized.startsWith('http://') ||
    /^data:image\/(png|jpeg|gif|webp);base64,/i.test(normalized)
  );
}

/**
 * Marked explicitly does not sanitize HTML. The viewer injects the rendered
 * result into the DOM, so sanitize the HTML tree before it reaches innerHTML.
 */
export function sanitizeRenderedHtml(html: string): string {
  if (!html || typeof DOMParser === 'undefined') return html;

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const elements = Array.from(parsed.body.querySelectorAll('*'));

  for (const element of elements) {
    if (!ALLOWED_HTML_TAGS.has(element.tagName)) {
      element.remove();
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;

      if (name.startsWith('on') || name === 'style' || name === 'srcdoc' || !ALLOWED_HTML_ATTRIBUTES.has(name)) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if ((name === 'href' || name === 'src') && !isSafeUrl(value, name as 'href' | 'src')) {
        element.removeAttribute(attribute.name);
      }
    }

    if (element.tagName === 'A') {
      element.setAttribute('rel', 'noreferrer noopener');
    }
  }

  return parsed.body.innerHTML;
}

export function renderMarkdownToHtml(markdownText: string): string {
  if (!markdownText) return '';
  try {
    const rendered = marked.parse(markdownText, { gfm: true, breaks: true }) as string;
    return sanitizeRenderedHtml(rendered);
  } catch (err) {
    console.error('Error parsing markdown:', err);
    return sanitizeRenderedHtml(String(markdownText));
  }
}

/**
 * Helper to parse bold (**...**) and italic (*...*) in a line into docx TextRuns
 */
function parseFormattedTextRuns(
  lineText: string,
  defaultOptions?: { color?: string; size?: number; italics?: boolean }
): TextRun[] {
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
          italics: defaultOptions?.italics,
          color: defaultOptions?.color,
          size: defaultOptions?.size || BODY_SIZE,
          font: DOC_FONT
        })
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          italics: true,
          color: defaultOptions?.color,
          size: defaultOptions?.size || BODY_SIZE,
          font: DOC_FONT
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: token,
          italics: defaultOptions?.italics,
          color: defaultOptions?.color,
          size: defaultOptions?.size || BODY_SIZE,
          font: DOC_FONT
        })
      );
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: lineText, size: defaultOptions?.size || BODY_SIZE, font: DOC_FONT })];
}

/**
 * Muat gambar (mis. logo sekolah) untuk disematkan ke docx.
 * Mengembalikan buffer + dimensi yang diskalakan ke tinggi target px.
 */
function loadImageForDocx(url: string, targetHeightPx: number): Promise<{ data: ArrayBuffer; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const scale = targetHeightPx / (img.naturalHeight || targetHeightPx);
        const width = Math.max(1, Math.round((img.naturalWidth || targetHeightPx) * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = targetHeightPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas tidak tersedia');
        ctx.drawImage(img, 0, 0, width, targetHeightPx);
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('Gagal meraster gambar'));
            return;
          }
          blob.arrayBuffer().then(data => resolve({ data, width, height: targetHeightPx })).catch(reject);
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Gambar tidak dapat dimuat: ' + url));
    img.src = url;
  });
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
    npsn?: string;
    address?: string;
    accreditation?: string;
    city?: string;
    logoUrl?: string;
    principalName?: string;
    principalNip?: string;
  }
): Promise<void> {
  const lines = markdownContent.split('\n');
  const docChildren: (Paragraph | Table)[] = [];

  // 1. Kop resmi (Calibri, hitam formal — dari konfigurasi sekolah)
  const kopAddrParts: string[] = [];
  if (metadata?.address) kopAddrParts.push(metadata.address);
  kopAddrParts.push(`NPSN: ${metadata?.npsn || '............'}`);
  if (metadata?.accreditation) kopAddrParts.push(`Akreditasi ${metadata.accreditation}`);

  // Logo sekolah (best-effort): disematkan bila berkas dapat dimuat
  const logoRuns: TextRun[] = [];
  let logoImage: { data: ArrayBuffer; width: number; height: number } | null = null;
  if (metadata?.logoUrl) {
    try {
      logoImage = await loadImageForDocx(metadata.logoUrl, 70);
    } catch {
      logoImage = null;
    }
  }

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH REPUBLIK INDONESIA',
          bold: true,
          size: 22,
          font: DOC_FONT
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
          size: 24,
          font: DOC_FONT
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
          size: 30,
          color: '000000',
          font: DOC_FONT
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
          text: kopAddrParts.join(' • '),
          italics: true,
          size: 18,
          color: '444444',
          font: DOC_FONT
        })
      ]
    }),
    new Paragraph({ spacing: { after: 180 }, children: [] })
  );

  // Sisipkan logo tepat di bawah kop bila tersedia
  if (logoImage) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new ImageRun({
            type: 'png',
            data: logoImage.data,
            transformation: { width: logoImage.width, height: logoImage.height }
          })
        ]
      })
    );
  }

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
            shading: isHeader ? { fill: 'F2F2F2' } : undefined,
            margins: {
              top: convertInchesToTwip(0.06),
              bottom: convertInchesToTwip(0.06),
              left: convertInchesToTwip(0.08),
              right: convertInchesToTwip(0.08)
            },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40, line: 360, lineRule: LineRuleType.AUTO },
                children: parseFormattedTextRuns(cellText, {
                  size: 22
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
              size: 32,
              color: '000000',
              font: DOC_FONT
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
              size: 28,
              color: '000000',
              font: DOC_FONT
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
              size: 24,
              color: '000000',
              font: DOC_FONT
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
              size: 24,
              color: '000000',
              font: DOC_FONT
            })
          ]
        })
      );
    }
    // Gambar markdown ![alt](url) -> keterangan ilustrasi terpusat
    else if (/^!\[.*\]\(.*\)/.test(line)) {
      const alt = line.replace(/^!\[(.*)\]\(.*\)/, '$1').trim() || 'Ilustrasi pembelajaran';
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({
              text: `[Ilustrasi: ${alt}]`,
              italics: true,
              size: 20,
              color: '555555',
              font: DOC_FONT
            })
          ]
        })
      );
    }
    // Kutipan (>) -> paragraf menjorok miring
    else if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s?/, '');
      docChildren.push(
        new Paragraph({
          indent: { left: convertInchesToTwip(0.4) },
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 60, after: 60, line: 360, lineRule: LineRuleType.AUTO },
          children: parseFormattedTextRuns(quoteText, { italics: true })
        })
      );
    }
    // Bullet item (* ... or - ...)
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      const bulletText = line.substring(2);
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 40, after: 40, line: 360, lineRule: LineRuleType.AUTO },
          children: parseFormattedTextRuns(bulletText)
        })
      );
    }
    // Numbered item (1. ..., 2. ...)
    else if (/^\d+\.\s/.test(line)) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 50, after: 50, line: 360, lineRule: LineRuleType.AUTO },
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
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 60, after: 60, line: 360, lineRule: LineRuleType.AUTO },
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
                  children: [new TextRun({ text: 'Mengetahui,', size: 24, font: DOC_FONT })]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Kepala Satuan Pendidikan', bold: true, size: 24, font: DOC_FONT })]
                }),
                new Paragraph({ spacing: { before: 600, after: 0 }, children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: metadata?.principalName || '........................................................', bold: true, size: 24, font: DOC_FONT })]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `NIP. ${metadata?.principalNip || '................................'}`, size: 20, color: '555555', font: DOC_FONT })]
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
                      text: `${metadata?.city || 'Jakarta'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                      size: 24,
                      font: DOC_FONT
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'Guru Mata Pelajaran / Kelas', bold: true, size: 24, font: DOC_FONT })]
                }),
                new Paragraph({ spacing: { before: 600, after: 0 }, children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: metadata?.authorName || 'Bapak/Ibu Guru',
                      bold: true,
                      underline: {},
                      size: 24,
                      font: DOC_FONT
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `NIP. ${metadata?.nip || '................................'}`,
                      size: 20,
                      color: '555555',
                      font: DOC_FONT
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

  // Generate Docx Document — kertas A4, margin naskah dinas (atas 4cm, lain 3cm)
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // 210mm
              height: 16838 // 297mm
            },
            margin: {
              top: 2268, // 4cm
              bottom: 1701, // 3cm
              left: 1701, // 3cm
              right: 1701 // 3cm
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
    npsn?: string;
    address?: string;
    accreditation?: string;
    city?: string;
    logoUrl?: string;
    principalName?: string;
    principalNip?: string;
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
        font-family: Calibri, 'Segoe UI', Arial, sans-serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
        background-color: #fff;
      }
      h1, h2, h3, h4 {
        font-family: Calibri, 'Segoe UI', Arial, sans-serif;
        color: #111;
        margin-top: 14pt;
        margin-bottom: 6pt;
      }
      h1 { font-size: 16pt; font-weight: bold; text-align: center; border-bottom: 2px solid #000; padding-bottom: 4pt; }
      h2 { font-size: 14pt; font-weight: bold; }
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
      .kop-sekolah { font-size: 15pt; font-weight: bold; text-transform: uppercase; color: #000; }
      .kop-alamat { font-size: 9pt; font-style: italic; color: #444; }
    </style>
  </head>
  <body>
    <div class="kop-surat">
      <div class="kop-logo">${metadata?.logoUrl ? `<img src="${metadata.logoUrl}" alt="Logo" style="height: 60pt;">` : ''}</div>
      <div class="kop-kementerian">KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH REPUBLIK INDONESIA</div>
      <div class="kop-dinas">DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH</div>
      <div class="kop-sekolah">${metadata?.schoolName || 'SATUAN PENDIDIKAN KURIKULUM MERDEKA'}</div>
      <div class="kop-alamat">${metadata?.address ? metadata.address + ' • ' : ''}NPSN: ${metadata?.npsn || '............'}${metadata?.accreditation ? ' • Akreditasi ' + metadata.accreditation : ''} — Implementasi Kurikulum Merdeka Permendikbudristek No. 12 Tahun 2024</div>
    </div>

    ${htmlBody}

    <div style="clear: both; margin-top: 40pt;">
      <table style="border: none; width: 100%;">
        <tr style="border: none;">
          <td style="border: none; width: 50%; text-align: center;">
            Mengetahui,<br>
            Kepala Satuan Pendidikan<br><br><br><br><br>
            <b>${metadata?.principalName || '........................................................'}</b><br>
            NIP. ${metadata?.principalNip || '................................'}
          </td>
          <td style="border: none; width: 50%; text-align: center;">
            ${metadata?.city || 'Jakarta'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
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

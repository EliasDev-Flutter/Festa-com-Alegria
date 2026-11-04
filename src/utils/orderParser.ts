import { ParsedWhatsAppOrder } from '../types/index.ts';

const MONTH_NAMES: Record<string, string> = {
  janeiro: '01',
  jan: '01',
  fevereiro: '02',
  fev: '02',
  marco: '03',
  março: '03',
  mar: '03',
  abril: '04',
  abr: '04',
  maio: '05',
  mai: '05',
  junho: '06',
  jun: '06',
  julho: '07',
  jul: '07',
  agosto: '08',
  ago: '08',
  setembro: '09',
  set: '09',
  outubro: '10',
  out: '10',
  novembro: '11',
  nov: '11',
  dezembro: '12',
  dez: '12',
};

export function parseWhatsAppMessage(rawText: string): ParsedWhatsAppOrder {
  const text = rawText.trim();
  let clientName = '';
  let partyDate = '';
  let theme = '';
  let location = '';
  let value = 0;
  let clientPhone = '';
  let notes = '';

  // 1. Phone extraction
  const phoneMatch = text.match(/(?:\+?55\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:9\s?[0-9]{4}[-\s]?[0-9]{4}|[0-9]{4,5}[-\s]?[0-9]{4})/);
  if (phoneMatch) {
    clientPhone = phoneMatch[0].trim();
  }

  // 2. Name extraction
  // Matches: "aniversário da Sophia", "aniversário do Enzo", "Oi sou a Mariana", "meu nome é Carla", "aqui é a Patricia"
  const nameIntroMatch = text.match(/(?:sou\s+a\s+|sou\s+o\s+|meu\s+nome\s+é\s+|aqui\s+é\s+(?:a\s+|o\s+)?)([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)?)/i);
  if (nameIntroMatch) {
    clientName = nameIntroMatch[1].trim();
  } else {
    // Check WhatsApp header pattern "[14:32, 10/11/2026] Maria Clara: ..."
    const waHeaderMatch = text.match(/\]\s*([^:]+):/);
    if (waHeaderMatch) {
      clientName = waHeaderMatch[1].trim();
    } else {
      // Check for child's birthday name: "aniversário da Sophia", "festa do Noah"
      const childMatch = text.match(/(?:anivers[áa]rio\s+(?:d[ao]|de)\s+|festa\s+(?:d[ao]|de)\s+)([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)/i);
      if (childMatch) {
        clientName = childMatch[1].trim() + " (Mãe/Pai)";
      }
    }
  }

  // Strip WhatsApp message metadata timestamp [HH:mm, DD/MM/YYYY] from body when searching for party date
  let bodyForDate = text;
  const headerDateMatch = text.match(/^\[[0-9]{1,2}:[0-9]{2},\s*[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}\]/);
  if (headerDateMatch) {
    bodyForDate = text.slice(headerDateMatch[0].length);
  }

  // 3. Theme extraction
  // Matches: "tema Safari", "tema: Jardim Encantado", "decoração tema Safari", "tema vai ser Balões Candy", "decoração de astronauta"
  const themeMatch = text.match(/(?:tema(?:\s+vai\s+ser)?(?:\s*:\s*|\s+))([A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9a-záéíóúâêôãõç\s\-]+?)(?=[,\.\?!;\n]|(?:\b(?:no\s+)?dia\b)|no\s+buffet|em\s+|valor|ficou|$)/i);
  if (themeMatch) {
    theme = themeMatch[1].trim();
  } else {
    // Check for "decoração de X" or "decoração tema X"
    const decorMatch = text.match(/decora[çc][ãa]o\s+(?:de\s+|do\s+|da\s+|tema\s+)([A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9a-záéíóúâêôãõç\s\-]+?)(?=[,\.\?!;\n]|(?:\b(?:no\s+)?dia\b)|no\s+buffet|em\s+|valor|ficou|$)/i);
    if (decorMatch) {
      theme = decorMatch[1].trim();
    }
  }

  // 4. Value extraction
  // Matches: "R$ 1.850", "R$1850,00", "1.850,00", "ficou R$ 2.300", "2200 reais"
  const valueMatch = text.match(/(?:R\$\s*|ficou\s*(?:em\s*)?R?\$\s*|valor\s*(?:de\s*)?R?\$\s*)([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]+(?:,[0-9]{2})?)/i)
    || text.match(/([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]{3,5})\s*reais/i);

  if (valueMatch) {
    const rawNum = valueMatch[1].replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) {
      value = parsed;
    }
  }

  // 5. Date & Time extraction
  let partyTime = '';
  // Time matches: "às 14:00", "às 15h", "horário de 16:30 horas", "14h30"
  const timeMatch = bodyForDate.match(/(?:[àa]s|hor[áa]rio\s+(?:de\s+)?)\s*([0-2]?[0-9])(?:[:hH]([0-5][0-9]))?\s*(?:h|horas|hrs)?/i)
    || bodyForDate.match(/([0-2]?[0-9])[hH]([0-5][0-9])?\s*(?:horas)?/i);

  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = (timeMatch[2] || '00').padStart(2, '0');
    if (parseInt(hours, 10) < 24 && parseInt(minutes, 10) < 60) {
      partyTime = `${hours}:${minutes}`;
    }
  }

  // Formats: DD/MM/YYYY, DD/MM/YY, DD/MM, "18 de novembro de 2026", "dia 18 de novembro"
  const dateSlashMatch = bodyForDate.match(/(?:dia\s+)?([0-3]?[0-9])\/([0-1]?[0-9])(?:\/([2-9][0-9]{3}|[2-9][0-9]))?/);
  if (dateSlashMatch) {
    const day = dateSlashMatch[1].padStart(2, '0');
    const month = dateSlashMatch[2].padStart(2, '0');
    let year = dateSlashMatch[3];
    if (!year) {
      year = new Date().getFullYear().toString();
    } else if (year.length === 2) {
      year = '20' + year;
    }
    partyDate = `${year}-${month}-${day}`;
  } else {
    // Match "18 de novembro de 2026" or "18 de novembro"
    const dateTextMatch = bodyForDate.match(/(?:dia\s+)?([0-3]?[0-9])\s+de\s+([a-záéíóúç]+)(?:\s+de\s+([2-9][0-9]{3}))?/i);
    if (dateTextMatch) {
      const day = dateTextMatch[1].padStart(2, '0');
      const monthStr = dateTextMatch[2].toLowerCase();
      const month = MONTH_NAMES[monthStr] || '11';
      const year = dateTextMatch[3] || new Date().getFullYear().toString();
      partyDate = `${year}-${month}-${day}`;
    }
  }

  // 6. Location extraction
  // Matches: "no buffet Splash Kids", "no salão do condomínio", "no Buffet Planet Kids", "em casa", "no espaço Maria Flor"
  const locationMatch = text.match(/(?:no\s+buffet|no\s+sal[ãa]o|no\s+espa[çc]o|no\s+condom[íi]nio|em\s+casa)\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9a-záéíóúâêôãõç\s\-]+?)(?=[,\.\n]|no\s+dia|valor|ficou|$)/i);
  if (locationMatch) {
    location = locationMatch[0].trim();
  } else if (/em\s+casa/i.test(text)) {
    location = "Em Casa";
  }

  // Notes: if there are details like balloon arch, colors, etc.
  const notesMatches: string[] = [];
  if (/arco\s+(?:desconstru[íi]do|org[âa]nico|de\s+bal[õo]es)/i.test(text)) {
    notesMatches.push("Com arco de balões desconstruído");
  }
  if (/painel/i.test(text)) {
    notesMatches.push("Inclui painel temático");
  }
  if (/mesa/i.test(text)) {
    notesMatches.push("Mesa completa com cilindros/suportes");
  }
  notes = notesMatches.join(' · ');

  // 7. Payment method extraction
  let paymentMethod: any = undefined;
  let installments: number | undefined = undefined;
  let splitMonths: any = undefined;

  if (/pix/i.test(text)) {
    paymentMethod = 'pix';
  } else if (/cart[ãa]o/i.test(text) || /parcelad[ao]/i.test(text) || /\b(?:[1-9]|1[0-2])\s*x\b/i.test(text)) {
    paymentMethod = 'cartao_credito';
    const instMatch = text.match(/\b([1-9]|1[0-2])\s*x\b/i) || text.match(/(?:em|de)\s*([1-9]|1[0-2])\s*(?:vezes|parcelas)/i);
    if (instMatch) {
      installments = parseInt(instMatch[1], 10);
    } else {
      installments = 1;
    }
  } else if (/d[ée]bito/i.test(text)) {
    paymentMethod = 'debito';
  } else if (/boleto/i.test(text)) {
    paymentMethod = 'boleto';
  } else if (/50%|metade|sinal/i.test(text)) {
    paymentMethod = 'cinquenta_porcento';
    const monthsFound = text.match(/(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/gi);
    if (monthsFound && monthsFound.length >= 2) {
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      splitMonths = {
        firstMonth: cap(monthsFound[0]),
        secondMonth: cap(monthsFound[1]),
      };
    } else {
      splitMonths = {
        firstMonth: 'Novembro',
        secondMonth: 'Dezembro',
      };
    }
  } else if (/[àa]\s*vista|dinheiro/i.test(text)) {
    paymentMethod = 'a_vista';
  }

  // Compute confidence (0 to 1) based on extracted core fields
  let found = 0;
  if (clientName) found++;
  if (partyDate) found++;
  if (theme) found++;
  if (value > 0) found++;
  const confidence = Math.min(1, found / 4);

  return {
    clientName,
    partyDate,
    partyTime,
    theme,
    location,
    value,
    clientPhone,
    paymentMethod,
    installments,
    splitMonths,
    notes,
    confidence,
  };
}

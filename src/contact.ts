import { isFoundStatus } from './types';

export interface ContactInfo {
  name: string;
  email: string;
  title: string;
  status: string;
  hasPrivateDetail: boolean;
}

/** Enlace que abre en Gmail la redacción de un correo ya dirigido y con asunto y cuerpo sugeridos. */
export const gmailComposeUrl = ({ to, subject, body }: { to: string; subject: string; body: string }) =>
  'https://mail.google.com/mail/?' +
  new URLSearchParams({ view: 'cm', fs: '1', to, su: subject, body }).toString();

/** Redacta el correo según el reporte sea de un objeto encontrado o perdido. */
export function buildContactEmail(contact: ContactInfo, senderName: string) {
  const subject = `Lost & Found UdeA: «${contact.title}»`;
  const sender = senderName || '';

  const body = isFoundStatus(contact.status)
    ? [
        `Hola ${contact.name},`,
        '',
        `Vi tu publicación del objeto encontrado «${contact.title}» en Lost & Found UdeA y creo que es mío.`,
        ...(contact.hasPrivateDetail
          ? [
              '',
              'Para que puedas verificarlo, te cuento una característica que no aparece en la publicación: [describe aquí una característica del objeto: marcas, daños, contenido...]',
            ]
          : []),
        '',
        'Quedo atento para coordinar la entrega.',
        '',
        'Gracias,',
        sender,
      ].join('\n')
    : [
        `Hola ${contact.name},`,
        '',
        `Vi tu publicación del objeto perdido «${contact.title}» en Lost & Found UdeA y creo que lo encontré. [Cuéntale dónde y cuándo lo encontraste.]`,
        '',
        'Para confirmar que es tuyo, ¿podrías describirme una característica que no aparezca en la publicación?',
        '',
        'Gracias,',
        sender,
      ].join('\n');

  return { to: contact.email, subject, body };
}

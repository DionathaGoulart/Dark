import { Translation } from '@/types'

/**
 * Traduções em inglês para a aplicação
 * Contém todo o conteúdo de texto organizado por funcionalidade e contexto
 */
export const enTranslations: Translation = {
  // ================================
  // Rótulos de Navegação
  // ================================
  nav: {
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    contact: 'Contact',
    prints: 'Stores'
  },

  // ================================
  // Conteúdo das Páginas
  // ================================
  pages: {
    // Conteúdo da página inicial
    home: {
      title: 'Home'
    },

    // Conteúdo da página sobre
    about: {
      title: 'About',
      description:
        'Dark is a self taught Brazilian illustrator, specialized in horror with strong influences from manga. Her work is known for its mastery of black and white technique, creating impactful, dense, and visually unsettling imagery.',
      content:
        'She offers exclusive, custom digital illustrations aimed at the alternative fashion market, creating striking designs for products such as t-shirts, collectible stickers, tote bags, and accessories.'
    },

    // Conteúdo da página de projetos
    projects: {
      title: 'Projects',
      description:
        'Explore some of our most recent work. Each image represents a unique and inspiring project.'
    },

    // Conteúdo da página de contato
    contact: {
      title: 'Contact',
      subtitle:
        'For commissions, inquiries, or collaborations, feel free to reach out!',

      // Seção de informações de contato
      info: {
        description:
          'Get in touch via the email below or send a message through the form!'
      },

      // Rótulos e mensagens do formulário de contato
      form: {
        // Rótulos dos campos do formulário
        name: 'Name',
        email: 'Email',
        message: 'Message',

        // Ações do formulário
        send: 'Send Message',
        sending: 'Sending...',
        sendAnother: 'Send another message',

        // Placeholders
        namePlaceholder: 'Your name',
        emailPlaceholder: 'your@email.com',
        messagePlaceholder: 'Your message...',

        // Mensagens de sucesso
        successTitle: 'Message sent successfully!',
        successMessage: 'Thank you for contacting us. We will respond soon.',

        // Mensagens de erro
        errorMessage: 'Error sending message. Please try again.'
      }
    },

    // Conteúdo da página de prints
    prints: {
      title: 'Stores',
      links: {
        redbubble: 'Clothing, stickers and more (Redbubble)',
        inprnt: 'Prints (INPRNT)',
        displate: 'My exclusive posters on Displate 🤍',
        portfolio: 'Portfolio',
        donate: 'Donate (づ⁠ ᴗ _ᴗ)づ⁠☕'
      }
    }
  },

  // ================================
  // Conteúdo do Rodapé
  // ================================
  footer: {
    rights: '© 2025 All rights reserved.',
    language: 'Language'
  },

  // ================================
  // Texto Comum da UI
  // ================================
  common: {
    loading: 'Loading...',
    error: 'Error loading',
    noImages: 'No images found'
  }
}

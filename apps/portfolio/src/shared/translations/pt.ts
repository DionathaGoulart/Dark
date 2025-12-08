import { Translation } from '@/types'

/**
 * Traduções em português para a aplicação
 * Contém todo o conteúdo de texto organizado por funcionalidade e contexto
 */
export const ptTranslations: Translation = {
  // ================================
  // Rótulos de Navegação
  // ================================
  nav: {
    home: 'Início',
    about: 'Sobre',
    projects: 'Projetos',
    contact: 'Contato',
    prints: 'Lojas'
  },

  // ================================
  // Conteúdo das Páginas
  // ================================
  pages: {
    // Conteúdo da página inicial
    home: {
      title: 'Início'
    },

    // Conteúdo da página sobre
    about: {
      title: 'Sobre',
      description:
        'Dark é uma ilustradora brasileira autodidata, especializada em horror com fortes influências do mangá. Seu trabalho é conhecido pela maestria da técnica preto e branco, criando imagens impactantes, densas e visualmente perturbadoras.',
      content:
        'Ela oferece ilustrações digitais exclusivas e personalizadas voltadas para o mercado de moda alternativa, criando designs marcantes para produtos como camisetas, adesivos colecionáveis, ecobags e acessórios.'
    },

    // Conteúdo da página de projetos
    projects: {
      title: 'Projetos',
      description:
        'Explore alguns dos nossos trabalhos mais recentes. Cada imagem representa um projeto único e inspirador.'
    },

    // Conteúdo da página de contato
    contact: {
      title: 'Contato',
      subtitle:
        'Para encomendas, dúvidas ou colaborações, sinta-se à vontade para entrar em contato!',

      // Seção de informações de contato
      info: {
        description:
          'Entre em contato pelo e-mail abaixo ou envie uma mensagem pelo formulário!'
      },

      // Rótulos e mensagens do formulário de contato
      form: {
        // Rótulos dos campos do formulário
        name: 'Nome',
        email: 'Email',
        message: 'Mensagem',

        // Ações do formulário
        send: 'Enviar Mensagem',
        sending: 'Enviando...',
        sendAnother: 'Enviar outra mensagem',

        // Placeholders
        namePlaceholder: 'Seu nome',
        emailPlaceholder: 'seu@email.com',
        messagePlaceholder: 'Sua mensagem...',

        // Mensagens de sucesso
        successTitle: 'Mensagem enviada com sucesso!',
        successMessage:
          'Obrigado por entrar em contato. Responderemos em breve.',

        // Mensagens de erro
        errorMessage: 'Erro ao enviar mensagem. Tente novamente.'
      }
    },

    // Conteúdo da página de prints
    prints: {
      title: 'Lojas',
      links: {
        redbubble: 'Roupas, adesivos e mais (Redbubble)',
        inprnt: 'Prints (INPRNT)',
        displate: 'Meus pôsteres exclusivos no Displate 🤍',
        portfolio: 'Portfólio',
        donate: 'Apoie meu trabalho (づ⁠ ᴗ _ᴗ)づ⁠☕'
      }
    }
  },

  // ================================
  // Conteúdo do Rodapé
  // ================================
  footer: {
    rights: '© 2025 Todos os direitos reservados.',
    language: 'Idioma'
  },

  // ================================
  // Texto Comum da UI
  // ================================
  common: {
    loading: 'Carregando...',
    error: 'Erro ao carregar',
    noImages: 'Nenhuma imagem encontrada'
  }
}

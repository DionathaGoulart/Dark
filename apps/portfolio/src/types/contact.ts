// ================================
// CONTACT FORM TYPES
// ================================

/**
 * Contact form data structure
 */
export interface FormData {
  name: string
  email: string
  message: string
}

/**
 * Alias for backward compatibility
 */
export type ContactFormData = FormData

/**
 * Contact form validation errors
 */
export interface ContactFormErrors {
  name?: string
  email?: string
  message?: string
  general?: string
}

/**
 * Contact form submission state
 */
export interface ContactFormState {
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  errors: ContactFormErrors
}

/**
 * Contact form props
 */
export interface ContactFormProps {
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

/**
 * Contact page props
 */
export interface ContactPageProps {
  className?: string
}

/**
 * EmailJS configuration
 */
export interface EmailJSConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

/**
 * Contact info component props
 */
export interface ContactInfoProps {
  description: string
}

/**
 * Success message component props
 */
export interface SuccessMessageProps {
  title: string
  message: string
  buttonText: string
  onSendAnother: () => void
}

/**
 * Form field component props
 */
export interface FormFieldProps {
  label: string
  name: string
  type: 'text' | 'email' | 'textarea'
  value: string
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

/**
 * Contact form component props
 */
export interface ContactFormComponentProps {
  formData: FormData
  isSubmitting: boolean
  submitStatus: SubmitStatus
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onResetForm: () => void
  translations: {
    name: string
    email: string
    message: string
    send: string
    sending: string
    namePlaceholder: string
    emailPlaceholder: string
    messagePlaceholder: string
    successTitle: string
    successMessage: string
    sendAnother: string
    errorMessage: string
  }
}

/**
 * Form submission status
 */
export type SubmitStatus = 'idle' | 'success' | 'error'

'use client'

import React, { useState, useEffect } from 'react'

import { trackEvent } from '@/features/analytics'
import { useDocumentTitle } from '@/shared'
import { useI18n } from '@/core/providers'
import {
  FormData,
  EmailJSConfig,
  ContactPageProps,
  ContactInfoProps,
  SuccessMessageProps,
  FormFieldProps,
  ContactFormComponentProps,
  SubmitStatus
} from '@/types'

// ================================
// CONSTANTS
// ================================

const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send'
const CONTACT_EMAIL = 'darkning.arts@gmail.com'

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  message: ''
}

const FORM_INPUT_CLASSES = [
  'w-full px-4 py-3 border border-primary-black dark:border-primary-white',
  'bg-transparent text-primary-black dark:text-primary-white',
  'placeholder-primary-black/40 dark:placeholder-primary-white/40',
  'focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white',
  'focus:ring-offset-2 focus:ring-offset-primary-white dark:focus:ring-offset-primary-black',
  'transition-all duration-300'
].join(' ')

const SUBMIT_BUTTON_CLASSES = [
  'w-full py-3 px-6 border-2 border-primary-black dark:border-primary-white',
  'bg-transparent text-primary-black dark:text-primary-white font-medium',
  'hover:bg-primary-black hover:text-primary-white',
  'dark:hover:bg-primary-white dark:hover:text-primary-black',
  'transition-all duration-300 focus:outline-none',
  'focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white',
  'focus:ring-offset-2 focus:ring-offset-primary-white dark:focus:ring-offset-primary-black',
  'disabled:opacity-50 disabled:cursor-not-allowed'
].join(' ')

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Gets EmailJS configuration from environment variables
 */
const getEmailJSConfig = (): EmailJSConfig => {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    console.error('EmailJS environment variables not configured:', {
      serviceId: !!serviceId,
      templateId: !!templateId,
      publicKey: !!publicKey
    })
    throw new Error('EmailJS configuration not found')
  }

  return { serviceId, templateId, publicKey }
}

/**
 * Sends email using EmailJS API
 */
const sendEmail = async (formData: FormData): Promise<void> => {
  const config = getEmailJSConfig()

  const response = await fetch(EMAILJS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: config.templateId,
      user_id: config.publicKey,
      template_params: {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_email: CONTACT_EMAIL
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('EmailJS API error:', response.status, errorData)
    throw new Error(`Failed to send email: ${response.status} - ${errorData}`)
  }
}

// ================================
// SUB COMPONENTS
// ================================

/**
 * Contact information section
 */
const ContactInfo: React.FC<ContactInfoProps> = ({ description }) => (
  <div className="border-l-2 border-primary-black dark:border-primary-white pl-6">
    <p className="text-primary-black/60 dark:text-primary-white/60 leading-relaxed mb-8">
      {description}
    </p>

    <div className="space-y-4">
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="w-2 h-2 bg-primary-black dark:bg-primary-white" />
        <span className="text-primary-black dark:text-primary-white font-medium">
          {CONTACT_EMAIL}
        </span>
      </a>
    </div>
  </div>
)

/**
 * Success message component
 */
const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  message,
  buttonText,
  onSendAnother
}) => (
  <div className="text-center py-12">
    <div className="mb-6">
      <div className="w-16 h-16 mx-auto mb-4 border-2 border-green-500 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h4 className="text-xl font-medium text-primary-black dark:text-primary-white mb-2">
        {title}
      </h4>
      <p className="text-primary-black/60 dark:text-primary-white/60 mb-6">
        {message}
      </p>
      <button
        onClick={onSendAnother}
        className="inline-flex items-center px-4 py-2 border border-primary-black dark:border-primary-white bg-transparent text-primary-black dark:text-primary-white text-sm font-medium hover:bg-primary-black hover:text-primary-white dark:hover:bg-primary-white dark:hover:text-primary-black transition-all duration-300"
      >
        {buttonText}
      </button>
    </div>
  </div>
)

/**
 * Form input field component
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  value,
  placeholder,
  onChange
}) => (
  <div>
    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required
        rows={5}
        className={`${FORM_INPUT_CLASSES} resize-none`}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className={FORM_INPUT_CLASSES}
        placeholder={placeholder}
      />
    )}
  </div>
)

/**
 * Contact form component
 */
const ContactForm: React.FC<ContactFormComponentProps> = ({
  formData,
  isSubmitting,
  submitStatus,
  onInputChange,
  onSubmit,
  onResetForm,
  translations
}) => {
  if (submitStatus === 'success') {
    return (
      <SuccessMessage
        title={translations.successTitle || 'Message sent successfully!'}
        message={
          translations.successMessage ||
          'Thank you for contacting us. We will respond soon.'
        }
        buttonText={translations.sendAnother || 'Send another message'}
        onSendAnother={onResetForm}
      />
    )
  }

  return (
    <>
      {submitStatus === 'error' && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
          {translations.errorMessage ||
            'Error sending message. Please try again.'}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          label={translations.name}
          name="name"
          type="text"
          value={formData.name}
          placeholder={translations.namePlaceholder}
          onChange={onInputChange}
        />

        <FormField
          label={translations.email}
          name="email"
          type="email"
          value={formData.email}
          placeholder={translations.emailPlaceholder}
          onChange={onInputChange}
        />

        <FormField
          label={translations.message}
          name="message"
          type="textarea"
          value={formData.message}
          placeholder={translations.messagePlaceholder}
          onChange={onInputChange}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={SUBMIT_BUTTON_CLASSES}
        >
          {isSubmitting
            ? translations.sending || 'Sending...'
            : translations.send}
        </button>
      </form>
    </>
  )
}

/**
 * Decorative divider component
 */
const DecorativeDivider: React.FC = () => (
  <div className="mt-16 w-32 h-0.5 bg-primary-black dark:bg-primary-white mx-auto" />
)

// ================================
// HOOKS
// ================================

/**
 * Custom hook to handle form state and submission
 */
const useContactForm = (t: any) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    trackEvent({
      event_name: 'form_field_interaction',
      event_parameters: {
        field_name: name,
        field_length: value.length,
        form_type: 'contact',
        interaction_type: 'input'
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    trackEvent({
      event_name: 'form_submit_attempt',
      event_parameters: {
        form_type: 'contact',
        message_length: formData.message.length,
        has_name: !!formData.name,
        has_email: !!formData.email,
        has_message: !!formData.message
      }
    })

    try {
      await sendEmail(formData)
      setSubmitStatus('success')
      setFormData(INITIAL_FORM_DATA)

      trackEvent({
        event_name: 'form_submit_success',
        event_parameters: {
          form_type: 'contact',
          message_length: formData.message.length
        }
      })
    } catch (error) {
      console.error('Error sending email:', error)
      setSubmitStatus('error')

      trackEvent({
        event_name: 'form_submit_error',
        event_parameters: {
          form_type: 'contact',
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
          error_type: 'email_send_failure'
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setSubmitStatus('idle')
    setFormData(INITIAL_FORM_DATA)

    trackEvent({
      event_name: 'form_reset',
      event_parameters: {
        form_type: 'contact',
        reset_trigger: 'send_another_button'
      }
    })
  }

  return {
    formData,
    isSubmitting,
    submitStatus,
    handleInputChange,
    handleSubmit,
    handleResetForm
  }
}

// ================================
// MAIN COMPONENT
// ================================

/**
 * Contact page with form functionality using EmailJS
 * Features contact information and message sending capabilities
 */
export const ContactPage: React.FC<ContactPageProps> = ({ className = '' }) => {
  const { t } = useI18n()
  const {
    formData,
    isSubmitting,
    submitStatus,
    handleInputChange,
    handleSubmit,
    handleResetForm
  } = useContactForm(t)

  useDocumentTitle('contact')

  // ================================
  // COMPUTED VALUES
  // ================================

  const containerClasses = [
    'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12',
    className
  ]
    .filter(Boolean)
    .join(' ')

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    trackEvent({
      event_name: 'page_view_contact',
      event_parameters: {
        page_title: 'Contact - Portfolio',
        content_type: 'contact_form'
      }
    })
  }, [])

  // ================================
  // RENDER
  // ================================

  return (
    <div className={containerClasses}>
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold text-primary-black dark:text-primary-white mb-8 tracking-tight">
          {t.pages.contact.title}
        </h1>

        <div className="grid gap-8 md:gap-12 lg:grid-cols-2">
          <ContactInfo description={t.pages.contact.info.description} />

          <div className="border border-primary-black dark:border-primary-white p-8">
            <h3 className="text-xl font-medium text-primary-black dark:text-primary-white mb-6">
              {t.pages.contact.form.send}
            </h3>

            <ContactForm
              formData={formData}
              isSubmitting={isSubmitting}
              submitStatus={submitStatus}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onResetForm={handleResetForm}
              translations={t.pages.contact.form}
            />
          </div>
        </div>

        <DecorativeDivider />
      </div>
    </div>
  )
}

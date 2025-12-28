// Analytics tracking utilities

export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Predefined tracking events for common actions
export const analytics = {
  // CTA Button Clicks
  clickBookInterview: (location: string) =>
    trackEvent({
      action: 'click_book_interview',
      category: 'engagement',
      label: location,
    }),

  clickGetStarted: (packageName: string) =>
    trackEvent({
      action: 'click_get_started',
      category: 'engagement',
      label: packageName,
    }),

  // Form Events
  submitEmailSignup: () =>
    trackEvent({
      action: 'submit_email_signup',
      category: 'conversion',
    }),

  startCheckout: (packageName: string, price: number) =>
    trackEvent({
      action: 'begin_checkout',
      category: 'conversion',
      label: packageName,
      value: price,
    }),

  // Navigation
  clickNavLink: (destination: string) =>
    trackEvent({
      action: 'click_nav_link',
      category: 'navigation',
      label: destination,
    }),

  // Theme Selection
  selectTheme: (themeName: string) =>
    trackEvent({
      action: 'select_interview_theme',
      category: 'engagement',
      label: themeName,
    }),

  // Package Selection
  selectPackage: (packageName: string, price: number) =>
    trackEvent({
      action: 'select_package',
      category: 'engagement',
      label: packageName,
      value: price,
    }),

  // Checkout Flow Tracking
  trackFieldCompletion: (fieldName: string, isFilled: boolean, step: number, timeOnPage: number) =>
    trackEvent({
      action: 'checkout_field_completed',
      category: 'checkout',
      label: `${fieldName}_${isFilled ? 'filled' : 'empty'}_step${step}`,
      value: Math.round(timeOnPage / 1000), // Convert to seconds
    }),

  viewCheckoutStep: (stepNumber: number, packageSelected: string, mediumSelected: string, timeOnStep: number) =>
    trackEvent({
      action: 'checkout_step_viewed',
      category: 'checkout',
      label: `step_${stepNumber}_${packageSelected}_${mediumSelected}`,
      value: Math.round(timeOnStep / 1000), // Convert to seconds
    }),

  completeCheckout: (themeSelected: string, questionCount: number, packageName: string, packagePrice: number, medium: string, totalTime: number) =>
    trackEvent({
      action: 'checkout_completed',
      category: 'checkout',
      label: `${packageName}_${themeSelected}_${medium}_${questionCount}q`,
      value: packagePrice,
    }),
}

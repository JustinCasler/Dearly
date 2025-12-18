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

  completeCheckout: (packageName: string, price: number) =>
    trackEvent({
      action: 'purchase',
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
}

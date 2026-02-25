export const SITE_TITLE = 'Weight Loss Knox';
export const SITE_DESCRIPTION =
  'Medical weight loss and med spa clinic in Knoxville, TN specializing in semaglutide, tirzepatide, Botox, fillers, laser treatments, and more. Physician-supervised programs with proven results.';
export const SITE_URL = 'https://weightlossknoxville.com';
export const EMAIL = 'info@weightlossknoxville.com';

// Primary phone number (Bearden / main location)
export const PHONE = '(865) 500-3135';

export const LOCATIONS = {
  bearden: {
    name: 'Bearden',
    phone: '(865) 500-3135',
    street: '5113 Kingston Pike',
    suite: 'Suite 15C',
    inside: 'Inside Salon Privé Suites',
    city: 'Knoxville',
    state: 'TN',
    zip: '37919',
  },
  farragut: {
    name: 'Farragut',
    phone: '(865) 500-3510',
    street: '102 S Campbell Station Rd',
    suite: 'Suite 8C',
    inside: 'Inside Saah Salon Suites',
    city: 'Knoxville',
    state: 'TN',
    zip: '37934',
  },
};

// Keep ADDRESS for backward compatibility — points to main (Bearden) location
export const ADDRESS = {
  street: LOCATIONS.bearden.street,
  suite: LOCATIONS.bearden.suite,
  city: LOCATIONS.bearden.city,
  state: LOCATIONS.bearden.state,
  zip: LOCATIONS.bearden.zip,
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services/', label: 'Services' },
  { href: '/tirzepatide/', label: 'Tirzepatide' },
  { href: '/semaglutide/', label: 'Semaglutide' },
  { href: '/about/', label: 'About' },
  { href: '/blog/', label: 'Blog' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/contact/', label: 'Contact' },
];

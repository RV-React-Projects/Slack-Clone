export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'rks',
  client: 'rks',
  description: 'Ranvijay Singh Portfolio',
  navItems: [
    // { id: '#', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    // { id: 'testimonials', label: 'Testimonials' },
    { id: 'FAQ', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ],
  navMenuItems: [{ label: 'Profile', href: '/profile' }],
  links: {
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    docs: 'https://heroui.com',
    discord: 'https://discord.gg',
  },
};

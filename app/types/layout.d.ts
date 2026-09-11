export type BreadcrumbItem = {
  title: string // Display text
  href?: string // URL or Vue Router link
  disabled?: boolean // Mark as disabled (optional)
};

export type MenuItem = {
  title: string
  icon: string
  path: string
  external?: boolean
  active?: boolean
};

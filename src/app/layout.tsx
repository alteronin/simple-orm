import './globals.css'

export const metadata = {
  title: 'simple-orm',
  description: 'Minimal Salesforce-lite CRUD',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}

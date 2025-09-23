export const metadata = {
  title: 'Recycling API',
  description: 'AI-powered recycling identification API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
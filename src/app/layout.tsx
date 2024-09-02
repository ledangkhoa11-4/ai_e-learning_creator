import { cn } from '@/lib/utils';
import './globals.css'
import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'
import Navbar from '@/components/Navbar';
import { Provider } from '@/components/Providers';
import { Toaster } from '@/components/ui/toaster';

const lexend = Lexend({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Course Generation',
  
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(
        lexend.className,'antialised min-h-screen pt-16'
      )} style={{paddingTop: "4rem !important"}}>
        <Provider>
          
        
        <Navbar/>
        {children}
        <Toaster/>
        </Provider>
      </body>
    </html>
  )
}

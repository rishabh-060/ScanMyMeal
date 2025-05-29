import Link from 'next/link'
import React from 'react'
import {
  FaGithub,
  FaTelegram,
  FaSquareInstagram,
  FaLinkedinIn
} from 'react-icons/fa6'
import { motion } from 'framer-motion'

const socialLinks = [
  { href: 'https://github.com/rishabh-060', icon: <FaGithub />, label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/rishabh-verma-277530223/', icon: <FaLinkedinIn />, label: 'LinkedIn' },
  { href: 'https://t.me/rishabh_060', icon: <FaTelegram />, label: 'Telegram' },
  { href: 'https://instagram.com/_rishabh_60', icon: <FaSquareInstagram />, label: 'Instagram' },
]

const Footer = () => {
  return (
    <footer className='bg-gray-100 text-gray-700 mt-3'>
      <div className='max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* About Section */}
        <div>
          <h2 className='text-xl font-bold text-amber-500 mb-4'>About the Author</h2>
          <p className='text-sm leading-relaxed text-gray-600 w-full max-w-[75%]'>
            Passionate developer crafting web experiences with modern technologies. Let’s connect and collaborate!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className='text-xl font-bold text-amber-500 mb-4'>Connect With Me</h2>
          <div className='flex items-center gap-4'>
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className='group relative p-2 rounded-full bg-white shadow hover:shadow-md transition'
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {React.cloneElement(link.icon, {
                  size: 24,
                  className:
                    'text-gray-700 group-hover:text-amber-500 transition-colors duration-300'
                })}
                <span className='absolute opacity-0 group-hover:opacity-100 transition bg-gray-900 text-amber-300 text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap'>
                  {link.label}
                </span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className='text-xl font-bold text-amber-500 mb-4'>Contact Info</h2>
          <p className='text-sm'>
            Email:{' '}
            <Link href='mailto:verma.rishabh924@gmail.com' className='text-amber-500 hover:underline'>
              verma.rishabh924@gmail.com
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className='border-t border-gray-300 text-center py-4 text-xs text-gray-500'>
        <p>
          © 2025 All rights reserved. Made with <span className='text-amber-500'>❤️</span> by{' '}
          <Link
            href='https://rishabh-060.netlify.app'
            target='_blank'
            className='text-amber-500 hover:underline font-medium'
          >
            @rishabh_verma
          </Link>
        </p>
      </div>
    </footer>
  )
}

export default Footer

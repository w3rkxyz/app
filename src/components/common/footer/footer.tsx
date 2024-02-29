import Image from 'next/image'
import React from 'react'

const Footer = () => {
  return (
    <footer className='footer-section pb-[70px] sm:pb-[30px] pt-[70px] sm:pt-0'>
      <div className="custom-container">
        <div className="footer-wrapper flex items-center">
            <p className="foot-copyright-text ml-auto sm:ml-0 font-primary font-semibold text-[12px] text-dark-gray">2024 w3rk. All Rights Reserved.</p>
            <ul className="socials-widgets ml-auto flex items-center gap-[17px] sm:gap-[11px]">
                <li className="socials-widgets-item">
                  <a href="/"><Image src="/images/twitter-fo.svg" alt="socials icons image" className='w-[33px] sm:w-5 h-[33px] sm:h-5' width={33} height={33} /></a>
                </li>
                <li className="socials-widgets-item">
                  <a href="/"><Image src="/images/discord-fo.svg" alt="socials icons image" className='w-[33px] sm:w-5 h-[33px] sm:h-5' width={33} height={33} /></a>
                </li>
                <li className="socials-widgets-item">
                  <a href="/"><Image src="/images/instagrame-fo.svg" alt="socials icons image" className='w-[33px] sm:w-5 h-[33px] sm:h-5' width={33} height={33} /></a>
                </li>
            </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer

import Image from 'next/image'
import React from 'react'

const CtaSection = () => {
  return (
    <div className='cta-section pt-[110px] sm:pt-10 sm:pb-10 pb-[200px]'>
      <div className="custom-container">
        <div className="section-title-box text-center mb-10">
          <h2 className="section-title text-center  sm:text-[24px]"><span className='text-primary'>Connect</span>  with us!</h2>
        </div>
        <div className="cta-wrapper">
             <div className="cta-content-box py-[64px] px-[75px] sm:py-8 sm:px-10 rounded-[30px] bg-white-gray max-w-[643px] mx-auto">
                <p className='text-[18px] sm:text-[16px] text-center font-primary font-semibold leading-[1.3] text-dark mb-5'>Collaborate with us at w3rk to unlock exciting possibilities in the Web 3.0 space.</p>
                <p className='text-[18px] sm:text-[16px] text-center font-primary font-semibold leading-[1.3] text-dark'>Let’s redefine how work gets done in the decentralized era!</p>
                <ul className="socials-widgets mt-16 flex items-center gap-9 sm:gap-[18px] justify-center">
                    <li className="socials-widgets-items"><a href="/"><Image className='w-[50px] sm:w-[30px] h-[50px] sm:h-[30px]' src="/images/socials-icon-1.svg" alt="socials icons images" width={50} height={50} /></a></li>
                    <li className="socials-widgets-items"><a href="/"><Image className='w-[50px] sm:w-[30px] h-[50px] sm:h-[30px]' src="/images/socials-icon-2.svg" alt="socials icons images" width={50} height={50} /></a></li>
                    <li className="socials-widgets-items"><a href="/"><Image className='w-[50px] sm:w-[30px] h-[50px] sm:h-[30px]' src="/images/socials-icon-3.svg" alt="socials icons images" width={50} height={50} /></a></li>
                </ul>
             </div>
        </div>
      </div>
    </div>
  )
}

export default CtaSection

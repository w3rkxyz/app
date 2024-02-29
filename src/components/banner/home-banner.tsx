import Image from 'next/image'
import React from 'react'

const HomeBanner = () => {
  return (
    <div className='banner-section pt-[268px] sm:pt-[194px] pb-[235px] sm:pb-[300px] overflow-hidden'>
        <div className="custom-container">
            <div className="banner-wrapper max-w-[1156px] mx-auto relative">
                <div className="banner-modal banner-modal-top">
                  <Image className='modal-item-2 absolute left-[139px] top-[-110px] sm:top-[-73px] sm:left-[24px] sm:w-[57px] sm:h-[57px]' src="/images/banner-modal-2.png" alt="banner modal image items" width={96} height={96} />
                  <Image className='modal-item-3 absolute right-0 sm:top-[-96px] sm:right-0 sm:w-[80px] sm:h-[80px] sm:object-contain' src="/images/banner-modal-3.png" alt="banner modal image items" width={132} height={132} />
                </div>
                <div className="banner-cont-box text-center">
                    <h1 className="banner-title max-w-[705px] mx-auto mb-[31px] sm:mb-4">The <span className='text-primary'>Web 3.0 </span>  <br />
                      Freelancing Marketplace</h1>
                     <p className="banner-desc max-w-[570px] sm:mb-6 mx-auto mb-[44px] text-[18px] text-center font-semibold sm:font-normal sm:text-[14px] font-secondary tracking--.01em] leading-[24px] sm:leading-[19.5px]">At w3rk we are on a mission to to reshape the freelancing and hiring landscape for the Web 3.0 world, proudly bridging global businesses with exceptional Web 3.0 professionals who embrace cryptocurrency payments.</p>
                     <button type="button" className='button-primary'>Connect Wallet</button>
                </div>
                <div className="banner-modal banner-modal-bottom">
                  <Image className='modal-item-4 absolute right-0 bottom-[-141px] sm:bottom-[-182px] sm:right-[-20px] sm:w-[158px] sm:h-[158px] sm:object-contain' src="/images/banner-modal-4.png" alt="banner modal image items" width={264} height={264} />
                  <Image className='modal-item-5 absolute left-[100px] bottom-[-161px] sm:bottom-[-245px] sm:w-[117px] sm:h-[117px] sm:object-contain sm:left-[55px]' src="/images/banner-modal-5.png" alt="banner modal image items" width={196} height={196} />
                  <Image className='modal-item-1 absolute left-[-75px] bottom-[133px] sm:bottom-[-113px] sm:left-0 sm:w-[98px] sm:h-[98px]' src="/images/banner-modal-1.png" alt="banner modal image items" width={164} height={164} />
                </div>
            </div>
        </div>
    </div>
  )
}

export default HomeBanner

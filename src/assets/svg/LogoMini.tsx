import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  const { width = 40, height = 40, className, ...rest } = props;
  
  return (
    <svg 
      viewBox="0 0 60 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="blueGradientMini" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A90E2" />
          <stop offset="100%" stopColor="#1E3A5F" />
        </linearGradient>
      </defs>
      
      {/* Mavi gradient daire */}
      <circle cx="30" cy="30" r="28" fill="url(#blueGradientMini)" />
      
      {/* ahi metni - beyaz */}
      <text 
        x="30" 
        y="38" 
        fontSize="20" 
        fontWeight="700" 
        fill="#FFFFFF" 
        textAnchor="middle" 
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        ahi
      </text>
    </svg>
  )
}

export default Logo

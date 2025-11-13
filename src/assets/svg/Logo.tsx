import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  const { width = 140, height = 40, className, ...rest } = props;
  const isDark = props.fill === '#FFFFFF' || props.fill === '#fff' || props.fill === 'white';
  
  return (
    <svg 
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A90E2" />
          <stop offset="100%" stopColor="#1E3A5F" />
        </linearGradient>
      </defs>
      
      {/* Mavi gradient daire */}
      <circle cx="30" cy="30" r="28" fill="url(#blueGradient)" />
      
      {/* ahi metni - beyaz */}
      <text 
        x="30" 
        y="38" 
        fontSize="24" 
        fontWeight="700" 
        fill="#FFFFFF" 
        textAnchor="middle" 
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        ahi
      </text>
      
      {/* Kurumsal metni - siyah veya beyaz (dark mode'a göre) */}
      <text 
        x="75" 
        y="38" 
        fontSize="24" 
        fontWeight="700" 
        fill={isDark ? "#FFFFFF" : "#000000"} 
        textAnchor="start" 
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        Kurumsal
      </text>
    </svg>
  )
}

export default Logo

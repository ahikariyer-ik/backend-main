import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  const color = props.fill || '#1e3a5f';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '32px', height: '32px', flexShrink: 0 }}
      >
        <path d="M3 21H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 21V7L13 3V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 21V11L13 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9V9.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12V12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 15V15.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 18V18.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          color: color,
          lineHeight: 1.2,
          letterSpacing: '0.5px'
        }}>
          KURUM360.COM
        </span>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 400, 
          color: color,
          lineHeight: 1.2,
          opacity: 0.8
        }}>
          Dijital İnsan Kaynakları ve Kurum Yönetiminiz Bir Arada
        </span>
      </div>
    </div>
  )
}

export default Logo

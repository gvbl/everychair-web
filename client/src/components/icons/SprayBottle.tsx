import React, { SVGAttributes } from 'react'

interface SprayBottleProps extends SVGAttributes<SVGElement> {
  color?: string
  size?: string | number
}

const SprayBottle = ({ color, size, ...props }: SprayBottleProps) => {
  return (
    <svg
      width={size}
      height={size}
      fill={color}
      version="1.1"
      x="0px"
      y="0px"
      viewBox="0 0 32 32"
      enableBackground="new 0 0 32 32"
      {...props}
    >
      <path d="M17.705,7.82c0.796,0.772,1.163,1.968,1.328,2.788h5.203c0.354-2.981,2.449-3.282,2.546-3.294  c0.078-0.009,0.147-0.053,0.189-0.12c0.041-0.066,0.05-0.148,0.023-0.223c-0.905-2.522-2.823-4.028-5.13-4.028h-7.909v4.115h1.486  c0.072,0.604,0.093,1.862-0.66,3.195c-0.021,0.039-0.021,0.086,0.001,0.125c0.022,0.038,0.063,0.062,0.108,0.062  C14.969,10.44,16.623,10.402,17.705,7.82z"></path>
      <path d="M10.599,3.938v2.125c0,0.276,0.224,0.5,0.5,0.5h1.356V3.438h-1.356C10.823,3.438,10.599,3.662,10.599,3.938z"></path>
      <path d="M24.761,12.108h-5.597v4.304c0,0.534-0.617,1.048-1.33,1.643c-1.041,0.867-2.336,1.946-2.336,3.694v6.688  c0,0.851,0.693,1.544,1.544,1.544h10.481c0.851,0,1.544-0.693,1.544-1.544v-4.658C29.067,19.523,27.694,15.792,24.761,12.108z"></path>
      <circle cx="3.606" cy="2.693" r="0.673"></circle>
      <circle cx="3.606" cy="5.001" r="0.673"></circle>
      <circle cx="3.606" cy="7.309" r="0.673"></circle>
      <circle cx="5.849" cy="3.847" r="0.673"></circle>
      <circle cx="5.849" cy="6.154" r="0.673"></circle>
      <circle cx="8.092" cy="5.001" r="0.673"></circle>
    </svg>
  )
}

export default SprayBottle

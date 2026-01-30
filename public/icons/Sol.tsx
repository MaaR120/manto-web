import * as React from "react"
import { SVGProps } from "react";

const Sol = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor" 
    strokeWidth="1"
    {...props}
    {...props}
  >
    <circle cx={12} cy={12} r={3.5} stroke="#222" />
    <path
      strokeLinecap="round"
      d="M12 5V3M12 21v-2M16.95 7.05l1.414-1.414M5.636 18.364 7.05 16.95M19 12h2M3 12h2M16.95 16.95l1.414 1.414M5.636 5.636 7.05 7.05"
    />
  </svg>
)
export default Sol

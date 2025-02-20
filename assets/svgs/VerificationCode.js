import * as React from "react"
import Svg, { Path, Defs, Pattern, Use, Image } from "react-native-svg"
const VerificationCode = (props) => (
  <Svg
    width={204}
    height={178}
    fill="none"
    {...props}
  >
    <Path fill="url(#a)" d="M0 0h204v178H0z" />
    <Defs>
      <Pattern
        id="a"
        width={1}
        height={1}
        patternContentUnits="objectBoundingBox"
      >
        <Use xlinkHref="#b" transform="matrix(.00188 0 0 .00216 .015 .01)" />
      </Pattern>
      <Image
        id="b"
        width={518}
        height={456}
        preserveAspectRatio="none"
      />
    </Defs>
  </Svg>
)
export default VerificationCode

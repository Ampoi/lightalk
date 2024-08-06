import { pixelAmountX, pixelAmountY } from "../constant/settings";
const threshold = 140

export const getData = (tmpFrameStack: Record<"r"|"g"|"b", number>[][]) => {
  let data = ""
  for( let y = 0; y < pixelAmountY; y++ ){
    for( let x = 0; x < pixelAmountX; x++ ){
      let rSum = 0
      let gSum = 0
      let bSum = 0

      for( const frame of tmpFrameStack ){
        const { r,g,b } = frame[y * pixelAmountX + x]
        rSum += r
        gSum += g
        bSum += b
      }

      const aveR = rSum / tmpFrameStack.length
      const aveG = gSum / tmpFrameStack.length
      const aveB = bSum / tmpFrameStack.length

      data += Number(((aveR + aveG + aveB) / 3) > threshold)
    }
  }
  return data
}
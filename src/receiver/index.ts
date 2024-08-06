import p5 from "p5";
import { pixelAmountX, pixelAmountY } from "../constant/settings";
import { ref } from "vue";
import { StatusChecker } from "./status";

const defaultRect = {
  tl: { x: 50, y: 50 },
  tr: { x: 100, y: 50 },
  bl: { x: 50, y: 100 },
  br: { x: 100, y: 100 }
}
let rect: typeof defaultRect = localStorage.getItem("rect") ? JSON.parse(localStorage.getItem("rect")!) : defaultRect
export const setRectDefault = () => {
  rect = defaultRect
}

export const message = ref("")

const threshold = 140

onbeforeunload = () => {
  console.log("saving")
  localStorage.setItem("rect", JSON.stringify(rect))
}

const drawPoints = (p: p5, getColor: (x: number, y: number) => void) => {
  for(let y = 0; y < pixelAmountY; y++){
    for(let x = 0; x < pixelAmountX; x++){
      const topPosition = {
        x: (rect.tr.x - rect.tl.x) * (x + 1) / (pixelAmountX + 1) + rect.tl.x,
        y: (rect.tr.y - rect.tl.y) * (x + 1) / (pixelAmountX + 1) + rect.tl.y
      }
      const bottomPosition = {
        x: (rect.br.x - rect.bl.x) * (x + 1) / (pixelAmountX + 1) + rect.bl.x,
        y: (rect.br.y - rect.bl.y) * (x + 1) / (pixelAmountX + 1) + rect.bl.y
      }
      const position = {
        x: (bottomPosition.x - topPosition.x) * (y + 1) / (pixelAmountY + 1) + topPosition.x,
        y: (bottomPosition.y - topPosition.y) * (y + 1) / (pixelAmountY + 1) + topPosition.y
      }
      getColor(position.x, position.y)
      p.noStroke()
      p.fill("#f97316")
      p.circle(position.x, position.y, 10)
    }
  }
}
 
const drawRect = (p: p5): Record<keyof typeof defaultRect, "black"|"white"> => {
  const rectColors: Partial<Record<keyof typeof defaultRect, "black"|"white">> = {}

  for(const [key,{ x, y }] of Object.entries(rect)){
    const [r, g, b] = p.get(x, y);
    const color = (r + g + b) / 3 > threshold ? "white" : "black"
    p.strokeWeight(2)
    p.stroke("#f97316")
    p.fill(color)
    p.circle(x, y, 10)
    rectColors[key as keyof typeof rect] = color
    if( p.mouseIsPressed && p.dist(p.mouseX, p.mouseY, x, y) < 20 ){
      rect[key as keyof typeof rect] = { x: p.mouseX, y: p.mouseY }
    }
  }

  const { bl, br, tl, tr } = rectColors
  if( bl && br && tl && tr ){
    return { bl, br, tl, tr }
  }else{
    throw new Error("rectColors is not complete")
  }
}

const statusChecker = new StatusChecker((status, frameCount) => {
  console.log(status, frameCount)
})

export const getData = (tmpFrames: Record<"r"|"g"|"b", number>[][]) => {
  let data = ""
  for( let y = 0; y < pixelAmountY; y++ ){
    for( let x = 0; x < pixelAmountX; x++ ){
      let rSum = 0
      let gSum = 0
      let bSum = 0

      for( const frame of tmpFrames ){
        const { r,g,b } = frame[y * pixelAmountX + x]
        rSum += r
        gSum += g
        bSum += b
      }

      const aveR = rSum / tmpFrames.length
      const aveG = gSum / tmpFrames.length
      const aveB = bSum / tmpFrames.length

      data += Number(((aveR + aveG + aveB) / 3) > threshold)
    }
  }
  return data
}

export const receiver = (p: p5) => {
  let capture: p5.Element
  p.setup = () => {
    const height = 300
    p.createCanvas(height / 3 * 4, height)
    p.background(0)
    p.noStroke()

    capture = p.createCapture({
      video: true,
      audio: false
    })
    capture.hide()
  }

  let tmpFrames: Record<"r"|"g"|"b", number>[][] = []

  p.draw = () => {
    p.background(0)
    p.image(capture, 0, 0, p.width, p.height)

    if( statusChecker.status ){
      tmpFrames.push([])
    }
    drawPoints(p, (x, y) => {
      if( statusChecker.status ){
        const [r,g,b] = p.get(x, y)
        tmpFrames[tmpFrames.length - 1].push({r,g,b})
      }
    })

    const rectColors = drawRect(p)
    statusChecker.step(rectColors)
  }
}
import p5 from "p5";
import { pixelAmountX, pixelAmountY } from "../constant/settings";
import { computed, ref } from "vue";
import { StatusChecker } from "./status";
import { getData } from "./getData";

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

let tmpFrameStack: Record<"r"|"g"|"b", number>[][] = []
const receivingBinary = ref<string>()
export const receivingText = computed(() => {
  if( receivingBinary.value === undefined ) return undefined
  let text = ""
  for( let i = 0; i < receivingBinary.value.length; i += 16 ){
    const binary = receivingBinary.value.slice(i, i+16)
    if( binary == "1".repeat(16) ) break
    text += String.fromCharCode(parseInt(binary, 2))
  }
  return text
})

const statusChecker = new StatusChecker((status, frameCount) => {
  if( status == "receiving" ){
    const binary = getData(tmpFrameStack)
    console.log(`[DATA RECEIVED] ${binary}`)
    
    if( receivingBinary.value === undefined ) throw new Error("receivingBinary is undefined")
    receivingBinary.value += binary
    if(receivingBinary.value.endsWith("1".repeat(16))){
      console.log("[RECEIVING FINISHED]")
      statusChecker.cancelConnection("receiving finished")
    }
    
    tmpFrameStack = []
  }else{
    console.log(`[CONNECTION PROCESSING] status:${status} frameCount:${frameCount}`)
  }
}, (status) => {
  if( status == "idle" ){
    receivingBinary.value = undefined
  }else if( status == "receiving" ){
    receivingBinary.value = ""
  }
})

export const receiver = (p: p5) => {
  let capture: p5.Element
  p.setup = () => {
    const height = (p.windowHeight - 48) / 3
    p.background(0)
    p.noStroke()

    capture = p.createCapture({
      video: true,
      audio: false
    })
    capture.hide()
    p.createCanvas(height/2, height)
  }

  p.draw = () => {
    p.background(0)
    p.image(capture, 0, 0, capture.width * p.height / capture.height, p.height)

    if( statusChecker.status == "receiving" ) tmpFrameStack.push([])
    drawPoints(p, (x, y) => {
      if( statusChecker.status == "receiving" ){
        const [r,g,b] = p.get(x, y)
        tmpFrameStack[tmpFrameStack.length-1].push({r,g,b})
      }
    })

    const rectColors = drawRect(p)
    statusChecker.step(rectColors)
  }
}
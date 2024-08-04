import p5 from "p5"
import { divisionAmount, pixelAmountX, pixelAmountY, syncAmount } from "../constant/settings"

let senderIterator: Generator<string, string, unknown> | undefined = undefined
const chunkSize = pixelAmountX * pixelAmountY
const frameMillisecond = 300

export const sender = (p: p5) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth/3, p.windowHeight)
    p.background(0)
    p.noStroke()
    p.frameRate(1000/frameMillisecond)
  }

  function getBinary(){
    if( !senderIterator ) throw new Error("senderIterator is undefined")
    const {done, value} = senderIterator.next()
    if( done ){
      senderIterator = undefined
      previousBlack = true
      syncCount = 0
    }
    return value
  }

  let previousBlack = true
  let syncCount = 0

  p.draw = () => {
    p.background(0)
    const pixelHeight = p.height / (pixelAmountY + 2)
    const pixelWidth = p.width / (pixelAmountX + 2)
    
    const isSending = !!senderIterator

    if( isSending ){
      previousBlack = !previousBlack
      p.background(previousBlack ? 255 : 0)
      if( syncCount < syncAmount ){
        syncCount++
      }else{
        const binary = getBinary()
        for (let y = 0; y < pixelAmountY; y++) {
          for (let x = 0; x < pixelAmountX; x++) {
            binary[y * pixelAmountX + x] === "1" ? p.fill(255) : p.fill(0)
            p.rect((x+1) * pixelWidth, (y+1) * pixelHeight, pixelWidth, pixelHeight)
          }
        }
      }
    }else{
      for (let y = 0; y < pixelAmountY; y++) {
        for (let x = 0; x < pixelAmountX; x++) {
          const colorSteps = divisionAmount-1
          p.fill(x * (255 / colorSteps), (y % divisionAmount) * (255 / colorSteps), Math.floor(y / divisionAmount) * (255 / colorSteps))
          p.rect((x+1) * pixelWidth, (y+1) * pixelHeight, pixelWidth, pixelHeight)
        }
      }
    }
  }
}

export async function send(message: string){
  const charCodes: number[] = []
  for(const letter of message){
    charCodes.push(letter.charCodeAt(0))
  }
  let sendBinary = ""
  for(const charCode of charCodes){
    sendBinary += charCode.toString(2).padStart(16, "0")
  }
  console.log("sendBinary", sendBinary)
  senderIterator = createSenderIterator(sendBinary + "1".repeat(16))
}

function* createSenderIterator(sendBinary: string){
  let i = 0
  while(true){
    const tmpBinary = sendBinary.slice(i * chunkSize, (i + 1) * chunkSize)
    if(tmpBinary.length == chunkSize){
      i++
      yield tmpBinary
    }else{
      return tmpBinary.padEnd(chunkSize, "0")
    }
  }
}
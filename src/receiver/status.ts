type CornerColor = "white" | "black" | "gray"
type Status = "syncing" | "receiving" | "idle"

export class StatusChecker {
  private _status: Status = "idle";
  public get status(): Status {
    return this._status;
  }
  private set status(value: Status) {
    this._status = value;
    this.onStatusChange(value)
  }
  
  private static readonly maxFrameRepeatCount = 40
  private static readonly minFrameRepeatCount = 2
  private frameRepeatCount = 0

  private static readonly syncFrameStackCount = 10
  private frameStackCount = 0
  
  private lastCornerColor: CornerColor = "gray"
  
  constructor(
    private readonly onFrameChange: (status: Status, frameCount: number) => void,
    private readonly onStatusChange: (status: Status) => void
  ){}

  public cancelConnection(reason?: string){
    this.frameRepeatCount = 0
    this.frameStackCount = 0
    this.status = "idle"
    console.warn("[CONNECTION CANCELED] " + reason ?? "")
  }

  step( cornersColor: Record<"tl" | "tr" | "bl" | "br", "white" | "black"> ){
    const cornerColor = Object.values(cornersColor).every( color => color === "white" )
      ? "white"
      : Object.values(cornersColor).every( color => color === "black" )
        ? "black"
        : "gray";
    
    if( cornerColor === "gray" ){
      //グレー
      if( this.status != "idle" ) this.cancelConnection("cornerColor is gray")
    }else if( cornerColor == this.lastCornerColor ){
      //同じ色
      if( this.frameRepeatCount > StatusChecker.maxFrameRepeatCount ){
        this.cancelConnection("frameRepeatCount is over maxFrameRepeatCount")
      }else{
        this.frameRepeatCount++
      }
    }else{
      //違う色
      if( this.frameRepeatCount < StatusChecker.minFrameRepeatCount ){
        this.cancelConnection("frameRepeatCount is under minFrameRepeatCount")
      }else{
        this.onFrameChange(this.status, this.frameStackCount)
        if( this.frameStackCount == 0 ) this.status = "syncing"
        if( this.frameStackCount == StatusChecker.syncFrameStackCount - 1 ){
          if( this.status == "syncing" ){
            this.status = "receiving"
          }else if( this.status == "idle" ){
            throw new Error("this.status is idle")
          }
        }
        this.frameStackCount++
        this.frameRepeatCount = 0
      }
    }

    this.lastCornerColor = cornerColor
  }
}
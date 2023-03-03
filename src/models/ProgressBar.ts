import { Graphics } from 'pixi.js'
import { logFarmProgress } from '../logger'

export interface IProgressBarOptions {
  x: number
  y: number
  width: number
  height: number
  value: number
  minColor: number
  maxColor: number
}

export class ProgressBar extends Graphics {
  public borderWidth = 1
  public initX!: number
  public initY!: number
  public initWidth!: number
  public initHeight!: number
  public minColor!: number
  public maxColor!: number
  public minColorArray!: [number, number, number]
  public maxColorArray!: [number, number, number]
  constructor ({ x, y, width, height, value, minColor, maxColor }: IProgressBarOptions) {
    super()
    this.initX = x
    this.initY = y
    this.initWidth = width
    this.initHeight = height
    this.minColor = minColor
    this.minColorArray = this.numColorToArray(this.minColor)
    this.maxColor = maxColor
    this.maxColorArray = this.numColorToArray(this.maxColor)
    this.update(value)
  }

  toHex (num: number): string {
    let hex = num.toString(16)
    if (hex.length === 1) {
      hex = '0' + hex
    }
    return hex
  }

  numColorToArray (num: number): [number, number, number] {
    const numStr = num.toString(16).padStart(6, '0')
    const r = Number.parseInt(numStr[0] + numStr[1], 16) // rgb >> 16;
    const g = Number.parseInt(numStr[2] + numStr[3], 16) // (rgb >> 8) % 256;
    const b = Number.parseInt(numStr[4] + numStr[5], 16) // rgb % 256;

    return [r, g, b]
  }

  interpolateColors (p: number): string {
    const q = 1 - p
    const [r1, g1, b1] = this.maxColorArray
    const [r2, g2, b2] = this.minColorArray
    const rr = Math.round(r1 * p + r2 * q)
    const rg = Math.round(g1 * p + g2 * q)
    const rb = Math.round(b1 * p + b2 * q)

    // return Number((rr << 16) + (rg << 8) + rb).toString(16)
    return this.toHex(rr) + this.toHex(rg) + this.toHex(rb)
  }

  update (value: number): void {
    const { initX, initY, initWidth, initHeight, minColor, maxColor } = this
    if (value >= 1) {
      value = 1
    } else if (value <= 0) {
      value = 0
    }
    this.clear()
    if (minColor === maxColor) {
      this.beginFill(minColor)
    } else {
      const colorStr = this.interpolateColors(value)
      const color = Number.parseInt(colorStr, 16)
      this.beginFill(color)
    }

    logFarmProgress(`x=${initX} y=${initY} width=${initWidth} height=${initHeight}`)
    this.drawRect(initX, initY, Math.round(initWidth * value), initHeight)
    this.endFill()
  }
}

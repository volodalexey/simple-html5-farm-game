import { Graphics } from 'pixi.js'

export interface IStrokeRectOptions {
  x: number
  y: number
  width: number
  height: number
  strokeWidth?: number
  color: number
}

export class StrokeRect extends Graphics {
  constructor (options: IStrokeRectOptions) {
    super()
    this.setup(options)
  }

  setup ({ x, y, width, height, color, strokeWidth = 1 }: IStrokeRectOptions): void {
    this.clear()
    this.beginFill(color)
    this.drawRect(x, y, width, height)
    this.endFill()
    this.beginHole()
    this.drawRect(x + strokeWidth, y + strokeWidth, width - strokeWidth * 2, height - strokeWidth * 2)
    this.endHole()
  }
}

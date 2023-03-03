import { Container, Graphics } from 'pixi.js'
import { logFarmTile } from '../logger'

export interface ITileOptions {
  id: string
  x: number
  y: number
  width: number
  height: number
  isInteractive?: boolean
  isButtonMode?: boolean
  showSelected?: boolean
  showHover?: boolean
  onClick?: <T extends Tile>(tile: T) => void
}

export class Tile extends Container {
  static COLORS = {
    regular: 0xffffff,
    active: 0x0d21a1,
    hover: 0x515BA1
  }

  public id!: string
  public graphics!: Graphics
  public showSelected!: boolean
  public showHover!: boolean
  public posX!: number
  public posY!: number
  public cellWidth!: number
  public cellHeight!: number
  public isSelected = false
  public onClick?: <T extends Tile>(tile: T) => void
  buttonMode = true
  cursor = 'pointer'
  constructor ({
    id,
    x,
    y,
    width,
    height,
    isInteractive = true,
    isButtonMode = true,
    showSelected = true,
    showHover = true,
    onClick
  }: ITileOptions) {
    super()
    this.graphics = new Graphics()
    this.addChild(this.graphics)
    this.interactive = isInteractive
    this.buttonMode = isButtonMode
    this.id = id
    this.showSelected = showSelected
    this.showHover = showHover
    this.posX = x
    this.posY = y
    this.cellWidth = width
    this.cellHeight = height
    this.fillColor(Tile.COLORS.regular)

    this.on('mouseover', this.handleMouseOver)
    this.on('mouseout', this.handleMouseOut)
    this.onClick = onClick
    this.on('pointerdown', this.handleClick)
  }

  fillColor (color: typeof Tile.COLORS[keyof typeof Tile.COLORS]): void {
    this.graphics.clear()
    logFarmTile(color)
    this.graphics.beginFill(color)
    logFarmTile(this.posX, this.posY, this.cellWidth, this.cellHeight)
    this.graphics.drawRect(this.posX, this.posY, this.cellWidth, this.cellHeight)
    this.graphics.endFill()
  }

  select (): void {
    if (!this.isSelected) {
      this.isSelected = true
    }
    if (this.showSelected && this.isSelected) {
      this.fillColor(Tile.COLORS.active)
    }
  }

  deselect (): void {
    if (this.isSelected) {
      this.isSelected = false
    }
    if (this.showSelected && !this.isSelected) {
      this.fillColor(Tile.COLORS.regular)
    }
  }

  toggle (): void {
    if (this.isSelected) {
      this.deselect()
    } else {
      this.select()
    }
  }

  handleClick = (): void => {
    this.toggle()
    if (typeof this.onClick === 'function') {
      this.onClick(this)
    }
  }

  handleMouseOver = (): void => {
    if (this.showHover) {
      if (this.showSelected && this.isSelected) {
        // skip
      } else {
        this.fillColor(Tile.COLORS.hover)
      }
    }
  }

  handleMouseOut = (): void => {
    if (this.showHover) {
      if (this.showSelected && this.isSelected) {
        // skip
      } else {
        this.fillColor(Tile.COLORS.regular)
      }
    }
  }
}

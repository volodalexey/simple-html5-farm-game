import { Container, type Resource, type Texture } from 'pixi.js'
import { logFarmStatus } from './logger'
import { type Tile } from './models/Tile'
import { StatusBarTile } from './StatusBarTile'

export interface IStatusBarOptions {
  textures: {
    money: Texture
    corn: Texture
    egg: Texture
    milk: Texture
  }
  onTileClick?: (tile: StatusBarTile, shopBar: StatusBar) => void
}

export class StatusBar extends Container<StatusBarTile> {
  public widthCells = 4
  public heightCells = 1
  public cellWidth = 80
  public cellHeight = 40
  public onTileClick?: IStatusBarOptions['onTileClick']

  private readonly _initMoney = 100
  private readonly _initCorns = 0
  private readonly _initEggs = 0
  private readonly _initMilks = 0

  public eggCost = 2
  public milkCost = 5

  public idxToValue: Record<string, number> = {
    0: this._initMoney,
    1: this._initCorns,
    2: this._initEggs,
    3: this._initMilks
  }

  constructor (options: IStatusBarOptions) {
    super()
    this.onTileClick = options.onTileClick
    this.setup(options)
  }

  get totalWidth (): number {
    return this.widthCells * this.cellWidth
  }

  get totalHeight (): number {
    return this.heightCells * this.cellHeight
  }

  get money (): number {
    return this.children[0].value
  }

  get corn (): number {
    return this.children[1].value
  }

  setup ({
    textures: {
      money,
      corn,
      egg,
      milk
    }
  }: IStatusBarOptions): void {
    const idxToType: Record<string, StatusBarTile['type']> = {
      0: StatusBarTile.TYPES.money,
      1: StatusBarTile.TYPES.corns,
      2: StatusBarTile.TYPES.eggs,
      3: StatusBarTile.TYPES.milks
    }
    const idxToTexture: Record<string, Texture> = {
      0: money,
      1: corn,
      2: egg,
      3: milk
    }
    const idxToHover: Record<string, boolean> = {
      0: false,
      1: true,
      2: true,
      3: true
    }
    const idxToSelected: Record<string, boolean> = {
      0: false,
      1: true,
      2: false,
      3: false
    }
    const {
      widthCells,
      heightCells,
      cellWidth,
      cellHeight,
      idxToValue
    } = this
    for (let i = 0; i < widthCells; i++) {
      for (let j = 0; j < heightCells; j++) {
        const x = cellWidth * i
        const y = cellHeight * j
        const tile = new StatusBarTile({
          id: `${i}_${j}`,
          type: idxToType[i],
          iconTextureResource: idxToTexture[i],
          x,
          y,
          width: cellWidth,
          height: cellHeight,
          showSelected: idxToSelected[i],
          value: idxToValue[i],
          onClick: this.handleTileClick as Tile['onClick'],
          showHover: idxToHover[i],
          isButtonMode: i !== 0,
          isInteractive: i !== 0
        })
        logFarmStatus(`x=${x} y=${y} tx=${tile.x} ty=${tile.y} tw=${tile.width} th=${tile.height}`)

        this.addChild(tile)
      }
    }
  }

  handleTileClick = (tile: StatusBarTile): void => {
    this.children.forEach(child => {
      if (child !== tile) {
        child.deselect()
      }
    })
    if (typeof this.onTileClick === 'function') {
      this.onTileClick(tile, this)
    }
  }

  addMoney (value: number): void {
    this.children[0].add(value)
  }

  subMoney (value: number): void {
    this.children[0].sub(value)
  }

  addCorn (value: number): void {
    this.children[1].add(value)
  }

  subCorn (value: number): void {
    this.children[1].sub(value)
  }

  addEgg (value: number): void {
    this.children[2].add(value)
  }

  sellEggs (): void {
    this.children[0].add(this.children[2].value * this.eggCost)
    this.children[2].updateValue(0)
  }

  addMilk (value: number): void {
    this.children[3].add(value)
  }

  sellMilks (): void {
    this.children[0].add(this.children[3].value * this.milkCost)
    this.children[3].updateValue(0)
  }

  deselectAll (): void {
    this.children.forEach(child => {
      child.deselect()
    })
  }
}

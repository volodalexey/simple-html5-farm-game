import { Container, type Texture } from 'pixi.js'
import { logFarmShop } from './logger'
import { type Tile } from './models/Tile'
import { ShopTile } from './ShopTile'

export interface IShopBarOptions {
  textures: {
    money: Texture
    corn: Texture
    chicken: Texture
    cow: Texture
  }
  onTileClick?: (tile: ShopTile, shopBar: ShopBar) => void
}

export class ShopBar extends Container<ShopTile> {
  public widthCells = 3
  public heightCells = 1
  public cellWidth = 100
  public cellHeight = 40
  public onTileClick?: IShopBarOptions['onTileClick']

  public cornOptions = {
    cost: 5,
    icon: {
      width: 30,
      height: 30,
      marginLeft: -30,
      marginTop: -15
    }
  }

  public chickenOptions = {
    cost: 10,
    icon: {
      width: 30,
      height: 30,
      marginLeft: -25,
      marginTop: -15
    }
  }

  public cowOptions = {
    cost: 30,
    icon: {
      width: 50,
      height: 50,
      marginLeft: -40,
      marginTop: -25
    }
  }

  public idxToCost: Record<string, number> = {
    0: this.cornOptions.cost,
    1: this.chickenOptions.cost,
    2: this.cowOptions.cost
  }

  constructor (options: IShopBarOptions) {
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

  setup ({
    textures: {
      money,
      corn,
      chicken,
      cow
    }
  }: IShopBarOptions): void {
    const idxToType: Record<string, ShopTile['type']> = {
      0: ShopTile.TYPES.corn,
      1: ShopTile.TYPES.chicken,
      2: ShopTile.TYPES.cow
    }
    const idxToTexture: Record<string, Texture> = {
      0: corn,
      1: chicken,
      2: cow
    }
    const {
      widthCells,
      heightCells,
      cellWidth,
      cellHeight,
      cornOptions,
      chickenOptions,
      cowOptions,
      idxToCost
    } = this
    const idxToWidth: Record<string, number> = {
      0: cornOptions.icon.width,
      1: chickenOptions.icon.width,
      2: cowOptions.icon.width
    }
    const idxToHeight: Record<string, number> = {
      0: cornOptions.icon.height,
      1: chickenOptions.icon.height,
      2: cowOptions.icon.height
    }
    const idxToMarginLeft: Record<string, number> = {
      0: cornOptions.icon.marginLeft,
      1: chickenOptions.icon.marginLeft,
      2: cowOptions.icon.marginLeft
    }
    const idxToMarginTop: Record<string, number> = {
      0: cornOptions.icon.marginTop,
      1: chickenOptions.icon.marginTop,
      2: cowOptions.icon.marginTop
    }
    for (let i = 0; i < widthCells; i++) {
      for (let j = 0; j < heightCells; j++) {
        const x = cellWidth * i
        const y = cellHeight * j
        const tile = new ShopTile({
          id: `${i}_${j}`,
          type: idxToType[i],
          x: i > 0 ? x + i * 10 : x,
          y,
          width: cellWidth,
          height: cellHeight,
          onClick: this.handleTileClick as Tile['onClick'],
          cost: idxToCost[i],
          itemTextureResource: idxToTexture[i],
          moneyTextureResource: money,
          iconOptions: {
            width: idxToWidth[i],
            height: idxToHeight[i],
            marginLeft: idxToMarginLeft[i],
            marginTop: idxToMarginTop[i]
          }
        })
        logFarmShop(`x=${x} y=${y} tx=${tile.x} ty=${tile.y} tw=${tile.width} th=${tile.height}`)

        this.addChild(tile)
      }
    }
  }

  deselectAll (): void {
    this.children.forEach(child => {
      child.deselect()
    })
  }

  handleTileClick = (tile: ShopTile): void => {
    this.children.forEach(child => {
      if (child !== tile) {
        child.deselect()
      }
    })
    if (typeof this.onTileClick === 'function') {
      this.onTileClick(tile, this)
    }
  }
}

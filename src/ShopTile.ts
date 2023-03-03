import { type Resource, Sprite, Text, type Texture } from 'pixi.js'
import { Tile, type ITileOptions } from './models/Tile'

export interface IShopTileOptions extends ITileOptions {
  type: ShopTileType
  cost: number
  moneyTextureResource: Texture<Resource>
  itemTextureResource: Texture<Resource>
  iconOptions: {
    width: number
    height: number
    marginLeft: number
    marginTop: number
  }
}

enum ShopTileType {
  corn,
  chicken,
  cow
}

export class ShopTile extends Tile {
  static TYPES = ShopTileType

  public type!: ShopTileType
  public cost!: number
  public fontSize = 10
  public moneyOptions = {
    width: 10,
    height: 15,
    marginLeft: 10,
    marginTop: -7
  }

  public textOptions = {
    marginLeft: 25,
    marginTop: -5
  }

  constructor (options: IShopTileOptions) {
    super(options)
    this.type = options.type
    this.cost = options.cost
    this.setup(options)
  }

  setup ({
    itemTextureResource,
    moneyTextureResource,
    iconOptions: { width, height, marginLeft, marginTop }
  }: IShopTileOptions): void {
    const {
      cost,
      fontSize,
      moneyOptions,
      textOptions
    } = this
    const xCenter = this.posX + Math.round(this.width / 2)
    const yCenter = this.posY + Math.round(this.height / 2)

    const texture = new Sprite(itemTextureResource)
    texture.width = width
    texture.height = height
    texture.position.x = xCenter + marginLeft
    texture.position.y = yCenter + marginTop
    this.addChild(texture)

    const textIcon = new Sprite(moneyTextureResource)
    textIcon.width = moneyOptions.width
    textIcon.height = moneyOptions.height
    textIcon.position.x = xCenter + moneyOptions.marginLeft
    textIcon.position.y = yCenter + moneyOptions.marginTop
    this.addChild(textIcon)

    const text = new Text(cost, {
      fontFamily: 'Arial',
      fontSize,
      fill: 0x141414,
      align: 'center'
    })
    text.position.x = xCenter + textOptions.marginLeft
    text.position.y = yCenter + textOptions.marginTop
    this.addChild(text)
  }
}

import { type Texture, Sprite, BitmapText, BitmapFont } from 'pixi.js'
import { type ITileOptions, Tile } from './models/Tile'

export interface IStatusBarTileOptions extends ITileOptions {
  type: StatusType
  value: number
  iconTextureResource: Texture
}

enum StatusType {
  money,
  corns,
  eggs,
  milks
}

export class StatusBarTile extends Tile {
  static bitmapFont = BitmapFont.from('comic 40', {
    fill: 0x141414,
    fontFamily: 'Comic Sans MS',
    fontSize: 40
  })

  static TYPES = StatusType

  public type!: StatusType

  public iconOptions = {
    width: 16,
    height: 24,
    marginLeft: -25,
    marginTop: -12
  }

  public textOptions = {
    fontSize: 20,
    marginLeft: 0,
    marginTop: -10
  }

  private _text!: BitmapText

  private _value = 0
  constructor (options: IStatusBarTileOptions) {
    super(options)
    this.type = options.type
    this._value = options.value
    this.setup(options)
  }

  get value (): number {
    return this._value
  }

  setup ({
    iconTextureResource
  }: IStatusBarTileOptions): void {
    const {
      _value,
      iconOptions,
      textOptions
    } = this
    const xCenter = this.posX + Math.round(this.width / 2)
    const yCenter = this.posY + Math.round(this.height / 2)

    const texture = new Sprite(iconTextureResource)
    texture.width = iconOptions.width
    texture.height = iconOptions.height
    texture.position.x = xCenter + iconOptions.marginLeft
    texture.position.y = yCenter + iconOptions.marginTop
    this.addChild(texture)

    const text = new BitmapText(String(_value), {
      fontName: 'comic 40',
      fontSize: textOptions.fontSize
    })
    text.x = xCenter + textOptions.marginLeft
    text.y = yCenter + textOptions.marginTop
    this.addChild(text)
    this._text = text
  }

  updateValue (value: number): void {
    this._value = value
    this._text.text = String(value)
  }

  add (value: number): void {
    this.updateValue(this._value + value)
  }

  sub (value: number): void {
    this.updateValue(this._value - value)
  }
}

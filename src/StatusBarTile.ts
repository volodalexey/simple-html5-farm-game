import { type Resource, Text, type Texture, Sprite } from 'pixi.js'
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
    color: 0x141414,
    marginLeft: 0,
    marginTop: -10
  }

  private _text!: Text

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

    const text = new Text(_value, {
      fontFamily: 'Arial',
      fontSize: textOptions.fontSize,
      fill: textOptions.color,
      align: 'center'
    })
    text.position.x = xCenter + textOptions.marginLeft
    text.position.y = yCenter + textOptions.marginTop
    this.addChild(text)
    this._text = text
  }

  updateValue (value: number): void {
    this._value = value
    this._text.text = value
  }

  add (value: number): void {
    this.updateValue(this._value + value)
  }

  sub (value: number): void {
    this.updateValue(this._value - value)
  }
}

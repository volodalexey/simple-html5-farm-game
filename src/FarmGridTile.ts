import { type Resource, type Texture, Sprite, AnimatedSprite } from 'pixi.js'
import { ProgressBar } from './models/ProgressBar'
import { StrokeRect } from './models/StrokeRect'
import { type ITileOptions, Tile } from './models/Tile'

export interface IFarmGridTileOptions extends ITileOptions {
  grassTextureResource: Texture<Resource>
  cornBuildableTextureResource: Texture<Resource>
  chickenBuildableTextureResource: Texture<Resource>
  cowBuildableTextureResource: Texture<Resource>
  cornAnimatedTextureResources: Array<Texture<Resource>>
  chickenAnimatedTextureResources: Array<Texture<Resource>>
  cowAnimatedTextureResources: Array<Texture<Resource>>
}

enum FarmType {
  grass,
  possibleCorn,
  possibleChicken,
  possibleCow,
  corn,
  chicken,
  cow,
  possibleFeedChicken,
  possibleFeedCow
}

export class FarmGridTile extends Tile {
  static TYPES = FarmType

  private _generated = 0
  private _food = 1

  public type!: FarmType
  public cornBuildableSprite!: Sprite
  public chickenBuildableSprite!: Sprite
  public cowBuildableSprite!: Sprite
  public cornAnimatedSprite!: AnimatedSprite
  public chickenAnimatedSprite!: AnimatedSprite
  public cowAnimatedSprite!: AnimatedSprite
  public foodProgress?: ProgressBar
  public generateProgress?: ProgressBar
  public rectGraphics!: StrokeRect
  public grassOptions = {
    width: 46,
    height: 46,
    marginLeft: -23,
    marginTop: -23
  }

  public cornOptions = {
    width: 26,
    height: 26,
    marginLeft: -13,
    marginTop: -13,
    animationSpeed: 0.05,
    generateFactor: 1 / 10 / 1000
  }

  public chickenOptions = {
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    animationSpeed: 0.05,
    generateFactor: 1 / 10 / 1000,
    eatFactor: 1 / 30 / 1000
  }

  public cowOptions = {
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    animationSpeed: 0.05,
    generateFactor: 1 / 20 / 1000,
    eatFactor: 1 / 20 / 1000
  }

  public foodOptions = {
    width: 26,
    height: 3,
    marginLeft: -16,
    marginTop: 8
  }

  public generateOptions = {
    width: 26,
    height: 3,
    marginLeft: -16,
    marginTop: -18
  }

  public rectOptions = {
    width: 30,
    height: 20,
    marginLeft: 5,
    marginTop: 10,
    color: 0xeec643
  }

  constructor (options: IFarmGridTileOptions) {
    super(options)
    this.setup(options)
    this.setType(FarmType.grass)
  }

  setup ({
    grassTextureResource,
    cornBuildableTextureResource,
    chickenBuildableTextureResource,
    cowBuildableTextureResource,
    cornAnimatedTextureResources,
    chickenAnimatedTextureResources,
    cowAnimatedTextureResources
  }: IFarmGridTileOptions): void {
    const {
      grassOptions,
      cornOptions,
      chickenOptions,
      cowOptions,
      rectOptions
    } = this
    const xCenter = this.posX + Math.round(this.width / 2)
    const yCenter = this.posY + Math.round(this.height / 2)

    const grassSprite = new Sprite(grassTextureResource)
    grassSprite.width = grassOptions.width
    grassSprite.height = grassOptions.height
    grassSprite.position.x = xCenter + grassOptions.marginLeft
    grassSprite.position.y = yCenter + grassOptions.marginTop
    this.addChild(grassSprite)

    const cornBuildableSprite = new Sprite(cornBuildableTextureResource)
    cornBuildableSprite.width = cornOptions.width
    cornBuildableSprite.height = cornOptions.height
    cornBuildableSprite.position.x = xCenter + cornOptions.marginLeft
    cornBuildableSprite.position.y = yCenter + cornOptions.marginTop
    this.addChild(cornBuildableSprite)
    this.cornBuildableSprite = cornBuildableSprite

    const chickenBuildableSprite = new Sprite(chickenBuildableTextureResource)
    chickenBuildableSprite.width = chickenOptions.width
    chickenBuildableSprite.height = chickenOptions.height
    chickenBuildableSprite.position.x = xCenter + chickenOptions.marginLeft
    chickenBuildableSprite.position.y = yCenter + chickenOptions.marginTop
    this.addChild(chickenBuildableSprite)
    this.chickenBuildableSprite = chickenBuildableSprite

    const cowBuildableSprite = new Sprite(cowBuildableTextureResource)
    cowBuildableSprite.width = cowOptions.width
    cowBuildableSprite.height = cowOptions.height
    cowBuildableSprite.position.x = xCenter + cowOptions.marginLeft
    cowBuildableSprite.position.y = yCenter + cowOptions.marginTop
    this.addChild(cowBuildableSprite)
    this.cowBuildableSprite = cowBuildableSprite

    const cornAnimatedSprite = new AnimatedSprite(cornAnimatedTextureResources)
    cornAnimatedSprite.animationSpeed = cornOptions.animationSpeed * Math.random()
    cornAnimatedSprite.width = cornOptions.width
    cornAnimatedSprite.height = cornOptions.height
    cornAnimatedSprite.position.x = xCenter + cornOptions.marginLeft
    cornAnimatedSprite.position.y = yCenter + cornOptions.marginTop
    cornAnimatedSprite.play()
    this.addChild(cornAnimatedSprite)
    this.cornAnimatedSprite = cornAnimatedSprite

    const chickenAnimatedSprite = new AnimatedSprite(chickenAnimatedTextureResources)
    chickenAnimatedSprite.animationSpeed = chickenOptions.animationSpeed * Math.random()
    chickenAnimatedSprite.width = chickenOptions.width
    chickenAnimatedSprite.height = chickenOptions.height
    chickenAnimatedSprite.position.x = xCenter + chickenOptions.marginLeft
    chickenAnimatedSprite.position.y = yCenter + chickenOptions.marginTop
    chickenAnimatedSprite.play()
    this.addChild(chickenAnimatedSprite)
    this.chickenAnimatedSprite = chickenAnimatedSprite

    const cowAnimatedSprite = new AnimatedSprite(cowAnimatedTextureResources)
    cowAnimatedSprite.animationSpeed = cowOptions.animationSpeed * Math.random()
    cowAnimatedSprite.width = cowOptions.width
    cowAnimatedSprite.height = cowOptions.height
    cowAnimatedSprite.position.x = xCenter + cowOptions.marginLeft
    cowAnimatedSprite.position.y = yCenter + cowOptions.marginTop
    cowAnimatedSprite.play()
    this.addChild(cowAnimatedSprite)
    this.cowAnimatedSprite = cowAnimatedSprite

    const rectGraphics = new StrokeRect({
      x: this.posX + rectOptions.marginLeft,
      y: this.posY + rectOptions.marginTop,
      width: rectOptions.width,
      height: rectOptions.height,
      color: rectOptions.color,
      strokeWidth: 2
    })
    this.addChild(rectGraphics)
    this.rectGraphics = rectGraphics
  }

  hideAllSprites (): void {
    const sprites = [
      this.cornBuildableSprite, this.chickenBuildableSprite, this.cowBuildableSprite,
      this.cornAnimatedSprite, this.chickenAnimatedSprite, this.cowAnimatedSprite,
      this.rectGraphics
    ]
    sprites.forEach(sprite => { sprite.visible = false })
  }

  setType (type: FarmType): void {
    switch (type) {
      case FarmType.grass:
        this.hideAllSprites()
        break
      case FarmType.possibleCorn:
        this.hideAllSprites()
        this.cornBuildableSprite.visible = true
        break
      case FarmType.possibleChicken:
        this.hideAllSprites()
        this.chickenBuildableSprite.visible = true
        break
      case FarmType.possibleCow:
        this.hideAllSprites()
        this.cowBuildableSprite.visible = true
        break
      case FarmType.corn:
        this.hideAllSprites()
        this.cornAnimatedSprite.visible = true
        this.appendProgressBars()
        break
      case FarmType.chicken:
        this.hideAllSprites()
        this.chickenAnimatedSprite.visible = true
        this.appendProgressBars()
        break
      case FarmType.cow:
        this.hideAllSprites()
        this.cowAnimatedSprite.visible = true
        this.appendProgressBars()
        break
      case FarmType.possibleFeedChicken:
      case FarmType.possibleFeedCow:
        this.rectGraphics.visible = true
        break
    }
    this.type = type
  }

  appendProgressBars (): void {
    const xCenter = this.posX + Math.round(this.width / 2)
    const yCenter = this.posY + Math.round(this.height / 2)
    const { type, foodOptions, generateOptions, _food, _generated } = this
    if ([
      FarmType.possibleCorn,
      FarmType.possibleChicken,
      FarmType.possibleCow
    ].includes(type)) {
      const typeToMinColor: Record<string, number> = {
        [FarmType.possibleCorn]: 0xeec643,
        [FarmType.possibleChicken]: 0xeef0f2,
        [FarmType.possibleCow]: 0x0d21a1
      }
      this.generateProgress = new ProgressBar({
        x: xCenter + generateOptions.marginLeft,
        y: yCenter + generateOptions.marginTop,
        width: generateOptions.width,
        height: generateOptions.height,
        value: _generated,
        minColor: typeToMinColor[type],
        maxColor: typeToMinColor[type]
      })
      this.addChild(this.generateProgress)
    }
    if ([
      FarmType.possibleChicken,
      FarmType.possibleCow
    ].includes(type)) {
      this.foodProgress = new ProgressBar({
        x: xCenter + foodOptions.marginLeft,
        y: yCenter + foodOptions.marginTop,
        width: foodOptions.width,
        height: foodOptions.height,
        value: _food,
        minColor: 0xff0000,
        maxColor: 0x00ff00
      })
      this.addChild(this.foodProgress)
    }
  }

  get isFree (): boolean {
    return [
      FarmType.grass,
      FarmType.possibleCorn,
      FarmType.possibleChicken,
      FarmType.possibleCow
    ].includes(this.type)
  }

  get isOccupied (): boolean {
    return [
      FarmType.corn,
      FarmType.chicken,
      FarmType.cow,
      FarmType.possibleFeedChicken,
      FarmType.possibleFeedCow
    ].includes(this.type)
  }

  get isFeedable (): boolean {
    return [
      FarmType.chicken,
      FarmType.cow,
      FarmType.possibleFeedChicken,
      FarmType.possibleFeedCow
    ].includes(this.type)
  }

  generate ({
    deltaMS,
    generateFactor
  }: {
    deltaMS: number
    generateFactor: number
  }): void {
    if (this._generated > 1) {
      this._generated = 1
    } else if (this._generated === 1) {
      // skip grow ??
    } else {
      this._generated += deltaMS * generateFactor
    }
  }

  eatAndGenerate ({
    deltaMS,
    eatFactor,
    generateFactor
  }: {
    deltaMS: number
    eatFactor: number
    generateFactor: number
  }): void {
    let spentFood = 0
    const deltaFood = deltaMS * eatFactor
    if (this._food > 0) {
      const wasFood = this._food
      this._food -= deltaFood
      if (this._food <= 0) {
        this._food = 0
        spentFood = wasFood
      } else {
        spentFood = deltaFood
      }
    }
    this._generated += spentFood / eatFactor * generateFactor
    if (this._generated > 1) {
      this._generated = 1 // limit ??
    }
  }

  handleFarmTick = (deltaMS: number): void => {
    switch (this.type) {
      case FarmType.corn:
        this.generate({
          deltaMS, generateFactor: this.cornOptions.generateFactor
        })
        break
      case FarmType.chicken:
      case FarmType.possibleFeedChicken:
        this.eatAndGenerate({
          deltaMS, eatFactor: this.chickenOptions.eatFactor, generateFactor: this.chickenOptions.generateFactor
        })
        break
      case FarmType.cow:
      case FarmType.possibleFeedCow:
        this.eatAndGenerate({
          deltaMS, eatFactor: this.cowOptions.eatFactor, generateFactor: this.cowOptions.generateFactor
        })
        break
    }
    this.updateProgressBars()
  }

  updateProgressBars (): void {
    if (this.generateProgress != null) {
      this.generateProgress.update(this._generated)
      if (this._generated >= 1) {
        this.generateProgress.initHeight = this.generateOptions.height * 5
        this.generateProgress.initWidth = 2
      } else {
        this.generateProgress.initHeight = this.generateOptions.height
        this.generateProgress.initWidth = this.generateOptions.width
      }
    }
    if (this.foodProgress != null) {
      this.foodProgress.update(this._food)
    }
  }

  harvest (): number {
    if (this._generated >= 1) {
      this._generated -= 1
      return 1
    }
    return 0
  }

  feed (value: number): void {
    this._food += value
    if (this._food > 1) {
      this._food = 1
    }
  }
}

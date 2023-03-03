import { Container, type Resource, type Texture } from 'pixi.js'
import { FarmGridTile } from './FarmGridTile'
import { logFarmGrid } from './logger'

// orange eec643
// black 141414
// white eef0f2
// blue 0d21a1
// gray-blue 011638

export interface IFarmGridOptions {
  textures: {
    grass: Texture<Resource>
    cornMask: Texture<Resource>
    chickenMask: Texture<Resource>
    cowMask: Texture<Resource>
    cornAnimated: Array<Texture<Resource>>
    chickenAnimated: Array<Texture<Resource>>
    cowAnimated: Array<Texture<Resource>>
  }
  onTileClick?: (tile: FarmGridTile, farmGrid: FarmGrid) => void
}

export class FarmGrid extends Container<FarmGridTile> {
  public widthCells = 8
  public heightCells = 8
  public cell = 40
  public onTileClick?: IFarmGridOptions['onTileClick']

  constructor (options: IFarmGridOptions) {
    super()
    this.onTileClick = options.onTileClick
    this.setupGrid(options)
  }

  get totalWidth (): number {
    return this.widthCells * this.cell
  }

  get totalHeight (): number {
    return this.heightCells * this.cell
  }

  setupGrid ({
    textures: {
      grass,
      cornMask,
      chickenMask,
      cowMask,
      cornAnimated,
      chickenAnimated,
      cowAnimated
    }
  }: IFarmGridOptions): void {
    const {
      widthCells,
      heightCells,
      cell
    } = this
    for (let i = 0; i < widthCells; i++) {
      for (let j = 0; j < heightCells; j++) {
        const x = cell * i
        const y = cell * j
        const tile = new FarmGridTile({
          grassTextureResource: grass,
          cornBuildableTextureResource: cornMask,
          chickenBuildableTextureResource: chickenMask,
          cowBuildableTextureResource: cowMask,
          cornAnimatedTextureResources: cornAnimated,
          chickenAnimatedTextureResources: chickenAnimated,
          cowAnimatedTextureResources: cowAnimated,
          id: `${i}_${j}`,
          x,
          y,
          width: cell,
          height: cell,
          showSelected: false,
          onClick: this.handleTileClick as FarmGridTile['onClick']
        })
        logFarmGrid(`x=${x} y=${y} tx=${tile.x} ty=${tile.y} tw=${tile.width} th=${tile.height}`)

        this.addChild(tile)
      }
    }
  }

  showFree (): void {
    this.children.forEach(child => {
      if (child.isFree) {
        child.setType(FarmGridTile.TYPES.grass)
      } else {
        switch (child.type) {
          case FarmGridTile.TYPES.possibleFeedChicken:
            child.setType(FarmGridTile.TYPES.chicken)
            break
          case FarmGridTile.TYPES.possibleFeedCow:
            child.setType(FarmGridTile.TYPES.cow)
            break
        }
      }
    })
  }

  showBuildableCorn (): void {
    this.children.forEach(child => {
      if (child.isFree) {
        child.setType(FarmGridTile.TYPES.possibleCorn)
      }
    })
  }

  showBuildableChicken (): void {
    this.children.forEach(child => {
      if (child.isFree) {
        child.setType(FarmGridTile.TYPES.possibleChicken)
      }
    })
  }

  showBuildableCow (): void {
    this.children.forEach(child => {
      if (child.isFree) {
        child.setType(FarmGridTile.TYPES.possibleCow)
      }
    })
  }

  showFeedable (): void {
    this.children.forEach(child => {
      if (child.isFeedable) {
        switch (child.type) {
          case FarmGridTile.TYPES.chicken:
            child.setType(FarmGridTile.TYPES.possibleFeedChicken)
            break
          case FarmGridTile.TYPES.cow:
            child.setType(FarmGridTile.TYPES.possibleFeedCow)
            break
        }
      }
    })
  }

  handleTileClick = (tile: FarmGridTile): void => {
    this.children.forEach(child => {
      if (child !== tile) {
        child.deselect()
      }
    })
    if (typeof this.onTileClick === 'function') {
      this.onTileClick(tile, this)
    }
  }

  handleWorldTick = (deltaMS: number): void => {
    this.children.forEach(child => {
      child.handleFarmTick(deltaMS)
    })
  }
}

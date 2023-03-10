import { type Application, type Text } from 'pixi.js'
import { FarmGrid } from './FarmGrid'
import { logFarmLayout } from './logger'

import { type GameLoader } from './GameLoader'
import { StatusBar } from './StatusBar'
import { ShopBar } from './ShopBar'
import { ShopTile } from './ShopTile'
import { FarmGridTile } from './FarmGridTile'
import { StatusBarTile } from './StatusBarTile'

enum UIState {
  idle,
  toBuildCorn,
  toBuildChicken,
  toBuildCow,
  toFeedCorn,
}

export class World {
  public app: Application<HTMLCanvasElement>
  public gameLoader: GameLoader
  public text!: Text
  public statusBar!: StatusBar
  public farmGrid!: FarmGrid
  public shopBar!: ShopBar
  public resizeTimeoutId!: NodeJS.Timeout
  public resizeTimeout = 300

  private _state = UIState.idle

  constructor ({ app, gameLoader }: { app: Application, gameLoader: GameLoader }) {
    this.app = app as Application<HTMLCanvasElement>
    this.gameLoader = gameLoader

    this.app.ticker.add(this.handleAppTick)
  }

  setup (): void {
    this.setupCanvas()
    this.setupLayout()
    this.resizeHandler()
  }

  setupCanvas (): void {
    document.body.appendChild(this.app.view)
    window.addEventListener('resize', this.resizeDeBounce)
  }

  setupLayout (): void {
    const { textures, animations } = this.gameLoader.spritesheet
    this.statusBar = new StatusBar({
      textures: {
        money: textures['icon-money.png'],
        corn: textures['icon-corn.png'],
        egg: textures['icon-egg.png'],
        milk: textures['icon-milk.png']
      },
      onTileClick: this.handleStatusBarClick
    })
    this.app.stage.addChild(this.statusBar)
    this.farmGrid = new FarmGrid({
      textures: {
        grass: textures['grass.png'],
        cornMask: textures['corn-mask.png'],
        chickenMask: textures['chicken-mask.png'],
        cowMask: textures['cow-mask.png'],
        cornAnimated: animations.corn,
        chickenAnimated: animations.chicken,
        cowAnimated: animations.cow
      },
      onTileClick: this.handleFramGridClick
    })
    this.farmGrid.y = this.statusBar.y + this.statusBar.totalHeight
    this.app.stage.addChild(this.farmGrid)
    this.shopBar = new ShopBar({
      textures: {
        money: textures['icon-money.png'],
        corn: animations.corn[0],
        chicken: animations.chicken[0],
        cow: animations.cow[0]
      },
      onTileClick: this.handleShopBarClick
    })
    this.app.stage.addChild(this.shopBar)
    this.shopBar.y = this.farmGrid.y + this.farmGrid.totalHeight
  }

  resizeDeBounce = (): void => {
    this.cancelScheduledResizeHandler()
    this.scheduleResizeHandler()
  }

  cancelScheduledResizeHandler (): void {
    clearTimeout(this.resizeTimeoutId)
  }

  scheduleResizeHandler (): void {
    this.resizeTimeoutId = setTimeout(() => {
      this.cancelScheduledResizeHandler()
      this.resizeHandler()
    }, this.resizeTimeout)
  }

  resizeHandler (): void {
    const { view } = this.app
    const availableWidth = view.width
    const availableHeight = view.height
    const totalWidth = this.farmGrid.totalWidth
    const totalHeight = (this.statusBar.totalHeight + this.farmGrid.totalHeight + this.shopBar.totalHeight)
    let scale = 1
    if (totalHeight >= totalWidth) {
      scale = availableHeight / totalHeight
      if (scale * totalWidth > availableWidth) {
        scale = availableWidth / totalWidth
      }
      logFarmLayout(`By height (sc=${scale})`)
    } else {
      scale = availableWidth / totalWidth
      logFarmLayout(`By width (sc=${scale})`)
      if (scale * totalHeight > availableHeight) {
        scale = availableHeight / totalHeight
      }
    }
    const occupiedWidth = Math.floor(totalWidth * scale)
    const occupiedHeight = Math.floor(totalHeight * scale)
    const x = availableWidth > occupiedWidth ? (availableWidth - occupiedWidth) / 2 : 0
    const y = availableHeight > occupiedHeight ? (availableHeight - occupiedHeight) / 2 : 0
    logFarmLayout(`aw=${availableWidth} (ow=${occupiedWidth}) x=${x} ah=${availableHeight} (oh=${occupiedHeight}) y=${y}`)
    this.app.stage.x = x
    this.app.stage.width = occupiedWidth
    this.app.stage.y = y
    this.app.stage.height = occupiedHeight
    logFarmLayout(`x=${x} y=${y} stgw=${this.app.stage.width} stgh=${this.app.stage.height}`)
  }

  handleFramGridClick = (tile: FarmGridTile): void => {
    switch (this._state) {
      case UIState.idle:
        if (tile.isOccupied) {
          const result = tile.harvest()
          if (result !== 0) {
            switch (tile.type) {
              case FarmGridTile.TYPES.corn:
                this.statusBar.addCorn(result)
                break
              case FarmGridTile.TYPES.chicken:
                this.statusBar.addEgg(result)
                break
              case FarmGridTile.TYPES.cow:
                this.statusBar.addMilk(result)
                break
            }
          }
        }
        break
      case UIState.toBuildCorn:
      case UIState.toBuildChicken:
      case UIState.toBuildCow:
        if (tile.isFree) {
          let newType: FarmGridTile['type'] | null = null
          let cost = 0
          switch (this._state) {
            case UIState.toBuildCorn:
              newType = FarmGridTile.TYPES.corn
              cost = this.shopBar.cornOptions.cost
              break
            case UIState.toBuildChicken:
              newType = FarmGridTile.TYPES.chicken
              cost = this.shopBar.chickenOptions.cost
              break
            case UIState.toBuildCow:
              newType = FarmGridTile.TYPES.cow
              cost = this.shopBar.cowOptions.cost
              break
          }
          if (newType != null) {
            tile.setType(newType)
            this.statusBar.subMoney(cost)
          }
          if (this.statusBar.money >= cost) {
            // continue
          } else {
            this.shopBar.deselectAll()
            this.setUIState(UIState.idle)
          }
        }
        break
      case UIState.toFeedCorn:
        if (tile.isFeedable) {
          tile.feed(1)
          this.statusBar.subCorn(1)
          if (this.statusBar.corn >= 1) {
            // continue
          } else {
            this.statusBar.deselectAll()
            this.setUIState(UIState.idle)
          }
        }
        break
    }
  }

  handleStatusBarClick = (tile: StatusBarTile): void => {
    if (tile.isSelected && tile.type === StatusBarTile.TYPES.corns) {
      if (tile.value >= 1) {
        this.shopBar.deselectAll()
        this.setUIState(UIState.toFeedCorn)
      } else {
        this.statusBar.deselectAll()
      }
    } else {
      this.setUIState(UIState.idle)
    }
    switch (tile.type) {
      case StatusBarTile.TYPES.eggs:
        this.statusBar.sellEggs()
        break
      case StatusBarTile.TYPES.milks:
        this.statusBar.sellMilks()
        break
    }
  }

  handleShopBarClick = (tile: ShopTile): void => {
    this.statusBar.deselectAll()
    if (tile.isSelected) {
      if (tile.cost > 0 && this.statusBar.money >= tile.cost) {
        switch (tile.type) {
          case ShopTile.TYPES.corn:
            this.setUIState(UIState.toBuildCorn)
            break
          case ShopTile.TYPES.chicken:
            this.setUIState(UIState.toBuildChicken)
            break
          case ShopTile.TYPES.cow:
            this.setUIState(UIState.toBuildCow)
            break
        }
      } else {
        this.shopBar.deselectAll()
      }
    } else {
      this.setUIState(UIState.idle)
    }
  }

  setUIState (state: UIState): void {
    switch (state) {
      case UIState.idle:
        this.farmGrid.showFree()
        break
      case UIState.toBuildCorn:
        this.farmGrid.showBuildableCorn()
        break
      case UIState.toBuildChicken:
        this.farmGrid.showBuildableChicken()
        break
      case UIState.toBuildCow:
        this.farmGrid.showBuildableCow()
        break
      case UIState.toFeedCorn:
        this.farmGrid.showFeedable()
        break
    }
    this._state = state
  }

  handleAppTick = (): void => {
    this.farmGrid.handleWorldTick(this.app.ticker.deltaMS)
  }
}

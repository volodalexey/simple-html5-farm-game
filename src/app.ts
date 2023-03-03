import { Application } from 'pixi.js'

import { World } from './World'
import { GameLoader } from './GameLoader'

async function run (): Promise<void> {
  const gameLoader = new GameLoader()
  await gameLoader.loadAll()
  const app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xe6e7ea
    // resolution: window.devicePixelRatio > 0 ? window.devicePixelRatio : 1
  })
  const world = new World({ app, gameLoader })
  world.setup()
}

run().catch(console.error)

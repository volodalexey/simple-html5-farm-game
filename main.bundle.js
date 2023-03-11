/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/FarmGrid.ts":
/*!*************************!*\
  !*** ./src/FarmGrid.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FarmGrid = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const FarmGridTile_1 = __webpack_require__(/*! ./FarmGridTile */ "./src/FarmGridTile.ts");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/logger.ts");
class FarmGrid extends pixi_js_1.Container {
    constructor(options) {
        super();
        this.widthCells = 8;
        this.heightCells = 8;
        this.cell = 40;
        this.handleTileClick = (tile) => {
            this.children.forEach(child => {
                if (child !== tile) {
                    child.deselect();
                }
            });
            if (typeof this.onTileClick === 'function') {
                this.onTileClick(tile, this);
            }
        };
        this.handleWorldTick = (deltaMS) => {
            this.children.forEach(child => {
                child.handleFarmTick(deltaMS);
            });
        };
        this.onTileClick = options.onTileClick;
        this.setupGrid(options);
    }
    get totalWidth() {
        return this.widthCells * this.cell;
    }
    get totalHeight() {
        return this.heightCells * this.cell;
    }
    setupGrid({ textures: { grass, cornMask, chickenMask, cowMask, cornAnimated, chickenAnimated, cowAnimated } }) {
        const { widthCells, heightCells, cell } = this;
        for (let i = 0; i < widthCells; i++) {
            for (let j = 0; j < heightCells; j++) {
                const x = cell * i;
                const y = cell * j;
                const tile = new FarmGridTile_1.FarmGridTile({
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
                    onClick: this.handleTileClick
                });
                (0, logger_1.logFarmGrid)(`x=${x} y=${y} tx=${tile.x} ty=${tile.y} tw=${tile.width} th=${tile.height}`);
                this.addChild(tile);
            }
        }
    }
    showFree() {
        this.children.forEach(child => {
            if (child.isFree) {
                child.setType(FarmGridTile_1.FarmGridTile.TYPES.grass);
            }
            else {
                switch (child.type) {
                    case FarmGridTile_1.FarmGridTile.TYPES.possibleFeedChicken:
                        child.setType(FarmGridTile_1.FarmGridTile.TYPES.chicken);
                        break;
                    case FarmGridTile_1.FarmGridTile.TYPES.possibleFeedCow:
                        child.setType(FarmGridTile_1.FarmGridTile.TYPES.cow);
                        break;
                }
            }
        });
    }
    showBuildableCorn() {
        this.children.forEach(child => {
            if (child.isFree) {
                child.setType(FarmGridTile_1.FarmGridTile.TYPES.possibleCorn);
            }
        });
    }
    showBuildableChicken() {
        this.children.forEach(child => {
            if (child.isFree) {
                child.setType(FarmGridTile_1.FarmGridTile.TYPES.possibleChicken);
            }
        });
    }
    showBuildableCow() {
        this.children.forEach(child => {
            if (child.isFree) {
                child.setType(FarmGridTile_1.FarmGridTile.TYPES.possibleCow);
            }
        });
    }
    showFeedable() {
        this.children.forEach(child => {
            if (child.isFeedable) {
                switch (child.type) {
                    case FarmGridTile_1.FarmGridTile.TYPES.chicken:
                        child.setType(FarmGridTile_1.FarmGridTile.TYPES.possibleFeedChicken);
                        break;
                    case FarmGridTile_1.FarmGridTile.TYPES.cow:
                        child.setType(FarmGridTile_1.FarmGridTile.TYPES.possibleFeedCow);
                        break;
                }
            }
        });
    }
}
exports.FarmGrid = FarmGrid;


/***/ }),

/***/ "./src/FarmGridTile.ts":
/*!*****************************!*\
  !*** ./src/FarmGridTile.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FarmGridTile = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const ProgressBar_1 = __webpack_require__(/*! ./models/ProgressBar */ "./src/models/ProgressBar.ts");
const StrokeRect_1 = __webpack_require__(/*! ./models/StrokeRect */ "./src/models/StrokeRect.ts");
const Tile_1 = __webpack_require__(/*! ./models/Tile */ "./src/models/Tile.ts");
var FarmType;
(function (FarmType) {
    FarmType[FarmType["grass"] = 0] = "grass";
    FarmType[FarmType["possibleCorn"] = 1] = "possibleCorn";
    FarmType[FarmType["possibleChicken"] = 2] = "possibleChicken";
    FarmType[FarmType["possibleCow"] = 3] = "possibleCow";
    FarmType[FarmType["corn"] = 4] = "corn";
    FarmType[FarmType["chicken"] = 5] = "chicken";
    FarmType[FarmType["cow"] = 6] = "cow";
    FarmType[FarmType["possibleFeedChicken"] = 7] = "possibleFeedChicken";
    FarmType[FarmType["possibleFeedCow"] = 8] = "possibleFeedCow";
})(FarmType || (FarmType = {}));
class FarmGridTile extends Tile_1.Tile {
    constructor(options) {
        super(options);
        this._generated = 0;
        this._food = 1;
        this.grassOptions = {
            width: 40,
            height: 40,
            marginLeft: -20,
            marginTop: -20
        };
        this.cornOptions = {
            width: 26,
            height: 26,
            marginLeft: -13,
            marginTop: -13,
            animationSpeed: 0.05,
            generateFactor: 1 / 10 / 1000
        };
        this.chickenOptions = {
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
            animationSpeed: 0.05,
            generateFactor: 1 / 10 / 1000,
            eatFactor: 1 / 30 / 1000
        };
        this.cowOptions = {
            width: 36,
            height: 36,
            marginLeft: -18,
            marginTop: -18,
            animationSpeed: 0.05,
            generateFactor: 1 / 20 / 1000,
            eatFactor: 1 / 20 / 1000
        };
        this.foodOptions = {
            width: 30,
            height: 3,
            marginLeft: -15,
            marginTop: 10
        };
        this.generateOptions = {
            width: 30,
            height: 3,
            marginLeft: -15,
            marginTop: -13
        };
        this.rectOptions = {
            width: 30,
            height: 20,
            marginLeft: 5,
            marginTop: 10,
            color: 0xeec643
        };
        this.handleFarmTick = (deltaMS) => {
            switch (this.type) {
                case FarmType.corn:
                    this.generate({
                        deltaMS, generateFactor: this.cornOptions.generateFactor
                    });
                    break;
                case FarmType.chicken:
                case FarmType.possibleFeedChicken:
                    this.eatAndGenerate({
                        deltaMS, eatFactor: this.chickenOptions.eatFactor, generateFactor: this.chickenOptions.generateFactor
                    });
                    break;
                case FarmType.cow:
                case FarmType.possibleFeedCow:
                    this.eatAndGenerate({
                        deltaMS, eatFactor: this.cowOptions.eatFactor, generateFactor: this.cowOptions.generateFactor
                    });
                    break;
            }
            this.updateProgressBars();
        };
        this.setup(options);
        this.setType(FarmType.grass);
    }
    setup({ grassTextureResource, cornBuildableTextureResource, chickenBuildableTextureResource, cowBuildableTextureResource, cornAnimatedTextureResources, chickenAnimatedTextureResources, cowAnimatedTextureResources }) {
        const { grassOptions, cornOptions, chickenOptions, cowOptions, rectOptions } = this;
        const xCenter = this.posX + Math.round(this.width / 2);
        const yCenter = this.posY + Math.round(this.height / 2);
        const grassSprite = new pixi_js_1.Sprite(grassTextureResource);
        grassSprite.width = grassOptions.width;
        grassSprite.height = grassOptions.height;
        grassSprite.position.x = xCenter + grassOptions.marginLeft;
        grassSprite.position.y = yCenter + grassOptions.marginTop;
        grassSprite.alpha = 0.5;
        this.addChild(grassSprite);
        const cornBuildableSprite = new pixi_js_1.Sprite(cornBuildableTextureResource);
        cornBuildableSprite.width = cornOptions.width;
        cornBuildableSprite.height = cornOptions.height;
        cornBuildableSprite.position.x = xCenter + cornOptions.marginLeft;
        cornBuildableSprite.position.y = yCenter + cornOptions.marginTop;
        this.addChild(cornBuildableSprite);
        this.cornBuildableSprite = cornBuildableSprite;
        const chickenBuildableSprite = new pixi_js_1.Sprite(chickenBuildableTextureResource);
        chickenBuildableSprite.width = chickenOptions.width;
        chickenBuildableSprite.height = chickenOptions.height;
        chickenBuildableSprite.position.x = xCenter + chickenOptions.marginLeft;
        chickenBuildableSprite.position.y = yCenter + chickenOptions.marginTop;
        this.addChild(chickenBuildableSprite);
        this.chickenBuildableSprite = chickenBuildableSprite;
        const cowBuildableSprite = new pixi_js_1.Sprite(cowBuildableTextureResource);
        cowBuildableSprite.width = cowOptions.width;
        cowBuildableSprite.height = cowOptions.height;
        cowBuildableSprite.position.x = xCenter + cowOptions.marginLeft;
        cowBuildableSprite.position.y = yCenter + cowOptions.marginTop;
        this.addChild(cowBuildableSprite);
        this.cowBuildableSprite = cowBuildableSprite;
        const cornAnimatedSprite = new pixi_js_1.AnimatedSprite(cornAnimatedTextureResources);
        cornAnimatedSprite.animationSpeed = cornOptions.animationSpeed * Math.random();
        cornAnimatedSprite.width = cornOptions.width;
        cornAnimatedSprite.height = cornOptions.height;
        cornAnimatedSprite.position.x = xCenter + cornOptions.marginLeft;
        cornAnimatedSprite.position.y = yCenter + cornOptions.marginTop;
        cornAnimatedSprite.play();
        this.addChild(cornAnimatedSprite);
        this.cornAnimatedSprite = cornAnimatedSprite;
        const chickenAnimatedSprite = new pixi_js_1.AnimatedSprite(chickenAnimatedTextureResources);
        chickenAnimatedSprite.animationSpeed = chickenOptions.animationSpeed * Math.random();
        chickenAnimatedSprite.width = chickenOptions.width;
        chickenAnimatedSprite.height = chickenOptions.height;
        chickenAnimatedSprite.position.x = xCenter + chickenOptions.marginLeft;
        chickenAnimatedSprite.position.y = yCenter + chickenOptions.marginTop;
        chickenAnimatedSprite.play();
        this.addChild(chickenAnimatedSprite);
        this.chickenAnimatedSprite = chickenAnimatedSprite;
        const cowAnimatedSprite = new pixi_js_1.AnimatedSprite(cowAnimatedTextureResources);
        cowAnimatedSprite.animationSpeed = cowOptions.animationSpeed * Math.random();
        cowAnimatedSprite.width = cowOptions.width;
        cowAnimatedSprite.height = cowOptions.height;
        cowAnimatedSprite.position.x = xCenter + cowOptions.marginLeft;
        cowAnimatedSprite.position.y = yCenter + cowOptions.marginTop;
        cowAnimatedSprite.play();
        this.addChild(cowAnimatedSprite);
        this.cowAnimatedSprite = cowAnimatedSprite;
        const rectGraphics = new StrokeRect_1.StrokeRect({
            x: this.posX + rectOptions.marginLeft,
            y: this.posY + rectOptions.marginTop,
            width: rectOptions.width,
            height: rectOptions.height,
            color: rectOptions.color,
            strokeWidth: 2
        });
        this.addChild(rectGraphics);
        this.rectGraphics = rectGraphics;
    }
    hideAllSprites() {
        const sprites = [
            this.cornBuildableSprite, this.chickenBuildableSprite, this.cowBuildableSprite,
            this.cornAnimatedSprite, this.chickenAnimatedSprite, this.cowAnimatedSprite,
            this.rectGraphics
        ];
        sprites.forEach(sprite => { sprite.visible = false; });
    }
    setType(type) {
        switch (type) {
            case FarmType.grass:
                this.hideAllSprites();
                break;
            case FarmType.possibleCorn:
                this.hideAllSprites();
                this.cornBuildableSprite.visible = true;
                break;
            case FarmType.possibleChicken:
                this.hideAllSprites();
                this.chickenBuildableSprite.visible = true;
                break;
            case FarmType.possibleCow:
                this.hideAllSprites();
                this.cowBuildableSprite.visible = true;
                break;
            case FarmType.corn:
                this.hideAllSprites();
                this.cornAnimatedSprite.visible = true;
                this.appendProgressBars();
                break;
            case FarmType.chicken:
                this.hideAllSprites();
                this.chickenAnimatedSprite.visible = true;
                this.appendProgressBars();
                break;
            case FarmType.cow:
                this.hideAllSprites();
                this.cowAnimatedSprite.visible = true;
                this.appendProgressBars();
                break;
            case FarmType.possibleFeedChicken:
            case FarmType.possibleFeedCow:
                this.rectGraphics.visible = true;
                break;
        }
        this.type = type;
    }
    appendProgressBars() {
        const xCenter = this.posX + Math.round(this.width / 2);
        const yCenter = this.posY + Math.round(this.height / 2);
        const { type, foodOptions, generateOptions, _food, _generated } = this;
        if ([
            FarmType.possibleCorn,
            FarmType.possibleChicken,
            FarmType.possibleCow
        ].includes(type)) {
            const typeToMinColor = {
                [FarmType.possibleCorn]: 0xeec643,
                [FarmType.possibleChicken]: 0xeef0f2,
                [FarmType.possibleCow]: 0x0d21a1
            };
            this.generateProgress = new ProgressBar_1.ProgressBar({
                x: xCenter + generateOptions.marginLeft,
                y: yCenter + generateOptions.marginTop,
                width: generateOptions.width,
                height: generateOptions.height,
                value: _generated,
                minColor: typeToMinColor[type],
                maxColor: typeToMinColor[type]
            });
            this.addChild(this.generateProgress);
        }
        if ([
            FarmType.possibleChicken,
            FarmType.possibleCow
        ].includes(type)) {
            this.foodProgress = new ProgressBar_1.ProgressBar({
                x: xCenter + foodOptions.marginLeft,
                y: yCenter + foodOptions.marginTop,
                width: foodOptions.width,
                height: foodOptions.height,
                value: _food,
                minColor: 0xff0000,
                maxColor: 0x00ff00
            });
            this.addChild(this.foodProgress);
        }
    }
    get isFree() {
        return [
            FarmType.grass,
            FarmType.possibleCorn,
            FarmType.possibleChicken,
            FarmType.possibleCow
        ].includes(this.type);
    }
    get isOccupied() {
        return [
            FarmType.corn,
            FarmType.chicken,
            FarmType.cow,
            FarmType.possibleFeedChicken,
            FarmType.possibleFeedCow
        ].includes(this.type);
    }
    get isFeedable() {
        return [
            FarmType.chicken,
            FarmType.cow,
            FarmType.possibleFeedChicken,
            FarmType.possibleFeedCow
        ].includes(this.type);
    }
    generate({ deltaMS, generateFactor }) {
        if (this._generated > 1) {
            this._generated = 1;
        }
        else if (this._generated === 1) {
            // skip grow ??
        }
        else {
            this._generated += deltaMS * generateFactor;
        }
    }
    eatAndGenerate({ deltaMS, eatFactor, generateFactor }) {
        let spentFood = 0;
        const deltaFood = deltaMS * eatFactor;
        if (this._food > 0) {
            const wasFood = this._food;
            this._food -= deltaFood;
            if (this._food <= 0) {
                this._food = 0;
                spentFood = wasFood;
            }
            else {
                spentFood = deltaFood;
            }
        }
        this._generated += spentFood / eatFactor * generateFactor;
        if (this._generated > 1) {
            this._generated = 1; // limit ??
        }
    }
    updateProgressBars() {
        if (this.generateProgress != null) {
            this.generateProgress.update(this._generated);
            if (this._generated >= 1) {
                this.generateProgress.initHeight = 10;
                this.generateProgress.initWidth = 10;
                this.generateProgress.alpha = 1;
            }
            else {
                this.generateProgress.alpha = 0.5;
                this.generateProgress.initHeight = this.generateOptions.height;
                this.generateProgress.initWidth = this.generateOptions.width;
            }
        }
        if (this.foodProgress != null) {
            this.foodProgress.update(this._food);
        }
    }
    harvest() {
        if (this._generated >= 1) {
            this._generated -= 1;
            return 1;
        }
        return 0;
    }
    feed(value) {
        this._food += value;
        if (this._food > 1) {
            this._food = 1;
        }
    }
}
exports.FarmGridTile = FarmGridTile;
FarmGridTile.TYPES = FarmType;


/***/ }),

/***/ "./src/GameLoader.ts":
/*!***************************!*\
  !*** ./src/GameLoader.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameLoader = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
class GameLoader {
    constructor() {
        this.loader = pixi_js_1.Assets;
    }
    async loadAll() {
        await this.loadSettings();
        await this.loadResources();
    }
    async loadSettings() {
        this.settings = await fetch('settings.json').then(async (res) => await res.json());
    }
    async loadResources() {
        this.loader.add('tileset', 'assets/spritesheets/spritesheet.json');
        this.spritesheet = await this.loader.load('tileset');
    }
}
exports.GameLoader = GameLoader;


/***/ }),

/***/ "./src/ShopBar.ts":
/*!************************!*\
  !*** ./src/ShopBar.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShopBar = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/logger.ts");
const ShopTile_1 = __webpack_require__(/*! ./ShopTile */ "./src/ShopTile.ts");
class ShopBar extends pixi_js_1.Container {
    constructor(options) {
        super();
        this.widthCells = 3;
        this.heightCells = 1;
        this.cellWidth = 100;
        this.cellHeight = 40;
        this.cornOptions = {
            cost: 5,
            icon: {
                width: 30,
                height: 30,
                marginLeft: -30,
                marginTop: -15
            }
        };
        this.chickenOptions = {
            cost: 10,
            icon: {
                width: 30,
                height: 30,
                marginLeft: -25,
                marginTop: -15
            }
        };
        this.cowOptions = {
            cost: 30,
            icon: {
                width: 50,
                height: 50,
                marginLeft: -40,
                marginTop: -25
            }
        };
        this.idxToCost = {
            0: this.cornOptions.cost,
            1: this.chickenOptions.cost,
            2: this.cowOptions.cost
        };
        this.handleTileClick = (tile) => {
            this.children.forEach(child => {
                if (child !== tile) {
                    child.deselect();
                }
            });
            if (typeof this.onTileClick === 'function') {
                this.onTileClick(tile, this);
            }
        };
        this.onTileClick = options.onTileClick;
        this.setup(options);
    }
    get totalWidth() {
        return this.widthCells * this.cellWidth;
    }
    get totalHeight() {
        return this.heightCells * this.cellHeight;
    }
    setup({ textures: { money, corn, chicken, cow } }) {
        const idxToType = {
            0: ShopTile_1.ShopTile.TYPES.corn,
            1: ShopTile_1.ShopTile.TYPES.chicken,
            2: ShopTile_1.ShopTile.TYPES.cow
        };
        const idxToTexture = {
            0: corn,
            1: chicken,
            2: cow
        };
        const { widthCells, heightCells, cellWidth, cellHeight, cornOptions, chickenOptions, cowOptions, idxToCost } = this;
        const idxToWidth = {
            0: cornOptions.icon.width,
            1: chickenOptions.icon.width,
            2: cowOptions.icon.width
        };
        const idxToHeight = {
            0: cornOptions.icon.height,
            1: chickenOptions.icon.height,
            2: cowOptions.icon.height
        };
        const idxToMarginLeft = {
            0: cornOptions.icon.marginLeft,
            1: chickenOptions.icon.marginLeft,
            2: cowOptions.icon.marginLeft
        };
        const idxToMarginTop = {
            0: cornOptions.icon.marginTop,
            1: chickenOptions.icon.marginTop,
            2: cowOptions.icon.marginTop
        };
        for (let i = 0; i < widthCells; i++) {
            for (let j = 0; j < heightCells; j++) {
                const x = cellWidth * i;
                const y = cellHeight * j;
                const tile = new ShopTile_1.ShopTile({
                    id: `${i}_${j}`,
                    type: idxToType[i],
                    x: i > 0 ? x + i * 10 : x,
                    y,
                    width: cellWidth,
                    height: cellHeight,
                    onClick: this.handleTileClick,
                    cost: idxToCost[i],
                    itemTextureResource: idxToTexture[i],
                    moneyTextureResource: money,
                    iconOptions: {
                        width: idxToWidth[i],
                        height: idxToHeight[i],
                        marginLeft: idxToMarginLeft[i],
                        marginTop: idxToMarginTop[i]
                    }
                });
                (0, logger_1.logFarmShop)(`x=${x} y=${y} tx=${tile.x} ty=${tile.y} tw=${tile.width} th=${tile.height}`);
                this.addChild(tile);
            }
        }
    }
    deselectAll() {
        this.children.forEach(child => {
            child.deselect();
        });
    }
}
exports.ShopBar = ShopBar;


/***/ }),

/***/ "./src/ShopTile.ts":
/*!*************************!*\
  !*** ./src/ShopTile.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShopTile = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const Tile_1 = __webpack_require__(/*! ./models/Tile */ "./src/models/Tile.ts");
var ShopTileType;
(function (ShopTileType) {
    ShopTileType[ShopTileType["corn"] = 0] = "corn";
    ShopTileType[ShopTileType["chicken"] = 1] = "chicken";
    ShopTileType[ShopTileType["cow"] = 2] = "cow";
})(ShopTileType || (ShopTileType = {}));
class ShopTile extends Tile_1.Tile {
    constructor(options) {
        super(options);
        this.fontSize = 10;
        this.moneyOptions = {
            width: 10,
            height: 15,
            marginLeft: 10,
            marginTop: -7
        };
        this.textOptions = {
            marginLeft: 25,
            marginTop: -5
        };
        this.type = options.type;
        this.cost = options.cost;
        this.setup(options);
    }
    setup({ itemTextureResource, moneyTextureResource, iconOptions: { width, height, marginLeft, marginTop } }) {
        const { cost, fontSize, moneyOptions, textOptions } = this;
        const xCenter = this.posX + Math.round(this.width / 2);
        const yCenter = this.posY + Math.round(this.height / 2);
        const texture = new pixi_js_1.Sprite(itemTextureResource);
        texture.width = width;
        texture.height = height;
        texture.position.x = xCenter + marginLeft;
        texture.position.y = yCenter + marginTop;
        this.addChild(texture);
        const textIcon = new pixi_js_1.Sprite(moneyTextureResource);
        textIcon.width = moneyOptions.width;
        textIcon.height = moneyOptions.height;
        textIcon.position.x = xCenter + moneyOptions.marginLeft;
        textIcon.position.y = yCenter + moneyOptions.marginTop;
        this.addChild(textIcon);
        const text = new pixi_js_1.Text(cost, {
            fontFamily: 'Arial',
            fontSize,
            fill: 0x141414,
            align: 'center'
        });
        text.position.x = xCenter + textOptions.marginLeft;
        text.position.y = yCenter + textOptions.marginTop;
        this.addChild(text);
    }
}
exports.ShopTile = ShopTile;
ShopTile.TYPES = ShopTileType;


/***/ }),

/***/ "./src/StatusBar.ts":
/*!**************************!*\
  !*** ./src/StatusBar.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StatusBar = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/logger.ts");
const StatusBarTile_1 = __webpack_require__(/*! ./StatusBarTile */ "./src/StatusBarTile.ts");
class StatusBar extends pixi_js_1.Container {
    constructor(options) {
        super();
        this.widthCells = 4;
        this.heightCells = 1;
        this.cellWidth = 80;
        this.cellHeight = 40;
        this._initMoney = 100;
        this._initCorns = 0;
        this._initEggs = 0;
        this._initMilks = 0;
        this.eggCost = 2;
        this.milkCost = 5;
        this.idxToValue = {
            0: this._initMoney,
            1: this._initCorns,
            2: this._initEggs,
            3: this._initMilks
        };
        this.handleTileClick = (tile) => {
            this.children.forEach(child => {
                if (child !== tile) {
                    child.deselect();
                }
            });
            if (typeof this.onTileClick === 'function') {
                this.onTileClick(tile, this);
            }
        };
        this.onTileClick = options.onTileClick;
        this.setup(options);
    }
    get totalWidth() {
        return this.widthCells * this.cellWidth;
    }
    get totalHeight() {
        return this.heightCells * this.cellHeight;
    }
    get money() {
        return this.children[0].value;
    }
    get corn() {
        return this.children[1].value;
    }
    setup({ textures: { money, corn, egg, milk } }) {
        const idxToType = {
            0: StatusBarTile_1.StatusBarTile.TYPES.money,
            1: StatusBarTile_1.StatusBarTile.TYPES.corns,
            2: StatusBarTile_1.StatusBarTile.TYPES.eggs,
            3: StatusBarTile_1.StatusBarTile.TYPES.milks
        };
        const idxToTexture = {
            0: money,
            1: corn,
            2: egg,
            3: milk
        };
        const idxToHover = {
            0: false,
            1: true,
            2: true,
            3: true
        };
        const idxToSelected = {
            0: false,
            1: true,
            2: false,
            3: false
        };
        const { widthCells, heightCells, cellWidth, cellHeight, idxToValue } = this;
        for (let i = 0; i < widthCells; i++) {
            for (let j = 0; j < heightCells; j++) {
                const x = cellWidth * i;
                const y = cellHeight * j;
                const tile = new StatusBarTile_1.StatusBarTile({
                    id: `${i}_${j}`,
                    type: idxToType[i],
                    iconTextureResource: idxToTexture[i],
                    x,
                    y,
                    width: cellWidth,
                    height: cellHeight,
                    showSelected: idxToSelected[i],
                    value: idxToValue[i],
                    onClick: this.handleTileClick,
                    showHover: idxToHover[i],
                    isButtonMode: i !== 0,
                    isInteractive: i !== 0
                });
                (0, logger_1.logFarmStatus)(`x=${x} y=${y} tx=${tile.x} ty=${tile.y} tw=${tile.width} th=${tile.height}`);
                this.addChild(tile);
            }
        }
    }
    addMoney(value) {
        this.children[0].add(value);
    }
    subMoney(value) {
        this.children[0].sub(value);
    }
    addCorn(value) {
        this.children[1].add(value);
    }
    subCorn(value) {
        this.children[1].sub(value);
    }
    addEgg(value) {
        this.children[2].add(value);
    }
    sellEggs() {
        this.children[0].add(this.children[2].value * this.eggCost);
        this.children[2].updateValue(0);
    }
    addMilk(value) {
        this.children[3].add(value);
    }
    sellMilks() {
        this.children[0].add(this.children[3].value * this.milkCost);
        this.children[3].updateValue(0);
    }
    deselectAll() {
        this.children.forEach(child => {
            child.deselect();
        });
    }
}
exports.StatusBar = StatusBar;


/***/ }),

/***/ "./src/StatusBarTile.ts":
/*!******************************!*\
  !*** ./src/StatusBarTile.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StatusBarTile = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const Tile_1 = __webpack_require__(/*! ./models/Tile */ "./src/models/Tile.ts");
var StatusType;
(function (StatusType) {
    StatusType[StatusType["money"] = 0] = "money";
    StatusType[StatusType["corns"] = 1] = "corns";
    StatusType[StatusType["eggs"] = 2] = "eggs";
    StatusType[StatusType["milks"] = 3] = "milks";
})(StatusType || (StatusType = {}));
class StatusBarTile extends Tile_1.Tile {
    constructor(options) {
        super(options);
        this.iconOptions = {
            width: 16,
            height: 24,
            marginLeft: -25,
            marginTop: -12
        };
        this.textOptions = {
            fontSize: 20,
            color: 0x141414,
            marginLeft: 0,
            marginTop: -10
        };
        this._value = 0;
        this.type = options.type;
        this._value = options.value;
        this.setup(options);
    }
    get value() {
        return this._value;
    }
    setup({ iconTextureResource }) {
        const { _value, iconOptions, textOptions } = this;
        const xCenter = this.posX + Math.round(this.width / 2);
        const yCenter = this.posY + Math.round(this.height / 2);
        const texture = new pixi_js_1.Sprite(iconTextureResource);
        texture.width = iconOptions.width;
        texture.height = iconOptions.height;
        texture.position.x = xCenter + iconOptions.marginLeft;
        texture.position.y = yCenter + iconOptions.marginTop;
        this.addChild(texture);
        const text = new pixi_js_1.Text(_value, {
            fontFamily: 'Arial',
            fontSize: textOptions.fontSize,
            fill: textOptions.color,
            align: 'center'
        });
        text.position.x = xCenter + textOptions.marginLeft;
        text.position.y = yCenter + textOptions.marginTop;
        this.addChild(text);
        this._text = text;
    }
    updateValue(value) {
        this._value = value;
        this._text.text = value;
    }
    add(value) {
        this.updateValue(this._value + value);
    }
    sub(value) {
        this.updateValue(this._value - value);
    }
}
exports.StatusBarTile = StatusBarTile;
StatusBarTile.TYPES = StatusType;


/***/ }),

/***/ "./src/World.ts":
/*!**********************!*\
  !*** ./src/World.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.World = void 0;
const FarmGrid_1 = __webpack_require__(/*! ./FarmGrid */ "./src/FarmGrid.ts");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/logger.ts");
const StatusBar_1 = __webpack_require__(/*! ./StatusBar */ "./src/StatusBar.ts");
const ShopBar_1 = __webpack_require__(/*! ./ShopBar */ "./src/ShopBar.ts");
const ShopTile_1 = __webpack_require__(/*! ./ShopTile */ "./src/ShopTile.ts");
const FarmGridTile_1 = __webpack_require__(/*! ./FarmGridTile */ "./src/FarmGridTile.ts");
const StatusBarTile_1 = __webpack_require__(/*! ./StatusBarTile */ "./src/StatusBarTile.ts");
var UIState;
(function (UIState) {
    UIState[UIState["idle"] = 0] = "idle";
    UIState[UIState["toBuildCorn"] = 1] = "toBuildCorn";
    UIState[UIState["toBuildChicken"] = 2] = "toBuildChicken";
    UIState[UIState["toBuildCow"] = 3] = "toBuildCow";
    UIState[UIState["toFeedCorn"] = 4] = "toFeedCorn";
})(UIState || (UIState = {}));
class World {
    constructor({ app, gameLoader }) {
        this.resizeTimeout = 300;
        this._state = UIState.idle;
        this.resizeDeBounce = () => {
            this.cancelScheduledResizeHandler();
            this.scheduleResizeHandler();
        };
        this.handleFramGridClick = (tile) => {
            switch (this._state) {
                case UIState.idle:
                    if (tile.isOccupied) {
                        const result = tile.harvest();
                        if (result !== 0) {
                            switch (tile.type) {
                                case FarmGridTile_1.FarmGridTile.TYPES.corn:
                                    this.statusBar.addCorn(result);
                                    break;
                                case FarmGridTile_1.FarmGridTile.TYPES.chicken:
                                    this.statusBar.addEgg(result);
                                    break;
                                case FarmGridTile_1.FarmGridTile.TYPES.cow:
                                    this.statusBar.addMilk(result);
                                    break;
                            }
                        }
                    }
                    break;
                case UIState.toBuildCorn:
                case UIState.toBuildChicken:
                case UIState.toBuildCow:
                    if (tile.isFree) {
                        let newType = null;
                        let cost = 0;
                        switch (this._state) {
                            case UIState.toBuildCorn:
                                newType = FarmGridTile_1.FarmGridTile.TYPES.corn;
                                cost = this.shopBar.cornOptions.cost;
                                break;
                            case UIState.toBuildChicken:
                                newType = FarmGridTile_1.FarmGridTile.TYPES.chicken;
                                cost = this.shopBar.chickenOptions.cost;
                                break;
                            case UIState.toBuildCow:
                                newType = FarmGridTile_1.FarmGridTile.TYPES.cow;
                                cost = this.shopBar.cowOptions.cost;
                                break;
                        }
                        if (newType != null) {
                            tile.setType(newType);
                            this.statusBar.subMoney(cost);
                        }
                        if (this.statusBar.money >= cost) {
                            // continue
                        }
                        else {
                            this.shopBar.deselectAll();
                            this.setUIState(UIState.idle);
                        }
                    }
                    break;
                case UIState.toFeedCorn:
                    if (tile.isFeedable) {
                        tile.feed(1);
                        this.statusBar.subCorn(1);
                        if (this.statusBar.corn >= 1) {
                            // continue
                        }
                        else {
                            this.statusBar.deselectAll();
                            this.setUIState(UIState.idle);
                        }
                    }
                    break;
            }
        };
        this.handleStatusBarClick = (tile) => {
            if (tile.isSelected && tile.type === StatusBarTile_1.StatusBarTile.TYPES.corns) {
                if (tile.value >= 1) {
                    this.shopBar.deselectAll();
                    this.setUIState(UIState.toFeedCorn);
                }
                else {
                    this.statusBar.deselectAll();
                }
            }
            else {
                this.setUIState(UIState.idle);
            }
            switch (tile.type) {
                case StatusBarTile_1.StatusBarTile.TYPES.eggs:
                    this.statusBar.sellEggs();
                    break;
                case StatusBarTile_1.StatusBarTile.TYPES.milks:
                    this.statusBar.sellMilks();
                    break;
            }
        };
        this.handleShopBarClick = (tile) => {
            this.statusBar.deselectAll();
            if (tile.isSelected) {
                if (tile.cost > 0 && this.statusBar.money >= tile.cost) {
                    switch (tile.type) {
                        case ShopTile_1.ShopTile.TYPES.corn:
                            this.setUIState(UIState.toBuildCorn);
                            break;
                        case ShopTile_1.ShopTile.TYPES.chicken:
                            this.setUIState(UIState.toBuildChicken);
                            break;
                        case ShopTile_1.ShopTile.TYPES.cow:
                            this.setUIState(UIState.toBuildCow);
                            break;
                    }
                }
                else {
                    this.shopBar.deselectAll();
                }
            }
            else {
                this.setUIState(UIState.idle);
            }
        };
        this.handleAppTick = () => {
            this.farmGrid.handleWorldTick(this.app.ticker.deltaMS);
        };
        this.app = app;
        this.gameLoader = gameLoader;
        this.app.ticker.add(this.handleAppTick);
    }
    setup() {
        this.setupCanvas();
        this.setupLayout();
        this.resizeHandler();
    }
    setupCanvas() {
        document.body.appendChild(this.app.view);
        window.addEventListener('resize', this.resizeDeBounce);
    }
    setupLayout() {
        const { textures, animations } = this.gameLoader.spritesheet;
        this.statusBar = new StatusBar_1.StatusBar({
            textures: {
                money: textures['icon-money.png'],
                corn: textures['icon-corn.png'],
                egg: textures['icon-egg.png'],
                milk: textures['icon-milk.png']
            },
            onTileClick: this.handleStatusBarClick
        });
        this.app.stage.addChild(this.statusBar);
        this.farmGrid = new FarmGrid_1.FarmGrid({
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
        });
        this.farmGrid.y = this.statusBar.y + this.statusBar.totalHeight;
        this.app.stage.addChild(this.farmGrid);
        this.shopBar = new ShopBar_1.ShopBar({
            textures: {
                money: textures['icon-money.png'],
                corn: animations.corn[0],
                chicken: animations.chicken[0],
                cow: animations.cow[0]
            },
            onTileClick: this.handleShopBarClick
        });
        this.app.stage.addChild(this.shopBar);
        this.shopBar.y = this.farmGrid.y + this.farmGrid.totalHeight;
    }
    cancelScheduledResizeHandler() {
        clearTimeout(this.resizeTimeoutId);
    }
    scheduleResizeHandler() {
        this.resizeTimeoutId = setTimeout(() => {
            this.cancelScheduledResizeHandler();
            this.resizeHandler();
        }, this.resizeTimeout);
    }
    resizeHandler() {
        const { view } = this.app;
        const availableWidth = view.width;
        const availableHeight = view.height;
        const totalWidth = this.farmGrid.totalWidth;
        const totalHeight = (this.statusBar.totalHeight + this.farmGrid.totalHeight + this.shopBar.totalHeight);
        let scale = 1;
        if (totalHeight >= totalWidth) {
            scale = availableHeight / totalHeight;
            if (scale * totalWidth > availableWidth) {
                scale = availableWidth / totalWidth;
            }
            (0, logger_1.logFarmLayout)(`By height (sc=${scale})`);
        }
        else {
            scale = availableWidth / totalWidth;
            (0, logger_1.logFarmLayout)(`By width (sc=${scale})`);
            if (scale * totalHeight > availableHeight) {
                scale = availableHeight / totalHeight;
            }
        }
        const occupiedWidth = Math.floor(totalWidth * scale);
        const occupiedHeight = Math.floor(totalHeight * scale);
        const x = availableWidth > occupiedWidth ? (availableWidth - occupiedWidth) / 2 : 0;
        const y = availableHeight > occupiedHeight ? (availableHeight - occupiedHeight) / 2 : 0;
        (0, logger_1.logFarmLayout)(`aw=${availableWidth} (ow=${occupiedWidth}) x=${x} ah=${availableHeight} (oh=${occupiedHeight}) y=${y}`);
        this.app.stage.x = x;
        this.app.stage.width = occupiedWidth;
        this.app.stage.y = y;
        this.app.stage.height = occupiedHeight;
        (0, logger_1.logFarmLayout)(`x=${x} y=${y} stgw=${this.app.stage.width} stgh=${this.app.stage.height}`);
    }
    setUIState(state) {
        switch (state) {
            case UIState.idle:
                this.farmGrid.showFree();
                break;
            case UIState.toBuildCorn:
                this.farmGrid.showBuildableCorn();
                break;
            case UIState.toBuildChicken:
                this.farmGrid.showBuildableChicken();
                break;
            case UIState.toBuildCow:
                this.farmGrid.showBuildableCow();
                break;
            case UIState.toFeedCorn:
                this.farmGrid.showFeedable();
                break;
        }
        this._state = state;
    }
}
exports.World = World;


/***/ }),

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const World_1 = __webpack_require__(/*! ./World */ "./src/World.ts");
const GameLoader_1 = __webpack_require__(/*! ./GameLoader */ "./src/GameLoader.ts");
async function run() {
    const gameLoader = new GameLoader_1.GameLoader();
    await gameLoader.loadAll();
    const app = new pixi_js_1.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xe6e7ea,
        resizeTo: window
    });
    const world = new World_1.World({ app, gameLoader });
    world.setup();
}
run().catch(console.error);


/***/ }),

/***/ "./src/logger.ts":
/*!***********************!*\
  !*** ./src/logger.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logFarmProgress = exports.logFarmShop = exports.logFarmStatus = exports.logFarmLayout = exports.logFarmTile = exports.logFarmGrid = void 0;
const debug_1 = __importDefault(__webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js"));
exports.logFarmGrid = (0, debug_1.default)('farm-grid');
exports.logFarmTile = (0, debug_1.default)('farm-tile');
exports.logFarmLayout = (0, debug_1.default)('farm-layout');
exports.logFarmStatus = (0, debug_1.default)('farm-status');
exports.logFarmShop = (0, debug_1.default)('farm-shop');
exports.logFarmProgress = (0, debug_1.default)('farm-progress');


/***/ }),

/***/ "./src/models/ProgressBar.ts":
/*!***********************************!*\
  !*** ./src/models/ProgressBar.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProgressBar = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const logger_1 = __webpack_require__(/*! ../logger */ "./src/logger.ts");
class ProgressBar extends pixi_js_1.Graphics {
    constructor({ x, y, width, height, value, minColor, maxColor }) {
        super();
        this.borderWidth = 1;
        this.initX = x;
        this.initY = y;
        this.initWidth = width;
        this.initHeight = height;
        this.minColor = minColor;
        this.minColorArray = this.numColorToArray(this.minColor);
        this.maxColor = maxColor;
        this.maxColorArray = this.numColorToArray(this.maxColor);
        this.update(value);
    }
    toHex(num) {
        let hex = num.toString(16);
        if (hex.length === 1) {
            hex = '0' + hex;
        }
        return hex;
    }
    numColorToArray(num) {
        const numStr = num.toString(16).padStart(6, '0');
        const r = Number.parseInt(numStr[0] + numStr[1], 16); // rgb >> 16;
        const g = Number.parseInt(numStr[2] + numStr[3], 16); // (rgb >> 8) % 256;
        const b = Number.parseInt(numStr[4] + numStr[5], 16); // rgb % 256;
        return [r, g, b];
    }
    interpolateColors(p) {
        const q = 1 - p;
        const [r1, g1, b1] = this.maxColorArray;
        const [r2, g2, b2] = this.minColorArray;
        const rr = Math.round(r1 * p + r2 * q);
        const rg = Math.round(g1 * p + g2 * q);
        const rb = Math.round(b1 * p + b2 * q);
        // return Number((rr << 16) + (rg << 8) + rb).toString(16)
        return this.toHex(rr) + this.toHex(rg) + this.toHex(rb);
    }
    update(value) {
        const { initX, initY, initWidth, initHeight, minColor, maxColor } = this;
        if (value >= 1) {
            value = 1;
        }
        else if (value <= 0) {
            value = 0;
        }
        this.clear();
        if (minColor === maxColor) {
            this.beginFill(minColor);
        }
        else {
            const colorStr = this.interpolateColors(value);
            const color = Number.parseInt(colorStr, 16);
            this.beginFill(color);
        }
        (0, logger_1.logFarmProgress)(`x=${initX} y=${initY} width=${initWidth} height=${initHeight}`);
        this.drawRect(initX, initY, Math.round(initWidth * value), initHeight);
        this.endFill();
    }
}
exports.ProgressBar = ProgressBar;


/***/ }),

/***/ "./src/models/StrokeRect.ts":
/*!**********************************!*\
  !*** ./src/models/StrokeRect.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StrokeRect = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
class StrokeRect extends pixi_js_1.Graphics {
    constructor(options) {
        super();
        this.setup(options);
    }
    setup({ x, y, width, height, color, strokeWidth = 1 }) {
        this.clear();
        this.beginFill(color);
        this.drawRect(x, y, width, height);
        this.endFill();
        this.beginHole();
        this.drawRect(x + strokeWidth, y + strokeWidth, width - strokeWidth * 2, height - strokeWidth * 2);
        this.endHole();
    }
}
exports.StrokeRect = StrokeRect;


/***/ }),

/***/ "./src/models/Tile.ts":
/*!****************************!*\
  !*** ./src/models/Tile.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tile = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const logger_1 = __webpack_require__(/*! ../logger */ "./src/logger.ts");
class Tile extends pixi_js_1.Container {
    constructor({ id, x, y, width, height, isInteractive = true, isButtonMode = true, showSelected = true, showHover = true, onClick }) {
        super();
        this.isSelected = false;
        this.buttonMode = true;
        this.cursor = 'pointer';
        this.handleClick = () => {
            this.toggle();
            if (typeof this.onClick === 'function') {
                this.onClick(this);
            }
        };
        this.handleMouseOver = () => {
            if (this.showHover) {
                if (this.showSelected && this.isSelected) {
                    // skip
                }
                else {
                    this.fillColor(Tile.COLORS.hover);
                }
            }
        };
        this.handleMouseOut = () => {
            if (this.showHover) {
                if (this.showSelected && this.isSelected) {
                    // skip
                }
                else {
                    this.fillColor(Tile.COLORS.regular);
                }
            }
        };
        this.graphics = new pixi_js_1.Graphics();
        this.addChild(this.graphics);
        this.interactive = isInteractive;
        this.buttonMode = isButtonMode;
        this.id = id;
        this.showSelected = showSelected;
        this.showHover = showHover;
        this.posX = x;
        this.posY = y;
        this.cellWidth = width;
        this.cellHeight = height;
        this.fillColor(Tile.COLORS.regular);
        this.on('mouseover', this.handleMouseOver);
        this.on('mouseout', this.handleMouseOut);
        this.onClick = onClick;
        this.on('pointerdown', this.handleClick);
    }
    fillColor(color) {
        this.graphics.clear();
        (0, logger_1.logFarmTile)(color);
        this.graphics.beginFill(color);
        (0, logger_1.logFarmTile)(this.posX, this.posY, this.cellWidth, this.cellHeight);
        this.graphics.drawRect(this.posX, this.posY, this.cellWidth, this.cellHeight);
        this.graphics.endFill();
    }
    select() {
        if (!this.isSelected) {
            this.isSelected = true;
        }
        if (this.showSelected && this.isSelected) {
            this.fillColor(Tile.COLORS.active);
        }
    }
    deselect() {
        if (this.isSelected) {
            this.isSelected = false;
        }
        if (this.showSelected && !this.isSelected) {
            this.fillColor(Tile.COLORS.regular);
        }
    }
    toggle() {
        if (this.isSelected) {
            this.deselect();
        }
        else {
            this.select();
        }
    }
}
exports.Tile = Tile;
Tile.COLORS = {
    regular: 0xffffff,
    active: 0x0d21a1,
    hover: 0x515BA1
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunksimple_html5_farm_game"] = self["webpackChunksimple_html5_farm_game"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.bundle.js.map
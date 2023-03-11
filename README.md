# Simple HTML5 (Typescript + PixiJS) Farm Game

# [DEMO](https://volodalexey.github.io/simple-html5-farm-game/)

Minimal functionality:
- farm field 8x8
- farm-cell can be one of: `corn`, `chicken`, `cow` or `empty`

Item properties:
- corn grows for 1 each 10 seconds
- with corn you can feed chicken or cow
- 1 corn feed `chiken` for 30 seconds
- 1 corn feed `cow` for 20 seconds
- if feeded chicken generates 1 `egg` each 10 seconds
- if feeded cow generates 1 `milk` each 20 seconds
- you can sell milk and egg

Game properties:
- render each item
- ability to place items on the field
- feed and generation bars (progress)

## Install node modules (Recommended NodeJS version v16)

```
npm i
```

## Run webpack dev server

```
npm run serve
```

## Open browser at [http://localhost:8866](http://localhost:8866)

## Assets
`src-texture` folder refers to [Free Texture Packer](http://free-tex-packer.com/download/)

- [Corn icon](https://thenounproject.com/icon/corn-1838227/)
- [Egg icon](https://thenounproject.com/icon/egg-153392/)
- [Money icon](https://thenounproject.com/icon/money-1524558/)
- [Milk icon](https://thenounproject.com/icon/cow-milk-3263282/)
- [Chicken](https://opengameart.org/sites/default/files/chicken_eat.png)
- [Cow](https://opengameart.org/sites/default/files/cow_eat.png)
- [Grass](https://butterymilk.itch.io/tiny-wonder-farm-asset-pack)
- [Corn](https://danaida.itch.io/free-growing-plants-pack-32x32)
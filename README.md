# GoMommy
ENS Marketplace - one stop shop to register, buy and sell ENSDomains utilizing 0x protocol.
Demo video (no sound) - [here](https://drive.google.com/file/d/1h_jI1mPeDgtVcDXJ_J3qq93r2Iry02H5/view)
Access the Marketplace - [http://134.209.87.109:8080/#](http://134.209.87.109:8080/#)

![](/public/gomommy.png)

## Architecture
In order to sell domain, user converts the ENSDomain to ENSToken (ERC721). After that user creates order to sell ENSToken for specified price.
After customer buys ENSToken, he can burn it and receive ENSDomain ownership.  
![](/public/Architecture.jpg)

## Project setup
Install dependencies
```
npm install
```
Compiles and deploy the staging application

```
npm run serve
```

Compiles and minifies for production
```
npm run build
```

Lints and fixes files
```
npm run lint
```

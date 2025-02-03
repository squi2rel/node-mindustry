# headless!
![119bdd7c63512d99cbf3767f4ecb94f3_2609178_linux](https://user-images.githubusercontent.com/102400902/211141113-7f2f7938-08ec-4120-9c6c-d28cf2e49be8.jpg)

# How to use
## join game
```javascript
const { Mindustry } = require('./node-mindustry/mindustry.js');
let c = new Mindustry();
c.netClient.on("connect",() => {
	c.netClient.join("username", "UUIDAAAAAAA=", "USIDAAAAAAA=");
	c.netClient.connectConfirm();
});
c.netClient.on("SendMessageCallPacket2", p => {
	console.log(p.message)
})
c.netClient.connect(6567, "127.0.0.1")
```

## join game and get map png
```javascript
  let { Mindustry }=require("mindustry");
  let c = new Mindustry();
  c.netClient.on("connect",()=>{
    c.netClient.join("username", "AAAAAAAAAAA=", "AAAAAAAAAAA=");
    c.events.on("WorldLoadEvent",() => {
      require("fs").writeFileSync("./map.png", c.world.toPNG())
    })
  });
  c.netClient.on("SendMessageCallPacket2", p => {
    console.log(p.message)
  })
  c.netClient.connect(3000,"130.61.78.82")
```

## get server info
```javascript
  require("mindustry").pingHost(3000,"130.61.78.82",(data,err)=>{//port,ip,callback
    if(err){
      console.error(err.stack)
    } else {
      console.log(JSON.stringify(data))
    }
  })
```

### work in progress...

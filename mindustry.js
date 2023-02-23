const dgram=require("dgram");
const net=require("net");
const lz4=require("lz4");
const crc32=require("crc-32");
const {EventEmitter}=require("events");
const zlib=require("zlib");

const debug=false;

class DataStream{
    #pos=0;
    #buf;
    #lim;
    constructor(length){
        this.#buf=Buffer.alloc(length);
        this.#lim=length
    }
    static allocate(length){
        return new this(length)
    }
    static from(buffer){
        let obj=new this(buffer.length);
        obj.put(buffer);
        obj.position(0);
        return obj
    }
    clear(){
        this.#pos=0;
        this.#lim=this.#buf.length;
        return this
    }
    get(bytes,offset,length){
        if(Buffer.isBuffer(bytes)){
            this.#buf.copy(bytes,offset,this.#pos,this.#pos+length);
            this.#pos+=length
        } else {
            let o=this.#pos;
            this.#pos=o+(bytes?bytes:1);
            return bytes?this.#buf.slice(o,bytes+o):this.#buf.slice(o,o+1)[0]
        }
    }
    getInt(){
        return this.get(4).readInt32BE()
    }
    limit(limit){
        if(limit!==undefined){
            this.#lim=limit;
            this.#pos=Math.min(this.#pos,limit);
            return this
        } else {
            return this.#lim
        }
    }
    remaining(){
        return this.#lim-this.#pos
    }
    getShort(){
        return this.get(2).readInt16BE()
    }
    getUShort(){
        return this.get(2).readUInt16BE()
    }
    position(pos){
        if(pos!==undefined){
            this.#pos=pos;
            return this
        } else {
            return this.#pos
        }
    }
    flip(){
        this.#lim=this.#pos;
        this.#pos=0;
        return this
    }
    put(data){
        if(Buffer.isBuffer(data)){
            let writeBytes=Math.min(this.remaining(),data.length);
            data.copy(this.#buf,this.#pos,0,writeBytes);
            this.#pos+=writeBytes;
            return writeBytes
        } else if(typeof(data)=="string"){
            return this.put(Buffer.from(data))
        } else if(data instanceof Array){
            return this.put(Buffer.from(data))
        } else if(data instanceof DataStream){
            data.position(data.position()+this.put(data._getBuffer(data.position())))
            return this
        } else {
            this.#buf[this.#pos]=data;
            this.#pos++;
            return this
        }
    }
    hasRemaining(){
        return this.remaining()!=0
    }
    capacity(){
        return this.#buf.length
    }
    putShort(data){
        this.#buf.writeInt16BE(data,this.#pos);
        this.#pos+=2;
        return this
    }
    putUShort(data){
        this.#buf.writeUInt16BE(data,this.#pos);
        this.#pos+=2;
        return this
    }
    array(){
        return this.#buf.toJSON().data
    }
    putInt(data){
        this.#buf.writeInt32BE(data,this.#pos);
        this.#pos+=4;
        return this
    }
    getInt(){
        let o=this.#pos?this.#pos:0;
        this.#pos=o+4;
        return this.#buf.readInt32BE(o)
    }
    toString(){
        return `DataStream[pos=${this.#pos},lim=${this.#lim},cap=${this.#buf.length}]`
    }
    _getBuffer(offset){
        return this.#buf.slice(offset===undefined?0:offset,this.#lim)
    }
    putLong(data){
        this.#buf.writeInt32BE((data&0xffffffff00000000)>>32,this.#pos);
        this.#buf.writeInt32BE(data>>32,this.#pos+4);
        this.#pos+=8;
        return this
    }
    putFloat(data){
        this.#buf.writeFloatBE(data,this.#pos);
        this.#pos+=4;
        return this
    }
    getFloat(){
        let o=this.#pos?this.#pos:0;
        this.#pos=o+4;
        return this.#buf.readFloatBE(o)
    }
    getDouble(){
        let o=this.#pos?this.#pos:0;
        this.#pos=o+8;
        return this.#buf.readDoubleBE(o)
    }
    getLong(){
        let o=this.#pos?this.#pos:0;
        this.#pos=o+8;
        let value=this.#buf.readInt32BE(o)<<32;
        return value|this.#buf.readInt32BE(o+4)
    }
    readString(){
        return this.get(this.getUShort()).toString()
    }
    writeString(buf){
        if(Buffer.isBuffer(buf)){
            this.putUShort(buf.length);
            this.put(buf)
        } else {
            this.writeString(Buffer.from(buf))
        }
    }
}

class Events{
    static #emitter=new EventEmitter();
    static on(name,func){
        Events.#emitter.on(name,func)
    }
    static fire(name,arg){
        Events.#emitter.emit(name,arg)
    }
}

class Tile{
    x;
    y;
    floor;
    overlay;
    block;
    constructor(x,y,f,o,w){
        this.x=x;
        this.y=y;
        this.floor=f;
        this.overlay=o;
        this.block=w
    }
}

class Tiles{
    width;
    height;
    array;
    constructor(w,h){
        this.width=w;
        this.height=h;
        this.array=[];
        this.array.length=w*h
    }
    set(x,y,tile){
        this.array[y*this.width+x]=tile
    }
}

class World{
    tiles;
    constructor(){
        this.tiles=new Tiles(0,0)
    }
    create(x,y,f,o,w){
        this.tiles.set(x,y,new Tile(x,y,f,o,w))
    }
    resize(w,h){
        if(this.tiles.width!=w||this.tiles.height!=h){
            this.tiles=new Tiles(w,h)
        }
        return this.tiles
    }
    toPNG(){
        const colors=[-1456134375,2139062041,1028227327,1196724223,1245278975,891900927,959597311,1953004287,892817919,370677759,1419621887,-1000131841,83890943,255,1111640063,1128482815,1010582271,825176063,1127756287,1749693951,-1484165121,808333055,1328622335,689444351,2021230335,1530474239,1496788223,1362242559,1917531903,1951217407,572926975,942813695,1010119679,691022847,757542911,976176127,-2124596993,-1958919681,-1840823041,-1045518081,1433418751,944321279,1109597721,387522329,674638105,1547183641,1814968089,521937433,1160456959,757547263,1417955839,-1128415233,-1279804417,-1566391553,-1667318785,1246127615,1446403327,1801145343,1446537471,2054848511,-1957259777,1883652351,-1600014081,-741212161,-268959745,1515805183,-895853825,-1536210689,1967471103,1145852415,1835228415,1314738431,1736726271,1784310271,-69409793,-1152165377,-478058983,-2114305,-185008129,1891330047,1920246015,-1840344039,-285737191,1520393241,-504693735,-690226919,-994903527,-579908071,1549313049,-427669479,2088534297,-268959975,2004527385,-2246375,-1448428007,1532647961,1196381209,1902534425,1365332761,-1603517159,1702974745,-2073198055,-1182878951,-811509223,2090623513,1733715481,-19078887,-1771812071,-1135257319,1431789823,1398038271,1347508991,1515939327,1566534399,1817726207,1010714623,1094600191,993805823,1128615935,1178815487,1313164543,2122354687,1212631833,1379162393,1348103167,-1818779137,-1902994433,-1987275521,-1970432513,-1550148353,-1363760385,-961503745,-1264150273,-1683899649,-1163024129,-1163417601,-1147562497,-1331912705,-1264935937,-1701071873,-2105175553,-1313167361,-1922011393,1936618265,1938062873,-2121686017,1904639743,-2004908033,-1803780353,-1802925825,-2004908033,-2055304961,-1601928193,-1602257665,-1770226663,-1887076097,-2054379777,-1618181889,-2005171457,-962887169,-946109953,2140139007,2123361535,-487483393,-605318913,-1904101889,-1904101889,-1984769,-2379777,-35815681,-35881217,-1616200961,-1666926849,-1515207911,-1447770087,-1481456129,-1481390337,-1616331521,1722252031,1587180287,-2105241089,2105511167,2038663679,-1538561,-1932289,-1534413313,-1669025537,-2379521,-1783191041,-1766413825,-1214144001,-1163944193,-1331058433,1499161881,-1853588455,-2106166247,-2138596071,-1803451111,-1819769063,-1836546279,1869708543,1735299839,1954179583,1751417855,-2122083841,2088602367,-1129602305,1852865791,2004056831,2021296383,2105511167,1886551807,2037743103,-1617059329,1970700799,-2037473281,-2122084609,2105510937,-2054910951,1937015295,-1936811751,-1938330369,-1163749889,-1567784423,-1752463591,-1533173479,-1801664999,-1885745383,-1734498817,-1952988673,-1970952193,-1768249345,-1717517313,-1767980033,-1380663553,-1515538945,-1818442241,2106032665,-2052356609,-1918594561,1921874201,1938127641,1904705049,1954709529,-994336743,-926965479,-776366081,-1583374593,-927490049,-978149889,-1113025281,-1113612545,-1213291265,-1045192705,-2055298561,-1936547329,-2138859777,-2105632001,-1315464705,1989180953,1954972441,1938653209,-1870823143,1820227609,1736143385,-1903853057,-1803582695,-1618048769,-1768184065,-1718045953,-1432838913,-1852263681,-1835817217,-1549098241,1854175769,-1803188993,-1383168513,-1618509057,-1820360167,-2138661607,-944330753,-843734785,-776626689,-1517123815,-1281849831,-1365866983,-1196446465,-1145983745,-1432115969,-1617983719,-1701999847,-1870494977,-2037870081,-1886480897,-1769239297,-1701536257,-1767915265,-1785090561,-1481851649,-1971948033,-1684692737,-1398164993,-2088198913,2088934399,-1937537281,-1852929281,-1987673345,-1920826113,-2021818369,1701999385,2003595801,1986887705,2003727385,1953989657,2037806617,1920303641,2138076185,-2106100199,-2139912167,-1853255425,-2104257537,-2121818113,-1987539201,-2004315905,-1987538945,-1970894081,2106428927,-2036689153,2003464191,1802075903,1836090111,1953000703,1785626367,1768324095,1987014911,-2123006977,1987283455,2004585727,2087676671,1921614105,1836088063,1987675647,1734964735,1600219903,2071098623,-2089190401,2070902015,-2123600385,1986949631,1970106623,1532586751,1683972351,-994926567,-1365538535,-1870761473,-1854049537,-1247438849,-1146512129,-1937604609,-1887403009,-1836611329,-1380795111,-1247371265,-1331058407,-2071750913,2071564543,-1600731879,-1600471015,-1600732135,-2072142337,-2072338689,1903265535,1751677951,1548899839,-1970894081,-911303655,-1802927361,-1970697473];
        let tiles=this.tiles;
        let width=tiles.width,height=tiles.height;
        let output=DataStream.allocate(width*height*4+30);
        let temp=DataStream.allocate(width*height*4+30);
        let flush=()=>{
            let buf=Buffer.alloc(4);
            buf.writeInt32BE(temp.position()-4);
            output.put(buf);
            temp.flip();
            output.put(temp._getBuffer());
            buf.writeInt32BE(crc32.buf(temp._getBuffer()));
            output.put(buf);
            temp.clear()
        };
        output.put([137,80,78,71,13,10,26,10]);
        temp.put("IHDR");
        temp.putInt(width);
        temp.putInt(height);
        temp.put([8,6,0,0,0]);
        flush();
        temp.put("IDAT");
        let pos=temp.position();
        for(let y=0;y<height;y++){
            for(let x=0;x<width;x++){
                let pos=y*width+x;
                let color=colors[tiles.array[pos].floor];
                temp.put((color>>24)&0xff);
                temp.put((color>>16)&0xff);
                temp.put((color>>8)&0xff);
                temp.put(color&0xff)
            }
        }
        temp.flip();
        let zipped=zlib.deflateSync(temp._getBuffer(pos));
        temp.limit(temp.capacity());
        temp.position(pos);
        temp.put(zipped);
        flush();
        temp.put("IEND");
        flush();
        output.flip();
        return output._getBuffer()
    }
}

var Packets=new Map();

class Packet{
    read(){}
    write(){}
    handled(){}
    handleServer(){}
    handleClient(){}
}

class TypeIO{
    static writeString(buf,string){
        if(string){
            buf.put(1);
            let strbuf=Buffer.from(string);
            buf.put(strbuf.length>>8);
            buf.put(strbuf.length&0xff);
            buf.put(strbuf)
        } else {
            buf.put(0)
        }
    }
    static readString(buf){
        let str=buf.get();
        if(str){
            return buf.get(buf.getUShort()).toString()
        } else {
            return null
        }
    }
    static writeKick(buf,reason){
        buf.put(reason.id)
    }
    static readKick(buf){
        return KickReason[buf.get()]
    }
    static readStrings(buf){
        let rows=buf._getBuffer(buf.position()).readUInt8();
        buf.position(buf.position()+1);

        let strings=[];
        for(let i=0;i<rows;i++){
            strings[i]=[];
            let columns=buf._getBuffer(buf.position()).readUInt8();
            buf.position(buf.position()+1);
            for(let j=0;j<columns;j++){
                strings[i][j]=this.readString(buf)
            }
        }
        return strings
    }
}

class KickReason{
    static kick=class extends KickReason{
        static id=0
    };
    static clientOutdated=class extends KickReason{
        static id=1
    };
    static serverOutdated=class extends KickReason{
        static id=2
    };
    static banned=class extends KickReason{
        static id=3
    };
    static gameover=class extends KickReason{
        static id=4
    };
    static recentKick=class extends KickReason{
        static id=5
    };
    static nameInUse=class extends KickReason{
        static id=6
    };
    static idInUse=class extends KickReason{
        static id=7
    };
    static nameEmpty=class extends KickReason{
        static id=8
    };
    static customClient=class extends KickReason{
        static id=9
    };
    static serverClose=class extends KickReason{
        static id=10
    };
    static vote=class extends KickReason{
        static id=11
    };
    static typeMismatch=class extends KickReason{
        static id=12
    };
    static whitelist=class extends KickReason{
        static id=13
    };
    static playerLimit=class extends KickReason{
        static id=14
    };
    static serverRestarting=class extends KickReason{
        static id=15
    }
}
{
    KickReason[0]=KickReason.kick;
    KickReason[1]=KickReason.clientOutdated;
    KickReason[2]=KickReason.serverOutdated;
    KickReason[3]=KickReason.banned;
    KickReason[4]=KickReason.gameover;
    KickReason[5]=KickReason.recentKick;
    KickReason[6]=KickReason.nameInUse;
    KickReason[7]=KickReason.idInUse;
    KickReason[8]=KickReason.nameEmpty;
    KickReason[9]=KickReason.customClient;
    KickReason[10]=KickReason.serverClose;
    KickReason[11]=KickReason.vote;
    KickReason[12]=KickReason.typeMismatch;
    KickReason[13]=KickReason.whitelist;
    KickReason[14]=KickReason.playerLimit;
    KickReason[15]=KickReason.serverRestarting
}

class StreamBegin extends Packet{
    _id=0;
    static #lastid=0;
    total;
    type;
    constructor(){
        super();
        this.id=StreamBegin.#lastid++
    }
    write(buf){
        buf.putInt(this.id);
        buf.putInt(this.total);
        buf.put(type)
    }
    read(buf){
        this.id=buf.getInt();
        this.total=buf.getInt();
        this.type=buf.get()
    }
}
Packets.set(0,StreamBegin);
class StreamChunk extends Packet{
    _id=1;
    id;
    data;
    write(buf){
        buf.putInt(this.id);
        buf.putShort(this.data.length);
        buffer.put(this.data)
    }
    read(buf){
        this.id=buf.getInt();
        this.data=buf.get(buf.getShort())
    }
}
Packets.set(1,StreamChunk);
class WorldStream extends Packet{
    stream;
    handleClient(nc){
        if(nc){
            nc.loadWorld(this)
        }
    }
}
Packets.set(2,WorldStream);
class ConnectPacket extends Packet{
    _id=3;
    name;
    usid;
    uuid;
    write(buf){
        buf.putInt(142);
        TypeIO.writeString(buf,"official");
        TypeIO.writeString(buf,this.name);
        TypeIO.writeString(buf,"Mars");
        TypeIO.writeString(buf,this.usid);
        let uuidbuf=Buffer.from(this.uuid,"base64");
        buf.put(uuidbuf);
        buf.putLong(crc32.buf(uuidbuf));
        buf.put(0);
        buf.put([0xff,0xa1,0x08,0xff]);
        buf.put(0)
    }
}
Packets.set(3,ConnectPacket);
class BeginBreakCallPacket extends Packet{
    _id=9;
    write(buf){
        //TODO
    }
    read(buf){
        //TODO
        buf.get();
        buf.getInt();
        buf.get();
        buf.getInt();
        buf.getInt()
    }
}
Packets.set(9,BeginBreakCallPacket);
class BeginPlaceCallPacket extends Packet{
    _id=10;
    write(buf){
        //TODO
    }
    read(buf){
        //TODO
    }
}
Packets.set(10,BeginPlaceCallPacket);
class ClientSnapshotCallPacket extends Packet{
    _id=19;
    snapshotID;
    write(buf){
        //TODO
        buf.putInt(this.snapshotID);
        buf.putInt(-1);
        buf.put(1);
        for(let i=0;i<8;i++){
            buf.putFloat(0)
        }
        buf.putInt(-1);
        for(let i=0;i<4;i++){
            buf.put(0)
        }
        buf.putInt(-1);
        buf.putFloat(0);
        buf.putFloat(0);
        buf.putFloat(1920);
        buf.putFloat(1080)
    }
}
Packets.set(19,ClientSnapshotCallPacket);
class ConnectConfirmCallPacket extends Packet{
    _id=23
}
Packets.set(23,ConnectConfirmCallPacket);
class DeconstructFinishCallPacket extends Packet{
    _id=29;
    write(buf){
        //TODO
    }
    read(buf){
        //TODO
        buf.getInt();
        buf.getShort();
        buf.get();
        buf.getInt()
    }
}
Packets.set(29,DeconstructFinishCallPacket);
class KickCallPacket extends Packet{
    _id=43;
    reason;
    write(buf){
        TypeIO.writeString(buf,this.reason)
    }
    read(buf){
        this.reason=TypeIO.readString(buf)
    }
}
Packets.set(43,KickCallPacket);
class KickCallPacket2 extends Packet{
    _id=44;
    reason;
    write(buf){
        TypeIO.writeKick(buf,reason)
    }
    read(buf){
        this.reason=TypeIO.readKick(buf)
    }
    handled(){
        console.log(this.reason)
    }
}
Packets.set(44,KickCallPacket2);
class MenuCallPacket extends Packet{
    _id=48;
    menuId;
    title;
    message;
    options;
    write(buf){
        //TODO
    }
    read(buf){
        this.menuId=buf.getInt();
        this.title=TypeIO.readString(buf);
        this.message=TypeIO.readString(buf);
        this.options=TypeIO.readStrings(buf)
    }
}
Packets.set(48,MenuCallPacket);
class MenuChooseCallPacket extends Packet{
    _id=49;
    player;
    menuId;
    option;
    write(buf){
        buf.putInt(this.menuId);
        buf.putInt(this.option)
    }
    read(buf){
        //TODO
    }
}
Packets.set(49,MenuChooseCallPacket);
class PingCallPacket extends Packet{
    _id=54;
    time;
    write(buf){
        buf.putLong(this.time)
    }
}
Packets.set(54,PingCallPacket);
class SendChatMessageCallPacket extends Packet{
    _id=69;
    message;
    write(buf){
        TypeIO.writeString(buf,this.message)
    }
}
Packets.set(69,SendChatMessageCallPacket);
class SendMessageCallPacket extends Packet{
    _id=70;
    message;
    write(buf){
        //TODO
    }
    read(buf){
        this.message=TypeIO.readString(buf)
    }
}
Packets.set(70,SendMessageCallPacket);
class SendMessageCallPacket2 extends Packet{
    _id=71;
    message;
    unformatted;
    playersender;
    write(buf){
        //TODO
    }
    read(buf){
        this.message=TypeIO.readString(buf);
        this.unformatted=TypeIO.readString(buf);
        this.playersender=buf.getInt()
    }
}
Packets.set(71,SendMessageCallPacket2);
class TransferItemToCallPacket extends Packet{
    _id=98;
    write(buf){
        //TODO
    }
    read(buf){
        //TODO
        buf.get();
        buf.getInt();
        buf.getShort();
        buf.getInt();
        buf.getFloat();
        buf.getFloat();
        buf.getInt()
    }
}
Packets.set(98,TransferItemToCallPacket);
class UnitControlCallPacket extends Packet{
    _id=104;
    player;
    unit;
    write(buf){
        //TODO
    }
    read(buf){
        //TODO
    }
}
Packets.set(104,UnitControlCallPacket);

class TCPConnection{
    #readBuffer;
    #writeBuffer;
    #serializer;
    #tcp;
    #connected;
    #timer;
    #objectLength;
    constructor(w,s,p){
        this.#writeBuffer=DataStream.allocate(w);
        this.#serializer=s;
        this.#tcp=new net.Socket();
        this.#tcp.setNoDelay(true);
        this.#connected=false;
        this.#tcp.on("connect",()=>{
            this.#timer=setInterval(()=>{
                this.send(new FrameworkMessage.KeepAlive())
            },8000)
        });
        this.#tcp.on("data",d=>{
            let res=this.readObject(d);
            p(res);
            while(res){
                res=this.readObject();
                p(res)
            }
        });
        this.#tcp.on("close",()=>{
            clearInterval(this.#timer)
        })
    }
    on(name,func){
        this.#tcp.on(name,func)
    }
    connect(port,ip){
        if(!this.#connected){
            this.#readBuffer=Buffer.alloc(0);
            this.#objectLength=0;
            this.#tcp.setTimeout(12000);
            this.#tcp.connect(port,ip);
            this.#tcp.ref();
            this.#connected=true
        } else {
            console.error("TCP already connected!")
        }
    }
    
    
    close(){
        if(this.#connected){
            this.#connected=false;
            this.#tcp.end();
            this.#tcp.unref()
        }
    }
    readObject(d){
        try{
            if(d){
                this.#readBuffer=Buffer.concat([this.#readBuffer,d])
            }
            let readBuffer=this.#readBuffer;
            if(this.#objectLength==0){
                if(readBuffer.length<2){
                    return null
                }
                this.#objectLength=readBuffer.readInt16BE()
            }
            let length=this.#objectLength;
            if(length<=0){
                throw new Error("Invalid object length: "+length)
            }
            if(readBuffer.length<length){
                return null
            }
            let buf=DataStream.from(readBuffer).position(2);
            buf.limit(length+2);
            let object=this.#serializer.read(buf);
            if(buf.position()-2!=length){
                if(debug){
                    console.error(`Broken TCP ${object?object.constructor.name+" ":""}packet!remaining ${length+2-buf.position()} bytes`)
                }
                this.#objectLength=0;
                this.#readBuffer=Buffer.alloc(0);
                return null
            }
            this.#objectLength=0;
            this.#readBuffer=readBuffer.slice(buf.position());
            return object
        }catch(e){
            console.error(e.stack);
            this.#objectLength=0;
            this.#readBuffer=Buffer.alloc(0);
            return null
        }
    }
    send(object){
        this.#writeBuffer.clear();
        this.#writeBuffer.position(2);
        this.#serializer.write(this.#writeBuffer,object);
        let length=this.#writeBuffer.position()-2;
        this.#writeBuffer.position(0);
        this.#writeBuffer.putShort(length);
        this.#writeBuffer.position(length+2);
        this.#writeBuffer.flip();
        this.#tcp.write(this.#writeBuffer._getBuffer());
        return length+2
    }
}

class UDPConnection{
    #writeBuffer;
    #serializer;
    #udp;
    #connected;
    #timer;
    constructor(w,s,p){
        this.#writeBuffer=DataStream.allocate(w);
        this.#serializer=s;
        this.#connected=false;
        this.#udp=dgram.createSocket("udp4",d=>{
            p(this.readObject(d))
        })
    }
    on(name,func){
        this.#udp.on(name,func)
    }
    connect(port,ip){
        if(!this.#connected){
            this.#writeBuffer.clear();
            this.#udp.connect(port,ip);
            this.#udp.ref();
            this.#connected=true;
            this.#timer=setInterval(()=>{
                this.send(new FrameworkMessage.KeepAlive())
            },19000)
        } else {
            console.error("UDP already connected!")
        }
    }
    close(){
        if(this.#connected){
            this.#connected=false;
            this.#udp.disconnect();
            this.#udp.unref();
            clearInterval(this.#timer)
        }
    }
    readObject(d){
        let buf=DataStream.from(d);
        let obj=this.#serializer.read(buf);
        if(buf.hasRemaining()){
            if(debug){
                console.error(`Broken UDP ${obj?obj.constructor.name+" ":""}packet!remaining ${buf.remaining()} bytes`)
            }
            return null
        }
        return obj
    }
    send(object){
        this.#writeBuffer.clear();
        this.#serializer.write(this.#writeBuffer,object);
        this.#writeBuffer.flip();
        let length=this.#writeBuffer.limit();
        this.#udp.send(this.#writeBuffer._getBuffer());
        return length
    }
}

class FrameworkMessage{
    static RegisterTCP=class extends FrameworkMessage{
        connectionID
    }
    static RegisterUDP=class extends FrameworkMessage{
        connectionID
    }
    static KeepAlive=class extends FrameworkMessage{}
}

class Client{
    #TCPRegistered=false;
    #UDPRegistered=false;
    #tcp;
    #udp;
    #event;
    #parser;
    constructor(w,s,p){
        this.#tcp=new TCPConnection(w,s,data=>{this.parse(data)});
        this.#udp=new UDPConnection(w,s,data=>{this.parse(data)});
        this.#event=new EventEmitter();
        this.#tcp.on("timeout",()=>{
            this.#event.emit("timeout")
        });
        this.#tcp.on("error",e=>{
            this.#event.emit("error",e)
        });
        this.#tcp.on("close",()=>{
            this.#event.emit("disconnect")
        });
        this.#parser=p
    }
    on(name,func){
        this.#event.on(name,func)
    }
    once(name,func){
        this.#event.once(name,func)
    }
    connect(port,ip){
        this.#tcp.connect(port,ip);
        this.#udp.connect(port,ip);
        setTimeout(()=>{
            if(!this.#UDPRegistered){
                this.close()
            }
        },10000)
    }
    sendTCP(obj){
        return this.#tcp.send(obj)
    }
    sendUDP(obj){
        return this.#udp.send(obj)
    }
    close(){
        this.#tcp.close();
        this.#udp.close();
        this.#TCPRegistered=false;
        this.#UDPRegistered=false
    }
    parse(packet){
        if(packet){
            if(!this.#TCPRegistered){
                if(packet instanceof FrameworkMessage.RegisterTCP){
                    this.#TCPRegistered=true;
                    let p=new FrameworkMessage.RegisterUDP();
                    p.connectionID=packet.connectionID;
                    this.sendUDP(p)
                }
            }
            if(!this.#UDPRegistered){
                if(packet instanceof FrameworkMessage.RegisterUDP){
                    this.#UDPRegistered=true;
                    this.#event.emit("connect")
                }
            }
            if(!(packet instanceof FrameworkMessage)){
                this.#parser(packet)
            }
        }
    }
}

class PacketSerializer{
    #temp;
    constructor(){
        this.#temp=DataStream.allocate(32768)
    }
    read(buf){
        try{
            let id=buf.get();
            if(id==254){
                return this.readFramework(buf)
            } else {
                if(Packets.get(id)){
                    let packet=new (Packets.get(id))();
                    let length=buf.getShort();
                    let compressed=buf.get();
                    this.#temp.clear();
                    if(compressed){
                        let size=buf.remaining();
                        lz4.decodeBlock(buf._getBuffer(buf.position()),this.#temp._getBuffer());
                        this.#temp.position(0);
                        this.#temp.limit(length);
                        packet.read(this.#temp,length);
                        buf.position(buf.position()+size)
                    } else {
                        this.#temp.position(0).limit(length);
                        this.#temp.put(buf._getBuffer(buf.position()));
                        this.#temp.position(0);
                        packet.read(this.#temp,length);
                        buf.position(buf.position()+this.#temp.position())
                    }
                    return packet
                } else if(debug){
                    console.error("Unknown packet id:"+id)
                }
                buf.clear();
            }
        }catch(e){ 
            console.error(e.stack)
        }
    }
    write(buf,object){
        if(Buffer.isBuffer(object)||(object instanceof DataStream)){
            buf.put(object)
        } else if(object instanceof FrameworkMessage){
            buf.put(-2);
            this.writeFramework(buf,object)
        } else if(object instanceof Packet){
            buf.put(object._id);
            this.#temp.clear();
            object.write(this.#temp);
            let length=this.#temp.position();
            buf.putShort(length);
            this.#temp.flip();
            if(length<36||object instanceof StreamChunk){
                buf.put(0);
                buf.put(this.#temp)
            } else {
                buf.put(1);
                let size=lz4.encodeBlock(this.#temp._getBuffer(),buf._getBuffer(buf.position()));
                buf.position(buf.position()+size)
            }
        } else {
            console.error("Invaild type:"+object.toString())
        }
    }
    writeLength(buf,len){
        buf.putShort(len)
    }
    writeFramework(buf,msg){
        if(msg instanceof FrameworkMessage.KeepAlive){
            buf.put(2)
        } else if(msg instanceof FrameworkMessage.RegisterUDP){
            buf.put(3);
            buf.putInt(msg.connectionID)
        } else if(msg instanceof FrameworkMessage.RegisterTCP) {
            buf.put(4);
            buf.putInt(msg.connectionID)
        }
    }
    readFramework(buf){
        let id=buf.get();
        if(id==0){
            
        } else if(id==1){
            
        } else if(id==2){
            return new FrameworkMessage.KeepAlive()
        } else if(id==3){
            let p=new FrameworkMessage.RegisterUDP();
            p.connectionID=buf.getInt();
            return p
        } else if(id==4){
            let p=new FrameworkMessage.RegisterTCP();
            p.connectionID=buf.getInt();
            return p
        } else {
            console.error("Unknown FrameworkMessage!")
        }
    }
}

class StreamBuilder{
    id;
    type;
    total;
    stream;
    constructor(packet){
        this.id=packet.id;
        this.type=packet.type;
        this.total=packet.total;
        this.stream=Buffer.alloc(0)
    }
    add(data){
        this.stream=Buffer.concat([this.stream,data])
    }
    isDone(){
        return this.stream.length>=this.total
    }
    build(){
        let s=new (Packets.get(this.type))();
        s.stream=this.stream;
        return s
    }
}

class NetworkIO{
    
}

class SaveIO{
    static readStringMap(buf){
        let map=new Map();
        let size=buf.getShort();
        for(let i=0;i<size;i++){
            map.set(buf.readString(),buf.readString())
        }
        return map
    }
    static readMap(buf,world){
        let width=buf.getUShort();
        let height=buf.getUShort();
        world.resize(width,height);
        let l=width*height;
        for(let i=0;i<l;i++){
            let x=i%width,y=Math.floor(i/width);
            let floorid=buf.getShort();
            let oreid=buf.getShort();
            let consecutives=buf.get();
            world.create(x,y,floorid,oreid,0);
            let l=i+1+consecutives;
            for(let j=i+1;j<l;j++){
                let x=j%width,y=Math.floor(j/width);
                world.create(x,y,floorid,oreid,0)
            }
            i+=consecutives
        }
    }
}

class NetClient{
    #client;
    #event;
    #streams;
    game;
    constructor(game){
        this.#client=new Client(8192,new PacketSerializer(),p=>{this.handleClientReceived(p)});
        this.#event=new EventEmitter();
        this.#client.on("timeout",()=>{
            console.log("timeout!");
            this.reset();
            this.#event.emit("timeout")
        });
        this.#client.on("error",e=>{
            this.reset();
            console.error(e.stack);
            this.#event.emit("error",e)
        });
        this.#client.on("connect",()=>{
            console.log("connected!");
            this.#event.emit("connect")
        });
        this.#client.on("disconnect",()=>{
            console.log("disconnected!");
            this.reset();
            this.#event.emit("disconnect")
        });
        this.game=game;
        this.#streams=new Map()
    }
    on(name,func){
        this.#event.on(name,func)
    }
    once(name,func){
        this.#event.once(name,func)
    }
    connect(port,ip){
        this.#client.connect(port,ip)
    }
    send(packet,reliabale){
        if(reliabale){
            this.#client.sendTCP(packet)
        } else {
            this.#client.sendUDP(packet)
        }
    }
    reset(){
        this.#client.close()
    }
    join(name,uuid,usid){
        let p=new ConnectPacket();
        p.name=name;
        p.uuid=uuid?uuid:"AAAAAAAAAAA=";
        p.usid=usid?usid:"AAAAAAAAAAA=";
        this.send(p,true)
    }
    sendChatMessage(msg){
        let p=new SendChatMessageCallPacket();
        p.message=msg;
        this.send(p,true)
    }
    connectConfirm(){
        this.send(new ConnectConfirmCallPacket(),true)
    }
    handleClientReceived(packet){
        try{
            packet.handled(this);
            if(packet instanceof StreamBegin){
                this.#streams.set(packet.id,new StreamBuilder(packet));
            } else if(packet instanceof StreamChunk){
                let builder=this.#streams.get(packet.id);
                if(builder){
                    builder.add(packet.data);
                    console.log(builder.stream.length+"/"+builder.total+" "+Math.floor(builder.stream.length/builder.total*100)+"%");
                    if(builder.isDone()){
                        console.log(`Received world data: ${builder.total} bytes.`);
                        this.#streams.delete(builder.id);
                        this.handleClientReceived(builder.build())
                    }
                } else {
                    console.error("Received stream chunk without a StreamBegin beforehand!")
                }
            } else {
                if(this.#event.listenerCount(packet.constructor.name)!=0){
                    this.#event.emit(packet.constructor.name,packet)
                } else {
                    packet.handleClient(this)
                }
            }
        }catch(e){
            this.reset();
            console.error(e.stack);
            this.#event.emit("error",e)
        }
    }
    loadWorld(packet,game){
        let buf=DataStream.from(zlib.inflateSync(packet.stream));
        buf.readString();//TODO Rules
        let map=SaveIO.readStringMap(buf);
        let wave=buf.getInt();
        let wavetime=buf.getFloat();
        let tick=buf.getDouble();
        let seed0=buf.getLong();
        let seed1=buf.getLong();

        buf.getInt();//TODO Player
        buf.getShort();
        buf.get();
        buf.get();
        buf.getInt();
        buf.getFloat();
        buf.getFloat();
        TypeIO.readString(buf);
        buf.get();
        buf.get();
        buf.get();
        buf.get();
        buf.getInt();
        buf.getFloat();
        buf.getFloat();

        let mapped=buf.get();//TODO readContentHeader
        for(let i=0;i<mapped;i++){
            buf.get();
            let total=buf.getShort();
            for(let j=0;j<total;j++){
                buf.readString()
            }
        }

        SaveIO.readMap(buf,this.game.world)
    }
}

var pingHost=(port,ip,callback)=>{
    let client=dgram.createSocket("udp4",(msg,info)=>{
        client.disconnect();
        client.unref();
        let readString=buf=>{
            return buf.get(buf.get()).toString()
        }
        let bbuf=DataStream.from(msg);
        callback({
            name:readString(bbuf),
            map:readString(bbuf),
            players:bbuf.getInt(),
            wave:bbuf.getInt(),
            version:bbuf.getInt(),
            vertype:readString(bbuf),
            gamemode:bbuf.get(),
            limit:bbuf.getInt(),
            description:readString(bbuf),
            modeName:readString(bbuf),
            ip:info.address,
            port:info.port
        })
    });
    client.on("connect",()=>{
        client.send(Buffer.from([-2,1]))
    });
    client.on('error',e=>{
        callback(null,e)
    });
    client.connect(port,ip);
    setTimeout(()=>{
        if(client.connectState==2){
            client.disconnect();
            client.unref();
            callback(null,new Error("Timed out"))
        }
    },2000)
}

class Mindustry{
    netClient;
    constructor() {
        this.netClient=new NetClient(this);
        this.world=new World();
        //TODO don't use
    }
}

module.exports={
    pingHost:pingHost,
    NetClient:NetClient,
    Packets:Packets,
    Mindustry:Mindustry
}
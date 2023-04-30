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
        const colors=[255,-1456134145,2139062271,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,1028227327,1196724223,1245278975,891900927,959597311,1953004287,892817919,370677759,1419621887,-1000131841,83890943,255,1111640063,1128482815,1010582271,825176063,1127756287,1749693951,-1484165121,808333055,1328622335,689444351,2021230335,1530474239,1496788223,1362242559,1917531903,1951217407,572926975,942813695,1010119679,691022847,757542911,976176127,-2124596993,-1958919681,-1840823041,-1045518081,1433418751,944321279,1109597951,387522559,674638335,1547183871,1814968319,521937663,1160456959,757547263,1417955839,-1128415233,-1279804417,-1566391553,-1667318785,1246127615,1446403327,1801145343,1446537471,2054848511,-1957259777,1883652351,-1600014081,-741212161,-268959745,1515805183,-895853825,-1536210689,1967471103,1145852415,1835228415,1314738431,1736726271,1784310271,-69409793,-1152165377,-478058753,-2114305,-185008129,1891330047,1920246015,-1840343809,-285736961,1520393471,-504693505,-690226689,-994903297,-579907841,1549313279,-427669249,2088534527,-268959745,2004527615,-2246145,-1448427777,1532648191,1196381439,1902534655,1365332991,-1603516929,1702974975,-2073197825,-1182878721,-811508993,2090623743,1733715711,-19078657,-1771811841,-1135257089,1431789823,1398038271,1347508991,1515939327,1566534399,1817726207,1010714623,1094600191,993805823,1128615935,1178815487,1313164543,2122354687,1212632063,1379162623,-643992577,-1937790465,2004318207,656877567,-1918770177,-106706945,982476031,1988795135,-106706945,-106706945,982476031,1348103167,1988795135,-1818779137,-1902994433,-1987275521,-1970432513,-1550148353,-1363760385,-961503745,-1264150273,-1683899649,-1163024129,-1163417601,-1147562497,-1331912705,-1264935937,-1701071873,-2105175553,-1313167361,-1922011393,1936618495,1938063103,-2121686017,1904639743,-2004908033,-1803780353,-1802925825,-2004908033,-2055304961,-1601928193,-1602257665,-1770226433,-1887076097,-2054379777,-1618181889,-2005171457,-962887169,-946109953,2140139007,2123361535,-487483393,-605318913,-1904101889,-1904101889,-1984769,-2379777,-35815681,-35881217,-1616200961,-1666926849,-1515207681,-1447769857,-1481456129,-1481390337,-1616331521,1722252031,1587180287,-2105241089,2105511167,2038663679,-1538561,-1932289,-1534413313,-1669025537,-2379521,-1783191041,-1766413825,-1214144001,-1163944193,-1331058433,1499162111,-1853588225,-2106166017,-2138595841,-1803450881,-1819768833,-1836546049,1869708543,1735299839,1954179583,1751417855,-2122083841,2088602367,-1129602305,1852865791,2004056831,2021296383,2105511167,1886551807,2037743103,-1617059329,1970700799,-2037473281,-2122084609,2105511167,-2054910721,1937015295,-1936811521,-1938330369,-1163749889,-1567784193,-1752463361,-1533173249,-1801664769,-1885745153,-1734498817,-1952988673,-1970952193,-1768249345,-1717517313,-1767980033,-1380663553,-1515538945,-1818442241,2106032895,-2052356609,-1918594561,1921874431,1938127871,1904705279,1954709759,-994336513,-926965249,-776366081,-1583374593,-927490049,-978149889,-1113025281,-1113612545,-1213291265,-1045192705,-2055298561,-1936547329,-2138859777,-2105632001,-1315464705,1989181183,1954972671,1938653439,-1870822913,1820227839,1736143615,-1903853057,-1803582465,-1618048769,-1768184065,-1718045953,-1432838913,-1852263681,-1835817217,-1549098241,1854175999,-1803188993,-1383168513,-1618509057,-1820359937,-2138661377,-944330753,-843734785,-776626689,-1517123585,-1281849601,-1365866753,-1196446465,-1145983745,-1432115969,-1617983489,-1701999617,-1870494977,-2037870081,-1886480897,-1769239297,-1701536257,-1767915265,-1785090561,-1481851649,-1971948033,-1684692737,-1398164993,-2088198913,2088934399,-1937537281,-1852929281,-1987673345,-1920826113,-2021818369,1701999615,2003596031,1986887935,2003727615,1953989887,2037806847,1920303871,2138076415,-2106099969,-2139911937,-1853255425,-2104257537,-2121818113,-1987539201,-2004315905,-1987538945,-1970894081,2106428927,-2036689153,2003464191,1802075903,1836090111,1953000703,1785626367,1768324095,1987014911,-2123006977,1987283455,2004585727,2087676671,1921614335,1836088063,1987675647,1734964735,1600219903,2071098623,-2089190401,2070902015,-2123600385,1986949631,1970106623,1532586751,1683972351,-994926337,-1365538305,-1870761473,-1854049537,-1247438849,-1146512129,-1937604609,-1887403009,-1836611329,-1380794881,255,255,255,255,255,-1247371265,-1331058177,-2071750913,2071564543,-1600731649,-1600470785,-1600731905,-2072142337,-2072338689,1903265535,1751677951,1548899839,-1970894081,-911303425,-1802927361,-1970697473];
        const teams=[1296980223,-2916353,-229288449,-1568872961,1423343103,1820851711,-347033345,446977279,353869567,829939455,1617156607,-1084487169,1746445311,985027071,397182207,-710715393,-1532668161,1386739455,-1587406593,-1435102465,-84384001,-1097708545,1182441727,86561023,-1316870913,1355844095,1005811455,-1868815617,373217279,-1604664577,1894837247,1001088511,380587519,-126684417,-965359361,-1304712193,-1166482433,-482507009,-1792153601,1623725567,-1372405249,1421641983,-69970177,1119012607,1330041343,-212356097,-736757249,1495527935,-987017985,-1268003585,2060247807,972363007,1150145023,-944874241,-780283137,968744703,508415999,1239662847,604817407,1349428735,580915711,-42289409,1169989119,660644863,1507383039,-2050281217,-602237697,781559551,1240720127,1691396351,374187263,-1295705089,306627583,-1732898561,1961660415,-1435871489,1237649151,-2030717185,380015359,1472188671,-552705025,-422482945,-1475773185,-1708018945,-230606593,1503558143,1452715519,-1204584449,1773591295,114446335,-70501377,-2031122177,-1951508993,1502718975,77497087,-1688894465,-883251713,-290692353,599593215,-907256577,1476110079,-464658945,-1387707393,497452543,-131982849,-1139828993,1341820415,9297151,784202239,-1309860865,-782141953,1739340799,497646847,-686005761,1489870847,-1017213441,-1870074881,-1189611265,2143758591,1720299007,2043785215,125677055,-1304993025,1522961151,-52821249,1418129151,-1455196929,2099816191,-1405666305,-1655471617,-538169601,-1049234177,1315091711,-920625409,-1622160897,1405187839,1590290431,1423529215,-1166908161,-1051679489,113321471,1309401599,-475390721,25535743,678664703,-1477498625,-20230657,-2057656577,-1618268929,-40099329,1297850367,-1487318273,1520677375,-1624124161,385997823,-668451329,-177338369,-1454144769,-357234945,755149311,-1202475521,50131967,1121050111,-396030721,-591325953,716175103,1844492031,447067391,-1471524609,1960780287,1855806207,-418102785,422699007,-828869889,1555123967,-1642516481,1252290047,-247797761,219139839,542035455,-870765313,2063384319,266052863,431062783,-1051131393,-502697473,-1576932353,710909695,-1109845505,967483135,1754645759,1317462783,750565887,-1252004353,1605503487,414669055,1484170751,1055032319,917520639,-1699995649,611755775,-2085146625,1251972863,-464758273,-1459183617,-1531032577,1506640383,-1206914817,1675728639,1674982399,-1614384385,-327748353,-829339137,-187298049,2042517759,736751359,-2135397633,1388621823,534313727,-2005863937,-88307201,-1696626945,1884548351,975088383,354411775,-1728898305,-1866663425,1593878783,-1394802433,-529779457,-665080833,1305473535,1997993215,-1192230657,2124744959,-729216513,-1420324353,-328079361,-349541377,968279295,-920238849,1454809343,-358577153,666977023,991550463,-1591572993,-147083009,-1505987329,-402493697,-1177864193,-1313075457,-1644532993,-43396865,1459057407,-1350355713,383010047];
        //TODO blockcolors
        let tiles=this.tiles;
        let width=tiles.width,height=tiles.height;
        let output=DataStream.allocate(width*height*5+30);
        let temp=DataStream.allocate(width*height*5+30);
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
        for(let y=height-1;y>=0;y--){
            temp.put(0);
            let tile=tiles.array[pos];
            for(let x=0;x<width;x++){
                let pos=y*width+x;
                let colorPos=tile.overlay?tile.overlay:tile.floor;
                let color=colors[colorPos];
                temp.put(color>>24&0xff);
                temp.put(color>>16&0xff);
                temp.put(color>>8&0xff);
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
        if(nc.game){
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
        buf.putInt(143);
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
    _id=18;
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
Packets.set(18,ClientSnapshotCallPacket);
class ConnectConfirmCallPacket extends Packet{
    _id=22
}
Packets.set(22,ConnectConfirmCallPacket);
class DeconstructFinishCallPacket extends Packet{
    _id=28;
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
Packets.set(28,DeconstructFinishCallPacket);
class KickCallPacket extends Packet{
    _id=44;
    reason;
    write(buf){
        TypeIO.writeString(buf,this.reason)
    }
    read(buf){
        this.reason=TypeIO.readString(buf)
    }
}
Packets.set(44,KickCallPacket);
class KickCallPacket2 extends Packet{
    _id=45;
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
Packets.set(45,KickCallPacket2);
class MenuCallPacket extends Packet{
    _id=49;
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
Packets.set(49,MenuCallPacket);
class MenuChooseCallPacket extends Packet{
    _id=50;
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
Packets.set(50,MenuChooseCallPacket);
class PingCallPacket extends Packet{
    _id=55;
    time;
    write(buf){
        buf.putLong(this.time)
    }
}
Packets.set(55,PingCallPacket);
class SendChatMessageCallPacket extends Packet{
    _id=70;
    message;
    write(buf){
        TypeIO.writeString(buf,this.message)
    }
}
Packets.set(70,SendChatMessageCallPacket);
class SendMessageCallPacket extends Packet{
    _id=71;
    message;
    write(buf){
        //TODO
    }
    read(buf){
        this.message=TypeIO.readString(buf)
    }
}
Packets.set(71,SendMessageCallPacket);
class SendMessageCallPacket2 extends Packet{
    _id=72;
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
Packets.set(72,SendMessageCallPacket2);
class TransferItemToCallPacket extends Packet{
    _id=101;
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
Packets.set(101,TransferItemToCallPacket);
class UnitControlCallPacket extends Packet{
    _id=107;
    player;
    unit;
    write(buf){
        //TODO
    }
    read(buf){
        //TODO
    }
}
Packets.set(107,UnitControlCallPacket);

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

class Events{
    #em;
    constructor(){
        this.#em=new EventEmitter();
        this.#em.setMaxListeners(Infinity)
    }
    on(a,b){
        this.#em.on(a,b)
    }
    fire(a,b){
        this.#em.emit(a,b)
    }
}

class StreamBuilder{
    id;
    type;
    total;
    stream;
    length;
    #buf;
    constructor(packet){
        this.length=0;
        this.id=packet.id;
        this.type=packet.type;
        this.total=packet.total;
        this.#buf=[]
    }
    add(data){
        if(!data instanceof Buffer) throw new TypeError("data must be a buffer.")
        this.length+=data.length;
        this.#buf.push(data)
    }
    isDone(){
        return this.length>=this.total
    }
    build(){
        let s=new (Packets.get(this.type))();
        s.stream=this.stream=Buffer.concat(this.#buf);
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
                    console.log(builder.length+"/"+builder.total+" "+Math.floor(builder.length/builder.total*100)+"%");
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
    loadWorld(packet){
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

        SaveIO.readMap(buf,this.game.world);

        this.game.events.fire("WorldLoadEvent")
    }
}

var pingHost=(port,ip,callback)=>{
    let client=dgram.createSocket("udp4",(msg,info)=>{
        client.disconnect();
        client.unref();
        let readString=buf=>{
            return buf.get(buf.get()).toString()
        };
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
    world;
    events;
    constructor() {
        this.netClient=new NetClient(this);
        this.world=new World();
        this.events=new Events()
    }
}

module.exports={
    pingHost:pingHost,
    NetClient:NetClient,
    Packets:Packets,
    Mindustry:Mindustry
}
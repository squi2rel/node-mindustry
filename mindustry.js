const dgram=require("dgram");
const net=require("net");
const lz4=require("lz4");
const crc32=require("crc-32");
const {EventEmitter}=require("events");

var rand=(min,max)=>{
    return Math.floor(Math.random()*(max-min+1))+min
}

class ByteBuffer{
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
        this.#buf.fill();
        return this
    }
    get(bytes){
        let o=this.#pos;
        this.#pos=o+(bytes?bytes:1);
        return bytes?this.#buf.slice(o,bytes+o):this.#buf.slice(o,o+1)[0]
    }
    getInt(){
        let o=this.#pos;
        this.#pos=o+4;
        return this.#buf.slice(o,o+4).readInt32BE()
    }
    limit(limit){
        if(limit!==undefined){
            this.#lim=limit;
            this.#pos=Math.min(this.#pos,limit)
            return this
        } else {
            return this.#lim
        }
    }
    remaining(){
        return this.#lim-this.#pos
    }
    getShort(){
        let o=this.#pos?this.#pos:0;
        this.#pos=o+2;
        return this.#buf.readInt16BE(o)
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
    compact(){
        this.#buf.copy(this.#buf,0,this.#pos,this.#lim);
        this.#pos=this.#lim-this.#pos;
        this.#lim=this.#buf.length;
        return this
    }
    put(data){
        if(Buffer.isBuffer(data)){
            let writeBytes=Math.min(this.remaining(),data.length);
            data.copy(this.#buf,this.#pos,0,writeBytes);
            this.#pos+=writeBytes;
            return this
        } else if(typeof(data)=="string"){
            return this.put(Buffer.from(data))
        } else if(data instanceof Array){
            return this.put(Buffer.from(data))
        } else if(data instanceof ByteBuffer){
            data.flip();
            this.put(data._getBuffer());
            data.clear();
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
        return `ByteBuffer[pos=${this.#pos},lim=${this.#lim},cap=${this.#buf.length}]`
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
}

class Packet{
    static priorityLow=0;
    static priorityNormal=1;
    static priorityHigh=2;
    read(){}
    write(){}
    handled(){}
    getPriority(){return this.priorityNormal}
}

class TypeIO{
    static writeString(buf,string){
        if(string){
            buf.put(1);
            let strbuf=Buffer.from(string);
            buf.putShort(strbuf.length);
            buf.put(strbuf)
        } else {
            buf.put(0)
        }
    }
    static readString(buf){
        let str=buf.get();
        if(str){
            return buf.get(buf.getShort()).toString()
        } else {
            return null
        }
    }
}

var Packets=new Map();

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
        console.log(buf.getShort())
        this.data=buf.get(buf.getShort()).toJSON().data
    }
}
Packets.set(1,StreamChunk);
class WorldStream extends Packet{
    //TODO
}
Packets.set(2,WorldStream);
class ConnectPacket extends Packet{
    _id=3;
    name;
    usid;
    uuid;
    write(buf){
        buf.putInt(140);
        TypeIO.writeString(buf,"official");
        TypeIO.writeString(buf,this.name);
        TypeIO.writeString(buf,"zh_CN");
        TypeIO.writeString(buf,this.usid);
        let uuidbuf=Buffer.from(this.uuid,"base64").toJSON().data;
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
        buf.getInt();
        buf.getShort();
        buf.get();
        buf.getInt()
    }
}
Packets.set(29,DeconstructFinishCallPacket);
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
    read(){
        //TODO
    }
}
Packets.set(69,SendChatMessageCallPacket);
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
    handled(packet){
        console.log(packet.message)
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

class TCPConnection{
    #maxLength;
    #writeBuffer;
    #serializer;
    #tcp;
    #connected;
    #timer;
    constructor(w,r,s,p){
        this.#writeBuffer=ByteBuffer.allocate(w);
        this.#serializer=s;
        this.#maxLength=r;
        this.#tcp=new net.Socket();
        this.#tcp.setNoDelay(true);
        this.#tcp.setTimeout(12000);
        this.#connected=false;
        this.#tcp.on("connect",()=>{
            this.#timer=setInterval(()=>{
                this.send(new FrameworkMessage.KeepAlive())
            },8000)
        })
        this.#tcp.on("data",d=>{
            p(this.readObject(d))
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
            this.#tcp.connect(port,ip);
            this.#tcp.ref();
            this.#connected=true
        } else {
            console.error("TCP重复连接")
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
        if(d.length>this.#maxLength){
            console.error(`包过大(${d.length})`);
            return null
        }
        let buf=ByteBuffer.from(d);
        if(buf.length<2){
            return null
        }
        let length=buf.getShort();
        if(length<0){
            return null
        }
        if(buf.remaining()<length){
            return null
        }
        buf.limit(length+2);
        let obj=this.#serializer.read(buf);
        if(buf.position()-2!=length){
            //console.error(`TCP无效${obj?obj.constructor.name:""}包:还剩${length+2-buf.position()}个字节未读`);
            return null
        }
        return obj
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
    #maxLength;
    #writeBuffer;
    #serializer;
    #udp;
    #connected;
    #timer;
    constructor(w,r,s,p){
        this.#writeBuffer=ByteBuffer.allocate(w);
        this.#maxLength=r;
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
            console.error("UDP重复连接")
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
        if(d.length>this.#maxLength){
            console.error(`包过大(${d.length})`);
            return null
        }
        let buf=ByteBuffer.from(d);
        let obj=this.#serializer.read(buf);
        if(buf.hasRemaining()){
            //console.error(`UDP无效${obj?obj.constructor.name:""}包:还剩${buf.remaining()}个字节未读`);
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

var FrameworkMessage={
    RegisterTCP:class{
        connectionID;
        _fm=true;
        constructor(){}
    },
    RegisterUDP:class{
        connectionID;
        _fm=true;
        constructor(){}
    },
    KeepAlive:class{
        _fm=true;
        constructor(){}
    }
}

class Client{
    #TCPRegistered=false;
    #UDPRegistered=false;
    #tcp;
    #udp;
    #event;
    constructor(w,r,s){
        this.#tcp=new TCPConnection(w,r,s,data=>{this.parse(data)});
        this.#udp=new UDPConnection(w,r,s,data=>{this.parse(data)});
        this.#event=new EventEmitter();
        this.#tcp.on("timeout",()=>{
            this.#event.emit("timeout")
        });
        this.#tcp.on("error",e=>{
            this.#event.emit("error",e)
        });
        this.#tcp.on("close",()=>{
            this.#event.emit("disconnect")
        })
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
            if(!packet._fm){
                packet.handled(packet);
                this.#event.emit(packet.constructor.name,packet)
            }
        }
    }
}

class PacketSerializer{
    #temp;
    constructor(){
        this.#temp=ByteBuffer.allocate(32768)
    }
    read(buf){
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
            } else {
                //console.error("未知的包id:"+id)
            }
            buf.clear();
        }
    }
    write(buf,object){
        if(Buffer.isBuffer(object)||(object instanceof ByteBuffer)){
            buf.put(object)
        } else if(object?._fm){
            buf.put(-2);
            this.writeFramework(buf,object)
        } else if(object instanceof Packet){
            buf.put(object._id);
            this.#temp.clear();
            object.write(this.#temp);
            let length=this.#temp.position();
            buf.putShort(length);
            if(length<36||object instanceof StreamChunk){
                buf.put(0);
                buf.put(this.#temp)
            } else {
                buf.put(1);
                this.#temp.flip();
                let size=lz4.encodeBlock(this.#temp._getBuffer(),buf._getBuffer(buf.position()));
                buf.position(buf.position()+size)
            }
        } else {
            console.error("无效的数据类型:"+object.toString())
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
            throw new Error("未知的消息类型")
        }
    }
}

var pingHost=(ip,port,callback)=>{
    let client=dgram.createSocket("udp4",(msg,info)=>{
        client.disconnect();
        client.unref();
        let readString=buf=>{
            return buf.get(buf.get()).toString()
        }
        let bbuf=ByteBuffer.from(msg);
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

class NetClient{
    #lastSent=0;
    #client;
    constructor(){
        this.#client=new Client(8192,32768,new PacketSerializer());
        this.#client.on("disconnect",()=>{
            this.#lastSent=0
        });
        this.#client.on("timeout",()=>{
            this.reset()
        });
        this.#client.on("error",e=>{
            this.reset();
            console.error(e)
        });
        this.#client.on("connect",()=>{
            console.log("连接成功")
        });
        this.#client.on("disconnect",()=>{
            console.log("断开连接");
            this.reset()
        })
    }
    on(name,func){
        this.#client.on(name,func)
    }
    once(name,func){
        this.#client.once(name,func)
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
    sync(){
        let p=new ClientSnapshotCallPacket();
        p.snapshotID=this.#lastSent++;
        this.send(p,false)
    }
    newPacket(id){
        return Packets.get(id)?new (Packets.get(id))():null
    }
    join(name,uuid){
        let p=new ConnectPacket();
        p.name=name;
        p.uuid=uuid;
        p.usid="AAAAAAAAAAA=";
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
}

module.exports={
    pingHost:pingHost,
    NetClient:NetClient
}
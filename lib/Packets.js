//CODEGEN from squi2rel (github.com/squi2rel/Mindustry-CN-ARC) build146;
const Packet = require("./Packet");
const TypeIO = require("./TypeIO");
const crc32 = require("crc-32");
const Packets = new Map();
class StreamBegin extends Packet {
    _id = 0;
    static #lastid = 0;
    total;
    type;
    constructor() {
        super();
        this.id=StreamBegin.#lastid++
    }
    write(buf) {
        buf.putInt(this.id);
        buf.putInt(this.total);
        buf.put(type)
    }
    read(buf) {
        this.id=buf.getInt();
        this.total=buf.getInt();
        this.type=buf.get()
    }
}
Packets.set(0,StreamBegin);
class StreamChunk extends Packet {
    _id = 1;
    id;
    data;
    write(buf) {
        buf.putInt(this.id);
        buf.putShort(this.data.length);
        buffer.put(this.data)
    }
    read(buf) {
        this.id=buf.getInt();
        this.data=buf.get(buf.getShort())
    }
}
Packets.set(1, StreamChunk);
class WorldStream extends Packet {
    _id = 2;
    stream;
    handleClient(nc) {
        if(nc.game) {
            nc.loadWorld(this)
        }
    }
}
Packets.set(2, WorldStream);
class ConnectPacket extends Packet {
    _id = 3;
    name;
    usid;
    uuid;
    write(buf) {
        buf.putInt(146);
        TypeIO.writeString(buf, "official");
        TypeIO.writeString(buf, this.name);
        TypeIO.writeString(buf, "en");
        TypeIO.writeString(buf, this.usid);
        let uuidbuf = Buffer.from(this.uuid, "base64");
        buf.put(uuidbuf);
        buf.putLong(crc32.buf(uuidbuf));
        buf.put(0);
        buf.put([0xff, 0xa1, 0x08, 0xff]);
        buf.put(0)
    }
}
Packets.set(3, ConnectPacket);
class AdminRequestCallPacket extends Packet {
    _id = 4;
    other;
    action;
    params;
    write(buf) {
            TypeIO.writeEntity(buf,this.other);
        TypeIO.writeAction(buf,this.action);
        TypeIO.writeObject(buf,this.params)
    }
    read(buf) {
            this.other=TypeIO.readEntity(buf);
        this.action=TypeIO.readAction(buf);
        this.params=TypeIO.readObject(buf)
    }
    handleServer(n) {
            n.adminRequest(player, other, action, params)
    }
}
Packets.set(4, AdminRequestCallPacket);
class AnnounceCallPacket extends Packet {
    _id = 5;
    message;
    write(buf) {
            TypeIO.writeString(buf,this.message)
    }
    read(buf) {
            this.message=TypeIO.readString(buf)
    }
    handleClient(n) {
            
    }
}
Packets.set(5, AnnounceCallPacket);
class AssemblerDroneSpawnedCallPacket extends Packet {
    _id = 6;
    tile;
    id;
    write(buf) {
            TypeIO.writeTile(buf,this.tile);
        buf.putInt(this.id)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf);
        this.id = buf.getInt()
    }
    handleClient(n) {
            mindustry.world.blocks.units.UnitAssembler.assemblerDroneSpawned(tile, id)
    }
}
Packets.set(6, AssemblerDroneSpawnedCallPacket);
class AssemblerUnitSpawnedCallPacket extends Packet {
    _id = 7;
    tile;
    write(buf) {
            TypeIO.writeTile(buf,this.tile)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf)
    }
    handleClient(n) {
            mindustry.world.blocks.units.UnitAssembler.assemblerUnitSpawned(tile)
    }
}
Packets.set(7, AssemblerUnitSpawnedCallPacket);
class AutoDoorToggleCallPacket extends Packet {
    _id = 8;
    tile;
    open;
    write(buf) {
            TypeIO.writeTile(buf,this.tile);
        buf.put(this.open)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf);
        this.open = buf.get()
    }
    handleClient(n) {
            mindustry.world.blocks.defense.AutoDoor.autoDoorToggle(tile, open)
    }
}
Packets.set(8, AutoDoorToggleCallPacket);
class BeginBreakCallPacket extends Packet {
    _id = 9;
    unit;
    team;
    x;
    y;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit);
        TypeIO.writeTeam(buf,this.team);
        buf.putInt(this.x);
        buf.putInt(this.y)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf);
        this.team=TypeIO.readTeam(buf);
        this.x = buf.getInt();
        this.y = buf.getInt()
    }
    handleClient(n) {
            mindustry.world.Build.beginBreak(unit, team, x, y)
    }
}
Packets.set(9, BeginBreakCallPacket);
class BeginPlaceCallPacket extends Packet {
    _id = 10;
    unit;
    result;
    team;
    x;
    y;
    rotation;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit);
        TypeIO.writeBlock(buf,this.result);
        TypeIO.writeTeam(buf,this.team);
        buf.putInt(this.x);
        buf.putInt(this.y);
        buf.putInt(this.rotation)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf);
        this.result=TypeIO.readBlock(buf);
        this.team=TypeIO.readTeam(buf);
        this.x = buf.getInt();
        this.y = buf.getInt();
        this.rotation = buf.getInt()
    }
    handleClient(n) {
            mindustry.world.Build.beginPlace(unit, result, team, x, y, rotation)
    }
}
Packets.set(10, BeginPlaceCallPacket);
class BlockSnapshotCallPacket extends Packet {
    _id = 11;
    amount;
    data;
    getPriority() {
            return 0
    }
    write(buf) {
            buf.putShort(this.amount);
        TypeIO.writeBytes(buf,this.data)
    }
    read(buf) {
            this.amount = buf.getShort();
        this.data=TypeIO.readBytes(buf)
    }
    handleClient(n) {
            n.blockSnapshot(amount, data)
    }
}
Packets.set(11, BlockSnapshotCallPacket);
class BuildDestroyedCallPacket extends Packet {
    _id = 12;
    build;
    write(buf) {
            TypeIO.writeBuilding(buf,this.build)
    }
    read(buf) {
            this.build=TypeIO.readBuilding(buf)
    }
    handleClient(n) {
            Tile.buildDestroyed(build)
    }
}
Packets.set(12, BuildDestroyedCallPacket);
class BuildHealthUpdateCallPacket extends Packet {
    _id = 13;
    buildings;
    write(buf) {
            TypeIO.writeIntSeq(buf,this.buildings)
    }
    read(buf) {
            this.buildings=TypeIO.readIntSeq(buf)
    }
    handleClient(n) {
            Tile.buildHealthUpdate(buildings)
    }
}
Packets.set(13, BuildHealthUpdateCallPacket);
class BuildingControlSelectCallPacket extends Packet {
    _id = 14;
    player;
    build;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeBuilding(buf,this.build)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.build=TypeIO.readBuilding(buf)
    }
    handleServer(n) {
            InputHandler.buildingControlSelect(player, build)
    }
    handleClient(n) {
            InputHandler.buildingControlSelect(player, build)
    }
}
Packets.set(14, BuildingControlSelectCallPacket);
class ClearItemsCallPacket extends Packet {
    _id = 15;
    build;
    write(buf) {
            TypeIO.writeBuilding(buf,this.build)
    }
    read(buf) {
            this.build=TypeIO.readBuilding(buf)
    }
    handleClient(n) {
            InputHandler.clearItems(build)
    }
}
Packets.set(15, ClearItemsCallPacket);
class ClientPacketReliableCallPacket extends Packet {
    _id = 16;
    type;
    contents;
    write(buf) {
            TypeIO.writeString(buf,this.type);
        TypeIO.writeString(buf,this.contents)
    }
    read(buf) {
            this.type=TypeIO.readString(buf);
        this.contents=TypeIO.readString(buf)
    }
    handleClient(n) {
            n.clientPacketReliable(type, contents)
    }
}
Packets.set(16, ClientPacketReliableCallPacket);
class ClientPacketUnreliableCallPacket extends Packet {
    _id = 17;
    type;
    contents;
    write(buf) {
            TypeIO.writeString(buf,this.type);
        TypeIO.writeString(buf,this.contents)
    }
    read(buf) {
            this.type=TypeIO.readString(buf);
        this.contents=TypeIO.readString(buf)
    }
    handleClient(n) {
            n.clientPacketUnreliable(type, contents)
    }
}
Packets.set(17, ClientPacketUnreliableCallPacket);
class ClientSnapshotCallPacket extends Packet {
    _id = 18;
    snapshotID;
    unitID;
    dead;
    x;
    y;
    pointerX;
    pointerY;
    rotation;
    baseRotation;
    xVelocity;
    yVelocity;
    mining;
    boosting;
    shooting;
    chatting;
    building;
    plans;
    viewX;
    viewY;
    viewWidth;
    viewHeight;
    write(buf) {
            buf.putInt(this.snapshotID);
        buf.putInt(this.unitID);
        buf.put(this.dead);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        buf.putFloat(this.pointerX);
        buf.putFloat(this.pointerY);
        buf.putFloat(this.rotation);
        buf.putFloat(this.baseRotation);
        buf.putFloat(this.xVelocity);
        buf.putFloat(this.yVelocity);
        TypeIO.writeTile(buf,this.mining);
        buf.put(this.boosting);
        buf.put(this.shooting);
        buf.put(this.chatting);
        buf.put(this.building);
        TypeIO.writePlansQueueNet(buf,this.plans);
        buf.putFloat(this.viewX);
        buf.putFloat(this.viewY);
        buf.putFloat(this.viewWidth);
        buf.putFloat(this.viewHeight)
    }
    read(buf) {
            this.snapshotID = buf.getInt();
        this.unitID = buf.getInt();
        this.dead = buf.get();
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.pointerX = buf.getFloat();
        this.pointerY = buf.getFloat();
        this.rotation = buf.getFloat();
        this.baseRotation = buf.getFloat();
        this.xVelocity = buf.getFloat();
        this.yVelocity = buf.getFloat();
        this.mining=TypeIO.readTile(buf);
        this.boosting = buf.get();
        this.shooting = buf.get();
        this.chatting = buf.get();
        this.building = buf.get();
        this.plans=TypeIO.readPlansQueue(buf);
        this.viewX = buf.getFloat();
        this.viewY = buf.getFloat();
        this.viewWidth = buf.getFloat();
        this.viewHeight = buf.getFloat()
    }
    handleServer(n) {
            n.clientSnapshot(player, snapshotID, unitID, dead, x, y, pointerX, pointerY, rotation, baseRotation, xVelocity, yVelocity, mining, boosting, shooting, chatting, building, plans, viewX, viewY, viewWidth, viewHeight)
    }
}
Packets.set(18, ClientSnapshotCallPacket);
class CommandBuildingCallPacket extends Packet {
    _id = 19;
    player;
    buildings;
    target;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeInts(buf,this.buildings);
        TypeIO.writeVec2(buf,this.target)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.buildings=TypeIO.readInts(buf);
        this.target=TypeIO.readVec2(buf)
    }
    handleServer(n) {
            InputHandler.commandBuilding(player, buildings, target)
    }
    handleClient(n) {
            InputHandler.commandBuilding(player, buildings, target)
    }
}
Packets.set(19, CommandBuildingCallPacket);
class CommandUnitsCallPacket extends Packet {
    _id = 20;
    player;
    unitIds;
    buildTarget;
    unitTarget;
    posTarget;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeInts(buf,this.unitIds);
        TypeIO.writeBuilding(buf,this.buildTarget);
        TypeIO.writeUnit(buf,this.unitTarget);
        TypeIO.writeVec2(buf,this.posTarget)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.unitIds=TypeIO.readInts(buf);
        this.buildTarget=TypeIO.readBuilding(buf);
        this.unitTarget=TypeIO.readUnit(buf);
        this.posTarget=TypeIO.readVec2(buf)
    }
    handleServer(n) {
            InputHandler.commandUnits(player, unitIds, buildTarget, unitTarget, posTarget)
    }
    handleClient(n) {
            InputHandler.commandUnits(player, unitIds, buildTarget, unitTarget, posTarget)
    }
}
Packets.set(20, CommandUnitsCallPacket);
class ConnectCallPacket extends Packet {
    _id = 21;
    ip;
    port;
    write(buf) {
            TypeIO.writeString(buf,this.ip);
        buf.putInt(this.port)
    }
    read(buf) {
            this.ip=TypeIO.readString(buf);
        this.port = buf.getInt()
    }
    handleClient(n) {
            n.connect(ip, port)
    }
}
Packets.set(21, ConnectCallPacket);
class ConnectConfirmCallPacket extends Packet {
    _id = 22;
    write(buf) {
    
    }
    read(buf) {
    
    }
    handleServer(n) {
            n.connectConfirm(player)
    }
}
Packets.set(22, ConnectConfirmCallPacket);
class ConstructFinishCallPacket extends Packet {
    _id = 23;
    tile;
    block;
    builder;
    rotation;
    team;
    config;
    write(buf) {
            TypeIO.writeTile(buf,this.tile);
        TypeIO.writeBlock(buf,this.block);
        TypeIO.writeUnit(buf,this.builder);
        buf.put(this.rotation);
        TypeIO.writeTeam(buf,this.team);
        TypeIO.writeObject(buf,this.config)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf);
        this.block=TypeIO.readBlock(buf);
        this.builder=TypeIO.readUnit(buf);
        this.rotation = buf.get();
        this.team=TypeIO.readTeam(buf);
        this.config=TypeIO.readObject(buf)
    }
    handleClient(n) {
            mindustry.world.blocks.ConstructBlock.constructFinish(tile, block, builder, rotation, team, config)
    }
}
Packets.set(23, ConstructFinishCallPacket);
class CreateBulletCallPacket extends Packet {
    _id = 24;
    type;
    team;
    x;
    y;
    angle;
    damage;
    velocityScl;
    lifetimeScl;
    write(buf) {
            TypeIO.writeBulletType(buf,this.type);
        TypeIO.writeTeam(buf,this.team);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        buf.putFloat(this.angle);
        buf.putFloat(this.damage);
        buf.putFloat(this.velocityScl);
        buf.putFloat(this.lifetimeScl)
    }
    read(buf) {
            this.type=TypeIO.readBulletType(buf);
        this.team=TypeIO.readTeam(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.angle = buf.getFloat();
        this.damage = buf.getFloat();
        this.velocityScl = buf.getFloat();
        this.lifetimeScl = buf.getFloat()
    }
    handleClient(n) {
            mindustry.entities.bullet.BulletType.createBullet(type, team, x, y, angle, damage, velocityScl, lifetimeScl)
    }
}
Packets.set(24, CreateBulletCallPacket);
class CreateWeatherCallPacket extends Packet {
    _id = 25;
    weather;
    intensity;
    duration;
    windX;
    windY;
    write(buf) {
            TypeIO.writeWeather(buf,this.weather);
        buf.putFloat(this.intensity);
        buf.putFloat(this.duration);
        buf.putFloat(this.windX);
        buf.putFloat(this.windY)
    }
    read(buf) {
            this.weather=TypeIO.readWeather(buf);
        this.intensity = buf.getFloat();
        this.duration = buf.getFloat();
        this.windX = buf.getFloat();
        this.windY = buf.getFloat()
    }
    handleClient(n) {
            mindustry.type.Weather.createWeather(weather, intensity, duration, windX, windY)
    }
}
Packets.set(25, CreateWeatherCallPacket);
class DebugStatusClientCallPacket extends Packet {
    _id = 26;
    value;
    lastClientSnapshot;
    snapshotsSent;
    getPriority() {
            return 2
    }
    write(buf) {
            buf.putInt(this.value);
        buf.putInt(this.lastClientSnapshot);
        buf.putInt(this.snapshotsSent)
    }
    read(buf) {
            this.value = buf.getInt();
        this.lastClientSnapshot = buf.getInt();
        this.snapshotsSent = buf.getInt()
    }
    handleClient(n) {
            n.debugStatusClient(value, lastClientSnapshot, snapshotsSent)
    }
}
Packets.set(26, DebugStatusClientCallPacket);
class DebugStatusClientUnreliableCallPacket extends Packet {
    _id = 27;
    value;
    lastClientSnapshot;
    snapshotsSent;
    getPriority() {
            return 2
    }
    write(buf) {
            buf.putInt(this.value);
        buf.putInt(this.lastClientSnapshot);
        buf.putInt(this.snapshotsSent)
    }
    read(buf) {
            this.value = buf.getInt();
        this.lastClientSnapshot = buf.getInt();
        this.snapshotsSent = buf.getInt()
    }
    handleClient(n) {
            n.debugStatusClientUnreliable(value, lastClientSnapshot, snapshotsSent)
    }
}
Packets.set(27, DebugStatusClientUnreliableCallPacket);
class DeconstructFinishCallPacket extends Packet {
    _id = 28;
    tile;
    block;
    builder;
    write(buf) {
            TypeIO.writeTile(buf,this.tile);
        TypeIO.writeBlock(buf,this.block);
        TypeIO.writeUnit(buf,this.builder)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf);
        this.block=TypeIO.readBlock(buf);
        this.builder=TypeIO.readUnit(buf)
    }
    handleClient(n) {
            mindustry.world.blocks.ConstructBlock.deconstructFinish(tile, block, builder)
    }
}
Packets.set(28, DeconstructFinishCallPacket);
class DeletePlansCallPacket extends Packet {
    _id = 29;
    player;
    positions;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeInts(buf,this.positions)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.positions=TypeIO.readInts(buf)
    }
    handleServer(n) {
            InputHandler.deletePlans(player, positions)
    }
    handleClient(n) {
            InputHandler.deletePlans(player, positions)
    }
}
Packets.set(29, DeletePlansCallPacket);
class DropItemCallPacket extends Packet {
    _id = 30;
    angle;
    write(buf) {
            buf.putFloat(this.angle)
    }
    read(buf) {
            this.angle = buf.getFloat()
    }
    handleServer(n) {
            InputHandler.dropItem(player, angle)
    }
}
Packets.set(30, DropItemCallPacket);
class EffectCallPacket extends Packet {
    _id = 31;
    effect;
    x;
    y;
    rotation;
    color;
    write(buf) {
            TypeIO.writeEffect(buf,this.effect);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        buf.putFloat(this.rotation);
        TypeIO.writeColor(buf,this.color)
    }
    read(buf) {
            this.effect=TypeIO.readEffect(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.rotation = buf.getFloat();
        this.color=TypeIO.readColor(buf)
    }
    handleClient(n) {
            n.effect(effect, x, y, rotation, color)
    }
}
Packets.set(31, EffectCallPacket);
class EffectCallPacket2 extends Packet {
    _id = 32;
    effect;
    x;
    y;
    rotation;
    color;
    data;
    write(buf) {
            TypeIO.writeEffect(buf,this.effect);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        buf.putFloat(this.rotation);
        TypeIO.writeColor(buf,this.color);
        TypeIO.writeObject(buf,this.data)
    }
    read(buf) {
            this.effect=TypeIO.readEffect(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.rotation = buf.getFloat();
        this.color=TypeIO.readColor(buf);
        this.data=TypeIO.readObject(buf)
    }
    handleClient(n) {
            n.effect(effect, x, y, rotation, color, data)
    }
}
Packets.set(32, EffectCallPacket2);
class EffectReliableCallPacket extends Packet {
    _id = 33;
    effect;
    x;
    y;
    rotation;
    color;
    write(buf) {
            TypeIO.writeEffect(buf,this.effect);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        buf.putFloat(this.rotation);
        TypeIO.writeColor(buf,this.color)
    }
    read(buf) {
            this.effect=TypeIO.readEffect(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.rotation = buf.getFloat();
        this.color=TypeIO.readColor(buf)
    }
    handleClient(n) {
            n.effectReliable(effect, x, y, rotation, color)
    }
}
Packets.set(33, EffectReliableCallPacket);
class EntitySnapshotCallPacket extends Packet {
    _id = 34;
    amount;
    data;
    getPriority() {
            return 0
    }
    write(buf) {
            buf.putShort(this.amount);
        TypeIO.writeBytes(buf,this.data)
    }
    read(buf) {
            this.amount = buf.getShort();
        this.data=TypeIO.readBytes(buf)
    }
    handleClient(n) {
            n.entitySnapshot(amount, data)
    }
}
Packets.set(34, EntitySnapshotCallPacket);
class FollowUpMenuCallPacket extends Packet {
    _id = 35;
    menuId;
    title;
    message;
    options;
    write(buf) {
            buf.putInt(this.menuId);
        TypeIO.writeString(buf,this.title);
        TypeIO.writeString(buf,this.message);
        TypeIO.writeStringArray(buf,this.options)
    }
    read(buf) {
            this.menuId = buf.getInt();
        this.title=TypeIO.readString(buf);
        this.message=TypeIO.readString(buf);
        this.options=TypeIO.readStringArray(buf)
    }
    handleClient(n) {
            
    }
}
Packets.set(35, FollowUpMenuCallPacket);
class GameOverCallPacket extends Packet {
    _id = 36;
    winner;
    write(buf) {
            TypeIO.writeTeam(buf,this.winner)
    }
    read(buf) {
            this.winner=TypeIO.readTeam(buf)
    }
    handleClient(n) {
            mindustry.core.Logic.gameOver(winner)
    }
}
Packets.set(36, GameOverCallPacket);
class HiddenSnapshotCallPacket extends Packet {
    _id = 37;
    ids;
    getPriority() {
            return 0
    }
    write(buf) {
            TypeIO.writeIntSeq(buf,this.ids)
    }
    read(buf) {
            this.ids=TypeIO.readIntSeq(buf)
    }
    handleClient(n) {
            n.hiddenSnapshot(ids)
    }
}
Packets.set(37, HiddenSnapshotCallPacket);
class HideFollowUpMenuCallPacket extends Packet {
    _id = 38;
    menuId;
    write(buf) {
            buf.putInt(this.menuId)
    }
    read(buf) {
            this.menuId = buf.getInt()
    }
    handleClient(n) {
            
    }
}
Packets.set(38, HideFollowUpMenuCallPacket);
class HideHudTextCallPacket extends Packet {
    _id = 39;
    write(buf) {
    
    }
    read(buf) {
    
    }
    handleClient(n) {
            
    }
}
Packets.set(39, HideHudTextCallPacket);
class InfoMessageCallPacket extends Packet {
    _id = 40;
    message;
    write(buf) {
            TypeIO.writeString(buf,this.message)
    }
    read(buf) {
            this.message=TypeIO.readString(buf)
    }
    handleClient(n) {
            
    }
}
Packets.set(40, InfoMessageCallPacket);
class InfoPopupCallPacket extends Packet {
    _id = 41;
    message;
    duration;
    align;
    top;
    left;
    bottom;
    right;
    write(buf) {
            TypeIO.writeString(buf,this.message);
        buf.putFloat(this.duration);
        buf.putInt(this.align);
        buf.putInt(this.top);
        buf.putInt(this.left);
        buf.putInt(this.bottom);
        buf.putInt(this.right)
    }
    read(buf) {
            this.message=TypeIO.readString(buf);
        this.duration = buf.getFloat();
        this.align = buf.getInt();
        this.top = buf.getInt();
        this.left = buf.getInt();
        this.bottom = buf.getInt();
        this.right = buf.getInt()
    }
    handleClient(n) {
            
    }
}
Packets.set(41, InfoPopupCallPacket);
class InfoPopupReliableCallPacket extends Packet {
    _id = 42;
    message;
    duration;
    align;
    top;
    left;
    bottom;
    right;
    write(buf) {
            TypeIO.writeString(buf,this.message);
        buf.putFloat(this.duration);
        buf.putInt(this.align);
        buf.putInt(this.top);
        buf.putInt(this.left);
        buf.putInt(this.bottom);
        buf.putInt(this.right)
    }
    read(buf) {
            this.message=TypeIO.readString(buf);
        this.duration = buf.getFloat();
        this.align = buf.getInt();
        this.top = buf.getInt();
        this.left = buf.getInt();
        this.bottom = buf.getInt();
        this.right = buf.getInt()
    }
    handleClient(n) {
            
    }
}
Packets.set(42, InfoPopupReliableCallPacket);
class InfoToastCallPacket extends Packet {
    _id = 43;
    message;
    duration;
    write(buf) {
            TypeIO.writeString(buf,this.message);
        buf.putFloat(this.duration)
    }
    read(buf) {
            this.message=TypeIO.readString(buf);
        this.duration = buf.getFloat()
    }
    handleClient(n) {
            
    }
}
Packets.set(43, InfoToastCallPacket);
class KickCallPacket extends Packet {
    _id = 44;
    reason;
    getPriority() {
            return 2
    }
    write(buf) {
            TypeIO.writeString(buf,this.reason)
    }
    read(buf) {
            this.reason=TypeIO.readString(buf)
    }
    handleClient(n) {
            n.kick(reason)
    }
}
Packets.set(44, KickCallPacket);
class KickCallPacket2 extends Packet {
    _id = 45;
    reason;
    getPriority() {
            return 2
    }
    write(buf) {
            TypeIO.writeKick(buf,this.reason)
    }
    read(buf) {
            this.reason=TypeIO.readKick(buf)
    }
    handleClient(n) {
            n.kick(reason)
    }
}
Packets.set(45, KickCallPacket2);
class LabelCallPacket extends Packet {
    _id = 46;
    message;
    duration;
    worldx;
    worldy;
    write(buf) {
            TypeIO.writeString(buf,this.message);
        buf.putFloat(this.duration);
        buf.putFloat(this.worldx);
        buf.putFloat(this.worldy)
    }
    read(buf) {
            this.message=TypeIO.readString(buf);
        this.duration = buf.getFloat();
        this.worldx = buf.getFloat();
        this.worldy = buf.getFloat()
    }
    handleClient(n) {
            
    }
}
Packets.set(46, LabelCallPacket);
class LabelReliableCallPacket extends Packet {
    _id = 47;
    message;
    duration;
    worldx;
    worldy;
    write(buf) {
            TypeIO.writeString(buf,this.message);
        buf.putFloat(this.duration);
        buf.putFloat(this.worldx);
        buf.putFloat(this.worldy)
    }
    read(buf) {
            this.message=TypeIO.readString(buf);
        this.duration = buf.getFloat();
        this.worldx = buf.getFloat();
        this.worldy = buf.getFloat()
    }
    handleClient(n) {
            
    }
}
Packets.set(47, LabelReliableCallPacket);
class LogicExplosionCallPacket extends Packet {
    _id = 48;
    team;
    x;
    y;
    radius;
    damage;
    air;
    ground;
    pierce;
    write(buf) {
            TypeIO.writeTeam(buf,this.team);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        buf.putFloat(this.radius);
        buf.putFloat(this.damage);
        buf.put(this.air);
        buf.put(this.ground);
        buf.put(this.pierce)
    }
    read(buf) {
            this.team=TypeIO.readTeam(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.radius = buf.getFloat();
        this.damage = buf.getFloat();
        this.air = buf.get();
        this.ground = buf.get();
        this.pierce = buf.get()
    }
    handleClient(n) {
            mindustry.logic.LExecutor.logicExplosion(team, x, y, radius, damage, air, ground, pierce)
    }
}
Packets.set(48, LogicExplosionCallPacket);
class MenuCallPacket extends Packet {
    _id = 49;
    menuId;
    title;
    message;
    options;
    write(buf) {
            buf.putInt(this.menuId);
        TypeIO.writeString(buf,this.title);
        TypeIO.writeString(buf,this.message);
        TypeIO.writeStringArray(buf,this.options)
    }
    read(buf) {
            this.menuId = buf.getInt();
        this.title=TypeIO.readString(buf);
        this.message=TypeIO.readString(buf);
        this.options=TypeIO.readStringArray(buf)
    }
    handleClient(n) {
            
    }
}
Packets.set(49, MenuCallPacket);
class MenuChooseCallPacket extends Packet {
    _id = 50;
    player;
    menuId;
    option;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        buf.putInt(this.menuId);
        buf.putInt(this.option)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.menuId = buf.getInt();
        this.option = buf.getInt()
    }
    handleServer(n) {
            
    }
    handleClient(n) {
            
    }
}
Packets.set(50, MenuChooseCallPacket);
class ObjectiveCompletedCallPacket extends Packet {
    _id = 51;
    flagsRemoved;
    flagsAdded;
    write(buf) {
            TypeIO.writeStrings(buf,this.flagsRemoved);
        TypeIO.writeStrings(buf,this.flagsAdded)
    }
    read(buf) {
            this.flagsRemoved=TypeIO.readStrings(buf);
        this.flagsAdded=TypeIO.readStrings(buf)
    }
    handleClient(n) {
            n.objectiveCompleted(flagsRemoved, flagsAdded)
    }
}
Packets.set(51, ObjectiveCompletedCallPacket);
class OpenURICallPacket extends Packet {
    _id = 52;
    uri;
    write(buf) {
            TypeIO.writeString(buf,this.uri)
    }
    read(buf) {
            this.uri=TypeIO.readString(buf)
    }
    handleClient(n) {
            
    }
}
Packets.set(52, OpenURICallPacket);
class PayloadDroppedCallPacket extends Packet {
    _id = 53;
    unit;
    x;
    y;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit);
        buf.putFloat(this.x);
        buf.putFloat(this.y)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat()
    }
    handleClient(n) {
            InputHandler.payloadDropped(unit, x, y)
    }
}
Packets.set(53, PayloadDroppedCallPacket);
class PickedBuildPayloadCallPacket extends Packet {
    _id = 54;
    unit;
    build;
    onGround;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit);
        TypeIO.writeBuilding(buf,this.build);
        buf.put(this.onGround)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf);
        this.build=TypeIO.readBuilding(buf);
        this.onGround = buf.get()
    }
    handleClient(n) {
            InputHandler.pickedBuildPayload(unit, build, onGround)
    }
}
Packets.set(54, PickedBuildPayloadCallPacket);
class PickedUnitPayloadCallPacket extends Packet {
    _id = 55;
    unit;
    target;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit);
        TypeIO.writeUnit(buf,this.target)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf);
        this.target=TypeIO.readUnit(buf)
    }
    handleClient(n) {
            InputHandler.pickedUnitPayload(unit, target)
    }
}
Packets.set(55, PickedUnitPayloadCallPacket);
class PingCallPacket extends Packet {
    _id = 56;
    time;
    write(buf) {
            buf.putLong(this.time)
    }
    read(buf) {
            this.time = buf.getLong()
    }
    handleServer(n) {
            n.ping(player, time)
    }
}
Packets.set(56, PingCallPacket);
class PingResponseCallPacket extends Packet {
    _id = 57;
    time;
    write(buf) {
            buf.putLong(this.time)
    }
    read(buf) {
            this.time = buf.getLong()
    }
    handleClient(n) {
            n.pingResponse(time)
    }
}
Packets.set(57, PingResponseCallPacket);
class PlayerDisconnectCallPacket extends Packet {
    _id = 58;
    playerid;
    write(buf) {
            buf.putInt(this.playerid)
    }
    read(buf) {
            this.playerid = buf.getInt()
    }
    handleClient(n) {
            n.playerDisconnect(playerid)
    }
}
Packets.set(58, PlayerDisconnectCallPacket);
class PlayerSpawnCallPacket extends Packet {
    _id = 59;
    tile;
    player;
    write(buf) {
            TypeIO.writeTile(buf,this.tile);
        TypeIO.writeEntity(buf,this.player)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf);
        this.player=TypeIO.readEntity(buf)
    }
    handleClient(n) {
            mindustry.world.blocks.storage.CoreBlock.playerSpawn(tile, player)
    }
}
Packets.set(59, PlayerSpawnCallPacket);
class RemoveQueueBlockCallPacket extends Packet {
    _id = 60;
    x;
    y;
    breaking;
    write(buf) {
            buf.putInt(this.x);
        buf.putInt(this.y);
        buf.put(this.breaking)
    }
    read(buf) {
            this.x = buf.getInt();
        this.y = buf.getInt();
        this.breaking = buf.get()
    }
    handleClient(n) {
            InputHandler.removeQueueBlock(x, y, breaking)
    }
}
Packets.set(60, RemoveQueueBlockCallPacket);
class RemoveTileCallPacket extends Packet {
    _id = 61;
    tile;
    write(buf) {
            TypeIO.writeTile(buf,this.tile)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf)
    }
    handleClient(n) {
            Tile.removeTile(tile)
    }
}
Packets.set(61, RemoveTileCallPacket);
class RemoveWorldLabelCallPacket extends Packet {
    _id = 62;
    id;
    write(buf) {
            buf.putInt(this.id)
    }
    read(buf) {
            this.id = buf.getInt()
    }
    handleClient(n) {
            
    }
}
Packets.set(62, RemoveWorldLabelCallPacket);
class RequestBuildPayloadCallPacket extends Packet {
    _id = 63;
    player;
    build;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeBuilding(buf,this.build)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.build=TypeIO.readBuilding(buf)
    }
    handleServer(n) {
            InputHandler.requestBuildPayload(player, build)
    }
    handleClient(n) {
            InputHandler.requestBuildPayload(player, build)
    }
}
Packets.set(63, RequestBuildPayloadCallPacket);
class RequestDebugStatusCallPacket extends Packet {
    _id = 64;
    write(buf) {
    
    }
    read(buf) {
    
    }
    handleServer(n) {
            n.requestDebugStatus(player)
    }
}
Packets.set(64, RequestDebugStatusCallPacket);
class RequestDropPayloadCallPacket extends Packet {
    _id = 65;
    player;
    x;
    y;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        buf.putFloat(this.x);
        buf.putFloat(this.y)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat()
    }
    handleServer(n) {
            InputHandler.requestDropPayload(player, x, y)
    }
    handleClient(n) {
            InputHandler.requestDropPayload(player, x, y)
    }
}
Packets.set(65, RequestDropPayloadCallPacket);
class RequestItemCallPacket extends Packet {
    _id = 66;
    player;
    build;
    item;
    amount;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeBuilding(buf,this.build);
        TypeIO.writeItem(buf,this.item);
        buf.putInt(this.amount)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.build=TypeIO.readBuilding(buf);
        this.item=TypeIO.readItem(buf);
        this.amount = buf.getInt()
    }
    handleServer(n) {
            InputHandler.requestItem(player, build, item, amount)
    }
    handleClient(n) {
            InputHandler.requestItem(player, build, item, amount)
    }
}
Packets.set(66, RequestItemCallPacket);
class RequestUnitPayloadCallPacket extends Packet {
    _id = 67;
    player;
    target;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeUnit(buf,this.target)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.target=TypeIO.readUnit(buf)
    }
    handleServer(n) {
            InputHandler.requestUnitPayload(player, target)
    }
    handleClient(n) {
            InputHandler.requestUnitPayload(player, target)
    }
}
Packets.set(67, RequestUnitPayloadCallPacket);
class ResearchedCallPacket extends Packet {
    _id = 68;
    content;
    write(buf) {
            TypeIO.writeContent(buf,this.content)
    }
    read(buf) {
            this.content=TypeIO.readContent(buf)
    }
    handleClient(n) {
            mindustry.core.Logic.researched(content)
    }
}
Packets.set(68, ResearchedCallPacket);
class RotateBlockCallPacket extends Packet {
    _id = 69;
    player;
    build;
    direction;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeBuilding(buf,this.build);
        buf.put(this.direction)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.build=TypeIO.readBuilding(buf);
        this.direction = buf.get()
    }
    handleServer(n) {
            InputHandler.rotateBlock(player, build, direction)
    }
    handleClient(n) {
            InputHandler.rotateBlock(player, build, direction)
    }
}
Packets.set(69, RotateBlockCallPacket);
class SectorCaptureCallPacket extends Packet {
    _id = 70;
    write(buf) {
    
    }
    read(buf) {
    
    }
    handleClient(n) {
            mindustry.core.Logic.sectorCapture()
    }
}
Packets.set(70, SectorCaptureCallPacket);
class SendChatMessageCallPacket extends Packet {
    _id = 71;
    message;
    write(buf) {
            TypeIO.writeString(buf,this.message)
    }
    read(buf) {
            this.message=TypeIO.readString(buf)
    }
    handleServer(n) {
            n.sendChatMessage(player, message)
    }
}
Packets.set(71, SendChatMessageCallPacket);
class SendMessageCallPacket extends Packet {
    _id = 72;
    message;
    write(buf) {
            TypeIO.writeString(buf,this.message)
    }
    read(buf) {
            this.message=TypeIO.readString(buf)
    }
    handleClient(n) {
            n.sendMessage(message)
    }
}
Packets.set(72, SendMessageCallPacket);
class SendMessageCallPacket2 extends Packet {
    _id = 73;
    message;
    unformatted;
    playersender;
    write(buf) {
            TypeIO.writeString(buf,this.message);
        TypeIO.writeString(buf,this.unformatted);
        TypeIO.writeEntity(buf,this.playersender)
    }
    read(buf) {
            this.message=TypeIO.readString(buf);
        this.unformatted=TypeIO.readString(buf);
        this.playersender=TypeIO.readEntity(buf)
    }
    handleClient(n) {
            n.sendMessage(message, unformatted, playersender)
    }
}
Packets.set(73, SendMessageCallPacket2);
class ServerPacketReliableCallPacket extends Packet {
    _id = 74;
    type;
    contents;
    write(buf) {
            TypeIO.writeString(buf,this.type);
        TypeIO.writeString(buf,this.contents)
    }
    read(buf) {
            this.type=TypeIO.readString(buf);
        this.contents=TypeIO.readString(buf)
    }
    handleServer(n) {
            n.serverPacketReliable(player, type, contents)
    }
}
Packets.set(74, ServerPacketReliableCallPacket);
class ServerPacketUnreliableCallPacket extends Packet {
    _id = 75;
    type;
    contents;
    write(buf) {
            TypeIO.writeString(buf,this.type);
        TypeIO.writeString(buf,this.contents)
    }
    read(buf) {
            this.type=TypeIO.readString(buf);
        this.contents=TypeIO.readString(buf)
    }
    handleServer(n) {
            n.serverPacketUnreliable(player, type, contents)
    }
}
Packets.set(75, ServerPacketUnreliableCallPacket);
class SetCameraPositionCallPacket extends Packet {
    _id = 76;
    x;
    y;
    write(buf) {
            buf.putFloat(this.x);
        buf.putFloat(this.y)
    }
    read(buf) {
            this.x = buf.getFloat();
        this.y = buf.getFloat()
    }
    handleClient(n) {
            n.setCameraPosition(x, y)
    }
}
Packets.set(76, SetCameraPositionCallPacket);
class SetFlagCallPacket extends Packet {
    _id = 77;
    flag;
    add;
    write(buf) {
            TypeIO.writeString(buf,this.flag);
        buf.put(this.add)
    }
    read(buf) {
            this.flag=TypeIO.readString(buf);
        this.add = buf.get()
    }
    handleClient(n) {
            mindustry.logic.LExecutor.setFlag(flag, add)
    }
}
Packets.set(77, SetFlagCallPacket);
class SetFloorCallPacket extends Packet {
    _id = 78;
    tile;
    floor;
    overlay;
    write(buf) {
            TypeIO.writeTile(buf,this.tile);
        TypeIO.writeBlock(buf,this.floor);
        TypeIO.writeBlock(buf,this.overlay)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf);
        this.floor=TypeIO.readBlock(buf);
        this.overlay=TypeIO.readBlock(buf)
    }
    handleClient(n) {
            Tile.setFloor(tile, floor, overlay)
    }
}
Packets.set(78, SetFloorCallPacket);
class SetHudTextCallPacket extends Packet {
    _id = 79;
    message;
    write(buf) {
            TypeIO.writeString(buf,this.message)
    }
    read(buf) {
            this.message=TypeIO.readString(buf)
    }
    handleClient(n) {
            
    }
}
Packets.set(79, SetHudTextCallPacket);
class SetHudTextReliableCallPacket extends Packet {
    _id = 80;
    message;
    write(buf) {
            TypeIO.writeString(buf,this.message)
    }
    read(buf) {
            this.message=TypeIO.readString(buf)
    }
    handleClient(n) {
            
    }
}
Packets.set(80, SetHudTextReliableCallPacket);
class SetItemCallPacket extends Packet {
    _id = 81;
    build;
    item;
    amount;
    write(buf) {
            TypeIO.writeBuilding(buf,this.build);
        TypeIO.writeItem(buf,this.item);
        buf.putInt(this.amount)
    }
    read(buf) {
            this.build=TypeIO.readBuilding(buf);
        this.item=TypeIO.readItem(buf);
        this.amount = buf.getInt()
    }
    handleClient(n) {
            InputHandler.setItem(build, item, amount)
    }
}
Packets.set(81, SetItemCallPacket);
class SetMapAreaCallPacket extends Packet {
    _id = 82;
    x;
    y;
    w;
    h;
    write(buf) {
            buf.putInt(this.x);
        buf.putInt(this.y);
        buf.putInt(this.w);
        buf.putInt(this.h)
    }
    read(buf) {
            this.x = buf.getInt();
        this.y = buf.getInt();
        this.w = buf.getInt();
        this.h = buf.getInt()
    }
    handleClient(n) {
            mindustry.logic.LExecutor.setMapArea(x, y, w, h)
    }
}
Packets.set(82, SetMapAreaCallPacket);
class SetObjectivesCallPacket extends Packet {
    _id = 83;
    executor;
    write(buf) {
            TypeIO.writeObjectives(buf,this.executor)
    }
    read(buf) {
            this.executor=TypeIO.readObjectives(buf)
    }
    handleClient(n) {
            n.setObjectives(executor)
    }
}
Packets.set(83, SetObjectivesCallPacket);
class SetOverlayCallPacket extends Packet {
    _id = 84;
    tile;
    overlay;
    write(buf) {
            TypeIO.writeTile(buf,this.tile);
        TypeIO.writeBlock(buf,this.overlay)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf);
        this.overlay=TypeIO.readBlock(buf)
    }
    handleClient(n) {
            Tile.setOverlay(tile, overlay)
    }
}
Packets.set(84, SetOverlayCallPacket);
class SetPlayerTeamEditorCallPacket extends Packet {
    _id = 85;
    player;
    team;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeTeam(buf,this.team)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.team=TypeIO.readTeam(buf)
    }
    handleServer(n) {
            
    }
    handleClient(n) {
            
    }
}
Packets.set(85, SetPlayerTeamEditorCallPacket);
class SetPositionCallPacket extends Packet {
    _id = 86;
    x;
    y;
    write(buf) {
            buf.putFloat(this.x);
        buf.putFloat(this.y)
    }
    read(buf) {
            this.x = buf.getFloat();
        this.y = buf.getFloat()
    }
    handleClient(n) {
            n.setPosition(x, y)
    }
}
Packets.set(86, SetPositionCallPacket);
class SetRulesCallPacket extends Packet {
    _id = 87;
    rules;
    write(buf) {
            TypeIO.writeRules(buf,this.rules)
    }
    read(buf) {
            this.rules=TypeIO.readRules(buf)
    }
    handleClient(n) {
            n.setRules(rules)
    }
}
Packets.set(87, SetRulesCallPacket);
class SetTeamCallPacket extends Packet {
    _id = 88;
    build;
    team;
    write(buf) {
            TypeIO.writeBuilding(buf,this.build);
        TypeIO.writeTeam(buf,this.team)
    }
    read(buf) {
            this.build=TypeIO.readBuilding(buf);
        this.team=TypeIO.readTeam(buf)
    }
    handleClient(n) {
            Tile.setTeam(build, team)
    }
}
Packets.set(88, SetTeamCallPacket);
class SetTileCallPacket extends Packet {
    _id = 89;
    tile;
    block;
    team;
    rotation;
    write(buf) {
            TypeIO.writeTile(buf,this.tile);
        TypeIO.writeBlock(buf,this.block);
        TypeIO.writeTeam(buf,this.team);
        buf.putInt(this.rotation)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf);
        this.block=TypeIO.readBlock(buf);
        this.team=TypeIO.readTeam(buf);
        this.rotation = buf.getInt()
    }
    handleClient(n) {
            Tile.setTile(tile, block, team, rotation)
    }
}
Packets.set(89, SetTileCallPacket);
class SetUnitCommandCallPacket extends Packet {
    _id = 90;
    player;
    unitIds;
    command;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeInts(buf,this.unitIds);
        TypeIO.writeCommand(buf,this.command)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.unitIds=TypeIO.readInts(buf);
        this.command=TypeIO.readCommand(buf)
    }
    handleServer(n) {
            InputHandler.setUnitCommand(player, unitIds, command)
    }
    handleClient(n) {
            InputHandler.setUnitCommand(player, unitIds, command)
    }
}
Packets.set(90, SetUnitCommandCallPacket);
class SoundCallPacket extends Packet {
    _id = 91;
    sound;
    volume;
    pitch;
    pan;
    write(buf) {
            TypeIO.writeSound(buf,this.sound);
        buf.putFloat(this.volume);
        buf.putFloat(this.pitch);
        buf.putFloat(this.pan)
    }
    read(buf) {
            this.sound=TypeIO.readSound(buf);
        this.volume = buf.getFloat();
        this.pitch = buf.getFloat();
        this.pan = buf.getFloat()
    }
    handleClient(n) {
            n.sound(sound, volume, pitch, pan)
    }
}
Packets.set(91, SoundCallPacket);
class SoundAtCallPacket extends Packet {
    _id = 92;
    sound;
    x;
    y;
    volume;
    pitch;
    write(buf) {
            TypeIO.writeSound(buf,this.sound);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        buf.putFloat(this.volume);
        buf.putFloat(this.pitch)
    }
    read(buf) {
            this.sound=TypeIO.readSound(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.volume = buf.getFloat();
        this.pitch = buf.getFloat()
    }
    handleClient(n) {
            n.soundAt(sound, x, y, volume, pitch)
    }
}
Packets.set(92, SoundAtCallPacket);
class SpawnEffectCallPacket extends Packet {
    _id = 93;
    x;
    y;
    rotation;
    u;
    write(buf) {
            buf.putFloat(this.x);
        buf.putFloat(this.y);
        buf.putFloat(this.rotation);
        TypeIO.writeUnitType(buf,this.u)
    }
    read(buf) {
            this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.rotation = buf.getFloat();
        this.u=TypeIO.readUnitType(buf)
    }
    handleClient(n) {
            mindustry.ai.WaveSpawner.spawnEffect(x, y, rotation, u)
    }
}
Packets.set(93, SpawnEffectCallPacket);
class StateSnapshotCallPacket extends Packet {
    _id = 94;
    waveTime;
    wave;
    enemies;
    paused;
    gameOver;
    timeData;
    tps;
    rand0;
    rand1;
    coreData;
    getPriority() {
            return 0
    }
    write(buf) {
            buf.putFloat(this.waveTime);
        buf.putInt(this.wave);
        buf.putInt(this.enemies);
        buf.put(this.paused);
        buf.put(this.gameOver);
        buf.putInt(this.timeData);
        buf.put(this.tps);
        buf.putLong(this.rand0);
        buf.putLong(this.rand1);
        TypeIO.writeBytes(buf,this.coreData)
    }
    read(buf) {
            this.waveTime = buf.getFloat();
        this.wave = buf.getInt();
        this.enemies = buf.getInt();
        this.paused = buf.get();
        this.gameOver = buf.get();
        this.timeData = buf.getInt();
        this.tps = buf.get();
        this.rand0 = buf.getLong();
        this.rand1 = buf.getLong();
        this.coreData=TypeIO.readBytes(buf)
    }
    handleClient(n) {
            n.stateSnapshot(waveTime, wave, enemies, paused, gameOver, timeData, tps, rand0, rand1, coreData)
    }
}
Packets.set(94, StateSnapshotCallPacket);
class SyncVariableCallPacket extends Packet {
    _id = 95;
    building;
    variable;
    value;
    write(buf) {
            TypeIO.writeBuilding(buf,this.building);
        buf.putInt(this.variable);
        TypeIO.writeObject(buf,this.value)
    }
    read(buf) {
            this.building=TypeIO.readBuilding(buf);
        this.variable = buf.getInt();
        this.value=TypeIO.readObject(buf)
    }
    handleClient(n) {
            mindustry.logic.LExecutor.syncVariable(building, variable, value)
    }
}
Packets.set(95, SyncVariableCallPacket);
class TakeItemsCallPacket extends Packet {
    _id = 96;
    build;
    item;
    amount;
    to;
    write(buf) {
            TypeIO.writeBuilding(buf,this.build);
        TypeIO.writeItem(buf,this.item);
        buf.putInt(this.amount);
        TypeIO.writeUnit(buf,this.to)
    }
    read(buf) {
            this.build=TypeIO.readBuilding(buf);
        this.item=TypeIO.readItem(buf);
        this.amount = buf.getInt();
        this.to=TypeIO.readUnit(buf)
    }
    handleClient(n) {
            InputHandler.takeItems(build, item, amount, to)
    }
}
Packets.set(96, TakeItemsCallPacket);
class TextInputCallPacket extends Packet {
    _id = 97;
    textInputId;
    title;
    message;
    textLength;
    def;
    numeric;
    write(buf) {
            buf.putInt(this.textInputId);
        TypeIO.writeString(buf,this.title);
        TypeIO.writeString(buf,this.message);
        buf.putInt(this.textLength);
        TypeIO.writeString(buf,this.def);
        buf.put(this.numeric)
    }
    read(buf) {
            this.textInputId = buf.getInt();
        this.title=TypeIO.readString(buf);
        this.message=TypeIO.readString(buf);
        this.textLength = buf.getInt();
        this.def=TypeIO.readString(buf);
        this.numeric = buf.get()
    }
    handleClient(n) {
            
    }
}
Packets.set(97, TextInputCallPacket);
class TextInputResultCallPacket extends Packet {
    _id = 98;
    player;
    textInputId;
    text;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        buf.putInt(this.textInputId);
        TypeIO.writeString(buf,this.text)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.textInputId = buf.getInt();
        this.text=TypeIO.readString(buf)
    }
    handleServer(n) {
            
    }
    handleClient(n) {
            
    }
}
Packets.set(98, TextInputResultCallPacket);
class TileConfigCallPacket extends Packet {
    _id = 99;
    player;
    build;
    value;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeBuilding(buf,this.build);
        TypeIO.writeObject(buf,this.value)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.build=TypeIO.readBuilding(buf);
        this.value=TypeIO.readObject(buf)
    }
    handleServer(n) {
            InputHandler.tileConfig(player, build, value)
    }
    handleClient(n) {
            InputHandler.tileConfig(player, build, value)
    }
}
Packets.set(99, TileConfigCallPacket);
class TileTapCallPacket extends Packet {
    _id = 100;
    player;
    tile;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeTile(buf,this.tile)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.tile=TypeIO.readTile(buf)
    }
    handleServer(n) {
            InputHandler.tileTap(player, tile)
    }
    handleClient(n) {
            InputHandler.tileTap(player, tile)
    }
}
Packets.set(100, TileTapCallPacket);
class TraceInfoCallPacket extends Packet {
    _id = 101;
    player;
    info;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeTraceInfo(buf,this.info)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.info=TypeIO.readTraceInfo(buf)
    }
    handleClient(n) {
            n.traceInfo(player, info)
    }
}
Packets.set(101, TraceInfoCallPacket);
class TransferInventoryCallPacket extends Packet {
    _id = 102;
    player;
    build;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeBuilding(buf,this.build)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.build=TypeIO.readBuilding(buf)
    }
    handleServer(n) {
            InputHandler.transferInventory(player, build)
    }
    handleClient(n) {
            InputHandler.transferInventory(player, build)
    }
}
Packets.set(102, TransferInventoryCallPacket);
class TransferItemEffectCallPacket extends Packet {
    _id = 103;
    item;
    x;
    y;
    to;
    write(buf) {
            TypeIO.writeItem(buf,this.item);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        TypeIO.writeEntity(buf,this.to)
    }
    read(buf) {
            this.item=TypeIO.readItem(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.to=TypeIO.readEntity(buf)
    }
    handleClient(n) {
            InputHandler.transferItemEffect(item, x, y, to)
    }
}
Packets.set(103, TransferItemEffectCallPacket);
class TransferItemToCallPacket extends Packet {
    _id = 104;
    unit;
    item;
    amount;
    x;
    y;
    build;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit);
        TypeIO.writeItem(buf,this.item);
        buf.putInt(this.amount);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        TypeIO.writeBuilding(buf,this.build)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf);
        this.item=TypeIO.readItem(buf);
        this.amount = buf.getInt();
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.build=TypeIO.readBuilding(buf)
    }
    handleClient(n) {
            InputHandler.transferItemTo(unit, item, amount, x, y, build)
    }
}
Packets.set(104, TransferItemToCallPacket);
class TransferItemToUnitCallPacket extends Packet {
    _id = 105;
    item;
    x;
    y;
    to;
    write(buf) {
            TypeIO.writeItem(buf,this.item);
        buf.putFloat(this.x);
        buf.putFloat(this.y);
        TypeIO.writeEntity(buf,this.to)
    }
    read(buf) {
            this.item=TypeIO.readItem(buf);
        this.x = buf.getFloat();
        this.y = buf.getFloat();
        this.to=TypeIO.readEntity(buf)
    }
    handleClient(n) {
            InputHandler.transferItemToUnit(item, x, y, to)
    }
}
Packets.set(105, TransferItemToUnitCallPacket);
class UnitBlockSpawnCallPacket extends Packet {
    _id = 106;
    tile;
    write(buf) {
            TypeIO.writeTile(buf,this.tile)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf)
    }
    handleClient(n) {
            mindustry.world.blocks.units.UnitBlock.unitBlockSpawn(tile)
    }
}
Packets.set(106, UnitBlockSpawnCallPacket);
class UnitBuildingControlSelectCallPacket extends Packet {
    _id = 107;
    unit;
    build;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit);
        TypeIO.writeBuilding(buf,this.build)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf);
        this.build=TypeIO.readBuilding(buf)
    }
    handleClient(n) {
            InputHandler.unitBuildingControlSelect(unit, build)
    }
}
Packets.set(107, UnitBuildingControlSelectCallPacket);
class UnitCapDeathCallPacket extends Packet {
    _id = 108;
    unit;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf)
    }
    handleClient(n) {
            mindustry.entities.Units.unitCapDeath(unit)
    }
}
Packets.set(108, UnitCapDeathCallPacket);
class UnitClearCallPacket extends Packet {
    _id = 109;
    player;
    write(buf) {
            TypeIO.writeEntity(buf,this.player)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf)
    }
    handleServer(n) {
            InputHandler.unitClear(player)
    }
    handleClient(n) {
            InputHandler.unitClear(player)
    }
}
Packets.set(109, UnitClearCallPacket);
class UnitControlCallPacket extends Packet {
    _id = 110;
    player;
    unit;
    write(buf) {
            TypeIO.writeEntity(buf,this.player);
        TypeIO.writeUnit(buf,this.unit)
    }
    read(buf) {
            this.player=TypeIO.readEntity(buf);
        this.unit=TypeIO.readUnit(buf)
    }
    handleServer(n) {
            InputHandler.unitControl(player, unit)
    }
    handleClient(n) {
            InputHandler.unitControl(player, unit)
    }
}
Packets.set(110, UnitControlCallPacket);
class UnitDeathCallPacket extends Packet {
    _id = 111;
    uid;
    write(buf) {
            buf.putInt(this.uid)
    }
    read(buf) {
            this.uid = buf.getInt()
    }
    handleClient(n) {
            mindustry.entities.Units.unitDeath(uid)
    }
}
Packets.set(111, UnitDeathCallPacket);
class UnitDespawnCallPacket extends Packet {
    _id = 112;
    unit;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf)
    }
    handleClient(n) {
            mindustry.entities.Units.unitDespawn(unit)
    }
}
Packets.set(112, UnitDespawnCallPacket);
class UnitDestroyCallPacket extends Packet {
    _id = 113;
    uid;
    write(buf) {
            buf.putInt(this.uid)
    }
    read(buf) {
            this.uid = buf.getInt()
    }
    handleClient(n) {
            mindustry.entities.Units.unitDestroy(uid)
    }
}
Packets.set(113, UnitDestroyCallPacket);
class UnitEnvDeathCallPacket extends Packet {
    _id = 114;
    unit;
    write(buf) {
            TypeIO.writeUnit(buf,this.unit)
    }
    read(buf) {
            this.unit=TypeIO.readUnit(buf)
    }
    handleClient(n) {
            mindustry.entities.Units.unitEnvDeath(unit)
    }
}
Packets.set(114, UnitEnvDeathCallPacket);
class UnitTetherBlockSpawnedCallPacket extends Packet {
    _id = 115;
    tile;
    id;
    write(buf) {
            TypeIO.writeTile(buf,this.tile);
        buf.putInt(this.id)
    }
    read(buf) {
            this.tile=TypeIO.readTile(buf);
        this.id = buf.getInt()
    }
    handleClient(n) {
            mindustry.world.blocks.units.UnitCargoLoader.unitTetherBlockSpawned(tile, id)
    }
}
Packets.set(115, UnitTetherBlockSpawnedCallPacket);
class UpdateGameOverCallPacket extends Packet {
    _id = 116;
    winner;
    write(buf) {
            TypeIO.writeTeam(buf,this.winner)
    }
    read(buf) {
            this.winner=TypeIO.readTeam(buf)
    }
    handleClient(n) {
            mindustry.core.Logic.updateGameOver(winner)
    }
}
Packets.set(116, UpdateGameOverCallPacket);
class WarningToastCallPacket extends Packet {
    _id = 117;
    unicode;
    text;
    write(buf) {
            buf.putInt(this.unicode);
        TypeIO.writeString(buf,this.text)
    }
    read(buf) {
            this.unicode = buf.getInt();
        this.text=TypeIO.readString(buf)
    }
    handleClient(n) {
            
    }
}
Packets.set(117, WarningToastCallPacket);
class WorldDataBeginCallPacket extends Packet {
    _id = 118;
    write(buf) {
    
    }
    read(buf) {
    
    }
    handleClient(n) {
            n.worldDataBegin()
    }
}
Packets.set(118, WorldDataBeginCallPacket);
global.AdminRequestCallPacket = AdminRequestCallPacket;
global.AnnounceCallPacket = AnnounceCallPacket;
global.AssemblerDroneSpawnedCallPacket = AssemblerDroneSpawnedCallPacket;
global.AssemblerUnitSpawnedCallPacket = AssemblerUnitSpawnedCallPacket;
global.AutoDoorToggleCallPacket = AutoDoorToggleCallPacket;
global.BeginBreakCallPacket = BeginBreakCallPacket;
global.BeginPlaceCallPacket = BeginPlaceCallPacket;
global.BlockSnapshotCallPacket = BlockSnapshotCallPacket;
global.BuildDestroyedCallPacket = BuildDestroyedCallPacket;
global.BuildHealthUpdateCallPacket = BuildHealthUpdateCallPacket;
global.BuildingControlSelectCallPacket = BuildingControlSelectCallPacket;
global.ClearItemsCallPacket = ClearItemsCallPacket;
global.ClientPacketReliableCallPacket = ClientPacketReliableCallPacket;
global.ClientPacketUnreliableCallPacket = ClientPacketUnreliableCallPacket;
global.ClientSnapshotCallPacket = ClientSnapshotCallPacket;
global.CommandBuildingCallPacket = CommandBuildingCallPacket;
global.CommandUnitsCallPacket = CommandUnitsCallPacket;
global.ConnectCallPacket = ConnectCallPacket;
global.ConnectConfirmCallPacket = ConnectConfirmCallPacket;
global.ConstructFinishCallPacket = ConstructFinishCallPacket;
global.CreateBulletCallPacket = CreateBulletCallPacket;
global.CreateWeatherCallPacket = CreateWeatherCallPacket;
global.DebugStatusClientCallPacket = DebugStatusClientCallPacket;
global.DebugStatusClientUnreliableCallPacket = DebugStatusClientUnreliableCallPacket;
global.DeconstructFinishCallPacket = DeconstructFinishCallPacket;
global.DeletePlansCallPacket = DeletePlansCallPacket;
global.DropItemCallPacket = DropItemCallPacket;
global.EffectCallPacket = EffectCallPacket;
global.EffectCallPacket2 = EffectCallPacket2;
global.EffectReliableCallPacket = EffectReliableCallPacket;
global.EntitySnapshotCallPacket = EntitySnapshotCallPacket;
global.FollowUpMenuCallPacket = FollowUpMenuCallPacket;
global.GameOverCallPacket = GameOverCallPacket;
global.HiddenSnapshotCallPacket = HiddenSnapshotCallPacket;
global.HideFollowUpMenuCallPacket = HideFollowUpMenuCallPacket;
global.HideHudTextCallPacket = HideHudTextCallPacket;
global.InfoMessageCallPacket = InfoMessageCallPacket;
global.InfoPopupCallPacket = InfoPopupCallPacket;
global.InfoPopupReliableCallPacket = InfoPopupReliableCallPacket;
global.InfoToastCallPacket = InfoToastCallPacket;
global.KickCallPacket = KickCallPacket;
global.KickCallPacket2 = KickCallPacket2;
global.LabelCallPacket = LabelCallPacket;
global.LabelReliableCallPacket = LabelReliableCallPacket;
global.LogicExplosionCallPacket = LogicExplosionCallPacket;
global.MenuCallPacket = MenuCallPacket;
global.MenuChooseCallPacket = MenuChooseCallPacket;
global.ObjectiveCompletedCallPacket = ObjectiveCompletedCallPacket;
global.OpenURICallPacket = OpenURICallPacket;
global.PayloadDroppedCallPacket = PayloadDroppedCallPacket;
global.PickedBuildPayloadCallPacket = PickedBuildPayloadCallPacket;
global.PickedUnitPayloadCallPacket = PickedUnitPayloadCallPacket;
global.PingCallPacket = PingCallPacket;
global.PingResponseCallPacket = PingResponseCallPacket;
global.PlayerDisconnectCallPacket = PlayerDisconnectCallPacket;
global.PlayerSpawnCallPacket = PlayerSpawnCallPacket;
global.RemoveQueueBlockCallPacket = RemoveQueueBlockCallPacket;
global.RemoveTileCallPacket = RemoveTileCallPacket;
global.RemoveWorldLabelCallPacket = RemoveWorldLabelCallPacket;
global.RequestBuildPayloadCallPacket = RequestBuildPayloadCallPacket;
global.RequestDebugStatusCallPacket = RequestDebugStatusCallPacket;
global.RequestDropPayloadCallPacket = RequestDropPayloadCallPacket;
global.RequestItemCallPacket = RequestItemCallPacket;
global.RequestUnitPayloadCallPacket = RequestUnitPayloadCallPacket;
global.ResearchedCallPacket = ResearchedCallPacket;
global.RotateBlockCallPacket = RotateBlockCallPacket;
global.SectorCaptureCallPacket = SectorCaptureCallPacket;
global.SendChatMessageCallPacket = SendChatMessageCallPacket;
global.SendMessageCallPacket = SendMessageCallPacket;
global.SendMessageCallPacket2 = SendMessageCallPacket2;
global.ServerPacketReliableCallPacket = ServerPacketReliableCallPacket;
global.ServerPacketUnreliableCallPacket = ServerPacketUnreliableCallPacket;
global.SetCameraPositionCallPacket = SetCameraPositionCallPacket;
global.SetFlagCallPacket = SetFlagCallPacket;
global.SetFloorCallPacket = SetFloorCallPacket;
global.SetHudTextCallPacket = SetHudTextCallPacket;
global.SetHudTextReliableCallPacket = SetHudTextReliableCallPacket;
global.SetItemCallPacket = SetItemCallPacket;
global.SetMapAreaCallPacket = SetMapAreaCallPacket;
global.SetObjectivesCallPacket = SetObjectivesCallPacket;
global.SetOverlayCallPacket = SetOverlayCallPacket;
global.SetPlayerTeamEditorCallPacket = SetPlayerTeamEditorCallPacket;
global.SetPositionCallPacket = SetPositionCallPacket;
global.SetRulesCallPacket = SetRulesCallPacket;
global.SetTeamCallPacket = SetTeamCallPacket;
global.SetTileCallPacket = SetTileCallPacket;
global.SetUnitCommandCallPacket = SetUnitCommandCallPacket;
global.SoundCallPacket = SoundCallPacket;
global.SoundAtCallPacket = SoundAtCallPacket;
global.SpawnEffectCallPacket = SpawnEffectCallPacket;
global.StateSnapshotCallPacket = StateSnapshotCallPacket;
global.SyncVariableCallPacket = SyncVariableCallPacket;
global.TakeItemsCallPacket = TakeItemsCallPacket;
global.TextInputCallPacket = TextInputCallPacket;
global.TextInputResultCallPacket = TextInputResultCallPacket;
global.TileConfigCallPacket = TileConfigCallPacket;
global.TileTapCallPacket = TileTapCallPacket;
global.TraceInfoCallPacket = TraceInfoCallPacket;
global.TransferInventoryCallPacket = TransferInventoryCallPacket;
global.TransferItemEffectCallPacket = TransferItemEffectCallPacket;
global.TransferItemToCallPacket = TransferItemToCallPacket;
global.TransferItemToUnitCallPacket = TransferItemToUnitCallPacket;
global.UnitBlockSpawnCallPacket = UnitBlockSpawnCallPacket;
global.UnitBuildingControlSelectCallPacket = UnitBuildingControlSelectCallPacket;
global.UnitCapDeathCallPacket = UnitCapDeathCallPacket;
global.UnitClearCallPacket = UnitClearCallPacket;
global.UnitControlCallPacket = UnitControlCallPacket;
global.UnitDeathCallPacket = UnitDeathCallPacket;
global.UnitDespawnCallPacket = UnitDespawnCallPacket;
global.UnitDestroyCallPacket = UnitDestroyCallPacket;
global.UnitEnvDeathCallPacket = UnitEnvDeathCallPacket;
global.UnitTetherBlockSpawnedCallPacket = UnitTetherBlockSpawnedCallPacket;
global.UpdateGameOverCallPacket = UpdateGameOverCallPacket;
global.WarningToastCallPacket = WarningToastCallPacket;
global.WorldDataBeginCallPacket = WorldDataBeginCallPacket;
module.exports = {
    StreamBegin,
    StreamChunk,
    WorldStream,
    ConnectPacket,
    AdminRequestCallPacket,
    AnnounceCallPacket,
    AssemblerDroneSpawnedCallPacket,
    AssemblerUnitSpawnedCallPacket,
    AutoDoorToggleCallPacket,
    BeginBreakCallPacket,
    BeginPlaceCallPacket,
    BlockSnapshotCallPacket,
    BuildDestroyedCallPacket,
    BuildHealthUpdateCallPacket,
    BuildingControlSelectCallPacket,
    ClearItemsCallPacket,
    ClientPacketReliableCallPacket,
    ClientPacketUnreliableCallPacket,
    ClientSnapshotCallPacket,
    CommandBuildingCallPacket,
    CommandUnitsCallPacket,
    ConnectCallPacket,
    ConnectConfirmCallPacket,
    ConstructFinishCallPacket,
    CreateBulletCallPacket,
    CreateWeatherCallPacket,
    DebugStatusClientCallPacket,
    DebugStatusClientUnreliableCallPacket,
    DeconstructFinishCallPacket,
    DeletePlansCallPacket,
    DropItemCallPacket,
    EffectCallPacket,
    EffectCallPacket2,
    EffectReliableCallPacket,
    EntitySnapshotCallPacket,
    FollowUpMenuCallPacket,
    GameOverCallPacket,
    HiddenSnapshotCallPacket,
    HideFollowUpMenuCallPacket,
    HideHudTextCallPacket,
    InfoMessageCallPacket,
    InfoPopupCallPacket,
    InfoPopupReliableCallPacket,
    InfoToastCallPacket,
    KickCallPacket,
    KickCallPacket2,
    LabelCallPacket,
    LabelReliableCallPacket,
    LogicExplosionCallPacket,
    MenuCallPacket,
    MenuChooseCallPacket,
    ObjectiveCompletedCallPacket,
    OpenURICallPacket,
    PayloadDroppedCallPacket,
    PickedBuildPayloadCallPacket,
    PickedUnitPayloadCallPacket,
    PingCallPacket,
    PingResponseCallPacket,
    PlayerDisconnectCallPacket,
    PlayerSpawnCallPacket,
    RemoveQueueBlockCallPacket,
    RemoveTileCallPacket,
    RemoveWorldLabelCallPacket,
    RequestBuildPayloadCallPacket,
    RequestDebugStatusCallPacket,
    RequestDropPayloadCallPacket,
    RequestItemCallPacket,
    RequestUnitPayloadCallPacket,
    ResearchedCallPacket,
    RotateBlockCallPacket,
    SectorCaptureCallPacket,
    SendChatMessageCallPacket,
    SendMessageCallPacket,
    SendMessageCallPacket2,
    ServerPacketReliableCallPacket,
    ServerPacketUnreliableCallPacket,
    SetCameraPositionCallPacket,
    SetFlagCallPacket,
    SetFloorCallPacket,
    SetHudTextCallPacket,
    SetHudTextReliableCallPacket,
    SetItemCallPacket,
    SetMapAreaCallPacket,
    SetObjectivesCallPacket,
    SetOverlayCallPacket,
    SetPlayerTeamEditorCallPacket,
    SetPositionCallPacket,
    SetRulesCallPacket,
    SetTeamCallPacket,
    SetTileCallPacket,
    SetUnitCommandCallPacket,
    SoundCallPacket,
    SoundAtCallPacket,
    SpawnEffectCallPacket,
    StateSnapshotCallPacket,
    SyncVariableCallPacket,
    TakeItemsCallPacket,
    TextInputCallPacket,
    TextInputResultCallPacket,
    TileConfigCallPacket,
    TileTapCallPacket,
    TraceInfoCallPacket,
    TransferInventoryCallPacket,
    TransferItemEffectCallPacket,
    TransferItemToCallPacket,
    TransferItemToUnitCallPacket,
    UnitBlockSpawnCallPacket,
    UnitBuildingControlSelectCallPacket,
    UnitCapDeathCallPacket,
    UnitClearCallPacket,
    UnitControlCallPacket,
    UnitDeathCallPacket,
    UnitDespawnCallPacket,
    UnitDestroyCallPacket,
    UnitEnvDeathCallPacket,
    UnitTetherBlockSpawnedCallPacket,
    UpdateGameOverCallPacket,
    WarningToastCallPacket,
    WorldDataBeginCallPacket,
    get : n => Packets.get(n)
}
//CODEGEN from squi2rel (github.com/squi2rel/Mindustry-CN-ARC) build146;
const Packets = require("./Packets");
class Call {
    #game;
    constructor(game) {
            this.#game = game
    }
    adminRequest(other, action, params) {
            let packet = new Packets.AdminRequestCallPacket();
        packet.other = other;
        packet.action = action;
        packet.params = params;
        this.#game.netClient.send(packet, true)
    }
    announce(message) {
            let packet = new Packets.AnnounceCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, true)
    }
    announce(message) {
            let packet = new Packets.AnnounceCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, true)
    }
    assemblerDroneSpawned(tile, id) {
            let packet = new Packets.AssemblerDroneSpawnedCallPacket();
        packet.tile = tile;
        packet.id = id;
        this.#game.netClient.send(packet, true)
    }
    assemblerUnitSpawned(tile) {
            let packet = new Packets.AssemblerUnitSpawnedCallPacket();
        packet.tile = tile;
        this.#game.netClient.send(packet, true)
    }
    autoDoorToggle(tile, open) {
            let packet = new Packets.AutoDoorToggleCallPacket();
        packet.tile = tile;
        packet.open = open;
        this.#game.netClient.send(packet, true)
    }
    beginBreak(unit, team, x, y) {
            let packet = new Packets.BeginBreakCallPacket();
        packet.unit = unit;
        packet.team = team;
        packet.x = x;
        packet.y = y;
        this.#game.netClient.send(packet, true)
    }
    beginPlace(unit, result, team, x, y, rotation) {
            let packet = new Packets.BeginPlaceCallPacket();
        packet.unit = unit;
        packet.result = result;
        packet.team = team;
        packet.x = x;
        packet.y = y;
        packet.rotation = rotation;
        this.#game.netClient.send(packet, true)
    }
    blockSnapshot(amount, data) {
            let packet = new Packets.BlockSnapshotCallPacket();
        packet.amount = amount;
        packet.data = data;
        this.#game.netClient.send(packet, false)
    }
    blockSnapshot(amount, data) {
            let packet = new Packets.BlockSnapshotCallPacket();
        packet.amount = amount;
        packet.data = data;
        this.#game.netClient.send(packet, false)
    }
    buildDestroyed(build) {
            let packet = new Packets.BuildDestroyedCallPacket();
        packet.build = build;
        this.#game.netClient.send(packet, true)
    }
    buildHealthUpdate(buildings) {
            let packet = new Packets.BuildHealthUpdateCallPacket();
        packet.buildings = buildings;
        this.#game.netClient.send(packet, true)
    }
    buildingControlSelect(player, build) {
            let packet = new Packets.BuildingControlSelectCallPacket();
        packet.player = player;
        packet.build = build;
        this.#game.netClient.send(packet, true)
    }
    buildingControlSelect(player, build) {
            let packet = new Packets.BuildingControlSelectCallPacket();
        packet.player = player;
        packet.build = build;
        this.#game.netClient.send(packet, true)
    }
    clearItems(build) {
            let packet = new Packets.ClearItemsCallPacket();
        packet.build = build;
        this.#game.netClient.send(packet, false)
    }
    clientPacketReliable(type, contents) {
            let packet = new Packets.ClientPacketReliableCallPacket();
        packet.type = type;
        packet.contents = contents;
        this.#game.netClient.send(packet, true)
    }
    clientPacketReliable(type, contents) {
            let packet = new Packets.ClientPacketReliableCallPacket();
        packet.type = type;
        packet.contents = contents;
        this.#game.netClient.send(packet, true)
    }
    clientPacketUnreliable(type, contents) {
            let packet = new Packets.ClientPacketUnreliableCallPacket();
        packet.type = type;
        packet.contents = contents;
        this.#game.netClient.send(packet, false)
    }
    clientPacketUnreliable(type, contents) {
            let packet = new Packets.ClientPacketUnreliableCallPacket();
        packet.type = type;
        packet.contents = contents;
        this.#game.netClient.send(packet, false)
    }
    clientSnapshot(snapshotID, unitID, dead, x, y, pointerX, pointerY, rotation, baseRotation, xVelocity, yVelocity, mining, boosting, shooting, chatting, building, plans, viewX, viewY, viewWidth, viewHeight) {
            let packet = new Packets.ClientSnapshotCallPacket();
        packet.snapshotID = snapshotID;
        packet.unitID = unitID;
        packet.dead = dead;
        packet.x = x;
        packet.y = y;
        packet.pointerX = pointerX;
        packet.pointerY = pointerY;
        packet.rotation = rotation;
        packet.baseRotation = baseRotation;
        packet.xVelocity = xVelocity;
        packet.yVelocity = yVelocity;
        packet.mining = mining;
        packet.boosting = boosting;
        packet.shooting = shooting;
        packet.chatting = chatting;
        packet.building = building;
        packet.plans = plans;
        packet.viewX = viewX;
        packet.viewY = viewY;
        packet.viewWidth = viewWidth;
        packet.viewHeight = viewHeight;
        this.#game.netClient.send(packet, false)
    }
    commandBuilding(player, buildings, target) {
            let packet = new Packets.CommandBuildingCallPacket();
        packet.player = player;
        packet.buildings = buildings;
        packet.target = target;
        this.#game.netClient.send(packet, true)
    }
    commandBuilding(player, buildings, target) {
            let packet = new Packets.CommandBuildingCallPacket();
        packet.player = player;
        packet.buildings = buildings;
        packet.target = target;
        this.#game.netClient.send(packet, true)
    }
    commandUnits(player, unitIds, buildTarget, unitTarget, posTarget) {
            let packet = new Packets.CommandUnitsCallPacket();
        packet.player = player;
        packet.unitIds = unitIds;
        packet.buildTarget = buildTarget;
        packet.unitTarget = unitTarget;
        packet.posTarget = posTarget;
        this.#game.netClient.send(packet, true)
    }
    commandUnits(player, unitIds, buildTarget, unitTarget, posTarget) {
            let packet = new Packets.CommandUnitsCallPacket();
        packet.player = player;
        packet.unitIds = unitIds;
        packet.buildTarget = buildTarget;
        packet.unitTarget = unitTarget;
        packet.posTarget = posTarget;
        this.#game.netClient.send(packet, true)
    }
    connect(ip, port) {
            let packet = new Packets.ConnectCallPacket();
        packet.ip = ip;
        packet.port = port;
        this.#game.netClient.send(packet, true)
    }
    connectConfirm() {
            let packet = new Packets.ConnectConfirmCallPacket();
        this.#game.netClient.send(packet, true)
    }
    constructFinish(tile, block, builder, rotation, team, config) {
            let packet = new Packets.ConstructFinishCallPacket();
        packet.tile = tile;
        packet.block = block;
        packet.builder = builder;
        packet.rotation = rotation;
        packet.team = team;
        packet.config = config;
        this.#game.netClient.send(packet, true)
    }
    createBullet(type, team, x, y, angle, damage, velocityScl, lifetimeScl) {
            let packet = new Packets.CreateBulletCallPacket();
        packet.type = type;
        packet.team = team;
        packet.x = x;
        packet.y = y;
        packet.angle = angle;
        packet.damage = damage;
        packet.velocityScl = velocityScl;
        packet.lifetimeScl = lifetimeScl;
        this.#game.netClient.send(packet, false)
    }
    createWeather(weather, intensity, duration, windX, windY) {
            let packet = new Packets.CreateWeatherCallPacket();
        packet.weather = weather;
        packet.intensity = intensity;
        packet.duration = duration;
        packet.windX = windX;
        packet.windY = windY;
        this.#game.netClient.send(packet, true)
    }
    debugStatusClient(value, lastClientSnapshot, snapshotsSent) {
            let packet = new Packets.DebugStatusClientCallPacket();
        packet.value = value;
        packet.lastClientSnapshot = lastClientSnapshot;
        packet.snapshotsSent = snapshotsSent;
        this.#game.netClient.send(packet, true)
    }
    debugStatusClient(value, lastClientSnapshot, snapshotsSent) {
            let packet = new Packets.DebugStatusClientCallPacket();
        packet.value = value;
        packet.lastClientSnapshot = lastClientSnapshot;
        packet.snapshotsSent = snapshotsSent;
        this.#game.netClient.send(packet, true)
    }
    debugStatusClientUnreliable(value, lastClientSnapshot, snapshotsSent) {
            let packet = new Packets.DebugStatusClientUnreliableCallPacket();
        packet.value = value;
        packet.lastClientSnapshot = lastClientSnapshot;
        packet.snapshotsSent = snapshotsSent;
        this.#game.netClient.send(packet, false)
    }
    debugStatusClientUnreliable(value, lastClientSnapshot, snapshotsSent) {
            let packet = new Packets.DebugStatusClientUnreliableCallPacket();
        packet.value = value;
        packet.lastClientSnapshot = lastClientSnapshot;
        packet.snapshotsSent = snapshotsSent;
        this.#game.netClient.send(packet, false)
    }
    deconstructFinish(tile, block, builder) {
            let packet = new Packets.DeconstructFinishCallPacket();
        packet.tile = tile;
        packet.block = block;
        packet.builder = builder;
        this.#game.netClient.send(packet, true)
    }
    deletePlans(player, positions) {
            let packet = new Packets.DeletePlansCallPacket();
        packet.player = player;
        packet.positions = positions;
        this.#game.netClient.send(packet, false)
    }
    deletePlans(player, positions) {
            let packet = new Packets.DeletePlansCallPacket();
        packet.player = player;
        packet.positions = positions;
        this.#game.netClient.send(packet, false)
    }
    dropItem(angle) {
            let packet = new Packets.DropItemCallPacket();
        packet.angle = angle;
        this.#game.netClient.send(packet, true)
    }
    effect(effect, x, y, rotation, color) {
            let packet = new Packets.EffectCallPacket();
        packet.effect = effect;
        packet.x = x;
        packet.y = y;
        packet.rotation = rotation;
        packet.color = color;
        this.#game.netClient.send(packet, false)
    }
    effect(effect, x, y, rotation, color) {
            let packet = new Packets.EffectCallPacket();
        packet.effect = effect;
        packet.x = x;
        packet.y = y;
        packet.rotation = rotation;
        packet.color = color;
        this.#game.netClient.send(packet, false)
    }
    effect(effect, x, y, rotation, color, data) {
            let packet = new Packets.EffectCallPacket2();
        packet.effect = effect;
        packet.x = x;
        packet.y = y;
        packet.rotation = rotation;
        packet.color = color;
        packet.data = data;
        this.#game.netClient.send(packet, false)
    }
    effect(effect, x, y, rotation, color, data) {
            let packet = new Packets.EffectCallPacket2();
        packet.effect = effect;
        packet.x = x;
        packet.y = y;
        packet.rotation = rotation;
        packet.color = color;
        packet.data = data;
        this.#game.netClient.send(packet, false)
    }
    effectReliable(effect, x, y, rotation, color) {
            let packet = new Packets.EffectReliableCallPacket();
        packet.effect = effect;
        packet.x = x;
        packet.y = y;
        packet.rotation = rotation;
        packet.color = color;
        this.#game.netClient.send(packet, true)
    }
    effectReliable(effect, x, y, rotation, color) {
            let packet = new Packets.EffectReliableCallPacket();
        packet.effect = effect;
        packet.x = x;
        packet.y = y;
        packet.rotation = rotation;
        packet.color = color;
        this.#game.netClient.send(packet, true)
    }
    entitySnapshot(amount, data) {
            let packet = new Packets.EntitySnapshotCallPacket();
        packet.amount = amount;
        packet.data = data;
        this.#game.netClient.send(packet, false)
    }
    followUpMenu(menuId, title, message, options) {
            let packet = new Packets.FollowUpMenuCallPacket();
        packet.menuId = menuId;
        packet.title = title;
        packet.message = message;
        packet.options = options;
        this.#game.netClient.send(packet, true)
    }
    followUpMenu(menuId, title, message, options) {
            let packet = new Packets.FollowUpMenuCallPacket();
        packet.menuId = menuId;
        packet.title = title;
        packet.message = message;
        packet.options = options;
        this.#game.netClient.send(packet, true)
    }
    gameOver(winner) {
            let packet = new Packets.GameOverCallPacket();
        packet.winner = winner;
        this.#game.netClient.send(packet, true)
    }
    hiddenSnapshot(ids) {
            let packet = new Packets.HiddenSnapshotCallPacket();
        packet.ids = ids;
        this.#game.netClient.send(packet, false)
    }
    hideFollowUpMenu(menuId) {
            let packet = new Packets.HideFollowUpMenuCallPacket();
        packet.menuId = menuId;
        this.#game.netClient.send(packet, true)
    }
    hideFollowUpMenu(menuId) {
            let packet = new Packets.HideFollowUpMenuCallPacket();
        packet.menuId = menuId;
        this.#game.netClient.send(packet, true)
    }
    hideHudText() {
            let packet = new Packets.HideHudTextCallPacket();
        this.#game.netClient.send(packet, true)
    }
    hideHudText() {
            let packet = new Packets.HideHudTextCallPacket();
        this.#game.netClient.send(packet, true)
    }
    infoMessage(message) {
            let packet = new Packets.InfoMessageCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, true)
    }
    infoMessage(message) {
            let packet = new Packets.InfoMessageCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, true)
    }
    infoPopup(message, duration, align, top, left, bottom, right) {
            let packet = new Packets.InfoPopupCallPacket();
        packet.message = message;
        packet.duration = duration;
        packet.align = align;
        packet.top = top;
        packet.left = left;
        packet.bottom = bottom;
        packet.right = right;
        this.#game.netClient.send(packet, false)
    }
    infoPopup(message, duration, align, top, left, bottom, right) {
            let packet = new Packets.InfoPopupCallPacket();
        packet.message = message;
        packet.duration = duration;
        packet.align = align;
        packet.top = top;
        packet.left = left;
        packet.bottom = bottom;
        packet.right = right;
        this.#game.netClient.send(packet, false)
    }
    infoPopupReliable(message, duration, align, top, left, bottom, right) {
            let packet = new Packets.InfoPopupReliableCallPacket();
        packet.message = message;
        packet.duration = duration;
        packet.align = align;
        packet.top = top;
        packet.left = left;
        packet.bottom = bottom;
        packet.right = right;
        this.#game.netClient.send(packet, true)
    }
    infoPopupReliable(message, duration, align, top, left, bottom, right) {
            let packet = new Packets.InfoPopupReliableCallPacket();
        packet.message = message;
        packet.duration = duration;
        packet.align = align;
        packet.top = top;
        packet.left = left;
        packet.bottom = bottom;
        packet.right = right;
        this.#game.netClient.send(packet, true)
    }
    infoToast(message, duration) {
            let packet = new Packets.InfoToastCallPacket();
        packet.message = message;
        packet.duration = duration;
        this.#game.netClient.send(packet, true)
    }
    infoToast(message, duration) {
            let packet = new Packets.InfoToastCallPacket();
        packet.message = message;
        packet.duration = duration;
        this.#game.netClient.send(packet, true)
    }
    kick(reason) {
            let packet = new Packets.KickCallPacket();
        packet.reason = reason;
        this.#game.netClient.send(packet, true)
    }
    kick(reason) {
            let packet = new Packets.KickCallPacket2();
        packet.reason = reason;
        this.#game.netClient.send(packet, true)
    }
    label(message, duration, worldx, worldy) {
            let packet = new Packets.LabelCallPacket();
        packet.message = message;
        packet.duration = duration;
        packet.worldx = worldx;
        packet.worldy = worldy;
        this.#game.netClient.send(packet, false)
    }
    label(message, duration, worldx, worldy) {
            let packet = new Packets.LabelCallPacket();
        packet.message = message;
        packet.duration = duration;
        packet.worldx = worldx;
        packet.worldy = worldy;
        this.#game.netClient.send(packet, false)
    }
    labelReliable(message, duration, worldx, worldy) {
            let packet = new Packets.LabelReliableCallPacket();
        packet.message = message;
        packet.duration = duration;
        packet.worldx = worldx;
        packet.worldy = worldy;
        this.#game.netClient.send(packet, true)
    }
    labelReliable(message, duration, worldx, worldy) {
            let packet = new Packets.LabelReliableCallPacket();
        packet.message = message;
        packet.duration = duration;
        packet.worldx = worldx;
        packet.worldy = worldy;
        this.#game.netClient.send(packet, true)
    }
    logicExplosion(team, x, y, radius, damage, air, ground, pierce) {
            let packet = new Packets.LogicExplosionCallPacket();
        packet.team = team;
        packet.x = x;
        packet.y = y;
        packet.radius = radius;
        packet.damage = damage;
        packet.air = air;
        packet.ground = ground;
        packet.pierce = pierce;
        this.#game.netClient.send(packet, false)
    }
    menu(menuId, title, message, options) {
            let packet = new Packets.MenuCallPacket();
        packet.menuId = menuId;
        packet.title = title;
        packet.message = message;
        packet.options = options;
        this.#game.netClient.send(packet, true)
    }
    menu(menuId, title, message, options) {
            let packet = new Packets.MenuCallPacket();
        packet.menuId = menuId;
        packet.title = title;
        packet.message = message;
        packet.options = options;
        this.#game.netClient.send(packet, true)
    }
    menuChoose(player, menuId, option) {
            let packet = new Packets.MenuChooseCallPacket();
        packet.player = player;
        packet.menuId = menuId;
        packet.option = option;
        this.#game.netClient.send(packet, true)
    }
    objectiveCompleted(flagsRemoved, flagsAdded) {
            let packet = new Packets.ObjectiveCompletedCallPacket();
        packet.flagsRemoved = flagsRemoved;
        packet.flagsAdded = flagsAdded;
        this.#game.netClient.send(packet, true)
    }
    openURI(uri) {
            let packet = new Packets.OpenURICallPacket();
        packet.uri = uri;
        this.#game.netClient.send(packet, true)
    }
    openURI(uri) {
            let packet = new Packets.OpenURICallPacket();
        packet.uri = uri;
        this.#game.netClient.send(packet, true)
    }
    payloadDropped(unit, x, y) {
            let packet = new Packets.PayloadDroppedCallPacket();
        packet.unit = unit;
        packet.x = x;
        packet.y = y;
        this.#game.netClient.send(packet, true)
    }
    pickedBuildPayload(unit, build, onGround) {
            let packet = new Packets.PickedBuildPayloadCallPacket();
        packet.unit = unit;
        packet.build = build;
        packet.onGround = onGround;
        this.#game.netClient.send(packet, true)
    }
    pickedUnitPayload(unit, target) {
            let packet = new Packets.PickedUnitPayloadCallPacket();
        packet.unit = unit;
        packet.target = target;
        this.#game.netClient.send(packet, true)
    }
    ping(time) {
            let packet = new Packets.PingCallPacket();
        packet.time = time;
        this.#game.netClient.send(packet, true)
    }
    pingResponse(time) {
            let packet = new Packets.PingResponseCallPacket();
        packet.time = time;
        this.#game.netClient.send(packet, true)
    }
    playerDisconnect(playerid) {
            let packet = new Packets.PlayerDisconnectCallPacket();
        packet.playerid = playerid;
        this.#game.netClient.send(packet, true)
    }
    playerSpawn(tile, player) {
            let packet = new Packets.PlayerSpawnCallPacket();
        packet.tile = tile;
        packet.player = player;
        this.#game.netClient.send(packet, true)
    }
    removeQueueBlock(x, y, breaking) {
            let packet = new Packets.RemoveQueueBlockCallPacket();
        packet.x = x;
        packet.y = y;
        packet.breaking = breaking;
        this.#game.netClient.send(packet, true)
    }
    removeTile(tile) {
            let packet = new Packets.RemoveTileCallPacket();
        packet.tile = tile;
        this.#game.netClient.send(packet, true)
    }
    removeWorldLabel(id) {
            let packet = new Packets.RemoveWorldLabelCallPacket();
        packet.id = id;
        this.#game.netClient.send(packet, true)
    }
    requestBuildPayload(player, build) {
            let packet = new Packets.RequestBuildPayloadCallPacket();
        packet.player = player;
        packet.build = build;
        this.#game.netClient.send(packet, true)
    }
    requestDebugStatus() {
            let packet = new Packets.RequestDebugStatusCallPacket();
        this.#game.netClient.send(packet, true)
    }
    requestDropPayload(player, x, y) {
            let packet = new Packets.RequestDropPayloadCallPacket();
        packet.player = player;
        packet.x = x;
        packet.y = y;
        this.#game.netClient.send(packet, true)
    }
    requestItem(player, build, item, amount) {
            let packet = new Packets.RequestItemCallPacket();
        packet.player = player;
        packet.build = build;
        packet.item = item;
        packet.amount = amount;
        this.#game.netClient.send(packet, true)
    }
    requestItem(player, build, item, amount) {
            let packet = new Packets.RequestItemCallPacket();
        packet.player = player;
        packet.build = build;
        packet.item = item;
        packet.amount = amount;
        this.#game.netClient.send(packet, true)
    }
    requestUnitPayload(player, target) {
            let packet = new Packets.RequestUnitPayloadCallPacket();
        packet.player = player;
        packet.target = target;
        this.#game.netClient.send(packet, true)
    }
    researched(content) {
            let packet = new Packets.ResearchedCallPacket();
        packet.content = content;
        this.#game.netClient.send(packet, true)
    }
    rotateBlock(player, build, direction) {
            let packet = new Packets.RotateBlockCallPacket();
        packet.player = player;
        packet.build = build;
        packet.direction = direction;
        this.#game.netClient.send(packet, false)
    }
    rotateBlock(player, build, direction) {
            let packet = new Packets.RotateBlockCallPacket();
        packet.player = player;
        packet.build = build;
        packet.direction = direction;
        this.#game.netClient.send(packet, false)
    }
    sectorCapture() {
            let packet = new Packets.SectorCaptureCallPacket();
        this.#game.netClient.send(packet, true)
    }
    sendChatMessage(message) {
            let packet = new Packets.SendChatMessageCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, true)
    }
    sendMessage(message) {
            let packet = new Packets.SendMessageCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, true)
    }
    sendMessage(message, unformatted, playersender) {
            let packet = new Packets.SendMessageCallPacket2();
        packet.message = message;
        packet.unformatted = unformatted;
        packet.playersender = playersender;
        this.#game.netClient.send(packet, true)
    }
    sendMessage(message, unformatted, playersender) {
            let packet = new Packets.SendMessageCallPacket2();
        packet.message = message;
        packet.unformatted = unformatted;
        packet.playersender = playersender;
        this.#game.netClient.send(packet, true)
    }
    serverPacketReliable(type, contents) {
            let packet = new Packets.ServerPacketReliableCallPacket();
        packet.type = type;
        packet.contents = contents;
        this.#game.netClient.send(packet, true)
    }
    serverPacketUnreliable(type, contents) {
            let packet = new Packets.ServerPacketUnreliableCallPacket();
        packet.type = type;
        packet.contents = contents;
        this.#game.netClient.send(packet, false)
    }
    setCameraPosition(x, y) {
            let packet = new Packets.SetCameraPositionCallPacket();
        packet.x = x;
        packet.y = y;
        this.#game.netClient.send(packet, false)
    }
    setCameraPosition(x, y) {
            let packet = new Packets.SetCameraPositionCallPacket();
        packet.x = x;
        packet.y = y;
        this.#game.netClient.send(packet, false)
    }
    setFlag(flag, add) {
            let packet = new Packets.SetFlagCallPacket();
        packet.flag = flag;
        packet.add = add;
        this.#game.netClient.send(packet, true)
    }
    setFloor(tile, floor, overlay) {
            let packet = new Packets.SetFloorCallPacket();
        packet.tile = tile;
        packet.floor = floor;
        packet.overlay = overlay;
        this.#game.netClient.send(packet, true)
    }
    setHudText(message) {
            let packet = new Packets.SetHudTextCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, false)
    }
    setHudText(message) {
            let packet = new Packets.SetHudTextCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, false)
    }
    setHudTextReliable(message) {
            let packet = new Packets.SetHudTextReliableCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, true)
    }
    setHudTextReliable(message) {
            let packet = new Packets.SetHudTextReliableCallPacket();
        packet.message = message;
        this.#game.netClient.send(packet, true)
    }
    setItem(build, item, amount) {
            let packet = new Packets.SetItemCallPacket();
        packet.build = build;
        packet.item = item;
        packet.amount = amount;
        this.#game.netClient.send(packet, false)
    }
    setMapArea(x, y, w, h) {
            let packet = new Packets.SetMapAreaCallPacket();
        packet.x = x;
        packet.y = y;
        packet.w = w;
        packet.h = h;
        this.#game.netClient.send(packet, true)
    }
    setObjectives(executor) {
            let packet = new Packets.SetObjectivesCallPacket();
        packet.executor = executor;
        this.#game.netClient.send(packet, true)
    }
    setObjectives(executor) {
            let packet = new Packets.SetObjectivesCallPacket();
        packet.executor = executor;
        this.#game.netClient.send(packet, true)
    }
    setOverlay(tile, overlay) {
            let packet = new Packets.SetOverlayCallPacket();
        packet.tile = tile;
        packet.overlay = overlay;
        this.#game.netClient.send(packet, true)
    }
    setPlayerTeamEditor(player, team) {
            let packet = new Packets.SetPlayerTeamEditorCallPacket();
        packet.player = player;
        packet.team = team;
        this.#game.netClient.send(packet, true)
    }
    setPlayerTeamEditor(player, team) {
            let packet = new Packets.SetPlayerTeamEditorCallPacket();
        packet.player = player;
        packet.team = team;
        this.#game.netClient.send(packet, true)
    }
    setPosition(x, y) {
            let packet = new Packets.SetPositionCallPacket();
        packet.x = x;
        packet.y = y;
        this.#game.netClient.send(packet, true)
    }
    setRules(rules) {
            let packet = new Packets.SetRulesCallPacket();
        packet.rules = rules;
        this.#game.netClient.send(packet, true)
    }
    setRules(rules) {
            let packet = new Packets.SetRulesCallPacket();
        packet.rules = rules;
        this.#game.netClient.send(packet, true)
    }
    setTeam(build, team) {
            let packet = new Packets.SetTeamCallPacket();
        packet.build = build;
        packet.team = team;
        this.#game.netClient.send(packet, true)
    }
    setTile(tile, block, team, rotation) {
            let packet = new Packets.SetTileCallPacket();
        packet.tile = tile;
        packet.block = block;
        packet.team = team;
        packet.rotation = rotation;
        this.#game.netClient.send(packet, true)
    }
    setUnitCommand(player, unitIds, command) {
            let packet = new Packets.SetUnitCommandCallPacket();
        packet.player = player;
        packet.unitIds = unitIds;
        packet.command = command;
        this.#game.netClient.send(packet, true)
    }
    setUnitCommand(player, unitIds, command) {
            let packet = new Packets.SetUnitCommandCallPacket();
        packet.player = player;
        packet.unitIds = unitIds;
        packet.command = command;
        this.#game.netClient.send(packet, true)
    }
    sound(sound, volume, pitch, pan) {
            let packet = new Packets.SoundCallPacket();
        packet.sound = sound;
        packet.volume = volume;
        packet.pitch = pitch;
        packet.pan = pan;
        this.#game.netClient.send(packet, false)
    }
    sound(sound, volume, pitch, pan) {
            let packet = new Packets.SoundCallPacket();
        packet.sound = sound;
        packet.volume = volume;
        packet.pitch = pitch;
        packet.pan = pan;
        this.#game.netClient.send(packet, false)
    }
    soundAt(sound, x, y, volume, pitch) {
            let packet = new Packets.SoundAtCallPacket();
        packet.sound = sound;
        packet.x = x;
        packet.y = y;
        packet.volume = volume;
        packet.pitch = pitch;
        this.#game.netClient.send(packet, false)
    }
    soundAt(sound, x, y, volume, pitch) {
            let packet = new Packets.SoundAtCallPacket();
        packet.sound = sound;
        packet.x = x;
        packet.y = y;
        packet.volume = volume;
        packet.pitch = pitch;
        this.#game.netClient.send(packet, false)
    }
    spawnEffect(x, y, rotation, u) {
            let packet = new Packets.SpawnEffectCallPacket();
        packet.x = x;
        packet.y = y;
        packet.rotation = rotation;
        packet.u = u;
        this.#game.netClient.send(packet, false)
    }
    stateSnapshot(waveTime, wave, enemies, paused, gameOver, timeData, tps, rand0, rand1, coreData) {
            let packet = new Packets.StateSnapshotCallPacket();
        packet.waveTime = waveTime;
        packet.wave = wave;
        packet.enemies = enemies;
        packet.paused = paused;
        packet.gameOver = gameOver;
        packet.timeData = timeData;
        packet.tps = tps;
        packet.rand0 = rand0;
        packet.rand1 = rand1;
        packet.coreData = coreData;
        this.#game.netClient.send(packet, false)
    }
    syncVariable(building, variable, value) {
            let packet = new Packets.SyncVariableCallPacket();
        packet.building = building;
        packet.variable = variable;
        packet.value = value;
        this.#game.netClient.send(packet, false)
    }
    takeItems(build, item, amount, to) {
            let packet = new Packets.TakeItemsCallPacket();
        packet.build = build;
        packet.item = item;
        packet.amount = amount;
        packet.to = to;
        this.#game.netClient.send(packet, false)
    }
    textInput(textInputId, title, message, textLength, def, numeric) {
            let packet = new Packets.TextInputCallPacket();
        packet.textInputId = textInputId;
        packet.title = title;
        packet.message = message;
        packet.textLength = textLength;
        packet.def = def;
        packet.numeric = numeric;
        this.#game.netClient.send(packet, true)
    }
    textInput(textInputId, title, message, textLength, def, numeric) {
            let packet = new Packets.TextInputCallPacket();
        packet.textInputId = textInputId;
        packet.title = title;
        packet.message = message;
        packet.textLength = textLength;
        packet.def = def;
        packet.numeric = numeric;
        this.#game.netClient.send(packet, true)
    }
    textInputResult(player, textInputId, text) {
            let packet = new Packets.TextInputResultCallPacket();
        packet.player = player;
        packet.textInputId = textInputId;
        packet.text = text;
        this.#game.netClient.send(packet, true)
    }
    tileConfig(player, build, value) {
            let packet = new Packets.TileConfigCallPacket();
        packet.player = player;
        packet.build = build;
        packet.value = value;
        this.#game.netClient.send(packet, true)
    }
    tileConfig(player, build, value) {
            let packet = new Packets.TileConfigCallPacket();
        packet.player = player;
        packet.build = build;
        packet.value = value;
        this.#game.netClient.send(packet, true)
    }
    tileTap(player, tile) {
            let packet = new Packets.TileTapCallPacket();
        packet.player = player;
        packet.tile = tile;
        this.#game.netClient.send(packet, false)
    }
    traceInfo(player, info) {
            let packet = new Packets.TraceInfoCallPacket();
        packet.player = player;
        packet.info = info;
        this.#game.netClient.send(packet, true)
    }
    transferInventory(player, build) {
            let packet = new Packets.TransferInventoryCallPacket();
        packet.player = player;
        packet.build = build;
        this.#game.netClient.send(packet, true)
    }
    transferInventory(player, build) {
            let packet = new Packets.TransferInventoryCallPacket();
        packet.player = player;
        packet.build = build;
        this.#game.netClient.send(packet, true)
    }
    transferItemEffect(item, x, y, to) {
            let packet = new Packets.TransferItemEffectCallPacket();
        packet.item = item;
        packet.x = x;
        packet.y = y;
        packet.to = to;
        this.#game.netClient.send(packet, false)
    }
    transferItemTo(unit, item, amount, x, y, build) {
            let packet = new Packets.TransferItemToCallPacket();
        packet.unit = unit;
        packet.item = item;
        packet.amount = amount;
        packet.x = x;
        packet.y = y;
        packet.build = build;
        this.#game.netClient.send(packet, false)
    }
    transferItemToUnit(item, x, y, to) {
            let packet = new Packets.TransferItemToUnitCallPacket();
        packet.item = item;
        packet.x = x;
        packet.y = y;
        packet.to = to;
        this.#game.netClient.send(packet, false)
    }
    unitBlockSpawn(tile) {
            let packet = new Packets.UnitBlockSpawnCallPacket();
        packet.tile = tile;
        this.#game.netClient.send(packet, true)
    }
    unitBuildingControlSelect(unit, build) {
            let packet = new Packets.UnitBuildingControlSelectCallPacket();
        packet.unit = unit;
        packet.build = build;
        this.#game.netClient.send(packet, true)
    }
    unitCapDeath(unit) {
            let packet = new Packets.UnitCapDeathCallPacket();
        packet.unit = unit;
        this.#game.netClient.send(packet, true)
    }
    unitClear(player) {
            let packet = new Packets.UnitClearCallPacket();
        packet.player = player;
        this.#game.netClient.send(packet, true)
    }
    unitClear(player) {
            let packet = new Packets.UnitClearCallPacket();
        packet.player = player;
        this.#game.netClient.send(packet, true)
    }
    unitControl(player, unit) {
            let packet = new Packets.UnitControlCallPacket();
        packet.player = player;
        packet.unit = unit;
        this.#game.netClient.send(packet, true)
    }
    unitControl(player, unit) {
            let packet = new Packets.UnitControlCallPacket();
        packet.player = player;
        packet.unit = unit;
        this.#game.netClient.send(packet, true)
    }
    unitDeath(uid) {
            let packet = new Packets.UnitDeathCallPacket();
        packet.uid = uid;
        this.#game.netClient.send(packet, true)
    }
    unitDespawn(unit) {
            let packet = new Packets.UnitDespawnCallPacket();
        packet.unit = unit;
        this.#game.netClient.send(packet, true)
    }
    unitDestroy(uid) {
            let packet = new Packets.UnitDestroyCallPacket();
        packet.uid = uid;
        this.#game.netClient.send(packet, true)
    }
    unitEnvDeath(unit) {
            let packet = new Packets.UnitEnvDeathCallPacket();
        packet.unit = unit;
        this.#game.netClient.send(packet, true)
    }
    unitTetherBlockSpawned(tile, id) {
            let packet = new Packets.UnitTetherBlockSpawnedCallPacket();
        packet.tile = tile;
        packet.id = id;
        this.#game.netClient.send(packet, true)
    }
    updateGameOver(winner) {
            let packet = new Packets.UpdateGameOverCallPacket();
        packet.winner = winner;
        this.#game.netClient.send(packet, true)
    }
    warningToast(unicode, text) {
            let packet = new Packets.WarningToastCallPacket();
        packet.unicode = unicode;
        packet.text = text;
        this.#game.netClient.send(packet, true)
    }
    warningToast(unicode, text) {
            let packet = new Packets.WarningToastCallPacket();
        packet.unicode = unicode;
        packet.text = text;
        this.#game.netClient.send(packet, true)
    }
    worldDataBegin() {
            let packet = new Packets.WorldDataBeginCallPacket();
        this.#game.netClient.send(packet, true)
    }
    worldDataBegin() {
            let packet = new Packets.WorldDataBeginCallPacket();
        this.#game.netClient.send(packet, true)
    }
}
module.exports = Call
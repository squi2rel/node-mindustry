class FrameworkMessage {
	static discoverHost = class extends FrameworkMessage { }
    static RegisterTCP = class extends FrameworkMessage {
        connectionID
    }
    static RegisterUDP = class extends FrameworkMessage {
        connectionID
    }
    static KeepAlive = class extends FrameworkMessage { }
}

module.exports = FrameworkMessage
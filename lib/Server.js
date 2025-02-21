const { EventEmitter } = require("events");
const TCPConnection = require("./TCPConnection");
const UDPConnection = require("./UDPConnection");
const net = require('net');
const dgram = require('dgram');
const FrameworkMessage = require("./FrameworkMessage");

class Server {
    #clients;
    #event;
    #tcpServer;
    #udpServer;
    #tcpcb;
    #udpcb;
    #parser;
    #mparser;

    constructor(w, s, p, m) {
        this.#clients = new Map();
        this.#event = new EventEmitter();
        this.#tcpcb = (sock) => new TCPConnection(w, s, (data, port, ip) => { this.parse(port, ip, data) }, sock);
        this.#udpcb = (sock, port, ip, msg) => new UDPConnection(w, s, data => { this.parse(port, ip, data) }, sock, port, ip, msg);
        this.#parser = p;
        this.#mparser = m;
    }

    getId() {
        const min = -2147483648;
        const max = 2147483647;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    sendTCP(conId, p) {
        const client = this.#clients.get(conId);
        if (client && client.tcp) {
            client.tcp.send(p);
        }
    }

    sendUDP(conId, p) {
        const client = this.#clients.get(conId);
        if (client && client.udp) {
            client.udp.send(p);
        }
    }

    isСonnected(conId){
        const client = this.#clients.get(conId);
        if(client && client.udpRegistered && client.tcpRegistered){
            return true
        }
        return false
    }

    getClients(){
        return this.#clients
    }

    getC(conId){
        return this.#clients.get(conId)
    }

    close(conId){
        let c = this.getC(conId);
        c.tcp.close();
        this.#clients.delete(conId);
    }

    listen(port) {
        this.#tcpServer = net.createServer((sock) => {
            const conId = this.getId();
            const ip = sock.remoteAddress;
            const tcpPort = sock.remotePort;

            this.#clients.set(conId, {
                tcp: this.#tcpcb(sock),
                ip: ip,
                tcpPort: tcpPort,
                conId: conId,
                tcpRegistered: true,
                udpRegistered: false
            });

            const p = new FrameworkMessage.RegisterTCP();
            p.connectionID = conId;
            this.sendTCP(conId, p);
        });

        this.port = port;
        this.#tcpServer.listen(port, '0.0.0.0', () => {
            console.log("TCP Server is listening on port", port);

            this.#udpServer = dgram.createSocket('udp4');

            this.#udpServer.on('error', (err) => {
                console.error(`UDP Server error:\n${err.stack}`);
                this.#udpServer.close();
            });

            this.#udpServer.on('message', (msg, rinfo) => {
                const ip = rinfo.address;
                const udpPort = rinfo.port;

                if(Buffer.compare(msg, Buffer.from([-2, 1])) == 0){
                    this.parse(udpPort, ip, new FrameworkMessage.discoverHost())
                }

                for (const [conId, client] of this.#clients) {
                    if (client.ip === ip && client.tcpPort !== udpPort) {
                        if (!client.udp) {
                            client.udp = this.#udpcb(this.#udpServer, udpPort, ip, msg);
                            client.udpPort = udpPort;
                        }
                        break;
                    }
                }
            });

            this.#udpServer.on('listening', () => {
                const address = this.#udpServer.address();
                console.log("UDP Server is listening on port", address.port);
            });

            this.#udpServer.bind(port);
        });
    }

    parse(port, ip, p) {
        if (p instanceof FrameworkMessage.discoverHost){
            let buf = this.#mparser()
            this.#udpServer.send(buf, 0, buf.length, port, ip)
        }
        for (const [conId, client] of this.#clients) {
            if (client.ip === ip && (client.tcpPort === port || client.udpPort === port)) {
                if (p) {
                    if (!client.udpRegistered) {
                        if (p instanceof FrameworkMessage.RegisterUDP) {
                            const p2 = new FrameworkMessage.RegisterUDP();
                            p2.connectionID = conId;
                            this.sendTCP(conId, p2);
                            this.#event.emit("connect");
                            client.udpRegistered = true;
                        }
                    }
                    this.#parser(conId, p)
                }
                break;
            }
        }
    }
}

module.exports = Server;
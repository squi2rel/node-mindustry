class KickReason {
    static kick = class kick extends KickReason {
        static id = 0
    };
    static clientOutdated = class clientOutdated extends KickReason {
        static id = 1
    };
    static serverOutdated = class serverOutdated extends KickReason {
        static id = 2
    };
    static banned = class banned extends KickReason {
        static id = 3
    };
    static gameover = class gameover extends KickReason {
        static id = 4
    };
    static recentKick = class recentKick extends KickReason {
        static id = 5
    };
    static nameInUse = class nameInUse extends KickReason {
        static id = 6
    };
    static idInUse = class idInUse extends KickReason {
        static id = 7
    };
    static nameEmpty = class nameEmpty extends KickReason {
        static id = 8
    };
    static customClient = class customClient extends KickReason {
        static id = 9
    };
    static serverClose = class serverClose extends KickReason {
        static id = 10
    };
    static vote = class vote extends KickReason {
        static id = 11
    };
    static typeMismatch = class typeMismatch extends KickReason {
        static id = 12
    };
    static whitelist = class whitelist extends KickReason {
        static id = 13
    };
    static playerLimit = class playerLimit extends KickReason {
        static id = 14
    };
    static serverRestarting = class serverRestarting extends KickReason {
        static id = 15
    }
}
{
    KickReason[0] = KickReason.kick;
    KickReason[1] = KickReason.clientOutdated;
    KickReason[2] = KickReason.serverOutdated;
    KickReason[3] = KickReason.banned;
    KickReason[4] = KickReason.gameover;
    KickReason[5] = KickReason.recentKick;
    KickReason[6] = KickReason.nameInUse;
    KickReason[7] = KickReason.idInUse;
    KickReason[8] = KickReason.nameEmpty;
    KickReason[9] = KickReason.customClient;
    KickReason[10] = KickReason.serverClose;
    KickReason[11] = KickReason.vote;
    KickReason[12] = KickReason.typeMismatch;
    KickReason[13] = KickReason.whitelist;
    KickReason[14] = KickReason.playerLimit;
    KickReason[15] = KickReason.serverRestarting
}

module.exports = KickReason
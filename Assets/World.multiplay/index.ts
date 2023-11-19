import {Sandbox, SandboxOptions, SandboxPlayer} from "ZEPETO.Multiplay";
import {DataStorage} from "ZEPETO.Multiplay.DataStorage";
import {Player, Transform, Vector3} from "ZEPETO.Multiplay.Schema";

export default class extends Sandbox {


    storageMap:Map<string,DataStorage> = new Map<string, DataStorage>();

    constructor() {
        super();
    }

    onCreate(options: SandboxOptions) {
        // Called when the Room object is created.
        // Handle the state or data initialization of the Room object.

        this.onMessage("onChangedTransform", (client, message) => {
            const player = this.state.players.get(client.sessionId);

            const transform = new Transform();
            transform.position = new Vector3();
            transform.position.x = message.position.x;
            transform.position.y = message.position.y;
            transform.position.z = message.position.z;

            transform.rotation = new Vector3();
            transform.rotation.x = message.rotation.x;
            transform.rotation.y = message.rotation.y;
            transform.rotation.z = message.rotation.z;

            if (player) {
                player.transform = transform;
            }
        });

        this.onMessage("onChangedState", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.state = message.state;
                player.subState = message.subState; // Character Controller V2
            }
        });
    }



    async onJoin(client: SandboxPlayer) {

        // Create the player object defined in schemas.json and set the initial value.
        console.log(`[OnJoin] sessionId : ${client.sessionId}, userId : ${client.userId}`)

        const player = new Player();
        player.sessionId = client.sessionId;

        if (client.userId) {
            player.zepetoUserId = client.userId;
        }

        // [DataStorage] DataStorage Load of the entered Player
        const storage: DataStorage = client.loadDataStorage();

        this.storageMap.set(client.sessionId,storage);

        let visit_cnt = await storage.get("VisitCount") as number;
        if (visit_cnt == null) visit_cnt = 0;

        console.log(`[OnJoin] ${client.sessionId}'s visiting count : ${visit_cnt}`)

        // [DataStorage] Update Player's visit count and then Storage Save
        await storage.set("VisitCount", ++visit_cnt);

        // Manage the Player object using sessionId, a unique key value of the client object.
        // The client can check the information about the player object added by set by adding the add_OnAdd event to the players object.
        this.state.players.set(client.sessionId, player);
    }

    onTick(deltaTime: number): void {
        //  It is repeatedly called at each set time in the server, and a certain interval event can be managed using deltaTime.
    }

    async onLeave(client: SandboxPlayer, consented?: boolean) {

        // By setting allowReconnection, it is possible to maintain connection for the circuit, but clean up immediately in the basic guide.
        // The client can check the information about the deleted player object by adding the add_OnRemove event to the players object.
        this.state.players.delete(client.sessionId);
    }
}
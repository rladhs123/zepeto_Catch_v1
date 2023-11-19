import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room, RoomData} from "ZEPETO.Multiplay";
import {Player, State} from "ZEPETO.Multiplay.Schema";
import {CharacterState, SpawnInfo, ZepetoPlayers} from "ZEPETO.Character.Controller";
import * as UnityEngine from 'UnityEngine'

export default class ClientStarter extends ZepetoScriptBehaviour {
    public multiPlay : ZepetoWorldMultiplay;
    private room : Room
    private currentPlayer: Map<String, Player> = new Map<String, Player>();
    Start() {

        this.multiPlay.RoomCreated += (room:Room) => {
            this.room = room
        }


        this.multiPlay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        this.StartCoroutine(this.SendMessageLoop(0.1))
    }

    private* SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);
            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    if (myPlayer.character.CurrentState != CharacterState.Idle) {
                        this.sendTransform(myPlayer.character.transform)
                    }
                }
            }
        }

    }

    private OnStateChange(state: State, isFirst: boolean) {
        if (isFirst) {
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                myPlayer.character.OnChangedState.AddListener((cur, prev) => {
                    this.SendState(cur);
                });
            })
        }
        let join = new Map<String, Player>();
        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayer.has(sessionId)) {
                join.set(sessionId, player)
            }
        });
        join.forEach((player: Player, sessionId :string) => this.OnJoinPlayer(sessionId, player));
    }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`onjoins ${sessionId}`)
        this.currentPlayer.set(sessionId, player)

        const spawnInfo = new SpawnInfo();
        const position = new UnityEngine.Vector3(0, 0, 0);
        const rotation = new UnityEngine.Vector3(0, 0, 0);
        spawnInfo.position = position
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation)

        const isLocal = this.room.SessionId === player.sessionId;
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
    }

    private sendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();
        const pos = new RoomData()
        pos.Add('x', transform.localPosition.x);
        pos.Add('y', transform.localPosition.y);
        pos.Add('z', transform.localPosition.z);
        data.Add('position', pos.GetObject());

        const rotation = new RoomData();
        rotation.Add('x', transform.localEulerAngles.x);
        rotation.Add('y', transform.localEulerAngles.y);
        rotation.Add('z', transform.localEulerAngles.z);
        data.Add('rotation', rotation.GetObject());

        this.room.Send("onChangeTransform", data.GetObject());

    }
}
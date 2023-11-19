import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { SpawnInfo, ZepetoPlayers, LocalPlayer, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import { WorldService } from 'ZEPETO.World';
import { CapsuleCollider, CharacterController,Vector3 } from 'UnityEngine';

export default class CharacterLoader extends ZepetoScriptBehaviour {

    Start() {
        ZepetoPlayers.instance.CreatePlayerWithUserId(WorldService.userId, new SpawnInfo(), true);
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            const player: LocalPlayer = ZepetoPlayers.instance.LocalPlayer;
            const character:ZepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            const collider:CapsuleCollider = character.gameObject.AddComponent<CapsuleCollider>();
            collider.height = 1.2
            collider.center = new Vector3(0, 0.6, 0);
            collider.radius = 0.23;

        });
    }
}
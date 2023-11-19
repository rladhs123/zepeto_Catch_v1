import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class OpenCube extends ZepetoScriptBehaviour {

    private animation : Animation;
    Start() {    
        this.animation=this.gameObject.GetComponent<Animation>();
        this.animation.play();
    }

}
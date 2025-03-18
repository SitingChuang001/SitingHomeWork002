import { _decorator, Component, Node, EventKeyboard, KeyCode, UITransform, Input, input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GunView')
export class GunView extends Component {
    @property
    private speed: number = 300 // 移動速度（每秒）

    private moveDirection: number = 0 // -1 向左, 1 向右, 0 停止
    private fireCallback: () => void = null // 發射子彈回調函數

    private leftBound: number = 0
    private rightBound: number = 0

    start() {
        this.initKeyboardListener()
        this.calculateBounds()
    }

    public init(fireEvent: () => void) {
        this.fireCallback = fireEvent
    }

    private initKeyboardListener() {
        // 監聽按鍵按下事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
    }

    //設定最遠邊界
    private calculateBounds() {
        let parentNode = this.node.parent
        if (parentNode) {
            let parentUI = parentNode.getComponent(UITransform)
            if (parentUI) {
                let halfWidth = parentUI.width / 2
                this.leftBound = -halfWidth + 50
                this.rightBound = halfWidth - 50
            }
        }
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
                this.moveDirection = -1
                break;
            case KeyCode.ARROW_RIGHT:
                this.moveDirection = 1
                break;
            case KeyCode.SPACE:
                if (this.fireCallback) {
                    this.fireCallback()
                }
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_LEFT || event.keyCode === KeyCode.KEY_A ||
            event.keyCode === KeyCode.ARROW_RIGHT || event.keyCode === KeyCode.KEY_D) {
            this.moveDirection = 0 // 停止移動
        }
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this)
    }

    update(deltaTime: number) {
        if (this.moveDirection !== 0) {
            let moveDistance = this.speed * deltaTime * this.moveDirection
            let newX = this.node.position.x + moveDistance

            // 限制移動範圍
            if (newX < this.leftBound) newX = this.leftBound
            if (newX > this.rightBound) newX = this.rightBound

            this.node.setPosition(newX, this.node.position.y, this.node.position.z)
        }
    }
}

import { _decorator, Component, BoxCollider2D, Vec3, Contact2DType, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BulletItem')
export class BulletItem extends Component {
    @property(BoxCollider2D)
    private collider: BoxCollider2D = null

    public speed: number = 300
    private onRecycleCallback: (bulletItem: BulletItem) => void
    private onNoUseRecycleCallback: (bulletItem: BulletItem) => void
    private canvasHeight: number
    start() {
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onHit, this)
        }
        this.canvasHeight = this.node.parent.getComponent(UITransform).height
    }

    public init(pos: Vec3, useCb: (bulletItem: BulletItem) => void, noUseCb: (bulletItem: BulletItem) => void) {
        this.node.setPosition(pos.x, pos.y, 0)
        this.onRecycleCallback = useCb
        this.onNoUseRecycleCallback = noUseCb
    }

    private onHit() {
        console.log("子彈擊中！")
        if (this.onRecycleCallback) {
            this.onRecycleCallback(this)
        }
    }

    update(deltaTime: number) {
        if (this.node.active) {
            let moveDistance = this.speed * deltaTime
            this.node.setPosition(
                this.node.position.x,
                this.node.position.y + moveDistance,
                this.node.position.z
            )
        }
        if (this.node.position.y > this.canvasHeight / 2 + 20) {
            this.onNoUseRecycleCallback(this)
        }
    }
}

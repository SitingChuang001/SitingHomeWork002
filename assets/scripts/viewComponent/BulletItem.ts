import { _decorator, Component, BoxCollider2D, Vec2, Node, Vec3, Contact2DType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BulletItem')
export class BulletItem extends Component {
    @property(BoxCollider2D)
    private collider: BoxCollider2D = null;

    public speed: number = 300; // 子彈速度
    private onHitCallback: () => void; // 子彈擊中時的回調函數

    start() {
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onHit, this);
        }
    }

    public init(pos: Vec2, cb: () => void) {
        this.node.setPosition(pos.x, pos.y, 0); 
        this.onHitCallback = cb; 
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }

    private onHit() {
        console.log("子彈擊中！");
        if (this.onHitCallback) {
            this.onHitCallback(); // 執行回調
        }
        this.hide(); // 碰撞後隱藏子彈（可回收）
    }

    update(deltaTime: number) {
        if (this.node.active) {
            let moveDistance = this.speed * deltaTime;
            this.node.setPosition(
                this.node.position.x,
                this.node.position.y + moveDistance,
                this.node.position.z
            );
        }
    }
}

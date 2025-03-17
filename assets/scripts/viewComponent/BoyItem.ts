import { _decorator, Component, Node, BoxCollider2D, Contact2DType, Vec3, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BoyItem')
export class BoyItem extends Component {
    @property(BoxCollider2D)
    private collider: BoxCollider2D = null;

    @property(sp.Skeleton)
    private animator: sp.Skeleton = null;

    private direction: boolean = true; // true: 右移動, false: 左移動
    private speed: number = 100; // 速度

    onLoad() {
        this.init(); // 初始化角色
    }

    protected init() {
        // 判斷角色生成的位置
        const canvas = this.node.parent; // 取得 Canvas 父節點
        const canvasWidth = canvas ? canvas.width : 800; // 預設寬度 800

        if (this.node.position.x < -canvasWidth / 2) {
            this.direction = true; // 生成在左側，向右移動
        } else if (this.node.position.x > canvasWidth / 2) {
            this.direction = false; // 生成在右側，向左移動
        } else {
            this.direction = Math.random() < 0.5; // 隨機方向
        }

        // 設置動畫為 "walk"，並 loop
        if (this.animator) {
            this.animator.setAnimation(0, "walk", true);
        }

        // 設定碰撞偵測
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onHit, this);
        }
    }

    protected showAnimate() {
        // 設定 speed 為 0（停止移動）
        this.speed = 0;

        // 播放 "hit" 動畫，然後播放 "death" 動畫
        if (this.animator) {
            this.animator.setAnimation(0, "hit", false);
            this.animator.setCompleteListener((trackEntry) => {
                if (trackEntry.animation.name === "hit") {
                    this.animator.setAnimation(0, "death", false);
                }
            });
        }
    }

    private onHit(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D) {
        console.log("角色被擊中！");
        this.showAnimate();
    }

    update(deltaTime: number) {
        if (this.speed > 0) {
            const moveDistance = this.speed * deltaTime;
            const directionMultiplier = this.direction ? 1 : -1;
            this.node.setPosition(
                this.node.position.x + moveDistance * directionMultiplier,
                this.node.position.y,
                this.node.position.z
            );
        }
    }
}


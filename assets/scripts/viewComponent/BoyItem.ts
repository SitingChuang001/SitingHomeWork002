import { _decorator, Component, BoxCollider2D, Contact2DType, Vec3, sp, UITransform } from 'cc';
import { colliderGroup } from '../Controller/GameViewController';
const { ccclass, property } = _decorator;

@ccclass('BoyItem')
export class BoyItem extends Component {
    @property(BoxCollider2D)
    public collider: BoxCollider2D = null

    @property(sp.Skeleton)
    private animator: sp.Skeleton = null

    private direction: boolean = true; // true: 右移動, false: 左移動
    public speed: number = 100 // 速度
    private initScaleX: number
    public onRecycleCallback: (boyItem: BoyItem) => void
    private onHitCallback: (item: BoyItem) => {}
    private canvasWidth: number

    onLoad() {
        this.initScaleX = this.node.scale.x
        this.canvasWidth = this.node.parent.getComponent(UITransform).width
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onHit, this)
        }
    }

    public init(pos: Vec3, cb: (boyItem: BoyItem) => {}, hitCb: (boyItem: BoyItem) => {}) {
        this.node.setPosition(pos)
        this.onRecycleCallback = cb
        this.onHitCallback = hitCb
        this.speed = 100

        if (this.node.position.x < -this.canvasWidth / 2) {
            this.node.setScale(new Vec3(this.initScaleX, this.node.scale.y, this.node.scale.z))
            this.direction = true // 生成在左側，向右移動
        } else if (this.node.position.x > this.canvasWidth / 2) {
            this.node.setScale(new Vec3(-this.initScaleX, this.node.scale.y, this.node.scale.z))
            this.direction = false // 生成在右側，向左移動
        }

        if (this.animator) {
            this.animator.setAnimation(0, "walk", true)
        }
        this.collider.group = colliderGroup.Boy

    }

    private onHit() {
        this.onHitCallback(this)
    }

    public playAnimation(animationName: string, cb?: (boyItem: BoyItem) => void): Promise<void> {
        return new Promise((resolve) => {
            if (!this.animator) {
                resolve()
                return
            }

            this.animator.setAnimation(0, animationName, false)
            this.animator.setCompleteListener((trackEntry) => {
                if (trackEntry.animation.name === animationName) {
                    if (cb)
                        cb(this)
                    resolve()
                }
            });
        });
    }

    update(deltaTime: number) {
        if (this.speed > 0) {
            const moveDistance = this.speed * deltaTime
            const directionMultiplier = this.direction ? 1 : -1
            this.node.setPosition(
                this.node.position.x + moveDistance * directionMultiplier,
                this.node.position.y,
                this.node.position.z
            );
        }
        if (this.direction) {
            if (this.node.position.x > this.canvasWidth / 2 + 50) {
                this.onRecycleCallback(this)
            }
        } else {
            if (this.node.position.x < -(this.canvasWidth / 2) - 50) {
                this.onRecycleCallback(this)
            }
        }
    }
}


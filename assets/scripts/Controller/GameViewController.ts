import { _decorator, Node, Component, Prefab, NodePool, instantiate, PhysicsSystem2D, UITransform, randomRange, Vec3, } from 'cc';
import { GunView } from '../viewComponent/GunView';
import { BulletItem } from '../viewComponent/BulletItem';
import { BoyItem } from '../viewComponent/BoyItem';
const { ccclass, property } = _decorator;

@ccclass('GameViewController')
export class GameViewController extends Component {
    @property(Prefab)
    private bulletPrefab: Prefab
    @property(GunView)
    private gunView: GunView
    @property(Prefab)
    private boyItemPrefab: Prefab
    @property(Node)
    private boyLayout: Node

    private bulletPool: NodePool = new NodePool()
    private boyItemPool: NodePool = new NodePool()
    @property
    private boyRate: number = 2


    protected onLoad(): void {
        this.gunView.init(this.spawnBullet.bind(this))
        PhysicsSystem2D.instance.enable = true
        this.schedule(this.spawnBoy, this.boyRate)
    }

    private spawnBoy() {
        let boyNode: Node
        if (this.boyItemPool.size() > 0) {
            boyNode = this.boyItemPool.get()
        } else {
            boyNode = instantiate(this.boyItemPrefab)
        }

        let canvasWidth = this.boyLayout.getComponent(UITransform).width
        let isLeft = Math.random() < 0.5
        let spawnX = isLeft ? -canvasWidth / 2 - 50 : canvasWidth / 2 + 50

        let canvasHeight = this.boyLayout.getComponent(UITransform).height
        let minY = -canvasHeight / 2 + 50
        let maxY = canvasHeight / 2 - 50
        let spawnY = randomRange(minY, maxY)

        boyNode.parent = this.boyLayout
        boyNode.getComponent(BoyItem).init(new Vec3(spawnX, spawnY, 0), this.recycleBoy.bind(this))

    }

    private recycleBoy(boy: BoyItem) {
        boy.node.removeFromParent()
        this.boyItemPool.put(boy.node)
    }

    private spawnBullet() {
        let bullet: BulletItem
        if (this.bulletPool.size() > 0) {
            bullet = this.bulletPool.get().getComponent(BulletItem)
        } else {
            let bulletNode = instantiate(this.bulletPrefab)
            bullet = bulletNode.getComponent(BulletItem)
        }
        bullet.init(this.gunView.node.position, this.recycleBullet.bind(this))
        bullet.node.parent = this.node
    }

    private recycleBullet(bullet: BulletItem) {
        bullet.node.removeFromParent()
        this.bulletPool.put(bullet.node)
    }
}

export enum colliderGroup {
    Default = 1,
    Boy = 2,
    Bullet = 3,
}


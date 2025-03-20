import { _decorator, Node, Component, Prefab, NodePool, instantiate, PhysicsSystem2D, UITransform, randomRange, Vec3, Label, } from 'cc';
import { GunView } from '../viewComponent/GunView';
import { BulletItem } from '../viewComponent/BulletItem';
import { BoyItem } from '../viewComponent/BoyItem';
import { CoinView } from '../viewComponent/CoinView';
const { ccclass, property } = _decorator;

@ccclass('GameViewController')
export class GameViewController extends Component {
    @property(Prefab)
    private bulletPrefab: Prefab
    @property(GunView)
    private gunView: GunView
    @property(Prefab)
    private boyItemPrefab: Prefab
    @property(Prefab)
    private coinPrefab: Prefab
    @property(Node)
    private boyLayout: Node
    @property(Label)
    private balanceLabel: Label

    private bulletPool: NodePool = new NodePool()
    private boyItemPool: NodePool = new NodePool()
    private coinPool: NodePool = new NodePool()
    private curBalance: number = 100
    @property
    private boyRate: number = 2


    protected onLoad(): void {
        this.setBalance()
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
        boyNode.getComponent(BoyItem).init(new Vec3(spawnX, spawnY, 0), this.recycleBoy.bind(this), this.boyOnHit.bind(this))

    }

    private async boyOnHit(boyItem: BoyItem) {
        boyItem.collider.group = colliderGroup.Default
        boyItem.speed = 0
        let winNum = this.getWin() //隨機獲得贏分
        await boyItem.playAnimation("hit")
        let coin = this.spawnCoin(boyItem.node.position)
        coin.init(this.recycleCoin.bind(this))
        coin.playStart(winNum)
        await boyItem.playAnimation("death", this.recycleBoy.bind(this))
        await coin.playFly(this.balanceLabel.node.position)
        this.curBalance += winNum
        this.setBalance()
        await coin.playFadeOut()
    }

    private getWin(): number {
        return Math.floor(Math.random() * 3) + 1
    }

    private spawnCoin(pos: Vec3): CoinView {
        let coinNode: Node
        if (this.coinPool.size() > 0) {
            coinNode = this.coinPool.get()
        } else {
            coinNode = instantiate(this.coinPrefab)
        }
        coinNode.setPosition(pos)
        coinNode.parent = this.node
        return coinNode.getComponent(CoinView)
    }

    private recycleCoin(coin: CoinView) {
        coin.node.removeFromParent()
        this.coinPool.put(coin.node)
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
        bullet.init(this.gunView.node.position, this.recycleBullet.bind(this),this.recycleBulletWithNoUse.bind(this))
        bullet.node.parent = this.node
        //發子彈就扣錢
        this.curBalance -= 1
        this.setBalance()
    }

    private recycleBullet(bullet: BulletItem) {
        bullet.node.removeFromParent()
        this.bulletPool.put(bullet.node)
    }

    private recycleBulletWithNoUse(bullet: BulletItem) {
        bullet.node.removeFromParent()
        this.bulletPool.put(bullet.node)
        this.curBalance += 1
        this.setBalance()
    }

    private setBalance() {
        this.balanceLabel.string = this.curBalance.toString()
    }
}

export enum colliderGroup {
    Default = 1,
    Boy = 2,
    Bullet = 3,
}


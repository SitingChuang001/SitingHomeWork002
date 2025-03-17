import { _decorator, CCInteger, Node, Component, Prefab, Pool, NodePool, instantiate, Vec2,  } from 'cc';
import { GunView } from '../viewComponent/GunView';
import { BulletItem } from '../viewComponent/BulletItem';
const { ccclass, property } = _decorator;

@ccclass('GameViewController')
export class GameViewController extends Component {
    @property(Prefab)
    private bulletPrefab: Prefab
    @property(GunView)
    private gunView: GunView

    private bulletViews: BulletItem[] = []
    private bulletPool: NodePool = new NodePool()

    protected onLoad(): void {
        this.gunView.init(this.spawnBullet.bind(this))
    }

    spawnBullet(): BulletItem {
        let bullet: BulletItem;
        if (this.bulletPool.size() > 0) {
            bullet = this.bulletPool.get().getComponent(BulletItem); // 取出子彈
        } else {
            let bulletNode = instantiate(this.bulletPrefab);
            bullet = bulletNode.getComponent(BulletItem);
        }
        bullet.node.parent = this.node
        this.bulletViews.push(bullet);
        return bullet;
    }

    recycleBullet(bullet: BulletItem) {
        bullet.node.removeFromParent();
        this.bulletPool.put(bullet.node); // 回收子彈
    }
}

export enum PlayType {
    Win,
    End,
    Game_Over
}


import cax from '../cax/index'

Component({
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      //比 web 里使用 cax 多传递 this，this 代表 Page 或 Component 的实例
      const windowInfo = wx.getWindowInfo()
      const stage = new cax.Stage(windowInfo.windowWidth, windowInfo.windowHeight, 'myCanvas', this);
      const rect = new cax.Rect(100, 100, {
        fillStyle: 'black'
      })
      
      rect.originX = 50
      rect.originY = 50
      rect.x = 100
      rect.y = 100
      rect.rotation = 30

      rect.on('tap', () => {
        console.log('tap')
      })

      stage.add(rect)
      stage.update()
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  }
})

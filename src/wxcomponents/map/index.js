import cax from '../cax/index'

Component({
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      //比 web 里使用 cax 多传递 this，this 代表 Page 或 Component 的实例
      const windowInfo = wx.getWindowInfo()
      const stage = new cax.Stage(windowInfo.windowWidth, windowInfo.windowHeight, 'myCanvas', this);

      const bitmap = new cax.Bitmap('https://h5-static-test.xunbaoji.net.cn/batman.jpg')
      stage.add(bitmap);

      //#region 触摸事件逻辑，实现单指拖拽平移和双指缩放的交互
      // 表示同时触屏的手指数量
      let fingerCount = 0;

      let fingerPosition1 = undefined;
      let fingerPosition2 = undefined;
      let distanceBetweenTwoFingers = undefined;

      const handleTouches = (e) => {
        fingerCount = e.touches.length;
        switch (fingerCount) {
          case 0: {
            fingerPosition1 = undefined;
            fingerPosition2 = undefined;
            distanceBetweenTwoFingers = undefined;
            break;
          }
          case 1: {
            // 当fingerCount为1的时候表示，进入了单指拖拽操作
            fingerPosition1 = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            fingerPosition2 = undefined;
            distanceBetweenTwoFingers = undefined;
            break;
          }
          case 2: {
            fingerPosition1 = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            fingerPosition2 = { x: e.touches[1].pageX, y: e.touches[1].pageY };
            distanceBetweenTwoFingers = Math.sqrt(Math.pow(fingerPosition1.x - fingerPosition2.x, 2) + Math.pow(fingerPosition1.y - fingerPosition2.y, 2));
            break;
          }
          default: {}
        }
      }

      stage.on('touchstart', handleTouches);
      
      stage.on('touchmove', (e) => {
        switch (fingerCount) {
          case 1: {
            const offsetX = e.touches[0].pageX - fingerPosition1.x;
            const offsetY = e.touches[0].pageY - fingerPosition1.y;
            bitmap.x += offsetX;
            bitmap.y += offsetY;

            fingerPosition1 = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            fingerPosition2 = undefined;
            distanceBetweenTwoFingers = undefined;
            break;
          }
          case 2: {
            const newDistanceBetweenTwoFingers = Math.sqrt(Math.pow(e.touches[0].pageX - e.touches[1].pageX, 2) + Math.pow(e.touches[0].pageY - e.touches[1].pageY, 2));
            if (newDistanceBetweenTwoFingers > distanceBetweenTwoFingers) {
              // 放大
              stage.scaleX += 0.01;
              stage.scaleY += 0.01;
            } else if (newDistanceBetweenTwoFingers < distanceBetweenTwoFingers) {
              // 缩小
              stage.scaleX -= 0.01;
              stage.scaleY -= 0.01;
            }

            fingerPosition1 = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            fingerPosition2 = { x: e.touches[1].pageX, y: e.touches[1].pageY };
            distanceBetweenTwoFingers = newDistanceBetweenTwoFingers;
            break;
          }
          default: {}
        }
      })
      
      stage.on('touchend', handleTouches);
      //#endregion

      // 循环刷新画布
      cax.tick(stage.update.bind(stage))
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  }
})

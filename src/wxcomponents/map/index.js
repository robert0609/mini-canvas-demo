import cax from '../cax/index'

Component({
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      //比 web 里使用 cax 多传递 this，this 代表 Page 或 Component 的实例
      const windowInfo = wx.getWindowInfo()
      const stage = new cax.Stage(windowInfo.windowWidth, windowInfo.windowHeight, 'myCanvas', this);
      //每秒检测两次
      stage.moveDetectionInterval = 500

      const bitmap = new cax.Bitmap('https://admin.xunbaoji.net.cn/uploads/20240807/70d2147f4bdde85410914058595e1bcb.png')
      stage.add(bitmap);

      //#region 触摸事件逻辑，实现单指拖拽平移和双指缩放的交互
      // 表示同时触屏的手指数量
      let fingerCount = 0;

      let fingerPosition1 = undefined;
      let fingerPosition2 = undefined;
      let distanceBetweenTwoFingers = undefined;

      // 双指缩放的时候，两个指头触摸点的中间点
      let middleLocationInImage = undefined;
      let middleLocationInStage = undefined;

      const handleTouches = (e) => {
        fingerCount = e.touches.length;
        switch (fingerCount) {
          case 0: {
            fingerPosition1 = undefined;
            fingerPosition2 = undefined;
            distanceBetweenTwoFingers = undefined;
            middleLocationInImage = undefined;
            middleLocationInStage = undefined;
            break;
          }
          case 1: {
            // 当fingerCount为1的时候表示，进入了单指拖拽操作
            fingerPosition1 = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            fingerPosition2 = undefined;
            distanceBetweenTwoFingers = undefined;
            middleLocationInImage = undefined;
            middleLocationInStage = undefined;
            break;
          }
          case 2: {
            // 此时进入双指缩放操作
            fingerPosition1 = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            fingerPosition2 = { x: e.touches[1].pageX, y: e.touches[1].pageY };
            distanceBetweenTwoFingers = Math.sqrt(Math.pow(fingerPosition1.x - fingerPosition2.x, 2) + Math.pow(fingerPosition1.y - fingerPosition2.y, 2));
            
            // 先计算出stage下的中心点位置
            middleLocationInStage = {
              x: (fingerPosition1.x + fingerPosition2.x) / 2,
              y: (fingerPosition1.y + fingerPosition2.y) / 2
            };
            const matrixOfImage = bitmap._matrix;
            middleLocationInImage = {
              x: (middleLocationInStage.x - matrixOfImage.tx) / matrixOfImage.a,
              y: (middleLocationInStage.y - matrixOfImage.ty) / matrixOfImage.d
            };

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
            middleLocationInImage = undefined;
            middleLocationInStage = undefined;
            break;
          }
          case 2: {
            const newDistanceBetweenTwoFingers = Math.sqrt(Math.pow(e.touches[0].pageX - e.touches[1].pageX, 2) + Math.pow(e.touches[0].pageY - e.touches[1].pageY, 2));
            if (newDistanceBetweenTwoFingers > distanceBetweenTwoFingers) {
              // 放大
              if (bitmap.scaleX >= 2) {
                bitmap.scaleX = 2;
              } else {
                bitmap.scaleX += 0.02;
              }
              if (bitmap.scaleY >= 2) {
                bitmap.scaleY = 2;
              } else {
                bitmap.scaleY += 0.02;
              }
            } else if (newDistanceBetweenTwoFingers < distanceBetweenTwoFingers) {
              // 缩小
              if (bitmap.scaleX <= 0.5) {
                bitmap.scaleX = 0.5;
              } else {
                bitmap.scaleX -= 0.02;
              }
              if (bitmap.scaleY <= 0.5) {
                bitmap.scaleY = 0.5;
              } else {
                bitmap.scaleY -= 0.02;
              }
            }
            // 为了保障缩放时焦点位置不动，这里需要换算一个新的平移向量
            const tx = middleLocationInStage.x - bitmap.scaleX * middleLocationInImage.x;
            const ty = middleLocationInStage.y - bitmap.scaleY * middleLocationInImage.y;
            bitmap.x = tx;
            bitmap.y = ty;

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

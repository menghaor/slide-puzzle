# 基于Canvas封装的滑动拼图
### 效果
!['canvas滑动解锁'](https://github.com/menghaor/public/blob/master/static/markdown/imgs/slide-unlock.png?raw=true)

 ### 1.使用
 1. 依次引入assets/css文件；
 2. 引入assets/js文件；
 ### 2.示例
 ```javascript
 //创建实例
 const slide1 = new SlideUnlock({
     id: '#slide-container',
     width: 340,
     height: 230,
     imgs: [
         './assets/images/img1.jpg',
         './assets/images/img2.jpg',
         './assets/images/img3.jpg',
         './assets/images/img4.jpg',
         './assets/images/img5.jpg'
     ]
 });
 
 //事件监听
 slide1.listen(data = {
 	console.log(data);
 })
 
 //重置画布
 document.querySelector('#reset').addEventListener('click', () = {
     slide1.reset();
 }, false)
 ```

### 2.参数配置
| Name    | Type   | 是否必填（Y/N） | Describe     |
| ------- | ------ | --------------- | ------------ |
| id      | String | Y               | 容器元素ID   |
| width   | Number | Y               | 画布宽度     |
| height  | Number | Y               | 画布高度     |
| imgs    | Array  | Y               | 随机图片列表 |
| tipText | String | N               | 提示文字     |

### 3.外部方法
| MthodName    | Describe      |
| ------------ | ------------- |
| .listen(fun) | 事件监听      |
| .reset()     | 重置/刷新画布 |

------
### 更多功能正在完善中......
如果对你有帮助，麻烦用的手点个 Star 吧~
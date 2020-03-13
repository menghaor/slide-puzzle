//滑动状态Map
const SLIDE_STATUS_MAP = {
    success: 'success',
    fail: 'error'
};


/**
 * 滑动拼图
 */
class SlidePuzzle {
    constructor(config) {
        this.__init(config)
    }
    containerId = '' //容器ID
    status = 'fail' //状态： success， fail

    //元素
    elements = {
        canvas: null,
        canvasBlock: null,
        sliderBar: null,
        sliderBlock: null,
        sliderMoveLine: null,
        refresh: null,
        tipText: null
    };

    context = {
        currentPictureURL: '', //当前图片URL地址
        width: 0,
        height: 0,
        randomX: 0,
        randomY: 0
    };
    imgs = []
    eventsHandles = [] //事件处理函数
    verifyScale = 100 //验证比例

    canvasBlockWidth = 0 //画布块宽度

    //底部滑动块位置
    sliderBarBtnPositon = {
        x: 0,
        y: 0,
        max: 0
    }

    /**
     * 初始化
     * @param conf 配置文件
     */
    __init({
        imgs,
        ...args
    }) {
        if (!imgs || !imgs.length) {
            throw new Error("Pictures are not added you use a hammer oh~");
        }
        this.slideStatusMap = SLIDE_STATUS_MAP;
        this.imgs = imgs;
        let randomPictureURL = this.getRandomPictureURL()
        this.containerId = args.id;
        this.context.currentPictureURL = randomPictureURL; //随机图片地址
        this.context.width = args.width;
        this.context.height = args.height;

        //创建canvas元素
        this.initDOM({
            width: args.width,
            height: args.height
        }, () => {
            this.initImg(); //初始化图片
            this.bindEvents() //绑定事件
        })
    }

    /**
     * 初始化 DOM
     * @param conf 宽高等配置
     * @param createdCall 创建完成回调
     */
    initDOM(conf = {}, createdCall) {
        let {
            containerId
        } = this;
        let containerNode = document.querySelector(containerId);
        let {
            width,
            height
        } = conf;
        if (!containerId || containerNode === null) {
            throw new Error('container error!');
        }

        //添加到DOM
        containerNode.classList.add('slide-container');
        containerNode.style.width = width + 'px';
        containerNode.innerHTML =
            `
            <div class="img-content" style="height: ${height}px;">
                <canvas id="img" width="${width}" height="${height}"></canvas>
                <canvas id="slide-blcok" width="${width}" height="${height}"></canvas>
                <button class="refresh" id="refresh"></button>
            </div>
            <div class="slider-bar">
                <div class="move-line"></div>
				<button class="slider-bar-btn" id="slider-bar-btn"><i></i></button>
				<p class="tip">请向右滑动解锁哦~</p>
			</div>
        `;

        let {
            elements,
            context
        } = this;
        elements.canvas = document.querySelector(`${containerId} #img`);
        elements.canvasBlock = document.querySelector(`${containerId} #slide-blcok`);
        elements.sliderBar = document.querySelector(`${containerId} .slider-bar`);
        elements.sliderBlock = document.querySelector(`${containerId} #slider-bar-btn`);
        elements.sliderMoveLine = document.querySelector(`${containerId} .move-line`);
        elements.refresh = document.querySelector(`${containerId} #refresh`);
        elements.tipText = document.querySelector(`${containerId} .tip`);
        context.canvas = elements.canvas.getContext('2d');
        context.block = elements.canvasBlock.getContext('2d');
        createdCall && createdCall();
        return this;
    }

    /**
     * 初始化图片
     */
    initImg() {
        //创建图片
        const img = this.createImg(() => {
            let {
                elements,
                context
            } = this;
            const r = 9 // 滑块半径
            this.draw(); //开始绘制
            context.canvas.drawImage(img, 0, 0, this.context.width, this.context.height) //图片输出到画布
            context.block.drawImage(img, 0, 0, this.context.width, this.context.height)
            let blockWidth = this.canvasBlockWidth;
            let y = this.context.randomY - r * 2 - 2
            let ImageData = context.block.getImageData(this.context.randomX, y, blockWidth, blockWidth); //拿到滑块的像素数据
            elements.canvasBlock.width = blockWidth; //重新设置滑块的宽度
            context.block.putImageData(ImageData, 0, y)
        });

        this.img = img;
    }

    /**
     * 绘制
     */
    draw() {
        //创建随机滑块x、y轴
        let {
            x,
            y
        } = this.getRandomPosition({
            width: this.context.width,
            height: this.context.height
        });
        this.context.randomX = x;
        this.context.randomY = y;

        this.drawCanvas(this.context.canvas, x, y, 'fill')
        this.drawCanvas(this.context.block, x, y, 'clip')
    }

    /**
     * 绘制canvas
     * @param {*} ctx 
     * @param {*} y 
     * @param {*} x 
     * @param {*} operation 
     */
    drawCanvas(ctx, x, y, operation) {
        let w = 42,
            l = 42,
            r = 10,
            PI = Math.PI;
        this.canvasBlockWidth = l + r * 2 - 2;

        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI)
        ctx.lineTo(x + l, y)
        ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI)
        ctx.lineTo(x + l, y + l)
        ctx.lineTo(x, y + l)
        ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true)
        ctx.lineTo(x, y)
        ctx.lineWidth = 1.5
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.stroke()
        ctx[operation]()
        ctx.globalCompositeOperation = 'destination-over'
    }

    /**
     * 创建图片
     * @param cb 
     */
    createImg(loaded) {
        let randomURL = this.context.currentPictureURL;
        let img = new Image();
        img.onload = () => {
            typeof loaded === 'function' && loaded();
        }
        img.setSrc = randomURL => {
            img.src = randomURL;
        }
        img.setSrc(this.getRandomPictureURL());
        return img;
    }

    /**
     * 获取随机坐标
     * @return Object
     */
    getRandomPosition({
        width,
        height
    }) {
        const l = 42 // 滑块边长
        const r = 9 // 滑块半径
        const PI = Math.PI
        const L = l + r * 2 + 3 // 滑块实际边长
        let x = Math.floor(Math.random() * (width / 2 - L)) + width / 2
        let y = height / 2 - Math.floor(Math.random() * (height / 2 - L))
        return {
            x,
            y
        }
    }

    /**
     * 获取随机图片url
     * @return String
     */
    getRandomPictureURL() {
        let pictures = this.imgs
        let len = pictures.length - 1
        let randomIndex = Math.floor(Math.random() * len)
        return pictures[randomIndex]
    }

    /**
     * 清空
     */
    clean() {
        let {
            context,
            elements
        } = this;
        context.canvas.clearRect(0, 0, context.width, context.height)
        context.block.clearRect(0, 0, context.width, context.height)
        elements.canvasBlock.width = context.width
    }

    /**
     * 重置
     */
    reset() {
        let {
            elements
        } = this;
        elements.sliderBlock.style.left = 0;
        elements.sliderMoveLine.style.width = 0;
        elements.canvasBlock.style.left = 0;
        elements.sliderBlock.classList.remove('active', 'success', 'error');
        elements.sliderMoveLine.classList.remove('active', 'success', 'error');
        this.eventStatus = null;
        this.clean();
        this.img.setSrc(this.getRandomPictureURL());
    }

    /**
     * 刷新
     */
    refresh() {
        this.reset();

        //触发事件
        this.triggerEvent({
            event: 'refresh',
            data: {
                status: this.status
            }
        });
    }

    /**
     * 验证位置
     * @reutrn Boolean
     */
    verifyPosition({
        x
    }) {
        let moveX = this.x;
        return moveX >= x - 2 && moveX <= x + 2;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const {
            elements
        } = this;

        //按下事件
        elements.sliderBlock.addEventListener(
            'mousedown',
            e => {
                elements.sliderBlock.classList.add('active');
                this.startEvent.call(this, e)
            },
            false
        )

        //刷新事件
        elements.refresh.addEventListener('click', this.refresh.bind(this), false)
    }

    /**
     * 开始事件
     */
    startEvent(e) {
        let {
            elements,
            slideStatusMap,
            eventStatus
        } = this;
        if (eventStatus) return;
        this.eventStatus = 'pending'
        this.sliderBarBtnPositon.x = e.clientX
        elements.sliderBlock.classList.remove('resize-animation', 'animation')
        elements.canvasBlock.classList.remove('animation');
        this.sliderBarBtnPositon.max = elements.sliderBar.clientWidth - elements.sliderBlock.clientWidth
        document.onmousemove = this.moveEvent.bind(this)
        document.onmouseup = this.stopEvent.bind(this)

        //触发事件
        this.triggerEvent({
            event: 'start',
            data: {
                status: slideStatusMap[this.status]
            }
        })
    }

    /**
     * 移动事件
     */
    moveEvent(e) {
        let {
            elements
        } = this;
        const {
            clientX
        } = e
        let disX = clientX - this.sliderBarBtnPositon.x
        disX =
            disX < 0 ?
            0 :
            disX > this.sliderBarBtnPositon.max ?
            this.sliderBarBtnPositon.max :
            disX

        elements.sliderMoveLine.style.width = `${disX}px`;
        elements.sliderBlock.style.left = `${disX}px`;
        elements.canvasBlock.style.left = `${disX}px`;
        this.x = disX;
    }

    /**
     * 暂停事件
     */
    stopEvent(e) {
        let {
            containerId,
            slideStatusMap,
            elements
        } = this;
        let verifyPositionRes = this.verifyPosition({
            x: this.context.randomX
        }) //验证位置


        //位置坐标是否正确
        if (verifyPositionRes) {
            this.status = 'success'
            elements.sliderBlock.classList.add('success')
            elements.sliderMoveLine.classList.add('success');
            elements.sliderBlock.onmousedown = null;
            document.onmousemove = null
            document.onmouseup = null

            //触发事件
            this.triggerEvent({
                event: 'stop',
                data: {
                    status: slideStatusMap[this.status]
                }
            });
        } else {
            document.onmousemove = null
            document.onmouseup = null

            if (this.x === 0) {
                elements.sliderBlock.classList.remove('active');
                elements.sliderMoveLine.classList.remove('resize-animation')
                this.eventStatus = null;

                //触发事件
                return this.triggerEvent({
                    event: 'stop',
                    data: {
                        status: this.status
                    }
                });
            }
            elements.sliderBlock.classList.add('error', 'resize-animation', 'animation');
            elements.sliderMoveLine.classList.add('error', 'resize-animation');
            elements.canvasBlock.classList.add('animation');

            //延时
            setTimeout(() => {
                elements.sliderBlock.style.left = 0;
                elements.sliderMoveLine.style.width = 0;
                elements.canvasBlock.style.left = 0;

                //关闭动画
                setTimeout(() => {
                    elements.sliderBlock.classList.remove('active', 'error');
                    elements.sliderMoveLine.classList.remove('resize-animation', 'error')
                    this.eventStatus = null;
                    this.reset();
                }, 260);

                //触发事件
                this.triggerEvent({
                    event: 'stop',
                    data: {
                        status: slideStatusMap[this.status]
                    }
                });
            }, 350)
        }
    }

    /**
     * 触发监听事件
     * @param {Object} data
     */
    triggerEvent(data) {
        if (!this.eventsHandles.length) return
        this.eventsHandles.forEach(fn => {
            typeof fn === 'function' && fn(data)
        })
        return this
    }

    /**
     * 外部监听
     * @param {Object} cb
     */
    listen(cb) {
        this.eventsHandles.push(cb)
        return this
    }
}
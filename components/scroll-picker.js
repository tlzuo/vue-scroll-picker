(function () {
    'use strict';
	
	var style = `
		.divide-bar-stage {
			display: flex;
			align-items: center;
			justify-content: center;
			perspective: 111111;
			-webkit-perspective: 111111;
			overflow: hidden;
		}
		.divide-bar-container {
			position: relative;
			width: 100%;
			transform-style: preserve-3d;
		}
		.divide-bar-container.easein {
			transition: transform 0.5s ease;
		}
		.divide-bar-item {
			position: absolute;
			width: 100%;
			border-bottom: 1px solid #d3d3d3;
			text-align: center;
		    backface-visibility: hidden;
			color: #a4a4a4;
		}
		.divide-bar-item.active {
			color: #3a72ed;
		}
	`;
	
	var thiz;
    Vue.component('scroll-picker', {
		template: '\
			<div class="divide-bar">\
				<div @click="select(\'before\')" v-if="false">\
					<i class="bar-up icon-chevron-up"></i>\
				</div>\
				<div class="divide-bar-stage" id="divide-bar-stage" :style="{ height: stageHeigth + \'px\' }" @click="handleEvent" @touchstart="handleEvent" @touchmove="handleEvent" @touchend="handleEvent">\
					<div class="divide-bar-container" :class="{ easein: !isTouch }" :style="{ height: itemHeight + \'px\', transform: \'rotateX(\' + realRotate + \'deg)\' }">\
						<div class="divide-bar-item" :style="{ transform: \'rotateX(\' + rotateRate * index + \'deg) translateZ(\' + zDistance + \'px)\', height: itemHeight + \'px\', lineHeight: itemHeight + \'px\'}"\
							:class="{\'active\' : item === map, \'first-child\': index === 0 }" v-for="(item, index) in maps"\
							@click="select(index)">\
							{{item.alias}}\
						</div>\
					</div>\
				</div>\
				<div @click="select(\'next\')" v-if="false">\
					<i class="bar-down icon-chevron-down"></i>\
				</div>\
			</div>',
        data: function () {
            return {
				stageHeigth: 140,//滚动高度
				itemHeight: 35,//每个div高度
				rotateRate: 0,//每次旋转角度
				itemNum: 18,//单圈最大容纳数目
				zDistance: 0,//轴距
				realRotate: 0,//实际旋转度数
				lastRotate: 0,
				eachOffset: 0,
				touchStart: 0,
				moveDistance: 0,
				isTouch: false
			};
        },
        props: {
            maps: {
                type: Array,
                default: function () {
					return new Array();
				}
            },
			map: {
				type: Object,
				default: function () {
					return new Object();
				}
			}
        },
		watch: {
			maps: function (val) {
				this.init();
			},
			map: function (val) {
				this.maps.forEach(function (item, index) {
					if (val === item) {
						thiz.select(index);
					}
				});
			}
		},
		beforeMount: function () {
			var styleNode = document.createElement('style');
			styleNode.setAttribute('id', this.$options._componentTag)
			styleNode.innerText = style;
			document.body.appendChild(styleNode);
		},
		mounted: function () {
			thiz = this;
			this.init();
			document.getElementById('divide-bar-stage');
			this.maps.forEach(function (item, index) {
				if (thiz.map === item) {
					thiz.select(index);
				}
			});
		},
		beforeDestroy: function () {
			var styleNode = document.getElementById(this.$options._componentTag);
			document.body.removeChild(styleNode);
		},
		methods: {
			init: function () {
				if (this.maps.length > 18) {
					this.itemNum = this.maps.length;
				}
				this.rotateRate = 360 / this.itemNum;
				this.zDistance = this.itemHeight / (Math.tan(this.rotateRate / 360 * Math.PI) * 2);
				console.log(this.itemHeight, this.rotateRate, this.zDistance);
			},
			select: function (index) {
				if (index > this.maps.length - 1) {
					return;
				}
				
				var r = this.rotateRate * index + this.realRotate;
				var i = r % 360;
				
				if (i >=0 && i<= 180) {
					this.realRotate = this.realRotate - i;
				}	else if (i >=180 && i<= 360) {
					this.realRotate = this.realRotate - i + 360;
				}  if (i <0 && i>= -180) {
					this.realRotate = this.realRotate - i;
				}	else if (i <=-180 && i>= -360) {
					this.realRotate = this.realRotate - i - 360;
				}
				this.$emit('update:map', this.maps[index]);
				console.log('select');
			},
			handleEvent: function (e) {
				//e.preventDefault();
				//console.log(e);
				if (e.type === 'touchstart') {
					this.touchStart = e.touches[0].clientY;
					this.moveDistance = 0;
					this.lastRotate = this.realRotate;
					this.isTouch = true;
				}
				if (e.type === 'touchmove') {
					e.preventDefault();
					this.moveDistance = this.touchStart - e.touches[0].clientY;
					this.eachOffset = this.moveDistance / this.itemHeight * this.rotateRate;
					var rotate = this.lastRotate + this.eachOffset;
					this.realRotate = this.lastRotate + this.eachOffset;
					
					if (this.maps.length  < this.itemNum) {
						if (this.realRotate > this.rotateRate / 2) {
							this.realRotate = this.rotateRate / 2;
						}
						
						if (this.realRotate < -this.rotateRate * (this.maps.length - 1) - this.rotateRate / 2) {
							this.realRotate = -this.rotateRate * (this.maps.length - 1) - this.rotateRate / 2;
						}
					}
				}
				if (e.type === 'touchend') {
					var r = this.realRotate % this.rotateRate;
					var c = this.realRotate / this.rotateRate;
					c = parseInt(c) % this.itemNum;
					var index;
					if (this.realRotate >= 0) {
						if (r > this.rotateRate / 2) {
							this.realRotate = this.realRotate + this.rotateRate - r;//滑动超过一半
							c++;
						} else {
							this.realRotate = this.realRotate - r;
						}
						index =  c % this.itemNum;
					} else {
						if (r + this.rotateRate / 2 < 0) {
							this.realRotate = this.realRotate - this.rotateRate - r;//滑动超过一半
							c--;
						} else {
							this.realRotate = this.realRotate - r;
						}
						index = Math.abs(c) % this.itemNum;
					}
					
					
					
					if (index > this.maps.length) {
						
					}
					
					this.$emit('update:map', this.maps[index]);
					this.isTouch = false;
				}
				//console.log(this.moveDistance);
			}
		}
    });
})();

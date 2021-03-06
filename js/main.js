window.onload = function() {
    //Model层
    //5个地标
    var Positions = [{
        position: new AMap.LngLat(106.674318, 26.619642), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
        title: '贵阳北站'
    }, {
        position: [106.673497, 26.443794],
        title: '贵州大学'
    }, {
        position: [106.751866, 26.546339],
        title: '贵阳市森林公园'
    }, {
        position: [106.802924, 26.536693],
        title: '贵阳龙洞堡国际机场'
    }, {
        position: [106.646981, 26.535541],
        title: '贵阳阿哈湖国家湿地公园'
    }];

    var markerPosition = function(position) {
        //封装地标
        //给观察对象提供地点名
        this.positionName = ko.observable(position.title)
        this.positionDetail = ko.observable(position.position)
        this.marker = ko.observable(new AMap.Marker(position))
    }

    //ViewModel层
    function ViewModel() {
        // 创建地图对象
        var map = new AMap.Map('container', {
            mapStyle: 'amap://styles/whitesmoke', //设置地图的显示样式
            center: [106.693925, 26.532250],
            zoom: 12,
        });
        map.plugin(["AMap.ToolBar"], function() {
            // 添加 工具条
            map.addControl(new AMap.ToolBar());
        });

        let self = this
        // this.positionList = ko.observableArray(Positions);
        // 初始化一个空数组,catList为观察者
        this.positionList = ko.observableArray([]);
        //遍历所有猫，并添加到catList数组，给单个猫各类属性添加计算监控对象
        Positions.forEach(function(item) {
            //向catList观察者数组内添加对象
            self.positionList.push(new markerPosition(item));
        });

        //遍历点标记添加事件
        let positionList = this.positionList()

        //列表点击监听,click对象参数默认为当前模型层对象,当前指的是搜索列表中的一个地点对象
        this.listPositionClick = function(position) {
            //移除其他跳动
            self.removeAnimation();

            let marker = position.marker()
            //跳动当前地点
            marker.setMap(map);
            // 设置点标记的动画效果，此处为弹跳效果
            marker.setAnimation('AMAP_ANIMATION_BOUNCE');

            //添加窗体信息
            self.addInfoWindow(position)
        }

        //搜索关键字添加观察对象
        this.query = ko.observable("")

        this.filterMap = function(list) {
            //使用搜素结果显示地图点标记
            let markerList = []

            list.forEach(function(item) {
                // 取得地标对象内marker
                let marker = item.marker()
                //生成单独的marker数组
                markerList.push(marker)
                //设置点标记的动画效果
                marker.setAnimation('AMAP_ANIMATION_DROP');
                //设置点标记可点击
                marker.setClickable(true);
                //绑定点击事件
                marker.on('click', function() {
                    //移除其他跳动
                    self.removeAnimation();

                    //设置当前标记跳动
                    marker.setAnimation('AMAP_ANIMATION_BOUNCE');

                    //添加窗体信息
                    self.addInfoWindow(item)

                });
            });

            // 使用clearMap方法删除所有覆盖物
            map.clearMap();
            //将指定个地标添加进地图
            map.add(markerList);
        }

        this.filteredPositionList = ko.computed(function() {
            //通过输入关键字过滤地点list
            let filteredPositionList = this.positionList().filter(function(item) {
                let filterState = item.positionName().indexOf(self.query().trim()) != -1
                return filterState;
            })
            //筛选地图点标记
            this.filterMap(filteredPositionList)
            //当无输入时，输入为空，indexOf返回值为0，filteredPositionList为所有地点
            return filteredPositionList
        }, this);


        //移除所有跳动
        this.removeAnimation = function() {
            positionList.forEach(function(item) {
                item.marker().setAnimation('AMAP_ANIMATION_NONE')
            })
        }

        this.addInfoWindow = function(item) {
            //构建自定义信息窗体
            let infoWindow = new AMap.InfoWindow({
                // anchor: 'bottom-center',
                offset: new AMap.Pixel(16, -45), //窗体位置的偏移量
                content: item.positionName()
            });
            // 传入地标经纬度
            infoWindow.open(map, item.positionDetail())
        }
    }

    // Activates knockout.js
    ko.applyBindings(new ViewModel());
};

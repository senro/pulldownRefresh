
(function( window ) {
    function pulldownRefresh(){

        var touchStartPoint;
        var $pulldownRefresh;
        var $pulldownRefreshContainer;

        var $pulldownRefreshPulldownCaption;
        var $pulldownRefreshPulldownCaptionText;
        var $pulldownRefreshPulldownCaptionIconPulldown;
        var $pulldownRefreshPulldownCaptionIconSpinner;

        var $pulldownRefreshPullupCaption;
        var $pulldownRefreshPullupCaptionText;
        var $pulldownRefreshPullupCaptionIconSpinner;

        var touchMoveDistance;
        var triggerPullDown=false;
        var triggerPullUp=false;
        var isPullupFinish=false;

        var defaultOption={
            down:{
                length:'50',
                damping:'1',
                contentdown:'下拉可以刷新',
                contentover:'释放立即刷新',
                contentrefresh:'正在刷新...',
                callback:function () {

                }
            },
            up:{
                length:'50',
                damping:'1',
                contentup:'上拉显示更多',
                contentnomore:'没有更多数据了',
                contentrefresh:'正在加载...',
                callback:function () {

                }
            }
        };
        var mergeOption;

        /*初始化*/
        function init(options) {
            if (options) {
                mergeOption=deepClone(defaultOption,options);

                if(document && document.getElementsByTagName && document.getElementById && document.body) {
                    //dom已经加载完成
                    onDOMReady();
                }else{
                    // 等待dom加载完毕
                    onDocumentReady(onDOMReady);
                }

            }else{
                throwError('请以对象形式传递相关参数！');
            }
        }
        function touchStart(event){
            try {
                event.preventDefault();
                event.stopPropagation();
            } catch (e) {
                // console.log(e);
            }
            //这个代码是为了兼容触摸设备的坐标
            if (!event.clientX) {
                event.clientX = event.clientX || event.touches[0].pageX;
                event.clientY = event.clientY || event.touches[0].pageY;
            }
            touchStartPoint={x:event.clientX,y:event.clientY};

            $pulldownRefreshPulldownCaptionIconPulldown.style.display='inline-block';
            $pulldownRefreshPulldownCaptionIconSpinner.style.display='none';
        }

        var requestAnimationFrameId=null;
        function touchMove(event){
            try {
                event.preventDefault();
                event.stopPropagation();
            } catch (e) {
                // console.log(e);
            }
            if (!event.clientX) {
                event.clientX = event.clientX || event.touches[0].pageX;
                event.clientY = event.clientY || event.touches[0].pageY;
            }

            touchMoveDistance=event.clientY-touchStartPoint.y;

            //console.log(touchMoveDistance);

            if(!requestAnimationFrameId){
                setAnimationFrame();
            }
            //$pulldownRefreshContainer.style.transform='translate(0,'+touchMoveDistance+'px)';

            if(touchMoveDistance>0){
                //下拉
                $pulldownRefreshPulldownCaption.style.display='block';
            }else{
                //上拉

            }

            var iconRotate;

            if(touchMoveDistance>0){
                iconRotate=((touchMoveDistance/mergeOption.down.length)>1?1:(touchMoveDistance/mergeOption.down.length))*180;
            }else{
                iconRotate=0;
            }

            $pulldownRefreshPulldownCaptionIconPulldown.style['-webkit-transform']='rotate('+iconRotate+'deg)';

            //下拉，如果滑动距离大于某个阈值，则将触发pullDown回调标记设置为true，当touchend的时候就触发回调
            if (touchMoveDistance>0 && touchMoveDistance>mergeOption.down.length) {
                triggerPullDown=true;
                $pulldownRefreshPulldownCaptionText.innerHTML=mergeOption.down.contentover;
            }else{
                triggerPullDown=false;
                $pulldownRefreshPulldownCaptionText.innerHTML=mergeOption.down.contentdown;
            }

            //上拉，如果滑动距离大于某个阈值，则将触发pullUp回调标记设置为true，当touchend的时候就触发回调
            if (!isPullupFinish && touchMoveDistance<0 && Math.abs(touchMoveDistance)>mergeOption.up.length) {
                triggerPullUp=true;
            }else{
                triggerPullUp=false;
            }

        }

        function setAnimationFrame() {
            $pulldownRefreshContainer.style.transitionDuration="0ms";
            $pulldownRefreshPullupCaption.style.transitionDuration="0ms";

            if(touchMoveDistance>0){
                //下拉
                $pulldownRefreshContainer.style['-webkit-transform']='translate(0,'+Math.sqrt(touchMoveDistance)*10/mergeOption.down.damping+'px)';
                $pulldownRefreshPullupCaption.style['-webkit-transform']='translate(0,'+Math.sqrt(touchMoveDistance)*10/mergeOption.down.damping+'px)';
            }else{
                //上拉
                $pulldownRefreshContainer.style['-webkit-transform']='translate(0,-'+Math.sqrt(Math.abs(touchMoveDistance))*5/mergeOption.up.damping+'px)';
                $pulldownRefreshPullupCaption.style['-webkit-transform']='translate(0,-'+Math.sqrt(Math.abs(touchMoveDistance))*5/mergeOption.up.damping+'px)';
            }

            requestAnimationFrameId=window.requestAnimationFrame(setAnimationFrame);
        }

        function touchEnd(e){
            console.log('touchend');

            //reset
            touchMoveDistance=$pulldownRefreshPulldownCaption.offsetHeight;
            $pulldownRefreshContainer.style.transitionDuration="1s";
            $pulldownRefreshContainer.style['-webkit-transform']='translate(0,'+touchMoveDistance+'px)';

            $pulldownRefreshPulldownCaptionIconPulldown.style['-webkit-transform']='rotate(0deg)';

            $pulldownRefreshPullupCaption.style.transitionDuration="1s";
            $pulldownRefreshPullupCaption.style['-webkit-transform']='translate(0,'+touchMoveDistance+'px)';

            window.cancelAnimationFrame(requestAnimationFrameId);
            requestAnimationFrameId = null;

            //下拉
            if(triggerPullDown){
                //改变pulldown caption 为正在刷新
                $pulldownRefreshPulldownCaptionIconPulldown.style.display='none';
                $pulldownRefreshPulldownCaptionIconSpinner.style.display='inline-block';

                $pulldownRefreshPulldownCaptionText.innerHTML=mergeOption.down.contentrefresh;
                mergeOption.down && mergeOption.down.callback && mergeOption.down.callback();
                triggerPullDown=false;
            }else{
                $pulldownRefreshPulldownCaption.style.display='none';
            }

            //上拉
            if(triggerPullUp){
                //改变pullup caption 为正在加载
                $pulldownRefreshPullupCaptionIconSpinner.style.display='inline-block';

                $pulldownRefreshPullupCaptionText.innerHTML=mergeOption.up.contentrefresh;
                mergeOption.up && mergeOption.up.callback && mergeOption.up.callback();
                triggerPullUp=false;
            }
        }
        function endPulldownToRefresh(){
            touchMoveDistance=0;
            $pulldownRefreshContainer.style.transitionDuration="1s";
            $pulldownRefreshContainer.style['-webkit-transform']='translate(0,'+touchMoveDistance+'px)';
            $pulldownRefreshPullupCaption.style['-webkit-transform']='translate(0,'+touchMoveDistance+'px)';

            setTimeout(function () {
                $pulldownRefreshPulldownCaption.style.display='none';
            },500);
        }
        function endPullupToRefresh(finished){
            if(finished){
                isPullupFinish=true;
                $pulldownRefreshPullupCaptionIconSpinner.style.display='none';
                $pulldownRefreshPullupCaptionText.innerHTML=mergeOption.up.contentnomore;
            }else{
                $pulldownRefreshPullupCaptionIconSpinner.style.display='none';
                $pulldownRefreshPullupCaptionText.innerHTML=mergeOption.up.contentup;
            }
        }
        function refresh() {
            isPullupFinish=false;
            $pulldownRefreshPullupCaptionText.innerHTML=mergeOption.up.contentup;
            $pulldownRefreshPullupCaptionIconSpinner.style.display='none';

            setTimeout(function () {
                $pulldownRefreshPullupCaption.style.display='block';
            },500);
        }
        function showPullupCaption(){
            $pulldownRefreshPullupCaption.style.display='block';
        }
        function hidePullupCaption(){
            isPullupFinish=true;
            $pulldownRefreshPullupCaption.style.display='none';
        }
        function initEvents(){
            addEvent(document, "touchstart", touchStart);
            addEvent(document, "touchmove", touchMove);
            addEvent(document, "touchend", touchEnd);
        }

        function onDOMReady() {
            $pulldownRefresh=$('#pulldownRefresh');
            $pulldownRefreshContainer=$('#pulldownRefresh-container');

            $pulldownRefreshPulldownCaption=$('#pulldownRefresh-pulldown-caption');
            $pulldownRefreshPulldownCaptionText=$('#pulldownRefresh-pulldown-caption-text');
            $pulldownRefreshPulldownCaptionIconPulldown=$('#pulldownRefresh-pulldown-caption-icon-pulldown');
            $pulldownRefreshPulldownCaptionIconSpinner=$('#pulldownRefresh-pulldown-caption-icon-spinner');

            $pulldownRefreshPullupCaption=$('#pulldownRefresh-pullup-caption');
            $pulldownRefreshPullupCaptionText=$('#pulldownRefresh-pullup-caption-text');
            $pulldownRefreshPullupCaptionIconSpinner=$('#pulldownRefresh-pullup-caption-icon-spinner');

            $pulldownRefreshPulldownCaptionText.innerHTML=mergeOption.down.contentdown;
            $pulldownRefreshPullupCaptionText.innerHTML=mergeOption.up.contentup;


            //准备工作已完成
            initEvents();

            //清除document的关于onDOMReady的onreadystatechange、DOMContentLoaded事件
            offDocumentReady(onDOMReady);

        }

        /*统一抛出异常方法*/
        function throwError(message, url) {
            throw new Error(
                'Hue Web SDK error: ' + message +
                (url ? ('\n' + 'See ' + url + ' for more information') : '')
            );
        }
        /*
         * 绑定事件有兼容性问题，故做兼容性封装，on，off函数，方便绑定、删除事件
         * 在现代浏览器中，使用
         * target.addEventListener(type, listener, useCapture);
         * target： 文档节点、document、window 或 XMLHttpRequest。
         * type： 字符串，事件名称，不含“on”，比如“click”、“mouseover”、“keydown”等。
         * listener ：实现了 EventListener 接口或者是 JavaScript 中的函数。
         * useCapture ：是否使用捕捉，一般用 false 表示在冒泡阶段调用事件处理程序，true，表示在捕获阶段调用事件处理。
         * 例如：document.getElementById("testText").addEventListener("keydown", function (event) { alert(event.keyCode); }, false);
         *
         * 在IE中，使用
         * target.attachEvent(type, listener);
         * target： 文档节点、document、window 或 XMLHttpRequest。
         * type： 字符串，事件名称，含“on”，比如“onclick”、“onmouseover”、“onkeydown”等。
         * listener ：实现了 EventListener 接口或者是 JavaScript 中的函数。
         * 例如：document.getElementById("txt").attachEvent("onclick",function(event){alert(event.keyCode);});
         *
         * 注意：
         * 在删除某个target的事件的时候，removeEventListener、detachEvent，接收的参数必须和addEventListener，attachEvent的参数一致
         * 并且不能用匿名函数，不然两次参数肯定不一样，就会导致不能正常删除事件
         * */
        function on(context, event, fallbackEvent, callback) {
            if ('addEventListener' in window) {
                context.addEventListener(event, callback, false);
            } else {
                context.attachEvent(fallbackEvent, callback);
            }
        }

        function off(context, event, fallbackEvent, callback) {
            if ('removeEventListener' in window) {
                context.removeEventListener(event, callback, false);
            } else {
                context.detachEvent(fallbackEvent, callback);
            }
        }

        //添加事件 封装IE和Webkit内核的不同
        function addEvent(obj, type, handle) {
            try {
                obj.addEventListener(type, handle, false);
            } catch (e) {
                try {
                    obj.attachEvent("on" + type, handle);

                } catch (e) {
                    try {
                        obj["on" + type] = handle;
                    } catch (e) {
                        // console.log(e);
                    }
                }
            }
        }

        function removeEvent(obj, type, handle) {
            try {
                obj.removeEventListener(type, handle, false);
            } catch (e) {
                // console.log(e);
                try {
                    obj.detachEvent("on" + type, handle);

                } catch (e) {
                    try {
                        obj["on" + type] = null;
                    } catch (e) {
                        // console.log(e);
                    }
                }
            }
        }

        /*给document，绑定dom加载完成事件，自定义回调函数*/
        function onDocumentReady(callback) {
            on(document, 'DOMContentLoaded', 'onreadystatechange', callback);
        }
        /*给document，删除dom加载完成事件，自定义回调函数*/
        function offDocumentReady(callback) {
            off(document, 'DOMContentLoaded', 'onreadystatechange', callback);
        }

        function $(selector){
            var result;

            if(/\#/g.test(selector)){
                result=document.getElementById(selector.split('#')[1]);
            }else{
                result=document.getElementsByClassName(selector.split('.')[1]);
            }

            return result;
        }

        function deepClone(obj,targetObj){
            //把targetObj引用赋值给obj
            for(var key in obj){
                if(isObject(targetObj[key])){
                    obj[key] = deepClone(obj[key],targetObj[key]);
                }else if(targetObj[key]){
                    obj[key] = targetObj[key];
                }else{
                    obj[key] = obj[key];
                }
                if(isArray(obj[key])){
                    obj[key]=[];
                    obj[key]=obj[key].concat(targetObj[key]);
                }
            }
            return obj;
        }
        function isArray(v){
            return toString.apply(v) === '[object Array]';
        }
        function isObject(v){
            if(typeof v == 'object'){
                if(!isArray(v)){
                    return true;
                }
            }
            return false;
        }

        return {
            init:init,
            endPulldownToRefresh:endPulldownToRefresh,
            endPullupToRefresh:endPullupToRefresh,
            showPullupCaption:showPullupCaption,
            refresh:refresh,
            hidePullupCaption:hidePullupCaption
        };
    }

    // EXPOSE
    if ( typeof define === "function" && define.amd ) {
        //for amd
        define(function() { return pulldownRefresh(); });
    } else if ( typeof module !== "undefined" && module.exports ) {
        //for commonjs
        module.exports = pulldownRefresh();
    } else {
        //for global
        window.pulldownRefresh = pulldownRefresh();
    }


})( window );

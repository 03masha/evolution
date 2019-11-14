(function(){

    function sleep (time){
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function getTime(){
        return Math.floor(Date.now() / 1000);
    }


    var interval = null;
    var canvas;
    var c;
    var container;

    function start(){
        var MAX_CIRCLES = 500;
        var MAX_TIME_LIVE = 80;
        var MAX_CHILD_COUNT = 4;
        var circles = [];
        var killedCnt = 0;
        var createdCnt = 0;
        var startedAt = getTime();
        var currentGeneration = 1;

        var initCnt = document.getElementById("initCnt").value;
console.log('initCnt', initCnt);


        function createRandomCircles(count){
            for(var i=0; i<count; i++) {
                circles.push({
                    id: getLastId() + 1,
                    x: getRandomInt(10, 700),
                    y: getRandomInt(10, 700),
                    r: getRandomInt(3, 10),
                    color: 20,
                    vx: getRandomInt(-10, 10),
                    vy: getRandomInt(-10, 10),
                    maxChildCount: getRandomInt(0, MAX_CHILD_COUNT),
                    childCount: 0,
                    generation: 1,
                    bornAt: getTime(),
                    dieAt: getTime() + getRandomInt(1, MAX_TIME_LIVE),
                });
                createdCnt ++;
            }
        }

        createRandomCircles(initCnt);

//         var circles = [{id:1, x:400,y:400,r:10,color:20,vx:2,vy:1, childCount:0 },
//             {id:2, x:100,y:100,r:10,color:20,vx:5,vy:-1, childCount:0},
//             {id:3, x:800,y:350,r:10,color:20,vx:20,vy:-20, childCount:0},
//             {x:800,y:700,r:75,color:325,vx:13,vy:-8},
//             {x:400,y:500,r:120,color:175,vx:-4,vy:-6}
//         ];

        function getLastId(){
            if (!circles.length) {
                return 0;
            }
            return circles[circles.length-1].id;
        }

        function createChildCircle(parent){
            if (circles.length > MAX_CIRCLES) {
//                console.log('Нельзя создавать более 100 элементов.');
                return false;
            }
            if (parent.lastChildAt && getTime() - parent.lastChildAt < 5) {
//                console.log('В течении 5 сек. родитель не может создавать потомка.');
                return false;
            }

            circles.push({
                id: getLastId() + 1,
                x: getRandomInt(10, 700),
                y: getRandomInt(10, 700),
                r: getRandomInt(3, 10),
                color: parent.color + 10 > 360 ? 0 : parent.color + 10,
                vx: getRandomInt(-10, 10),
                vy: getRandomInt(-10, 10),
                maxChildCount: getRandomInt(0, MAX_CHILD_COUNT),
                childCount: 0,
                generation: parent.generation + 1,
                bornAt: getTime(),
                dieAt: getTime() + getRandomInt(5, MAX_TIME_LIVE),
            });
            createdCnt ++;
            if (currentGeneration < parent.generation + 1) {
                currentGeneration = parent.generation + 1;
            }

            return circles[circles.length - 1];
        }

        function checkIntersection(circle){
            for(var i=0; i<circles.length; i++){
                var c = circles[i];
                if (circle.id != c.id){
                    var distance = Math.pow(c.x - circle.x, 2) + Math.pow(c.y - circle.y, 2);
                    if (Math.pow(c.r - circle.r, 2) <= distance && distance <= Math.pow(c.r + circle.r, 2)) {
                        return c;
                        // console.log('distance', distance);
                        // console.log('circle1', circle);
                        // console.log('circle2', c);
                    }
                }
            }
            return false;
        }


        function canCreateChild(circle) {
            var age = getTime() - circle.bornAt;
            if (circle.maxChildCount >= circle.childCount && age >= 18 && age <= 50) {
                return true;
            }
            return false;
        }

        function draw(){
            refreshCanvas();
            //c.clearRect(container.x,container.y,container.width,container.height);
            //c.strokeRect(container.x,container.y,container.width,container.height);

            for(var i=0; i <circles.length; i++){
                c.fillStyle = 'hsl(' + circles[i].color + ',100%,50%)';
                c.beginPath();
                c.arc(circles[i].x,circles[i].y,circles[i].r,0,2*Math.PI,false);
                c.fill();

                if((circles[i].x + circles[i].vx + circles[i].r > container.x + container.width) || (circles[i].x - circles[i].r + circles[i].vx < container.x)){
                    circles[i].vx = - circles[i].vx;
                }
                if((circles[i].y + circles[i].vy + circles[i].r > container.y + container.height) || (circles[i].y - circles[i].r + circles[i].vy < container.y)){
                    circles[i].vy = - circles[i].vy;
                }
                circles[i].x +=circles[i].vx;
                circles[i].y +=circles[i].vy;

                var partner = checkIntersection(circles[i]);
                if (partner && canCreateChild(partner) && canCreateChild(circles[i])) {
                    if (createChildCircle(circles[i])) {
                        partner.childCount ++;
                        partner.lastChildAt = getTime();
                        circles[i].lastChildAt = getTime();
                        circles[i].childCount ++;
                    }
                }
            }


            sleep(0).then(() => {
                requestAnimationFrame(draw);
            });

        }

        function killCircles() {
            for(var i=0; i <circles.length; i++){
                if (getTime() >= circles[i].dieAt) {
                    circles.splice(i, 1);
                    killedCnt ++;
                }
            }
        }

        interval = setInterval(function(){
            killCircles();
            document.getElementById("figCount").innerHTML = circles.length;
            document.getElementById("createdCount").innerHTML = createdCnt;
            document.getElementById("killedCount").innerHTML = killedCnt;
            document.getElementById("genCount").innerHTML = currentGeneration;
            document.getElementById("liveCount").innerHTML = getTime() - startedAt;
            if (!circles.length) {
                clearInterval(interval);
            }
        }, 1000);

        requestAnimationFrame(draw);


    }

    function refreshCanvas(){
        c.fillStyle = 'black';
        c.strokeStyle = 'black';
        c.fillRect(container.x,container.y,container.width,container.height);
    }

    function init(){
        console.log('init');
        canvas = document.getElementsByTagName('canvas')[0];
        c = canvas.getContext('2d');
        container = {x:0,y:0,width:1200,height:800};
        refreshCanvas();


        document.getElementById("btnStart").onclick = function(){
            if (interval) {
                clearInterval(interval);
            }
            document.getElementById("figCount").innerHTML = null;
            start();
        };
    }


    //invoke function init once document is fully loaded
    window.addEventListener('load', init, false);

}());  //self invoking function
